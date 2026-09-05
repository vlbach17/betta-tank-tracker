# Betta Tank Tracker — Build Spec

A single-user water parameter log for one Betta aquarium. Built on a laptop, used on an iPhone.

## Goal

Log water test results as they happen, see whether each result is in range, and look back at trends over time to judge overall tank health.

## Stack

- Vite + React + TypeScript
- Tailwind for styling
- Supabase for the database (free tier)
- Recharts for the trend graphs
- Deployed to Cloudflare Pages
- Installed to the iPhone home screen as a PWA

No login screen. This is a single-user app. Use Supabase anon key with row level security locked to a single hardcoded user, or skip auth entirely and keep the project private.

## Database

Two tables.

### parameters

Reference data. Seeded once, editable in the app.

| column | type | notes |
|---|---|---|
| id | uuid, pk | |
| name | text | "pH", "Ammonia" |
| unit | text | "ppm", "dKH", "dGH", "" |
| ideal_min | numeric, nullable | |
| ideal_max | numeric, nullable | |
| sort_order | int | display order |
| active | boolean | hide without deleting history |

Seed rows:

| name | unit | ideal_min | ideal_max |
|---|---|---|---|
| pH | | 6.5 | 7.5 |
| Ammonia | ppm | 0 | 0 |
| Nitrite | ppm | 0 | 0 |
| Nitrate | ppm | 0 | 20 |
| Carbonate hardness (KH) | dKH | 3 | 8 |
| General hardness (GH) | dGH | 3 | 8 |
| Temperature | °F | 78 | 80 |

Temperature is a first-class tracked parameter, same as the chemistry. It behaves a little differently in practice, so handle these cases:

- It gets logged far more often than the test strips, sometimes daily. Do not mark it overdue on the same 14 day rule — use 3 days for temperature.
- Store the value in Fahrenheit. Add a °F / °C display toggle in Settings that converts on the way out only, so the stored data never changes.
- Allow one decimal place. The chemistry values can be whole or decimal too, so just allow decimals everywhere.
- A swing matters as much as the number. On the temperature history chart, note the largest change between any two consecutive readings in the selected range.

### readings

One row per single test. This is the key design choice — never force a full panel.

| column | type | notes |
|---|---|---|
| id | uuid, pk | |
| parameter_id | uuid, fk to parameters | |
| value | numeric | |
| tested_at | timestamptz | defaults to now, user can backdate |
| note | text, nullable | "day after water change" |
| created_at | timestamptz | |

Index on `(parameter_id, tested_at desc)`.

## Screens

### 1. Dashboard (home)

A card per active parameter, sorted by `sort_order`. Each card shows:

- Parameter name and unit
- Latest value, large
- A colored status pill: **In range** (green), **Watch** (amber, within 10% outside the range), **Out of range** (red)
- The ideal range in small text
- How long ago it was tested — "2 days ago", "3 weeks ago"
- If it has never been tested, show a dash and "No readings yet"

Stale warning: if a parameter has not been tested in over 14 days, gray the card and show "Test overdue".

A single big "Log a test" button, fixed to the bottom of the screen so it is reachable with a thumb.

### 2. Log a test

- Date and time picker, defaulting to now
- The full parameter list, each with an optional number input
- Fill in one, or fill in all — blank fields are skipped, not saved as zero
- One optional note field that applies to every reading saved in that session
- Save writes one `readings` row per filled field

Show the ideal range as placeholder text under each input so she does not have to remember them.

### 3. Parameter history

Tap any dashboard card to open it.

- Line chart of that parameter over time
- A shaded green band across the chart showing the ideal range, so out-of-range points are obvious at a glance
- Range toggle: 30 days / 90 days / All
- Below the chart, a reverse chronological list of every reading with value, date, note, and a delete button

### 4. Settings

- Edit ideal min and max per parameter
- Toggle a parameter active or inactive
- Add a custom parameter
- Export all readings to CSV
- Import a CSV back

## Mobile requirements

This is used on mobile almost exclusively. Build mobile-first.

- Single column, full width
- Tap targets at least 44px tall
- Number inputs must use `inputMode="decimal"` so iOS opens the number pad
- Primary action button fixed near the bottom
- Respect the mobile safe areas with `env(safe-area-inset-bottom)`

## PWA setup

- `manifest.json` with name, short name, theme color, `"display": "standalone"`
- Icons at 192px and 512px
- A service worker that caches the app shell so it opens without a signal
- No Vite `base` path needed — Cloudflare Pages serves from the domain root

## Deployment

- Cloudflare Pages, connected via Git integration: builds on push to `master`, no CI config or repo secrets needed
- Build command `npm run build`, output directory `dist`
- Supabase URL and anon key set as environment variables in the Cloudflare Pages project settings (Production and Preview), never committed

## Out of scope for v1

- Multiple tanks
- Photo import of handwritten logs — see "v2" below
- Storing or gallerying tank photos
- Push notifications for overdue tests
- Water change and feeding logs
- Sharing or multi-user access

## Build order

1. Vite scaffold, Tailwind, deploy an empty page to Cloudflare Pages and confirm it loads on the phone
2. Supabase tables and seed data
3. Dashboard reading real data
4. Log a test form
5. Parameter history with chart
6. Settings, CSV export and import
7. PWA manifest, service worker, home screen install

## v2 (future)

### Photo import of handwritten logs

Snap a photo of a handwritten note and have the app read the numbers into the log form.

#### Flow

1. On the "Log a test" screen, add a camera button at the top.
2. Tapping it opens the iPhone camera or photo library. Use `<input type="file" accept="image/*" capture="environment">`.
3. Resize the image client side to about 1600px on the long edge and convert to base64. Full resolution photos are slow and cost more to process.
4. Send it to a Supabase Edge Function.
5. The function calls the Anthropic API with the image and returns structured JSON.
6. The app fills the form fields with whatever came back.
7. **She reviews and corrects, then saves.** Nothing writes to the database straight from the photo.

#### Edge function

Keep the API key server side. It must never appear in the browser bundle.

The function takes the base64 image and the current list of active parameter names, then asks Claude to return only JSON in this shape:

```json
{
  "tested_at": "2026-09-04",
  "readings": [
    { "parameter": "pH", "value": 7.2, "confidence": "high" },
    { "parameter": "Ammonia", "value": 0, "confidence": "low" }
  ],
  "unreadable": ["Nitrate"],
  "note": "any other text on the page"
}
```

Prompt rules to include:

- Only use parameter names from the list passed in. Match loose handwriting to the closest one — "amm", "NH3" and "ammonia" all mean Ammonia.
- If a value cannot be read clearly, put the parameter in `unreadable` instead of guessing.
- Mark confidence high or low per reading.
- If a date is written on the page, return it. Otherwise leave `tested_at` null.
- Return raw JSON only, no explanation and no code fences.

Parse the response defensively. Strip stray backticks before `JSON.parse`, and wrap it in try/catch.

#### Review screen

After extraction, show the form prefilled with:

- Low confidence values highlighted in amber so she checks them
- Anything in `unreadable` shown as an empty field with "Could not read — enter manually"
- A thumbnail of the photo pinned to the top of the screen so she can compare against her own writing
- A "Clear all" button to throw out a bad read and start over

#### Cost and setup

This is the one piece that is not free. It needs an Anthropic API key with a small prepaid balance, which is separate from a Claude subscription. A resized photo runs well under a cent, so a few dollars will last years at this volume. Supabase Edge Functions are included in the free tier.

If you would rather keep the app fully free, ship everything else first and leave the camera button hidden behind a feature flag. Free browser OCR libraries exist but they are built for printed text and will not read handwriting reliably.

Do not store the photos. Process and discard.

Build order for this feature: edge function first, tested with a real photo of your handwriting, then the review screen.
