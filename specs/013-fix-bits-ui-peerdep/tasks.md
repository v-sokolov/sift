# Tasks: Fix CI Build — Restore Bits UI Peer Dependency

**Feature**: `013-fix-bits-ui-peerdep` · **Branch**: `013-fix-bits-ui-peerdep`
**Spec**: [spec.md](./spec.md) · Lighter artifact set (trivial hotfix; no plan/research/contracts).

**Tests**: existing suite is the regression gate; the operative new check is a successful build.

## Phase 1: Fix

- [X] T001 Restore `@internationalized/date` to `dependencies` in `package.json` at a version
  satisfying Bits UI's peer range (`^3.8.1`) — reuse the prior `^3.12.1` (within range). (FR-001)
- [X] T002 Confirm Bits UI's required peer dependencies are all satisfied: `@internationalized/date`
  (now restored) and `svelte` (present); no other required peer is unsatisfied. (FR-003)

## Phase 2: Doc honesty

- [X] T003 Correct `CLAUDE.md` 012 narrative so it no longer says `@internationalized/date` was
  "removed (unused)" — state it is a **required Bits UI peer dependency** that 012 removed and 013
  restored. (FR-006)

## Phase 2b: Governance hardening (prevent recurrence)

- [X] T006 Amend `.specify/memory/constitution.md`: add a **Build gate** to Development Workflow
  & Quality Gates (`yarn build` MUST succeed, verified on a clean install); MINOR bump
  2.0.0 → 2.1.0 + Sync Impact Report entry; update `CLAUDE.md` "Constitution v2.0.0" → v2.1.0.
  This is the gate whose absence let 012's build break pass `tsc` + `vitest`.

## Phase 3: Verify

- [X] T004 `yarn check` → 0 errors; `yarn test` → full suite green (FR-005, SC-003).
- [X] T005 `yarn build` → completes successfully, `@internationalized/date` resolves (FR-002, SC-001).
  Note: local `node_modules` still contains the package, so a local build is a proxy; the CI
  clean-install build is the authoritative gate (record this).

## Dependencies

T001 → T002 → T004 → T005; T003 independent (docs). All small and sequential.

## MVP

T001 alone restores deployability; T003 keeps docs honest; T004–T005 are the gates.
