# Data Model: Remove Point & Preserve Preferences on Clear

**There are no data-model changes in this feature.** This document records that explicitly and
notes the two state *transitions* that change behavior, so the no-change invariant (FR-014) is
auditable.

## Entities (unchanged)

| Entity | Shape | Change |
|---|---|---|
| **Note** (UI: "point") | `{ id, text, type: 'advantage' \| 'disadvantage' \| 'neutral', weight: Weight }` | None. No fields added/removed/retyped. |
| **Choice** | `{ id, name, notes: Note[] }` | None. Removing a point only shortens `notes`. |
| **View** | `{ mode, sortKey, direction, theme: Theme, lang: Lang }` | None. `theme`/`lang` already exist. |
| **AppState** | `{ dilemma, view, editing, draft, … }` | None. |

Persistence: still the single versioned `localStorage` key `sift.v1`; serialized shape is
**unchanged** (FR-014). Removals and preserved preferences ride the existing debounced save.

## State transitions (behavior changes)

These are the only behavioral deltas — both are mutations through existing typed store functions,
not schema changes.

### T1 — Remove a point (`removeNote(choiceId, noteId)`)

- **Before**: `choice.notes = [n1, n2, n3]`, possibly `editing = { kind:'edit', choiceId, noteId:n2 }`.
- **Action**: remove `n2`.
- **After**: `choice.notes = [n1, n3]`; board marked dirty (`touch`) → persisted; score/totals
  recompute from remaining notes (derived, no stored total). **New guard (FR-011)**: if
  `editing.kind === 'edit'` and `editing.noteId === noteId`, then `editing`/`draft` are reset to
  the closed/empty state in the same mutation.
- **Invariants preserved**: choice count stays 2–4 (unaffected); neutral notes still carry no
  weight (unaffected); a choice may legitimately reach `notes = []` (empty-points state, FR-006).

### T2 — Clear preserves preferences (`clearDilemma()`)

- **Before**: arbitrary content; `view.theme = <user choice>`, `view.lang = <user choice>`.
- **Action**: clear.
- **After**: fresh empty dilemma (title `''`, default choices with no notes, default view mode/
  sort) **except** `view.lang` (already preserved) **and** `view.theme` (now preserved — the
  change). Persisted via the normal save path so it survives reload (FR-018).
- **Invariants preserved**: serialized shape unchanged; "Clear" still empties all decision content
  and still confirms before acting (confirmation behavior untouched).

## Derived values (unchanged)

Score and for/against totals remain pure derivations over `choice.notes` (no stored aggregate),
so they update automatically after a removal (FR-005) with no extra wiring.
