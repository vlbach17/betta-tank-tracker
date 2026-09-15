# Task List

Concrete, checkbox-tracked build tasks for Spunk's Bettabase. For high-level upcoming features and ideas, see `ROADMAP.md`; for why non-obvious calls were made, see `DECISIONS.md`. Update as decisions are made and work progresses.

## 0. Decisions Needed

- [ ] Design a real Spunk-derived app icon/favicon — current favicon/PWA icon shape is legacy and unrelated to the Iridescent brand (only its color was regenerated); no brand logo exists yet, only Spunk's photo
- [ ] Pick how/when to verify PWA install-to-home-screen and offline app-shell loading on an actual phone (only confirmed via desktop devtools so far)
- [ ] Replace Tank Info's placeholder seed data (equipment, food, plants, fish) with real details — every seeded row is labeled "Placeholder — replace…"

## 1. Project Setup & Infra

- [x] Scaffold repo: Vite + React 19 + TypeScript, Tailwind v4, Supabase (Postgres), Recharts
- [x] Deploy to Cloudflare (Workers static assets) via Git integration, `wrangler.jsonc` configured with Worker name + `./dist` assets directory
- [x] Branch-based deploy workflow: `dev` (preview builds) for day-to-day work, `master` (auto-deploy to production) for shipping
- [x] PWA manifest, auto-updating service worker, and generated icons (192/512/maskable/apple-touch) via `vite-plugin-pwa` + `@vite-pwa/assets-generator`
- [x] Env vars (`VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`) wired locally (`.env`) and in Cloudflare project settings
- [ ] Remove the now-unused `@phosphor-icons/react` dependency — fully replaced by the bespoke Iridescent icon set

## 2. Core Screens

- [x] Dashboard — per-parameter status cards, severity-ranked hero tile for the most urgent issue, "N of M in range" summary
- [x] Log a test — fill in one parameter or all of them (blanks skipped, not saved as zero), optional backdated date + hour, session note
- [x] Parameter history — trend chart with shaded ideal-range band, 30/90/all-time toggle, reverse-chron reading list with delete
- [x] Overview — mini trend charts across all parameters
- [x] History — reverse-chron list of past test entries (grouped by `tested_at`) with aggregate status chip, tap-through to entry detail
- [x] Settings — dual-thumb `RangeField` for ideal min/max, active/inactive toggle, custom parameters, °F/°C and dGH/dKH↔ppm display toggles, CSV import/export
- [x] Tank Info — Equipment/Food/Plants/Fish tabs (linked from Settings), each with add, up/down reorder, and active/inactive archive; equipment links out to external manual URLs, seeded with placeholder content
- [x] Tank Info — Water Changes tab: date, amount (gallons), and optional notes per entry, reverse-chronological with confirm-before-delete (no reorder/archive, unlike the other 4 tabs, since it's a log not a managed list)
- [ ] First-open/install flow guiding the user to add to home screen

## 3. Navigation

- [x] Persistent bottom nav bar (Now/Overview/Log/History/Settings) replacing the earlier `NavChips` pill row; wide viewports (~640px+) render as a floating card with the nav as a floating pill
- [ ] Usability review of the persistent bottom nav pattern — not yet done (this is the current nav, not the superseded `NavChips` one)

## 4. `/impeccable` Critique Follow-Up

Full report at `.impeccable/critique/2026-09-08T02-55-08Z__all-app-views.md` (score 20/36, not tracked in git).

- [ ] P0: Dashboard only badges one "hero" out-of-range parameter — a second simultaneous alarm (e.g. ammonia) can go unbadged in a small tile
- [ ] Real-time out-of-range input feedback while logging a test
- [ ] Tap-target / focus-visible consistency pass
- [ ] Fix the disappearing ideal-range hint
- [ ] Kebab icon should act as a menu, not a direct settings link

## 5. Feature Behavior (shipped, no open items)

- [x] Temperature-specific handling: 3-day overdue threshold (vs. 14-day default), largest-swing-in-range callout
- [x] CSV export of all readings, CSV import matching the export's column format
- [x] New parameters addable at runtime from Settings, not hardcoded

## 6. Deferred / v2 Features

Tracked at length in `ROADMAP.md`'s "Someday" list; nothing here is started or scheduled.

- [ ] Photo import of handwritten logs — full spec already written in `betta-tank-tracker-spec.md` under "v2 (future)"; deferred to avoid an Anthropic API key/prepaid balance dependency
- [ ] Push notifications for overdue tests
- [ ] Multiple aquarium support, with species tracking per tank
- [ ] Feeding logs (water change logs shipped — see section 2)
- [ ] Storing or gallerying tank photos
- [ ] Sharing or multi-user access

## 7. Process

- [x] `CLAUDE.md` process rules: update `CHANGELOG.md` and `ROADMAP.md` after shipping a change, log non-obvious decisions in `DECISIONS.md` as they happen
- [ ] No automated session-end hook exists yet for changelog/roadmap upkeep — currently a manual step per `CLAUDE.md`

## 8. Mobile Review Notes (2026-09-14)

Live notes from reviewing the app on a phone. Appended to as they come in.

- [x] `RangeField` (Settings, both the per-parameter editor and "Add a custom parameter"): focusing the min number input should also focus/highlight the min slider thumb, and the same for max
- [x] `RangeField`: the active/focused slider thumb should turn orange (reuse `--color-status-watch`, #f2a51a) to show which one is active
- [x] KH/GH readings are actually entered/stored in ppm, not degrees as `CLAUDE.md`/code assume — this is the source of the display distortion when toggling units. Remove degree/dKH/dGH support entirely and standardize on ppm: drop the Display tab's ppm/degrees toggle, convert existing stored KH/GH readings from degrees to ppm, and remove the dKH/dGH presets from "Add a custom parameter" — turned out the readings were already ppm; it was the stored ideal range that needed converting instead, see `DECISIONS.md` #20
