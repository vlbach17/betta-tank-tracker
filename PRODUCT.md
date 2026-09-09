# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

A single user — the owner of one Betta tank ("Spunk's") — who tests the water with strip/liquid kits and logs results, almost always from her iPhone standing at the tank. She built the app herself and is also its only user; there is no login screen and no multi-user scope. She checks daily to weekly depending on the parameter (temperature far more often than chemistry).

## Product Purpose

Log water test results as they happen, see at a glance whether each is in range, and look back at trends over time to judge overall tank health. It exists to replace an ad hoc handwritten log with something that answers "is my tank okay right now" and "how has it been trending" in a few seconds each.

## Positioning

The one deliberate mechanism a generic tracker template would not have: a reading is logged one parameter at a time, never as a forced full panel. Blank fields are skipped, not saved as zero — she can log just temperature on a Tuesday and a full chemistry panel on Sunday, and the data model treats those the same way. Built and tuned for one specific tank and one specific person's real usage pattern, not a general-purpose aquarium app.

## Operating Context

- Used almost exclusively on an iPhone, installed to the home screen as a PWA (`display: standalone`), including moments with a poor connection at the tank.
- Built on a laptop, used on a phone — desktop is a build/admin environment, not a target usage surface.
- A "test" is a real physical event: dipping a strip or running a liquid kit, then keying in whatever numbers were read off it, sometimes immediately, sometimes with a note like "day after water change."
- Temperature is logged far more often (sometimes daily) than the chemistry parameters (strip tests, more like every 1-2 weeks), and is tracked against a shorter 3-day overdue threshold versus 14 days for everything else.

## Capabilities and Constraints

- One Betta tank, single user, no auth screen, no sharing/multi-user access (explicitly out of scope for v1).
- Stack: Vite + React + TypeScript, Tailwind, Supabase (free tier), Recharts, deployed to Cloudflare Pages. (Existing codebase; not a decision this file governs.)
- Data model: `parameters` (reference rows: name, unit, ideal min/max, sort order, active flag) and `readings` (one row per single test: parameter, value, tested_at, optional note, indexed on parameter + tested_at desc). Readings saved together in one "Log a test" submission share the same `tested_at` and `note` but are still independent rows — there is no explicit "session" or "entry" table; an entry is a group of readings sharing a timestamp.
- Status is computed, not stored: in range / watch (within 10% outside the ideal band) / out of range, or unknown when no ideal range is set. A parameter is "overdue" when its latest reading is older than its threshold (3 days for temperature, 14 days for everything else).
- Values allow decimals everywhere. Temperature is stored in °F; a Settings toggle converts for display only, without touching stored data. Hardness (KH/GH) has an analogous dGH/dKH display toggle over stored values.
- Out of scope for v1: multiple tanks, photo import of handwritten logs (planned v2, see spec), storing/gallerying tank photos, push notifications, water-change/feeding logs, sharing or multi-user access.

## Brand Commitments

- Product name: "Spunk's Bettabase" (the tank's Betta is named Spunk). Copy voice is plain, warm, and lowercase-leaning in headings ("log a test," "bettabase") rather than corporate-toned.
- Visual identity: the "Iridescent" system — ink (`#293132`) on page/mist (`#fbfbfe` / `#eeeef8`) neutrals, with teal (`#14b8c4`) as the primary accent/link color and magenta (`#d63a8f`) as a hover/secondary accent. A custom 16-glyph monoline icon set (`src/assets/icons/theme_iridescent`) is integrated as the icon vocabulary going forward, including a `calendar` glyph already reserved in the app's own icon-usage notes for a planned History nav destination.
- A recent internal design critique (`.impeccable/critique/2026-09-08T02-55-08Z__all-app-views.md`) is standing project evidence: known open issues include inconsistent tap-target sizing and missing focus-visible states on several shared components (`NavChips`, `IconButton`, `RangeToggle`, `ParameterTile`), and a Dashboard that only visually promotes one "hero" alarm at a time. Treat these as known incumbent debt, not something every new surface must silently inherit.

## Evidence on Hand

- `betta-tank-tracker-spec.md` is the authoritative build spec (schema, screens, mobile requirements, v2 plans) and should be treated as durable product truth alongside this file.
- Real Supabase-backed data model already implemented: Dashboard, Log a test, per-parameter history, Overview (all-parameter mini trends), and Settings are all built and in use.
- No user testimonials, external customers, pricing, or licensing claims exist or apply — this is a personal, non-commercial tool.

## Product Principles

1. Never force a full panel — logging one parameter is a first-class, equally valid action to logging all seven.
2. Recognition over recall: the ideal range and current status should be visible at the moment they're needed, not something she has to hold in memory or dig for.
3. Every parameter that's actually a problem must be visually obvious at the same time — the tool's core job is not to let a second, quieter emergency hide behind one loud one.
4. Stored data stays unit-neutral (Fahrenheit, native hardness units); display-only toggles convert on the way out so history is never silently rewritten by a preference change.
5. Built for one real tank and one real routine, not a general-purpose configurable aquarium platform — depth over breadth.
