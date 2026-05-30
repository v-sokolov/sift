# Data Model: Sift Post-MVP Improvements

Additive changes to the MVP types (`src/types.ts`). Nothing in the existing decision model
(Dilemma / Choice / Note / scoring) changes. New state for language and the suggestion modal;
the suggestion is transient (never persisted).

---

## New & changed types

### `Lang` (new)

```ts
export type Lang = 'en' | 'uk';
export const LANGS: Lang[] = ['en', 'uk'];
export const DEFAULT_LANG: Lang = 'en';
```

- `en` is the default and the complete reference catalog (fallback source).

### `ViewPrefs` (changed — add `lang`)

```ts
export interface ViewPrefs {
  mode: ViewMode;
  sortKey: SortKey;
  direction: Direction;
  theme: Theme;
  lang: Lang;        // NEW — active interface language
}
```

- Persisted as part of the `sift.v1` `view` slice.
- **Validation rule (load)**: `lang` is optional/forgiving on load — a missing or invalid
  value is replaced by the detected/default language rather than rejecting the payload
  (backward compatibility; see contracts/persistence-migration.md). On write, `lang` is
  always present and one of `LANGS`.

### `SuggestStatus` (new)

```ts
export type SuggestStatus = 'idle';   // mailto hand-off has no network states
```

- A single `'idle'` state is kept as a named type for clarity and forward-extensibility; the
  `mailto:` flow does not produce submitting/success/error states. (No network = no async
  status to model.)

### `SuggestionDraft` (new)

```ts
export interface SuggestionDraft {
  name: string;        // required (non-whitespace) to enable Send
  description: string;  // required (non-whitespace) to enable Send
  email: string;        // optional — submitter's contact (goes in body, not the maintainer addr)
  github: string;       // optional
  linkedin: string;     // optional
}
```

- **Validation rule**: `canSend = name.trim() !== '' && description.trim() !== ''` (FR-010).
- Optional fields default to `''`. The submitter's `email` is included in the composed body
  only; it is unrelated to the hidden maintainer `mailto:` target.

### `SuggestState` (new)

```ts
export interface SuggestState {
  open: boolean;
  draft: SuggestionDraft;
  status: SuggestStatus;     // always 'idle' in the mailto design
}
```

- Not persisted. Created closed with an empty draft.

### `AppState` (changed — add `suggest`)

```ts
export interface AppState {
  dilemma: Dilemma;
  view: ViewPrefs;            // now includes lang
  editing: EditTarget | null;
  draft: NoteDraft | null;
  suggest: SuggestState;      // NEW — suggestion modal (transient)
  lastSavedAt: number | null;
}
```

### `PersistedV1` (unchanged shape; `view` now carries `lang`)

```ts
export interface PersistedV1 {
  schemaVersion: 1;
  dilemma: Dilemma;
  view: ViewPrefs;   // includes lang on write; lang optional/forgiving on read
}
```

- Schema version stays `1` (additive, backward-compatible field).

### Message catalog types (new — `src/i18n`)

```ts
export type MessageKey = string;                  // keys enumerated in en.ts
export type Catalog = Record<MessageKey, string>;
export const messages: Record<Lang, Catalog>;     // { en, uk }
```

- `en` is authoritative: every key that exists anywhere MUST exist in `en`.

---

## Pure functions (no side effects — Constitution IV)

| Function | Signature | Rules |
|----------|-----------|-------|
| `t` | `t(lang: Lang, key: MessageKey, vars?: Record<string,string>): string` | Return `messages[lang][key]`; if absent, `messages.en[key]`; if still absent, return `key`. Interpolate `{var}` tokens from `vars`. Never returns blank when `en[key]` exists. |
| `detectLang` | `detectLang(navigatorLanguage: string): Lang` | Lowercase; `startsWith('uk')` or `startsWith('ru')` → `'uk'`; else `'en'`. |
| `buildMailto` | `buildMailto(draft: SuggestionDraft, to: string): string` | Returns `mailto:<to>?subject=<enc>&body=<enc>`; body is a readable template of Name/Description plus any non-empty optional fields; all values `encodeURIComponent`-encoded; omit empty optionals. |

---

## State transitions

### Language

```
boot:  load() → has valid view.lang?  ── yes ──▶ use it
                          │ no
                          └─▶ detectLang(navigator.language) ──▶ set view.lang
toggle: setLang(next)  ──▶ view.lang = next  ──▶ re-render (all t() update) + persist
clear:  clearDilemma() ──▶ reset board/view/theme BUT preserve current view.lang
```

- **FR-006**: `setLang` changes only `view.lang`; dilemma/notes/scores/view modes untouched.
- **Clear preserves language**: resetting the visible language on Clear would be
  disorienting and language is not decision data; `clearDilemma()` carries `view.lang` over
  from the current state into the fresh empty state. (Theme behavior from the MVP is
  unchanged.)

### Suggestion modal

```
closed ──openSuggest()──▶ open (draft reset to empty, status idle)
open   ──setSuggestField(field, value)──▶ open (draft updated)
open   ──submitSuggest()── [canSend] ──▶ fire buildMailto() → window.location ──▶ closed
open   ──closeSuggest()/Esc/backdrop──▶ closed (focus returns to trigger)
```

- `submitSuggest()` is a no-op when `!canSend` (guards FR-010).
- Closing always returns focus to the "Suggest a feature" trigger (FR-008).

---

## New state mutations (`src/state.ts`)

| Mutation | Effect |
|----------|--------|
| `setLang(lang: Lang)` | Set `view.lang`; render + persist. |
| `openSuggest()` | `suggest = { open: true, draft: emptyDraft(), status: 'idle' }`. |
| `closeSuggest()` | `suggest.open = false`. |
| `setSuggestField(field, value)` | Update one `draft` field. |
| `submitSuggest()` | If `canSend`, caller composes mailto (pure) and fires it; then `closeSuggest()`. (The mailto side-effect lives in `main.ts`, not the store.) |
| `clearDilemma()` (changed) | Reset to empty default **but keep** `view.lang`. |

---

## Invariants (additions)

- **I-L1**: `view.lang ∈ LANGS` at all times after boot.
- **I-L2**: For every `MessageKey` used in render, `messages.en[key]` exists (test-enforced).
- **I-S1**: `suggest` is never written to `localStorage`.
- **I-S2**: The maintainer email never appears in rendered DOM text — only inside the
  generated `mailto:` href.
- **I-S3**: `submitSuggest` has no effect unless `canSend` is true.
