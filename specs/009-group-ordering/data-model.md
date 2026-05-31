# Phase 1 Data Model: Group Ordering — Confirm & Document

**No data-model change.** This feature documents and protects existing structures (FR-010). The
entities below are restated for reference; nothing is added, widened, or migrated.

## Entities (unchanged)

### Note (unchanged)

| Field    | Type                                          | Notes                                  |
|----------|-----------------------------------------------|----------------------------------------|
| `id`     | string                                        | stable identity; tie-break key         |
| `text`   | string                                        | user content                           |
| `type`   | `'advantage' \| 'disadvantage' \| 'neutral'`  | dimension for Type grouping            |
| `weight` | `1 \| 2 \| 3 \| null`                         | `null` for neutral; dimension for Weight grouping |

Invariant (unchanged): neutral notes carry no weight (`weight === null`); only advantages/
disadvantages carry `1|2|3`.

### Section (unchanged — already widened in 008)

```ts
export interface Section {
  label: NoteType | Weight | 'weightless' | null;
  notes: Note[];
}
```

- `null` → flat list (default/sorted modes).
- `NoteType` (`'advantage'|'disadvantage'|'neutral'`) → Type-grouping section.
- `Weight` (`1|2|3`) → a Weight-grouping section.
- `'weightless'` → the trailing Weight-grouping section holding neutral (null-weight) notes — the
  "0" bucket in the user's "3 > 2 > 1 > 0".

### ViewPrefs (unchanged)

`groupKey: 'type' | 'weight'` (default `'type'`) selects the grouping dimension. `direction` is
**ignored** in grouped mode (it remains a Sort-mode concern). No persistence/schema change.

## Ordering rules (the contract this feature locks)

| Dimension | Section order                  | Within-section order                              | Empty sections |
|-----------|--------------------------------|---------------------------------------------------|----------------|
| **Type**  | advantage → disadvantage → neutral | Adv/Disadv: weight **desc** (3→2→1), ties = creation order; Neutral: creation order | `arrange` returns empty type sections; **renderer** skips zero-note sections |
| **Weight**| 3 → 2 → 1 → weightless(0)       | creation order, types mixed                       | `arrange` omits weights with no points |

Cross-cutting (both dimensions): every note appears in exactly one section (none dropped/
duplicated); `arrange` does not mutate the choice or its notes; same input → same output
(deterministic, stable on re-render).
