# Contract: Sort Choices by Total & Colour-Code Scores

Behavioural contract for 018. IDs are referenced by tasks and tests. Pure-logic and
state/persistence items are automatable (jsdom); visual/contrast/animation items are manual.

## Ordering law — `orderedChoices(choices, rankByTotal)` (pure, `view.ts`)

- **O1**: When `rankByTotal === false`, returns the choices in their original order
  (identity ordering). *(FR-005)*
- **O2**: When `rankByTotal === true`, returns choices ordered by `choiceScore`
  **descending** (highest total first). *(FR-002)*
- **O3**: Ties (equal `choiceScore`) preserve the choices' **original relative order** —
  stable, deterministic. *(FR-003)*
- **O4**: A negative total always sorts **after** any positive or zero total; a zero sorts
  after any positive. *(FR-002)*
- **O5**: Pure & non-destructive — does not mutate the input array or any Choice; the stored
  `dilemma.choices` order is unchanged after rendering. *(FR-006)*
- **O6**: Handles edge sizes without error: empty list → empty; single Choice → unchanged;
  all-equal totals → original order. *(Edge cases)*

## Colour mapping — `.sum__score` (Summary)

- **C1**: A total `> 0` renders `.sum__score` in the positive colour (`--advantage`). *(FR-010)*
- **C2**: A total `< 0` renders it in the negative colour (`--disadvantage`). *(FR-010)*
- **C3**: A total `=== 0` renders it in the neutral colour (`--neutral`). *(FR-010)*
- **C4**: The numeric value and its sign (`signed()` → `+n` / `−n` / `0`) remain rendered
  regardless of colour — meaning is never colour-only. *(FR-011, Principle V)*
- **C5**: Each cell also carries a sign modifier `.sum--positive|--negative|--neutral`
  giving a soft sign-coloured background + sign-coloured top border; `.sum--leader` is
  applied last and overrides the positive tint so the top choice stays distinct. *(FR-017)*

## Mutation — `toggleRank()` (`store.svelte.ts`)

- **T1**: Flips `view.rankByTotal` between `true`/`false`. *(FR-001)*
- **T2**: Goes through the persist channel (fires `notifySave`) so the new value is saved.
  *(FR-007)*
- **T3**: Is a **preference** mutation — it does NOT call `touch()`, so it never stamps
  `updatedAt` and never flips the save-status indicator to `editing`/`saved` (010 rule;
  matches `toggleGroup`/`setSortKey`). 

## Persistence

- **P1**: `rankByTotal` round-trips through `localStorage` (`sift.v1`): a saved `true`
  reloads as `true`. *(FR-007)*
- **P2**: A payload missing `rankByTotal` (pre-018) or with a non-boolean value loads as
  `false` and is **not** rejected (defensive default; no `schemaVersion` bump). *(R4)*

## UI / scope-label structure — Toolbar top row

- **S1**: The toolbar renders, in order, a **"Choices" scope label**, the **Rank toggle**
  (label "Rank by score"), a **divider**, a **"Points" scope label**, then the existing
  **Group** and **Sort** toggles — i.e. Rank is left of the divider, Group/Sort right.
  *(Clarification 2026-06-07, FR-001)*
- **S2**: The Rank control is a **toggle button** styled like Group/Sort — fully
  keyboard-operable; `aria-pressed` reflects `view.rankByTotal`; clicking calls
  `toggleRank`. *(FR-001, Principle V)*
- **S3**: All new text — "Rank by score", "Choices", "Points" — resolves via i18n in both EN
  and UA (`toolbar.rank`, `toolbar.scopeChoices`, `toolbar.scopePoints`); no hard-coded
  strings. *(FR-009)*

## Manual-only (visual / motion — jsdom cannot assert)

- **M1**: Score colours meet WCAG AA contrast over the normal surface in both light and dark
  themes. *(FR-012)*
- **M2**: Score colours meet AA over the **leader-cell background** (`--leader-bg`) too, in
  both themes (the leader cell keeps its tint; sign colour wins on the score). *(R5, FR-012)*
- **M3**: Toggling Rank (and editing a point that changes a total) animates the card/score
  reorder smoothly; with `prefers-reduced-motion: reduce` the reorder is instantaneous.
  *(FR-008)*
- **M4**: After sorting, each score cell stays column-aligned under its own card (the two
  grids reorder together). *(R2)*
- **M5**: A total changing sign updates both the rank position (when Rank on) and the score
  colour in the same interaction, no refresh. *(FR-013, SC-007)*
