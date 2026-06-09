# Feature Specification: Fix Suggest-Feature Dialog Positioning

> **Status: Shipped — condensed 2026-06-09**

A bug fix for a visual regression introduced by feature 012 (merged PR #16).

## What shipped

Re-styled the suggest dialog panel (`.modal`) to **self-center as a fixed, top-layer
element** — independent of being the backdrop's DOM child — fixing 012's Bits UI
inline-sibling regression that dropped the panel into normal page flow below the
footer. The backdrop (`.modal-overlay`) stays a pure full-viewport fixed dim layer.
Presentation-only: one CSS rule-block change in `src/styles/app.css`; no markup,
domain logic, scoring, arrangement, or persisted-state change. Bits UI is retained
(no revert).

The exact placement rule is the **protected anchor** cited by later features as the
"014 placement CSS / 014 precedent" — see `contracts/dialog-positioning.md`.

## Why

When 012 replaced the hand-rolled suggest modal with Bits UI's `Dialog`, the panel
stopped centering. **Root cause**: the styles assumed `.modal` was a *child* of the
flex-centering `.modal-overlay` backdrop, but Bits UI renders `Dialog.Overlay` and
`Dialog.Content` as **inline siblings** (no portal). With no flex parent and only
`position: relative`, the panel fell into normal document flow (rendered after
`<Footer />`, since `<SuggestDialog />` is last in `App.svelte`) while the backdrop
became an empty full-screen dim layer.

## Key decisions

- **Fix the styles, keep Bits UI** (clarified 2026-05-31). Reverting the 012 rebuild
  would discard its accessibility wins (focus trap, Esc, outside-click dismiss,
  scroll-lock, focus-return) for a far larger change than a contained CSS fix.
- **Self-centering technique**: `position: fixed; inset: 0; margin: auto;
  height: fit-content` over the `z-index: 100` backdrop — centers on both axes
  without a flex parent or transform, composing cleanly with the preserved
  `max-width: 460px` / `max-height: 90dvh` + internal `overflow: auto`.
  (Transform-centering and re-nesting/portalling were considered and rejected.)
- **Breakpoint-agnostic**: no media query targets the modal, so a single rule fixes
  all widths. Edge gutter preserved so the panel never touches screen edges on small
  viewports.
- **Preserved unchanged**: the `.modal` / `.modal-overlay` class names, all `data-*`
  test hooks, the dim/surface/radius/shadow/max-width/max-height appearance, and every
  Bits UI accessible behavior (FR-007/009).

## Requirements

- **FR-001** Panel visually centered (both axes) within the viewport at all breakpoints.
- **FR-002** Dimmed backdrop covers the entire viewport behind the panel.
- **FR-003** Panel renders above the backdrop; backdrop renders above all other content.
- **FR-004** Centering MUST NOT depend on the panel being a DOM child of the backdrop
  (works with Bits UI sibling / inline / no-portal rendering).
- **FR-005** Dialog stays fixed in the viewport regardless of page length or scroll
  position (never appears in normal flow below other content).
- **FR-006** On short viewports the panel stays height-bounded and scrolls its content
  internally while remaining centered.
- **FR-007** All Bits UI accessible behaviors (focus trap, initial focus on first field,
  Esc, outside-click dismiss, body scroll-lock, focus-return) preserved unchanged.
- **FR-008** Limited to presentation; no domain/scoring/arrangement/persisted-state change.
- **FR-009** Bits UI `Dialog` retained; existing `.modal` / `.modal-overlay` classes and
  `data-*` hooks preserved.

## Verification

jsdom has no layout engine, so layout/stacking is a manual cross-breakpoint visual pass
(mobile / tablet / desktop + a short viewport). The automated guard is the preserved
behavior/contract component tests (`tests/components/suggest.test.ts`) — the dialog still
mounts, keeps its classes and `data-*` hooks, and its event behaviors still pass.
Type-check and the full existing suite stay green (no net loss of tests).
