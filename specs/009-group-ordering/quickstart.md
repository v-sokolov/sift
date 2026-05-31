# Quickstart: Group Ordering — Confirm & Document

## What this feature is

A regression-protection pass over Group mode's ordering. The behaviour already ships (008); this
locks it with explicit tests. **No production code change is expected.**

## Verify on device (manual acceptance)

1. Start the app (`yarn dev`) and add a choice with points spanning types and weights, e.g.:
   - Advantage w3, Advantage w2, Advantage w1
   - Disadvantage w3, Disadvantage w2, Disadvantage w1
   - One Neutral point
2. Turn **Group** on; select **Type**:
   - Sections appear **Advantages → Disadvantages → Neutral**.
   - Advantages list **3 → 2 → 1**; Disadvantages list **3 → 2 → 1**; Neutral in the order added.
   - Remove all neutral points → the **Neutral section disappears** (no empty section).
3. Switch to **Weight**:
   - Sections appear **3 → 2 → 1 → (weightless/neutral)**.
   - Each weight section contains both advantages and disadvantages of that weight, in the order
     added.
   - Delete every weight-2 point → the **weight-2 section disappears** (no empty section).
4. Toggle Type ↔ Weight repeatedly → points re-section instantly; none lost, duplicated, or
   reordered within their tie group.

## Acceptance matrix

| # | Scenario | Dimension | Expected | Source |
|---|----------|-----------|----------|--------|
| 1 | Section order | Type | Advantages → Disadvantages → Neutral | FR-001 / SC-001 |
| 2 | Within Adv/Disadv | Type | weight 3 → 2 → 1 (heaviest first) | FR-002 / SC-002 |
| 3 | Neutral order | Type | creation order | FR-003 / SC-002 |
| 4 | Section order | Weight | 3 → 2 → 1 → weightless(0) | FR-004 / SC-003 |
| 5 | Mixed types per weight | Weight | adv + disadv of same weight share section, creation order | FR-005 |
| 6 | Empty bucket | both | section not rendered | FR-006 / SC-003 |
| 7 | Re-render / reload | both | no reshuffle of equal-key items | FR-007 / SC-004 |
| 8 | Coverage | both | every point in exactly one section; no mutation | FR-008 |
| 9 | Regression tests | both | assert all rules; green with no code change | FR-009 / SC-005 |

## Run the tests

```bash
yarn test        # vitest — tests/unit/view.test.ts must be green
yarn typecheck   # tsc strict — must be green
```

Expected result: all ordering assertions pass against the current code with **no** edits to
`src/`. If any assertion is red, that is a genuine regression — restore the contract in
`src/view.ts` / `src/components/ChoiceCard.svelte` per `contracts/group-ordering.md`.
