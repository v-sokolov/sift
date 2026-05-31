# Tasks: Save-Status Indicator & Header/Footer Polish

**Feature**: `010-save-status-indicator` | **Spec**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md)

**Inputs**: research.md (R1–R7), data-model.md (`SaveStatus` + runtime `AppState.status`),
contracts/{save-status,ui-presentation}.md, quickstart.md.

**Conventions**: Single-project Svelte SPA. Package manager is **yarn**. Tests: `yarn test`
(vitest); typecheck: `yarn check` (svelte-check — there is **no** `yarn typecheck`). Test-first is
**mandatory** (Constitution IV): every test task is authored to fail against current code, then the
implementation task turns it green. No merge with red tests or type errors.

**Story mapping**: US1/US2/US3 are the save-status indicator (spec User Stories 1–3). **US4** is the
bundled header/footer presentation pass (spec FR-014/015/016 — no spec user story; grouped here for
execution).

---

## Phase 1: Setup

- [X] T001 Establish a green baseline before any change: run `yarn test` and `yarn check` and confirm both pass (record current counts) so later red tests are demonstrably new.

## Phase 2: Foundational (blocking prerequisites for US1–US3)

- [X] T002 [P] Add `export type SaveStatus = 'hidden' | 'editing' | 'saved';` and a `status: SaveStatus` field on `AppState` in `src/types.ts` (do not add it to `PersistedV1`).
- [X] T003 Initialize `status: 'hidden'` in `emptyDilemma()` in `src/store.svelte.ts` (depends on T002).
- [X] T004 [P] Change `DEBOUNCE_MS` from `400` to `2000` in `src/persistence.ts`.
- [X] T005 [P] Add i18n key `'toolbar.editing': 'Editing'` to `src/i18n/en.ts`.
- [X] T006 [P] Add i18n key `'toolbar.editing': 'Редагування'` to `src/i18n/uk.ts` (keeps EN/UK key parity).

**Checkpoint**: types compile; the new field exists and defaults to `'hidden'`; debounce is 2s;
both catalogs carry `toolbar.editing`. The indicator is not yet wired — that is US1.

---

## Phase 3: User Story 1 — See whether my work is saved (Priority: P1) 🎯 MVP

**Goal**: Content edits show "Editing" (yellow) immediately; after the 2s settle and store, show
"Saved" (green). Edits coalesce into one write.

**Independent test**: Edit the title / add a point → "Editing" + yellow dot; wait 2s → "Saved" +
green dot; reload → content persisted.

### Tests (write first — must fail)

- [X] T007 [P] [US1] In `tests/components/store.test.ts`, add cases: each of the 8 content mutations (`setDilemmaTitle`, `addChoice`, `renameChoice`, `removeChoice`, `addNote`, `updateNote`, `removeNote`, `submitForm` commit) sets `status === 'editing'`; and `setLastSaved(ts)` flips `'editing' → 'saved'` (and sets `lastSavedAt`).
- [X] T008 [P] [US1] In `tests/unit/persistence.test.ts`, assert `DEBOUNCE_MS === 2000` and, with fake timers, that N rapid `scheduleSave` calls within one window produce exactly one `write`/`onSaved` (SC-006).
- [X] T009 [P] [US1] In `tests/components/toolbar.test.ts`, add cases: with `status='editing'` the toolbar shows the "Editing" label + a dot carrying the editing modifier class; with `status='saved'` it shows "Saved" + a dot with the saved modifier class. (Dot marked `aria-hidden`; label inside the `aria-live="polite"` span.)

### Implementation (make tests pass)

- [X] T010 [US1] In `src/store.svelte.ts`, add a small `markEditing(d)` helper and set `status = 'editing'` on the content-mutating path of the 8 content mutations only (not on guard no-ops like `addChoice` at max, empty-text `addNote`, empty-draft `submitForm`).
- [X] T011 [US1] In `src/store.svelte.ts`, change `setLastSaved(ts)` to set `status = 'saved'` **only when** current `status === 'editing'` (leave `lastSavedAt` assignment and no-save behaviour intact). Depends on T010 (same file).
- [X] T012 [US1] In `src/components/Toolbar.svelte`, derive the indicator from `s.status` (not `lastSavedAt`): render the localized "Editing"/"Saved" label inside the existing `aria-live="polite"` span plus a decorative dot element; keep `data`-hooks stable for tests.
- [X] T013 [US1] In `src/styles/app.css`, add `.status-dot` and `.status-dot--editing` (yellow) / `.status-dot--saved` (green) using theme tokens, meeting WCAG AA contrast in light and dark; keep/repurpose the existing `.saved` text styling.

**Checkpoint**: US1 tests green; editing→saved works on device with the 2s settle.

---

## Phase 4: User Story 2 — Preferences don't masquerade as unsaved work (Priority: P2)

**Goal**: Language, Theme, Sort, Group, Mode, Direction (and transient form actions) never flip the
indicator to "Editing"; they still persist silently.

**Independent test**: From any resting state, change theme/lang/sort/group → status unchanged;
reload → preferences remembered.

### Tests (write first — must fail if a preference path ever touches status)

- [X] T014 [P] [US2] In `tests/components/store.test.ts`, add cases asserting that each preference mutation (`setLang`, `setTheme`, `cycleTheme`, `toggleGroup`, `toggleSort`, `setSortKey`, `setDirection`, `setGroupKey`) and each transient-form mutation (`openAddForm`, `openEditForm`, `closeForm`, `setFormChoice`, `setFormType`, `setFormWeight`, `setFormText`) leaves `status` unchanged when starting from `'hidden'`, `'editing'`, and `'saved'`.
- [X] T015 [P] [US2] In `tests/components/store.test.ts`, add a case: with `status === 'hidden'`, calling `setLastSaved(ts)` (the save-completion that a preference change would trigger) leaves `status === 'hidden'` (guard prevents a false "Saved").

### Implementation

- [X] T016 [US2] Review `src/store.svelte.ts` and confirm no preference/transient mutation writes `status` (the US1 design already satisfies this); make any correction needed so T014/T015 pass. Depends on T010/T011 (same file).

**Checkpoint**: US2 tests green; toggling theme/lang/sort on an empty or saved board never shows
"Editing"/false "Saved".

---

## Phase 5: User Story 3 — Clean default at first open and after Clear (Priority: P3)

**Goal**: Nothing rendered (no dot/text) on fresh open and right after Clear; the indicator
reappears on the next content edit.

**Independent test**: Fresh load → no indicator; edit → appears; Clear → disappears; edit → reappears.

### Tests (write first — must fail)

- [X] T017 [P] [US3] In `tests/components/store.test.ts`, add cases: a fresh `emptyDilemma()` has `status === 'hidden'`; `clearDilemma()` from `'editing'` and from `'saved'` yields `status === 'hidden'`.
- [X] T018 [P] [US3] In `tests/components/toolbar.test.ts`, add a case: with `status === 'hidden'` the toolbar status slot renders no dot and no label text.

### Implementation

- [X] T019 [US3] In `src/store.svelte.ts`, confirm `clearDilemma()` results in `status === 'hidden'` (via `emptyDilemma()` from T003); adjust if needed. Depends on T010/T011 (same file).
- [X] T020 [US3] In `src/components/Toolbar.svelte`, ensure the `'hidden'` branch renders neither dot nor text (part of the T012 derivation); verify against T018. Depends on T012 (same file).

**Checkpoint**: US3 tests green; default and post-Clear states show nothing on device.

---

## Phase 6: User Story 4 — Header/Footer polish (presentation; FR-014/015/016)

**Goal**: Footer drops the author credit (keeps the book); favicon sits left of "Sift" (decorative);
"Suggest a feature" button moves into the brand row (space-between, rendered once).

**Independent test**: Footer shows no author name in either language; favicon appears beside "Sift";
one Suggest button at the far right of the brand row, still opening the dialog.

### Tests (write first — must fail)

- [X] T021 [P] [US4] In `tests/components/i18n.test.ts`, add a case: the rendered footer contains "Essentialism" and does NOT contain "Greg McKeown" (EN) nor "Мак-Кеоуна" (UK).
- [X] T022 [P] [US4] In `tests/components/flow.test.ts`, add cases: exactly one `[data-action="open-suggest"]` button exists and is within the header brand row; a decorative favicon image (`alt=""`/`aria-hidden`) is present beside the "Sift" wordmark.

### Implementation

- [X] T023 [P] [US4] In `src/i18n/en.ts`, change `'footer.inspiredPre'` from `"Inspired by Greg McKeown's "` to `"Inspired by the "` (leave `footer.inspiredBook`/`footer.inspiredPost` so it reads "Inspired by the Essentialism book.").
- [X] T024 [P] [US4] In `src/i18n/uk.ts`, change `'footer.inspiredPost'` from `" Ґреґа Мак-Кеоуна."` to `"."` (leave pre/book so it reads "Натхненна книжкою Essentialism.").
- [X] T025 [US4] In `src/components/Header.svelte`, add a decorative favicon (`/favicon.svg`, `alt=""`/`aria-hidden`) immediately left of `<h1 class="header__wordmark">`, and move the existing `data-action="open-suggest"` button out of `header__bar` into the brand row (rendered once; behaviour unchanged).
- [X] T026 [US4] In `src/styles/app.css`, lay out the brand row with `justify-content: space-between` (brand group left, Suggest button right), size the favicon to balance the 1.5rem wordmark, and keep the responsive header behaviour. Depends on T013 (same file).

**Checkpoint**: US4 tests green; header/footer render as specified in both languages and both themes.

---

## Phase 7: Polish & Cross-Cutting

- [X] T027 Run `yarn test` — entire suite green (existing + new).
- [X] T028 Run `yarn check` — 0 svelte-check/type errors.
- [ ] T029 Manual on-device pass with `yarn dev` against `quickstart.md` (rows 1–10), including a color-vision/screen-reader sanity check of the dot+label (SC-005) in both light and dark themes.
- [X] T030 [P] Append a short "post-implementation verification" note to `specs/010-save-status-indicator/research.md` (results, any deviations).

---

## Dependencies & Execution Order

- **Setup (T001)** → **Foundational (T002–T006)** → **US1 (T007–T013)** → **US2 (T014–T016)** →
  **US3 (T017–T020)** → **US4 (T021–T026)** → **Polish (T027–T030)**.
- US2 and US3 depend on the US1 status field/transitions and the Toolbar derivation; they mostly add
  guarding tests and confirm behaviour. US4 is independent of US1–US3 and could run any time after
  Setup, but is sequenced last to keep the core MVP first.
- Same-file sequencing: `src/store.svelte.ts` (T003 → T010 → T011 → T016 → T019),
  `src/components/Toolbar.svelte` (T012 → T020), `src/styles/app.css` (T013 → T026),
  `tests/components/store.test.ts` (T007 → T014/T015 → T017),
  `tests/components/toolbar.test.ts` (T009 → T018).

## Parallel Execution Examples

- **Foundational**: T002, T004, T005, T006 in parallel (distinct files: types.ts, persistence.ts,
  en.ts, uk.ts); T003 after T002.
- **US1 tests**: T007, T008, T009 in parallel (store.test.ts, persistence.test.ts, toolbar.test.ts).
- **US4**: T021 ∥ T022 (tests, distinct files); T023 ∥ T024 (en.ts ∥ uk.ts) after their tests.

## Implementation Strategy

- **MVP = User Story 1** (Phases 1–3): the three-state indicator with the 2s settle — the core,
  independently demonstrable value.
- **Incremental**: add US2 (preference exclusion) and US3 (hidden default) as guarding refinements,
  then US4 (header/footer polish). Each phase ends green before the next begins.

## Notes

- No new runtime dependencies (Constitution III). Pure core (scoring/`arrange`) untouched
  (Constitution IV). `status` is runtime-only — `PersistedV1`/`schemaVersion` unchanged (FR-013).
- If a test file path above doesn't yet contain a footer/header case, add it to the named file rather
  than creating a new file, to keep the suite layout stable.
