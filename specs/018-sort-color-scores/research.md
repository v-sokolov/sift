# Research & Decisions: 018-sort-color-scores

Phase 0 output. All Technical Context unknowns were resolvable from the existing codebase
and the 2026-06-03/2026-06-07 clarifications; none remain `NEEDS CLARIFICATION`.

## R1 — No new runtime dependency

**Decision**: Implement entirely with native HTML (`<input type="checkbox">`), a pure
array sort, Svelte's built-in `animate:flip`, and CSS. Add **no** runtime dependency.

**Rationale**: Ranking is a stable sort over ≤6 items and colour is a class swap — neither
needs a library. A new dependency is the documented 013 failure mode (a dep that passes
`tsc`+`vitest` but breaks the clean-install `vite build`); avoiding one keeps the build
gate trivially green. Aligns with Principle III (smallest thing that does the job) and
contrasts intentionally with 017, which genuinely required `svelte-dnd-action`.

**Alternatives considered**: A sortable/table library (rejected — gross overkill, bundle +
clean-install risk for zero benefit).

## R2 — Single shared display-order helper

**Decision**: Add a pure `orderedChoices(choices: Choice[], rankByTotal: boolean): Choice[]`
to `view.ts` and consume it in **both** `App.svelte` (the `.choices` card grid) and
`Summary.svelte` (the `.sum` score-cell grid).

**Rationale**: The two are independent CSS grids (each driven by `--choice-count`) that are
**column-aligned** — score cell *k* sits under card *k*. If only one reordered, scores
would detach from their cards. A single ordering source keeps them in lockstep. Putting it
in `view.ts` (presentation arrangement, alongside `arrange()`) keeps ordering logic pure
and testable, separate from components.

**Sort law**: stable, score **descending**, ties broken by original index:
`choices.map((c,i)=>({c,i,score:choiceScore(c)})).sort((a,b)=>b.score-a.score || a.i-b.i).map(x=>x.c)`.
The explicit `|| a.i-b.i` makes ties deterministic regardless of engine sort stability
(FR-003). `rankByTotal === false` returns the input array unchanged (FR-005).

**Alternatives considered**: Reorder by mutating `dilemma.choices` (rejected — violates
FR-006 display-only and would corrupt authoring order / persistence). Sort inside each
component independently (rejected — duplication + drift risk between the two grids).

## R3 — Placeholder index stays the authoring index

**Decision**: When Rank reorders cards, the `index` passed to `ChoiceCard` (used only for
the untitled-ghost label "Choice {n}") MUST remain the Choice's **stored** position, not its
display rank. In `App.svelte`: `index={s.dilemma.choices.indexOf(choice)}` while iterating
the ordered list.

**Rationale**: The ghost label is an identity cue for an unnamed Choice; renumbering it on
every re-sort would be disorienting and falsely imply the stored order changed. `indexOf`
on the original array is O(n²) but n ≤ 6 — negligible.

**Alternatives considered**: Use display index (rejected — labels jump on sort). Have
`orderedChoices` return `{choice, originalIndex}` pairs (viable, but `indexOf` keeps the
helper's signature minimal and the components simple).

## R4 — Persisted `rankByTotal`, additive & defensive

**Decision**: Add `rankByTotal: boolean` to `ViewPrefs` (default `false` in
`emptyDilemma()`). In `persistence.ts.load()`, coerce a missing/non-boolean value to
`false` (do **not** reject the payload). No `schemaVersion` bump; `validView` does not
require the field.

**Rationale**: Mirrors the 008 `groupKey` precedent exactly — additive view prefs default
in on load so pre-018 saves load unchanged. Keeps `STORAGE_KEY`/schema stable (Principle II
defensive-load contract).

**Alternatives considered**: Bump `schemaVersion` to 2 (rejected — unnecessary migration
for an additive optional field). Treat Rank as session-only (rejected — FR-007 requires
persistence across reloads).

## R5 — Score colour reuses existing semantic tokens

**Decision**: Colour `.sum__score` by sign via a modifier class
(`.sum__score--positive|--negative|--neutral`) mapping to the **existing** palette tokens
`--advantage` (positive), `--disadvantage` (negative), `--neutral` (zero) — already defined
for both light and dark themes (used by the point dots). Remove the current
`.sum--leader .sum__score { color: var(--leader-border) }` override so the **sign colour
wins** even on the leader cell; keep the leader cell's background/border tint.

**Rationale**: These three tokens are the project's canonical advantage/disadvantage/neutral
colours, already AA-tuned per theme and already the meaning of "good/bad/neutral" elsewhere
— so a positive total being "advantage-green" is semantically consistent and adds zero new
palette surface. Letting sign win on the leader cell avoids a contradiction where a leader
with a negative/zero top score would still read green. `signed()` keeps the +/−/0 text, so
colour remains supplementary (Principle V, FR-011).

**Open verification (manual)**: AA contrast of `--advantage`/`--disadvantage`/`--neutral`
text over both the normal `--surface` and the `--leader-bg` tint, in light and dark — jsdom
cannot measure this (014/016 precedent: layout/contrast checks are manual).

**Alternatives considered**: New dedicated `--score-*` tokens (rejected — duplicates the
semantic palette; more surface to keep AA-consistent). Keep leader green override (rejected
— contradicts sign colouring).

## R6 — Smooth, reduced-motion-aware reorder

**Decision**: Apply `animate:flip` to the `.choices` (and `.sum`) keyed `{#each}` so cards
slide to new positions when Rank toggles or a total changes. Gate the flip `duration` to `0`
when `prefers-reduced-motion: reduce` matches (read once via `matchMedia`).

**Rationale**: FR-008. Svelte `flip` does not auto-respect reduced motion, so the duration
must be gated explicitly. The codebase already has a global reduced-motion CSS block
(app.css:97) and reduced-motion-aware transitions per the 004 rebuild; this extends the same
discipline to the JS-driven flip.

**Alternatives considered**: CSS-only transition (rejected — FLIP on reordering keyed lists
is what Svelte's `animate:` is for; hand-rolling is more code).

## R7 — Test strategy (red-first)

**Decision**: TDD per Principle IV.
- **Pure** (`tests/unit/view.test.ts`): `orderedChoices` — descending order, stable ties
  (equal totals keep original order), `rank=false` returns identity, negative sorts below
  positive, empty/single list. (`tests/unit/persistence.test.ts`): `rankByTotal` round-trips
  `true`; an old payload without it loads as `false`.
- **State/DOM** (`tests/components/store.test.ts`): `toggleRank` flips the flag, fires the
  persist channel, and does **not** flip the save-status indicator (it is a preference, not
  a content edit — the 010 `touch()` rule). (`toolbar.test.ts`): Rank checkbox renders, sits
  left of the divider with the "Choices" scope label, toggles the store. (new
  `sort-color.test.ts`): with Rank on, rendered card/score DOM order reflects descending
  totals; `.sum__score` carries the sign class matching +/−/0.
- **Manual only** (quickstart): real colour contrast (AA) in both themes incl. leader cell,
  flip smoothness, reduced-motion suppression, persistence across reload, summary↔card
  column alignment after sort. jsdom has no layout/contrast/animation engine (014/016
  precedent).
