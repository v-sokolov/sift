# Contract: `arrange()` group-ordering (locked)

**Unit**: `src/view.ts` — `arrange(choice: Choice, prefs: ViewPrefs): Section[]` (pure, total, no
mutation). This contract restates and **locks** the `mode === 'grouped'` ordering; `default` and
`sorted` branches are unchanged and out of scope. Renderer empty-section skip lives in
`src/components/ChoiceCard.svelte`.

## Behaviour (must hold — regression-protected)

### `groupKey === 'type'`

- Section order is fixed: `['advantage', 'disadvantage', 'neutral']`.
- `advantage` and `disadvantage` sections: notes ordered by **weight descending** (3 → 2 → 1);
  equal weights keep **creation order** (stable).
- `neutral` section: **creation order**.
- `direction` is ignored (identical output for `'asc'` and `'desc'`).
- `arrange` MAY return an empty `neutral` (or any) type section; the **renderer** MUST NOT render a
  zero-note section (FR-006 is a rendered-output guarantee).

### `groupKey === 'weight'`

- Section order is `[3, 2, 1, 'weightless']`, with any weight value having **no** notes omitted.
- Each weighted section contains **all** notes of that weight regardless of `type` (advantage and
  disadvantage of the same weight share the section).
- `'weightless'` contains exactly the `weight === null` (neutral) notes.
- Within every section, notes keep **creation order** (stable).

### Both dimensions

- Every note in `choice.notes` appears in **exactly one** section — none dropped, none duplicated.
- `arrange` does not mutate `choice` or its `notes` (array identity and element order preserved).
- Pure & deterministic: identical inputs → identical output (labels and member order) across
  repeated calls and reloads.

## Regression coverage

Locked in `tests/unit/view.test.ts` against fixture
`typeFull = [a3(adv,3), a2(adv,2), a1(adv,1), d1(dis,1), d2(dis,2), d3(dis,3), nu(neu,null)]`:

- **Type**: labels `['advantage','disadvantage','neutral']`; Adv `['a3','a2','a1']`,
  Disadv `['d3','d2','d1']`, Neutral `['nu']`.
- **Weight**: labels `[3, 2, 1, 'weightless']`; `3:['a3','d3']`, `2:['a2','d2']`, `1:['a1','d1']`,
  `'weightless':['nu']` (types mixed, creation order).
- **Empty-weight omission**: a choice with only weight-3 and -1 notes → labels `[3, 1, 'weightless']`.
- **Determinism + purity**: two successive `arrange` calls give equal `[label, ids]`; `choice.notes`
  identity and order unchanged.
- **Renderer guard** (`tests/components/group-ordering.test.ts`): a no-neutral choice hides the
  Neutral section in the rendered ChoiceCard (FR-006).

All pass against current `src/view.ts` / `ChoiceCard.svelte` with **no production code change**; any
failure is a real regression to fix by restoring this contract.
