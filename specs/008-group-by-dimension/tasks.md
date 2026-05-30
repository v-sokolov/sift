# Tasks: Group by Dimension & Add-Point Placement

**Feature**: `008-group-by-dimension` | **Branch**: `008-group-by-dimension`
**Input**: `specs/008-group-by-dimension/` — plan.md, spec.md, research.md (R1–R10),
data-model.md, contracts/{arrange-grouping,group-toolbar,addpoint-order}.md, quickstart.md

**Test policy**: TDD is mandatory (Constitution Principle IV, NON-NEGOTIABLE). Every behaviour
change is covered by tests written to **fail first**, then made green. The grouped cases in
`tests/unit/view.test.ts` pin the OLD direction-driven contract — they are **migrated** to the new
`groupKey` contract (a sanctioned update of tests pinning intentionally-changed behaviour, mirroring
007's `lifecycle.test.ts`). Pixel/touch/keyboard rows are not jsdom-assertable → quickstart manual.

**Commands** (offline sandbox — run binaries directly):
`node_modules/.bin/vitest run` · `node_modules/.bin/svelte-check` · `node_modules/.bin/vite build`

---

## Phase 1: Setup

- [X] T001 Confirm the baseline is green before any change: run `node_modules/.bin/vitest run` and `node_modules/.bin/svelte-check` from repo root and record that both pass (the FR-015/FR-016 baseline this feature must preserve).

---

## Phase 2: Foundational (blocking prerequisite for US1 only)

> Type-only scaffolding so US1 tests compile while still failing on behaviour. US2 does not depend
> on this phase.

- [X] T002 In `src/types.ts`, add `export type GroupKey = 'type' | 'weight';` and add `groupKey: GroupKey;` to the `ViewPrefs` interface (sibling of `sortKey`/`direction`). In `src/view.ts`, widen `Section.label` to `NoteType | Weight | 'weightless' | null` (import `Weight`). In `src/store.svelte.ts`, set `groupKey: 'type'` in the `view` object returned by `emptyDilemma()`. Do NOT change `arrange()` logic yet. Confirm `node_modules/.bin/svelte-check` is still green (type scaffolding only).

**Checkpoint**: types compile; behaviour unchanged; ready to write fail-first US1 tests.

---

## Phase 3: User Story 1 — Group by dimension (Priority: P1) 🎯 MVP

**Goal**: Group mode groups each choice's points by a selectable **Type / Weight** dimension; the
grouped toolbar row shows that Type/Weight segment instead of Asc/Desc; Sort mode is unchanged;
the selected dimension persists (legacy saves default to Type).

**Independent test**: Add mixed-type, mixed-weight points; turn Group on → toolbar shows Type/Weight
(no Asc/Desc); By Type → Adv/Disadv/Neutral (weighted heaviest-first); By Weight → weight 3→2→1
sections (types mixed) + neutral/weightless last; reload keeps the dimension; Sort still shows
Asc/Desc.

### Tests for User Story 1 (write first — MUST fail before implementation) ⚠️

- [X] T003 [P] [US1] In `tests/unit/view.test.ts`: add `groupKey: 'type'` to the `prefs()` helper default; **migrate** the three `describe('arrange — grouped')` cases to the `groupKey` contract — By Type: section order `['advantage','disadvantage','neutral']`, weighted sections heaviest-first (`a3,a1` / `d3,d1`), neutral creation order, and **identical regardless of `direction`**; **add** By Weight cases: `arrange(mixed, prefs({mode:'grouped', groupKey:'weight'}))` → labels `[3,1,'weightless']` for the fixture (no weight-2 notes → no `2` section), the `3` section holds `['d3','a3']` and the `1` section `['a1','d1']` (creation order, types mixed), `'weightless'` holds `['nu']`; add an all-neutral choice → single `'weightless'` section. Run and confirm these FAIL (per contracts/arrange-grouping.md).
- [X] T004 [P] [US1] In `tests/unit/persistence.test.ts`: add a case that a stored `view` **without** `groupKey` loads (not null) and that the caller-visible result defaults `groupKey` to `'type'`; add a case that an **invalid** `groupKey` value also resolves to `'type'`. Confirm FAIL (load() does not yet default it) — per research.md R7.
- [X] T005 [P] [US1] Create `tests/components/toolbar.test.ts` using the `tests/svelte.ts` mount helper: (a) with `mode:'grouped'`, a `[data-action="set-groupkey"]` segment is present and **no** `[data-action="set-direction"]` exists; (b) clicking `[data-key="weight"]` makes weight headings appear in a choice and `[data-key="type"]` restores type headings; (c) with `mode:'sorted'`, both `[data-action="set-sortkey"]` and `[data-action="set-direction"]` are present (Sort unchanged); (d) the grouped segment buttons carry the localized label and correct `aria-pressed`. Confirm FAIL (per contracts/group-toolbar.md).

### Implementation for User Story 1

- [X] T006 [US1] In `src/store.svelte.ts`, add `export function setGroupKey(key: GroupKey): void` that sets `d.view.groupKey = key` inside `update(...)` (same shape as `setSortKey`/`setDirection`).
- [X] T007 [US1] In `src/view.ts`, rewrite the `prefs.mode === 'grouped'` branch per contracts/arrange-grouping.md: when `groupKey === 'type'` emit advantage/disadvantage (weight **descending**, stable) + neutral (creation order); when `groupKey === 'weight'` emit one section per present weight value `3→2→1` (each containing all notes of that weight regardless of type, creation order) then a `'weightless'` section for `weight === null` notes. Ignore `direction` in grouped mode. Make T003 pass.
- [X] T008 [US1] In `src/persistence.ts`, in `load()` after validation, if `view.groupKey` is not `'type'`/`'weight'` set it to `'type'` (mirror the `lang` defaulting; keep `validView` lenient — do NOT add `groupKey` to its required checks; no `schemaVersion` bump). Make T004 pass.
- [X] T009 [P] [US1] In `src/i18n/en.ts`, add keys: `'toolbar.groupBy': 'Group by:'`, `'toolbar.groupKeyAria': 'Group by'`, `'group.weight': 'Weight {n}'`, `'group.weightless': 'Neutral'` (authoritative catalog).
- [X] T010 [P] [US1] In `src/i18n/uk.ts`, mirror the four keys: `'toolbar.groupBy': 'Групувати за:'`, `'toolbar.groupKeyAria': 'Групувати за'`, `'group.weight': 'Вага {n}'`, `'group.weightless': 'Нейтральні'` (keeps parity/no-blank tests green).
- [X] T011 [US1] In `src/components/Toolbar.svelte`: import `setGroupKey`; in the `showConfig` row render, when `mode === 'grouped'`, a `toolbar.groupBy` label + a `.seg` (role=group, `aria-label={t(lang,'toolbar.groupKeyAria')}`) with two buttons `data-action="set-groupkey"` `data-key="type"|"weight"` (labels `toolbar.type`/`toolbar.weight`, `aria-pressed` on the active one, `onclick={() => setGroupKey(...)}`); guard the existing sort-key segment **and** the Asc/Desc direction segment with `{#if mode === 'sorted'}` so neither shows in grouped mode. Make T005 pass.
- [X] T012 [US1] In `src/components/ChoiceCard.svelte`, extend the section-heading lookup so a section renders: `NoteType` → existing `group.advantage|disadvantage|neutral`; a numeric `Weight` label → `t(lang,'group.weight',{ n: String(label) })`; `'weightless'` → `t(lang,'group.weightless')`. Preserve the empty-section render guard.
- [X] T013 [US1] Run `node_modules/.bin/vitest run` and `node_modules/.bin/svelte-check`; confirm T003/T004/T005 now pass and the full suite + type-check are green.

**Checkpoint**: US1 independently shippable — the Group-by-dimension fix works end to end.

---

## Phase 4: User Story 2 — Add point above score (Priority: P2)

**Goal**: The Add-point control sits above the score summary; adding/scoring is otherwise unchanged.

**Independent test**: Render the app → the Add-point trigger precedes the score summary in DOM
order; adding a point still updates the score.

### Tests for User Story 2 (write first — MUST fail before implementation) ⚠️

- [X] T014 [US2] Create `tests/components/add-point-order.test.ts` (mount `App` via `tests/svelte.ts`): assert the Add-point trigger `[data-action="open-add-form"]` precedes the summary element (`.summary` / `[aria-label]` from `summary.aria`) using `compareDocumentPosition` & `DOCUMENT_POSITION_FOLLOWING`; assert that with the form open `[data-action="form"]` also precedes the summary. Confirm FAIL against current order (per contracts/addpoint-order.md).

### Implementation for User Story 2

- [X] T015 [US2] In `src/App.svelte`, swap the render order of `<Summary />` and `<AddEditForm />` so `<AddEditForm />` precedes `<Summary />` (lines around the `</section>` of `.choices` … `<Footer />`). No other change. Make T014 pass.

**Checkpoint**: US2 complete; both stories integrated.

---

## Phase 5: Polish & Cross-Cutting

- [X] T016 Run the full gate: `node_modules/.bin/vitest run` (all green incl. new/migrated tests), `node_modules/.bin/svelte-check` (0 errors/0 warnings), `node_modules/.bin/vite build` (succeeds).
- [X] T017 Verify the FR-015/FR-016 invariants by inspection: no change to the note data model or the scoring formula; persisted `sift.v1` stays `schemaVersion: 1` (groupKey additive + defaulted, no migration); only the four new i18n keys added (present in both catalogs, no existing key's meaning changed); **Sort** mode output and controls unchanged.
- [ ] T018 Walk the `quickstart.md` matrix (rows 1–18) on one desktop browser and one real/emulated mobile viewport, both themes — focus on the non-jsdom rows: Type/Weight visible with no Asc/Desc (1), instant re-section (9), keyboard + 44px target on the Group-by segment (14), AA contrast / dots-not-colour (15), form-above-score when open (18).

---

## Dependencies & Execution Order

- **Setup (T001)** → **Foundational (T002)** → **US1 (T003–T013)** ; **US2 (T014–T015)** is
  independent and may run any time after Setup → **Polish (T016–T018)**.
- **T002 blocks US1 tests** (T003–T005) — they reference `groupKey` / widened `Section.label`.
- Within US1 implementation: **T006 (setGroupKey)** and **T009/T010 (i18n)** precede **T011
  (Toolbar)**; **T007 (arrange)** precedes **T012 (ChoiceCard headings)** and is what T003 verifies;
  **T008** is what T004 verifies.
- US2: **T014 (test) → T015 (swap)**.

### Parallel opportunities

- **US1 tests**: T003 (`view.test.ts`), T004 (`persistence.test.ts`), T005 (`toolbar.test.ts`) are
  different files → `[P]`.
- **i18n**: T009 (`en.ts`) and T010 (`uk.ts`) are different files → `[P]`.
- **US1 vs US2**: entirely independent after Setup; US2 (T014–T015) can proceed in parallel with the
  whole US1 phase (different files: `App.svelte` + a new test).

### Suggested MVP scope

User Story 1 (group by dimension) — Phases 1 + 2 + 3. It is the reported defect and the core
deliverable; US2 is an independent one-line layout follow-on.
