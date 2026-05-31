# Contract: Save-Status State Machine & Store/Persistence API

Locks the observable behaviour of the save-status indicator. Tests assert these; a red test is a
genuine violation to fix.

## Types

```ts
export type SaveStatus = 'hidden' | 'editing' | 'saved';
// AppState gains: status: SaveStatus   (runtime-only, never persisted)
```

## Store API (additions/changes to `src/store.svelte.ts`)

- `emptyDilemma()` MUST set `status: 'hidden'`.
- The eight **content** mutations MUST set `status = 'editing'`:
  `setDilemmaTitle`, `addChoice`, `renameChoice`, `removeChoice`, `addNote`, `updateNote`,
  `removeNote`, and the commit branch of `submitForm`.
  - For mutations that no-op on a guard (e.g. `addChoice` at `MAX_CHOICES`, `removeChoice` at
    `MIN_CHOICES`, `addNote` with empty text, `submitForm` with empty/no draft): they MUST NOT flip
    to `editing` when no content actually changed. (Set `editing` only on the path that mutates
    content.)
- **Preference** mutations MUST NOT change `status`:
  `setLang`, `setTheme`, `cycleTheme`, `toggleGroup`, `toggleSort`, `setSortKey`, `setDirection`,
  `setGroupKey`.
- **Transient form** mutations MUST NOT change `status`:
  `openAddForm`, `openEditForm`, `closeForm`, `setFormChoice`, `setFormType`, `setFormWeight`,
  `setFormText`.
- `setLastSaved(ts)` MUST set `status = 'saved'` **only if** the current `status === 'editing'`;
  otherwise `status` is left unchanged. (It still sets `lastSavedAt = ts` and MUST NOT trigger a
  save — no loop, as today.)
- `clearDilemma()` MUST result in `status === 'hidden'` (via `emptyDilemma()`).
- `status` MUST NOT be serialized: `serialize()` / `PersistedV1` unchanged; `load()` never reads it.

## Persistence (`src/persistence.ts`)

- `DEBOUNCE_MS === 2000`.
- `scheduleSave` MUST coalesce: N calls within one 2s idle window ⇒ exactly **one** `write` and one
  `onSaved` invocation (SC-006).
- `flushSave` (exit) MUST still write immediately and call `onSaved` (no data loss while "Editing").

## State machine (authoritative)

```
            content mutation                 save completes (guarded)
   hidden ───────────────────▶ editing ──────────────────────────▶ saved
     ▲  │                         ▲  │                                │
     │  │ preference / transient  │  │ preference / transient         │ preference / transient
     │  └─ (no change) ───────────┘  └─ (no change) ─────────────────┘  (no change)
     │                                                                  │
     │                         clearDilemma()                           │
     └──────────────────────────────────────────────────────────────◀──┘
   (save completing while hidden ⇒ stays hidden — the guard)
```

## Test assertions (fail-first)

1. Fresh `emptyDilemma()` / fresh load ⇒ `status === 'hidden'`.
2. Each content mutation from `hidden` or `saved` ⇒ `status === 'editing'`.
3. Each preference mutation ⇒ `status` unchanged (test from `hidden`, `editing`, and `saved`).
4. Each transient-form mutation ⇒ `status` unchanged.
5. `setLastSaved` when `editing` ⇒ `saved`; when `hidden` ⇒ stays `hidden`; when `saved` ⇒ stays
   `saved`.
6. `clearDilemma()` from any state ⇒ `status === 'hidden'`.
7. `DEBOUNCE_MS === 2000`; coalesced single write per window (fake timers).
