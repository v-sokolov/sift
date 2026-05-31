# Data Model: Save-Status Indicator & Header/Footer Polish

Phase 1 output. The **persisted** data model (`PersistedV1`) is **unchanged** (FR-013). The only
addition is a **runtime-only** state field for the indicator. No change to `Dilemma`, `Choice`,
`Note`, `ViewPrefs`, scoring, or arrangement.

## New type

```ts
// src/types.ts
export type SaveStatus = 'hidden' | 'editing' | 'saved';
```

| Value | Meaning | Visible indicator |
|-------|---------|-------------------|
| `'hidden'` | No content edit has occurred this session (fresh open / just cleared) | nothing (no dot, no text) |
| `'editing'` | A content change was made and is not yet stored | yellow dot + "Editing" |
| `'saved'`  | The most recent content change has been stored | green dot + "Saved" |

## `AppState` addition (runtime / session-only)

```ts
export interface AppState {
  dilemma: Dilemma;
  view: ViewPrefs;
  editing: EditTarget | null;
  draft: NoteDraft | null;
  suggest: SuggestState;
  lastSavedAt: number | null;
  status: SaveStatus;          // ← NEW; init 'hidden' in emptyDilemma()
}
```

- **Not persisted**: `status` is excluded from `PersistedV1` (`{schemaVersion: 1, dilemma, view}`)
  and is never read by `load()` — exactly like `editing`, `draft`, `suggest`, `lastSavedAt`. A
  returning user therefore starts at `'hidden'` (FR-008).
- **Initial value**: `'hidden'`, set in `emptyDilemma()`.

## State transitions

| From | Trigger | To | Notes |
|------|---------|----|-------|
| any | content mutation (title / choice / point add·edit·remove; `submitForm` commit) | `editing` | FR-003; set inside the 8 content mutations |
| `editing` | save completes (`setLastSaved` after the 2s debounce or exit-flush) | `saved` | FR-004; **guarded** — only when currently `editing` |
| `hidden` | save completes due to a **preference-only** change | `hidden` | guard prevents a false "Saved" (FR-006/FR-008) |
| `saved` | save completes due to a **preference-only** change | `saved` | unchanged — preference change never alters status (FR-006) |
| any | `clearDilemma()` | `hidden` | FR-009 |
| `saved` / `hidden` | another content mutation | `editing` | FR-003; debounce restarts |
| any | preference mutation (lang, theme, sort, group, mode, direction) | *unchanged* | FR-006; still persists silently (FR-007) |
| any | transient form mutation (open/close form, set draft type/weight/text/choice) | *unchanged* | not a content change until committed |

### Invariants

- `status` is one of exactly three values at all times.
- A preference or transient-form mutation never changes `status` (FR-006).
- `status === 'saved'` implies a content change made this session has been written to storage.
- `status` carries no data and is never serialized → no `schemaVersion` bump (FR-013).

## Content vs. preference vs. transient (mutation classification)

| Class | Mutations | Effect on `status` |
|-------|-----------|--------------------|
| **Content** | `setDilemmaTitle`, `addChoice`, `renameChoice`, `removeChoice`, `addNote`, `updateNote`, `removeNote`, `submitForm` (commit) | → `editing` |
| **Preference** | `setLang`, `setTheme`, `cycleTheme`, `toggleGroup`, `toggleSort`, `setSortKey`, `setDirection`, `setGroupKey` | none |
| **Transient form** | `openAddForm`, `openEditForm`, `closeForm`, `setFormChoice`, `setFormType`, `setFormWeight`, `setFormText` | none |
| **Lifecycle** | `clearDilemma` → `hidden`; `initLang` (boot, render-only) → none; `setLastSaved` → `editing`→`saved` (guarded) | as noted |

## Presentation entities (no data model; for reference)

- **Status indicator** — toolbar element: a decorative colored dot (`aria-hidden`) + a polite
  live-region text label, or nothing when `status==='hidden'`.
- **Footer credit** — i18n strings only; author name removed, *Essentialism* book link retained.
- **Header brand row** — favicon (decorative) + "Sift" wordmark on the left, "Suggest a feature"
  button on the right (space-between).
