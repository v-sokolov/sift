---

description: "Task list for 018-sort-color-scores"
---

# Tasks: Sort Choices by Total & Colour-Code Scores

**Input**: Design documents from `specs/018-sort-color-scores/`

**Prerequisites**: plan.md, spec.md, research.md (R1–R7), data-model.md, contracts/sort-color-scores.md, quickstart.md

**Tests**: REQUIRED — Constitution Principle IV (Pure Core, Test-First) is NON-NEGOTIABLE.
Every test task below is **red-first**: write it, watch it fail, then implement.

**Organization**: Grouped by user story. US1 (Rank) and US2 (Colour) are independent and
could be built in either order; US1 is the P1 MVP. Both touch `Summary.svelte` and
`app.css`, so edits to those shared files are sequenced (never `[P]` across stories).

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependency on an incomplete task)
- **[Story]**: US1 = Rank, US2 = Colour-code scores

## Path Conventions

Single-project Svelte app: source in `src/`, tests in `tests/` at repo root.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Capture a green starting baseline; confirm no new dependency is introduced.

- [X] T001 Capture clean baseline at repo root — run `yarn install`, `yarn test`, and `yarn build`; confirm all green and that **no new runtime dependency** is added for 018 (native checkbox + pure sort + CSS only, per research R1).

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Cross-story prerequisites.

**No foundational blockers exist** — US1 (Rank) and US2 (Colour) share no required
groundwork: US2 needs none of the ranking state. Both stories may begin immediately after
Setup. (Section intentionally has no tasks.)

**Checkpoint**: Foundation ready — both user stories can begin.

---

## Phase 3: User Story 1 - Rank Choices by their total score (Priority: P1) 🎯 MVP

**Goal**: An opt-in toolbar "Rank by score" toggle (styled like Group/Sort) that re-orders
Choice cards (and their column-aligned score cells) highest-total-first, display-only and
persisted.

**Independent Test**: Add 3+ Choices with differing totals, tick Rank → cards reorder
highest-first; untick → original order returns; reload → preference remembered.

### Tests for User Story 1 (write FIRST, ensure they FAIL) ⚠️

- [X] T002 [P] [US1] Unit tests for `orderedChoices` in `tests/unit/view.test.ts` — O1 identity when off, O2 descending, O3 stable ties (equal totals keep original order), O4 negative-after-positive/zero, O5 non-destructive (input array unchanged), O6 empty/single/all-equal.
- [X] T003 [P] [US1] Persistence tests in `tests/unit/persistence.test.ts` — P1 `rankByTotal: true` round-trips through `sift.v1`; P2 a payload missing/with non-boolean `rankByTotal` loads as `false` and is NOT rejected (no `schemaVersion` bump).
- [X] T004 [P] [US1] Store tests in `tests/components/store.test.ts` — T1 `toggleRank()` flips `view.rankByTotal`; T2 it fires the persist channel; T3 it does NOT call `touch()` (no `updatedAt` change, save-status stays `hidden`/unchanged).
- [X] T005 [P] [US1] Toolbar tests in `tests/components/toolbar.test.ts` — S1 Rank toggle renders left of the divider with "Choices"/"Points" scope labels in order `Choices [Rank by score] │ Points [Group][Sort]`; S2 it is a toggle button whose `aria-pressed` reflects `rankByTotal` and whose click calls `toggleRank`; S3 "Rank by score"/"Choices"/"Points" resolve via i18n in both EN and UA.
- [X] T006 [P] [US1] DOM-order test in `tests/components/sort-color.test.ts` — O2 with Rank on, rendered `.choice` and `.sum` order is descending by total; identity when off (mount App/Summary via `tests/svelte.ts`); and **editing a point that changes a total re-orders the DOM** (FR-004).

### Implementation for User Story 1

- [X] T007 [US1] Add `rankByTotal: boolean` to `ViewPrefs` in `src/types.ts`.
- [X] T008 [US1] In `src/store.svelte.ts`: default `rankByTotal: false` in `emptyDilemma()`'s `view`, and add `toggleRank()` — a preference mutation via `update()` (persists through the channel) that does NOT call `touch()` (alongside `toggleGroup`/`setSortKey`).
- [X] T009 [US1] In `src/persistence.ts` `load()`: coerce a missing/non-boolean `view.rankByTotal` to `false`; do NOT tighten `validView` to require it (008 `groupKey` precedent).
- [X] T010 [US1] Add pure `orderedChoices(choices, rankByTotal)` to `src/view.ts` — stable sort by `choiceScore` descending, ties by original index, identity when `false` (imports `choiceScore` from `scoring.ts`).
- [X] T011 [P] [US1] Add i18n keys `toolbar.rank` ("Rank by score"), `toolbar.scopeChoices` ("Choices"), `toolbar.scopePoints` ("Points") to `src/i18n/en.ts`.
- [X] T012 [P] [US1] Add the same keys to `src/i18n/uk.ts` — `toolbar.rank` "Ранжувати за оцінкою", `toolbar.scopeChoices` "Варіанти", `toolbar.scopePoints` "Пункти".
- [X] T013 [US1] In `src/components/Toolbar.svelte`: add a "Choices" scope label + Rank toggle button (`aria-pressed={rankByTotal}`, onclick → `toggleRank`), a divider, and a "Points" scope label before the existing Group/Sort toggles. (Add-choice button moved to its own row alongside the complexity hint.)
- [X] T014 [US1] In `src/App.svelte`: render `.choices` via `orderedChoices(s.dilemma.choices, s.view.rankByTotal)`, pass `index={s.dilemma.choices.indexOf(choice)}` so the ghost label stays the stored index (R3), and add `animate:flip` with a reduced-motion-gated duration (R6).
- [X] T015 [US1] In `src/components/Summary.svelte`: order the `.sum` cells with the **same** `orderedChoices()` call so score cells stay column-aligned (R2); add the matching `animate:flip`.
- [X] T016 [P] [US1] In `src/styles/app.css`: add toolbar divider, scope-label, and Rank-checkbox styling consistent with the existing toolbar controls.
- [X] T017 [US1] Run `yarn test` — confirm T002–T006 now pass (O/T/S/P green).

**Checkpoint**: Rank fully functional and independently testable.

---

## Phase 4: User Story 2 - Colour-code scores by sign (Priority: P2)

**Goal**: Each Choice's signed total in the Summary is coloured by sign — positive
(`--advantage`), negative (`--disadvantage`), zero (`--neutral`) — supplementary to the
existing +/−/0 text.

**Independent Test**: Create Choices with positive, negative, and zero totals and confirm
each score renders in its sign colour in both themes; the +/−/0 text is always present.

### Tests for User Story 2 (write FIRST, ensure they FAIL) ⚠️

- [X] T018 [P] [US2] Colour tests appended to `tests/components/sort-color.test.ts` — C1 total `> 0` → `.sum__score` has the positive class; C2 `< 0` → negative class; C3 `=== 0` → neutral class; C4 the `signed()` +/−/0 text is still rendered regardless of class; and **the sign classes apply with Rank off as well** (FR-014 — colour is independent of the sort toggle).

### Implementation for User Story 2

- [X] T019 [US2] In `src/components/Summary.svelte`: add a sign-based modifier class to `.sum__score` (`positive | negative | neutral` from `Math.sign(choiceScore(c))`). *(shared file with T015 — sequence after it)*
- [X] T020 [US2] In `src/styles/app.css`: add `.sum__score--positive/--negative/--neutral` mapped to `--advantage`/`--disadvantage`/`--neutral`, and REMOVE the `.sum--leader .sum__score { color: var(--leader-border) }` override so the sign colour wins (keep the leader cell background tint). *(shared file with T016 — sequence after it)*
- [X] T021 [US2] Run `yarn test` — confirm T018 (C1–C4) passes.

**Checkpoint**: Both stories independently functional.

---

## Phase 5: Polish & Cross-Cutting Concerns

- [X] T022 [P] Build gate (Constitution v2.2.0): `yarn build` (svelte-check + vite build) green — 0 errors/0 warnings. NOTE: the full clean-install (`rm -rf node_modules && yarn install`) was not re-run in the offline sandbox (no npm network); since 018 adds **no dependency**, the installed tree already reflects the lockfile. Re-verify clean install on CI.
- [ ] T023 Manual sweep per `quickstart.md` (jsdom can't assert): A1–A2 rank basics/ties, M1 colour by sign, M2 AA contrast in light+dark incl. leader cell, M3 flip smoothness + reduced-motion instant, M4 score↔card column alignment at all breakpoints (incl. 5–6 wrap), M5 live sign-change re-rank+recolour, P persistence reload, H all-zero/2-choice honesty.
- [X] T024 [P] Confirm `tsc` + full `vitest` suite green with no regressions in the existing suite.
- [X] T025 [US-polish] (FR-015) Add a shared `.callout` quote style in `src/styles/app.css` (soft `--surface-2` bg, italic, rounded, padded); apply `callout` class to the complexity hint and the score-formula caption; left-align the formula callout.
- [X] T026 [US-polish] (FR-016) In `src/components/Toolbar.svelte`, place the complexity hint as the message on the LEFT of the Add-choice row with the Add-choice button to its right (`.toolbar__row--add .toolbar__hint { flex: 1 }`); score-formula stays full-width with no button.
- [X] T027 [US2] (FR-017) Tint each score cell by sign — add `.sum--positive/--negative/--neutral` (soft `color-mix` background + sign-coloured top border, mirroring `.sum--leader`) in `src/styles/app.css`; apply a `sum--{sign}` class in `src/components/Summary.svelte`; keep `.sum--leader` last so the leader stays distinct.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (T001)**: no dependencies.
- **Foundational (Phase 2)**: none — no blockers.
- **US1 (Phase 3)** and **US2 (Phase 4)**: both depend only on Setup; otherwise independent.
- **Polish (Phase 5)**: after the desired stories are complete.

### Within User Story 1

- Tests T002–T006 (all `[P]`, different files) MUST be written and FAIL before implementation.
- T007 before T008 and T009 (they use the new field).
- T010 (`orderedChoices`) before T014 and T015 (they consume it).
- T011/T012 (i18n EN/UA) and T016 (CSS) are `[P]`; T013 (Toolbar) depends on T008 + T011/T012.
- T017 after all US1 implementation.

### Within User Story 2

- T018 before T019/T020.
- T021 after T019/T020.

### Cross-story file sequencing (NOT parallel)

- `src/components/Summary.svelte`: T015 (US1 ordering) then T019 (US2 colour).
- `src/styles/app.css`: T016 (US1 toolbar) then T020 (US2 score colours).
- `tests/components/sort-color.test.ts`: T006 (US1 order cases) then T018 (US2 colour cases) — shared test file, sequential across stories (the `[P]` markers apply only within each story's own phase).

### Parallel Opportunities

- All US1 test tasks T002–T006 run in parallel (distinct files).
- T011 + T012 (EN/UA i18n) in parallel.
- T016 in parallel with US1 logic tasks (distinct file) — but before T020.
- T022 + T024 polish checks in parallel.

---

## Parallel Example: User Story 1 tests (red-first)

```bash
# Launch all US1 tests together — each in its own file, all expected to FAIL first:
Task: "orderedChoices unit tests in tests/unit/view.test.ts"
Task: "rankByTotal persistence tests in tests/unit/persistence.test.ts"
Task: "toggleRank store tests in tests/components/store.test.ts"
Task: "Toolbar Rank-checkbox tests in tests/components/toolbar.test.ts"
Task: "DOM-order test in tests/components/sort-color.test.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 — Rank)

1. Phase 1 Setup → 2. (Foundational is empty) → 3. US1 tests red → US1 implementation → green.
4. **STOP and VALIDATE**: Rank works, persists, cards+scores reorder in lockstep, reduced-motion respected.
5. Deploy/demo if ready.

### Incremental Delivery

1. Setup → 2. US1 (Rank) → test → demo (MVP). 3. US2 (Colour) → test → demo. 4. Polish (build gate + manual sweep). Each story adds value without breaking the other.

---

## Notes

- `[P]` = different files, no dependency on an incomplete task.
- Tests are red-first (Principle IV) — verify each fails before implementing.
- **No new runtime dependency** (research R1) — keeps the clean-install build gate trivially green (013 lesson).
- Score colour is supplementary; `signed()` text always present (Principle V, FR-011).
- `animate:flip` only attaches to an *element* sole-child of a keyed each, so each card is
  wrapped in a `.choice-cell` div (the wrapper carries the flip; CSS keeps it the grid item
  so 015 equal-height holds). `tests/setup.ts` stubs `Element.prototype.getAnimations` →
  jsdom lacks the Web Animations API and `animate:flip` calls it.
- Commit in small logical increments; do not merge with failing tests, type errors, or a broken build.
