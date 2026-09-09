# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Vanessa, the single user, testing and logging her Betta aquarium's water parameters (Spunk's tank). Built on a laptop, used almost exclusively from an iPhone as an installed PWA — she opens it right at the tank whenever she runs a test.

## Product Purpose

A private water-parameter log for one Betta aquarium. Log a test result the moment it's taken, see instantly whether it's in range, and review trends over time to judge overall tank health. Success is fast, low-friction logging and trustworthy at-a-glance status — not comprehensive record-keeping for its own sake.

## Positioning

One reading per test, never a forced full panel. Most water-log tools assume you test every parameter every time and structure the entry form (and the data model) around a full panel. This app's `readings` table stores one parameter, one value, one timestamp per row, so logging just pH after a quick check is a first-class action, not a workaround. That single choice is called out in the build spec as "the key design choice."

## Operating Context

- Day-to-day use is one-handed, at the tank, on an iPhone — checking a test strip or liquid kit result and logging it before it's forgotten.
- The app was built on a laptop but is essentially never administered from one day to day.
- No login: single hardcoded user, private repo, Supabase anon key. This is a personal log, not a shared or multi-tenant product.
- Data lives in Supabase (Postgres); the client never talks to any other backend.

## Capabilities and Constraints

- Two tables: `parameters` (reference data — name, unit, ideal min/max, sort order, active flag) and `readings` (one row per single test, backdatable, optional note).
- Seven tracked parameters out of the box: pH, Ammonia, Nitrite, Nitrate, Carbonate hardness (KH), General hardness (GH), Temperature — each with an ideal range checked on every reading. Custom parameters can be added at runtime from Settings.
- Temperature is handled distinctly from the chemistry parameters: logged far more often, so it uses a 3-day overdue threshold instead of the standard 14 days; stored in Fahrenheit with a display-only °F/°C toggle in Settings (stored data never changes on toggle); its history view calls out the largest swing between consecutive readings in the selected range.
- Status is always shown as both a text label and a color (In range / Watch / Out of range), not color alone.
- CSV export and import of all readings, from Settings.
- Installed as a PWA (Add to Home Screen); the app shell must keep working on a poor connection.
- Out of scope for v1 (deliberately, not yet decided): multiple tanks, storing or gallerying tank photos, push notifications for overdue tests, water change/feeding logs, sharing or multi-user access.
- Deferred to v2, spec already written (`betta-tank-tracker-spec.md`): photo import of a handwritten test-strip log. A photo is resized client-side, sent to a Supabase Edge Function, which calls the Anthropic API to extract structured readings; the user always reviews and corrects before anything saves — nothing writes to the database straight from the photo. Photos are processed and discarded, never stored. This is the one feature with a real (small, prepaid) running cost, which is why it's gated behind a feature flag rather than shipped by default.

## Brand Commitments

- Name: "Spunk's Bettabase" — named after the actual betta fish it was built for (Spunk). The pattern "{Name}'s Bettabase" is reserved for any future tank (e.g., a second fish named Juniper would get "Juniper's Bettabase").
- A real photo of Spunk is used as the header avatar. There is no separate logo or brand mark; the current favicon/PWA icon shape predates the brand and is explicitly legacy (tracked in ROADMAP as a "Someday" to redesign from Spunk's likeness).
- The visual language (palette, type, components) is documented independently as the "Iridescent" design system (`docs/design/iridescent_v1/`) — that is design authority, not product truth, and is out of scope for this file.

## Evidence on Hand

- Live production data: real logged readings for Spunk's actual tank in Supabase.
- A real photograph of Spunk exists and is used in the UI (header avatar). No other brand photography or imagery exists yet.
- No customer testimonials, case studies, or third-party evidence apply — this is a single-user personal tool, not a marketed product.

## Product Principles

1. **Partial logging is normal, not a fallback.** Every flow (form, storage, status calculation) must work correctly when only one parameter was tested, not just when a full panel was run.
2. **Status must be legible at a glance, one-handed, on a phone.** Never encode meaning in color alone; pair every status with a text label.
3. **Stored data is immutable under display preference.** Unit toggles (°F/°C) convert on the way out only — changing a preference must never rewrite or reinterpret historical values.
4. **Stay free or near-free to run.** Default to free-tier infrastructure (Supabase, Cloudflare); any feature with a real recurring cost (e.g., photo import's Anthropic API calls) ships behind a flag, off by default.
5. **This is a private, single-user tool by design.** No login, no sharing, no multi-tenant considerations — simplicity for one user beats generality for many.
