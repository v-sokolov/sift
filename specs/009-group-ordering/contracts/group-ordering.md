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

## Test assertions (fail-first — `tests/unit/view.test.ts`)

Existing 008 cases are retained. 009 adds/strengthens:

Fixture `typeFull` = `[a3(adv,3), a2(adv,2), a1(adv,1), d1(dis,1), d2(dis,2), d3(dis,3), nu(neu,null)]`:

1. **Type — full 3→2→1 within each section**:
   `arrange(typeFull, {mode:'grouped', groupKey:'type'})` →
   labels `['advantage','disadvantage','neutral']`; section[0] ids `['a3','a2','a1']`;
   section[1] ids `['d3','d2','d1']`; section[2] ids `['nu']`.
2. **Weight — full 3→2→1→weightless, types mixed in creation order**:
   `arrange(typeFull, {mode:'grouped', groupKey:'weight'})` →
   labels `[3, 2, 1, 'weightless']`; section `3` ids `['a3','d3']`; section `2` ids `['a2','d2']`;
   section `1` ids `['a1','d1']`; `'weightless'` ids `['nu']`.
3. **Determinism / stability**: two successive `arrange(...)` calls on the same input return
   equal `[label, ids]` structures for both `groupKey` values (no reshuffle).
4. **Purity**: `choice.notes` array identity and order are unchanged after `arrange` (both
   dimensions).
5. **Weight — empty weight omitted**: a choice with only weight-3 and weight-1 notes yields labels
   `[3, 1, 'weightless']` (no `2` section).

Renderer-level (only if not already covered by existing ChoiceCard tests):

6. **Type — no-neutral choice hides the Neutral section** in the rendered ChoiceCard (FR-006),
   confirming the empty section `arrange` returns is not displayed.

All assertions MUST pass against current `src/view.ts` / `ChoiceCard.svelte` with **no production
code change**. Any failing assertion indicates a real regression to fix by restoring this contract.
