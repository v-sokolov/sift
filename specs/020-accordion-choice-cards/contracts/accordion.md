# Contracts: Accordion Choice Cards (020)

Automated under vitest/jsdom unless marked **[manual]** (jsdom has no layout engine —
014/016/018 precedent).

## A — Accordion behaviour (`tests/components/accordion.test.ts`)

*(A1/A4 rewritten in rev. 2 — the header redesign. The pre-rev.-2 versions asserted a
header title input and header ✕; those laws are superseded by H1–H5.)*

- **A1** *(rev. 2)*: Fresh render → every card is collapsed: header holds the chevron
  (far RIGHT, after the name) and the Choice name as READ-ONLY text (`.choice__name`, ghost "Choice N"
  placeholder when untitled — no `<input>`, no ✎, no ✕ in the header); footer present;
  body (`.notes`, group labels, empty hint, actions row) absent.
- **A2**: Activating a card's chevron expands ONLY that card; activating again
  collapses it (toggle, per-card independence — FR-002).
- **A3**: The chevron is a `<button>` with a constant accessible name
  (`choice.toggleAria`), `aria-expanded` reflecting state, and `aria-controls`
  pointing at the body element's id (FR-008).
- **A4** *(rev. 2)*: Clicking the header row (e.g. the title text) toggles the card
  (FR-013); clicks originating on interactive elements inside the head do not
  double-toggle; while the title-edit input is open the header click does NOT toggle.
- **A5**: While collapsed, the footer keeps showing the live score (mutate notes →
  footer text updates) (FR-005).
- **A6**: Expanded body content equals the pre-collapse arrangement (Group/Sort modes
  included) — collapse/expand round-trip loses nothing; the actions row renders after
  the points list / empty hint.

## H — Header redesign: rename flow & relocated controls (rev. 2, `tests/components/accordion.test.ts` + migrated `remove-choice.test.ts`)

- **H1**: The body's "✎ Rename" button (label `choice.rename`, EN/UA) swaps the
  header name text for the autofocused title input; typing live-renames (store
  `renameChoice`, unchanged semantics incl. `touch()`); Enter or blur exits edit mode
  and the header shows the committed text (FR-007).
- **H2**: Esc inside the title input cancels: the prior name is restored, edit mode
  exits, the blur that follows does NOT re-commit (Esc-before-blur ordering), the
  App-level Esc handler is not triggered (points form stays open if it was), and focus
  returns to the Rename button.
- **H3**: The body's "✕ Remove" button (label `choice.removeLabel`) keeps every 016
  law: confirm dialog on a pointed Choice, instant removal on an empty one, disabled
  at the 2-Choice minimum, decline = deep-equal no-op. `remove-choice.test.ts`
  migrates selectors (expand first), weakening NO assertion.
- **H4**: Rename and Remove are unreachable while the card is collapsed (the body is
  unmounted) — expanding is the only path to them (FR-014).
- **H5**: Collapsing the card while the title input is open (via the chevron) commits
  the in-progress value (blur-commit) and exits edit mode cleanly.

## F — Footer score (`tests/components/accordion.test.ts` + `tests/unit/view.test.ts`)

- **F1**: Footer text is `signed(choiceScore(choice))` — `+N` for positive, `−N`
  (U+2212) for negative, `0` for zero/empty (FR-004 text prefix kept).
- **F2**: Footer score element carries `choice__score--{scoreSign(...)}`; class
  matches the `.sum__score--*` modifier the Summary renders for the same Choice
  (SC-003 single-source check).
- **F3**: `signed` / `scoreSign` are exported pure functions in `view.ts`;
  `Summary.svelte` has no private duplicates (import-level dedupe).
- **F4 [manual]**: Footer colours use `--advantage`/`--disadvantage`/`--neutral` and
  meet WCAG AA in both themes (M3).

## E — Expand-state store contract (`tests/components/store.test.ts`)

- **E1**: `isExpanded(id)` is `false` for any id never toggled (collapsed default,
  FR-012).
- **E2**: `setExpanded` fires NO persistence-channel notification (spy listener
  registered via `subscribePersist` is never called).
- **E3**: `setExpanded` leaves `AppState` deep-equal: `updatedAt`, `status`,
  `dilemma`, `view` all unchanged (FR-006; 016 H2 deep-equal pattern).
- **E4**: `addNote`, `updateNote`, `removeNote` each set the mutated Choice expanded;
  other Choices' states are untouched (FR-010).
- **E5**: Failure paths (unknown choiceId, blank `addNote` text, unknown noteId) do
  NOT expand anything.
- **E6**: `removeChoice` drops the removed id's entry; `clearDilemma` resets the whole
  record (fresh board starts all-collapsed).

## S — Serialization honesty (`tests/components/accordion.test.ts`)

- **S1**: `serialize`d payload (via the persistence module's write path or
  `JSON.stringify({schemaVersion:1, dilemma, view})` equivalence) is byte-identical
  before and after any sequence of toggles (SC-004).
- **S2**: A pre-020 `sift.v1` payload loads unchanged — no new defensive-load rule
  exists or is needed (no persisted field added).

## B — Boundary (regression guards)

- **B1** *(revised 2026-06-12 during implementation)*: 015 grid SEMANTICS untouched —
  same column counts, same `:has()` wrap thresholds, `.choices`/`.summary` tracks
  still mirror each other. One mechanical change was required: all four
  `repeat(…, 1fr)` rules became `repeat(…, minmax(0, 1fr))` (+ `min-width: 0` on
  `.choice-cell > .choice` and `.choice__title`) because the second 44px header
  button raised the card's intrinsic min-width past the track size, overflowing
  4–6-column boards. Verified in Chrome: card boxes equal their cells, columns
  align with summary cells, no page overflow. Existing tests stay green.
  *(Second revision, post-implementation polish)*: the board now lays out **two
  cards per row at ≥720px** (1-2 / 3-4 / 5-6) and **three per row at ≥1280px**
  (1-2-3 / 4-5-6), superseding 015's one-column-per-choice + 3-wide wrap;
  `.summary` mirrors both breakpoints (formula caption spans full width).
  Verified in Chrome: 6 cards → 3 aligned 2-up rows at 720–1279px.
- **B2**: 018 contracts untouched — `orderedChoices`, `rankByTotal`, `.sum--*` /
  `.sum__score--*` behaviour unchanged; Summary still renders identical output after
  the import swap (existing O/C/T/S tests stay green).
- **B3**: 016 contracts untouched — remove-confirm tests stay green with the card
  collapsed or expanded.
- **B4**: No new runtime dependency in `package.json`; `yarn build` green on a clean
  install (constitution Build gate; 013 lesson).

## M — Manual sweep (no layout engine in jsdom)

- **M1**: Fold animation smooth; instant under `prefers-reduced-motion` (FR-009).
- **M2**: 5–6-Choice wrapped board with mixed collapsed/expanded cards — rows stay
  tidy, footers pin to card bottoms, no layout breakage.
- **M3**: Footer AA contrast in light + dark (F4).
- **M4**: Keyboard-only: Tab reaches chevron → Enter/Space toggles; rename and ✕
  still reachable; focus never lost on collapse (SC-005).
- **M5**: 6 collapsed Choices × 5+ Points visible without board scroll on a typical
  desktop viewport (SC-002).
