# Feature Specification: Remove Point & Preserve Preferences on Clear

**Feature Branch**: `007-remove-point`

**Created**: 2026-05-31

**Status**: Draft

**Input**: User description: "Remove a point: each added point row shows an always-visible small ✕ remove button (de-emphasized, brightens on hover/focus; never hover-only so it works on touch and keyboard). Clicking it removes that single point immediately with no confirmation. Presentation-only addition wiring the existing removeNote store action; no data-model, scoring, or i18n-key behavior change beyond adding an accessible label for the remove control. Must satisfy the 006 mobile/responsive accessibility hardening (44px touch target, focus-visible, @media hover gating not applicable since always visible)."

## Clarifications

### Session 2026-05-31

- Q: Should the global "Clear" action preserve the user's Theme and Language choices? → A:
  Yes — Clear MUST NOT erase Theme or Language. (Verified current behavior: Language is already
  preserved by the clear action; Theme is currently reset to the default and MUST now be
  preserved too. This is an intentional, in-scope behavior change to Clear; see US2, FR-016/017,
  and the amended invariants FR-014/FR-015.)

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Remove a single point from a choice (Priority: P1)

A person weighing a decision has added several points (advantages, disadvantages, or
neutral observations) under a choice. They realize one point is wrong, duplicated, or no
longer relevant. They want to delete just that one point without touching the others and
without clearing the whole decision.

**Why this priority**: This is the entire feature. Today a point can only be edited, never
removed — the only way to discard one is to blank its text (leaving an empty row) or to use
the destructive "Clear" action that wipes everything. A per-point remove closes that gap and
is the sole deliverable; everything else in the spec exists to make this one action correct,
accessible, and safe.

**Independent Test**: Add two or more points to a choice, activate the remove control on one
of them, and confirm that point disappears immediately while the others — and the rest of the
decision — remain unchanged. Fully testable in isolation; delivers the complete user value on
its own.

**Acceptance Scenarios**:

1. **Given** a choice with three points, **When** the user activates the remove control on the
   second point, **Then** that point is removed immediately, the other two remain in their
   original order, and no confirmation prompt appears.
2. **Given** a choice with one point, **When** the user removes it, **Then** the choice returns
   to its empty-points state (the same state as before any point was added).
3. **Given** points exist under a choice, **When** any point is removed, **Then** the choice's
   running score and totals update to reflect the removed point's contribution being gone.
4. **Given** the decision is persisted locally, **When** a point is removed, **Then** the
   removal survives a page reload (the removed point does not reappear).
5. **Given** a keyboard-only user has focused a point's remove control, **When** they activate
   it with the standard activation keys, **Then** the point is removed exactly as with a click
   or tap.

---

### User Story 2 - Clear keeps Theme and Language (Priority: P2)

A person has set the interface to their preferred theme (e.g., dark) and language (e.g.,
Ukrainian). They finish weighing one decision and use "Clear" to start fresh. They expect the
board to empty, but their chosen theme and language to stay exactly as they set them — Clear is
about discarding the decision content, not resetting their interface preferences.

**Why this priority**: P2 because it is a smaller, independent correctness fix that rides
alongside the primary remove-point work. Language is already preserved today; Theme is not (it
resets to the default), which is a mild but real annoyance. Fixing it makes "Clear" predictable
without expanding the feature's surface.

**Independent Test**: Set a non-default theme and language, add some content, activate "Clear",
and confirm the board resets to empty while the theme and language remain exactly as chosen —
including after a page reload.

**Acceptance Scenarios**:

1. **Given** the theme is set to a non-default value (e.g., dark) and content exists, **When**
   the user activates "Clear", **Then** the board resets to empty but the theme remains the
   chosen value (not the default).
2. **Given** the language is set to a non-default value (e.g., Ukrainian), **When** the user
   activates "Clear", **Then** the language remains the chosen value.
3. **Given** a "Clear" has just preserved theme and language, **When** the page is reloaded,
   **Then** the preserved theme and language still apply (the preferences persisted).

---

### Edge Cases

- **Removing the last remaining point**: the choice returns to its empty state and continues to
  accept new points; no error, no orphaned empty row.
- **Rapid repeated removals**: removing several points in quick succession removes exactly those
  points, each independently, with no off-by-one or wrong-row deletion.
- **Removing a point that is currently being edited**: if the add/edit form is open for the same
  point being removed, the form must not be left bound to a now-nonexistent point (it closes or
  resets cleanly). See FR-011.
- **Empty-text point**: a point whose text is blank is still removable via its remove control
  (it is a normal point in every respect).
- **Touch device with no hover**: the remove control is fully visible and operable without any
  hover capability (the control is never revealed by hover alone).
- **Clear with non-default preferences**: activating "Clear" while the theme and/or language are
  set to non-default values empties the board but leaves both preferences untouched (see US2).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Each point row MUST display a dedicated remove control associated with that single
  point.
- **FR-002**: The remove control MUST be always visible whenever its point row is visible — it
  MUST NOT be revealed only on hover or only on focus.
- **FR-003**: Activating a point's remove control MUST remove that one point and only that point,
  leaving all other points and their order unchanged.
- **FR-004**: Removal MUST happen immediately upon activation, with no confirmation step or
  undo prompt.
- **FR-005**: After a removal, the choice's score and for/against totals MUST update to reflect
  the removed point no longer contributing.
- **FR-006**: Removing the last point of a choice MUST return the choice to its empty-points
  presentation and leave it able to accept new points.
- **FR-007**: A removal MUST be persisted to local storage so it survives a page reload.
- **FR-008**: The remove control MUST be operable by pointer (click/tap) and by keyboard
  (focusable and activatable with the standard activation keys), with identical behavior.
- **FR-009**: The remove control MUST carry an accessible, localized label that names the action
  (e.g., "Remove point") so assistive technology announces its purpose; activating the point row
  itself MUST remain "edit", distinct from the remove action.
- **FR-010**: Activating the remove control MUST NOT also trigger the point row's edit action
  (the two interactions are independent; activating remove does not open the edit form).
- **FR-011**: If the add/edit form is currently open for the point being removed, the form MUST
  NOT remain bound to the removed point (it MUST close or reset to a safe state).
- **FR-012**: The remove control MUST meet the established mobile touch-target floor (a minimum
  44×44 CSS-pixel activation area) and MUST show a visible keyboard focus indicator, consistent
  with the 006 accessibility hardening.
- **FR-013**: The remove control MUST be visually de-emphasized at rest and MAY brighten on
  hover/focus on devices that support hover, but this emphasis MUST be decorative only — never
  the sole means of discovering or operating the control.

### Invariants (no-change requirements)

- **FR-014**: This feature MUST NOT change the data model, the scoring formula, or any existing
  i18n message key's meaning; the only additions permitted are presentation, the wiring of the
  existing remove action, one new accessible-label message (with EN/UK parity), and the Clear
  preference-preservation change in FR-016–FR-018.
- **FR-015**: All existing automated tests MUST continue to pass; the only intentional behavior
  change is that "Clear" now preserves the Theme (in addition to the Language it already
  preserves). All other existing behavior, copy, and persistence format MUST be preserved.

### Clear preserves preferences (US2)

- **FR-016**: The "Clear" action MUST preserve the user's current Theme; it MUST NOT reset the
  theme to a default value.
- **FR-017**: The "Clear" action MUST preserve the user's current Language; it MUST NOT reset the
  language. (This already holds today and MUST be retained.)
- **FR-018**: Preferences preserved by "Clear" (Theme and Language) MUST persist across a page
  reload, exactly as a normal preference change does. "Clear" continues to empty all
  decision content (title, choices' points, and view/sort options) as before.

### Key Entities

- **Point**: a single advantage, disadvantage, or neutral observation under a choice. This
  feature adds no fields; it only enables deleting an existing point. (Known in the UI as a
  "point"; the underlying record is unchanged.)
- **Choice**: a candidate being compared, holding zero or more points. Removing points changes
  only which points it holds.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A user can remove a specific point in a single action (one tap, click, or key
  activation) from the point row, without opening any menu or dialog.
- **SC-002**: Removing a point takes effect in under 1 second and with zero confirmation steps.
- **SC-003**: 100% of point rows expose a remove control that is operable by touch, mouse, and
  keyboard alike, with no point relying on hover to reveal its control.
- **SC-004**: After removing any point, the displayed score and totals match a fresh calculation
  over the remaining points (no stale totals).
- **SC-005**: Removals persist across a page reload in 100% of cases.
- **SC-006**: The remove control's activation area is at least 44×44 CSS pixels on mobile
  viewports, matching the rest of the interface's touch targets.
- **SC-007**: After activating "Clear", the Theme and Language match what the user had set
  beforehand in 100% of cases (both before and after a page reload), while all decision content
  is emptied.

## Assumptions

- The underlying remove-a-point capability already exists in the application's state layer and
  this feature wires an always-visible control to it; no new persistence or calculation logic is
  introduced.
- "Immediate, no confirmation" is the intended behavior for removing a point (consistent with
  the app's calm, low-friction interaction model); the global "Clear" remains the only action
  that confirms before discarding, and that confirmation behavior is unchanged here — this
  feature only changes which preferences "Clear" preserves (Theme and Language), not whether it
  confirms or what content it empties.
- Removing a choice entirely is a separate, pre-existing capability and is out of scope for this
  feature, which concerns points only.
- The accessible label reuses the project's existing localization approach (EN authoritative,
  UK mirrored) and adds exactly one new message key.
- This is a presentation + wiring change on the current UI stack; it introduces no new runtime
  dependencies and no backend/network/telemetry.
