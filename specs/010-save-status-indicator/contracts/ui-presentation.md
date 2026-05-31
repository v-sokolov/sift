# Contract: UI Presentation (Indicator render, Header layout, Footer copy)

Locks the observable presentation. Tests assert these via the `tests/svelte.ts` mount helper and
the i18n catalogs.

## Indicator rendering (`Toolbar.svelte` + `app.css`)

Driven by `status` (not `lastSavedAt`):

| `status` | Renders |
|----------|---------|
| `'hidden'` | No dot and no text in the status slot |
| `'editing'` | A yellow dot + the localized **"Editing"** label, inside `aria-live="polite"` |
| `'saved'` | A green dot + the localized **"Saved"** label, inside `aria-live="polite"` |

- The dot is a separate element marked `aria-hidden="true"`; the text label carries the meaning
  (FR-010). Suggested hook: `.status-dot` + `.status-dot--editing` / `.status-dot--saved`.
- Dot colors: green = "saved", yellow = "editing", sourced from theme tokens, WCAG AA in both themes.
- i18n: existing `toolbar.saved`; new `toolbar.editing` (EN "Editing"; UK "Редагування") — present
  in **both** catalogs (parity test enforces completeness).

## Header layout (`Header.svelte` + `app.css`)

- The brand row's left group is **[decorative favicon] + "Sift" wordmark**; the favicon uses
  `public/favicon.svg`, marked decorative (`alt=""` / `aria-hidden="true"`), sized to balance the
  1.5rem wordmark.
- The **"Suggest a feature"** button (`data-action="open-suggest"`) renders in the brand row to the
  right of the brand group, via a space-between layout. It appears **exactly once** (its previous
  location next to the title input no longer renders it) and still calls `openSuggest` on click.
- The tagline and the dilemma-title input remain present and otherwise unchanged.

## Footer copy (`src/i18n/en.ts`, `src/i18n/uk.ts`)

- The rendered footer MUST NOT contain the author name "Greg McKeown" (EN) or "Ґреґа Мак-Кеоуна"
  (UK); the *Essentialism* book reference and its link MUST remain.
- EN target: `footer.inspiredPre` = "Inspired by the " (was "Inspired by Greg McKeown's "); book/post
  unchanged → "Inspired by the *Essentialism* book."
- UK target: `footer.inspiredPost` = "." (was " Ґреґа Мак-Кеоуна."); pre/book unchanged → "Натхненна
  книжкою *Essentialism*."
- `Footer.svelte` markup is unchanged.

## Test assertions (fail-first)

1. With `status='hidden'`, the toolbar status slot contains no dot and no label text.
2. After a content edit (`status='editing'`), the toolbar shows the "Editing" label and a dot with
   the editing modifier class.
3. After `setLastSaved` (`status='saved'`), the toolbar shows the "Saved" label and a dot with the
   saved modifier class.
4. Footer rendered in EN contains "Essentialism" and does NOT contain "Greg McKeown"; in UK contains
   "Essentialism" and does NOT contain "Мак-Кеоуна".
5. Header renders exactly one `[data-action="open-suggest"]` button, located in the brand row; a
   decorative favicon image is present beside the "Sift" wordmark.
