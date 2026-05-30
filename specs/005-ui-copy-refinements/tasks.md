# Tasks: UI Copy Refinements — Header Intro, Score Formula, "Point" Relabel

**Feature**: `005-ui-copy-refinements` | **Branch**: `005-ui-copy-refinements`
**Spec**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md)

**Inputs**: plan.md (Svelte 5 + Tailwind v4, no new deps), spec.md (US1 P1, US2 P2, US3 P3),
data-model.md (2 new keys + 5 relabeled values), contracts/ (i18n, components), research.md,
quickstart.md.

**Tests**: REQUIRED — Constitution Principle IV (Pure Core, Test-First, NON-NEGOTIABLE). New
user-facing strings get DOM tests written first (red → green). Catalog parity + no-blank/raw-key
unit tests auto-cover the new/relabeled keys.

**Conventions**: presentation-only; no new dependencies; no data-shape change; WCAG AA in both
themes; EN/UA catalog parity preserved.

---

## Phase 1: Setup

**Purpose**: Confirm a green baseline before changes.

- [X] T001 Confirm baseline is green on branch `005-ui-copy-refinements`: run `yarn test` and `yarn check` from repo root and verify both pass before editing.

---

## Phase 2: Foundational

**Purpose**: Blocking prerequisites shared across stories.

None. Each story touches independent i18n keys; the Svelte/Tailwind/i18n infrastructure already
exists from feature 004 and is reused as-is.

---

## Phase 3: User Story 1 — Header intro (Priority: P1) 🎯 MVP

**Goal**: Show the `Sift` wordmark + a localized tagline above the dilemma input.

**Independent Test**: Load fresh; `.header__wordmark` reads `Sift`, `.header__tagline` reads the
localized tagline, and switching language updates the tagline while the wordmark stays the same.

- [X] T002 [US1] Add a failing DOM test in `tests/components/i18n.test.ts` (in the "US1 — localization at the DOM level" describe): assert `.header__tagline` textContent equals `messages.en['header.tagline']` by default and equals `messages.uk['header.tagline']` after `setLang('uk'); flushSync()`.
- [X] T003 [P] [US1] Add key `header.tagline` under `// Header` in `src/i18n/en.ts` with the verbatim EN value from data-model.md.
- [X] T004 [P] [US1] Add key `header.tagline` under `// Header` in `src/i18n/uk.ts` with the verbatim UA value from data-model.md.
- [X] T005 [US1] Restructure `src/components/Header.svelte`: prepend `<div class="header__brand">` containing `<h1 class="header__wordmark">Sift</h1>` (literal, not `t()`) and `<p class="header__tagline">{t(lang, 'header.tagline')}</p>`, and wrap the existing `.header__title` input and `.header__tools` div in a new `<div class="header__bar">`. Keep all input/button attributes unchanged.
- [X] T006 [US1] Update the Header section of `src/styles/app.css`: make `header` a vertical stack (`display:flex; flex-direction:column; align-items:stretch; gap:var(--space-3)`); add `.header__bar` with the former row rules (`display:flex; align-items:center; gap:var(--space-3); flex-wrap:wrap`); add `.header__wordmark` (`margin:0; font-size:1.5rem; font-weight:700; color:var(--text)`) and `.header__tagline` (`margin:var(--space-1) 0 0; max-width:60ch; color:var(--text-muted); font-size:0.95rem; line-height:1.5`). Leave `.header__title`, `.header__tools`, `.linklike`, `.header__title::placeholder` unchanged.
- [X] T007 [US1] Verify `.header__tagline` meets WCAG AA (≥ 4.5:1) in BOTH light and dark themes against its background in `src/styles/app.css`; if `--text-muted` fails in either theme, switch the tagline to `--text`. Run the T002 test green.

**Checkpoint**: US1 independently testable — intro renders and localizes; title input focus/behavior unchanged.

---

## Phase 4: User Story 2 — Score-formula caption (Priority: P2)

**Goal**: One muted full-width caption below the score band explaining the calculation.

**Independent Test**: With the score band visible, exactly one `.summary__formula` caption appears
below the `.sum` cells (not a `.sum`), reads the localized formula copy, and updates on language switch.

- [X] T008 [US2] Add a failing DOM test in `tests/components/i18n.test.ts`: assert `.summary__formula` textContent equals `messages.en['summary.formula']` by default and `messages.uk['summary.formula']` after `setLang('uk'); flushSync()`; also assert `.summary .sum` cells still query as before (caption is not a `.sum`).
- [X] T009 [P] [US2] Add key `summary.formula` under `// Summary` in `src/i18n/en.ts` with the verbatim EN value from data-model.md.
- [X] T010 [P] [US2] Add key `summary.formula` under `// Summary` in `src/i18n/uk.ts` with the verbatim UA value from data-model.md.
- [X] T011 [US2] In `src/components/Summary.svelte`, after the `{#each} … {/each}` block and still inside `<section class="summary">`, add `<p class="summary__formula">{t(lang, 'summary.formula')}</p>`. Do not add the `sum` class; leave `.sum`/`.sum__score`/`.sum__totals` untouched.
- [X] T012 [US2] Add a `.summary__formula` rule to the Summary section of `src/styles/app.css`: `grid-column:1 / -1; margin:0; text-align:center; color:var(--text-muted); font-size:0.85rem`.
- [X] T013 [US2] Verify `.summary__formula` meets WCAG AA in BOTH themes; if `--text-muted` fails, use `--text`. Run the T008 test green.

**Checkpoint**: US2 independently testable — caption present, localized, distinct from score cells.

---

## Phase 5: User Story 3 — "note" → "point" relabel (Priority: P3)

**Goal**: Relabel the displayed umbrella noun to "point"/«пункт»; keep type words and «Варіант».

**Independent Test**: The add-entry control, empty-choice message, and entry-type/entry-text labels
read point/«пункт» (correct UA declensions); advantage/disadvantage/neutral and «Варіант» unchanged.

- [X] T014 [P] [US3] In `src/i18n/en.ts`, update the *values* (not key names) of `choice.empty` → "No points yet", `note.empty` → "(empty point)", `form.addNote` → "＋ add point", `form.noteTypeAria` → "Point type", `form.textAria` → "Point text".
- [X] T015 [P] [US3] In `src/i18n/uk.ts`, update the *values* of `choice.empty` → "Поки немає пунктів", `note.empty` → "(порожній пункт)", `form.addNote` → "＋ додати пункт", `form.noteTypeAria` → "Тип пункту", `form.textAria` → "Текст пункту".
- [X] T016 [US3] Confirm no other strings changed: `note.emptyShort`, `note.weightLabel`, `note.editAria`, all `noteType.*`, all `group.*`, all `form.type*`, `form.textPlaceholder`, and every `choice.*`/«Варіант» value are untouched in both `src/i18n/en.ts` and `src/i18n/uk.ts`. Run `tests/unit/i18n.test.ts` (parity + no-blank/raw-key) green.

**Checkpoint**: US3 independently testable — relabel applied, scoping respected, parity intact.

---

## Phase 6: Polish & Cross-Cutting Concerns

- [X] T017 Run `yarn test` from repo root; all suites green (unit i18n parity/no-blank + component DOM, including the new T002/T008 assertions).
- [X] T018 Run `yarn check` (svelte-check type-check) and `yarn build`; both succeed. If the bundling step needs network and is offline, at minimum confirm `yarn check` + `yarn test` are green (per quickstart.md).
- [ ] T019 Manual acceptance per `quickstart.md` via `yarn dev`: wordmark+tagline above input; language switch updates tagline & caption (wordmark unchanged); single muted caption below score band; add-entry reads point/«пункт»; both themes legible; typing in the title input is uninterrupted (no focus loss).

---

## Dependencies & Execution Order

- **Setup (T001)** → before everything.
- **US1 (T002–T007)**, **US2 (T008–T013)**, **US3 (T014–T016)** are independent and may be done in
  any order or interleaved; default order is priority P1 → P2 → P3.
- Within each story: write the test task first (T002 / T008), then catalog + component + CSS, then
  the AA-verify task last.
- **Polish (T017–T019)** → after all targeted stories are complete.

### File-contention notes

- `src/i18n/en.ts` is edited by T003, T009, T014; `src/i18n/uk.ts` by T004, T010, T015 — additive,
  non-overlapping keys/lines, but same file each → run those sequentially (phase order handles this).
- `src/styles/app.css` is edited by T006 (header) and T012 (summary) — different sections; sequential.
- `tests/components/i18n.test.ts` is edited by T002 and T008 — sequential.

### Parallel opportunities

- T003 + T004 (en/uk for `header.tagline`) — different files → [P].
- T009 + T010 (en/uk for `summary.formula`) — different files → [P].
- T014 + T015 (en/uk relabels) — different files → [P].

---

## Implementation Strategy

- **MVP = US1 (Header intro)**: the single highest-leverage clarity win; independently shippable.
- **Incremental**: ship US1, then US2 (score transparency), then US3 (wording polish). Each story is
  a complete, independently testable slice with its own green tests.
- **Test-first throughout** (Principle IV): the DOM tests (T002, T008) are written to fail first;
  catalog/component/CSS edits turn them green. Catalog parity + no-blank-key unit tests guard the
  i18n changes automatically.
