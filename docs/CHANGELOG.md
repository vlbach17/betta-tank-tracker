# Changelog

All notable changes to this project are documented here. Newest release first.

## [Unreleased]

### Added
- Water Changes tab in Tank Info — logs date, amount (gallons), and optional notes per water change to a new `water_changes` table; reverse-chronological list with confirm-before-delete (mirroring `ParameterHistory`'s reading-delete pattern), unlike the other 4 Tank Info tabs it has no reorder/archive since it's a chronological log, not a managed entity list
- Tank Info page (`/tank-info`, linked from Settings) — 4 tabs (Equipment, Food, Plants, Fish) each backed by its own Supabase table with add, up/down reorder, and active/inactive archive toggle (no hard delete), mirroring Parameters' existing pattern; equipment links out to external manual URLs, fish rows show the existing Spunk avatar when the name matches. Seeded with placeholder content for the user to replace with real tank details.
- Re-skinned the entire app on a new "Iridescent" design system (Plus Jakarta Sans / Fira Code / DynaPuff, teal→royal→violet→magenta brand gradient, solid-fill status pills, 20px-radius tiles) — colors, type, spacing/radius/shadow tokens, and every screen's visual treatment changed; data model, routing, and Supabase logic unchanged
- Added a header avatar (Spunk's photo) with a gradient ring to Dashboard/Overview/Settings, a "N of M in range" summary line to Dashboard, a severity-ranked hero tile for the most urgent out-of-range/watch/overdue parameter on Dashboard, and a dual-thumb `RangeField` slider replacing Settings' bare min/max number inputs
- Replaced Dashboard's header text links ("Overview"/"Settings") with a kebab menu button plus a pill-style `NavChips` row, also added to Overview and Settings (both drop `BackLink` in favor of it — a navigation-structure change, not just a restyle)
- Installed `@phosphor-icons/react` as an interim icon library for net-new iconography; the app's 3 existing hand-drawn glyphs (back chevron, trash, kebab) are unchanged and centralized into a shared `Icon`/`IconButton` component
- °F / °C display toggle in Settings — temperature readings, ideal range, and the largest-swing callout convert on the way out only; the stored value is always Fahrenheit
- Bespoke Iridescent icon set (monoline, `currentColor`, optically-sized per-tier stroke weight) replacing `@phosphor-icons/react` in every screen; each parameter now shows a matching glyph (pH → beaker, Ammonia → beaker-plus, Nitrite → bubbles, Nitrate → wave, KH → fish bowl, GH → fish, Temp → thermometer) via a new `getParameterIcon` lookup, with custom parameters rendering without an icon
- `PRODUCT.md` capturing durable product context (users, purpose, positioning, constraints, brand commitments), generated via `/impeccable init`
- History tab listing past test entries (readings grouped by shared `tested_at`) newest-first, each showing date, relative time, and an aggregate status chip; tapping an entry opens a detail view with every reading submitted, mirroring `ParameterHistory`'s per-reading delete pattern — Dashboard's "last update" line now links to it instead of being a placeholder
- Persistent bottom nav bar (Now / Overview / Log / History / Settings) fixed to the viewport on every screen, replacing the per-view `NavChips` pill row — Log a test is a raised center action; Dashboard's now-redundant floating CTA and header settings shortcut were removed since the nav covers both
- Above ~640px width, the app renders as a floating card over a brand-gradient backdrop with `BottomNav` as a floating pill rather than a flush bar; narrow/phone viewports (the primary target) are unaffected
- Long or custom parameter names abbreviate to their parenthesized unit shorthand on tiles when space is tight (e.g. "General Hardness (GH)" → "GH"); tile name+unit now wraps instead of truncating
- `design-sync` tooling (config, entry stubs, component previews under `.design-sync/`) for syncing component previews — internal/dev tooling, not user-facing

### Changed
- Renamed the app from "Betta Tank Tracker" to "Spunk's Bettabase" — updated the page title, PWA manifest name/short name, home-screen title, in-app dashboard header, and README
- Deploy workflow now uses `dev` as the working branch and `master` as the production branch — `master` still auto-deploys on push, but `dev` pushes only trigger a Cloudflare preview build, so changes no longer go live automatically as they're made
- Log a test's "Tested at" field replaced the native `datetime-local` minute picker with a date input plus an hour dropdown (12 AM–11 PM) — readings can only be backdated to the hour now, not the minute, which matches how tests are actually timed

### Fixed
- Cloudflare deploy step (`npx wrangler versions upload`) failing with "Missing entry-point to Worker script or to assets directory" — added `wrangler.jsonc` specifying the Worker name and `./dist` as the assets directory, which earlier deploys had been missing without issue until the first `dev`-branch build surfaced it
- Added missing `role="tablist"`/`aria-selected` to the 30/90/all-time range toggle and a visible focus state to buttons/inputs — neither existed before the Iridescent re-skin
- Leftover `NavChips` import/usage in `History.tsx` and mismatched bottom padding on `History`/`EntryDetail`, both left over from the bottom-nav-bar merge
- KH/GH ideal ranges were stored in degrees while actual readings were always entered and stored in ppm, so in-range/watch/out-of-range status for both parameters was computed against the wrong scale — removed the degree/ppm display toggle entirely, standardized KH/GH on ppm (unit and stored `ideal_min`/`ideal_max` converted; existing reading values were already correct ppm numbers and untouched), and removed the dKH/dGH presets from "Add a custom parameter"
- `RangeField`'s slider thumb now focuses (and highlights orange) in sync with its paired min/max number input, instead of only reacting to direct interaction with the slider itself

## [1.0.0] - 2026-09-05

### Added
- Dashboard with a card per active parameter: status pill (in range / watch / out of range), ideal range, and time since last test; overdue parameters are grayed out with a "Test overdue" label
- "Log a test" form — fill in one parameter or all of them, blank fields are skipped rather than saved as zero, with an optional backdated timestamp and a note applied to the whole session
- Per-parameter history screen: trend chart with a shaded ideal-range band, a 30-day / 90-day / all-time range toggle, and a reverse-chronological list of readings with delete
- Temperature-specific handling: 3-day overdue threshold instead of the default 14 days, and a "largest swing in range" callout on its history chart
- Overview screen with mini trend charts across all parameters
- Settings screen: edit ideal min/max per parameter, toggle a parameter active/inactive, add custom parameters
- CSV export of all readings and CSV import matching the export's column format
- PWA support: web manifest, auto-updating service worker precaching the app shell, and icons (192, 512, maskable, apple-touch) generated from the app logo
- Supabase backend (`parameters` and `readings` tables), seeded with pH, Ammonia, Nitrite, Nitrate, KH, GH, and Temperature
- Deployed to Cloudflare (Workers static assets) with Git-integration auto-deploy on push to `master`
- Private GitHub repository with initial commit history

### Fixed
- Blank-screen crash on the first Cloudflare deploy, caused by a build running before `VITE_SUPABASE_URL` / `VITE_SUPABASE_PUBLISHABLE_KEY` were set as Cloudflare project environment variables — resolved by retriggering a deploy after setting them, since Vite bakes `VITE_*` variables in at build time

### Removed
- Photo import of handwritten logs — deferred to v2; full spec kept in `betta-tank-tracker-spec.md` under "v2 (future)" rather than discarded
