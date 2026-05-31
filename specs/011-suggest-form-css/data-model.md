# Data Model: Suggest-Feature Form Button Layout

Feature: `011-suggest-form-css` · Date: 2026-05-31

## Entities

**None.** This is a presentation-only feature. It introduces no new state, no persisted field,
no schema (`PersistedV1` unchanged), and no change to any existing entity (`AppState`,
`SuggestionDraft`, `Dilemma`, `Choice`, `Note`). The change is confined to component markup and
CSS.

## Runtime / persisted state impact

- `AppState`: unchanged.
- `AppState.suggest` / `SuggestionDraft`: unchanged (fields, validation, `canSend` all intact).
- `localStorage` (`sift.v1`): no read/write change; `schemaVersion` stays 1.

## Presentation contract (informational, not data)

The only "model" here is a CSS/markup contract, specified in
[`contracts/ui-presentation.md`](./contracts/ui-presentation.md):

- Both action buttons in `.modal__actions` carry the shared `btn--half` class.
- `.modal__actions` is a flex row with a preserved `gap`; the two `btn--half` buttons each get
  `flex: 1 1 0`, yielding equal widths summing (with the gap) to the row width.
