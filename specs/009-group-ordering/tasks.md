# Tasks: Group Ordering — Confirm & Document

**Input**: Design documents from `/specs/009-group-ordering/`

**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/group-ordering.md ✅

**Tests**: Tests are the deliverable here — FR-009 requires regression tests and Constitution
Principle IV (Pure Core, Test-First, NON-NEGOTIABLE) mandates TDD. All test tasks below are
written to assert the locked ordering contract.

**Special nature of this feature**: The behaviour already ships (008). Each test is written to
assert the contract and is **expected to pass green** against current `src/view.ts` /
`src/components/ChoiceCard.svelte` with **no production code change** (FR-010). If a newly added
test goes **red**, that is a genuine regression — fix the source to restore the contract (T010).

**Organization**: Single user story (US1, P1).

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Maps task to a user story (US1)

## Path Conventions

Single-project Svelte SPA: `src/` and `tests/` at repository root (per plan.md Structure Decision).

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Establish a known-green baseline before adding regression tests.

- [X] T001 Establish green baseline: run `yarn test` and `yarn typecheck` from repo root and confirm the existing suite (incl. `tests/unit/view.test.ts` 008 grouped cases) passes with no type errors. Record the baseline so any new red after this point is attributable to the added tests.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: None beyond setup — this feature adds no shared infrastructure, no new `src/` files, no new dependencies (FR-010). The pure `arrange()` and `ChoiceCard.svelte` render guard already exist.

**Checkpoint**: Baseline green → US1 regression tests can begin.

---

## Phase 3: User Story 1 - Grouped points always appear in a predictable, weight-aware order (Priority: P1) 🎯 MVP

**Goal**: Lock the Group-mode ordering contract (Type: Adv 3→2→1 → Disadv 3→2→1 → Neutral; Weight: 3→2→1→weightless, empties omitted, members creation-order types-mixed; deterministic, total, non-mutating) into explicit fail-first tests.

**Independent Test**: Run `yarn test`; the new ordering assertions all pass against current code (or, if any fail, T010 restores the contract). Covers FR-001…FR-009 / SC-001…SC-005.

### Tests for User Story 1 ⚠️ (write FIRST; expected green per FR-010)

> All tasks T002–T006 edit the **same file** `tests/unit/view.test.ts`, so they are sequential (no [P] among them). They map 1:1 to `contracts/group-ordering.md` "Test assertions".

- [X] T002 [US1] Add the `typeFull` fixture `[a3(adv,3),a2(adv,2),a1(adv,1),d1(dis,1),d2(dis,2),d3(dis,3),nu(neu,null)]` and a **Type full 3→2→1** test in `tests/unit/view.test.ts`: `arrange(typeFull,{mode:'grouped',groupKey:'type'})` → labels `['advantage','disadvantage','neutral']`; section[0] ids `['a3','a2','a1']`; section[1] ids `['d3','d2','d1']`; section[2] ids `['nu']`. (FR-001, FR-002, FR-003 / SC-001, SC-002 — closes the weight-2 gap noted in research R3.)
- [X] T003 [US1] Add a **Weight full 3→2→1→weightless, types mixed in creation order** test in `tests/unit/view.test.ts` using `typeFull`: `arrange(typeFull,{...,groupKey:'weight'})` → labels `[3,2,1,'weightless']`; section `3` ids `['a3','d3']`; `2` ids `['a2','d2']`; `1` ids `['a1','d1']`; `'weightless'` ids `['nu']`. (FR-004, FR-005 / SC-003.)
- [X] T004 [US1] Add a **Weight empty-weight omitted** test in `tests/unit/view.test.ts`: a choice with only weight-3 and weight-1 (no weight-2) points → labels `[3,1,'weightless']` (no `2` section). (FR-006 weight-side / SC-003.)
- [X] T005 [US1] Add a **determinism / stability** test in `tests/unit/view.test.ts`: call `arrange(...)` twice on the same input for both `groupKey:'type'` and `groupKey:'weight'` and assert identical `[label, ids]` structures (no reshuffle of equal-key items). (FR-007 / SC-004.)
- [X] T006 [US1] Add a **purity / total coverage** test in `tests/unit/view.test.ts`: assert `choice.notes` array identity and element order are unchanged after `arrange` (both dimensions), and that the union of all section notes equals `choice.notes` with no duplicates/drops. (FR-008.)
- [X] T007 [P] [US1] **Renderer empty-section (Type)**: first check whether an existing ChoiceCard test already asserts that a zero-note Type section is not rendered. If not, add a test (via `tests/svelte.ts` mount helper) mounting `ChoiceCard` with a choice that has **no neutral points** in grouped Type mode and assert no Neutral section heading is rendered. Different file from T002–T006, so parallelizable. (FR-006 type-side — the empty section `arrange` returns must not display, per research R2.)

### Implementation for User Story 1

- [X] T008 [US1] Run `yarn test`. **Expected**: all new tests (T002–T007) pass green with no `src/` change (FR-010). Capture the run output as evidence.
- [X] T009 [US1] Run `yarn typecheck` (`tsc` strict) and confirm zero type errors (new fixtures/tests are well-typed against `Note`/`ViewPrefs`/`Section`).
- [X] T010 [US1] **Contingency (only if T008 shows red)**: a red assertion means a real regression — fix `src/view.ts` `arrange()` and/or `src/components/ChoiceCard.svelte` to restore the ordering in `contracts/group-ordering.md`, then re-run T008/T009 to green. If T008 was fully green, this task is a no-op (close as "no regression found").

**Checkpoint**: Group-mode ordering is locked by passing regression tests; suite + typecheck green.

---

## Phase 4: Polish & Cross-Cutting Concerns

**Purpose**: Validate against the spec's acceptance matrix and keep artifacts honest.

- [X] T011 Run the `quickstart.md` on-device manual acceptance matrix (Type and Weight ordering, empty-section disappearance, Type↔Weight toggle stability) and confirm all 9 rows match. (SC-001…SC-005.)
- [X] T012 [P] If T010 turned out to be a no-op (no regression), add a one-line note to `plan.md`/`research.md` confirming the contract verified green with zero production change; if T010 made a fix, document the regression and fix instead.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately.
- **Foundational (Phase 2)**: Empty for this feature; baseline-green from T001 is the only gate.
- **User Story 1 (Phase 3)**: Begins after T001. Internal order: T002→T003→T004→T005→T006 (same file, sequential) → T008 → T009 → T010 (contingency). T007 runs in parallel with T002–T006 (different file).
- **Polish (Phase 4)**: After US1 is green (T008/T009).

### Within User Story 1

- Tests (T002–T007) written FIRST; expected green per FR-010.
- T008/T009 verify; T010 only fires on red.

### Parallel Opportunities

- T007 (ChoiceCard test, separate file) ∥ T002–T006 (view.test.ts).
- T002–T006 are NOT parallel with each other (all edit `tests/unit/view.test.ts`).

---

## Parallel Example: User Story 1

```bash
# These two streams can proceed concurrently (different files):
Stream A (tests/unit/view.test.ts): T002 → T003 → T004 → T005 → T006
Stream B (ChoiceCard test via tests/svelte.ts): T007
# Then converge:
T008 (yarn test) → T009 (yarn typecheck) → [T010 only if red]
```

---

## Implementation Strategy

### MVP (User Story 1 only — this is the whole feature)

1. T001 baseline green.
2. T002–T007 add the regression assertions (fail-first discipline; expected green).
3. T008/T009 verify suite + typecheck green.
4. T010 only if a test is red (restore contract) — otherwise no-op.
5. T011 manual quickstart validation; T012 document outcome.

### Expected outcome

Per FR-010 / research R1, the suite is **green with no `src/` change** — this feature ships as
added tests plus (at most) a documentation note. A red result is the valuable signal: it means the
008 ordering had silently regressed, and T010 restores it.

---

## Notes

- [P] = different files, no dependencies. Only T007 and T012 are [P] here; T002–T006 share one file.
- This feature intentionally has no Setup/Foundational build tasks — no new deps, no new `src/`
  files (FR-010). The "implementation" is test authoring + verification.
- Commit in small logical groups (constitution Development Workflow) — only when the user asks.
- Verify the green/red result with actual command output before claiming completion
  (Principle IV: code MUST NOT merge with failing tests or type errors).
