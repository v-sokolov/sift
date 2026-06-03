# Tasks: Extend Choices to Six Options

**Input**: Design documents from `/specs/015-six-choices/`

**Prerequisites**: plan.md, spec.md (incl. Clarifications 2026-06-03), research.md (R1–R5), data-model.md, contracts/choice-layout.md (B1–B5, L1–L5, S1–S3), quickstart.md (A1–A3, M1–M10, H1–H3)

**Tests**: INCLUDED — TDD is NON-NEGOTIABLE per Constitution Principle IV: every test task is written first and MUST FAIL before its implementation task runs.

**Organization**: Grouped by user story. US1 (cap 4→6) is the MVP; US2 (CSS wrapping) and US3 (complexity hint) are independent increments on top of it.

**Revision note**: Updated after `/speckit-analyze` — added ordering/scoring coverage at 5–6 (C1), retargeted toolbar-text assertions to `tests/components/toolbar.test.ts` with explicit `flow`/`i18n`/`store` updates (I1).

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: US1 = six-Choice cap, US2 = wrapping layout, US3 = complexity hint

## Path Conventions

Single project: `src/`, `tests/` at repository root. Package manager is **yarn**.

---

## Phase 1: Setup (baseline sanity)

**Purpose**: Confirm a green starting point so red tests in later phases are meaningful.

- [x] T001 Run `yarn vitest run` and `yarn tsc --noEmit` (or the project's check script) at repo root; confirm both green before any change. Inventory existing 4-cap assumptions with `grep -rn "Maximum 4\|MAX_CHOICES\|/ 4\|(4)" tests/` — known sites: `tests/components/store.test.ts:42` (test name "addChoice stops at MAX_CHOICES (4)"), `tests/components/lifecycle.test.ts` (uses the constant — mostly self-adapting), and the "Maximum…" string assertions in `tests/components/flow.test.ts` and `tests/components/i18n.test.ts`; `tests/components/toolbar.test.ts` currently has none (it gains the new ones in T006/T013).

---

## Phase 2: Foundational (blocking prerequisite)

**Purpose**: The constitution currently scopes Sift to "2–4 choices"; the cap change MUST NOT land before the governed re-scope (plan Complexity Tracking; research R3).

**⚠️ CRITICAL**: Complete before any US1 implementation task (T008+).

- [x] T002 Amend `.specify/memory/constitution.md`: scope-discipline bullet "a single active dilemma with 2–4 choices" → "2–6 choices"; Principle IV invariant example "(e.g. 2–4 choices" → "(e.g. 2–6 choices"; bump version footer to **2.2.0** (Last Amended: 2026-06-03) and prepend a Sync Impact note (MINOR — scope re-scope per 015, no principle added/removed/redefined).

**Checkpoint**: Constitution permits 2–6 — user story work can begin.

---

## Phase 3: User Story 1 — Compare up to six Choices (Priority: P1) 🎯 MVP

**Goal**: Board supports 2–6 Choices end-to-end: add/remove gating, full Choice lifecycle for #5–#6 (including scoring and Sort/Group ordering parity), `sift.v1` persistence round-trip, correct Toolbar control text in EN/UA.

**Independent Test**: From a fresh board, add Choices until the control disables at 6 ("6 / 6", title "Maximum 6 choices"), verify full point/score lifecycle on cards 5–6, reload → all six restored (spec US1; quickstart M1, M9).

### Tests for User Story 1 (write FIRST — must FAIL) ⚠️

- [x] T003 [P] [US1] Extend `tests/unit/persistence.test.ts`: saved boards with 5 and 6 choices load verbatim; 7 choices rejected → default board; 1 choice still rejected; storage key stays `sift.v1` (contract B3, FR-004/FR-005). Run — MUST fail (cap still 4).
- [x] T004 [P] [US1] Extend `tests/components/store.test.ts`: `addChoice()` grows the board to 5 and 6; 7th attempt is a no-op; `removeChoice()` from 6 re-enables adding and still refuses at 2; `editing` tied to a removed 5th/6th Choice is cleared (contract B1–B2, FR-001/FR-002/FR-003). Rename the test at line ~42 ("addChoice stops at MAX_CHOICES (4)") to drop the hardcoded "(4)". Run — MUST fail.
- [x] T005 [P] [US1] Extend `tests/unit/view.test.ts` and `tests/unit/scoring.test.ts`: with a 6-Choice board holding mixed-weight/mixed-type points, `arrange()` preserves the locked Sort- and Group-mode ordering guarantees (009 contract) on the 5th and 6th Choice exactly as on the first four, and per-Choice scores/totals/leaders compute correctly across all six (FR-003, SC-004, spec US1 scenario 5). Pure-function tests — these may pass immediately if the logic is truly count-agnostic; that is acceptable evidence (they are regression locks, not red-first gates — note this explicitly in the test comment).
- [x] T006 [US1] Add Toolbar 6-cap UI assertions in `tests/components/toolbar.test.ts` (the toolbar suite — NOT lifecycle): `[data-action="add-choice"]` enabled at 5, disabled at 6, label ends "5 / 6" then "6 / 6", disabled `title` = "Maximum 6 choices" (EN) / UA equivalent via parameterized `toolbar.maxChoices`; ghost placeholders "Choice 5"/"Choice 6" and "Варіант 5"/"Варіант 6" render (contract B1/B4, FR-009). In the same task, update the existing "Maximum…" string assertions in `tests/components/flow.test.ts` and `tests/components/i18n.test.ts`, and any residual 4-cap expectation in `tests/components/lifecycle.test.ts` (from T001's inventory). Run — MUST fail.

### Implementation for User Story 1

- [x] T007 [P] [US1] In `src/i18n/en.ts` and `src/i18n/uk.ts`: change `'toolbar.maxChoices'` from the hardcoded "Maximum 4 choices" (and UA equivalent) to the parameterized `'Maximum {n} choices'` pattern (match `choice.placeholder`'s `{n}` style) (research R5 catch).
- [x] T008 [US1] In `src/types.ts`: `MAX_CHOICES` 4 → 6 (line ~97; `MIN_CHOICES` stays 2); update the `Dilemma.choices` doc comment "length constrained 2..4" → "2..6" (line ~22). Depends on T002 (constitution) and T007 (string is parameterized before the number changes anywhere).
- [x] T009 [US1] In `src/components/Toolbar.svelte` (line ~82): render the disabled-button title as `t(lang, "toolbar.maxChoices", { n: String(MAX_CHOICES) })` (match the project's existing `t()` params usage). Run T003–T006 tests — all green; full `yarn vitest run` green.

**Checkpoint**: 6-Choice boards fully functional (MVP) — layout still renders 5–6 narrow columns ≥720px until US2.

---

## Phase 4: User Story 2 — Readable wrapped layout (Priority: P2)

**Goal**: 5–6 Choices wrap to 3 columns (3+2 / 3+3) at ≥720px via pure CSS; phones keep the single-column stack; 2–4 layouts bit-identical; Summary score cells stay column-aligned under their cards.

**Independent Test**: With 6 Choices, resize 360→1600px: stack <720px, 3+3 at ≥720px, ~340px cards at the 1100px container cap; 4-Choice board unchanged at all widths (quickstart M2–M7).

> No automated test tasks: the wrap is a `:has()` grid rule jsdom cannot resolve (plan/quickstart H1). Verification is the manual sweep below; behavior tests from US1 stay green as the regression net.

### Implementation for User Story 2

- [x] T010 [US2] In `src/styles/app.css`, inside the existing `@media (min-width: 720px)` block at the Choice-columns section (~line 394): add `.choices:has(> .choice:nth-child(5)) { grid-template-columns: repeat(3, 1fr); }`; in the Summary block (~line 556) add `.summary:has(> .sum:nth-child(5)) { grid-template-columns: repeat(3, 1fr); }` — the `.summary` selector MUST count `.sum` cells, NOT bare children (`.summary__formula` is also a grid child; bare `:nth-child(5)` would falsely wrap a 4-Choice board — contract L2). Update the "Choice columns" comment to note the count-conditional override (contract L1/L3; research R1).
- [ ] T011 [US2] Manual layout sweep per `specs/015-six-choices/quickstart.md` M2–M7 against `yarn dev`: stacking at ~360px; 3+3/3+2 at 720–1100px; 3 columns ≥1100px; 2–4 boards compared with the pre-015 branch at the same widths (must be identical — L4); Summary alignment incl. the 4-Choice no-wrap check (L2 trap); Group & Sort parity. Record pass/fail notes in the PR description.

**Checkpoint**: 5–6-Choice boards readable on all screen sizes; US1 tests still green.

---

## Phase 5: User Story 3 — Gentle complexity hint (Priority: P3)

**Goal**: One muted, always-visible hint sentence near the Add-choice control while the board has 4–6 Choices; localized EN/UA; informational only.

**Independent Test**: Add Choices 2→6: hint absent at 2–3, appears at 4, persists through 6, never blocks adding; remove to 3 → gone; language switch swaps the text (spec US3; quickstart M1/M8).

### Tests for User Story 3 (write FIRST — must FAIL) ⚠️

- [x] T012 [US3] Add hint assertions in `tests/components/toolbar.test.ts` (same suite as T006 — sequential with it, never concurrent): `[data-hint="many-choices"]` absent at 2 and 3 Choices; present at 4, 5, and 6 with text = `toolbar.manyChoices` (EN), swaps to UA on language change; `addChoice()` still works at 4–5 while the hint shows; hint gone after removing to 3 and after `clearDilemma()` (contract B5, FR-012, SC-005). Run — MUST fail.

### Implementation for User Story 3

- [x] T013 [P] [US3] In `src/i18n/en.ts` and `src/i18n/uk.ts`: add `'toolbar.manyChoices'` — EN: "Many choices can make a dilemma harder to weigh — fewer often brings more clarity." / UA: "Багато варіантів можуть ускладнити зважування — менше часто дає більше ясності." (research R5 wording; tone: gentle observation, no imperative, no "too many" judgment — Constitution I).
- [x] T014 [P] [US3] In `src/styles/app.css`: add a `.toolbar__hint` rule near the toolbar styles — muted small text (`color: var(--text-muted)` or `--text-faint`, smaller font-size, modest margin), no color-only semantics (Constitution V; WCAG AA in both themes — reuse an existing faint-text pattern).
- [x] T015 [US3] In `src/components/Toolbar.svelte`: render `<p class="toolbar__hint" data-hint="many-choices">{t(lang, "toolbar.manyChoices")}</p>` near the Add-choice control when `n >= 4` (derive from the existing `n` `$derived`; plain conditional render, no aria-live, no tooltip — research R5). Run T012 — green; full `yarn vitest run` green. Depends on T013.

**Checkpoint**: All three stories functional and independently verified.

---

## Phase 6: Polish & Cross-Cutting

**Purpose**: Constitution gates and final verification.

- [x] T016 Self-review the diff against contracts S1–S3: `data-action`/`data-hint` hooks and `.choices`/`.choice`/`.summary` class names preserved; no dependency changes; domain logic (`scoring.ts`, `arrange`) and `sift.v1` format untouched beyond the widened range; remove any dead code/comments referencing the 4-cap (e.g. stale "2..4" mentions) via `grep -rn "2..4\|Maximum 4\|MAX_CHOICES" src/`.
- [ ] T017 Full manual pass per `specs/015-six-choices/quickstart.md` M1–M10 (incl. M9 persistence hand-edit reject at 7 choices; M10 reduced-motion + keyboard sweep with 6 cards) and honesty checks H1–H3.
- [x] T018 Build gate (Constitution v2.1.0+ / quickstart A3): clean dependency install, then `yarn build` (`svelte-check` + `vite build`) — must succeed (013 lesson: green tsc+vitest does not prove the build). Final `yarn vitest run` + type-check green.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: none — start immediately.
- **Phase 2 (Foundational)**: after T001. **Blocks T008** (cap change) — the constitution must permit 2–6 before code enforces it.
- **Phase 3 (US1)**: tests T003–T006 can be written in parallel with Phase 2; implementation T007→T008→T009 requires T002 done.
- **Phase 4 (US2)**: independent files (`app.css`), but only *meaningful* after T008 (need 5–6 cards to exist) → run after US1.
- **Phase 5 (US3)**: depends on T008 (threshold spans 4–6) and touches the same `Toolbar.svelte`/`toolbar.test.ts` as US1 → run after US1; independent of US2.
- **Phase 6 (Polish)**: after all desired stories.

### Within-story rules (TDD, NON-NEGOTIABLE)

- T003/T004/T006 written and observed RED before T007–T009. T005 is a pure-function regression lock — may be green immediately (count-agnostic logic); document that in the test, don't fake a red.
- T012 written and observed RED before T013–T015.
- US2 has no automatable test surface — T010 lands only with T011's manual evidence.

### Parallel Opportunities

- T003 ∥ T004 ∥ T005 (different test files); T006 separate (three component-test files, but sequential with nothing — just not with T012, same `toolbar.test.ts`).
- T007 ∥ T003–T006 authoring (different files); T002 ∥ test authoring.
- T013 ∥ T014 (i18n vs CSS).
- US2 (T010–T011) ∥ US3 (T012–T015) — mostly disjoint, but T010 and T014 both edit `app.css`: if run concurrently, coordinate the merge.

---

## Parallel Example: User Story 1

```bash
# After T001–T002, author all US1 red/lock tests together:
Task: "Persistence accepts 5–6 / rejects 7 in tests/unit/persistence.test.ts"
Task: "Store gating at 5/6/7 boundaries in tests/components/store.test.ts"
Task: "arrange()/scoring parity on a 6-Choice board in tests/unit/view.test.ts + tests/unit/scoring.test.ts"
Task: "Toolbar 6-cap UI in tests/components/toolbar.test.ts (+ flow/i18n string updates)"
# Then implement sequentially: T007 (i18n) → T008 (constant) → T009 (Toolbar title)
```

---

## Implementation Strategy

### MVP First (US1 only)

1. T001 → T002 (re-scope) → T003–T006 (red/lock) → T007–T009 (green).
2. **STOP & VALIDATE**: 6-Choice board works end-to-end (M1, M9). Ship-able even though 5–6 columns are cramped on desktop.

### Incremental Delivery

1. + US2 (T010–T011): readable wrapping → ship.
2. + US3 (T012–T015): complexity hint → ship.
3. Polish (T016–T018) before the PR: contracts self-review, full manual pass, clean-install build gate.

---

## Notes

- Total: **18 tasks** (US1: 7, US2: 2, US3: 4, setup/foundational: 2, polish: 3).
- Commit in small logical increments (constitution workflow); **do not commit unless the user asks**.
- Every checkpoint = a state where `yarn vitest run` + `yarn tsc` are green.
