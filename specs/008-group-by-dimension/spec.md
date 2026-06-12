# Feature Specification: Group by Dimension & Add-Point Placement

> **Status: Shipped — condensed 2026-06-09**

Branch `008-group-by-dimension` · merged PR #9. Two independent UI changes: (US1) fix
the Group control to pick a **grouping dimension**, and (US2) move **Add point** above
the score.

## What shipped

### US1 — Group by Type / Weight dimension

Group mode previously always split points by *kind* (Advantages / Disadvantages /
Neutral) and offered only an **Asc / Desc** direction toggle — a control that does not
belong to grouping (the reported defect). Group now offers a **Type / Weight** segment
that chooses the dimension points are bucketed by:

- **By Type** — Advantages, Disadvantages, Neutral sections (the prior grouped
  behaviour, reproduced exactly). Weighted sections order heaviest weight first; Neutral
  keeps creation order.
- **By Weight** — one section per weight value present, ordered 3 → 2 → 1, each holding
  **all** points of that weight regardless of type; weightless (neutral) points collect
  in a single distinct section shown last. Every section keeps creation order.

The **Asc / Desc** direction control renders only in **Sort** mode now; **Sort** itself
is unchanged (still offers its Type/Weight sort key + Asc/Desc direction, byte-for-byte
the same ordering as before). Empty sections render nothing. Each section carries a
localized heading (EN + UK): type names, `Weight {n}`, and a Neutral label for
weightless. The grouping control reuses the existing `.seg` styling so it stays
keyboard-operable, focus-visible, and ≥44px.

### US2 — Add-point placement

The **Add point** control (and the add/edit form it expands into) was moved **above** the
score summary in `App.svelte` render order, so the primary repeated action precedes the
read-only result. Pure render-order change — no props, store calls, or scoring behaviour
changed.

## Key decisions

- **Single additive persisted field `groupKey: 'type' | 'weight'`** on `ViewPrefs`
  (default `'type'`), living alongside the other view preferences and persisted with
  them via a new `setGroupKey()` store mutation (same shape as `setSortKey`).
- **`groupKey` defensive-default precedent (cited by feature 018):** adding `groupKey`
  is an **additive, backward-compatible** change to the saved view preferences. The
  persisted slice stays `schemaVersion: 1` — **no version bump / no migration**. A saved
  state from before this feature (missing `groupKey`), or one with a present-but-invalid
  value, **loads successfully and defaults to `'type'`** on load — exactly as the `lang`
  field is defaulted today. No existing saved-state field changes meaning. See
  `data-model.md` (T2 load transition, R7).
- Grouping is computed by the pure `arrange()` in `view.ts`; the point data model and
  scoring formula are untouched (grouping is display-only). Every point appears in
  exactly one section under either dimension — none lost, duplicated, or altered.
- `Section.label` widened (in-memory only, never serialized) to
  `NoteType | Weight | 'weightless' | null` to carry weight headings.

## Acceptance highlights

- Group on → Type/Weight segment present, Asc/Desc absent. By Type reproduces the prior
  section structure; By Weight places each point in exactly one weight-determined section
  (weightless last), sections ordered highest weight first.
- Switching dimension re-sections instantly with no point lost/duplicated/modified.
- Chosen dimension survives reload; pre-existing saves load without error and default to
  By Type.
- Sort mode ordering identical before/after. Add-point renders above the score and adding
  a point still updates it.

## Contracts & data model

- `contracts/arrange-grouping.md` — `arrange()` grouped-by-dimension output law.
- `contracts/group-toolbar.md` — toolbar control, store `setGroupKey`, section labels, i18n.
- `contracts/addpoint-order.md` — Add-point-above-score render order.
- `data-model.md` — `GroupKey` type, `ViewPrefs.groupKey`, widened `Section.label`,
  load/clear transitions.
