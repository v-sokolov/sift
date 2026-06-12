# Data Model: Accordion Choice Cards (020)

## Persisted data: NO CHANGE

`PersistedV1` (`schemaVersion: 1`, `dilemma`, `view`) is untouched. No `ViewPrefs`
field, no defensive-load addition, no schemaVersion bump. SC-004 (byte-identical saved
payload across toggles) holds structurally because the new state never enters
`serialize()`'s input.

## New runtime-only state (store module level, OUTSIDE `AppState`)

| Name | Type | Default | Lifetime | Notes |
|------|------|---------|----------|-------|
| `expanded` | `Record<string, boolean>` (`$state` rune in `store.svelte.ts`) | `{}` — absent key ⇒ **collapsed** (FR-012) | Page session only; reset on reload | Keyed by `Choice.id`. Follows the 010 `status` precedent: runtime display state kept out of the persisted slice — here it is outside `AppState` entirely, so types prove non-persistence. |
| `editingTitle` + `prevTitle` | component-local `$state` in `ChoiceCard.svelte` (rev. 2, R9) | `false` / `''` | While the card instance lives | NOT in the store — no cross-module consumer (contrast `expanded`, which `addNote` must reach for FR-010). `prevTitle` is the Esc-restore snapshot (H2). Commit = exit flag only; the title itself lives in `dilemma` via the unchanged live `renameChoice`. |

### Accessors / mutations

| Function | Behaviour | Invariants |
|----------|-----------|------------|
| `isExpanded(choiceId): boolean` | `expanded[choiceId] === true` | Pure read; unknown id ⇒ `false` (collapsed) |
| `setExpanded(choiceId, open): void` | Sets the flag for one Choice (driven by the card's `Accordion.Root` `onValueChange`: `v === choiceId` ⇒ open, `""` ⇒ closed) | NEVER calls `update()`/`notifySave()`/`touch()` — no persist event, no `updatedAt`, no save-status change (FR-006, contract E2–E3) |
| `addNote` / `updateNote` / `removeNote` (existing) | Additionally set `expanded[choiceId] = true` on their success path | Auto-expand exactly the mutated Choice (FR-010, E4); failure paths (missing choice/note, blank text) do not expand |
| `removeChoice` / `clearDilemma` (existing) | Drop entries for removed Choice(s) | No stale ids accumulate (E6) |

### State transitions (per Choice)

```text
            page load             setExpanded(true)         setExpanded(false)
  (any) ───────────────▶ collapsed ───────────────▶ expanded ───────────────▶ collapsed
                              ▲                        │  ▲
                              │     addNote/updateNote/removeNote (own Choice)
                              └────────── never ───────┘  └── idempotent expand
```

## Modified pure helpers (`view.ts`)

| Function | Signature | Source |
|----------|-----------|--------|
| `signed` | `(n: number) => string` — `+N` / `−N` (U+2212) / `0` | Moved from `Summary.svelte` (private → exported; behaviour identical) |
| `scoreSign` | `(n: number) => 'positive' \| 'negative' \| 'neutral'` | Moved from `Summary.svelte` (`sign()` renamed on export to avoid `Math.sign` confusion) |

Consumed by both `Summary.svelte` and `ChoiceCard.svelte` — single source of truth for
value formatting and sign-colour classification (SC-003).

## Existing entities

`Choice`, `Note`, `Dilemma`, `ViewPrefs` — all unchanged.
