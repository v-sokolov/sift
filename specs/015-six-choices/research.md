# Research: Extend Choices to Six Options (015)

All Technical Context unknowns resolved. Five decisions.

## R1 — Wrap strategy: count-conditional pure CSS via `:has()` (clarified 2026-06-03)

**Decision** (per spec Clarifications, Session 2026-06-03 — user constraint: aligned +
solved via CSS): keep the existing grid formula and the `--choice-count` var (still fed
the raw count; markup and scripts untouched), and add a count-conditional override inside
the existing `@media (min-width: 720px)` block:

```css
@media (min-width: 720px) {
  /* unchanged: */ .choices, .summary { grid-template-columns: repeat(var(--choice-count, 2), 1fr); }
  /* new — 5+ Choices wrap at 3 per row, both grids: */
  .choices:has(> .choice:nth-child(5)) { grid-template-columns: repeat(3, 1fr); }
  .summary:has(> .sum:nth-child(5))    { grid-template-columns: repeat(3, 1fr); }
}
```

Below 720px both grids stay single-column (unchanged). Effective columns: **2→2, 3→3,
4→4, 5→3 (rows 3+2), 6→3 (rows 3+3)**.

⚠ Selector detail: the `.summary` rule MUST count `.sum` cells specifically
(`> .sum:nth-child(5)`), not bare `> :nth-child(5)` — the formula caption
`.summary__formula` is also a grid child, so a bare child count would falsely trigger the
3-column override on a 4-Choice board (4 `.sum` + caption = 5 children).

**Rationale**:
- **Pure CSS** (FR-011, user constraint): no script-computed layout values; zero JS/markup
  diff — the entire feature's layout half lives in `app.css`.
- **Zero regression for 2–4 by construction** (FR-008): the override only matches when a
  5th `.choice`/`.sum` exists; for 2–4 the original rule applies verbatim.
- **Balanced wrapping** (edge case "no orphaned card"): 6 → 3+3, 5 → 3+2.
- **Summary alignment** (FR-011): both sibling grids carry the identical conditional rule
  and share container width and `--space-4` gap, so score cells stay under their cards in
  every configuration.
- **Browser support**: `:has()` is supported in all evergreen browsers (Chrome/Edge 105+,
  Safari 15.4+, Firefox 121+), matching the app's target; no fallback needed — and the
  failure mode in an ancient browser is today's behavior (6 narrow columns), not breakage.

**Card width check** (container `#app` max-width 1100px, gap `--space-4` = 16px):
3 columns → ≈ (1100 − 2·16 − page padding)/3 ≈ **340px** per card — comfortably above the
worst width already shipped today (4 columns at a 720px viewport ≈ 165px/card).

**Testing note**: jsdom resolves neither `:has()` matching against grid layout nor track
sizing, so this rule is verified manually (quickstart M2–M7); automated tests cover the
behavior half (gating/persistence/lifecycle). Consistent with 014's manual-layout approach.

**Alternatives considered**:
- Pure helper `choiceColumns(count)` in `view.ts` feeding the var (original R1) —
  **superseded by clarification**: user requires the solution in CSS; the helper added a
  script-side layout computation and a two-component diff for what one stylesheet rule does.
- `repeat(auto-fit, minmax(min(100%, ~210px), 1fr))` on both grids — rejected: changes 2–4
  layouts at small/mid widths (FR-008), produces 3+1 orphans for 4 cards, and wrap points
  drift with padding differences between the two grids.
- `repeat(min(var(--choice-count), 3), 1fr)` — rejected: caps a 4-Choice board to 3
  columns too (4 → 3+1 orphan regression).
- Flexbox `flex-wrap: wrap` with `flex: 1 1 <basis>` — rejected: last-row cards grow wider
  than upper-row cards (unequal columns), and the Summary grid cannot share column tracks
  with a flex container, breaking score-under-card alignment.
- 4 columns for 5–6 (5 → 4+1, 6 → 4+2) — rejected: orphan rows and ≈250px cards; 3
  columns is calmer and balanced (Constitution I).

## R2 — Container width stays 1100px; six-across is intentionally unreachable

**Decision**: Keep `#app { max-width: 1100px }`. With the R1 mapping, 6 Choices render at
most 3 columns; a single row of 6 never occurs.

**Rationale**: Six tracks inside 1100px would be ≈170px each — below a readable, operable
card width, violating FR-006. US2 scenario 3 is conditional ("can sit in a single row
**when** each still meets the readable minimum width") — the condition never holds at this
container width, so wrapping is the compliant behavior. Widening the page just to fit six
columns would stretch line lengths everywhere and contradict the calm, readable layout
(Constitution I).

**Alternatives considered**: raising `max-width` to ~1500px for ≥6-across — rejected
(harms readability of every other element; benefits only one extreme configuration).

## R3 — Constitution re-scope: amend 2–4 → 2–6 (v2.1.0 → v2.2.0, MINOR)

**Decision**: Amend `.specify/memory/constitution.md`: scope-discipline bullet "a single
active dilemma with 2–4 choices" → "2–6 choices", and Principle IV's invariant example
"(e.g. 2–4 choices…)" → "(e.g. 2–6 choices…)". Version bump 2.2.0 with a one-line
rationale; the amendment lands with (or before) the `MAX_CHOICES` change.

**Rationale**: The constitution declares out-of-scope items so "until explicitly
re-scoped" — this spec is that explicit re-scope. MINOR fits governance semver
("materially expanded guidance"): the scope constraint materially widens, but no principle
is added, removed, or redefined. Precedent: 002 re-scoped "English only" to EN/UA.
(That stale "English only" wording is noted but NOT touched here — out of this feature's
scope; an amendment must stay minimal and on-topic.)

**Alternatives considered**: PATCH bump (rejected — this is a real constraint change, not
wording); leaving the constitution stale (rejected — `/speckit-analyze` treats constitution
conflicts as blocking, and Principle IV's invariant example would contradict the enforced
invariant).

## R4 — Persistence: widen the accepted range in place, no format change

**Decision**: No storage changes. `sift.v1` key, shape, and version stay as-is;
`persistence.ts:92`'s existing guard (`length < MIN_CHOICES || length > MAX_CHOICES`)
automatically accepts 2–6 and rejects 7+ once the constant changes.

**Rationale**: Widening an accepted range is strictly backward compatible — every board
valid under the 4-cap is valid under the 6-cap, so old saves load unchanged (FR-004).
Hand-edited storage with >6 choices hits the same reject-and-fall-back-to-default path
that >4 hits today (FR-005); defensive loading never crashes (constitution architecture
constraint).

**Alternatives considered**: bumping the storage key to `sift.v2` with a migration —
rejected as pure overengineering (YAGNI): there is nothing to migrate.

## R5 — Complexity hint at 4–6 Choices (clarified 2026-06-03, FR-012)

**Decision**: `Toolbar.svelte` renders one muted hint sentence when
`s.dilemma.choices.length >= 4` — always-visible plain text near the Add-choice control
(`<p class="toolbar__hint" data-hint="many-choices">`), new i18n key
`toolbar.manyChoices`, styled like existing faint text (`var(--text-muted)`/`--text-faint`,
small font). No tooltip, no aria-live (it is ambient state, not an alert), never disables
adding.

**Proposed wording** (final tone check at implementation; gentle observation, no
imperative, no "too many" judgment — Constitution I):
- EN: `'toolbar.manyChoices': 'Many choices can make a dilemma harder to weigh — fewer often brings more clarity.'`
- UA: `'toolbar.manyChoices': 'Багато варіантів можуть ускладнити зважування — менше часто дає більше ясності.'`

**Threshold**: visible at 4, 5, 6; hidden at 2–3 (user-clarified: warn from 4 up, i.e.
from the moment the board crosses into "getting crowded", one step before the old cap).
Derived directly from the live count — no persisted state, no dismissal flag (a dismissal
would itself be new persisted state and friction; the hint is quiet enough to stay).

**Related catch — `toolbar.maxChoices` string**: the disabled Add button's `title` is
`'Maximum 4 choices'` / UA equivalent (`src/i18n/en.ts:14`, `uk.ts`, used at
`Toolbar.svelte:82`). The earlier "zero string changes" claim missed it. Decision:
parameterize as `'Maximum {n} choices'` rendered with `MAX_CHOICES` (matching the
`choice.placeholder` pattern) so the cap lives in exactly one constant. This `title` is
allowed to stay hover-only because it duplicates information already visible as plain text
("6 / 6" + disabled state) — unlike the hint, it is not the sole carrier of its message.

**Testing**: fully jsdom-testable (component test): absent at 2–3, present at 4/5/6, text
matches EN/UA strings, `addChoice` still works at 4–5 with the hint visible (SC-005). TDD:
tests written failing-first.

**Alternatives considered**:
- Per-card "too many" badge + tooltip on Choices 5–6 (user's first sketch) — rejected:
  labels the user's own content as a mistake (anti-Constitution-I), tooltip-only
  explanation invisible to keyboard/touch (anti-Principle-V), adds per-card markup.
- Tooltip on the disabled Add button only at 6 — rejected: hover-only, silent about the
  5th Choice, no reflective value before the cap.
- Confirm dialog before adding a 5th Choice — rejected: blocking friction, the opposite
  of a calm aid.
- `aria-live` announcement on threshold crossing — rejected: over-announcing ambient
  state; the hint is discoverable in normal reading order.
