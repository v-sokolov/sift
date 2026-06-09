# Implementation Plan: GitHub Pages Hosting

**Branch**: `003-github-pages-hosting` | **Date**: 2026-05-30 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/003-github-pages-hosting/spec.md`

## Summary

Publish the existing static Sift app to GitHub Pages as a **project page** at
`https://v-sokolov.github.io/sift/`, served over HTTPS. Two code/config changes plus one
one-time repo setting:

1. **Sub-path base** — set Vite `base` to `/sift/` for production builds (kept at `/`
   locally) so every asset resolves under the project sub-path with zero 404s.
2. **Deploy workflow** — a GitHub Actions workflow that, on every push/merge to `main`
   (and on manual dispatch), runs `yarn build`, uploads `dist/` as a Pages artifact, and
   deploys it; `concurrency` supersedes older in-flight runs, and a failed build blocks
   the deploy.
3. **One-time enablement** — set the repo's Pages source to "GitHub Actions" (documented,
   not code).

No app logic changes, no runtime dependencies, no backend — purely a delivery concern.
This is **continuous deployment**: every merge to `main` auto-publishes unconditionally
(per the clarification), with `workflow_dispatch` as a manual re-trigger escape hatch.

## Technical Context

**Language/Version**: TypeScript 5.x (strict) — unchanged; CI uses Node 20.

**Primary Dependencies**: None at runtime (Constitution III). Build: Vite 5. CI uses
first-party GitHub Actions only: `actions/checkout@v4`, `actions/setup-node@v4`,
`actions/configure-pages@v5`, `actions/upload-pages-artifact@v3`, `actions/deploy-pages@v4`.

**Storage**: Browser `localStorage` only (`sift.v1`) — unchanged; works identically on the
sub-path origin.

**Testing**: Vitest + jsdom (unchanged). Hosting verification is manual/CI-observational
(green Actions run + live-URL smoke check) — there is no unit-testable pure logic in this
feature.

**Target Platform**: Static hosting on GitHub Pages (`*.github.io`), modern browsers; HTTPS
provided by the platform.

**Project Type**: Static single-page web app (no router, no backend).

**Performance Goals**: Change live within 5 minutes of a push to `main` (SC-003); page
loads as a normal static bundle.

**Constraints**: Must stay fully client-side/offline-capable (Constitution II); local
`yarn dev`/`yarn preview` must remain root-served and unchanged (FR-005); whole `dist/`
served intact (FR-013).

**Scale/Scope**: Single public site, single maintainer. Three files touched
(`vite.config.ts`, new `.github/workflows/deploy.yml`, README/docs note) plus one repo
setting.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Verdict | Notes |
|-----------|---------|-------|
| I. Calm Over Features | ✅ PASS | No user-facing feature added; pure delivery. UI unchanged. |
| II. Client-Side & Private | ✅ PASS | **Reinforces** the principle — it explicitly requires loading "from static hosting." No backend, no runtime network call, no telemetry, no data egress. `localStorage` + `mailto:` keep working. CI build artifacts are not user data. |
| III. Simplicity & Clean Structure | ✅ PASS | No runtime deps; one small env-guarded `base` line; one declarative workflow using first-party actions. No abstractions introduced. |
| IV. Pure Core, Test-First | ✅ PASS (N/A logic) | No domain/scoring logic changes, so no new pure functions. Existing `tsc`+`vitest` gate runs inside the build/CI and MUST stay green; the workflow runs `yarn build` (which includes `tsc --noEmit`) so a type/build failure blocks publish (FR-009). |
| V. Accessibility by Default | ✅ PASS | No UI change; existing a11y guarantees ride along unchanged. |

**Result: PASS — no violations, Complexity Tracking not required.** A static-hosting
deploy is the most direct realization of "load from static hosting" in Principle II.

## Project Structure

### Documentation (this feature)

```text
specs/003-github-pages-hosting/
├── plan.md              # This file
├── spec.md              # Condensed spec (Shipped)
└── contracts/           # Live deploy contracts (deploy-workflow + base-path)
```

### Source Code (repository root)

```text
.github/
└── workflows/
    └── deploy.yml         # NEW — build + deploy to GitHub Pages on push to main / dispatch

vite.config.ts             # MODIFIED — add env-guarded `base: '/sift/'` for prod builds
README.md                  # MODIFIED — add a short "Live / Deploy" note + live URL
src/                        # UNCHANGED — no app logic touched
tests/                      # UNCHANGED
```

**Structure Decision**: Single static project (matches the constitution's "static
single-page app"). The feature adds exactly one new file (`.github/workflows/deploy.yml`),
modifies one config file (`vite.config.ts`), and touches `README.md` for the live link.
`src/` and `tests/` are untouched, preserving the regression guard. An optional
`.nojekyll` is added only if a build artifact ever begins with `_` (it currently does not).

## Complexity Tracking

> No Constitution Check violations — section intentionally empty.
