# Decisions

Short log of non-obvious decisions made while building this, including things deliberately chosen *not* to do. Append new entries at the bottom, numbered sequentially — decision, date, why.

Foundational architecture (two-table schema, no login/single-user, one-reading-per-test rather than a forced full panel, mobile-first layout) is documented directly in `betta-tank-tracker-spec.md` rather than repeated here.

1. **Deploy to Cloudflare instead of GitHub Pages.** 2026-09-05. The GitHub repo is private, and free GitHub Pages requires a public repo. Cloudflare Pages/Workers serves private repos on the free tier with no plan upgrade needed.

2. **Connect Cloudflare via Git integration rather than the Wrangler CLI.** 2026-09-05. Matches the original "auto-build on push" deployment goal without a GitHub Actions workflow or stored deploy tokens. A CLI-only setup would need manual redeploys or its own CI wiring to get the same behavior.

3. **Deploy target is Cloudflare Workers with static assets, not classic Pages.** 2026-09-05. Not really a choice — Cloudflare's current "Workers & Pages" onboarding now routes new git-connected projects through the Workers-with-static-assets product by default (confirmed by the `*.workers.dev` domain and the dashboard defaulting to `npx wrangler deploy` instead of `wrangler pages deploy`). No repo changes were needed since it still just builds and serves `dist`.

4. **Defer photo import of handwritten logs to v2.** 2026-09-05. Keeps v1 shippable without depending on an Anthropic API key / prepaid balance. The full flow (edge function, review screen, cost notes) is preserved in `betta-tank-tracker-spec.md` under "v2 (future)" instead of being discarded.

5. **Use `vite-plugin-pwa` + `@vite-pwa/assets-generator` instead of hand-writing the manifest and service worker.** 2026-09-05. Generates a correct manifest and an auto-updating, app-shell-precaching service worker, and rasterizes the existing logo SVG into every required icon size (192, 512, maskable, apple-touch) from one source file — avoids manually drawn icons or hand-rolled cache logic.

6. **Approved npm's install-script gate for the `sharp` package rather than avoiding it.** 2026-09-05. npm 11's script-approval gate blocked `sharp`'s postinstall step, which fetches its prebuilt binary and is required for `@vite-pwa/assets-generator` to rasterize the SVG. `sharp` is a widely-used, well-vetted image library, so the script was approved for that one package rather than working around the dependency.

7. **Switched to a branch-based deploy workflow: `dev` for day-to-day work, `master` for production.** 2026-09-05. `master` auto-deploys to the live Cloudflare URL on every push with no approval step; pushing to `dev` only triggers a Cloudflare preview build instead. Chosen over Cloudflare's "manual deployment approval" setting so nothing changes about the git workflow's tooling — just which branch gets pushed to.

8. **Added `wrangler.jsonc` (`name`, `compatibility_date`, `assets.directory: "./dist"`) to the repo.** 2026-09-05. The Cloudflare deploy step runs `npx wrangler versions upload`, which failed with "Missing entry-point to Worker script or to assets directory" because no wrangler config told it where the build output lives. This had been silently relying on the dashboard's zero-config Vite preset for earlier production deploys; it broke on the first `dev`-branch build.
