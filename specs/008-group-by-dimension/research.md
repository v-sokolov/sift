# Research & Decisions: Group by Dimension & Add-Point Placement

Feature: `008-group-by-dimension`. All decisions are within the existing 004/006/007 stack; there
are no NEEDS CLARIFICATION items (the central scope question was resolved in spec Clarifications,
Session 2026-05-31). Each entry: Decision · Rationale · Alternatives considered.

## R1 — Model the grouping dimension as a new `ViewPrefs.groupKey`

- **Decision**: Add `export type GroupKey = 'type' | 'weight'` and a `groupKey: GroupKey` field to
  `ViewPrefs`, defaulting to `'type'` in `emptyDilemma()`. It is a sibling of `mode`/`sortKey`/
  `direction`/`theme`/`lang`.
- **Rationale**: Grouping dimension is a view preference like sort key — it belongs with the others
  and is persisted with them. A distinct field (not overloading the existing `sortKey`) keeps Group
  and Sort independent so each remembers its own setting (FR-012: Sort unchanged).
- **Alternatives**: (a) Reuse `sortKey` for both Group and Sort — rejected: couples the two modes,
  so changing the group dimension would silently change the sort key and vice-versa. (b) Derive
  grouping from `direction` — rejected: that is exactly today's bug (a control that doesn't map to
  grouping).

## R2 — `arrange()` grouped branch: section by `groupKey`

- **Decision**: Rewrite the `prefs.mode === 'grouped'` branch:
  - `groupKey === 'type'` → three sections `advantage`, `disadvantage`, `neutral` (existing order);
    weighted sections ordered **heaviest weight first**; neutral keeps creation order.
  - `groupKey === 'weight'` → sections for weight `3`, `2`, `1` (descending), each containing all
    notes of that weight regardless of type, in **creation order**; a final section for weightless
    (neutral) notes in creation order. Empty sections are still produced by `arrange` and filtered
    at render time (matching today's pattern), OR omitted — see R4.
- **Rationale**: Honours FR-002/FR-003/FR-004 and keeps `arrange` pure and total. Heaviest-first for
  Type reproduces the prior grouped default (default `direction` was `'desc'`), so the common case
  is visually unchanged (SC-002). Creation order for weight sections is the simplest stable rule
  (FR-007).
- **Alternatives**: (a) Keep using `direction` to order within Type sections — rejected: direction
  is no longer surfaced in Group mode, so a fixed heaviest-first default is clearer than honouring a
  now-hidden pref. (b) Sort weight sections' members by type — rejected: YAGNI; creation order is
  predictable and needs no new rule.

## R3 — Section label shape for the `Section` type

- **Decision**: Keep `Section.label` carrying enough to render a heading. For Type grouping the
  label is the `NoteType` (as today). For Weight grouping introduce a label the renderer can map to
  text: represent a weighted section by its weight value and the weightless section distinctly.
  Concretely, widen `Section.label` to `NoteType | Weight | 'weightless' | null` (or an equivalent
  discriminated shape) so `ChoiceCard` can pick the right i18n string.
- **Rationale**: `arrange` is the single place that knows the bucketing; the label must be
  expressive enough for the renderer without the renderer re-deriving buckets. Minimal widening of
  the existing `label` field avoids a parallel structure.
- **Alternatives**: (a) Emit pre-localized strings from `arrange` — rejected: `arrange` is pure and
  framework/i18n-agnostic; localization is the renderer's job (keeps the parity tests meaningful).
  (b) A separate `kind` + `value` pair on `Section` — acceptable but heavier than widening `label`;
  defer unless the union proves awkward in tests.

## R4 — Empty sections are not rendered

- **Decision**: Preserve the current rendering rule in `ChoiceCard`: a labelled section with zero
  notes is skipped (`{#if !(section.label && section.notes.length === 0)}`). For By-Weight this
  means a weight value with no notes shows no heading (FR-008, edge case).
- **Rationale**: Already the established behaviour for grouped type sections; reusing it keeps the
  UI calm and the change small. Whether `arrange` emits empties or omits them, the render guard is
  the safety net.
- **Alternatives**: Have `arrange` omit empty sections entirely — fine, and slightly cleaner; the
  render guard stays regardless for robustness.

## R5 — Toolbar: swap Asc/Desc for Type/Weight in the grouped row only

- **Decision**: In `Toolbar.svelte`, when `mode === 'grouped'` render a `.seg` segmented control
  with two buttons (Type, Weight) bound to `setGroupKey`, using `aria-pressed` on the active one and
  reusing labels `toolbar.weight` / `toolbar.type`. The Asc/Desc segment renders only when
  `mode === 'sorted'`. The Sort row keeps both its sort-key and direction segments unchanged.
- **Rationale**: Direct fix for the reported defect (FR-005). Reuses the existing `.seg` pattern, so
  accessibility (role=group, focus-visible, 44px) and styling come for free (FR-017). Reusing the
  weight/type labels avoids new copy.
- **Alternatives**: Show both controls in Group mode (mirror Sort) — rejected by the user's
  clarification ("type/weight, **not** asc/desc").

## R6 — i18n additions

- **Decision**: Add to `en.ts` (and mirror in `uk.ts`): `toolbar.groupBy` (row label, e.g. "Group
  by:" / "Групувати за:"), `toolbar.groupKeyAria` (segment aria-label, e.g. "Group by" /
  "Групувати за"), and weight-section labels for By-Weight headings — `group.weight` with an
  interpolated value (e.g. "Weight {n}" / "Вага {n}") and `group.weightless` (e.g. "Neutral" /
  "Нейтральні", reusing the neutral concept) for the weightless section. Existing `toolbar.weight`/
  `toolbar.type` are reused for the segment button text.
- **Rationale**: EN is authoritative; UK must mirror (parity test). Interpolated `group.weight`
  keeps one key for all weight headings. FR-011.
- **Alternatives**: Reuse `note.weightLabel` (", weight {n}") for headings — rejected: that string
  is a comma-prefixed inline fragment, not a heading; a dedicated key reads correctly.

## R7 — Persistence: additive field, default on load, no version bump

- **Decision**: Leave `validView` lenient (it already does not hard-require `lang`); do not add
  `groupKey` to its required checks. In `load()`, after validation, if `view.groupKey` is not a
  valid `GroupKey`, set it to `'type'` (mirroring how an invalid `lang` is dropped/defaulted). Keep
  `schemaVersion: 1`.
- **Rationale**: Backward compatibility (FR-010/FR-016) — pre-feature saves (no `groupKey`) load and
  default to By Type, the prior behaviour. Additive + defaulted needs no migration, consistent with
  the i18n `lang` precedent and Principle II's "defensive load → valid default, never crash".
- **Alternatives**: (a) Bump `schemaVersion` to 2 with a migration — rejected: overkill for a
  defaulted optional field; adds migration surface for no behavioural need. (b) Add `groupKey` to
  `validView`'s required set — rejected: would make every old save invalid and wipe it to empty,
  violating FR-010.

## R8 — Store mutation `setGroupKey`

- **Decision**: Add `export function setGroupKey(key: GroupKey)` that sets `d.view.groupKey` inside
  `update(...)`, matching the shape of `setSortKey`/`setDirection`. Group/Sort `toggle*` functions
  are unchanged.
- **Rationale**: All view-pref changes flow through typed store mutations (architecture constraint);
  this is the same one-line pattern as the neighbouring setters.
- **Alternatives**: Mutate from the component — rejected: violates the single-mutation-path rule.

## R9 — US2 Add-point placement is a pure render-order swap

- **Decision**: In `App.svelte`, swap the order of `<Summary />` and `<AddEditForm />` so
  `<AddEditForm />` (Add-point trigger and the form it expands into) precedes `<Summary />`. No
  change to either component.
- **Rationale**: FR-013/FR-014 — placement only; logic and scoring untouched. The add/edit form
  occupies the Add-point control's slot, so it too appears above the score when open (edge case).
- **Alternatives**: Extract only the Add-point button above the score and leave the expanded form
  below — rejected: splits one component's two states across the page, more complex and visually
  inconsistent.

## R10 — Test strategy (Principle IV, fail-first)

- **Decision**:
  - `tests/unit/view.test.ts`: **update** the existing grouped cases (they assert direction-driven
    within-section order, the old contract) to the new `groupKey`-driven contract, and **add**
    By-Weight cases (sections 3→2→1 + weightless; mixed-type same-weight share a section; creation
    order within). These are sanctioned updates of tests pinning intentionally-changed behaviour.
  - `tests/unit/persistence.test.ts`: add a case that a payload missing `groupKey` (and one with an
    invalid value) loads and yields `view.groupKey === 'type'`.
  - `tests/components/`: a Toolbar test that Group mode renders a Type/Weight segment and **no**
    Asc/Desc segment, and that activating Weight changes the rendered sectioning; assert the Sort
    row still shows Asc/Desc. Assert (via the existing harness) that the Add-point control precedes
    the Summary in DOM order.
- **Rationale**: Behaviour changes must be test-accompanied and fail first (Principle IV). The
  grouped `view.test.ts` edits are the one place existing tests pin the old behaviour — they are
  updated deliberately, mirroring the 007 `lifecycle.test.ts` precedent.
- **Alternatives**: Leave old grouped tests and only add new ones — rejected: they would fail
  against the new contract; they must be migrated, not duplicated.
