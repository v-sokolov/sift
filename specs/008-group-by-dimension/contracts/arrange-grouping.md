# Contract: `arrange()` grouped-by-dimension

**Unit**: `src/view.ts` — `arrange(choice: Choice, prefs: ViewPrefs): Section[]` (pure, total, no
mutation). Only the `mode === 'grouped'` branch changes; `default` and `sorted` are unchanged.

## Signature / types

```ts
export type GroupKey = 'type' | 'weight';           // in types.ts
export interface Section {
  label: NoteType | Weight | 'weightless' | null;   // widened
  notes: Note[];
}
```

`prefs.groupKey` selects the grouping dimension. `prefs.direction` is **ignored** in grouped mode.

## Behaviour

### `groupKey === 'type'`

- Returns sections labelled `'advantage'`, `'disadvantage'`, `'neutral'` in that fixed order.
- `advantage` and `disadvantage` sections are ordered by **weight descending** (heaviest first);
  ties keep creation order (stable).
- `neutral` section keeps **creation order**.
- This reproduces the prior grouped default (when `direction` was `'desc'`).

### `groupKey === 'weight'`

- Returns sections labelled `3`, `2`, `1` (weight values, descending), then `'weightless'`.
- Each weighted section contains **all** notes of that weight regardless of `type` (an advantage
  and a disadvantage of weight 2 are in the same `2` section).
- `'weightless'` contains exactly the notes with `weight === null` (the neutral notes).
- Within every section, notes are in **creation order** (stable).

### Both dimensions

- Every note in `choice.notes` appears in **exactly one** section; none dropped or duplicated.
- `arrange` does not mutate `choice` or its notes.
- Pure & deterministic: same inputs → same output ordering.
- Empty sections may be returned; the renderer skips any labelled section with zero notes (see
  `group-toolbar.md` / ChoiceCard render guard). Implementations MAY omit empties directly.

## Test assertions (`tests/unit/view.test.ts`)

Fixture `mixed = [a1(adv,1), d3(dis,3), nu(neu,null), a3(adv,3), d1(dis,1)]`:

- **Type**: labels `['advantage','disadvantage','neutral']`; section notes
  `['a3','a1'] / ['d3','d1'] / ['nu']` (weighted heaviest-first, Neutral creation order);
  same result for `direction:'asc'` and `'desc'` (direction ignored in grouped mode).
- **Weight**: labels `[3, 2, 1, 'weightless']` (empties absent); `3` section
  `['d3','a3']`, `1` section `['a1','d1']`, `'weightless'` `['nu']` (creation order, types
  mixed). All-neutral choice → single `'weightless'` section, no numbered sections.
- **Purity**: `choice.notes` identity/order unchanged after `arrange`.
