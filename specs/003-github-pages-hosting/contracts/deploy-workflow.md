# Contract: Deploy Workflow (`.github/workflows/deploy.yml`)

The CI/CD contract that publishes the site. This is the authoritative shape the
implementation must produce; `/speckit-tasks` and `/speckit-implement` realize it verbatim
(repo name `sift` already substituted).

## Triggers

- MUST run on `push` to `main` (a PR merge into `main` is such a push → it deploys).
- MUST also expose `workflow_dispatch` for manual re-publishing without a code change.
- MUST NOT gate on tags or manual approval (continuous deploy per clarification).

## Permissions (least privilege)

```yaml
permissions:
  contents: read
  pages: write
  id-token: write
```

## Concurrency (supersede older runs — FR-008)

```yaml
concurrency:
  group: pages
  cancel-in-progress: true
```

## Jobs

### `build`
1. `actions/checkout@v4`
2. `actions/setup-node@v4` with `node-version: 20`
3. `corepack enable` — `package.json` pins `packageManager: yarn@4.x`, so Corepack must
   activate Yarn 4 (the runner's default Yarn 1 would abort the install)
4. `actions/configure-pages@v5`
5. `yarn install --no-immutable` — **no `yarn.lock` is committed**: the only lockfile
   generatable from the author's machine pinned packages to an internal, CI-unreachable
   registry (`npm.dev.wixpress.com`). The runner resolves fresh from public npm and writes
   a lockfile during the build. `.yarnrc.yml` pins `npmRegistryServer` to the public npm
   registry so resolution is deterministic regardless of any global config.

   > Trade-off: no pinned/reproducible lockfile (acceptable for this dev-deps-only static
   > site). To restore reproducibility, commit a lockfile generated against public npm
   > (from an unrestricted network) and switch this step back to `--immutable`.
6. `yarn build` with `env: { GITHUB_PAGES: 'true' }`  ← sets sub-path base; runs
   `tsc --noEmit && vite build`, so a type/build error fails here (FR-009)
7. `actions/upload-pages-artifact@v3` with `path: dist`

> `cache: yarn` is intentionally omitted: with Corepack-activated Yarn 4 it creates a
> chicken-and-egg with the cache step (it runs before `corepack enable`). Installs are
> small; caching can be added later via a dedicated cache action if needed.

### `deploy`
- `needs: build` (only runs if build succeeded — fail-closed, FR-009)
- `environment: { name: github-pages, url: <page_url output> }`
- `actions/deploy-pages@v4` with `id: deploy`, exposing `steps.deploy.outputs.page_url`
  (the reported live URL — FR-010)

## Reference implementation

```yaml
name: Deploy to GitHub Pages
on:
  push:
    branches: [main]
  workflow_dispatch:
permissions:
  contents: read
  pages: write
  id-token: write
concurrency:
  group: pages
  cancel-in-progress: true
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: corepack enable
      - uses: actions/configure-pages@v5
      - run: yarn install --no-immutable
      - run: yarn build
        env:
          GITHUB_PAGES: 'true'
      - uses: actions/upload-pages-artifact@v3
        with:
          path: dist
  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deploy.outputs.page_url }}
    steps:
      - id: deploy
        uses: actions/deploy-pages@v4
```

## Acceptance (maps to spec)

- Push to `main` → Actions run green; `deploy` prints the live URL. (US2/FR-006/FR-010)
- `workflow_dispatch` republishes current `main`. (FR-007)
- Two near-simultaneous pushes → only the latest publishes. (FR-008)
- A build failure → `deploy` does not run; nothing new is published. (FR-009)
- Uses only first-party actions — no third-party runtime dependency. (FR-003)
