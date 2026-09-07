# Bettabase UI kit (Iridescent)
Five screens of Spunk's Bettabase rebuilt on the design system, as a hash-routed click-through (`index.html`).

- `Dashboard.jsx` — header with avatar + summary, nav chips, 2-col tile grid with a hero tile for the most urgent parameter, gradient CTA in a bottom bar. (Source: `src/components/Dashboard.tsx`, `ParameterCard.tsx`)
- `LogTest.jsx` — tested-at, one card per parameter with mono input + ideal placeholder, note, Save. (`LogTest.tsx`)
- `ParameterHistory.jsx` — hero card with big reading, gradient sparkline + ideal band, range toggle, reading rows with inline delete confirm. Temperature shows largest swing. (`ParameterHistory.tsx`)
- `Overview.jsx` — one card per parameter with a royal-blue mini sparkline (gradient reserved for the avatar ring). (`Overview.tsx`, `MiniHistoryChart.tsx`)
- `Settings.jsx` — parameter ranges + active toggle, add custom parameter, CSV backup. (`Settings.tsx`)
- `Shell.jsx` — app shell, screen title, card, row, notice. `data.js` — sample data + the status/overdue/format logic from `src/lib/`.

Loads components from `components/core/` via `components/loader.js` (Babel standalone); swap for `_ds_bundle.js` once compiled.
