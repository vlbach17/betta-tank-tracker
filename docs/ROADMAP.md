# Roadmap

## In progress

_Nothing right now._

## Next up

Real unfinished work — known gaps against the v1 spec, not ideas.

- **On-device install verification.** PWA install-to-home-screen and offline app-shell loading have only been verified via desktop browser devtools (service worker registration, cache contents, manifest resolution) — not yet confirmed on an actual phone.
- **Usability review of the bottom nav bar.** `NavChips` was since replaced by a persistent `BottomNav` bar (Dashboard/Overview/Settings/History all use it now; `BackLink` remains only on screens one level deeper, like LogTest and ParameterHistory) — this shipped as spec'd, but a deliberate usability pass on the navigation pattern was deferred rather than done up front.
- **Remove the now-unused `@phosphor-icons/react` dependency.** The bespoke Iridescent icon set replaced every phosphor usage in `src/`; the package is still listed in `package.json` and can be uninstalled.
- **Work the `/impeccable` critique's priority list.** Full report at `.impeccable/critique/2026-09-08T02-55-08Z__all-app-views.md` (score 20/36) — not tracked in git (local tool output). Top finding (P0): Dashboard only badges one "hero" out-of-range parameter, so a second simultaneous alarm (e.g. ammonia) can go unbadged in a small tile. Also flagged: real-time out-of-range input feedback, tap-target/focus-visible consistency, a disappearing ideal-range hint, and the kebab icon acting as a direct settings link rather than a menu.

## Someday

Feature ideas and maybes, including things set aside while building. Nothing here is committed.

- **Design a real Spunk-derived app icon/favicon.** The current favicon/PWA icon shape is legacy and unrelated to the Iridescent brand (only its color was updated during the re-skin) — no brand logo exists yet, only Spunk's photo.
- Multiple aquarium support
- Tracking fish/specicies in each tank

- **Photo import of handwritten logs (v2).** Snap a photo of a handwritten test strip reading and have an edge function + Claude fill in the log form for review. Full spec already written in `betta-tank-tracker-spec.md` under "v2 (future)"; deferred from v1 to avoid an Anthropic API key / prepaid balance dependency before shipping the core app.
- Multiple tanks — each tank/fish would get its own name following the app's naming pattern, "{Name}'s Bettabase" (e.g. a second tank could be "Juniper's Bettabase")
- Storing or gallerying tank photos
- Push notifications for overdue tests
- Water change and feeding logs
- Sharing or multi-user access
