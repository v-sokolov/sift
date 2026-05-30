# Research & Decisions: GitHub Pages Hosting

Phase 0 output. The spec carries no `NEEDS CLARIFICATION` markers (the deploy-trigger
model was resolved in `/speckit-clarify`: continuous deploy on every push/merge to
`main`). This document records the technical decisions that realize the spec.

---

## R1 — Hosting target & address

**Decision**: Host as a GitHub Pages **project page** at `https://v-sokolov.github.io/sift/`.
HTTPS is provided automatically by GitHub for `*.github.io`. Custom domain is out of scope.

**Rationale**: The repo is already public on GitHub; project Pages is free, static-only,
HTTPS-by-default, and needs no third-party service — directly satisfying Constitution II
("load from static hosting", no backend/egress) and FR-001/FR-002/FR-003.

**Alternatives considered**: User/organization root page (`v-sokolov.github.io`) — rejected:
would require a differently named repo and serve from root, not the goal here. Netlify/
Vercel — rejected: extra third-party platform for no benefit over Pages for a static SPA.

---

## R2 — Sub-path base path (the only app-build change)

**Decision**: A project page serves under `/sift/`, so production asset URLs must carry
that prefix. Set Vite `base` conditionally in `vite.config.ts`:

```ts
base: process.env.GITHUB_PAGES ? '/sift/' : '/',
```

The deploy workflow sets `GITHUB_PAGES=true` for the build step; local `yarn dev`/
`yarn preview` leave it unset and keep `base: '/'` (FR-005). The current `vite.config.ts`
imports `defineConfig` from `vitest/config`; `base` is a valid Vite option there and
applies to `vite build` while leaving the `test` block untouched, so one file serves both
test and build config.

**Rationale**: An env-guarded `base` is the minimal, framework-free fix for sub-path 404s
(FR-004) without disturbing local dev (FR-005) — one line, no new dependency
(Constitution III). The literal `/sift/` is correct because the repo name is `sift`.

**Alternatives considered**: Hardcode `base: '/sift/'` always — rejected: breaks local
`dev`/`preview` at root. Relative `base: './'` — works for a single flat page but is more
fragile for nested asset URLs and less explicit than the known prefix; rejected in favor of
the explicit, env-guarded absolute base. A separate prod-only config file — rejected as
overkill for one line.

---

## R3 — Deploy pipeline (Actions, official Pages flow)

**Decision**: Add `.github/workflows/deploy.yml` using GitHub's official two-job Pages
pipeline:
- Triggers: `push` to `main` **and** `workflow_dispatch` (manual escape hatch).
- `permissions: { contents: read, pages: write, id-token: write }` (least privilege the
  Pages deploy needs).
- `concurrency: { group: "pages", cancel-in-progress: true }` so overlapping runs are
  superseded and the newest push wins (FR-008).
- **build** job: `actions/checkout@v4` → `actions/setup-node@v4` (node 20, `cache: yarn`)
  → `yarn install --frozen-lockfile` → `yarn build` with `env: GITHUB_PAGES: 'true'` →
  `actions/upload-pages-artifact@v3` with `path: dist`.
- **deploy** job: `needs: build`, `environment: github-pages`, `actions/deploy-pages@v4`,
  exposing the live URL via `steps.deploy.outputs.page_url` (FR-010).

Because `yarn build` is `tsc --noEmit && vite build`, a type error or build failure fails
the build job, `deploy` never runs, and nothing is published (FR-009).

**Rationale**: The first-party `upload-pages-artifact` + `deploy-pages` flow is the
supported, dependency-free path; it gives HTTPS, atomic publish, and a reported URL with no
custom scripting. `concurrency` + `needs` give the supersede and fail-closed semantics the
spec requires. Continuous deploy on `main` (no tag/approval gate) matches the clarification.

**Alternatives considered**: Legacy `peaceiris/actions-gh-pages` pushing to a `gh-pages`
branch — rejected: third-party action and a branch-juggling model the official artifact
flow supersedes. Deploy from a committed `docs/` folder — rejected: bloats the repo with
build output and isn't continuous. A manual-approval `environment` gate — rejected per the
clarification (continuous deploy chosen).

---

## R4 — Yarn 4 via Corepack, `--immutable`, and a public-registry lockfile

**Decision**: `package.json` pins `packageManager: yarn@4.12.0`, so CI MUST activate Yarn 4
via **`corepack enable`** before installing (the runner's default Yarn 1 aborts on the
`packageManager` field). The reproducible-install flag is **`yarn install --immutable`**
(Yarn 4's equivalent of Yarn 1's `--frozen-lockfile`, which does not exist in Yarn 4).
`cache: yarn` in `setup-node` is omitted to avoid a Corepack/cache ordering conflict.

> **Update (during /speckit-implement)**: the first CI run surfaced two issues the offline
> sandbox hid: (1) the Corepack/`packageManager` mismatch above, and (2) the committed
> `yarn.lock` embeds `__archiveUrl` resolutions pointing at an **internal Wix registry**
> (`npm.dev.wixpress.com`, 183/184 entries) that GitHub-hosted runners cannot reach.
>
> **Resolution (Option B):** the author's machine could not reach public npm to regenerate
> a clean lockfile — its network resolves npm's Cloudflare IPs but the TCP connection is
> refused (corporate split-tunnel/firewall; GitHub is allowed, npm is not). Rather than
> block on that, we **do not commit a `yarn.lock`**: the deleted wixpress lockfile is
> removed from the repo, `.yarnrc.yml` pins `npmRegistryServer` to public npm, and CI runs
> `yarn install --no-immutable` so the runner (which *does* reach public npm) resolves
> fresh and writes a lockfile at build time. Trade-off: no pinned reproducibility — fine
> for a dev-deps-only static site; revisit by committing a public-npm lockfile later and
> switching back to `--immutable`.

**Rationale**: Immutable installs make the deployed build deterministic and catch lockfile
drift. Corepack is the supported way to honor the pinned Yarn version. A public-registry
lockfile is mandatory for a public CI runner to fetch dependencies.

**Alternatives considered**: Plain `yarn install` (non-immutable) — rejected: non-reproducible.
Keeping `cache: yarn` — rejected: ordering conflict with `corepack enable`; re-add later via a
dedicated cache action if install time matters. Hand-stripping the Wix archive URLs from the
lockfile — rejected in favor of a clean off-network regeneration.

---

## R5 — Jekyll / `.nojekyll`

**Decision**: Do **not** add `.nojekyll` unless the build output ever contains a file or
directory whose name starts with `_`. Vite's default `dist/` uses an `assets/` folder and
hashed filenames (no leading underscore), so it is unnecessary today. Note it in quickstart
as a one-line fix if that ever changes.

**Rationale**: YAGNI (Constitution III) — add the file only when a concrete need appears.
GitHub Pages otherwise runs content through Jekyll, which skips `_`-prefixed paths; current
output has none.

**Alternatives considered**: Add `.nojekyll` pre-emptively — harmless but unnecessary;
deferred to a documented conditional step to avoid an unexplained empty file.

---

## R6 — Verification strategy (no new unit tests)

**Decision**: This feature adds no pure logic, so it adds no Vitest unit tests. Verification
is: (a) the existing `tsc`+`vitest` suite continues to pass inside `yarn build` in CI; and
(b) a manual/observational smoke check against the live URL — Actions run is green, the page
loads over HTTPS with zero console 404s, a created board survives reload, and the
suggest-a-feature mail hand-off opens a mail client (maps to SC-001/002/006).

**Rationale**: Honors Constitution IV (TDD applies to domain logic; there is none here)
while still gating publish on the green build and giving explicit acceptance checks.

**Alternatives considered**: A headless end-to-end test of the live deploy — rejected:
disproportionate tooling (a browser-automation runtime dep) for a single static page,
against Constitution III; the build gate plus a documented smoke test is sufficient.

---

## Summary of decisions

| # | Area | Decision |
|---|------|----------|
| R1 | Target | GitHub Pages project page `https://v-sokolov.github.io/sift/`, HTTPS auto |
| R2 | Base path | Env-guarded `base: process.env.GITHUB_PAGES ? '/sift/' : '/'` in `vite.config.ts` |
| R3 | Pipeline | Official Actions Pages flow; push-to-`main` + dispatch; concurrency supersede; fail-closed |
| R4 | Install | `yarn install --frozen-lockfile` + `cache: yarn`; ensure `yarn.lock` committed |
| R5 | Jekyll | No `.nojekyll` unless an output path gains a `_` prefix (documented conditional) |
| R6 | Verify | No new unit tests; green build gate + documented live-URL smoke check |
