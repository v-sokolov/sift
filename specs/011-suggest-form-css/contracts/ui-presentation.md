# Contract: Suggest-Dialog Action Row (UI Presentation)

Feature: `011-suggest-form-css` · Date: 2026-05-31

This contract governs the suggest-a-feature dialog's action row. It is presentation-only; no
JS/store API changes.

## Markup contract (`SuggestDialog.svelte`)

The action row keeps its structure; both buttons gain a shared equal-width hook class:

```html
<div class="modal__actions">
  <button type="button" class="btn btn--half" data-action="close-suggest">{Cancel}</button>
  <button type="submit" class="btn btn--primary btn--half" data-action="suggest-send" disabled?>{Send}</button>
</div>
```

Invariants:
- **C-1**: `.modal__actions` contains exactly two buttons, in order: Cancel (`data-action="close-suggest"`)
  then Send (`data-action="suggest-send"`). (Order unchanged — FR-005.)
- **C-2**: BOTH action buttons carry the `btn--half` class. (Equal-width opt-in — FR-001/FR-003.)
- **C-3**: The Send button retains `btn--primary` and its `disabled` binding; Cancel retains its
  `type="button"`. Click handlers (`closeSuggest`, submit→`send`) unchanged. (FR-005.)
- **C-4**: No other markup in the dialog changes — title, intro, fields, and the
  `.modal__fallback` footnote are untouched. (FR-006.)

## CSS contract (`src/styles/app.css`)

```css
.modal__actions {
  display: flex;
  gap: var(--space-2);   /* preserved — the "space between them" */
  /* justify-content: flex-end;  ← removed: buttons now fill the row */
}
.modal__actions .btn--half {
  flex: 1 1 0;           /* equal grow, zero basis → equal halves of (row − gap) */
}
```

Invariants:
- **C-5**: `.modal__actions` stays a flex row and retains a non-zero `gap`. (FR-002.)
- **C-6**: Each `btn--half` has equal flex grow and a zero (content-independent) basis, so the
  two buttons render at equal width regardless of label length/language. (FR-001/FR-003/FR-004.)
- **C-7**: No horizontal overflow of the action row at any supported viewport width. (FR-002/FR-004.)

## Test-observability

Under jsdom (no stylesheet applied, no layout), the verifiable surface is the **markup contract**
(C-1, C-2). Component test asserts:
- the action row has exactly two buttons in the Cancel→Send order, and
- both carry `btn--half`.

Pixel-level equality (C-6, C-7) is verified manually per the quickstart on-device matrix.
Existing suggest-dialog behavior tests (open, focus, Send-gating, Esc/backdrop close, mailto
hand-off, focus-trap, i18n) are the **regression gate** for C-3/C-4.
