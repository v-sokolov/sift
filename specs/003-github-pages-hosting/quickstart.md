# Quickstart: GitHub Pages Hosting

Builds on the existing plain-TS app. No runtime dependencies added; this is delivery only.

## What ships

- `vite.config.ts` — env-guarded `base: process.env.GITHUB_PAGES ? '/sift/' : '/'`.
- `.github/workflows/deploy.yml` — build + deploy to GitHub Pages on push to `main` and on
  manual dispatch.
- `README.md` — short "Live / Deploy" note with the live URL.
- One-time repo setting (manual, below).

Live URL once enabled: **https://v-sokolov.github.io/sift/**

## One-time enablement (maps to US3 / FR-012)

Do this **once**, in the GitHub UI:

1. Repository → **Settings** → **Pages**.
2. **Build and deployment** → **Source** → select **"GitHub Actions"**.

After this, every push/merge to `main` publishes automatically — no further setup.

## Verify locally before pushing

```bash
# Production sub-path build (as CI builds it):
GITHUB_PAGES=true yarn build
# Inspect dist/index.html → asset URLs should start with /sift/

# Normal local serving is unchanged (root):
yarn dev        # serves at /
yarn preview    # serves the last `yarn build` at /
yarn test       # suite still green (base does not affect tests)
```

## Verify the live deploy (maps to spec user stories)

1. **Auto-publish (US2)** — Merge/push a small visible change to `main`. The
   **Deploy to GitHub Pages** Actions run goes green; the `deploy` job prints the live URL.
   The change appears at `https://v-sokolov.github.io/sift/` within ~5 minutes (SC-003).
2. **Loads over HTTPS, no 404s (US1)** — Open the live URL in a fresh browser. The
   comparison screen renders; the address bar shows HTTPS; the console shows **zero** failed
   asset requests (SC-001/SC-002).
3. **App behavior preserved (US1/FR-011)** — Create a dilemma, reload → the board persists
   (`localStorage`). Use **Suggest a feature** → Send → the mail client opens pre-filled; no
   network request is made by the app (SC-006).
4. **Manual re-trigger (FR-007)** — Actions → **Deploy to GitHub Pages** → **Run workflow**
   → it republishes current `main` with no code change.
5. **Fail-closed (FR-009)** — If a build ever fails (type error / build error), the `deploy`
   job is skipped and the previously live site is untouched.

## Notes

- **`.nojekyll`**: not needed today (Vite output has no `_`-prefixed paths). If a future
  build emits a file/dir starting with `_`, add an empty `.nojekyll` to the published output
  so GitHub Pages serves it intact (R5/FR-013).
- **Yarn 4 / Corepack**: `package.json` pins `packageManager: yarn@4`, so CI runs
  `corepack enable` first.
- **No committed lockfile (by decision)**: the only lockfile generatable from the author's
  network pinned packages to the internal `npm.dev.wixpress.com` (unreachable from public
  CI), and that machine can't reach public npm to regenerate. So `yarn.lock` is **not**
  committed; `.yarnrc.yml` pins the public npm registry and CI runs
  `yarn install --no-immutable`, letting the runner resolve from public npm. To restore a
  reproducible pinned install later: generate a lockfile on an unrestricted network, commit
  it, and switch CI back to `--immutable`.
- **No custom domain** (out of scope) — the `*.github.io` address provides HTTPS by default.

## Where things live

- Base path: `vite.config.ts`
- Pipeline: `.github/workflows/deploy.yml` (contract: `contracts/deploy-workflow.md`)
- Live link: `README.md`

See `plan.md` for the Constitution Check, `research.md` for decisions, `data-model.md` for
the config/pipeline entities, and `contracts/` for the deploy-workflow and base-path
contracts.
