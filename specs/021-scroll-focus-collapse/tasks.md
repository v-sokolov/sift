# Tasks: Scroll, Focus, Collapsible Header & Scrollbar Gutter

**Input**: Design documents from `specs/021-scroll-focus-collapse/`

**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/ux-enhancements.md ✅

**Tests**: Automated tests for US2 (focus, F1–F3) and US3 (collapsible header, H1–H6) only; US1 and US4 are manual-only (jsdom has no layout engine — clarified 2026-06-12).

**Organization**: Tasks grouped by user story; 4 stories + foundational + polish.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Parallelizable — different files, no dependency on incomplete tasks in the same phase
- **[Story]**: User story label (US1–US4) for story-phase tasks; omitted for setup/polish phases

---

## Phase 1: Foundational (Blocking Prerequisite)

**Purpose**: Extract shared `autofocus` action before any focus work begins. Blocks US2 only; US3 and US4 can proceed independently.

- [x] T001 Create `src/actions.ts` with exported `autofocus(node: HTMLElement): void` — calls `node.focus()` then `node.select()` when node is an input or textarea

**Checkpoint**: `src/actions.ts` exists and exports `autofocus` — US2 tasks can now begin

---

## Phase 2: US4 — Stable Scrollbar Gutter (Priority: P1)

**Goal**: Prevent horizontal layout shift when the scrollbar appears/disappears.

**Independent Test**: Resize the viewport to trigger/remove the scrollbar; confirm page content width does not shift. Open SuggestDialog and close; confirm no reflow (manual M1).

- [x] T002 [US4] Add `scrollbar-gutter: stable` to the `html` selector in `src/app.css` (contract G1)

**Checkpoint**: No layout shift on scrollbar show/hide — verify manually (M1)

---

## Phase 3: US1 — Auto-Scroll to New Choice (Priority: P1)

**Goal**: Viewport scrolls to newly added Choice card after `addChoice()`.

**Independent Test**: Add a 5th/6th Choice card; confirm the new card is visible without manual scrolling (manual M2, M6).

- [x] T003 [US1] Add `$effect` to `src/components/App.svelte` watching `choices.length`: import `tick` from `'svelte'`; after tick, query `document.querySelectorAll('.choice-cell')`, call `scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' })` on the last element (contracts S1–S3)

**Checkpoint**: New card scrolls into view — verify manually (M2, M6)

---

## Phase 4: US2 — Auto-Focus Add Point Form (Priority: P2)

**Goal**: Textarea receives focus when the Add Point form opens.

**Independent Test**: Open Add Point form; confirm textarea is focused immediately. Submit and confirm refocus (automated F1–F3).

### Tests (write first — must fail before T005)

- [x] T004 [P] [US2] Write failing tests F1 (textarea focused on mount), F2 (refocused after re-submit), F3 (autofocus action calls focus+select) in `tests/components/add-edit-form.test.ts`

### Implementation

- [x] T005 [US2] Add `import { autofocus } from '../actions'` and `use:autofocus` to the textarea (`data-field="note-text"`) in `src/components/AddEditForm.svelte` (depends on T001, T004)
- [x] T006 [P] [US2] Replace inline `autofocus` function in `src/components/ChoiceCard.svelte` with `import { autofocus } from '../actions'` (depends on T001)
- [x] T007 [US2] Run `yarn test` — verify F1–F3 tests pass (depends on T005, T006)

**Checkpoint**: F1–F3 green; focus works in browser (manual M3)

---

## Phase 5: US3 — Collapsible Header Description (Priority: P3)

**Goal**: Header description hidden by default on mobile (≤719 px) with keyboard-accessible toggle; always visible on desktop.

**Independent Test**: At 375 px viewport, description not visible on load; click toggle → visible; click again → hidden; reload → hidden (automated H1–H6, manual M4–M5).

### Tests (write first — must fail before T011)

- [x] T008 [P] [US3] Add `header.taglineToggleShow` / `header.taglineToggleHide` keys to `src/i18n/en.ts` (`"Show description"` / `"Hide description"`)
- [x] T009 [P] [US3] Add Ukrainian translations `"Показати опис"` / `"Сховати опис"` to `src/i18n/uk.ts`
- [x] T010 [P] [US3] Write failing tests H1–H3, H5–H6 in `tests/components/header.test.ts`: H1 `descOpen` starts `false`; H2 tagline not visible when collapsed; H3 visible after toggle click; H5 `aria-expanded` correct; H6 `aria-label` matches i18n key (depends on T008, T009) — H4 (≥720 px toggle hidden) requires CSS media-query evaluation; verify H4 manually via quickstart step 5

### Implementation

- [x] T011 [US3] Update `src/components/Header.svelte`: add `let descOpen = $state(false)`; add toggle `<button class="header__tagline-toggle" aria-expanded={descOpen} aria-controls="header-tagline" onclick={() => descOpen = !descOpen}`; wrap tagline in `<div id="header-tagline" class:header__tagline--open={descOpen}>`; set `aria-label` via `t(lang, descOpen ? 'header.taglineToggleHide' : 'header.taglineToggleShow')` (contracts H1–H6; depends on T008, T009, T010)
- [x] T012 [P] [US3] Add mobile CSS rules to `src/app.css`: `.header__tagline` default `display: none` at ≤719 px; `.header__tagline--open` overrides to `display: block`; at `≥720 px` `.header__tagline` always `display: block` and `.header__tagline-toggle` is `display: none` (contract H4)
- [x] T013 [US3] Run `yarn test` — verify H1–H6 tests pass (depends on T011, T012)

**Checkpoint**: H1–H6 green; toggle works at 375 px + invisible on desktop (manual M4–M5)

---

## Phase 6: Polish & Gates

**Purpose**: All four enhancements integrated; quality gates verified; manual walkthrough complete.

- [x] T014 Run `yarn tsc --noEmit` — zero type errors (depends on T005, T006, T011)
- [x] T015 Run `yarn test` — full suite passes (≥211 existing + F1–F3 + H1–H6) (depends on T014)
- [x] T016 Run `yarn build` — production build succeeds (depends on T015)
- [ ] T017 Complete manual walkthrough per `specs/021-scroll-focus-collapse/quickstart.md` steps 1–10 (M1–M6)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Foundational (Phase 1)**: No external dependencies — start immediately
- **US4 (Phase 2)**: Independent of Foundational — can run in parallel with Phase 1
- **US1 (Phase 3)**: Independent of Foundational — can run in parallel with Phase 1
- **US2 (Phase 4)**: Depends on Foundational (T001 must exist) — begin after T001
- **US3 (Phase 5)**: Independent of Foundational — can run in parallel with Phase 1; tests depend on i18n keys (T008, T009)
- **Polish (Phase 6)**: Depends on all story phases complete

### User Story Dependencies

- **US4** (T002): No dependencies — start any time
- **US1** (T003): No dependencies — start any time
- **US2** (T004–T007): Depends on T001 (`src/actions.ts`)
- **US3** (T008–T013): T010 depends on T008+T009; T011 depends on T008+T009+T010; T012 parallel with T011

### Within Each User Story

- Test tasks (T004, T010) MUST be written and FAIL before implementation (TDD)
- i18n keys (T008, T009) before tests and implementation for US3
- Implementation before verification tasks (T007, T013)

---

## Parallel Opportunities

### US3 Example (most parallelism)

```
T008 (en.ts)  ──┐
T009 (uk.ts)  ──┤→ T010 (tests) ──→ T011 (Header.svelte) ──┐
T012 (app.css)──┘                                            ├→ T013 (verify)
```

### US2 Example

```
T004 (tests)   ──→ T005 (AddEditForm.svelte) ──┐
T006 (ChoiceCard.svelte)                        ├→ T007 (verify)
```

---

## Implementation Strategy

### MVP: US4 + US1 (zero-test P1 wins, ~2 tasks)

1. T001 (actions.ts, 5 min)
2. T002 (scrollbar-gutter CSS, 2 min) — immediately removes layout jank
3. T003 (auto-scroll $effect, 15 min) — immediately fixes off-screen new cards
4. **STOP and validate manually** — two P1 wins shipped

### Full Delivery (priority order)

1. Foundational (T001)
2. US4 (T002) → US1 (T003) — both P1, no tests needed
3. US2 (T004–T007) — TDD, F1–F3 automated
4. US3 (T008–T013) — TDD, H1–H6 automated
5. Polish (T014–T017)

---

## Notes

- [P] within a phase = different files, safe to parallelize
- TDD: red tests before implementation for US2 and US3
- US1 and US4 have no automated tests per 2026-06-12 clarification — manual M1/M2/M6 only
- Scroll uses `window.matchMedia` (not `$effect` dependency) — no reactive subscription needed
- Commit after each checkpoint or after each T-task group
