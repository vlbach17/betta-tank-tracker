# Roadmap

## In progress

_Nothing right now._

## Next up

Real unfinished work — known gaps against the v1 spec, not ideas.

- **°F / °C display toggle in Settings.** The spec calls for temperature to be stored in Fahrenheit with a display toggle that converts on the way out only, so stored data never changes. Not built yet — the app currently only displays in the stored unit.
- **On-device install verification.** PWA install-to-home-screen and offline app-shell loading have only been verified via desktop browser devtools (service worker registration, cache contents, manifest resolution) — not yet confirmed on an actual phone.

## Someday

Feature ideas and maybes, including things set aside while building. Nothing here is committed.

- **Photo import of handwritten logs (v2).** Snap a photo of a handwritten test strip reading and have an edge function + Claude fill in the log form for review. Full spec already written in `betta-tank-tracker-spec.md` under "v2 (future)"; deferred from v1 to avoid an Anthropic API key / prepaid balance dependency before shipping the core app.
- Multiple tanks — each tank/fish would get its own name following the app's naming pattern, "{Name}'s Bettabase" (e.g. a second tank could be "Juniper's Bettabase")
- Storing or gallerying tank photos
- Push notifications for overdue tests
- Water change and feeding logs
- Sharing or multi-user access
