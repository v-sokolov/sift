# Feature Specification: Extend Choices to Six Options

> **Status: Shipped — condensed 2026-06-09**

## What shipped

Raised the per-board Choice cap from 4 to 6 (minimum stays 2) and made the
Choice-card layout wrap cleanly at the higher counts, with a gentle complexity
hint as the board grows.

- **Cap 4 → 6 (`MAX_CHOICES`)**: the single constant `MAX_CHOICES` in
  `src/types.ts` went 4 → 6 (`MIN_CHOICES` unchanged at 2). It is the only
  source of truth — the store `addChoice`/`removeChoice` guards, the persistence
  range validator, and the Toolbar's "n / MAX" add-control all read it, so the
  bump propagates everywhere. The disabled-button title `toolbar.maxChoices` was
  parameterized from hardcoded "Maximum 4 choices" to "Maximum {n} choices"
  (rendered with `MAX_CHOICES`); `choice.placeholder` ("Choice {n}" EN /
  "Варіант {n}" UA) already covered Choices 5–6.
- **`:has()` wrap layout**: pure CSS, no script or markup change (the layout
  contract). Inside the existing `@media (min-width: 720px)` block,
  `.choices:has(> .choice:nth-child(5))` and `.summary:has(> .sum:nth-child(5))`
  switch both grids to `repeat(3, 1fr)` once a 5th Choice exists — effective
  columns `2→2, 3→3, 4→4, 5→3 (3+2), 6→3 (3+3)`. The `.summary` rule counts
  `.sum` cells (not bare children) so the formula caption doesn't falsely trip a
  4-Choice board. `grid-auto-rows: 1fr` keeps cards equal-height across wrapped
  rows at ≥720px; below 720px both grids stay single-column and cards hug their
  content. 2–4-Choice layouts are bit-identical to before (the override cannot
  match them). Six-across is intentionally unreachable: the 1100px container caps
  at 3 columns (≈340px cards), which beats cramming six ≈170px columns.
- **Complexity hint at 4–6**: the Toolbar renders one muted, always-visible
  sentence (`data-hint="many-choices"`, i18n `toolbar.manyChoices` EN/UA) near
  the Add-choice control while `choices.length >= 4` — gone at 2–3 and after
  Clear. Plain text (never tooltip-only), derived from the live count, purely
  informational (never blocks or delays adding), attached to the board, never to
  an individual Choice.

## Why

Comparing more than four candidates (six apartments, six job offers) was
impossible at the old cap, and naively rendering 5–6 fixed columns at laptop
width makes cards too narrow to read or operate. Wrapping keeps every visible
card readable; the hint preserves the product's calm, reflective character as
boards grow, without scolding the user's own content.

## Key decisions

- **Pure CSS wrap** (no `view.ts` helper, no markup restructuring): the entire
  layout half lives in `app.css`, zero regression for 2–4 by construction, and
  the failure mode in a non-`:has()` browser is today's narrow columns, never
  breakage.
- **No storage-format change**: widening an accepted range is backward
  compatible — every board valid under the 4-cap stays valid, so old `sift.v1`
  saves load unchanged; >6-choice hand-edits hit the existing reject-to-default
  path. No `sift.v2` migration (nothing to migrate).
- **3 columns, not 4, for 5–6**: balanced rows (3+2 / 3+3, no orphan), calmer
  and wider than a 4+1 / 4+2 split.
- **Gentle hint, not a per-card badge or blocking dialog**: a per-card "too many"
  badge labels the user's content as a mistake and a confirm dialog adds
  friction — both anti-calm; the always-visible muted sentence is the minimal,
  accessible nudge.

## Governance

This feature re-scoped the constitution **v2.1.0 → v2.2.0** (MINOR): the
scope-discipline line "2–4 choices" → "2–6 choices" and Principle IV's invariant
example likewise — exercising the documented "until explicitly re-scoped" path
(precedent: 002 re-scoped "English only" → EN/UA). See `.specify/memory/constitution.md`.

Shipped in merged PR #17.
