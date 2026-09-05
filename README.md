# Betta Tank Tracker

Single-user water parameter log for one Betta aquarium. Log a test result whenever you check the tank, see at a glance whether it's in range, and review trends over time.

See `betta-tank-tracker-spec.md` for the full build spec, `CHANGELOG.md` for release history, and `ROADMAP.md` for what's planned.

## Stack

Vite + React + TypeScript, Tailwind CSS, Supabase, Recharts. Deployed to Cloudflare, installable as a PWA from your phone's browser.

## Running locally

Requires Node.js and a Supabase project (URL + publishable key).

```bash
npm install
cp .env.example .env   # fill in your Supabase URL and publishable key
npm run dev
```

Open the printed localhost URL. `npm run build` produces a production build in `dist/`; `npm run preview` serves that build locally.

## Using it day to day

Open the deployed site on your phone and choose "Add to Home Screen" — it installs and runs standalone, like a native app, and the app shell works even with a poor connection.
