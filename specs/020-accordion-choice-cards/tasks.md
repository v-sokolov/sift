# Tasks: Accordion Choice Cards

**Input**: Design documents from `/specs/020-accordion-choice-cards/`

**Prerequisites**: plan.md, spec.md (clarified through 2026-06-12), research.md (R1–R8),
data-model.md, contracts/accordion.md, quickstart.md

**Tests**: INCLUDED — TDD is mandated by Constitution v2.2.0 Principle IV
(red-first: every test task must FAIL before its implementation task starts).

**Organization**: Tasks grouped by user story. US1 (accordion) and US2 (footer score)
touch some shared files (`ChoiceCard.svelte`, `app.css`, i18n) but disjoint regions;
they are sequenced US1 → US2 to avoid same-file merge conflicts when executed solo.

## Format: `[ID] [P?] [Story] Description`

---

## Phase 1: Setup

**Purpose**: Confirm a green baseline so red tests are attributable to this feature.

- [X] T001 Verify clean baseline: `yarn tsc --noEmit && yarn vitest run` both green on
      branch `020-accordion-choice-cards` before any change

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: None required — no shared scaffolding precedes the stories. The expand-state
store API belongs to US1 and the pure-helper extraction to US2; each story carries its
own prerequisites (kept story-local to preserve independent testability).

*(no tasks)*

---

## Phase 3: User Story 1 - Collapse a Choice to its essentials (Priority: P1) 🎯 MVP

**Goal**: Each card is an independent per-card Bits UI `Accordion` (Root `type="single"`
+ one Item): chevron `Trigger` in the header, Points list in `Content`, collapsed by
default, ephemeral state, auto-expand on Points mutations. Header controls unaffected.

**Independent Test**: Create a Choice with Points, collapse/expand it via the chevron,
confirm only that card moves and the Point list round-trips unchanged; add a Point to a
collapsed Choice and watch it auto-expand; reload → all collapsed again.

### Tests for User Story 1 (write FIRST, must FAIL) ⚠️

- [X] T002 [US1] Red store tests E1–E6 in `tests/components/store.test.ts`:
      `isExpanded` collapsed-default (E1); `setExpanded` fires no `subscribePersist`
      notification (E2, spy); `setExpanded` leaves `AppState` deep-equal — `updatedAt`/
      `status`/`dilemma`/`view` unchanged (E3, 016 H2 pattern); `addNote`/`updateNote`/
      `removeNote` expand exactly the mutated Choice (E4); failure paths (unknown
      choiceId, blank text, unknown noteId) expand nothing (E5); `removeChoice` drops
      the entry and `clearDilemma` resets the record (E6). Run: all new tests FAIL
      (`setExpanded`/`isExpanded` don't exist yet)
- [X] T003 [P] [US1] Red DOM tests A1–A4, A6, S1–S2 in NEW
      `tests/components/accordion.test.ts` (mount via `tests/svelte.ts` helper):
      default-collapsed render — header (title input, ✎, ✕, chevron) present, body
      (`.notes`/group labels/empty hint) absent (A1); chevron toggles ONLY its card
      (A2); chevron is a `<button>` with constant accessible name (`choice.toggleAria`),
      `aria-expanded`, `aria-controls` → body id (A3); typing in title input and ✕
      (incl. 016 confirm flow) never change collapse state (A4); expand round-trip
      restores the arranged body in Group/Sort modes (A6); persisted payload
      byte-identical across toggles (S1) and pre-020 `sift.v1` payload loads unchanged
      (S2). Run: FAIL

### Implementation for User Story 1

- [X] T004 [P] [US1] Add i18n key `choice.toggleAria` (EN "Show or hide points" / UA
      "Показати або приховати пункти") in `src/i18n/en.ts` and `src/i18n/uk.ts`
- [X] T005 [US1] Implement expand-state in `src/store.svelte.ts` per data-model.md:
      module-level `$state` record `expanded: Record<string, boolean>` OUTSIDE
      `AppState`; export `isExpanded(choiceId)` / `setExpanded(choiceId, open)` (no
      `update()`/`notifySave()`/`touch()`); set `expanded[choiceId] = true` on the
      success paths of `addNote`/`updateNote`/`removeNote`; drop entries in
      `removeChoice`/`clearDilemma` → T002 tests GREEN
- [X] T006 [US1] Restructure `src/components/ChoiceCard.svelte` per research R1:
      per-card `Accordion.Root type="single"` with
      `value={isExpanded(choice.id) ? choice.id : ''}` and
      `onValueChange={(v) => setExpanded(choice.id, v === choice.id)}`; one
      `Accordion.Item value={choice.id}`; `Accordion.Header` wrapping ONLY the chevron
      `Accordion.Trigger` (aria-label `choice.toggleAria`) as a sibling of ✎/title/✕ in
      `.choice__head`; body (group labels + `.notes` + empty hint) inside
      `Accordion.Content` with `forceMount` + `child` snippet carrying
      `transition:slide={{ duration: flipMs }}` gated by the Summary.svelte
      `prefersReduced` matchMedia pattern (R5, FR-009) → T003 tests GREEN
- [X] T007 [US1] Style chevron + collapsed card in `src/styles/app.css`: chevron as
      `.iconbtn` variant with `data-state` open/closed glyph rotation (▸/▾), no change
      to `.choices`/`.summary` grid rules (B1)
- [X] T008 [US1] Checkpoint: `yarn tsc --noEmit && yarn vitest run` fully green
      (incl. pre-existing 015/016/018 suites — B1–B3); quickstart steps 1–2 and 4–6
      smoke-checked in `yarn dev`

**Checkpoint**: Accordion behaviour complete and independently shippable (MVP).

---

## Phase 4: User Story 2 - See each Choice's score on the card (Priority: P2)

**Goal**: Card footer shows `signed(choiceScore(c))` coloured by sign with the same
tokens as the summary band; single helper source in `view.ts` so they can never drift.

**Independent Test**: Add weighted Points; the footer total and its sign colour match
the summary band cell for that Choice in both themes; footer updates live while the
card is collapsed.

### Tests for User Story 2 (write FIRST, must FAIL) ⚠️

- [X] T009 [P] [US2] Red unit tests in `tests/unit/view.test.ts`: `signed()` →
      `+N`/`−N` (U+2212)/`0` table; `scoreSign()` → positive/negative/neutral table
      (F3). Run: FAIL (not exported yet)
- [X] T010 [US2] Red component tests F1–F2 + A5 in
      `tests/components/accordion.test.ts`: footer text equals
      `signed(choiceScore(choice))` for positive/negative/zero/empty Choices (F1);
      footer element carries `choice__score--{scoreSign(...)}` matching the
      `.sum__score--*` modifier Summary renders for the same Choice (F2/SC-003); footer
      updates after a note mutation while the card stays collapsed (A5). Run: FAIL

### Implementation for User Story 2

- [X] T011 [US2] Extract `signed()` and `scoreSign()` as exported pure functions in
      `src/view.ts`; replace the private copies in `src/components/Summary.svelte` with
      imports — rendering byte-identical, existing 018 O/C/T/S tests stay green → T009
      GREEN
- [X] T012 [US2] Add footer to `src/components/ChoiceCard.svelte`: `.choice__foot`
      after `Accordion.Content` (always visible) containing `.choice__score
      choice__score--{scoreSign(choiceScore(choice))}` with `signed(...)` text and an
      accessible label via NEW i18n key `choice.scoreLabel` (EN "Score" / UA "Бали") in
      `src/i18n/en.ts` + `src/i18n/uk.ts` → T010 GREEN
- [X] T013 [US2] Style footer in `src/styles/app.css`: `.choice__foot` with
      `margin-top: auto` + `border-top: 1px solid var(--border)` (R4 footer pinning);
      `.choice__score` tabular-nums; `.choice__score--positive/negative/neutral` using
      `var(--advantage)/var(--disadvantage)/var(--neutral)` — no tint, no leader
      treatment on cards (R4, Principle I)
- [X] T014 [US2] Checkpoint: full suite green; SC-003 spot-check vs summary band in
      light AND dark themes in `yarn dev`

**Checkpoint**: US1 + US2 complete — collapsed cards read as name + score rows.

---

## Phase 5: User Story 3 - Compare many Choices at a glance (Priority: P3)

**Goal**: The emergent payoff — all-collapsed boards scan cleanly, including under
Rank-by-score reordering on 5–6-Choice wrapped layouts.

**Independent Test**: 5–6 Choices with several Points each, all collapsed: every name +
score visible at once; toggle Rank and confirm collapsed cards reorder with correct
footers.

### Tests for User Story 3 (write FIRST, must FAIL if behaviour missing) ⚠️

- [X] T015 [US3] Red component test in `tests/components/accordion.test.ts`: with
      `rankByTotal` on and all cards collapsed, mutate scores → card order follows
      `orderedChoices` and each footer keeps its own Choice's value (US3 acceptance
      scenario 2). Run first; if already green from US1+US2, keep as regression lock
      and note it in the test comment

### Implementation for User Story 3

- [X] T016 [US3] Fix any interplay surfaced by T015 (likely files:
      `src/components/ChoiceCard.svelte`, `src/App.svelte` keyed `{#each}` /
      `.choice-cell` flip wrapper) — no-op if T015 was already green
- [X] T017 [US3] Manual SC-002/M5 check in `yarn dev`: 6 collapsed Choices × 5+ Points
      visible without scrolling the board at a typical desktop viewport; record result
      in PR notes
      ✅ 2026-06-12, real Chrome at localhost:5173: 6-city demo board, all collapsed —
      3-column wrap intact, uniform 110px rows, board bottom 606px vs 1233px viewport
      (no scroll); footers +2/−1/+2/−2/+3/−1 matched the summary band exactly

**Checkpoint**: All three stories functional.

---

## Phase 6: Polish & Cross-Cutting Concerns

- [X] T018 Full regression + type gates: `yarn tsc --noEmit && yarn vitest run` (B1–B3
      boundary contracts: 015 grid, 016 confirm, 018 rank/colour suites all green)
      ✅ 206 tests green; svelte-check 0 errors
- [X] T019 Build gate (B4, Constitution): `yarn build` green and `package.json`
      diff-free; verify against a clean dependency install as CI does (NOTE: offline
      sandbox may block a true clean install — if so, rely on the GitHub CI run and
      say so explicitly in the PR)
      ✅ `yarn build` green (svelte-check + vite, 152 kB js / 23 kB css);
      `package.json`/`yarn.lock` diff-free. Clean-install verification DEFERRED TO
      GITHUB CI (offline sandbox) — must be stated in the PR description
- [ ] T020 Manual sweep per quickstart.md steps 7–9 + contracts M1–M4: reduced-motion
      instant fold (M1); mixed collapsed/expanded 5–6-Choice wrapped rows tidy, footers
      pinned (M2); footer AA contrast both themes (M3); keyboard-only walkthrough —
      Tab to chevron, Enter/Space toggles, rename/✕ reachable, focus retained (M4/SC-005)
      ◐ Partially verified in real Chrome (2026-06-12): M2 geometry (mixed row 434px,
      footers pinned, others stay collapsed) and M3 token alignment (footer colour ===
      summary colour per choice, light #2f7d57/#b5483d and dark #6fcf97/#e0897e) checked
      programmatically. STILL PENDING (human eyes/hands): M1 reduced-motion fold, M4
      keyboard-only walkthrough, true AA-contrast eyeball of the new footer

---

## Phase 7: Increment 2 — Header Redesign (US1, spec rev. 2 of 2026-06-12)

**Goal**: Chevron full-left + read-only title in the header (whole row toggles,
FR-013); ✎/✕ relocate into the body as a labeled actions row "✎ Rename" · "✕ Remove"
(FR-001 rev); Rename is the only title-edit entry point — in-place header input,
Enter/blur commits, Esc restores (FR-007 rev); Remove keeps 016 semantics behind
expansion (FR-014). Design: research R9 (component-local `editingTitle`/`prevTitle`,
Esc-before-blur) and R10 (pointer-only header toggle, chevron stays sole ARIA button).

**Independent Test**: Collapsed card shows only chevron + name + score; clicking the
title toggles; expanding reveals Rename/Remove below the points; Rename → type →
Enter keeps the name, Esc restores the old one; ✕ still confirms on a pointed Choice.

### Tests for Increment 2 (write FIRST, must FAIL against current markup) ⚠️

- [X] T021 [US1] Rewrite A1/A4 and add H1–H5 + A6 actions-row assertion in
      `tests/components/accordion.test.ts` per contracts rev. 2: A1 header = chevron +
      `.choice__name` read-only text w/ ghost placeholder, NO input/✎/✕ in header; A4
      header-row click toggles, no double-toggle from the chevron, no toggle while
      editing; H1 Rename swaps in autofocused input, live rename, Enter/blur commits;
      H2 Esc restores `prevTitle`, suppresses blur-commit, keeps the points form open,
      returns focus to Rename; H3 covered via T022; H4 Rename/Remove absent from DOM
      while collapsed; H5 chevron-collapse during edit commits the typed value.
      Run: new/rewritten tests FAIL
- [X] T022 [P] [US1] Migrate `tests/components/remove-choice.test.ts` to the relocated
      ✕ (H3): add an expand-card step before each `[data-action="remove-choice"]`
      click; assertions (confirm on pointed, instant on empty, min-2 disabled,
      deep-equal decline, B6 `window.confirm` never called) stay byte-identical in
      strength. Run: FAIL (✕ still lives in the header)

### Implementation for Increment 2

- [X] T023 [P] [US1] Add i18n keys `choice.rename` (EN "Rename" / UA "Перейменувати")
      and `choice.removeLabel` (EN "Remove" / UA "Видалити") in `src/i18n/en.ts` and
      `src/i18n/uk.ts`
- [X] T024 [US1] Restructure `src/components/ChoiceCard.svelte` per R9/R10: header =
      `Accordion.Header`+`Trigger` (chevron, full-left) + `.choice__name` read-only
      text (ghost placeholder when untitled) OR the autofocused title input while
      `editingTitle`; head `onclick` toggles via `setExpanded` unless `editingTitle`
      or `event.target.closest('button, input, a')`; remove header ✎ span and header
      ✕; body (inside `Accordion.Content`, after points/empty hint) gains
      `.choice__actions` with "✎ Rename" (`data-action="rename-choice"`, enters edit,
      snapshots `prevTitle`) and "✕ Remove" (`data-action="remove-choice"`, existing
      `onRemoveClick` + min-2 disabled state); Esc keydown in the input restores
      `prevTitle` + `stopPropagation` BEFORE blur, focus returns to the Rename button
      → T021 + T022 GREEN
- [X] T025 [US1] Style in `src/styles/app.css`: `.choice__name` (read-only title
      typography matching the old input, ghost colour for placeholder),
      `.choice__head` `cursor: pointer` (default cursor while editing),
      `.choice__actions` quiet bottom row (above the footer; small text buttons),
      retire header-only rules that no longer apply (`.choice__edit` pencil cue)
- [X] T026 [US1] Checkpoint: `yarn tsc --noEmit && yarn vitest run` fully green
      (incl. 015/016/018 suites — B1–B3) and `yarn build` green with `package.json`
      diff-free (B4)
      ✅ 211 tests green; svelte-check 0 errors/0 warnings; vite build 153.9 kB js /
      24.6 kB css; deps diff-free. Two pre-existing tests migrated to the new surface
      with intent preserved: lifecycle.test.ts title read, toolbar.test.ts 015 ghost
      placeholders (input placeholder → .choice__name--ghost text)
- [X] T027 [US1] Manual re-sweep in `yarn dev` per quickstart step 5 (rev. 2) + M4:
      header-click toggle feel, rename commit/cancel by keyboard only, Remove reachable
      and confirming, both themes; record results here
      ◐ Verified in real Chrome (2026-06-12, DOM-driven): header anatomy (chevron
      first, ghost name, no input/✕ in header), name-click expands, actions row
      "✎ Rename · ✕ Remove", rename autofocus → Enter commits → focus back on Rename,
      Esc restores prior name, chevron collapse keeps name+footer. STILL PENDING
      (human eyes): toggle/fold feel, dark-theme look of the actions row, true
      keyboard-Tab walkthrough

---

## Phase 8: Increment 3 — Post-Implementation Polish (user-directed, 2026-06-12)

**Goal**: Visual/UX refinements requested interactively after Increment 2 shipped.
All CSS/markup/i18n; no store, persistence, or dependency change. Gates re-run after
each step (suite + build stayed green throughout; 211 tests).

- [X] T028 Footer mirrors `.sum--*` sign treatment — `.choice__foot--*` tint + sign
      top border, bled to card edges (`src/components/ChoiceCard.svelte`,
      `src/styles/app.css`; F2b test added red-first)
- [X] T029 Toggle icon → CaretDown SVG (22px, currentColor; down closed, 180° open),
      chevron relocated to the header's right edge; FR-001/contracts/research/plan/
      CLAUDE.md synced left→right (`ChoiceCard.svelte`, `app.css`)
- [X] T030 Board grid re-tiered: 1-col <720px / 2-up ≥720px / 3-up ≥1280px with
      `minmax(0,1fr)` tracks; `.summary` mirrors; `min-width:0` shrink fixes on
      `.choice-cell > .choice` and `.choice__title`; supersedes 015 wrap (contract B1
      second revision; verified in Chrome) (`app.css`)
- [X] T031 Actions row: single-line icon+label buttons (`.actbtn` inline-flex +
      `.actbtn__icon`), `justify-content: space-between` (`ChoiceCard.svelte`,
      `app.css`)
- [X] T032 Header: tagline below the brand row (+`padding-top`; column experiment
      reverted), `.header__brandaction` flex:none wrapper, `align-items: flex-start`;
      accent swap — Suggest gains `btn--primary`, Add-choice loses it
      (`Header.svelte`, `Toolbar.svelte`, `app.css`)
- [X] T033 Tagline privacy sentence appended EN/UA — "Private by design: your data is
      stored only in this browser, with no server backup." / "Приватність за задумом:
      ваші дані зберігаються лише в цьому браузері, без резервної копії на сервері."
      (`src/i18n/{en,uk}.ts`)
- [X] T034 Toolbar regrouped: Add-choice moved to the views row (pinned right,
      `space-between`); settings row = `.toolbar__set` pairs [lang+theme] ⟷
      [status+Clear] (status before Clear), `space-between` at all widths, two-row
      stack <475px with members capped `calc(50% − gap)`, lang buttons 50/50, `.saved`
      centred; 018 equal-thirds mobile rule removed (`Toolbar.svelte`, `app.css`)
- [X] T035 Regression LOCKS for the testable polish decisions (016 US2 precedent —
      written after landing, pinning deliberate choices): Add-choice located in the
      views row after the toggle group; settings-row pairing + status-before-Clear
      order; Suggest as the sole `btn--primary`; CaretDown SVG present in the trigger;
      tagline privacy sentence in BOTH catalogs
      (`tests/components/toolbar.test.ts`, `tests/components/accordion.test.ts`,
      `tests/unit/i18n.test.ts`) → suite 211 → 215 green. Pure-geometry polish (grid
      tiers, space-between, 50% caps, centring) remains manual — jsdom has no layout
      engine
- [X] T036 Hide the score summary band — code kept, not rendered (FR-011 superseded;
      clarified choice A): `SHOW_SUMMARY = false` flag in `src/config.ts` gating
      `<Summary />` in `src/App.svelte` (red-first lock: App renders no `.summary`,
      card footers are the only score display). Band tests migrated to mount the
      retained `<Summary />` directly so its contracts stay enforced: 018
      `sort-color.test.ts`, 001 `flow.test.ts`, 007 `note-row.test.ts`, 002 i18n
      caption, F2 cross-check; 008 DOM-order laws in `add-point-order.test.ts` gated
      with `it.skipIf(!SHOW_SUMMARY)` (auto-resume on reinstatement). Suite 215 → 216
      (214 pass + 2 conditionally skipped)
- [X] T037 Views row (Rank │ Group/Sort + Add-choice) stacks at ≤800px instead of
      ≤719px (wider content wraps earlier); config segs and the rest of the toolbar
      keep the 719px tier (`src/styles/app.css`)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1**: none — start immediately
- **Phase 2**: empty (no foundational tasks)
- **Phase 3 (US1)**: after T001. MVP — independently shippable
- **Phase 4 (US2)**: after T001; T010/T012 edit files US1 touches
  (`accordion.test.ts`, `ChoiceCard.svelte`), so solo execution runs US1 → US2.
  T009/T011 (view.ts extraction + unit tests) have NO dependency on US1 and could run
  before/alongside it
- **Phase 5 (US3)**: after US1 + US2 (exercises both)
- **Phase 6**: after all desired stories
- **Phase 7 (Increment 2)**: after Phase 6 — it rewrites tests Phase 3 introduced, so
  it MUST NOT start before the Increment-1 suite is green. Within it: T021 ∥ T022 ∥
  T023 (different files), then T024 → T025 → T026 → T027

### Within each story

- Red tests strictly before implementation (Constitution Principle IV); checkpoint task last

### Parallel Opportunities

- T002 ∥ T003 (different test files)
- T004 (i18n) ∥ T002/T003/T005 (different files)
- T009 (unit red) ∥ anything in US1; T011 ∥ T006/T007 (different files)
- T018 ∥ nothing needed — it's a single command, but T020 manual checks can interleave
  with T019's CI wait

## Parallel Example: User Story 1

```bash
# Red tests together (different files):
Task: "E1–E6 store tests in tests/components/store.test.ts"        # T002
Task: "A1–A4/A6/S1–S2 DOM tests in tests/components/accordion.test.ts"  # T003
Task: "choice.toggleAria EN/UA in src/i18n/{en,uk}.ts"             # T004
# Then sequentially: T005 (store) → T006 (ChoiceCard) → T007 (CSS) → T008 (gate)
```

---

## Implementation Strategy

**MVP = Phase 3 (US1)**: the accordion alone is shippable — collapsed-by-default cards
with working toggle, auto-expand, and untouched persistence. Stop at T008 to validate.

**Incremental delivery**: T008 (accordion) → T014 (footer scores) → T017 (glance
verification) → T020 (polish). Each checkpoint leaves the suite green and the board
usable; commits in small logical increments per the constitution.

**Honesty notes**: geometry/contrast/motion claims (M1–M5, SC-002) are manual-only —
jsdom has no layout engine; do not mark them done without the `yarn dev` walkthrough.
T019's clean-install verification may require CI in the offline sandbox.
