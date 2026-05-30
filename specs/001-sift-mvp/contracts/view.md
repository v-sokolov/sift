# Contract: Note Arrangement (`view.ts`)

Pure, side-effect-free. Given a `Choice` and `ViewPrefs`, returns the note structure to
render. Never mutates the choice; ordering/grouping is applied at render time only
(notes store no order field — FR-018).

## API

```ts
interface Section { label: NoteType | null; notes: Note[]; } // label null = flat list

// Returns one Section (flat) for 'default'/'sorted', or three ordered Sections for 'grouped'.
function arrange(choice: Choice, prefs: ViewPrefs): Section[];
```

## Rules by mode

### `default` (FR-018)
- One flat section, notes in **creation order** (array order). No sorting, no grouping.

### `grouped` (FR-020)
- Exactly three sections in fixed order: **Advantages → Disadvantages → Neutral**.
- Within Advantages/Disadvantages, sort by `weight` using `prefs.direction`
  (`asc` = lighter first [1→3], `desc` = heaviest first [3→1]).
- Neutral section keeps **creation order** (no weight to sort by).
- Empty sections may be omitted or rendered with their label by the render layer; the
  contract returns all three sections (possibly with empty `notes`).

### `sorted` (FR-021)
- One flat section sorted by `prefs.sortKey` + `prefs.direction`:
  - **weight**: `asc` lighter→heavier; `desc` heavier→lighter. Neutral (null weight)
    treated as the lowest (sorts as 0) so it groups at the light/`asc` end consistently.
  - **type**: `asc` = advantage → disadvantage → neutral; `desc` reverses
    (neutral → disadvantage → advantage).
- **Ties fall back to creation order** (stable sort over original array index). (FR-021)

## Invariants

- **V1**: Output contains exactly the input notes — none added, dropped, or duplicated.
- **V2**: Sorting is **stable**; equal keys preserve original (creation) order. (I6)
- **V3**: Pure — same `(choice, prefs)` → structurally equal output; no I/O/Date/random.
- **V4**: `prefs.sortKey` ignored unless `mode==='sorted'`; `prefs.direction` ignored
  when `mode==='default'`.

## Test expectations

- default → identical order to `choice.notes`.
- grouped/desc → each non-neutral section heaviest-first; neutral in creation order;
  section order Adv→Disadv→Neutral regardless of direction.
- sorted/type/asc vs desc → exact type orderings above; equal types keep creation order.
- sorted/weight/asc with mixed weights + a neutral → neutral sorts to the light end.
