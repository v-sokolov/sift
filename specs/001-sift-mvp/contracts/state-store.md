# Contract: State Store (`state.ts`)

The single source of truth. All mutations flow through `update()`; every update
recomputes nothing itself (derived values are computed at render time) but notifies
subscribers, which re-render and trigger a debounced save.

## Store API

```ts
function getState(): Readonly<AppState>;

// Apply a pure transformation to state. The producer MUST return a new AppState
// (or mutate a draft that the store then freezes); the store bumps dilemma.updatedAt,
// then notifies all subscribers synchronously.
function update(producer: (draft: AppState) => AppState | void): void;

// Subscribe to post-update state. Returns an unsubscribe function.
function subscribe(cb: (state: Readonly<AppState>) => void): () => void;

// Replace entire state (used by persistence load on boot and by Clear/New).
function setState(next: AppState): void;
```

## Mutation helpers (typed, exhaustive — the only ways to change a dilemma)

```ts
setDilemmaTitle(title: string): void;

addChoice(): void;                          // no-op + signal when length === 4 (I9)
renameChoice(choiceId: string, title: string): void;
removeChoice(choiceId: string): void;       // no-op + signal when length === 2 (I8)

addNote(choiceId: string, draft: NoteDraft): void;   // NoteDraft = {text,type,weight}
updateNote(choiceId: string, noteId: string, draft: NoteDraft): void;
removeNote(choiceId: string, noteId: string): void;

openAddForm(choiceId: string): void;        // sets editing = {kind:'new', choiceId}
openEditForm(choiceId: string, noteId: string): void;
closeForm(): void;                          // editing = null

setViewMode(mode: ViewMode): void;          // enforces Group/Sort mutual exclusion (FR-019)
setSortKey(key: SortKey): void;
setDirection(dir: Direction): void;
setTheme(theme: ViewPrefs['theme']): void;

clearDilemma(): void;                        // → full reset to emptyDilemma() default state, incl. theme (FR-027)
```

## Contract guarantees

- **G1**: `update()` is synchronous; subscribers see fully-updated state.
- **G2**: Invariants I1–I3, I8, I9 are enforced inside the mutation helpers — illegal
  states are unrepresentable from outside the module (e.g. `addNote` with
  `type:'neutral'` forces `weight:null`).
- **G3**: `setViewMode('grouped')` and `setViewMode('sorted')` are mutually exclusive by
  construction (single `mode` field); turning one on turns the other off.
- **G4**: Every helper that changes the dilemma bumps `updatedAt`; view/editing changes
  do not bump `updatedAt` (they're not part of dilemma content, though `view` is still
  persisted).
- **G5**: State exposed via `getState()`/`subscribe()` is read-only (frozen in dev).

## Test expectations

- `addChoice` past 4 and `removeChoice` at 2 are no-ops (assert length unchanged).
- `addNote`/`updateNote` with `type:'neutral'` always yield `weight === null`.
- `setViewMode('sorted')` after `'grouped'` leaves exactly one active mode.
- `subscribe` callback fires once per `update`; unsubscribe stops further calls.
