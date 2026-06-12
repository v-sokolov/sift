# Contract: Suggest-a-feature (`src/mailto.ts`, `src/render/suggest.ts`, state)

Implements US2 / FR-007..FR-013. Fully client-side: a native `<dialog>` + a pure `mailto:`
composer. No network, nothing stored.

## Pure composer — `src/mailto.ts`

```ts
import type { SuggestionDraft } from './types';
export function buildMailto(draft: SuggestionDraft, to: string): string;
```

- Returns `mailto:<to>?subject=<enc>&body=<enc>`.
- **Subject**: a **non-localized constant** defined inside `mailto.ts` (e.g.
  `"Sift — feature suggestion"`). It is NOT an i18n key — keeping it constant preserves
  `buildMailto`'s purity/language-agnosticism and gives the maintainer a consistent inbox
  subject. Only the *form's* static UI (labels/placeholders/buttons) is localized (FR-013);
  the subject and the user-entered field values are not translated.
- **Body template** (human-readable), including only non-empty optional fields:
  ```
  Name: <name>
  Description: <description>
  Contact: <email?>
  GitHub: <github?>
  LinkedIn: <linkedin?>
  ```
- **Encoding**: every interpolated value passes through `encodeURIComponent`; newlines in the
  body encoded as `%0A` (or `\r\n` → encoded). The returned string is a valid URL.
- **Purity**: no DOM, no `window`; just returns the string. (Firing it is the caller's job.)

### Tests (write first)

- Required-only draft → URL has subject + body with Name/Description, omits empty optionals.
- All fields → all lines present, each value percent-encoded (test a value with spaces, `&`,
  newline, non-ASCII e.g. Cyrillic).
- `to` is the address from `config.ts`; never appears elsewhere.

## State & flow

`AppState.suggest = { open, draft, status:'idle' }` — **never persisted**. Mutations:
`openSuggest`, `closeSuggest`, `setSuggestField`, `submitSuggest`. Gate:
`canSend(draft) = name.trim() !== '' && description.trim() !== ''` (FR-010); `submitSuggest`
is a no-op unless `canSend`.

```
closed ──openSuggest()──▶ open (empty draft, idle)
open   ──setSuggestField──▶ open (draft updated)
open   ──submitSuggest [canSend]──▶ window.location.href = buildMailto(draft, CONTACT_EMAIL) ──▶ closed
open   ──closeSuggest()/Esc/backdrop──▶ closed (focus returns to trigger)
```

## Render & a11y (shipped)

- A `<form>` with fields Name*, Description* (textarea), Contact email, GitHub, LinkedIn —
  all labels/placeholders via `t(lang, …)` (FR-013); a Send button `disabled` unless
  `canSend`; a quiet **LinkedIn** fallback link (FR-012) and a close control. Markup is
  produced from state every re-render.
- Built as a **custom accessible overlay** (`role="dialog"`, `aria-modal="true"`), NOT native
  `<dialog>.showModal()` — jsdom 26 lacks `showModal`. Focus-into-modal on open, focus-return
  to the trigger on close, Esc-to-close, Tab focus-trap, and backdrop-click close are all in
  `main.ts` (FR-008). Fields carry `data-field` so the caret survives the full re-render.

## Invariants

- **I-S1**: `suggest` is never written to `localStorage`.
- **I-S2**: the maintainer email **never** appears in rendered DOM text — only inside the
  generated `mailto:` href.
- **I-S3**: `submitSuggest` has no effect unless `canSend` is true.
