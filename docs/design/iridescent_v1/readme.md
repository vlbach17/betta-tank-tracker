# Spunk's Bettabase — Iridescent design system

Design system for **Spunk's Bettabase**, a single-user water-parameter log for one betta aquarium. The owner logs test results from their phone (installed PWA), sees at a glance whether each parameter is in range, and reviews trends. Seven parameters: pH, Ammonia, Nitrite, Nitrate, KH, GH, Temperature.

The brand is named after and colored by Spunk, a blue/teal betta with violet-to-magenta fin edges and a pearl head. Direction chosen: **1b Iridescent** — bold, vivid, light-only, calm enough to read chemistry off of at 7 AM.

## Sources
- Local codebase `my fish tracker/` (Vite + React + Tailwind v4 + Supabase + Recharts). Screens in `src/components/`, tokens in `src/index.css`.
- Spunk's photo: `assets/spunk.png` (user upload).
- Exploration: `Spunk Design Systems.dc.html` (turn 1: options 1a/1b/1c + recreation of the current app).
- Legacy app icon: `assets/favicon.svg` (from the codebase's `public/`). No brand logo exists; the wordmark is plain type.

## Content fundamentals
- Voice: plain, friendly, second person. "Log a test", "No readings yet", "Couldn't load your tank data".
- Sentence case everywhere, including buttons and pills ("In range", "Out of range", "Log a test").
- Numbers carry their unit as a quiet mono suffix: `22 ppm`, `79°`. Ideal ranges read `6.5–7.5` with an en dash; `ideal 0` when min = max.
- Relative time is terse on tiles showing time since for less than 24hrs (`2h`, `Sep 5`) and full in lists (`Sep 5 · 7:02 AM`).
- Errors are one sentence, start with "Couldn't", name the thing.
- No emoji. Spunk is referenced by name ("Spunk's Bettabase"), never "your fish".

## Visual foundations
- **Color.** Pearl app background (`#FBFBFE`), white surfaces, ink (`#293132`), tertiary text `#66697F` (the lightest ink that clears 4.5:1 on pearl; on `--bg-surface-muted` step up to `--text-secondary`). Four Spunk hues: teal, royal, violet, magenta. Teal is the lead accent; magenta doubles as accent.
- **The gradient rule.** The primary button shows only teal→royal at rest and slides to violet→magenta on hover (`--gradient-cta-track` at 200% width, panned by `background-position` over 420ms) — whichever the screen leads with. Never on text, never on two elements at once. A very light wash (`--gradient-spunk-wash`) may back one hero card.
- **Type.** DynaPuff 400 (`--font-name`) sets the word "Spunk's" in the wordmark and every child-page title (`--text-page-title`, 24/28, always lowercase): "log a test", "overview", "settings", and the parameter name on history. The dashboard wordmark is the one exception — "bettabase" stays Plus Jakarta 800, lowercase, −0.05em. Plus Jakarta Sans in 500–800 only (no regular weight for UI). The scale is built on a 14px body baseline: body 14/1.5, heading 16/1.25 (a step above body, never below), captions 12, labels 14, titles 24. Fira Code for every number, unit, range and timestamp, tabular. Titles 800 with −0.02em tracking.
- **Shape.** Tiles 20px, hero cards 24px, list rows 16px, inputs 14px, everything else a full pill. Nothing square.
- **Cards.** White, 1px `--line` border, `--shadow-tile` (barely there). Overdue tiles go mist-grey with a dashed border and grey text — the only tile state that changes the surface.
- **Status.** Solid fills, never tinted. In-range pills are lime (`--status-good-fill` #CDFB89) and always take `--text-primary` via `--status-good-fg`; (`--status-bad-fill` #B8256F) with white; amber keeps ink text. Dots, chart points and ideal bands use the deeper lime sibling `--good` (#6DA82E) and `--bad`, which hold up on white where the lime would disappear. Overdue is a light grey pill.
- **Layout.** Mobile-first, 390–448px column, 20px gutters. Dashboard is a 2-column tile grid; the single most urgent parameter (out of range, else watch, else overdue) spans both columns at the top. The primary action lives in a fixed bottom bar.
- **Controls.** Ranges are always collected with **RangeField** — two 84px mono inputs and a two-thumb slider with a royal-blue filled span; never two loose number inputs. Pill nav chips (ink = selected, mist = idle). Segmented range toggle is a mist track with a white raised thumb.
- **Elevation.** Two shadows only: tile shadow and a colored CTA glow (`--shadow-cta`).
- **Motion.** 200ms ease-out for state changes; CTA and tiles scale to 0.98 on press. 
- **Hover/press.** Hover darkens surfaces 3% (mist → line); press = scale 0.98 + opacity 0.9.
- **Imagery.** Only Spunk's photo, cropped to a circle in the header with the gradient ring. 
- **Charts.** Line = gradient stroke 3.5px round caps; dots 5px filled with status color, white 2px stroke; ideal band = green at 12% with 8px radius. No axes lines; mono tick labels.

## Iconography - In progress
Custom icon fonts supported by npm package.

## Index
- `styles.css` → `tokens/fonts.css`, `tokens/colors.css`, `tokens/typography.css`, `tokens/shape.css`
- `guidelines/style-guide.html` — the full style guide for designers and developers (read this first)
- `guidelines/` — foundation specimen cards (Colors, Type, Shape, Brand)
- `components/core/` — Button, IconButton, Input, RangeField, StatusPill, StatusDot, RangeToggle, NavChips, BackLink, Avatar, ParameterTile, Sparkline, Icon
- `ui_kits/bettabase/` — Dashboard, LogTest, ParameterHistory, Overview, Settings + click-through `index.html`
- `assets/` — spunk.png, favicon.svg (legacy)
- `SKILL.md` — agent skill entry point
