# Contract: Destructive-Action Confirmation Dialog (016)

Behavior automated (jsdom, inline dialog); placement/scroll-lock geometry manual (014 precedent).

## Behavior contract

- **B1 — Trigger condition**: clicking `[data-action="remove-choice"]` on a Choice with
  `notes.length >= 1` (any type, incl. neutral-only) opens the confirmation dialog BEFORE
  any state change; with `notes.length === 0` no dialog appears and removal is immediate
  (FR-001/FR-002). The count is read at click time.
- **B2 — Decline is a no-op**: Cancel, Esc, or outside-click closes the dialog and leaves
  the entire `AppState` deep-equal to its pre-click value — choices, notes, editing/draft,
  view, status (FR-003, SC-002). No mutation → no `subscribePersist` notification.
- **B3 — Confirm delegates unchanged**: the confirm action calls the existing
  `removeChoice(id)` (or `clearDilemma()`) mutation — MIN-gate, editing-cleanup,
  count/score/summary/hint reactivity, theme+lang survival on Clear: all current behavior
  (FR-004/FR-010). The store mutations themselves are NOT modified.
- **B4 — Message content**: the dialog message is `t(lang, 'confirm.removeChoice',
  { name })` where `name` is `choice.title` or, when empty, the localized
  `choice.placeholder` for that position; Clear keeps its existing `confirm.clear`
  message. Message and both button labels render in the active language (EN/UA) and share
  the "can't be undone" register (FR-005/FR-007).
- **B5 — No new state**: no persisted keys, no "don't ask again", no store fields — open
  state is local component state at each call site (FR-008/FR-009).
- **B6 — Clear migration completeness**: after 016, `window.confirm` is invoked nowhere
  (asserted by spy in tests; `grep -rn "window.confirm" src/` returns nothing); both
  destructive actions flow through `ConfirmDialog` (SC-006).

## Dialog contract (shared `ConfirmDialog.svelte`)

- **D1 — Primitive & rendering**: Bits UI `Dialog`, rendered inline (no Portal — 012
  pattern); focus-trap, Esc-decline, outside-click dismiss, focus-return, and background
  **scroll-lock** are the primitive's responsibility (verified 012).
- **D2 — Placement (014 contract reused)**: `Dialog.Overlay class="modal-overlay"`
  (fixed, `z-index:100` backdrop) + `Dialog.Content class="modal modal--confirm"` (fixed,
  `inset:0; margin:auto; height:fit-content; z-index:101`); `.modal--confirm` only narrows
  `max-width` (~360px). No media query targets the dialog (breakpoint-agnostic, 014).
- **D3 — Actions & semantics**: exactly two buttons — Cancel
  (`data-action="confirm-dialog-cancel"`) and the destructive action
  (`data-action="confirm-dialog-confirm"`, label per call site: Remove / Clear) —
  equal-width per the 011 `btn--half` pattern; both keyboard-reachable. The overlay
  carries `data-action="confirm-dialog-backdrop"` (outside-click-decline test hook).
  **The message renders inside `Dialog.Title`** (one-sentence dialogs; the message IS the
  accessible name — never an empty/undefined title, no separate `title` prop).
- **D4 — Theming**: styled via existing tokens; AA contrast in light and dark (no new
  palette entries expected).

## Stability constraints

- **S1**: `removeChoice`/`clearDilemma` signatures and behavior in `store.svelte.ts`
  untouched; all existing store/lifecycle/toolbar tests keep passing unmodified.
- **S2**: No dependency changes; `.modal`/`.modal-overlay` base CSS rules from 014 are
  reused, not modified; `SuggestDialog` is untouched.
- **S3**: i18n catalog parity (every key in both `en` and `uk`) holds — enforced by the
  existing parity test. `data-action` hooks (`remove-choice`, `clear`) preserved.
