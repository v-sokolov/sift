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

## Test assertions (fail-first — `tests/unit/view.test.ts`)

Using the existing `mixed` fixture `[a1(adv,1), d3(dis,3), nu(neu,null), a3(adv,3), d1(dis,1)]`:

1. **Type, section order**: `arrange(mixed, {mode:'grouped', groupKey:'type'})` →
   labels `['advantage','disadvantage','neutral']`.
2. **Type, within-section heaviest-first**: section[0].notes ids `['a3','a1']`;
   section[1].notes ids `['d3','d1']`; section[2].notes ids `['nu']`.
   *(Replaces the old direction-driven cases — direction no longer affects grouping.)*
3. **Type ignores direction**: same result for `direction:'asc'` and `direction:'desc'`.
4. **Weight, section order**: `arrange(mixed, {mode:'grouped', groupKey:'weight'})` →
   labels `[3, 2, 1, 'weightless']` (empty weight sections, if any, filtered/absent).
5. **Weight buckets mix types**: the `3` section contains `['d3','a3']` (creation order);
   the `1` section contains `['a1','d1']`; `'weightless'` contains `['nu']`.
6. **Weight, all-neutral choice**: a choice of only neutral notes → a single `'weightless'`
   section, no numbered sections.
7. **Purity**: `choice.notes` array identity/order unchanged after `arrange`.
