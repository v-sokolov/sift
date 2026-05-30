---

description: "Task list for Sift MVP implementation"
---

# Tasks: Sift MVP

**Input**: Design documents from `/specs/001-sift-mvp/`

**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅

**Tests**: INCLUDED. The plan and every contract define explicit "Test expectations",
and the design centers on pure, unit-testable logic — so unit + DOM tests are part of
each relevant story. Write tests first within a story and ensure they fail before
implementing.

**Organization**: Tasks are grouped by user story (US1–US4 from spec.md) so each story
is independently implementable and testable.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: Which user story the task serves (US1, US2, US3, US4)
- Exact file paths are included in each description

## Path Conventions

Single-project frontend layout at repository root (per plan.md): `index.html`, `src/`,
`src/render/`, `src/styles/`, `tests/unit/`, `tests/dom/`.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and tooling

- [X] T001 Create project structure per plan.md: `index.html`, `src/`, `src/render/`, `src/styles/`, `tests/unit/`, `tests/dom/`
- [X] T002 Initialize project (yarn) with TypeScript 5 (strict) + Vite 5: create `package.json` (scripts: `dev`, `build`, `preview`, `test`, `test:watch`), `tsconfig.json` (strict, ES2022), `vite.config.ts`
- [X] T003 [P] Configure Vitest + jsdom in `vite.config.ts` (test block: `environment: 'jsdom'`, include `tests/**`) and add `vitest` + `jsdom` dev deps
- [X] T004 [P] Create `index.html` with `<div id="app">` root and `<script type="module" src="/src/main.ts">`, linking `src/styles/main.css`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Shared core that every user story builds on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T005 [P] Define all domain types in `src/types.ts` per data-model.md: `NoteType`, `Weight`, `Note`, `Choice`, `Dilemma`, `ViewMode`, `SortKey`, `Direction`, `ViewPrefs`, `AppState`, `EditTarget`, `NoteDraft`, `PersistedV1`
- [X] T006 [P] Implement `crypto.randomUUID()` wrapper in `src/ids.ts` (single seam for ID generation)
- [X] T007 [P] Create design tokens in `src/styles/tokens.css`: color/spacing/type tokens, accessible weight colors, light/dark variables via `prefers-color-scheme` and `[data-theme]`
- [X] T008 [P] Create base layout in `src/styles/main.css`: app container, choice columns grid `repeat(N, 1fr)`, and the 720px breakpoint switching columns→vertical stack (research R4)
- [X] T009 Implement store core in `src/state.ts` per contracts/state-store.md: `getState()`, `update(producer)` (bump `dilemma.updatedAt` + notify), `subscribe(cb)`/unsubscribe, `setState(next)`; freeze state in dev (depends on T005)
- [X] T010 Implement `emptyDilemma()` factory + initial `AppState` in `src/state.ts`: two starter choices (blank titles), default `ViewPrefs` (`mode:'default'`, `sortKey:'weight'`, `direction:'desc'`, `theme:'system'`), `editing:null`, `lastSavedAt:null` (depends on T009, T006)
- [X] T011 Create render orchestrator shell `src/render/index.ts`: `renderApp(root, state)` that calls region render stubs in order (header → toolbar → choices → summary → addForm → footer) (depends on T009)
- [X] T012 Create boot in `src/main.ts`: mount `#app`, `subscribe(renderApp)`, initialize with `setState(emptyDilemma())`, attach the single delegated listener root on `#app` (depends on T011, T010)

**Checkpoint**: App boots to an empty board; foundation ready for stories.

---

## Phase 3: User Story 1 - Weigh a decision and see a quiet score (Priority: P1) 🎯 MVP

**Goal**: State a question, add 2–4 choices, capture typed/weighted notes via the unified
form, and see a quiet live per-choice score with for/against totals and a gentle leader highlight.

**Independent Test**: Enter a question, add a third choice (count `3 / 4`), add an
advantage `●●●` and a disadvantage `●` → score `+2`, totals `3 / 1`; add a neutral note →
numbers unchanged; the top choice is highlighted (ties highlight all).

### Tests for User Story 1 ⚠️ (write first, ensure they FAIL)

- [X] T013 [P] [US1] Scoring unit tests in `tests/unit/scoring.test.ts` per contracts/scoring.md: `forTotal`/`againstTotal`/`choiceScore`, neutral exclusion (S1), worked examples (Acme/Globex/Initech), `leaders` ties (S4), all-zero → ∅ (S5)
- [X] T014 [P] [US1] DOM flow test in `tests/dom/flow.test.ts`: add choice, open form, add weighted notes, assert score/totals text and leader highlight update live

### Implementation for User Story 1

- [X] T015 [P] [US1] Implement pure scoring in `src/scoring.ts`: `forTotal`, `againstTotal`, `choiceScore`, `leaders(choices)` (no I/O, neutral excluded) per contracts/scoring.md
- [X] T016 [US1] Add content mutations to `src/state.ts`: `setDilemmaTitle`, `addChoice` (no-op at 4 — I9), `renameChoice`, `removeChoice` (no-op at 2 — I8), `addNote`/`updateNote` (force `weight:null` when `type:'neutral'` — I2), `removeNote`, `openAddForm`/`openEditForm`/`closeForm` (depends on T010)
- [X] T017 [P] [US1] Implement `src/render/note.ts`: render a note's sign (`+`/`−`/`~`) + color + weight dots (●/●●/●●●) + text per FR-012
- [X] T018 [US1] Implement `src/render/header.ts`: editable dilemma title with ghost placeholder "What are you deciding?" (FR-001)
- [X] T019 [US1] Implement `src/render/choice.ts`: choice card with editable title, rename (`✎`) and remove (`✕`, disabled at 2 choices), notes list in creation order, calm "No notes yet" empty state (depends on T017)
- [X] T020 [US1] Implement `src/render/addForm.ts` unified add/edit form: choice dropdown, type segmented control, weight segmented control (greys out when type=neutral — FR-011), textarea, Cancel/Add; stays open after Add (FR-009, FR-010)
- [X] T021 [US1] Implement `src/render/toolbar.ts` (US1 slice): `＋ Add choice` with live `N / 4` count, disabled at `4 / 4` with max tooltip (FR-004, FR-005)
- [X] T022 [US1] Implement `src/render/summary.ts`: per-choice quiet score (signed `+N`/`−N`/`0`) + for/against totals, gentle leader highlight via `scoring.leaders` incl. ties (FR-016, FR-017) (depends on T015)
- [X] T023 [US1] Wire US1 in `src/render/index.ts` (region order) and `src/main.ts` delegated listeners: title edit, add/rename/remove choice, open/edit/close form, add/update/remove note; preserve focus/caret of the actively-edited field across re-render (research R8) (depends on T016, T018–T022)

**Checkpoint**: US1 fully functional — Sift is a usable MVP (no persistence yet).

---

## Phase 4: User Story 2 - Keep my work without an account (Priority: P2)

**Goal**: Auto-save the dilemma + view prefs locally, restore on reload, show a quiet
"Saved" indicator, and Clear back to the empty default (with confirm). No account/network.

**Independent Test**: Create a dilemma with notes, reload → fully restored; Clear + confirm
→ empty default (blank question, two empty starter choices, scores `0`); Clear + cancel → unchanged.

### Tests for User Story 2 ⚠️ (write first, ensure they FAIL)

- [X] T024 [P] [US2] Persistence unit tests in `tests/unit/persistence.test.ts` per contracts/persistence.md: `flushSave`→`load` round-trip, corruption (`"not json"`, `{schemaVersion:99}`, choices length 1) → `null`, debounce coalesces N writes into 1, unload flush writes through a pending debounce
- [X] T025 [P] [US2] DOM lifecycle test in `tests/dom/lifecycle.test.ts`: restore-on-boot from seeded `localStorage`; Clear-confirm resets to empty default; Clear-cancel leaves state unchanged

### Implementation for User Story 2

- [X] T026 [P] [US2] Implement `src/persistence.ts` per contracts/persistence.md: `STORAGE_KEY='sift.v1'`, `DEBOUNCE_MS=400`, `scheduleSave`, `flushSave`, defensive `load()` (returns null on missing/invalid), `installUnloadFlush`, `PersistedV1` envelope; swallow write failures (P5)
- [X] T027 [US2] Add to `src/state.ts`: `clearDilemma()` → full reset to `emptyDilemma()` default state, erasing all data incl. `view.theme` (FR-027); maintain `lastSavedAt`
- [X] T028 [US2] Update `src/main.ts` boot: on start `load()` → `setState(restored)` else `emptyDilemma()`; `subscribe(scheduleSave)`; `installUnloadFlush`; set `lastSavedAt` after each successful save (depends on T026)
- [X] T029 [US2] Extend `src/render/toolbar.ts`: right-side `Clear` button and quiet **Saved** indicator driven by `lastSavedAt` (FR-026, FR-027) (depends on T021)
- [X] T030 [US2] Wire the Clear confirm flow in `src/main.ts`: "Clear this dilemma? This can't be undone." → on confirm, `clearDilemma()` (FR-027). Clear is the only start-over action in v1; no separate new-dilemma flow (FR-028) (depends on T028, T029)

**Checkpoint**: US1 + US2 work — reflection survives reloads and can be reset cleanly.

---

## Phase 5: User Story 3 - Organize notes to make sense of them (Priority: P3)

**Goal**: Group (Advantages → Disadvantages → Neutral) or Sort (by weight/type, asc/desc)
notes via mutually-exclusive toggles, applied to all choices and remembered across sessions.

**Independent Test**: With mixed notes, Group → fixed sections in chosen direction; Sort →
Group turns off, notes flatten and order by key+direction; reload → mode/key/direction restored.

### Tests for User Story 3 ⚠️ (write first, ensure they FAIL)

- [X] T031 [P] [US3] View unit tests in `tests/unit/view.test.ts` per contracts/view.md: default = creation order; grouped section order + within-section weight ordering by direction + neutral keeps creation order; sorted by weight/type asc+desc; stable tie → creation order (V1–V4)

### Implementation for User Story 3

- [X] T032 [P] [US3] Implement pure `src/view.ts`: `arrange(choice, prefs) → Section[]` for default/grouped/sorted with stable sort per contracts/view.md
- [X] T033 [US3] Add to `src/state.ts`: `setViewMode` (enforce Group/Sort mutual exclusion — G3), `setSortKey`, `setDirection`
- [X] T034 [US3] Extend `src/render/toolbar.ts`: row-1 `Group` and `Sort` mutually-exclusive toggles; row-2 config (visible only when active — FR-023): Sort → `By: Weight|Type` + `Direction: Asc|Desc`; Group → `Direction: Asc|Desc` (depends on T021, T029)
- [X] T035 [US3] Update `src/render/choice.ts` to render notes via `view.arrange()` and show group section labels in grouped mode (depends on T032, T019)
- [X] T036 [US3] Wire view-pref events in `src/main.ts` (toolbar toggles/config) and ensure `scheduleSave` persists `view` changes; confirm reload restores view prefs (FR-022, FR-024) (depends on T028, T033, T034)

**Checkpoint**: US1 + US2 + US3 work — notes can be grouped/sorted and the choice persists.

---

## Phase 6: User Story 4 - Read it comfortably and accessibly (Priority: P3)

**Goal**: Light/dark themes, weight never by color alone, keyboard-operable form (Esc closes),
calm empty states, and a quiet author footer.

**Independent Test**: Toggle light/dark and confirm legibility; read every weight by dot count
alone; open form, press Esc → closes; view a fresh board → ghost placeholders, "No notes yet".

### Implementation for User Story 4

- [X] T037 [US4] Theme support: add `setTheme` to `src/state.ts` (persist in `ViewPrefs.theme`), apply `[data-theme]` + `prefers-color-scheme` in `src/styles/main.css`, add a quiet theme toggle control and wire it in `src/main.ts` (FR-030, R7)
- [X] T038 [P] [US4] Verify/finish weight = dot-count AND color in `src/render/note.ts` and the addForm weight control, never color alone (FR-031) (depends on T017, T020)
- [X] T039 [US4] Make `src/render/addForm.ts` fully keyboard-operable and close on Esc; manage focus when opening/closing (FR-032) (depends on T020)
- [X] T040 [US4] Finalize calm empty/placeholder states across `src/render/header.ts` and `src/render/choice.ts`: ghost title, placeholder choice names, "No notes yet", never-collapsed cards (FR-033, FR-029) (depends on T018, T019)
- [X] T041 [P] [US4] Add quiet author footer render in `src/render/index.ts` (one sentence, FR-034)
- [X] T042 [P] [US4] Contrast pass on `src/styles/tokens.css`: ensure weight colors + text meet WCAG AA in both themes (depends on T007)

**Checkpoint**: All four user stories functional, accessible, and calm.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Hardening and validation across stories

- [X] T043 [P] Add edge-case unit tests in `tests/unit/`: all-zero board (no leader), tie leaders, add-at-4 / remove-at-2 guards (I8/I9)
- [ ] T044 Verify production build: `yarn build` type-checks and emits static `dist/`; `yarn preview` serves it
- [ ] T045 Run `quickstart.md` manual smoke test covering US1–US4 acceptance scenarios
- [ ] T046 [P] Performance check (edit→repaint within one frame at max scale) and code cleanup across `src/`
- [ ] T047 [P] Accessibility audit: full keyboard navigation, dot-not-color verification, contrast in light/dark

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Setup — BLOCKS all user stories
- **User Stories (Phase 3–6)**: All depend on Foundational
  - US1 (P1) has no dependency on other stories (pure MVP)
  - US2/US3/US4 build on US1's rendered surface (shared files: `state.ts`, `main.ts`, `render/toolbar.ts`, `render/choice.ts`) → run them **sequentially in priority order**, not concurrently, to avoid same-file conflicts
- **Polish (Phase 7)**: Depends on the desired stories being complete

### User Story Dependencies

- **US1 (P1)**: Foundational only. Independently testable.
- **US2 (P2)**: Foundational + US1 surface (toolbar/main boot). Independently testable.
- **US3 (P3)**: Foundational + US1 (choice render, toolbar) + uses US2 persistence to remember prefs (still testable in-memory).
- **US4 (P3)**: Foundational + US1 render files (note/header/choice/addForm) + US2/US3 view prefs for theme persistence.

### Within Each User Story

- Tests first (must fail) → pure logic → render → wiring/integration.
- `scoring.ts` (T015) before `summary.ts` (T022); `view.ts` (T032) before `choice.ts` view update (T035); `persistence.ts` (T026) before boot wiring (T028).

### Parallel Opportunities

- Setup: T003, T004 in parallel after T002.
- Foundational: T005, T006, T007, T008 in parallel; T009→T010, T011→T012 follow.
- US1: T013, T014 (tests) parallel; T015 and T017 parallel; render files largely parallel except shared `state.ts`/`index.ts`/`main.ts`.
- US2: T024, T025, T026 parallel.
- US3: T031, T032 parallel.
- Polish: T043, T046, T047 parallel.

---

## Parallel Example: User Story 1

```bash
# Tests for US1 together (write first, expect failure):
Task: "Scoring unit tests in tests/unit/scoring.test.ts"
Task: "DOM flow test in tests/dom/flow.test.ts"

# Independent implementation files in parallel:
Task: "Implement pure scoring in src/scoring.ts"
Task: "Implement src/render/note.ts (sign + color + weight dots)"
```

---

## Implementation Strategy

### MVP First (User Story 1 only)

1. Phase 1 Setup → 2. Phase 2 Foundational → 3. Phase 3 US1 →
4. **STOP & VALIDATE**: run T013/T014, smoke-test the weighing loop → deployable MVP.

### Incremental Delivery

Setup + Foundational → **US1 (MVP, demo)** → **US2** (persistence) → **US3** (organize) →
**US4** (a11y/theme) → Polish. Each story adds value without breaking earlier ones.

---

## Notes

- [P] = different files, no incomplete dependencies. Shared files (`state.ts`, `main.ts`,
  `render/toolbar.ts`, `render/choice.ts`) grow across stories → those tasks are **not** [P]
  across stories; run sequentially in priority order.
- [Story] labels trace each task to a spec user story (US1–US4).
- Verify tests fail before implementing (TDD within each story).
- Per project preference, do NOT auto-commit — commit only when explicitly asked.
- Stop at any checkpoint to validate a story independently.
