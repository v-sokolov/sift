# Contract: Choice Count & Layout (015)

## Behavior contract (automated — vitest/jsdom)

- **B1 — Add gating**: `addChoice()` appends while `choices.length < 6`; at 6 it
  is a no-op. Toolbar `[data-action="add-choice"]` is disabled iff `length >= 6`,
  its label shows "… n / 6", and its disabled `title` reads "Maximum 6 choices"
  (i18n `toolbar.maxChoices` parameterized to `{n}`).
- **B2 — Remove re-enables**: removing from a 6-board re-enables add; removal
  still refuses at `MIN_CHOICES` (2). `editing` tied to a removed Choice clears.
- **B3 — Persistence range**: boards with 2–6 choices load verbatim; 1 or 7+
  reject → default board (no throw). Key/version `sift.v1` unchanged.
- **B4 — Lifecycle parity**: Choices 5–6 support title edit, point add/edit/
  remove, scoring, Sort/Group arrangement (009 ordering), and ghost placeholders
  "Choice 5/6" (EN) / "Варіант 5/6" (UA) via parameterized `choice.placeholder`.
- **B5 — Complexity hint (FR-012)**: one muted hint (`[data-hint="many-choices"]`,
  i18n `toolbar.manyChoices`, EN/UA) renders near Add-choice iff
  `choices.length >= 4`: absent at 2–3, present at 4/5/6, gone after removal to 3
  and after Clear. Always-visible plain text, informational only, on the toolbar.

## Layout contract (pure CSS; geometry verified manually — jsdom has no layout engine)

- **L1 — Count-conditional column rule (CSS-only)**: inside the existing
  `@media (min-width: 720px)` block, `.choices:has(> .choice:nth-child(5))` and
  `.summary:has(> .sum:nth-child(5))` switch to `repeat(3, 1fr)`. Effective
  columns: `2→2, 3→3, 4→4, 5→3 (3+2), 6→3 (3+3)`. No script computes layout
  (FR-011); `--choice-count` still carries the raw count for the base rule.
- **L2 — Aligned sibling grids**: `.choices` and `.summary` carry matching
  conditional rules so cards and score cells stay aligned. The `.summary`
  selector MUST count `.sum` cells (`> .sum:nth-child(5)`), never bare children —
  `.summary__formula` is also a grid child and would falsely wrap a 4-Choice board.
- **L3 — Breakpoint**: below 720px both grids single-column (unchanged); at
  ≥720px the base `repeat(var(--choice-count), 1fr)` stays with L1 layered on top.
- **L4 — No regression for 2–4**: the override cannot match <5 cards, so 2–4
  layouts are identical to pre-015 at every width, in both Sort and Group views.
- **L5 — Readable wrapped cards**: with the 1100px container, 5–6 Choices render
  3 columns (≈340px); six-across never renders. `.summary__formula` keeps
  `grid-column: 1 / -1`. Non-`:has()` failure mode = today's N narrow columns.
- **L6 — Equal-height cards (≥720px)**: `.choices { grid-auto-rows: 1fr }` makes
  every card the height of the tallest, within and across wrapped rows. NOT
  applied below 720px (stacked cards hug content); `.choice` keeps no fixed height.

## Stability constraints

- **S1**: `data-action` hooks and `.choices`/`.choice`/`.summary` class names preserved.
- **S2**: No new dependencies; no markup/script changes for layout — only the
  `MAX_CHOICES` constant + CSS rules. Sole markup addition is the Toolbar hint (B5).
- **S3**: Domain logic (`scoring.ts`, `view.ts` `arrange`), store API, and
  `sift.v1` format unchanged apart from the widened count range.
