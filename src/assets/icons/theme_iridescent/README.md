# Handoff: Iridescent Icon Set v1 — Spunk's Bettabase

## Overview
A 16-glyph monoline icon set for the Bettabase betta-tank tracker PWA. It replaces
the three ad-hoc glyphs currently hardcoded in `src/components/Icon.tsx`
(`chevronLeft`, `trash`, `kebab`) with a consistent, optically-sized family
covering navigation, tank/water domain concepts, and system messaging.

## About the Design Files
The `.dc.html` files in this bundle are **design references authored in HTML** —
prototypes showing the intended shapes and rendering, not production code to copy
wholesale. The deliverable you should actually integrate is `Icon.tsx`, which is
already written against this repo's existing React + TypeScript conventions and
mirrors the API of the current `src/components/Icon.tsx`. Recreate anything else
you need using the codebase's established patterns.

## Fidelity
**High-fidelity.** Path geometry, stroke weights, and accent radii are final and
should be reproduced exactly. Colors are inherited (`currentColor`), so the icons
pick up whatever the Iridescent tokens set on the surrounding text.

## What's in this bundle
| File | What it is |
| --- | --- |
| `Icon.tsx` | Drop-in replacement for `src/components/Icon.tsx`. All 16 glyphs inline, no dependencies. |
| `Iridescent Icon Set v1.dc.html` | The 16-glyph reference sheet at 24px on mist pills. |
| `Icon Set 1a v1.dc.html` | Earlier exploration — the four seed glyphs and the optical-sizing study. |

## Integration
Replace `src/components/Icon.tsx` with the bundled `Icon.tsx`. The public API is
compatible with the existing component except for the icon-name vocabulary:

```tsx
<Icon name="thermometer" size={20} />
<Icon name="trash" size={18} title="Delete reading" />
```

- `name`: one of the 16 names below (camelCase).
- `size`: rendered px. Any number is accepted; stroke weight snaps to the nearest tier.
- `color`: defaults to `currentColor`. Prefer setting text color on the parent.
- `title`: sets `role="img"` + `aria-label`. Omit for decorative icons — the svg
  then renders `aria-hidden="true"`, matching the current component's behavior.

### Call sites to migrate
The three existing names map as follows:
- `trash` → `trash` (new geometry, same name)
- `chevronLeft` → **not in this set.** Keep the existing path for now, or ask design
  for a chevron drawn to these rules before removing it.
- `kebab` → **not in this set.** Same caveat.

Do not delete the old `PATHS` entries until those two are replaced; `Icon.tsx` here
covers only the 16 glyphs listed.

## The icon set
Domain: `fish`, `bubbles`, `fishBowl`, `wave`, `thermometer`, `beaker`, `beakerPlus`
System: `hamburger`, `settings`, `calendar`, `user`, `trash`, `envelope`, `bell`
Messaging: `alert`, `warning`

## Design rules (why the code looks the way it does)
Every glyph is authored on a **24×24 grid** with `viewBox="0 0 24 24"`, `fill="none"`,
`stroke="currentColor"`, `stroke-linecap="round"`, and `stroke-linejoin="round"` on
any path with a corner.

**Optical sizing — stroke weight does not scale with the icon:**

| Size tier | Stroke width |
| --- | --- |
| 32 | 1.6 |
| 24 | 1.6 |
| 20 | 1.8 |
| 18 | 2.0 |

Two deliberate exceptions:
- The thermometer's center mercury line is **1.3** at every tier, so it stays
  distinguishable from the 1.6 body outline.
- Solid accents are filled, not stroked, at fixed radii: fish eye **r1.0**,
  bubble highlight **r0.9**, thermometer bulb **r2.0**. These are the only filled
  shapes in the set; every other counter stays open.

**At 18px, detail is removed rather than thinned.** Four glyphs carry a simplified
`sm` geometry that the component swaps in automatically at the 18 tier:
- `settings` — the toothed cog outline closes up, so it becomes a ring plus eight
  radial ticks with real gaps.
- `beakerPlus` — the plus fused into the beaker neck; the fill line is dropped and
  the plus moves clear to the upper right.
- `trash` — the lid handle's counter fills in, so the handle is dropped.
- `bell` — the clapper arc turns into a blob, so it is dropped.

The other twelve use one geometry at all four tiers.

## Colors
Icons never set their own color. These are the values the reference sheet renders
against, from the Iridescent tokens:

| Token | Hex | Use |
| --- | --- | --- |
| Ink | `#293132` | Icon stroke (inherited via `currentColor`) |
| Mist | `#eeeef8` | Pill background behind an icon |
| Page | `#fbfbfe` | Surrounding canvas |
| Border | `#e6e6f2` | Card hairline |
| Muted | `#66697f` | Icon labels / secondary text |
| Teal | `#14b8c4` | Accent, links |
| Magenta | `#d63a8f` | Hover accent |

Icon pills in the reference sheet are 44×44, `border-radius: 999px` — that 44px
figure is the minimum touch target and should be preserved on tappable icons in
the PWA regardless of the glyph size inside it.

## Interactions & Behavior
The component is presentational and stateless. It has no hover, focus, or animation
of its own — those belong to the button or link wrapping it. When an icon is the
only content of an interactive element, give that element the accessible name (or
pass `title`); do not rely on the glyph alone.

## Not yet covered
- `chevronLeft` and `kebab` equivalents (see migration note above).
- Raw `.svg` files. If you need standalone assets for the PWA manifest, favicon, or
  a sprite, they can be generated from the same geometry — ask and they'll be added.
- A filled/duotone variant. The set is monoline only.
