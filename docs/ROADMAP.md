# Roadmap

## In progress

_Nothing right now._

## Next up

Real unfinished work — known gaps against the v1 spec, not ideas.

- **On-device install verification.** PWA install-to-home-screen and offline app-shell loading have only been verified via desktop browser devtools (service worker registration, cache contents, manifest resolution) — not yet confirmed on an actual phone.
- **Icon family support** install Tabler icon support for use throughout app.

## Someday

Feature ideas and maybes, including things set aside while building. Nothing here is committed.

- Bottom mobile navigation bar with icons for dashboard, history, add a log, settings
- Multiple aquarium support
- Tracking fish/specicies in each tank

- **Photo import of handwritten logs (v2).** Snap a photo of a handwritten test strip reading and have an edge function + Claude fill in the log form for review. Full spec already written in `betta-tank-tracker-spec.md` under "v2 (future)"; deferred from v1 to avoid an Anthropic API key / prepaid balance dependency before shipping the core app.
- Multiple tanks — each tank/fish would get its own name following the app's naming pattern, "{Name}'s Bettabase" (e.g. a second tank could be "Juniper's Bettabase")
- Storing or gallerying tank photos
- Push notifications for overdue tests
- Water change and feeding logs
- Sharing or multi-user access
