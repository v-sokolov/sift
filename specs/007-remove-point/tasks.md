# Tasks: Remove Point & Preserve Preferences on Clear

**Feature**: `007-remove-point` | **Branch**: `007-remove-point`
**Input**: `specs/007-remove-point/` — plan.md, spec.md, research.md, data-model.md,
contracts/{remove-point,clear-preferences}.md, quickstart.md

**Test policy**: TDD is mandatory (Constitution Principle IV, NON-NEGOTIABLE). Both behavior
changes are covered by tests written to **fail first**, then made green. Pixel/touch/on-device
checks are not jsdom-assertable → quickstart manual matrix.

**Commands** (offline sandbox — run binaries directly):
`node_modules/.bin/vitest run` · `node_modules/.bin/svelte-check` · `node_modules/.bin/vite build`

> **No Foundational phase**: US1 (remove point) and US2 (Clear preserves prefs) are independent
> and need no shared blocking prerequisite. They do share two files (`src/store.svelte.ts`,
> `tests/components/store.test.ts`), so those specific tasks are sequenced — see Dependencies.

---

## Phase 1: Setup

- [X] T001 Confirm the baseline is green before any change: run `node_modules/.bin/vitest run` and `node_modules/.bin/svelte-check` from repo root and record that both pass (this is the FR-015 baseline the feature must preserve).

---

## Phase 2: User Story 1 — Remove a point (Priority: P1) 🎯 MVP

**Goal**: Every point row shows an always-visible ✕ that removes that one point immediately,
operable by pointer + keyboard, labeled for assistive tech, and never triggering row-edit.

**Independent test**: Add ≥2 points to a choice, activate the ✕ on one → it disappears
immediately, others/order/rest of decision unchanged, no confirm; works via click, tap, and
Enter/Space.

### Tests for User Story 1 (write first — MUST fail before implementation) ⚠️

- [X] T002 [P] [US1] In `tests/components/store.test.ts`, add a test that `removeNote` on the currently-edited note resets the form: open edit (`openEditForm(cid, nId)`), `removeNote(cid, nId)`, then assert `getState().editing` is the closed state and the note is gone; add a sibling assertion that removing a *non-edited* note leaves an open `editing` untouched. Run and confirm the first assertion FAILS against current code (FR-011).
- [X] T003 [P] [US1] In `tests/components/note-row.test.ts` (create if absent, using the `tests/svelte.ts` mount helper), add tests covering: (a) activating the ✕ via **click** removes the point (note absent from the choice / row gone) — FR-003; (b) activating the ✕ via **keyboard** (`Enter`, and separately `Space`) also removes the point, identical to click — FR-008; (c) activating the ✕ (click or key) does NOT open the edit form (`editing` stays closed) — FR-010; (d) the ✕ exposes the localized `note.removeAria` label — FR-009; (e) after removing a weighted advantage, the choice's derived score/totals reflect the removed point being gone — FR-005/SC-004. Confirm these FAIL before implementation.

### Implementation for User Story 1

- [X] T004 [P] [US1] In `src/i18n/en.ts`, add key `note.removeAria` with value `Remove point` (authoritative catalog).
- [X] T005 [P] [US1] In `src/i18n/uk.ts`, add key `note.removeAria` with value `Видалити пункт` (mirror — keeps i18n parity test green).
- [X] T006 [US1] In `src/store.svelte.ts`, extend `removeNote(choiceId, noteId)` with the FR-011 guard: within the same `update(...)`, if `d.editing?.kind === 'edit' && d.editing.noteId === noteId`, reset `d.editing` to the closed state and `d.draft` to its empty default (match how `closeForm` resets them); keep the existing `notes.filter` + `touch(d)`. Make T002 pass. *(Sequenced before T011 — same file.)*
- [X] T007 [US1] In `src/components/NoteRow.svelte`, import `removeNote`; add a trailing real `<button class="iconbtn note__remove" data-action="remove-note" data-note-id={note.id} aria-label={t(lang,'note.removeAria')} title={t(lang,'note.removeAria')}>✕</button>` inside the `.note` `<li>`; add a `remove(e)` handler that calls `e.stopPropagation()` then `removeNote(choiceId, note.id)`, and an `onRemoveKeydown(e)` that calls `e.stopPropagation()` on Enter/Space so the row's edit keydown does not also fire (FR-002, FR-003, FR-008, FR-010). Make T003 pass.
- [X] T008 [US1] In `src/styles/app.css`, seat `.note__remove` in the `.note` row layout (it reuses `.iconbtn`, which already carries the 006 44px/`:focus-visible`/`@media (hover)` rules); set a de-emphasized resting color (e.g. `var(--text-faint)`) and ensure it does not overlap the row's edit tap area (FR-012, FR-013, SC-006).
- [X] T009 [US1] Run `node_modules/.bin/vitest run` and `node_modules/.bin/svelte-check`; confirm T002/T003 now pass and the full suite + type-check are green.

**Checkpoint**: US1 is independently shippable — the MVP (remove a point) works end to end.

---

## Phase 3: User Story 2 — Clear keeps Theme and Language (Priority: P2)

**Goal**: "Clear" empties decision content but preserves the user's Theme and Language (and they
persist across reload). The one intentional behavior change in the feature.

**Independent test**: Set theme=dark, lang=uk, add content, Clear → board empties, theme stays
dark, language stays uk, surviving a reload.

### Tests for User Story 2 (write first — MUST fail before implementation) ⚠️

- [X] T010 [US2] In `tests/components/store.test.ts`, add a test `clearDilemma preserves theme and language`: `setTheme('dark')`, `setLang('uk')`, add a note, `clearDilemma()`, then assert `view.theme === 'dark'`, `view.lang === 'uk'`, choices' notes empty, title `''`. Confirm the theme assertion FAILS against current code (theme currently resets to `system`). *(Sequenced after T002 — same file.)*

### Implementation for User Story 2

- [X] T011 [US2] In `src/store.svelte.ts`, amend `clearDilemma()` to also preserve theme: read `const { lang, theme } = current.view;`, set `fresh.view.lang = lang;` and `fresh.view.theme = theme;`, and update the doc-comment to say it preserves language AND theme (FR-016/017/018). Make T010 pass. *(Sequenced after T006 — same file.)*
- [X] T012 [US2] Confirm the pre-existing `clearDilemma preserves language` test still passes unchanged (FR-015) and run `node_modules/.bin/vitest run` + `node_modules/.bin/svelte-check` green.

**Checkpoint**: US2 complete; both stories integrated.

---

## Phase 4: Polish & Cross-Cutting

- [X] T013 Run the full gate: `node_modules/.bin/vitest run` (all green, including the new tests), `node_modules/.bin/svelte-check` (0 errors/0 warnings), `node_modules/.bin/vite build` (succeeds).
- [X] T014 Verify the FR-014/FR-015 invariants by inspection: no change to data model, scoring, or persisted `sift.v1` shape; no existing i18n key's meaning changed; only `note.removeAria` added (present in both catalogs); the only behavior change is Clear preserving theme.
- [ ] T015 Walk the `quickstart.md` acceptance matrix (rows 1–15) on one desktop browser and one real/emulated mobile viewport, in both light and dark themes — focus on the non-jsdom rows: ✕ always visible at rest (1), 44px touch target (10), touch-without-hover (11), and persistence rows (9, 14).

---

## Dependencies & Execution Order

- **Setup (T001)** → **US1 (T002–T009)** → **US2 (T010–T012)** → **Polish (T013–T015)**.
- **No Foundational phase** — US1 and US2 are functionally independent. They share two files, so:
  - `src/store.svelte.ts`: **T006 (US1 guard) → T011 (US2 clear)** must be sequential (same file).
  - `tests/components/store.test.ts`: **T002 (US1) → T010 (US2)** sequential (same file).
- **MVP = Phase 1 + Phase 2 (US1)**. Shipping after T009 delivers the whole "remove point" value;
  US2 is an independent follow-on fix.

### Parallel opportunities

- **US1 tests**: T002 and T003 are different files → can run in parallel `[P]`.
- **i18n**: T004 (`en.ts`) and T005 (`uk.ts`) are different files → `[P]`.
- T007 (`NoteRow.svelte`) and T008 (`app.css`) touch different files and can proceed in parallel
  once their test (T003) exists, though both are needed for T009 to pass.
- US2 has no internal parallelism (its two code/test tasks share files with US1 and each other).

### Suggested MVP scope

User Story 1 (remove a point) — Phases 1 + 2. Independently testable and the core deliverable.
