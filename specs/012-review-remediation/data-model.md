# Data Model: Codebase-Health Remediation

Feature: `012-review-remediation` · Date: 2026-05-31

This feature is a remediation pass; it introduces **no new entities** and **no persisted-schema
change**. The only data-shape changes are *removals* of transient (never-persisted) state.

## Persisted state — UNCHANGED

`PersistedV1` (`src/types.ts`) stays `{ schemaVersion: 1, dilemma, view }`. `Dilemma`, `Choice`,
`Note`, `ViewPrefs` are untouched. The `sift.v1` localStorage contract (version **1**) is
backward-compatible; **no migration** (FR-014). Existing saved boards load exactly as before.

## Transient state — REMOVED (FR-011)

| Item | Location | Change | Justification |
|---|---|---|---|
| `type SuggestStatus = 'idle'` | `types.ts:67` | **Delete** | One-member union; write-only (#3) |
| `SuggestState.status` | `types.ts:80` | **Delete field** | Set in 2 places, read in 0 |
| `status: 'idle'` initializer | `store.svelte.ts:37` (`emptySuggest`) | **Remove** | Field no longer exists |
| `status: 'idle'` initializer | `store.svelte.ts:321` (`openSuggest`) | **Remove** | Field no longer exists |

`SuggestState` after change:

```ts
export interface SuggestState {
  open: boolean;
  draft: SuggestionDraft;
}
```

**Not touched**: `SaveStatus = 'hidden' | 'editing' | 'saved'` and `AppState.status` (the 010
save-status indicator) — those are *read* (drive the indicator) and stay. Only the suggest-modal
`status` is removed. `SuggestionDraft` is unchanged.

## Behavior-shape change — note commit (FR-010)

No type change. `submitForm` is refactored to **delegate** the note mutation to the existing
`addNote(choiceId, draft)` / `updateNote(choiceId, noteId, draft)` functions, keeping only the
form lifecycle (new → keep form open with a reset draft preserving `type`/`weight`; edit → close
form) in `submitForm`. Observable behavior is identical; the verbatim duplication of the
note-push/assign body is eliminated and `addNote`/`updateNote` become UI-reachable.

## Invariants preserved (Principle IV)

- 2–4 choices; neutral notes carry `weight === null`; weighted notes `1|2|3` (via
  `normalizeWeight`) — unchanged.
- `touch()` still stamps `updatedAt` and flips the save-status indicator to `'editing'` on content
  mutations; preference/transient mutations still never call it.
