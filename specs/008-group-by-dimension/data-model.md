# Data Model: Group by Dimension & Add-Point Placement

Feature `008-group-by-dimension`. The persisted **note data model is unchanged** (FR-015): `Note`,
`Choice`, `Dilemma`, `Weight`, `NoteType` keep their current shapes. The only model change is one
additive field on the view preferences plus a widened in-memory section label. No `schemaVersion`
bump (R7).

## Changed / added types

### `GroupKey` (new)

```ts
export type GroupKey = 'type' | 'weight';
```

The dimension Group mode buckets points by. Default `'type'`.

### `ViewPrefs` (one field added)

| Field        | Type        | Notes                                                        |
|--------------|-------------|--------------------------------------------------------------|
| mode         | ViewMode    | unchanged (`default` \| `grouped` \| `sorted`)               |
| sortKey      | SortKey     | unchanged — **Sort** mode only                               |
| direction    | Direction   | unchanged — **Sort** mode only (no longer surfaced in Group) |
| **groupKey** | **GroupKey**| **new** — **Group** mode only; default `'type'`              |
| theme        | Theme       | unchanged                                                    |
| lang         | Lang        | unchanged                                                    |

`PersistedV1.view` therefore gains `groupKey`. The persisted slice stays `schemaVersion: 1`; a
loaded payload missing/with-invalid `groupKey` is defaulted to `'type'` (R7), exactly as `lang` is
defaulted today.

### `Section.label` (widened, in-memory only — not persisted)

Today: `label: NoteType | null`. Widen to carry weight-section headings:

```ts
export interface Section {
  label: NoteType | Weight | 'weightless' | null; // null = flat list
  notes: Note[];
}
```

- `null` — flat list (`default`/`sorted` modes), no heading.
- `NoteType` (`advantage` | `disadvantage` | `neutral`) — Type-dimension grouped sections (as today).
- `Weight` (`1 | 2 | 3`) — a By-Weight section; renderer shows "Weight {n}".
- `'weightless'` — the trailing By-Weight section holding neutral/weightless notes.

This is a transient render structure produced by `arrange()`; it is never serialized.

## `arrange()` output contract (grouped mode)

Given a `Choice` and `ViewPrefs` with `mode === 'grouped'`:

**`groupKey === 'type'`** → exactly three sections in this order (empties filtered at render):

| # | label          | members                       | order within             |
|---|----------------|-------------------------------|--------------------------|
| 1 | `advantage`    | type === advantage            | weight **descending**    |
| 2 | `disadvantage` | type === disadvantage         | weight **descending**    |
| 3 | `neutral`      | type === neutral              | creation order           |

**`groupKey === 'weight'`** → weighted sections by descending weight, then the weightless section:

| # | label         | members                              | order within   |
|---|---------------|--------------------------------------|----------------|
| 1 | `3`           | weight === 3 (any type)              | creation order |
| 2 | `2`           | weight === 2 (any type)              | creation order |
| 3 | `1`           | weight === 1 (any type)              | creation order |
| 4 | `'weightless'`| weight === null (neutral)            | creation order |

Empty sections produce no heading (skipped at render). `default` and `sorted` modes are unchanged.

## State transitions

No lifecycle/state-machine changes. The relevant transitions:

- **T1 — toggle group dimension**: `setGroupKey('type' | 'weight')` sets `view.groupKey`; if Group
  mode is active the choices re-section immediately. Idempotent; never touches notes (FR-004 data
  integrity, SC-005).
- **T2 — load with legacy view**: `load()` reads a payload without `groupKey` → resolves
  `view.groupKey = 'type'` (FR-010). Present-but-invalid value → same default.
- **T3 — clear**: `clearDilemma()` already preserves `lang` and `theme` (007). `groupKey` is reset
  to its default `'type'` via `emptyDilemma()` (Clear is not required to preserve grouping; out of
  scope here — no behaviour change requested for Clear).

## Invariants preserved

- Note fields, types, and weights unchanged (FR-015).
- Scoring formula unchanged (FR-015) — grouping never affects totals.
- `localStorage` key `sift.v1`, `schemaVersion: 1` unchanged; old saves still load (FR-016).
- Every point appears in exactly one section under either dimension; none lost/duplicated (SC-003/SC-005).
