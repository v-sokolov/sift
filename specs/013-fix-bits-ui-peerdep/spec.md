# Feature Specification: Fix CI Build — Restore Bits UI Peer Dependency

**Feature Branch**: `013-fix-bits-ui-peerdep`

**Created**: 2026-05-31

**Status**: Draft

**Input**: User description: CI production build failure —
`[vite]: Rollup failed to resolve import "@internationalized/date" from
".../node_modules/bits-ui/dist/internal/date-time/utils.js"`.

## Scope

A **hotfix** for a build regression introduced by feature 012. When 012 adopted Bits UI's
`Dialog`, it also removed `@internationalized/date` from the project's dependencies on the
premise (from the repo review) that the package was unused. That premise was correct only while
Bits UI was *declared but not imported*. Once Bits UI's `Dialog` is actually imported, the
bundler pulls in Bits UI's shared internal modules — including its date-time utilities — which
import `@internationalized/date`. The package is in fact a **declared `peerDependency` of
`bits-ui` (`^3.8.1`)** and so must be provided by this project.

The regression did not surface locally because `@internationalized/date` was still physically
present in `node_modules` (012 edited `package.json` without a clean reinstall), so the local
`yarn build` resolved it from leftover modules. The clean install in CI does not have it, so the
production build fails.

This feature restores the dependency so the production build succeeds. The code change is a
dependency-manifest fix only — no source, behavior, UI, or persisted-state change.

**Incidental cleanup**: 013 also removes two unused favicon variants
(`public/favicon-a-balance.svg`, `public/favicon-bc2-dots-s.svg`) that were already deleted from
the working tree and are referenced nowhere (`index.html` uses `favicon.svg`) — dead files folded
into this commit at the maintainer's direction.

**Governance addendum** (added at the maintainer's request during 013): because this break slipped
through the existing quality gate (which mandated `tsc` + `vitest` but not a production build), 013
also **amends the constitution** to add a **Build gate** — `yarn build` MUST succeed, verified on a
clean dependency install, before work is considered done (MINOR bump 2.0.0 → 2.1.0). This makes the
rule that would have caught 012 part of the project's governance.

## Clarifications

### Session 2026-05-31

- Q: Restore the dependency, or instead externalize / deep-import to avoid pulling Bits UI's
  date-time code? → A: **Restore the dependency.** It is Bits UI's declared peer dependency;
  providing it is the supported, minimal, correct fix. Externalizing it would break the runtime
  bundle, and deep-import path tricks are brittle against Bits UI internals.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - The production build succeeds (Priority: P1)

A maintainer (or the CI pipeline) runs the production build on a clean install of dependencies.
The build completes successfully and produces the deployable static assets, instead of failing
to resolve `@internationalized/date`.

**Why this priority**: This is the whole feature. The app currently cannot be built/deployed
from a clean checkout — `main` is broken for release. Restoring deployability is the entire value.

**Independent Test**: On a clean dependency install (no leftover modules), run the production
build; it completes with exit code 0 and emits the bundle.

**Acceptance Scenarios**:

1. **Given** a clean install of declared dependencies, **When** the production build runs,
   **Then** it completes successfully and resolves `@internationalized/date` (no Rollup
   resolution error).
2. **Given** the fixed manifest, **When** dependencies are listed, **Then** every package Bits UI
   declares as a required peer dependency is satisfied by the project's declared dependencies.
3. **Given** the fix, **When** the type-check and test suite run, **Then** they remain green (no
   regression from the manifest change).
4. **Given** the suggest dialog at runtime, **When** it is opened, **Then** it behaves exactly as
   after 012 (the dependency restore changes nothing user-visible).

### Edge Cases

- The build must succeed specifically on a **clean** install (the failure mode is masked by stale
  `node_modules`); verification must reflect the clean-install path that CI uses.
- The restored dependency version must satisfy Bits UI's declared peer range (`^3.8.1`).
- No other Bits UI peer dependency may be left unsatisfied (guard against a similar latent break).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The project MUST declare `@internationalized/date` as a runtime dependency at a
  version satisfying Bits UI's peer-dependency range (`^3.8.1`), because Bits UI — now imported
  via `Dialog` — requires it transitively.
- **FR-002**: The production build MUST complete successfully on a clean dependency install, with
  no unresolved-import error for `@internationalized/date`.
- **FR-003**: All of Bits UI's **required** peer dependencies MUST be satisfied by the project's
  declared dependencies after the fix (no remaining latent unresolved peer).
- **FR-004**: The fix MUST be limited to the dependency manifest (and lockfile/install state if
  applicable); no application source, behavior, UI, or persisted-state change.
- **FR-005**: The type-check and existing test suite MUST remain green after the change.
- **FR-006**: Project documentation that described `@internationalized/date` as "unused / removed"
  (e.g., the 012 narrative in `CLAUDE.md`) MUST be corrected to state it is a required Bits UI
  peer dependency, so the committed docs stay honest.
- **FR-007**: The constitution MUST be amended to add a **Build gate** to its Development Workflow
  & Quality Gates — the production build (`yarn build`) MUST succeed, verified against a clean
  dependency install, before work is considered done — with a MINOR version bump (2.0.0 → 2.1.0)
  and a Sync Impact Report entry, and any `CLAUDE.md` version reference updated to match.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A clean-install production build succeeds (exit code 0) in **100%** of runs,
  including the CI pipeline that currently fails.
- **SC-002**: The count of unsatisfied **required** Bits UI peer dependencies is **0**.
- **SC-003**: The type-check reports **0** errors and the full test suite passes with no net loss
  of tests.
- **SC-004**: No change to runtime behavior — the suggest dialog and all other features behave
  identically to their post-012 state.

## Assumptions

- Bits UI's peer-dependency declaration (`@internationalized/date@^3.8.1`) is authoritative; the
  fix targets that range. The previously-declared `^3.12.1` (within `^3.8.1`) is an acceptable
  satisfying version.
- The repository intentionally does not commit a lockfile (003 decision); CI installs from public
  npm. Restoring the dependency in `package.json` is therefore the operative fix; the local
  `node_modules` already contains a satisfying copy.
- This supersedes feature 012's FR-002 ("remove `@internationalized/date`"), which was correct
  only under the rejected "do not adopt Bits UI" branch. Adopting Bits UI (012's chosen path)
  makes the package required.
- Verifying the *clean-install* path may not be fully reproducible in an offline sandbox; where a
  true clean install cannot run, the manifest correctness (peer satisfied) plus a local build is
  the proxy, and CI is the authoritative gate.
