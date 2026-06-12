# Tasks: UI Polish — Toolbar Density, Collapsed-Card Summary & Contrast

**Branch**: `022-ui-polish-density-contrast`
**Input**: Design documents from `specs/022-ui-polish-density-contrast/`
**Prerequisites**: plan.md ✓, spec.md ✓, research.md ✓, data-model.md ✓, contracts/ui-polish.md ✓, quickstart.md ✓

**TDD**: Test tasks precede their implementation within each story (house style — red→green→refactor).
**CSS-only changes** (US4, US6) have no automated tests — class reassignment is verified by code
inspection; contrast ratios are M-laws (manual only).

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: User story from spec.md (US1–US6)

---

## Phase 1: Setup — Baseline Confirmation

**Purpose**: Confirm the starting state before any change.

- [x] T001 Run `yarn test` and confirm 226 tests pass (zero failures); record baseline in commit message

---

## Phase 2: Foundational — Warm CSS Token

**Purpose**: Introduce `--warm` design token that `.btn--warm` and `--status-editing` will reference.
No component changes. **Blocks US5 colour-role work.**

- [x] T002 Add `--warm: #8c6400` to `:root` block and `--warm: #e0b34d` to `[data-theme="dark"]` block in `src/styles/app.css`; change both `--status-editing` literals to `--status-editing: var(--warm)` (research R6)

**Checkpoint**: `yarn test` still 226 green; `yarn tsc` clean; `yarn build` clean.

---

## Phase 3: US4 — AA Contrast for Real Labels (Priority: P1)

**Goal**: Move non-placeholder text from `--text-faint` to `--text-muted` so real labels meet WCAG AA.

**Independent Test**: grep `src/styles/app.css` — `.choice__scorelabel`, `.group-label`, `.actbtn`, `.saved`
all reference `--text-muted`; `.choice__name--ghost` and `::placeholder` still reference `--text-faint`.
Manual M7 contrast sweep confirms ≥4.5:1 in both themes.

*Note: These are CSS-only selector reassignments with no template change. Automated tests are not
applicable (jsdom does not load app.css); verification is code inspection + M7 manual sweep.*

- [x] T003 [US4] Change `.choice__scorelabel` color from `var(--text-faint)` to `var(--text-muted)` in `src/styles/app.css` (K1)
- [x] T004 [P] [US4] Change `.group-label` color from `var(--text-faint)` to `var(--text-muted)` in `src/styles/app.css` (K2)
- [x] T005 [P] [US4] Change `.actbtn` color from `var(--text-faint)` to `var(--text-muted)` in `src/styles/app.css` (K3)
- [x] T006 [P] [US4] Change `.saved` color from `var(--text-faint)` to `var(--text-muted)` in `src/styles/app.css` (K4); confirm `.choice__name--ghost` and all `::placeholder` rules still use `var(--text-faint)` (K4 accepted-deviation guard)

**Checkpoint**: 226 tests still green; `yarn tsc` clean; `yarn build` clean.

---

## Phase 4: US2 — ~~Collapsed Cards Show Point Summary~~ *(CANCELLED 2026-06-12)*

**Decision**: Implemented, then reverted per user review — the accordion header looked cluttered.
`pointSummary`, `.choice__summary`, and P1–P8 tests are absent from the shipped code.

- [-] T007 [US2] ~~Write P1–P5 unit tests for `pointSummary`~~ — **REVERTED**
- [-] T008 [US2] ~~Implement `pointSummary`~~ — **REVERTED**
- [-] T009 [US2] ~~Write P6–P8 component tests~~ — **REVERTED**
- [-] T010 [US2] ~~Add `.choice__summary` to ChoiceCard.svelte~~ — **REVERTED**
- [-] T011 [US2] ~~Add `.choice__summary` CSS~~ — **REVERTED**

---

## Phase 5: US1 — Toolbar `toolbar__field` Pattern + Create Container (Priority: P1)

**Goal**: Each scope group is a `.toolbar__field` (label above control); sub-options slide in inline;
Add-choice + Add-point share a `toolbar__add` "Create" container; save-status always visible.

**Actual implementation** (replaces original 2-col-grid approach):

- [x] T012 [US1] Write T2–T3 tests asserting `.seg.seg--multi` wrapper contains Group/Sort buttons with independent `aria-pressed` (RED) in `tests/components/toolbar.test.ts`
- [x] T013 [US1] Add `toolbar.groupSortAria`, `toolbar.scopeActions`, and `toolbar.idle` i18n keys (EN + UA) to `src/i18n/en.ts` and `src/i18n/uk.ts`
- [x] T014 [US1] Restructure `src/components/Toolbar.svelte`: wrap each scope+control pair in `.toolbar__field`; move sub-options (Group-by, Sort-by, Direction) inside `.toolbar__views` as `toolbar__field` items with `transition:slide={{duration:150}}`; add `toolbar__add` Create container with Add-choice + Add-point (`openAddForm`) buttons; replace hidden save-status with always-visible idle variant (`statusVariant` derived, maps "hidden" → "idle") (T2–T3 green)
- [x] T015 [US1] Replace 2-col-grid CSS with `toolbar__field` layout rules in `src/styles/app.css`: `.toolbar__field` column-flex; `.toolbar__views` row-flex wrap; ≤850 px 2-per-row fields; ≤540 px full-width fields; `:has()` exception bands at 851–999 px (≥3 fields) and 1000–1199 px (≥4 fields); `.toolbar__add` margin-left:auto inline / full-width 50/50 band at ≤850 px; `status-dot--idle` neutral colour rule; Element.prototype.animate stub added to `tests/setup.ts` for `slide` transition in jsdom (M1–M2 manual)

**Checkpoint**: T2–T3 green; T4 (018 S1–S3 + 020 Increment-3 existing locks) still green; all tests pass (239); `yarn build` clean.

---

## Phase 6: US5 — CTA Colour Hierarchy: Blue = Build, Warm = Talk, Red = Destroy (Priority: P2)

**Goal**: Add/move three colour voices; update the 020 sole-accent regression locks.

**Independent Test**: Add-choice + Add-point submit carry `.btn--primary`; Suggest button carries
`.btn--warm` (not `btn--primary`); confirm-dialog confirm carries `.btn--danger`; a pressed view
toggle does not have solid-accent background. 020 regression tests pass after deliberate update.

- [x] T016 [US5] Write R1–R5 tests (RED) — `btn--primary` on Add-choice (`tests/components/toolbar.test.ts`); `btn--warm` on Suggest trigger + Send (`tests/components/suggest.test.ts`); `btn--danger` on confirm button (`tests/components/remove-choice.test.ts`)
- [x] T017 [US5] Add `.btn--warm` (border + text + `:hover`/`:focus-visible`/`:active` glow), `.btn__bulb` filter rules (`grayscale(1) opacity(0.6)` off → `none` on), `.btn--danger` (border + text), and tint-recipe for `.toggle[aria-pressed="true"]` (replacing solid fill) to `src/styles/app.css`
- [x] T018 [US5] Add `class="btn--warm"` and `<span class="btn__bulb" aria-hidden="true">💡</span>` wrapper to the Suggest-a-feature trigger button in `src/components/Header.svelte`
- [x] T019 [P] [US5] Change Send button class from `btn btn--primary btn--half` to `btn btn--warm btn--half` in `src/components/SuggestDialog.svelte`
- [x] T020 [P] [US5] Change confirm button class from `btn btn--primary btn--half` to `btn btn--danger btn--half` in `src/components/ConfirmDialog.svelte`
- [x] T021 [P] [US5] Add `btn--primary` class to Add-choice button (`data-action="add-choice"`) in `src/components/Toolbar.svelte`
- [x] T022 [P] [US5] Read `src/components/AddEditForm.svelte`; add `btn--primary` to the Add-point submit button's class list if absent; add a test assertion for R2 (Add-point submit has `btn--primary`) in `tests/components/toolbar.test.ts` so the class is locked going forward
- [x] T023 [US5] Update 020 Increment-3 sole-accent regression tests (B1–B4) in `tests/components/accordion.test.ts` to assert new role split (Add CTAs = `btn--primary`, Suggest = `btn--warm`) instead of sole-blue-accent; confirm updated tests pass (R7)

**Checkpoint**: R1–R5 green; R7 updated and green; B2 (ConfirmDialog D-laws) updated for `btn--danger`; all tests pass; `yarn build` clean.

---

## Phase 7: US3 — Empty Cards Show No Sign-Colour Tint (Priority: P2)

**Goal**: 0-note cards render a faint "no points yet" footer with no sign tint; net-zero non-empty
cards keep neutral tint.

**Independent Test**: A `ChoiceCard` with 0 notes has `.choice__foot--empty` and no sign-tint class;
a card with 1+ notes that net to 0 has `.choice__foot--neutral` (not `--empty`).

- [x] T024 [US3] Decide i18n key: `choice.empty` reused — same EN/UA text, same future intent; no new key needed.
- [x] T025 [US3] Write Z1–Z4 tests (RED) in `tests/components/accordion.test.ts`
- [x] T026 [US3] Add `.choice__foot--empty` CSS rule (no tint, faint placeholder label style) to `src/styles/app.css`
- [x] T027 [US3] Implement empty-vs-non-empty footer branch in `src/components/ChoiceCard.svelte`: `notes.length === 0` → render `choice__foot--empty` with `choice.empty`; `notes.length > 0` → existing sign-tint path unchanged (Z1–Z4 green)

**Checkpoint**: Z1–Z4 green; 018 C1–C4 and 020 F1–F4 still green; all tests pass; `yarn build` clean.

---

## Phase 8: US6 — Collapsed Header Signals Interactivity on Hover (Priority: P3)

**Goal**: Pointer-device hover on `.choice__head` shows a subtle background tint.

**Independent Test**: Manual only (M6 — jsdom has no layout/pointer model). No automated test.

- [x] T028 [US6] Add `.choice__head:hover { background: var(--surface-2); }` inside `@media (hover:hover) and (pointer:fine)` block in `src/styles/app.css`

---

## Phase 9: Polish & Final Verification

- [x] T029 Run `node_modules/.bin/vitest run` — confirm all tests pass (239 passed, 2 skipped; zero failures); record final count
- [x] T030 [P] Run `yarn tsc` — confirm zero type errors
- [ ] T031 [P] Run `yarn build` — confirm production build succeeds on clean deps (Constitution build gate)
- [ ] T032 Complete M1–M8 manual verification per `specs/022-ui-polish-density-contrast/quickstart.md`; M9: at 760 px confirm fields 2-per-row with scope labels above controls; M10: Add-choice + Add-point appear in Create band; M11: save-status idle dot always visible at rest

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies — run immediately
- **Phase 2 (Foundational)**: Depends on Phase 1 — `--warm` token needed by Phase 6 (US5)
- **Phase 3 (US4)**: Depends on Phase 1 only — CSS-only, independent of token
- **Phase 4 (US2)**: Depends on Phase 1 only — pure function + component render, independent
- **Phase 5 (US1)**: Depends on Phase 1 only — CSS + Toolbar component, independent
- **Phase 6 (US5)**: Depends on Phase 2 (--warm token) — component class changes reference the token
- **Phase 7 (US3)**: Depends on Phase 1 only; best after Phase 6 to avoid merge conflicts on `ChoiceCard.svelte`
- **Phase 8 (US6)**: Depends on Phase 1 only — single CSS rule
- **Phase 9 (Polish)**: Depends on all story phases complete

### User Story Dependencies

- **US4 (P1)**: Independent — starts after Setup
- **US2 (P1)**: Independent — starts after Setup
- **US1 (P1)**: Independent — starts after Setup
- **US5 (P2)**: Depends on Foundational (Phase 2) for `--warm` token
- **US3 (P2)**: Independent — touch `ChoiceCard.svelte` and `app.css`; sequence after US5 to avoid conflict on same file
- **US6 (P3)**: Independent — single CSS rule

### Within Each Story (TDD order)

Tests MUST be written and FAIL before implementation (P1–P8, T2–T3, R1–R5, Z1–Z4).
CSS-only stories (US4, US6) have no TDD test tasks.

### Parallel Opportunities

- T003, T004, T005, T006 (US4 CSS edits) — different selectors in same file; safe to batch in one pass
- T018, T019, T020, T021, T022 (US5 component changes) — all different files → fully parallel after T017 (CSS) lands
- T029, T030, T031 (final gates) — independent, run concurrently

---

## Parallel Example: US5 Component Changes

```bash
# After T017 (CSS) is done, all component class changes run in parallel:
T018: Header.svelte  →  btn--warm + bulb span
T019: SuggestDialog.svelte  →  btn--warm on Send
T020: ConfirmDialog.svelte  →  btn--danger on confirm
T021: Toolbar.svelte  →  btn--primary on Add-choice
T022: AddEditForm.svelte  →  verify btn--primary on Add-point
```

---

## Implementation Strategy

### MVP First (P1 stories only: US4, US2, US1)

1. Phase 1: Baseline
2. Phase 3: US4 (contrast)
3. Phase 4: US2 (summary)
4. Phase 5: US1 (toolbar)
5. **Validate**: `yarn test` green, M1/M2/M7 manual sweep
6. Ship if desired — the three P1 improvements are complete and independent

### Full Delivery (all stories)

1. Phase 1 → Phase 2 (foundational token)
2. Phase 3 → 5 (US4 + US2 + US1, can run in priority order or parallel)
3. Phase 6 (US5 — needs Phase 2 complete)
4. Phase 7 (US3)
5. Phase 8 (US6)
6. Phase 9 (polish + verification)

---

## Notes

- [P] tasks touch different files and can run concurrently
- [Story] label enables traceability to spec.md user stories
- CSS custom-property reassignments (US4 K-laws, US3 Z-law footer) are verified by code
  inspection + manual sweep, not jsdom tests
- 020 B1–B4 regression locks are **intentionally updated** in T023 — not collateral damage
- Warm `box-shadow` glow transition is automatically gated by the project's global
  `@media (prefers-reduced-motion: reduce)` rule in `app.css` (no per-rule change needed)
