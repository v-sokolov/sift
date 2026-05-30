# Contract: Add-point above score (US2)

**Unit**: `src/App.svelte` — render order only.

## Behaviour

- The Add-point control (`<AddEditForm />`, which renders the `.addtrigger` button when closed and
  the `.form` when open) MUST appear **before** the score summary (`<Summary />`) in DOM/page order.
- No props, store calls, or internal markup of either component change (FR-014).
- Today: `<Summary />` then `<AddEditForm />`. After: `<AddEditForm />` then `<Summary />`.
  Surrounding elements (`<section class="choices">` above, `<Footer />` below) keep their positions.

## Test assertions

1. In the rendered App, the Add-point trigger (`[data-action="open-add-form"]`) precedes the summary
   element (`.summary` / `[aria-label = summary.aria]`) in document order
   (`compareDocumentPosition` / `Node.DOCUMENT_POSITION_FOLLOWING`).
2. Adding a point still updates the score (existing add-note + summary behaviour unchanged).
3. When the form is open, the form (`[data-action="form"]`) also precedes the summary.
