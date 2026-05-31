# Feature Specification: Suggest-Feature Form Button Layout

**Feature Branch**: `011-suggest-form-css`

**Created**: 2026-05-31

**Status**: Draft

**Input**: User description: "Suggest feature form need css improvements. Cancel & Send buttons need 50% width minus space btw them (padding?) and mb footnote looks better if centered? or will be inconcistant with form's header?"

## Scope

A small, presentation-only polish pass on the "Suggest a feature" dialog. The two action
buttons (Cancel and Send) currently sit right-aligned at their natural content widths; this
feature makes them share the action row equally — each occupying half the available width
minus the gap between them. No behavior, copy, validation, or markup semantics change.

The footnote (the LinkedIn fallback line) was considered for centering but is deliberately
**left out of scope** (Clarification, 2026-05-31): it stays left-aligned to remain consistent
with the dialog's left-aligned title, intro, and field labels.

## Clarifications

### Session 2026-05-31

- Q: Should the LinkedIn fallback footnote be centered or kept left-aligned? → A: Keep it
  left-aligned, consistent with the dialog header and form body (no change to the footnote).

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Balanced action buttons (Priority: P1)

A person who has filled in (or chosen not to fill in) the suggest-a-feature form sees the two
choices at the bottom — Cancel and Send — presented as two equally weighted buttons that
together span the form's width, with a clear gap between them. Neither button looks like an
afterthought crammed into a corner; the decision reads as a balanced either/or.

**Why this priority**: This is the entire feature. It is the only user-visible change and
delivers the whole value (a more balanced, intentional-looking action row) on its own.

**Independent Test**: Open the suggest-a-feature dialog and observe the action row: Cancel and
Send each occupy half the row, separated by a gap, with no horizontal overflow at any supported
viewport width.

**Acceptance Scenarios**:

1. **Given** the suggest-a-feature dialog is open, **When** the action row is rendered, **Then**
   the Cancel and Send buttons are equal in width.
2. **Given** the dialog is open, **When** the action row is rendered, **Then** the two buttons
   together fill the row's full width with a visible gap between them and no overflow.
3. **Given** the dialog is open on a narrow (mobile) viewport, **When** the action row is
   rendered, **Then** the buttons remain equal-width, side by side, and do not overflow the
   dialog.
4. **Given** the Send button is disabled (form not yet valid), **When** the row is rendered,
   **Then** it still occupies its half-width slot (disabled state does not collapse its width).

### Edge Cases

- Localized labels of different lengths (e.g., Ukrainian "Скасувати" vs. English "Cancel"):
  buttons stay equal-width regardless of label length; the longer label must not make one
  button wider than the other.
- Very narrow viewports: the equal-width split must not push either button's label to overflow
  or clip; the gap is preserved.
- The footnote and all other dialog content remain visually unchanged.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The Cancel and Send buttons in the suggest-a-feature dialog MUST each occupy an
  equal share of the action row's width (each ≈ 50% minus half the inter-button gap).
- **FR-002**: A visible gap MUST separate the two buttons; the buttons plus gap MUST fill the
  action row's full width without horizontal overflow.
- **FR-003**: The buttons MUST remain equal-width regardless of label content or language
  (label length MUST NOT make the two buttons unequal).
- **FR-004**: The equal-width layout MUST hold across supported viewport widths, including
  narrow mobile widths, with no overflow or label clipping.
- **FR-005**: The change MUST be presentation-only: button labels, order (Cancel then Send),
  click behavior, disabled-state logic, focus order, and dialog semantics MUST remain unchanged.
- **FR-006**: The LinkedIn fallback footnote MUST remain left-aligned (unchanged), consistent
  with the dialog title, intro, and field labels.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: In the open dialog, the rendered widths of the Cancel and Send buttons are equal
  (within sub-pixel rounding).
- **SC-002**: The combined width of both buttons plus the gap equals the action row's content
  width (the row has no horizontal overflow) at desktop and mobile viewport widths.
- **SC-003**: Switching the interface language (English ↔ Ukrainian) leaves the two buttons
  equal-width.
- **SC-004**: No regression in the existing suggest-dialog behavior: opening, field entry,
  Cancel, Send (mailto handoff), disabled-Send gating, Esc/backdrop close, and focus handling
  all continue to pass their existing tests.

## Assumptions

- "50% width minus space between them" is interpreted as: the two buttons evenly split the
  action row, each flexing to fill its half while the existing inter-button gap is preserved
  (i.e., each button ≈ 50% of the row minus its share of the gap). This is achieved by letting
  both buttons flex equally within the existing flex action row.
- The existing inter-button gap token is retained as the "space between them"; no new spacing
  value is introduced unless the existing gap proves visually insufficient.
- This is a UI-polish pass within the established Svelte 5 + Tailwind v4 component/CSS structure;
  it touches only the dialog's action-row styling (and, if needed, the action buttons' flex
  behavior), with no change to the pure core, store, persistence, or i18n catalogs.
