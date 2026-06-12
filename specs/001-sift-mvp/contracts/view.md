# Contract: Note Arrangement (`view.ts`)

Pure, side-effect-free. Given a `Choice` and `ViewPrefs`, returns the note structure to
render. Never mutates the choice; ordering/grouping applied at render time only (notes
store no order field — FR-018).

## API

```ts
interface Section { label: NoteType | null; notes: Note[]; } // label null = flat list

// One Section (flat) for 'default'/'sorted', or three ordered Sections for 'grouped'.
function arrange(choice: Choice, prefs: ViewPrefs): Section[];
```

## Rules by mode

- **`default` (FR-018):** one flat section, notes in **creation order** (array order).
- **`grouped` (FR-020):** exactly three sections in fixed order **Advantages →
  Disadvantages → Neutral**. Within Advantages/Disadvantages, sort by `weight` per
  `prefs.direction` (`asc` = 1→3, `desc` = 3→1). Neutral keeps creation order. All three
  sections returned (possibly empty `notes`).
- **`sorted` (FR-021):** one flat section sorted by `prefs.sortKey` + `prefs.direction`:
  - **weight:** `asc` light→heavy, `desc` heavy→light; neutral (null) sorts as the
    lowest (treated as 0).
  - **type:** `asc` = advantage → disadvantage → neutral; `desc` reverses.
  - Ties fall back to creation order (stable sort over original index).

## Laws

- **V1**: Output contains exactly the input notes — none added, dropped, or duplicated.
- **V2**: Sorting is **stable**; equal keys preserve creation order. (I6)
- **V3**: Pure — same `(choice, prefs)` → structurally equal output; no I/O/Date/random.
- **V4**: `prefs.sortKey` ignored unless `mode==='sorted'`; `prefs.direction` ignored
  when `mode==='default'`.
