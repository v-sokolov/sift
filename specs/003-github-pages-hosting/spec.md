# GitHub Pages Hosting

> **Status: Shipped — condensed 2026-06-09**

## What shipped

Sift is published as a static site on **GitHub Pages** at
`https://v-sokolov.github.io/sift/` over HTTPS, redeployed automatically on every push
to `main`. Two pieces:

1. **Base-path handling** (`vite.config.ts`) — production builds resolve assets under the
   project sub-path, while local dev/preview stays at root. See
   [`contracts/base-path.md`](contracts/base-path.md).
2. **Deploy workflow** (`.github/workflows/deploy.yml`) — the official two-job GitHub
   Pages Actions pipeline (build → deploy). See
   [`contracts/deploy-workflow.md`](contracts/deploy-workflow.md).

## Why

Public reachability is the point: a real person can use Sift on the internet with no
install, no account, no backend. Automated publish on `main` keeps the live site honest
(it always reflects `main`) and removes a manual, error-prone upload step. Project Pages
is free, static-only, and HTTPS-by-default, satisfying the no-backend / no-third-party-
runtime constraint (Constitution II/III).

## Key decisions

- **Project page, not root** — repo name is `sift`, so the site serves from the `/sift/`
  sub-path. Asset URLs must carry that prefix in production; env-guarded
  `base: process.env.GITHUB_PAGES ? '/sift/' : '/'` keeps local serving at root (FR-004/
  FR-005). One line, no new dependency.
- **Continuous deploy** (clarified 2026-05-30) — every push/merge to `main` auto-publishes;
  no tag and no approval gate. `workflow_dispatch` is the manual re-publish escape hatch.
  US3's one-time "Source = GitHub Actions" repo setting is a setup precondition, not a
  per-deploy step.
- **Fail-closed + supersede** — `deploy` `needs: build`, so a `tsc`/`vite build` failure
  blocks publish (FR-009); `concurrency: { group: pages, cancel-in-progress: true }` means
  the newest push wins (FR-008).
- **First-party actions only** — `upload-pages-artifact` + `deploy-pages`; no third-party
  runtime dependency (FR-003).
- **No committed `yarn.lock`** — the only generatable lockfile pinned packages to an
  internal Wix registry (`npm.dev.wixpress.com`) unreachable from GitHub runners, and the
  author's machine couldn't reach public npm to regenerate. CI runs
  `yarn install --no-immutable` (via Corepack-activated Yarn 4) and resolves fresh from
  public npm; `.yarnrc.yml` pins the public registry. Trade-off: no pinned reproducibility,
  acceptable for a dev-deps-only static site. (Details in `contracts/deploy-workflow.md`.)
- **No `.nojekyll`** — Vite output has no `_`-prefixed paths; add only if that changes.
- **No SPA fallback** — single page, no client-side router, so no deep-link 404 handling.

## Requirements (shipped)

- **FR-001/002**: Reachable at a stable public address, served over HTTPS.
- **FR-003**: Static files only — no backend, no third-party runtime dependency.
- **FR-004/005**: Assets resolve with zero 404s from the sub-path; local dev/preview
  unchanged at root.
- **FR-006/007**: Every push to `main` (incl. PR merge) auto-publishes unconditionally;
  manual publish available without a code change.
- **FR-008**: Overlapping runs serialized — most recent push goes live.
- **FR-009**: A failed build prevents publishing.
- **FR-010**: Live URL reported by the pipeline on success.
- **FR-011**: Existing behavior preserved on the live site — `localStorage` persists across
  reload; "Suggest a feature" opens the mail client with no network call.
- **FR-012/013**: One-time enablement only; full build output served intact.

## Out of scope

Custom domain; any backend, network, or telemetry.
