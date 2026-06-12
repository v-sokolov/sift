# Contract: Runes Store (`src/store.svelte.ts`)

Supersedes the 001 `state-store` contract while remaining **API-compatible**: same mutation
names, signatures, and invariants, now backed by Svelte 5 `$state`. Components import these
functions and read reactive state; they never mutate `AppState` directly.

## State access

- Reactive `AppState` exposed for read (via a getter or exported rune-backed object).
- `getState()` remains available for non-reactive callers (e.g. unload flush).
- Persistence subscription: a mechanism equivalent to `subscribePersist` MUST fire on every
  content/view mutation so `persistence.ts` can debounce-save (unchanged 400ms / flush).

## Mutations (signatures preserved from `state.ts`)

Dilemma & choices: `setDilemmaTitle(title)`, `addChoice()`, `renameChoice(choiceId, title)`,
`removeChoice(choiceId)`.

Notes: `addNote(choiceId, draft)`, `updateNote(choiceId, noteId, draft)`,
`removeNote(choiceId, noteId)`.

Add/edit form: `openAddForm(choiceId)`, `openEditForm(choiceId, noteId)`, `closeForm()`,
`setFormChoice(choiceId)`, `setFormType(type)`, `setFormWeight(weight)`, `setFormText(text)`,
`submitForm()`.

Lifecycle: `clearDilemma()` (preserves `lang`).

Language: `setLang(lang)`, `initLang(lang)` (render-only, no save).

Suggest: `canSend(draft)`, `openSuggest()`, `closeSuggest()`, `setSuggestField(field, value)`.

View: `toggleGroup()`, `toggleSort()`, `setSortKey(key)`, `setDirection(direction)`.

Theme: `setTheme(theme)`, `cycleTheme()`.

## Invariants (MUST hold — mirror data-model)

1. `addChoice` no-ops at `MAX_CHOICES` (4); `removeChoice` no-ops at `MIN_CHOICES` (2) and
   clears the form if it targeted the removed choice.
2. `normalizeWeight`: `neutral ⇒ null`; otherwise missing weight ⇒ `3`.
3. `submitForm`: empty/whitespace text is rejected; new ⇒ stays open (text cleared,
   choice/type/weight kept); edit ⇒ closes form.
4. `clearDilemma` resets to `emptyDilemma()` but reapplies the prior `view.lang`.
5. `initLang` and the "Saved" timestamp are render-only (no persistence notification).
6. Every other mutation notifies both render (reactivity) and persistence channels.

## Acceptance

- The behavioral assertions of the former `tests/dom/{flow,lifecycle,suggest,i18n}` pass
  when re-expressed as component tests (parity).
- No mutation can drive choices outside 2..4 or leave a neutral note with a non-null weight.
- Typing through `setFormText` / `bind:value` never triggers a focus-losing remount (FR-002).
