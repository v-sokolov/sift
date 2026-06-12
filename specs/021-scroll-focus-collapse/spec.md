# Feature Specification: Scroll, Focus & Collapsible Header

**Feature Branch**: `021-scroll-focus-collapse`

**Created**: 2026-06-12

**Status**: Draft

**Input**: Auto-scroll to a new item when Add Choice called, auto-focus the Add Point form when called, wrap Header description in a collapsible component for more comfortable use on mobiles, add `scrollbar-gutter: stable` to prevent layout shift when the scrollbar appears/disappears.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Auto-Scroll to New Choice (Priority: P1)

When the user adds a new Choice (via "Add choice"), the viewport scrolls smoothly to bring the newly created card into view so the user can immediately interact with it without having to scroll manually.

**Why this priority**: The most disorienting gap in the current flow — adding a 5th or 6th Choice card pushes content off-screen; the user has no visual confirmation the card appeared.

**Independent Test**: Can be fully tested by adding a Choice while several cards exist and verifying the new card is visible in the viewport after the action.

**Acceptance Scenarios**:

1. **Given** the board has 3+ Choice cards and the new card will be off-screen, **When** the user clicks "Add choice", **Then** the page scrolls so the newly created card is visible.
2. **Given** all existing cards are already visible, **When** the user clicks "Add choice", **Then** the page does not scroll (the card is already in view).
3. **Given** the user prefers reduced motion, **When** a new Choice is added, **Then** the scroll is instant (no animation).

---

### User Story 2 - Auto-Focus Add Point Form (Priority: P2)

When the user opens the "Add point" form inside a Choice card, the first input field is automatically focused so the user can begin typing without an extra tap/click.

**Why this priority**: Reduces friction on the most frequent data-entry action in the app; especially valuable on mobile where tapping a small input is awkward.

**Independent Test**: Can be fully tested by opening the Add Point form and verifying the input receives focus immediately.

**Acceptance Scenarios**:

1. **Given** a Choice card is expanded, **When** the user opens the Add Point form (e.g., clicks "+ Add point"), **Then** the text input in the form is focused.
2. **Given** the Add Point form is already open, **When** the user submits and the form resets for another entry, **Then** focus returns to the input.
3. **Given** the user is navigating by keyboard, **When** they activate the Add Point trigger, **Then** focus moves into the form input without requiring an additional Tab.

---

### User Story 3 - Collapsible Header Description (Priority: P3)

The introductory description text in the page header is hidden by default on narrow viewports (mobile) and can be expanded/collapsed by the user, reducing visual clutter above the board.

**Why this priority**: The description occupies significant vertical space on mobile, pushing the decision board below the fold; collapsing it by default recovers that space. Desktop users with large viewports are unaffected.

**Independent Test**: Can be fully tested at ≤719 px viewport: description is hidden by default with a toggle to expand; at ≥720 px the description is always visible.

**Acceptance Scenarios**:

1. **Given** the viewport is ≤719 px wide, **When** the page loads, **Then** the header description is collapsed (not visible) and a toggle control is shown.
2. **Given** the description is collapsed on mobile, **When** the user activates the toggle, **Then** the description expands and becomes readable.
3. **Given** the description is expanded on mobile, **When** the user activates the toggle again, **Then** the description collapses.
4. **Given** the viewport is ≥720 px wide, **When** the page loads, **Then** the header description is always visible with no toggle shown.
5. **Given** the user has expanded the description on mobile, **When** they reload the page, **Then** the description is collapsed again (state is ephemeral, not persisted).

---

### User Story 4 - Stable Scrollbar Gutter (Priority: P1)

The page layout does not jump horizontally when the scrollbar appears or disappears (e.g., when a dialog opens, content changes height, or the header description is toggled), because a reserved gutter always occupies the scrollbar slot.

**Why this priority**: Layout shift when a scrollbar appears is jarring and makes the UI feel unstable; it is a one-line CSS fix with zero risk. P1 because it is trivially cheap and improves all interactions.

**Independent Test**: Can be fully tested by observing that resizing the window or toggling content height does not cause horizontal reflow of page content.

**Acceptance Scenarios**:

1. **Given** the page has enough content to trigger a scrollbar, **When** content is added or removed (causing the scrollbar to appear or disappear), **Then** the page content width does not shift.
2. **Given** a modal dialog opens (which locks body scroll), **When** the scrollbar disappears, **Then** the layout does not jump.

---

### Edge Cases

- What happens when the board is empty (0 Choices) and the first Choice is added? → scroll fires but the card is likely already visible; no-op scroll is acceptable.
- What if the Add Point form is inside a collapsed accordion card? → The card must be expanded before focus can be applied; auto-expand should precede auto-focus.
- What if the user adds a Choice very quickly (double-click)? → Only one new card is created (existing cap logic); scroll targets that card.
- What if the header description contains a very long text that makes the collapsed toggle hard to find? → Toggle must always remain visible regardless of surrounding content length.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: When a new Choice is added, the application MUST scroll the new card into the visible viewport.
- **FR-002**: Scrolling to a new card MUST respect the user's reduced-motion preference (instant scroll when `prefers-reduced-motion: reduce`).
- **FR-003**: When the Add Point form is opened, the primary text input MUST receive focus automatically.
- **FR-004**: Auto-focus MUST work whether the card was already expanded or was auto-expanded to show the form. (Note: the "+ Add point" button is only reachable from an expanded card in the current UI, so the collapsed-card path is not triggered by user interaction; the requirement stands for any future programmatic call to `openAddForm`.)
- **FR-005**: The header description MUST be hidden by default on viewports ≤719 px wide.
- **FR-006**: A visible toggle control MUST allow the user to show/hide the header description on narrow viewports.
- **FR-007**: On viewports ≥720 px wide, the header description MUST always be visible; no toggle is shown.
- **FR-008**: The collapsed/expanded state of the header description MUST be ephemeral (resets on page load; not persisted to `localStorage`).
- **FR-009**: The toggle MUST be accessible via keyboard and provide a meaningful accessible label reflecting the current state ("Show description" / "Hide description").
- **FR-010**: All four behaviours MUST coexist without regressions to existing accordion, rank, confirm-remove, or toolbar interactions.
- **FR-011**: The global stylesheet MUST reserve a stable gutter for the scrollbar so that page content width does not shift when the scrollbar appears or disappears.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: After adding a Choice, the new card is visible in the viewport within one rendering frame (no manual scrolling required).
- **SC-002**: After opening the Add Point form, the text input is focused without any additional user interaction.
- **SC-003**: On a 375 px wide viewport, the header description is not visible on page load, reclaiming ≥60 px of vertical space above the board.
- **SC-004**: All existing automated tests (≥211) continue to pass; new automated tests cover focus (F1–F3) and collapsible header toggle (H1–H6). Auto-scroll and scrollbar-gutter are verified manually only (jsdom has no layout engine).
- **SC-005**: The collapsible toggle meets WCAG 2.1 AA requirements: keyboard operable, labelled, and state-change announced to screen readers.
- **SC-006**: Opening a dialog or toggling the header description does not cause any horizontal layout shift measurable by a visible content reflow.

## Clarifications

### Session 2026-06-12

- Q: Which enhancements require automated tests? → A: Automated tests for focus (F1–F3) and collapsible header toggle (H1–H6) only — both are straightforward jsdom assertions (activeElement check; DOM visibility check). Auto-scroll (S1–S3) and scrollbar-gutter (G1) are manual-only because jsdom has no layout engine and cannot evaluate `scrollIntoView` calls or CSS `scrollbar-gutter`.

## Assumptions

- The Add Point form trigger already exists inside accordion card bodies; auto-focus is applied after the accordion expansion animation completes (or immediately if already expanded).
- "Scroll into view" means the new card is fully or partially visible; snapping to the top of the card is acceptable.
- The header description is a static text block (not editable) rendered inside the existing `<Header>` component; the collapsible wrapper is added there without restructuring sibling elements.
- The ≤719 px breakpoint aligns with the existing `2-up/≥720` grid tier defined in 020; no new breakpoint is introduced.
- No new runtime dependency is introduced; native browser `scrollIntoView`, focus management, and CSS/Svelte-native disclosure are sufficient.
