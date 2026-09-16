#!/usr/bin/env node
// Repo-local post-processing layered ON TOP of the normal design-sync build
// output (--out, default ds-bundle/). Does NOT touch the converter itself
// (.ds-sync/, which is gitignored/machine-local per NOTES.md) — operates
// purely on the output directory, so it's safe to commit and re-run on any
// machine after a normal `node .ds-sync/package-build.mjs ...` pass, right
// before uploading.
//
// Usage (after the normal build step, before upload):
//   node .design-sync/postprocess.mjs --out ds-bundle
//
// Fixes two issues Claude Design's own project-health check flagged in the
// uploaded "Betta Tank Tracker — Design System" project (2026-09-15):
//
// 1. fonts/fonts.css duplication: the converter's font extraction scrapes
//    @font-face rules from BOTH the compiled dist/assets/index-*.css
//    (cfg.cssEntry) AND cfg.extraFonts. cssEntry's rules point at Vite's
//    hashed dist/assets/*.woff2 paths, which never resolve under the
//    converter's containment roots — it ships them anyway with their
//    original, dangling url()s, right next to the REAL, working rule
//    cfg.extraFonts provides for the exact same family (see
//    .design-sync/NOTES.md "CSS" section for the full history). Drop any
//    @font-face block whose url()s don't resolve to a file actually present
//    in fonts/.
//
// 2. Unclassified design tokens: claude.ai/design's Design System pane
//    classifies each CSS custom property it finds as color/spacing/
//    typography/other, inferred from the value shape. Function-valued
//    tokens (gradients, easing curves) and Tailwind v4's own generated
//    custom properties (--tw-*, --default-transition-*) don't infer
//    cleanly — the app reads a literal `/* @kind <word> */` comment
//    immediately preceding a declaration as an override. Inject one before
//    every declaration of every property Claude Design flagged as
//    unclassified (the four hand-authored ones by exact name; --tw-*/
//    --default-transition-* by prefix, since Tailwind v4 declares dozens of
//    those across individual utility rules, not just once at :root).

import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { basename, join } from 'node:path';

const argv = process.argv.slice(2);
function flag(name, dflt) {
  const i = argv.indexOf(`--${name}`);
  return i < 0 ? dflt : argv[i + 1];
}
const OUT = flag('out', 'ds-bundle');

// -- 1. font-face dedup -------------------------------------------------
const fontsCssPath = join(OUT, 'fonts', 'fonts.css');
if (existsSync(fontsCssPath)) {
  const css = readFileSync(fontsCssPath, 'utf8');
  const blocks = css.match(/@font-face\s*\{[^}]*\}/g) ?? [];
  let dropped = 0;
  // First pass: drop blocks with zero resolving url() (fully dead - no data:
  // URI, no local file, nothing but an unreachable hashed dist/assets/ path).
  const resolvable = blocks.filter((block) => {
    const urls = [...block.matchAll(/url\(\s*['"]?([^'")]+)['"]?\s*\)/gi)].map((m) => m[1]);
    const resolves = urls.some((u) => {
      if (/^(?:https?:|data:)/.test(u)) return true; // CDN/inline - always fine
      const name = basename(u.split(/[?#]/)[0]);
      return existsSync(join(OUT, 'fonts', name));
    });
    if (!resolves) dropped++;
    return resolves;
  });
  // Second pass: some cssEntry-scraped blocks survive pass one because their
  // PRIMARY src is a working base64 data: URI even though a secondary
  // fallback format still points at a dead dist/assets/ path - functional,
  // but still a true duplicate of the clean local-file block cfg.extraFonts
  // provides for the same family/weight/unicode-range. Group by that key and
  // keep only the block whose src()s are all local (no /assets/, no data:);
  // if a group has no clean block, keep its first (still-functional) one.
  const keyOf = (block) => {
    const family = block.match(/font-family\s*:\s*['"]?([^;'"}]+)['"]?/)?.[1]?.trim().toLowerCase();
    const weight = block.match(/font-weight\s*:\s*([^;]+);/)?.[1]?.trim();
    const range = block.match(/unicode-range\s*:\s*([^;}]+)/)?.[1]?.trim();
    return `${family}|${weight}|${range}`;
  };
  const isClean = (block) => ![...block.matchAll(/url\(\s*['"]?([^'")]+)['"]?\s*\)/gi)]
    .some((m) => /^(?:data:)/.test(m[1]) || /\/assets\//.test(m[1]));
  const groups = new Map();
  for (const block of resolvable) {
    const k = keyOf(block);
    if (!groups.has(k)) groups.set(k, []);
    groups.get(k).push(block);
  }
  const kept = [];
  for (const [, group] of groups) {
    if (group.length === 1) { kept.push(group[0]); continue; }
    const clean = group.filter(isClean);
    if (clean.length) {
      kept.push(...clean);
      dropped += group.length - clean.length;
    } else {
      kept.push(group[0]);
      dropped += group.length - 1;
    }
  }
  if (dropped) {
    writeFileSync(fontsCssPath, kept.join('\n') + '\n');
    console.error(`postprocess: dropped ${dropped} dangling @font-face block(s) from fonts/fonts.css (${blocks.length} -> ${kept.length})`);
  } else {
    console.error(`postprocess: fonts/fonts.css already clean (${blocks.length} block(s), none dangling)`);
  }
} else {
  console.error(`postprocess: ${fontsCssPath} not found — skipped font dedup`);
}

// -- 2. token @kind annotations ------------------------------------------
const bundleCssPath = join(OUT, '_ds_bundle.css');
if (existsSync(bundleCssPath)) {
  const EXACT_KINDS = {
    '--gradient-cta-track': 'color',
    '--gradient-avatar-ring': 'color',
    '--gradient-hero-wash': 'color',
    '--ease-out': 'other',
  };
  const PREFIX_KINDS = [
    ['--tw-', 'other'],
    ['--default-transition-', 'other'],
  ];
  let css = readFileSync(bundleCssPath, 'utf8');
  let annotated = 0;
  const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const annotate = (name, kind) => {
    const re = new RegExp(`([{;])(\\s*)(${esc(name)})(\\s*:)`, 'g');
    css = css.replace(re, (m, pre, ws, prop, colon) => {
      annotated++;
      return `${pre}${ws}/* @kind ${kind} */${prop}${colon}`;
    });
  };
  for (const [name, kind] of Object.entries(EXACT_KINDS)) annotate(name, kind);
  for (const [prefix, kind] of PREFIX_KINDS) {
    const declRe = new RegExp(`[{;]\\s*(${esc(prefix)}[a-zA-Z0-9-]+)\\s*:`, 'g');
    const names = new Set([...css.matchAll(declRe)].map((m) => m[1]));
    for (const name of names) annotate(name, kind);
  }
  if (annotated) {
    writeFileSync(bundleCssPath, css);
    console.error(`postprocess: annotated ${annotated} token declaration(s) with /* @kind */ in _ds_bundle.css`);
  } else {
    console.error('postprocess: no matching unclassified tokens found in _ds_bundle.css');
  }
} else {
  console.error(`postprocess: ${bundleCssPath} not found — skipped token annotation`);
}
