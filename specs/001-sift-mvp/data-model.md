# Phase 1 Data Model: Sift MVP

Derived from spec Key Entities (Dilemma, Choice, Note, View Settings) and the design
doc §3. All types are plain TypeScript; nothing here implies a backend or DB.

## Type definitions

```ts
type NoteType = 'advantage' | 'disadvantage' | 'neutral';
type Weight   = 1 | 2 | 3;

interface Note {
  id: string;            // crypto.randomUUID()
  text: string;          // free-form; may be empty while editing
  type: NoteType;
  weight: Weight | null; // null IFF type === 'neutral'
}

interface Choice {
  id: string;
  title: string;         // may be '' → render ghost placeholder ("Choice 1"...)
  notes: Note[];         // all types together; arrangement decided at render time
}

interface Dilemma {
  id: string;
  title: string;         // the question; '' → ghost placeholder
  choices: Choice[];     // length constrained 2..4
  createdAt: number;     // epoch ms
  updatedAt: number;     // epoch ms; bumped on every mutation
}

// Note view is exactly one mode at a time (Group and Sort are mutually exclusive).
type ViewMode  = 'default' | 'grouped' | 'sorted';
type SortKey   = 'weight' | 'type';
type Direction = 'asc' | 'desc';

interface ViewPrefs {
  mode: ViewMode;        // default 'default'
  sortKey: SortKey;      // used when mode === 'sorted'; default 'weight'
  direction: Direction;  // used when mode === 'grouped' | 'sorted'; default 'desc'
  theme: 'system' | 'light' | 'dark'; // default 'system' (R7)
}

interface AppState {
  dilemma: Dilemma;
  view: ViewPrefs;
  editing: EditTarget | null; // the add/edit form target, or null when form hidden
  lastSavedAt: number | null; // drives the quiet "Saved" indicator
}

// When creating a new note the noteId is absent; when editing it is present.
type EditTarget =
  | { kind: 'new';  choiceId: string }
  | { kind: 'edit'; choiceId: string; noteId: string };
```

## Persisted shape (localStorage)

```ts
// Stored under key "sift.v1" (see contracts/persistence.md)
interface PersistedV1 {
  schemaVersion: 1;
  dilemma: Dilemma;
  view: ViewPrefs;
}
```

`editing` and `lastSavedAt` are **runtime-only** and never persisted.

## Relationships

- `Dilemma` 1 — 2..4 `Choice` (composition; choices live inside the dilemma).
- `Choice` 1 — 0..* `Note` (composition; ordered array, creation order = array order).
- `ViewPrefs` is global (one per app), applies to all choices simultaneously (FR-022).
- Score/forTotal/againstTotal are **derived, never stored** (FR-015) — see contracts/scoring.md.

## Validation & invariants

| # | Invariant | Source |
|---|-----------|--------|
| I1 | `2 ≤ dilemma.choices.length ≤ 4` at all times | FR-003, FR-004 |
| I2 | `note.weight === null` ⟺ `note.type === 'neutral'` | FR-008, FR-011 |
| I3 | `note.weight ∈ {1,2,3}` when `type ∈ {advantage, disadvantage}` | FR-008 |
| I4 | Neutral notes excluded from all totals/score | FR-014 |
| I5 | `view.sortKey` only meaningful when `mode === 'sorted'`; `direction` only when `mode ∈ {grouped, sorted}` | FR-019–021 |
| I6 | Default render order = array (creation) order; ties in sort fall back to it | FR-018, FR-021 |
| I7 | `updatedAt` bumped on every mutation; `createdAt` set once | persistence/UX |
| I8 | Removing a choice forbidden when `choices.length === 2` | FR-004 (edge case) |
| I9 | Adding a choice forbidden when `choices.length === 4` | FR-004 |

## State transitions / lifecycle

```text
[App boot]
   └─ load("sift.v1")
        ├─ valid    → restore Dilemma + ViewPrefs
        └─ missing/invalid → emptyDilemma() (2 starter choices, blank title)

[Empty default]  ── add note / edit title / add choice ──▶  [Active]
[Active]         ── Clear (confirm) ─────────────────────▶  [Empty default]
[any mutation]   ── update() ─▶ recompute derived ─▶ render ─▶ debounced save(400ms)
[tab hidden/unload] ─▶ flush save immediately
```

`emptyDilemma()` produces: blank title, two `Choice`s with empty titles (ghost
placeholders "Choice 1"/"Choice 2"), no notes, and `view` reset to ALL defaults
(`mode:'default'`, `sortKey:'weight'`, `direction:'desc'`, `theme:'system'`).

> Note: Clear is the only "start over" action in v1 and **erases everything** — question,
> choices, notes, view mode/key/direction, AND theme — back to the default state (FR-027).
> There is no separate "new dilemma" action; multi-dilemma management is deferred.
