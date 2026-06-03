# Tasks: Confirm Removing a Choice with Points

**Input**: Design documents from `/specs/016-confirm-remove-choice/`

**Prerequisites**: plan.md, spec.md (incl. Clarifications 2026-06-03), research.md (R1–R3), contracts/remove-confirmation.md (B1–B6, D1–D4, S1–S3), quickstart.md (A1–A3, M1–M6, H1–H3). No data-model.md (no entity change).

**Tests**: INCLUDED — TDD is NON-NEGOTIABLE per Constitution Principle IV: behavior test tasks are written first and observed RED before their implementation tasks.

**Organization**: US1 (confirm on pointed removal) is the MVP; US2 (empty stays instant) is a small regression-lock increment; the Clear migration (FR-010, from Clarifications — not a spec user story) is a cross-cutting phase after both.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: US1 = confirm pointed removal, US2 = empty instant removal

## Path Conventions

Single project: `src/`, `tests/` at repository root. Package manager is **yarn**.

---

## Phase 1: Setup (baseline sanity)

**Purpose**: Confirm a green start so red tests are meaningful.

- [x] T001 Run `yarn vitest run` and `yarn tsc --noEmit` at repo root — both green (note: the branch already carries the uncommitted 015 dash copy-edit in `src/i18n/{en,uk}.ts`; it is test-green and rides along). Confirm `grep -rn "window.confirm" src/` returns exactly one hit (`Toolbar.svelte` Clear) — the baseline the migration must reduce to zero.

---

## Phase 2: Foundational (blocking prerequisites)

**Purpose**: The shared dialog and its strings/styles, needed by both stories and the Clear migration.

**⚠️ CRITICAL**: No user-story integration before this phase completes.

- [x] T002 [P] In `src/i18n/en.ts` and `src/i18n/uk.ts`: add `'confirm.removeChoice': 'Remove "{name}" and all its points? This can\'t be undone.'` / `'Видалити "{name}" і всі його пункти? Це не можна скасувати.'` (R2 wording — no point count, UA pluralization), `'confirm.cancel': 'Cancel'/'Скасувати'`, `'confirm.removeAction': 'Remove'/'Видалити'`, `'confirm.clearAction': 'Clear'/'Очистити'`. Keys in BOTH catalogs (parity test enforces, S3).
- [x] T003 [P] In `src/styles/app.css`: add `.modal--confirm { max-width: 360px; }` next to the existing `.modal` rules (~line 710) — base `.modal`/`.modal-overlay` rules from 014 reused as-is, NOT modified (contract D2).
- [x] T004 Create `src/components/ConfirmDialog.svelte`: Bits UI `Dialog` rendered inline (no Portal — copy the `SuggestDialog` pattern, `src/components/SuggestDialog.svelte:61–66`): `Dialog.Root open={open} onOpenChange={(v) => { if (!v) onCancel(); }}`, `Dialog.Overlay class="modal-overlay" data-action="confirm-dialog-backdrop"`, `Dialog.Content class="modal modal--confirm"`. **The message IS the accessible title**: render it inside `Dialog.Title` (these are one-sentence dialogs — no separate heading, no empty/undefined aria title; SuggestDialog:75 shows the localized-Title pattern). Below it, two equal-width buttons per the 011 `btn--half` pattern: Cancel (`data-action="confirm-dialog-cancel"`, calls `onCancel`) and destructive action (`data-action="confirm-dialog-confirm"`, label via prop, calls `onConfirm`). Props: `{ open, message, confirmLabel, onConfirm, onCancel }` (no `title` prop). Focus-trap/Esc/outside-click/scroll-lock/focus-return are the primitive's (D1) — do NOT hand-roll any of them (012 lesson).

**Checkpoint**: Component exists and compiles (`yarn tsc --noEmit` + `svelte-check` via build); behavior is proven through the call-site tests below.

---

## Phase 3: User Story 1 — Confirm before destroying entered points (Priority: P1) 🎯 MVP

**Goal**: ✕ on a Choice with ≥1 point opens the dialog; decline (Cancel/Esc/outside-click) is a deep-equal no-op; confirm removes with all existing post-removal behavior.

**Independent Test**: Add points to a Choice, click ✕ → dialog with the Choice's name; Cancel → board unchanged; ✕ → Remove → Choice gone (spec US1; quickstart M1).

### Tests for User Story 1 (write FIRST — must FAIL) ⚠️

- [x] T005 [US1] Create `tests/components/remove-choice.test.ts` (house pattern: render `App`, drive DOM; dialog renders inline so `container` queries reach it): (a) ✕ on a Choice with 2 points → `[data-action="confirm-dialog-confirm"]` visible, message contains the Choice title; board unchanged so far (B1); (b) untitled Choice → message contains the localized placeholder ("Choice N"); switch to UA → message + button labels in Ukrainian (B4, FR-007); (c) Cancel click → dialog closed, full `AppState` deep-equal to pre-click snapshot (B2, H2 — snapshot via `JSON.parse(JSON.stringify(getState()))` before the click) AND a `subscribePersist` counter registered before the flow stays 0 across open+cancel (B2's no-notification promise); (d) Esc keydown → same deep-equal no-op; (e) **outside-click decline**: pointer event on `[data-action="confirm-dialog-backdrop"]` → dialog closes, state deep-equal (the spec's outside-click-counts-as-declining edge case — the reason AlertDialog was rejected, R1). If Bits UI's outside-pointer logic proves un-simulatable in jsdom, fall back to manual M1 with an explicit skip-comment in the test — do NOT silently drop the case; (f) confirm click → Choice removed, an open point form tied to it closed, choice count drops (B3, FR-004); (g) neutral-only points still prompt (edge case). Run — MUST fail (✕ currently removes unconditionally).

### Implementation for User Story 1

- [x] T006 [US1] In `src/components/ChoiceCard.svelte`: add local state `let confirming = $state(false)`; ✕ click handler becomes `choice.notes.length > 0 ? (confirming = true) : removeChoice(choice.id)`; render `<ConfirmDialog open={confirming} message={t(lang, 'confirm.removeChoice', { name: choice.title || placeholder })} confirmLabel={t(lang, 'confirm.removeAction')} onConfirm={() => { confirming = false; removeChoice(choice.id); }} onCancel={() => (confirming = false)} />` (the `placeholder` derived already exists at line ~13). `data-action="remove-choice"` and disabled-at-MIN behavior unchanged (B6/S3). Run T005 — green; full `yarn vitest run` green.

**Checkpoint**: Pointed Choices are guarded (MVP). Empty-Choice behavior and Clear still as before.

---

## Phase 4: User Story 2 — Empty Choices keep frictionless removal (Priority: P2)

**Goal**: ✕ on a 0-point Choice removes instantly — no dialog, count read at click time.

**Independent Test**: Board with one empty and one pointed Choice: empty → instant, pointed → prompted (spec US2; quickstart M3).

### Tests for User Story 2 (regression lock — see note) ⚠️

- [x] T007 [US2] Extend `tests/components/remove-choice.test.ts`: (a) ✕ on a 0-point Choice → NO `[data-action="confirm-dialog-confirm"]` appears and the Choice is removed in the same tick (FR-002, SC-003); (b) add a point, delete that point, then ✕ → still NO dialog (count evaluated at click time, spec US2 scenario 2). NOTE: written after T006, these lock the guard's `> 0` condition — they may pass immediately if T006 was implemented correctly; that is acceptable evidence (locks, not red-first gates — say so in the test comment). If either FAILS, T006's condition is wrong — fix `ChoiceCard.svelte`, not the test.

**Checkpoint**: Both stories verifiable independently; all suites green.

---

## Phase 5: Cross-cutting — Clear migrates to the shared dialog (FR-010, Clarifications)

**Purpose**: One confirmation dialect product-wide; `window.confirm` count 1 → 0 (B6, SC-006).

### Tests (write FIRST — must FAIL) ⚠️

- [x] T008 Extend `tests/components/remove-choice.test.ts` (Clear-migration describe): with `vi.spyOn(window, 'confirm')` installed, click `[data-action="clear"]` → spy NEVER called (H3) and the shared dialog appears with the `confirm.clear` message; Cancel → board deep-equal unchanged; confirm → board reset to default while `view.theme` and `view.lang` survive (SC-006 — set `setTheme('dark')`/`setLang('uk')` first). Run — MUST fail (Clear still calls `window.confirm`).

### Implementation

- [x] T009 In `src/components/Toolbar.svelte`: replace the `window.confirm` Clear flow (line ~41) with local `let confirmingClear = $state(false)`; Clear button sets it true; render `<ConfirmDialog open={confirmingClear} message={t(lang, 'confirm.clear')} confirmLabel={t(lang, 'confirm.clearAction')} onConfirm={() => { confirmingClear = false; clearDilemma(); }} onCancel={() => (confirmingClear = false)} />`. Run T008 — green; `grep -rn "window.confirm" src/` → zero hits (B6). Full `yarn vitest run` green.

**Checkpoint**: No native prompts remain; both destructive actions share `ConfirmDialog`.

---

## Phase 6: Polish & Cross-Cutting Concerns

- [x] T010 Self-review the diff against contracts S1–S3/D1–D4: store mutations untouched; `SuggestDialog` untouched; `.modal`/`.modal-overlay` base rules unmodified; `data-action` hooks preserved; no hand-rolled focus/scroll logic anywhere in `ConfirmDialog.svelte`; no dependency changes.
- [ ] T011 Manual pass per `specs/016-confirm-remove-choice/quickstart.md` M1–M6 against `yarn dev`: dialog centered as a fixed top layer at ~360px and ≥1100px (never below the footer — the 014 regression shape), **background scroll-lock** while open (M2), focus returns to the trigger, stacking above an open note form (M4), Clear migration (M5), UA + both themes (M6). Honesty: placement/scroll-lock are manual-only evidence (H1).
- [x] T012 Gates: `yarn vitest run` + `yarn tsc --noEmit` + `yarn build` (svelte-check + vite) all green; no dependency changes → clean-install dimension re-proven by CI on push (013 lesson).

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: none.
- **Phase 2 (Foundational)**: after T001. T002 ∥ T003 ∥ T004 — three different files, fully parallel-safe (T004's class/key references resolve at runtime, not build time).
- **Phase 3 (US1)**: T005 (red) requires T002/T004 to exist for selectors? NO — write T005 first regardless (it fails on missing dialog, which IS the red state); T006 requires T002–T004.
- **Phase 4 (US2)**: T007 after T006 (locks the implemented condition).
- **Phase 5 (Clear)**: T008 (red) anytime after T004; T009 after T008 + T002.
- **Phase 6 (Polish)**: after all phases.

### Within-phase rules (TDD, NON-NEGOTIABLE)

- T005 and T008 observed RED before T006/T009 respectively.
- T007 is a regression lock (may pass immediately — documented in the test, no fake red).

### Parallel Opportunities

- T002 ∥ T003 ∥ T004 ∥ T005-authoring (four different files).
- T008-authoring ∥ T006 (same test file as T005/T007 — keep test-file edits sequential; parallel only with src edits).
- US1 → US2 → Clear is the natural serial spine; phases are small enough that parallelism beyond file-level isn't worth coordination.

---

## Parallel Example: Foundational + US1 red tests

```bash
# After T001, author concurrently (different files):
Task: "i18n confirm.* keys in src/i18n/en.ts + uk.ts"
Task: ".modal--confirm modifier in src/styles/app.css"
Task: "ConfirmDialog.svelte on Bits UI Dialog (SuggestDialog pattern)"
Task: "remove-choice.test.ts red suite (dialog open/cancel/Esc/confirm/neutral-only)"
# Then: T006 (ChoiceCard integration) → green
```

---

## Implementation Strategy

### MVP First (US1 only)

1. T001 → T002–T004 (foundation) → T005 (red) → T006 (green).
2. **STOP & VALIDATE**: pointed Choices guarded; ship-able even before Clear migrates.

### Incremental Delivery

1. + US2 (T007): empty-instant lock.
2. + Clear migration (T008–T009): native prompt count → 0.
3. Polish (T010–T012): contracts review, manual M1–M6, gates.

---

## Notes

- Total: **12 tasks** (US1: 2, US2: 1, foundational: 3, Clear migration: 2, setup/polish: 4).
- Commit in small logical increments; **do not commit unless the user asks**.
- Every checkpoint = `yarn vitest run` + `yarn tsc` green.
