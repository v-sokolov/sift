# Feature Specification: Confirm Removing a Choice with Points

**Feature Branch**: `016-confirm-remove-choice`

**Created**: 2026-06-03

**Status**: Draft

**Input**: User description: "I want to add a confirmation dialog \"if try to remove Choice which includes at least one list-item\""

## Clarifications

### Session 2026-06-03

- Q: Should the confirmation reuse the native browser prompt (the Clear precedent) or an in-app dialog? → A: An **in-app modal dialog** built on the product's existing headless dialog foundation, and the **board-Clear confirmation migrates onto the same dialog** so both destructive actions share one consistent, themed pattern. The dialog MUST be positioned correctly as a fixed, centered top layer (per the 014 placement contract) and MUST block background scrolling while open.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Confirm before destroying entered points (Priority: P1)

A user has written several points (pros/cons/neutral notes) on a Choice and clicks its remove (✕) control — perhaps deliberately, perhaps by mistake. Instead of the Choice and all its points vanishing instantly, a confirmation appears explaining that the Choice and its points will be removed and cannot be undone. Confirming removes the Choice exactly as removal works today; declining leaves the board completely untouched.

**Why this priority**: Points are the user's only hand-entered data; today one stray click destroys them with no undo. This is the entire purpose of the feature.

**Independent Test**: Add points to a Choice, click ✕, verify a confirmation appears; decline → board unchanged; repeat and confirm → Choice gone with all existing post-removal behavior intact.

**Acceptance Scenarios**:

1. **Given** a Choice with at least one point (of any type), **When** the user activates its remove control, **Then** a confirmation is shown and the Choice is NOT yet removed.
2. **Given** the confirmation is shown, **When** the user declines (cancel action, Esc, or equivalent dismissal), **Then** the Choice, its points, and the rest of the board remain exactly as before.
3. **Given** the confirmation is shown, **When** the user confirms, **Then** the Choice and its points are removed with today's post-removal behavior preserved (add-control re-enables below the cap, an open point form tied to that Choice closes, scores/summary update).
4. **Given** the confirmation is shown, **When** it is displayed, **Then** its text names the consequence (the Choice and its points are removed; cannot be undone) in the user's language (EN/UA).

---

### User Story 2 - Empty Choices keep frictionless removal (Priority: P2)

A user pruning empty Choice cards (no points) clicks ✕ and the card disappears immediately, exactly as today — no confirmation, no extra click. Only Choices that actually hold points gain the protective prompt.

**Why this priority**: The confirmation exists to protect entered data; prompting for empty cards would add friction with nothing to protect, against the product's calm, low-friction character.

**Independent Test**: On a board with an empty Choice and a Choice holding points, remove the empty one → instant; remove the other → prompted.

**Acceptance Scenarios**:

1. **Given** a Choice with zero points (regardless of whether it has a title), **When** the user activates its remove control, **Then** it is removed immediately with no confirmation.
2. **Given** a Choice whose points were all individually deleted earlier, **When** the user then removes the Choice, **Then** no confirmation appears (count is evaluated at the moment of removal).

---

### Edge Cases

- A Choice holding only neutral points (no weights) still triggers the confirmation — any point counts as user data.
- Declining the confirmation leaves an open point form, scores, ordering, and persisted state untouched — truly a no-op.
- The remove control stays disabled at the 2-Choice minimum (existing behavior); the confirmation never appears for a removal that would be refused anyway.
- While the confirmation is open, the rest of the page does not react to stray clicks/keys (the decision is modal); dismissing by clicking outside or pressing Esc counts as declining.
- The confirmation works the same in Sort and Group views and at any Choice count (2–6).
- Removal confirmed on a 6-Choice board re-enables the Add-choice control and re-evaluates the 4–6 complexity hint (015) — both follow the live count as they already do.
- Language switched to UA: the confirmation text, confirm action, and cancel action all render in Ukrainian.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Activating the remove control of a Choice containing one or more points (any type) MUST present a confirmation before any change is made; the removal MUST proceed only on explicit confirmation.
- **FR-002**: Activating the remove control of a Choice containing zero points MUST remove it immediately with no confirmation (current behavior preserved); the point count is evaluated at activation time.
- **FR-003**: Declining the confirmation (cancel action, Esc, or dismissal such as clicking outside) MUST leave the entire application state unchanged — no Choice, point, score, view, form, or persisted-state change.
- **FR-004**: Confirming MUST remove the Choice with all existing post-removal behavior intact: add-control re-enabling, closing a point form tied to the removed Choice, score/summary/leader recalculation, and (since 015) complexity-hint re-evaluation.
- **FR-005**: The confirmation text MUST state what will happen — the Choice and its points are removed and cannot be undone — and SHOULD identify the Choice (by its name, or its placeholder name when untitled).
- **FR-006**: The confirmation MUST be presented as an in-app modal dialog: fully keyboard-operable (reachable actions, Esc declines), correctly positioned as a fixed, centered top layer above all page content at every breakpoint (the 014 placement contract), with the page behind it non-scrollable and non-interactive while open, and themed consistently in light and dark modes.
- **FR-007**: All confirmation text (message and both actions) MUST be localized in English and Ukrainian, following the existing localization pattern.
- **FR-008**: The feature MUST NOT add any persisted state ("don't ask again" toggles are out of scope); the prompt appears every time the trigger condition holds.
- **FR-009**: Domain behavior (scoring, arrangement, count invariants 2–6) and the persisted-state format MUST remain unchanged; this is a presentation/interaction-flow feature only.
- **FR-010**: The existing board-Clear confirmation MUST migrate onto the same in-app dialog (same placement, scroll-lock, keyboard behavior, and visual style), preserving its current message, decline-is-no-op semantics, and theme/language survival of the cleared board — after this feature, no destructive action uses a native browser prompt.

### Key Entities

- **Choice**: unchanged; its live point count (≥1 vs 0) is the trigger condition.
- **Confirmation prompt**: transient UI state only — never persisted.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Removing a Choice with points always (100% of attempts) requires an explicit second action; one accidental click can no longer destroy entered points.
- **SC-002**: Declining the confirmation results in zero observable change to the board — verified by comparing full application state before and after.
- **SC-003**: Removing an empty Choice still completes in a single click with no prompt (no added friction for the no-data case).
- **SC-004**: The full flow (prompt → confirm/decline) is completable using only the keyboard, and all its text renders correctly in both supported languages.
- **SC-005**: All existing automated checks (gating, persistence, ordering, 015 behaviors) continue to pass with the confirmation in place.
- **SC-006**: After migration, the Clear flow behaves identically through the new dialog — declining changes nothing; confirming clears the board while preserving theme and language — and no native browser prompt remains anywhere in the product.

## Assumptions

- "List-item" in the feature description means a **point** (the domain term for a pro/con/neutral note on a Choice); a Choice's title alone does not count as content worth a prompt — only points trigger it.
- The product already has one destructive-action confirmation (board Clear); per Clarifications, both it and the new Choice confirmation share one in-app dialog pattern (FR-010) — the previously open presentation question is resolved.
- No undo system exists or is being introduced; confirmation-before-destruction remains the protection model.
- The prompt has exactly two outcomes (confirm / decline) — no third "remove but keep points" action; points cannot exist outside a Choice.
- Frequency capping or "don't ask again" is intentionally out of scope (would require persisted preference state, FR-008).
