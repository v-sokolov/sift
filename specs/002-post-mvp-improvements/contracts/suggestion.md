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

## State (see data-model.md)

`AppState.suggest: { open, draft, status:'idle' }`. Mutations: `openSuggest`, `closeSuggest`,
`setSuggestField`, `submitSuggest`. `canSend(draft) = name.trim() && description.trim()`.

> **Note (implementation)**: built as a custom accessible overlay (`role="dialog"`,
> `aria-modal="true"`), NOT native `<dialog>.showModal()` — jsdom 26 lacks `showModal`.
> Esc/focus-trap/focus-return/backdrop-close are implemented in `main.ts`; fields carry
> `data-field` so caret survives the full re-render.

## Render — `src/render/suggest.ts`

- Renders a `<dialog data-region="suggest">` containing a `<form>` with fields: Name*,
  Description* (textarea), Contact email, GitHub, LinkedIn — all labels/placeholders via
  `t(lang, …)` (FR-014/FR-013). A Send button (`disabled` unless `canSend`). A quiet
  **LinkedIn** fallback link (FR-012) and a close control.
- The maintainer email is **never** rendered as text (I-S2).
- Markup is produced from state every re-render (declarative), like other regions.

## Imperative reconcile (in `main.ts` render side-effect)

After `renderApp`:
- if `state.suggest.open` and `dialog.open` is false → `dialog.showModal()`, focus first field;
- if `!state.suggest.open` and `dialog.open` → `dialog.close()`.
- Remember the trigger element on open; on close, restore focus to it (FR-008).

## Events (`main.ts`, delegated on `#app` + dialog)

| Trigger | Action |
|---------|--------|
| click `[data-action="open-suggest"]` | `openSuggest()` |
| input on suggest fields (`data-action="suggest-field"`, `data-field`) | `setSuggestField(field, value)` |
| submit the suggest `<form>` | `preventDefault`; if `canSend`: `window.location.href = buildMailto(draft, CONTACT_EMAIL)`; then `closeSuggest()` |
| dialog `cancel`/`close` (Esc, backdrop) | `closeSuggest()` |
| click `[data-action="close-suggest"]` | `closeSuggest()` |

## Acceptance mapping

| Req | Covered by |
|-----|-----------|
| FR-007 quiet header entry | `open-suggest` link in `render/header.ts` |
| FR-008 a11y modal, Esc, focus return | native `<dialog>` + reconcile/focus restore |
| FR-009 fields | `render/suggest.ts` form |
| FR-010 Send gating | `canSend`, button `disabled`, `submitSuggest` guard |
| FR-011 mailto compose, no transmit | `buildMailto` + `window.location` |
| FR-012 LinkedIn fallback, no email shown | dialog fallback link; I-S2 |
| FR-013 localized form | `t()` on all labels/placeholders |

## DOM tests (write first)

- Open link → dialog open, focus inside; Esc → closed, focus back on trigger.
- Send disabled until Name+Description non-whitespace; enabling toggles correctly.
- Submitting a valid form sets `location.href` to a `mailto:` containing the entered values
  (stub/spy `window.location`); dialog closes.
- LinkedIn fallback link present and points to `config.LINKEDIN_URL`; email string absent
  from DOM.
- Switching language while open re-labels the form and preserves entered data.
