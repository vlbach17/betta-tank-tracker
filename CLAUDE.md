# CLAUDE.md

Project instructions for working on Betta Tank Tracker. Read this at the start of every session.

## What this is

A single-user water parameter log for one Betta aquarium. Log test results as they happen (one reading at a time, never a forced full panel), see whether each is in range at a glance, and review trends over time. Built on a laptop, used day-to-day from a phone as an installed PWA.

## Stack

- Vite 8 + React 19 + TypeScript
- Tailwind CSS v4 (via `@tailwindcss/vite`), custom tokens in `src/index.css`
- Supabase (Postgres + `@supabase/supabase-js`) — no auth, single-user, private repo
- Recharts for trend charts
- `react-router-dom` v7, `HashRouter` (no server rewrite rules needed on static hosting)
- `vite-plugin-pwa` + `@vite-pwa/assets-generator` for the manifest, service worker, and icons
- `@fontsource` packages for Libre Franklin, Raleway, IBM Plex Mono
- `oxlint` for linting
- Deployed to Cloudflare (Workers static assets) via Git integration — auto-builds on push to `master`

## Running it

- Local dev: `npm install`, then `npm run dev` (localhost, hot reload)
- Build: `npm run build` (runs `tsc -b` then `vite build`)
- Preview a production build locally: `npm run preview`
- Lint: `npm run lint`
- From your phone: open the deployed Cloudflare URL and use "Add to Home Screen" for the installed, standalone PWA experience. There is no separate mobile build.
- Env vars (`VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`) live in `.env` locally (gitignored) and as Cloudflare project environment variables in production. Vite bakes `VITE_*` vars in at **build time** — changing them in Cloudflare requires a fresh deploy, not just a page reload.

## Layout

- `src/App.tsx` — route table
- `src/main.tsx` — entry point, font imports, `HashRouter`
- `src/components/` — screens (`Dashboard`, `LogTest`, `ParameterHistory`, `Overview`, `Settings`) and shared UI (`ParameterCard`, `StatusPill`, `StatusDot`, `MiniHistoryChart`, `RangeToggle`, `BackLink`)
- `src/lib/` — data access and pure logic: `supabase.ts` (client), `parameters.ts` (all Supabase queries — components never call Supabase directly), `status.ts` (in-range/watch/overdue logic), `range.ts` (30/90/all-time filtering), `analysis.ts` (temperature swing), `format.ts`, `csv.ts`, `chartColors.ts`
- `src/types/database.ts` — `Parameter` and `Reading` types matching the Supabase schema
- `public/` — PWA icons, favicon, manifest assets (generated via `pwa-assets.config.ts`, don't hand-edit)
- `betta-tank-tracker-spec.md` — the full build spec; v1 is built, a "v2 (future)" section holds deferred feature specs (currently photo import)

## Parameters tracked

Six chemistry parameters, each with an ideal range checked against every reading:

| Parameter | Unit | Ideal range |
|---|---|---|
| pH | — | 6.5–7.5 |
| Ammonia | ppm | 0 |
| Nitrite | ppm | 0 |
| Nitrate | ppm | 0–20 |
| Carbonate hardness (KH) | dKH | 3–8 |
| General hardness (GH) | dGH | 3–8 |

Temperature is also tracked (78–80°F) but is handled separately in code: a 3-day overdue threshold instead of the default 14 days, and a "largest swing in range" callout on its history chart (see `getOverdueThresholdDays` and `getLargestSwing`). New parameters can be added from Settings at runtime — the table above is the seed set, not a hardcoded list.

## Code conventions

- Components are named function exports (`export function Dashboard()`), never default exports
- All Supabase access goes through `src/lib/parameters.ts` — no component calls `supabase` directly
- Async effects use a `cancelled` flag in the cleanup function to avoid setting state after unmount
- Caught errors are typed `unknown` and narrowed with `err instanceof Error`
- Styling is Tailwind utility classes inline — no CSS modules or styled-components. Design tokens (`--color-ink`, `--color-accent`, `--color-status-*`, fonts) are defined once in `src/index.css`'s `@theme` block
- Mobile-first: 44px minimum tap targets, `inputMode="decimal"` on every numeric input, `env(safe-area-inset-bottom)` padding on fixed bottom bars
- Status/range/format logic lives in small, pure, individually-testable functions in `src/lib/` — keep new logic there rather than inline in components

## Process rules

- **After shipping any change**, update `CHANGELOG.md` (newest entry at top) and `ROADMAP.md` (move finished items out of "Next up").
- **New feature ideas** go under "Someday" in `ROADMAP.md`. Only move something into "Next up" when explicitly told to, or when work on it actually starts.
- Log non-obvious decisions (and things deliberately *not* done) in `DECISIONS.md` as they happen, not retroactively.
