# Changelog

All notable changes to this project are documented here. Newest release first.

## [Unreleased]

### Added
- Re-skinned the entire app on a new "Iridescent" design system (Plus Jakarta Sans / Fira Code / DynaPuff, teal→royal→violet→magenta brand gradient, solid-fill status pills, 20px-radius tiles) — colors, type, spacing/radius/shadow tokens, and every screen's visual treatment changed; data model, routing, and Supabase logic unchanged
- Added a header avatar (Spunk's photo) with a gradient ring to Dashboard/Overview/Settings, a "N of M in range" summary line to Dashboard, a severity-ranked hero tile for the most urgent out-of-range/watch/overdue parameter on Dashboard, and a dual-thumb `RangeField` slider replacing Settings' bare min/max number inputs
- Replaced Dashboard's header text links ("Overview"/"Settings") with a kebab menu button plus a pill-style `NavChips` row, also added to Overview and Settings (both drop `BackLink` in favor of it — a navigation-structure change, not just a restyle)
- Installed `@phosphor-icons/react` as an interim icon library for net-new iconography; the app's 3 existing hand-drawn glyphs (back chevron, trash, kebab) are unchanged and centralized into a shared `Icon`/`IconButton` component
- °F / °C display toggle in Settings — temperature readings, ideal range, and the largest-swing callout convert on the way out only; the stored value is always Fahrenheit

### Changed
- Renamed the app from "Betta Tank Tracker" to "Spunk's Bettabase" — updated the page title, PWA manifest name/short name, home-screen title, in-app dashboard header, and README
- Deploy workflow now uses `dev` as the working branch and `master` as the production branch — `master` still auto-deploys on push, but `dev` pushes only trigger a Cloudflare preview build, so changes no longer go live automatically as they're made

### Fixed
- Cloudflare deploy step (`npx wrangler versions upload`) failing with "Missing entry-point to Worker script or to assets directory" — added `wrangler.jsonc` specifying the Worker name and `./dist` as the assets directory, which earlier deploys had been missing without issue until the first `dev`-branch build surfaced it
- Added missing `role="tablist"`/`aria-selected` to the 30/90/all-time range toggle and a visible focus state to buttons/inputs — neither existed before the Iridescent re-skin

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
