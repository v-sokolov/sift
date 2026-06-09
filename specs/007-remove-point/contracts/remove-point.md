# Contract: Remove Point (US1)

Concrete, minimal edits to add an always-visible per-point remove control. Wires the existing
`removeNote` action; no new store API beyond the FR-011 form-reset guard.

## Store — `src/store.svelte.ts`

| Function | Edit | Requirement |
|---|---|---|
| `removeNote(choiceId, noteId)` | Add a guard: when the open edit form targets the note being removed (`editing?.kind === 'edit' && editing.noteId === noteId`), reset `editing` to the closed state and `draft` to its empty default — within the same `update(...)` mutation, before/after the existing `notes.filter`. The existing filter + `touch(d)` are unchanged. | FR-003, FR-007, FR-011 |

No other store change for US1. Removal already persists via `touch(d)` → debounced save.

## Component — `src/components/NoteRow.svelte`

**Markup**: inside the existing `.note` `<li>` (which is `role="button"` / click-to-edit), add a
trailing real `<button>` for remove, e.g. seated after the `.note__meta` cluster:

```svelte
<button
  class="iconbtn note__remove"
  data-action="remove-note"
  data-note-id={note.id}
  aria-label={t(lang, 'note.removeAria')}
  title={t(lang, 'note.removeAria')}
  onclick={remove}
  onkeydown={onRemoveKeydown}
>✕</button>
```

**Script**: add a `remove` handler that **stops propagation** so the row's edit click/keydown do
not also fire, then calls the store:

```ts
import { openEditForm, removeNote } from '../store.svelte';

function remove(e: MouseEvent) {
  e.stopPropagation();
  removeNote(choiceId, note.id);
}
function onRemoveKeydown(e: KeyboardEvent) {
  // Native <button> already activates on Enter/Space; just prevent the event
  // from bubbling to the row's edit keydown handler.
  if (e.key === 'Enter' || e.key === ' ') e.stopPropagation();
}
```

| Aspect | Contract | Requirement |
|---|---|---|
| Visibility | The button is always in the DOM and visible; never `display:none`/hidden until hover. | FR-002, SC-003 |
| Independence from edit | `click` and Enter/Space on the button MUST NOT trigger the row's `edit()`. | FR-010 |
| Keyboard | Button is natively focusable and activates on Enter/Space; identical effect to click/tap. | FR-008 |
| Label | `aria-label`/`title` = localized `note.removeAria`, distinct from the row's edit `aria-label`. | FR-009 |
| Decorative `aria-hidden` siblings | The `.note__meta` (dots/sign) stays `aria-hidden`; the new button is NOT aria-hidden. | FR-009 |

## Styles — `src/styles/app.css`

| Selector | Edit | Requirement |
|---|---|---|
| `.note` | ensure the row lays out text + meta + remove button cleanly (the row is already `display:flex; justify-content:space-between; min-height:44px`). Add the remove button into that flow with appropriate gap; it MUST NOT overlap the tap area used for editing. | FR-012 |
| `.note__remove` (uses `.iconbtn`) | reuse existing `.iconbtn` rules (006 gives `min-block-size:44px; min-inline-size:44px`, inline-flex centering, `:focus-visible` ring, `@media (hover)`-gated emphasis). Resting state de-emphasized (`color: var(--text-faint)` or similar). | FR-012, FR-013, SC-006 |

> No new hover rule outside the existing `@media (hover: hover) and (pointer: fine)` block; the
> control is always visible, so hover styling is purely decorative emphasis.

## i18n — `src/i18n/en.ts` (authoritative) + `src/i18n/uk.ts` (mirror)

| Key | EN | UK |
|---|---|---|
| `note.removeAria` | `Remove point` | `Видалити пункт` |

Parity / no-blank / no-raw-key unit tests already enforce presence in both catalogs.

## Tests (jsdom)

- **Store** (`tests/components/store.test.ts`): removing the currently-edited note clears
  `editing`/`draft` (FR-011); removing a non-edited note leaves `editing` untouched.
- **Component** (`tests/components/note-row.test.ts`): activating ✕ by **click** removes the
  point (FR-003); activating ✕ by **keyboard** (`Enter`, and `Space`) removes it identically
  (FR-008); activating ✕ (click or key) does NOT open the edit form (FR-010); the ✕ exposes the
  localized `note.removeAria` label (FR-009); after removing a weighted advantage the choice's
  derived score/totals update (FR-005/SC-004).
- **Not jsdom-assertable** (manual): 44px physical target (FR-012/SC-006), on-device hover
  emphasis, visual de-emphasis at rest.
