---

description: "Task list for GitHub Pages Hosting"
---

# Tasks: GitHub Pages Hosting

**Input**: Design documents from `/specs/003-github-pages-hosting/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: No automated test tasks. Per research R6, this feature adds no pure domain
logic, so it adds no Vitest unit tests. Verification is the existing `tsc`+`vitest` gate
inside `yarn build` (which runs in CI) plus documented build-inspection and live-URL smoke
checks. Verification tasks below are explicit and checkable.

**Organization**: Tasks grouped by user story (priority order P1 → P2 → P3).

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: US1 / US2 / US3
- Exact file paths included.

## Path Conventions

Static single-page web app at repository root. Touched paths: `vite.config.ts` (modify),
`.github/workflows/deploy.yml` (new), `README.md` (modify). `src/` and `tests/` are
untouched.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Confirm the build preconditions the deploy relies on.

- [X] T001 Verify the production build succeeds and yields `dist/`: run `yarn build` from repo root, confirm it exits 0 and `dist/index.html` exists.
- [X] T002 [P] ~~Confirm `yarn.lock` is committed for a reproducible `--immutable` install.~~ **Superseded (Option B):** the committed lockfile pinned an internal Wix registry unreachable from CI, and the author's network can't reach public npm to regenerate it. Resolution: remove `yarn.lock` from the repo, pin the public registry in `.yarnrc.yml`, and have CI generate the lockfile via `yarn install --no-immutable` (see T015).

**Checkpoint**: Build is green locally and the lockfile is committed.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: None beyond Setup. This feature has no shared foundational code; the sub-path
base change (US1) is itself the first user-story increment and is a prerequisite for a
*correct* publish, so it is intentionally placed in US1 rather than duplicated here.

*(No foundational tasks — proceed to user stories.)*

**Checkpoint**: Setup complete → user-story work can begin.

---

## Phase 3: User Story 1 - Anyone can open the live app over HTTPS (Priority: P1) 🎯 MVP

**Goal**: Production builds resolve all assets under the `/sift/` project sub-path (zero
404s) while local dev/preview stay root-served — the correctness prerequisite for the app
loading cleanly when published.

**Independent Test**: `GITHUB_PAGES=true yarn build` → `dist/index.html` asset URLs begin
with `/sift/`; an unset build → asset URLs begin with `/`; `yarn dev`/`yarn preview`/`yarn
test` behave exactly as before. (Live HTTPS + zero-404 confirmation completes once US2/US3
publish the site.)

### Implementation for User Story 1

- [X] T003 [US1] Add env-guarded `base: process.env.GITHUB_PAGES ? '/sift/' : '/'` to the exported config in `vite.config.ts`, leaving the existing `test` block unchanged (per `contracts/base-path.md`).
- [X] T004 [US1] Verify sub-path build: run `GITHUB_PAGES=true yarn build`, inspect `dist/index.html`, confirm script/style/asset URLs are prefixed with `/sift/` and there are no root-absolute `/assets/...` references (FR-004, SC-001).
- [X] T005 [US1] Verify local serving unchanged: run `yarn build` (no env) and confirm `dist/index.html` asset URLs are root-relative (`/...`); spot-check `yarn preview` serves at `/` without 404s (FR-005).
- [X] T006 [P] [US1] Verify the suite is unaffected by `base`: run `yarn test` and confirm all existing tests pass (Constitution IV gate stays green).

**Checkpoint**: The build produces a sub-path-correct bundle for production and an
unchanged bundle locally; the regression suite is green.

---

## Phase 4: User Story 2 - Publishing happens automatically on push to main (Priority: P2)

**Goal**: Every push/merge to `main` (and manual dispatch) builds and publishes the app to
GitHub Pages; overlapping runs supersede; a failed build blocks the publish; the live URL is
reported.

**Independent Test**: Push a small visible change to `main` → the **Deploy to GitHub Pages**
Actions run is green and the `deploy` job prints the live URL; the change appears at the live
address within ~5 minutes without any manual file copy.

**Depends on**: US1 (T003) — the workflow builds with `GITHUB_PAGES=true`, so the sub-path
base must already be in place to publish a correct site.

### Implementation for User Story 2

- [X] T007 [US2] Create `.github/workflows/deploy.yml` exactly per `contracts/deploy-workflow.md`: triggers `push` to `main` + `workflow_dispatch`; `permissions` contents:read / pages:write / id-token:write; `concurrency: { group: pages, cancel-in-progress: true }`; `build` job (checkout@v4 → setup-node@v4 node 20 → `corepack enable` → configure-pages@v5 → `yarn install --no-immutable` → `yarn build` with `env: GITHUB_PAGES: 'true'` → upload-pages-artifact@v3 path `dist`); `deploy` job (`needs: build`, environment `github-pages`, deploy-pages@v4 with `id: deploy`, url from `steps.deploy.outputs.page_url`). Corepack activates the pinned Yarn 4; `--immutable` is the Yarn 4 reproducible-install flag; `cache: yarn` omitted (Corepack ordering).
- [X] T008 [US2] Static review of `deploy.yml` against the contract: confirm only first-party `actions/*` are used (no third-party action — FR-003), `needs: build` enforces fail-closed (FR-009), and concurrency provides supersede (FR-008).
- [ ] T009 [US2] ⏸ MANUAL (needs a push to `main` + deploy run) — After enablement (US3/T011), verify auto-publish: push a trivial visible change to `main`, confirm the Actions run is green, the `deploy` job outputs the live URL (FR-010), and the change is live within ~5 minutes (SC-003).
- [ ] T010 [US2] ⏸ MANUAL (GitHub Actions UI) — Verify manual re-trigger: from Actions → **Deploy to GitHub Pages** → **Run workflow**, confirm it republishes current `main` with no code change (FR-007).

**Checkpoint**: Pushes to `main` publish automatically and a manual dispatch works.

---

## Phase 5: User Story 3 - One-time hosting enablement (Priority: P3)

**Goal**: A single repo setting makes the pipeline able to publish; afterward, publishing is
automatic with no further setup. Surface the live URL in the README.

**Independent Test**: Follow the documented enablement step once; a subsequent push to
`main` results in a successfully published live site.

**Depends on**: US2 (T007) — the workflow must exist before enabling "GitHub Actions" as the
Pages source.

### Implementation for User Story 3

- [ ] T011 [US3] ⏸ MANUAL (repo admin, GitHub UI) — One-time enablement (manual, GitHub UI): Repository → Settings → Pages → Build and deployment → **Source = "GitHub Actions"** (FR-012, SC-004). Document completion in the PR description.
- [X] T012 [P] [US3] Add a short "Live / Deploy" note to `README.md` with the live URL `https://v-sokolov.github.io/sift/` and one line that pushes to `main` auto-deploy via GitHub Actions. Do NOT add the maintainer email (existing standing constraint).

**Checkpoint**: Hosting is enabled once; README links the live site; further pushes need no
manual setup.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final validation and conditional hardening.

- [ ] T013 ⏸ MANUAL (after first deploy) — Run the full `quickstart.md` live verification: HTTPS on, zero console 404s, board persists across reload, suggest-a-feature opens a mail client with no network call (SC-001/SC-002/SC-006, FR-011).
- [X] T014 [P] Conditional: if any file/dir in `dist/` begins with `_`, add an empty `.nojekyll` to the published output so GitHub Pages serves it intact (R5/FR-013). **Determination: not needed** — the Vite build emits only `index.html` and `assets/` (hashed filenames, no `_`-prefix), so Jekyll will not skip anything.
- [X] T015 Resolve the lockfile/registry blocker (Option B): removed the wixpress-pinned `yarn.lock` from the repo, pinned `npmRegistryServer: https://registry.npmjs.org` in `.yarnrc.yml`, and set CI to `yarn install --no-immutable` so the GitHub runner resolves fresh from public npm (R4). The author's network blocks public npm at the TCP layer (Cloudflare IPs refused; GitHub allowed), so local regeneration wasn't possible.
- [ ] T016 ⏸ OPTIONAL (restore reproducibility) — When on an unrestricted network, generate a lockfile against public npm (`touch yarn.lock && yarn install`, verify 0 `wixpress.com`), commit it, and switch the deploy workflow's install step back to `--immutable`.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately.
- **Foundational (Phase 2)**: Empty.
- **US1 (Phase 3)**: After Setup.
- **US2 (Phase 4)**: After US1 (needs the sub-path base for a correct publish).
- **US3 (Phase 5)**: Enablement (T011) needs US2's `deploy.yml` (T007) to exist; README
  (T012) can be done any time after Setup.
- **Polish (Phase 6)**: After the site is live (US2 + US3).

### Story dependency note

Unlike a typical feature where stories are fully independent, this hosting feature is a
short linear chain: **US1 (correct build) → US2 (pipeline) → US3 (enable) → live**. Each
story is still independently *verifiable* (US1 via local build inspection; US2 via a green
Actions run; US3 via the enablement→publish check), but they are delivered in order.

### Parallel Opportunities

- T002 ∥ T001 (independent checks).
- T006 ∥ T004/T005 (test run vs build inspection — different concerns).
- T012 (README) ∥ T007/T008 (workflow) — different files.
- T014 ∥ T013 (independent final checks).

---

## Implementation Strategy

### MVP First (US1)

1. Phase 1: Setup (T001–T002).
2. Phase 3: US1 — add the env-guarded `base` and verify sub-path vs root builds + green
   suite (T003–T006). This is the correctness core; everything else is delivery.

### Incremental Delivery

1. Setup → US1 (sub-path-correct build).
2. US2 → add `deploy.yml`; push to `main`.
3. US3 → enable "GitHub Actions" source once + README live link → site goes live.
4. Polish → quickstart smoke check; `.nojekyll` only if needed.

---

## Notes

- [P] tasks = different files / independent checks, no ordering dependency.
- No automated test tasks by design (no new pure logic — R6); the green build gate in CI
  enforces correctness and fail-closed publishing.
- T009/T011 require repository admin access and the remote being on GitHub; they are
  observational/manual and complete the live verification.
- Standing constraints honored: yarn (not npm); never commit/push unless explicitly asked;
  no maintainer email in README.
