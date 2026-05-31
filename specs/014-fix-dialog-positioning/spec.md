# Feature Specification: Fix Suggest-Feature Dialog Positioning

**Feature Branch**: `014-fix-dialog-positioning`

**Created**: 2026-05-31

**Status**: Draft

**Input**: User description: "'Suggest feature' dialog has broken positioning and might be
z-index on all breakpoints. I suppose it is a regression during the refactoring. mb it worth to
revert rebuilding onto bits-ui? or fix it."

## Scope

A **bug fix** for a visual regression introduced by feature 012. When 012 replaced the hand-rolled
suggest modal with Bits UI's `Dialog`, the dialog's overlay and panel stopped being centered: on
every breakpoint the panel renders in the normal page flow (below the rest of the page) instead of
floating centered over a dimmed backdrop.

**Root cause**: The existing styles assume the dialog **panel** (`.modal`) is a *child* of the
dimmed **backdrop** (`.modal-overlay`) — the backdrop is a full-viewport flex container that centers
its child, and the panel is only `position: relative`. Bits UI's `Dialog` instead renders the
backdrop and the panel as **sibling** elements (and inline, in the app's own subtree, with no
portal). With no flex parent to center it and only relative positioning, the panel falls into normal
document flow while the backdrop becomes an empty full-screen dim layer — so the dialog looks broken
and mis-layered.

**Chosen direction (settled — see Clarifications)**: **Fix the styles, keep Bits UI.** The accessible
behaviors Bits UI provides (focus trap, Esc, outside-click dismiss, scroll-lock, focus-return) are
the entire point of 012's adoption and remain correct; only the visual positioning is wrong. The fix
makes the panel position and center itself independently of the backdrop (as its own
fixed, top-layer element) rather than relying on being the backdrop's child. Reverting the Bits UI
rebuild was considered and rejected: it would discard 012's accessibility wins and re-introduce the
hand-rolled focus-trap/Esc/scroll-lock for what is a small, contained style change.

The change is limited to presentation (CSS, and component markup only if needed to carry the styles).
No domain logic, persisted-state, scoring, or arrangement behavior changes.

## Clarifications

### Session 2026-05-31

- Q: The dialog panel is no longer centered because the styles assume it is nested inside the
  backdrop, but Bits UI renders backdrop and panel as siblings. Revert the Bits UI rebuild, or fix
  the styles? → A: **Fix the styles, keep Bits UI.** Re-position the panel as a self-centering,
  top-layer element independent of the backdrop. Reverting would lose 012's accessibility wins for a
  far larger change.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - The suggest dialog appears correctly centered (Priority: P1)

A person browsing the app taps "Suggest a feature." The dialog appears centered in the viewport,
floating above a dimmed backdrop that covers the whole page, with the rest of the page visually
behind it — on phones, tablets, and desktops alike.

**Why this priority**: This is the whole feature. The suggest dialog is currently visually broken on
every breakpoint — the panel is mis-placed and the backdrop is empty — which makes the feature look
broken and is hard to use. Restoring correct presentation is the entire value.

**Independent Test**: Open the suggest dialog at narrow (mobile), medium (tablet), and wide (desktop)
viewport widths; in each case the panel is centered over a full-page dimmed backdrop and sits above
all other page content.

**Acceptance Scenarios**:

1. **Given** the app at any supported viewport width, **When** the suggest dialog is opened, **Then**
   the panel is centered horizontally and vertically within the viewport.
2. **Given** the dialog is open, **When** it is displayed, **Then** a dimmed backdrop covers the
   entire viewport and the panel renders above both the backdrop and all other page content (correct
   stacking).
3. **Given** the dialog is open, **When** the page behind it would otherwise be long, **Then** the
   dialog stays fixed in the viewport (does not appear in the page's normal scroll flow below the
   footer).
4. **Given** a viewport too short to fit the full panel, **When** the dialog is open, **Then** the
   panel is height-bounded to the viewport and its content scrolls within the panel, while remaining
   centered.

### Edge Cases

- **Short / landscape viewports**: the panel must stay within the viewport height and scroll
  internally (the existing `max-height: 90dvh` + internal `overflow: auto` must keep working under
  the new positioning).
- **Long page behind the dialog**: the dialog must remain anchored to the viewport, not scroll away
  with the page body.
- **Backdrop vs. panel stacking**: the panel must always render above the backdrop; the backdrop must
  always render above the rest of the app.
- **Accessible behaviors unchanged**: opening, focus placement on the first field, Tab focus-trap,
  Esc-to-close, outside-click dismiss, body scroll-lock, and focus-return to the trigger must all
  behave exactly as they did after 012 (the fix is visual only).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The suggest dialog panel MUST be visually centered (horizontally and vertically) within
  the viewport when open, at all supported breakpoints.
- **FR-002**: A dimmed backdrop MUST cover the entire viewport behind the open dialog panel.
- **FR-003**: The dialog panel MUST render above the backdrop, and the backdrop MUST render above all
  other application content (correct stacking order on all breakpoints).
- **FR-004**: The dialog panel's centering and stacking MUST NOT depend on the panel being a DOM
  child of the backdrop element (it must work with Bits UI's sibling, inline, no-portal rendering).
- **FR-005**: The dialog MUST remain fixed within the viewport regardless of page scroll position or
  page length (it MUST NOT appear in the normal page flow below other content).
- **FR-006**: On viewports too short for the full panel, the panel MUST stay height-bounded to the
  viewport and scroll its content internally while remaining centered.
- **FR-007**: All of the dialog's accessible behaviors provided by the underlying component (focus
  trap, initial focus on the first field, Esc-to-close, outside-click dismiss, body scroll-lock, and
  focus-return to the trigger) MUST be preserved unchanged.
- **FR-008**: The fix MUST be limited to presentation (styles, and component markup only as needed to
  apply those styles); no domain logic, scoring, arrangement, or persisted-state behavior may change.
- **FR-009**: The Bits UI `Dialog` adoption from 012 MUST be retained (no revert); the existing
  `.modal` / `.modal-overlay` class names and `data-*` hooks used by tests MUST be preserved.

### Key Entities

Not applicable — this is a presentation-only fix with no data model.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: At each of mobile, tablet, and desktop viewport widths (3/3), opening the dialog shows
  the panel centered over a full-viewport dimmed backdrop — **0** breakpoints with the panel
  mis-placed or in normal page flow.
- **SC-002**: The panel renders above the backdrop and the backdrop above all other content in
  **100%** of open states (no content bleeds over the panel).
- **SC-003**: On a viewport shorter than the panel, the panel stays within the viewport and its
  content scrolls internally while remaining centered — **0** instances of the panel overflowing the
  viewport or detaching from center.
- **SC-004**: All accessible dialog behaviors behave identically to their post-012 state — **0**
  regressions in focus trap, Esc, outside-click dismiss, scroll-lock, or focus-return.
- **SC-005**: The type-check reports **0** errors and the full existing test suite passes with no net
  loss of tests after the change.

## Assumptions

- The breakpoints in scope are the project's existing ones (the responsive layout already defined for
  the app); "all breakpoints" means the dialog must be correct across that existing range rather than
  introducing new breakpoints.
- Bits UI continues to render `Dialog.Overlay` and `Dialog.Content` as inline siblings (no portal),
  consistent with the 012 decision to keep the dialog in the app subtree; the fix targets that
  rendering shape.
- The current backdrop dim, panel surface, radius, shadow, max-width (`460px`), and
  `max-height: 90dvh` styling are correct and should be preserved — only the panel's positioning and
  stacking need to change.
- Visual verification across breakpoints is primarily a manual on-device check (jsdom has no layout
  engine); automated tests continue to guard the dialog's event-driven behaviors and class/`data-*`
  contract, not pixel layout.
- This fix does not alter the suggest-feature flow itself (fields, mailto hand-off, fallback link),
  only how the dialog is positioned.
