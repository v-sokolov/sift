# Data Model: GitHub Pages Hosting

This feature has **no application data model** — it touches no `AppState`, no
`localStorage` schema, no domain entities. "Entities" here are the configuration and
pipeline artifacts the spec's Key Entities refer to. Documented for completeness and to
anchor the contracts.

---

## Entity: Build configuration (`vite.config.ts`)

The single build-time setting this feature introduces.

| Field | Type | Value | Rule |
|-------|------|-------|------|
| `base` | string | `'/sift/'` when `process.env.GITHUB_PAGES` is truthy, else `'/'` | Production (CI) build serves under the project sub-path; local dev/preview serves at root (FR-004, FR-005). |

State transitions: none. Pure config evaluated once at build time. The existing `test`
block (jsdom, include globs) is unchanged and unaffected by `base`.

---

## Entity: Published site

The static output served at the public address (spec Key Entity).

| Attribute | Value / Rule |
|-----------|--------------|
| Public URL | `https://v-sokolov.github.io/sift/` (stable; FR-001) |
| Transport | HTTPS, platform-provided (FR-002) |
| Origin path | Project sub-path `/sift/` — all assets resolve from here, zero 404s (FR-004) |
| Content | The complete `dist/` build output, served intact (FR-013) |
| Composition | Static files only — no backend, no runtime third-party dependency (FR-003) |
| Preserved behavior | `localStorage` persistence across reload; `mailto:` suggest hand-off with no network call (FR-011) |

---

## Entity: Publish pipeline run (`.github/workflows/deploy.yml`)

One automated build-and-publish execution (spec Key Entity).

| Attribute | Value / Rule |
|-----------|--------------|
| Trigger | `push` to `main` (incl. PR merge) **or** `workflow_dispatch` (manual) (FR-006, FR-007) |
| Gate | None — continuous, unconditional on every `main` update (clarification) |
| Concurrency | Group `pages`, `cancel-in-progress: true` → newest push supersedes older in-flight runs (FR-008) |
| Outcome | success → site published + live URL reported (FR-010); build failure → `deploy` skipped, nothing published (FR-009) |
| Jobs | `build` (checkout → setup-node 20 + yarn cache → frozen install → `yarn build` with `GITHUB_PAGES=true` → upload-pages-artifact) → `deploy` (`needs: build`, environment `github-pages`, deploy-pages) |
| Permissions | `contents: read`, `pages: write`, `id-token: write` (least privilege) |

State transitions: `queued → building → (build failed ⇒ no deploy) | (build ok ⇒ deploying → published)`.

---

## Entity: Hosting enablement (one-time repository setting)

Not a file — a repo configuration precondition (spec US3, FR-012).

| Attribute | Value / Rule |
|-----------|--------------|
| Setting | Repository → Settings → Pages → Build and deployment → **Source = "GitHub Actions"** |
| Frequency | Once; thereafter publishing is automatic (FR-012, SC-004) |
| Owner | Maintainer (manual UI step; cannot be done from the workflow) |

---

## Prerequisite (verified)

- `yarn.lock` is committed and not git-ignored, so CI `yarn install --frozen-lockfile`
  with `cache: yarn` is reproducible (R4). No change needed.
