# Contract: Choice Count & Layout (015)

## Behavior contract (automated — vitest/jsdom)

- **B1 — Add gating**: `addChoice()` appends while `choices.length < 6`; at exactly 6 it
  is a no-op. Toolbar `[data-action="add-choice"]` is disabled iff `length >= 6`, its
  label shows "… n / 6", and its disabled `title` reads "Maximum 6 choices" (i18n
  `toolbar.maxChoices` parameterized to `{n}` — must not keep the hardcoded "4").
- **B2 — Remove re-enables**: removing a Choice from a 6-board re-enables add; removal
  still refuses at `MIN_CHOICES` (2). `editing` state tied to a removed Choice is cleared
  (existing behavior, re-asserted at the 5/6 boundary).
- **B3 — Persistence range**: saved boards with 2–6 choices load verbatim; boards with 1
  or 7+ choices are rejected → default board (no throw). Storage key/version `sift.v1`
  unchanged.
- **B4 — Full lifecycle parity**: Choices 5 and 6 support title edit, point add/edit/
  remove, scoring, Sort/Group arrangement (009 ordering guarantees), and ghost
  placeholders "Choice 5"/"Choice 6" (EN) / "Варіант 5"/"Варіант 6" (UA) via the existing
  parameterized `choice.placeholder`.
- **B5 — Complexity hint (FR-012/SC-005)**: a single muted hint
  (`[data-hint="many-choices"]`, i18n `toolbar.manyChoices`, EN/UA) renders near the
  Add-choice control iff `choices.length >= 4`: absent at 2–3, present at 4/5/6, gone
  again after removal to 3 and after Clear (default board < 4). Always-visible plain text
  — never tooltip-only; informational only — `addChoice` proceeds normally while it shows;
  attached to the board (toolbar), never to an individual Choice card.

## Layout contract (pure CSS per Clarifications 2026-06-03; geometry verified manually — jsdom has no layout engine)

- **L1 — Count-conditional column rule (CSS-only)**: inside the existing
  `@media (min-width: 720px)` block, `.choices:has(> .choice:nth-child(5))` and
  `.summary:has(> .sum:nth-child(5))` switch to `repeat(3, 1fr)`. Effective columns:
  `2→2, 3→3, 4→4, 5→3 (3+2), 6→3 (3+3)`. No script computes layout values (FR-011);
  `--choice-count` continues to carry the raw count for the unchanged base rule.
- **L2 — Aligned sibling grids**: `.choices` and `.summary` MUST carry matching
  conditional rules (same trigger, same template) so card columns and score cells stay
  aligned in every wrapped configuration. ⚠ The `.summary` selector MUST count `.sum`
  cells (`> .sum:nth-child(5)`), never bare children — `.summary__formula` is also a grid
  child and a bare `:nth-child(5)` would falsely wrap a 4-Choice board.
- **L3 — Breakpoint behavior**: below 720px both grids are single-column (unchanged);
  at ≥720px the base `repeat(var(--choice-count), 1fr)` formula stays as-is
  (`src/styles/app.css:389–397, 556–559`) with the L1 override layered on top.
- **L4 — No regression for 2–4**: the override cannot match fewer than 5 cards, so 2–4
  layouts are identical to pre-015 at every viewport width, in both Sort and Group views.
- **L5 — Readable wrapped cards**: with the 1100px container cap, 5–6 Choices render 3
  columns (≈340px cards); six-across never renders (R2). `.summary__formula` keeps
  `grid-column: 1 / -1` (full-width caption under any column count). In a non-`:has()`
  browser the failure mode is today's behavior (N narrow columns), never breakage.
- **L6 — Equal-height cards (≥720px)**: `.choices { grid-auto-rows: 1fr }` makes every
  card the height of the tallest card on the board — uniform tiles within a row AND
  across the wrapped rows of a 5–6 board, growing together as points are added. NOT
  applied below 720px (stacked cards hug their own content). Pure CSS; `.choice` keeps
  no fixed height (it stretches as a grid item).

## Stability constraints

- **S1**: `data-action` hooks (`add-choice`, etc.) and `.choices`/`.choice`/`.summary`
  class names are preserved.
- **S2**: No new dependencies; no markup or script changes for *layout* — only one
  constant (`MAX_CHOICES`) and CSS rules (FR-011). The only markup addition anywhere is
  the Toolbar hint element (B5).
- **S3**: Domain logic (`scoring.ts`, `view.ts` `arrange`), store mutation API, and
  `sift.v1` format are unchanged apart from the widened count range.
