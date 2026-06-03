# Feature Specification: Extend Choices to Six Options

**Feature Branch**: `015-six-choices`

**Created**: 2026-06-03

**Status**: Draft

**Input**: User description: "I want to extend Choices from 4 to 6 options, and take care about flex-wrapping them on the different screen sizes"

## Clarifications

### Session 2026-06-03

- Q: Which CSS mechanism should drive the wrapping (pure-CSS constraint, summary kept column-aligned)? → A: Count-conditional CSS via `:has()` — keep today's grid formula; a stylesheet rule detects 5+ Choices and switches both the card grid and the summary grid to 3 columns at tablet/desktop widths; 2–4 layouts untouched; no script-computed layout values.
- Q: How should the "too many choices" complexity cue appear (per-card badge + tooltip vs. quiet hint vs. none)? → A: A single muted hint sentence near the "Add choice" control, shown while the board has **4, 5, or 6** Choices; no tooltip — the full text is always visible (a11y), the hint comments on the board (never labels individual Choices), and it is informational only — it never blocks adding.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Compare up to six Choices (Priority: P1)

A user is comparing more than four candidates (e.g., six apartments, six job offers, six tools). Today the app stops them at four Choices. With this feature, the "Add choice" control remains available until the user has six Choices on the board, and every existing capability — naming a Choice, adding/editing/removing points, scoring, removing a Choice, Sort and Group views — works identically for the fifth and sixth Choice.

**Why this priority**: This is the core capability the feature exists for; without raising the cap, nothing else in this spec matters.

**Independent Test**: Start from a fresh board, add Choices until the control disables, confirm six Choice cards exist and each supports the full point/score lifecycle; reload the page and confirm all six persist.

**Acceptance Scenarios**:

1. **Given** a board with 4 Choices, **When** the user activates "Add choice", **Then** a 5th Choice appears and the control stays enabled.
2. **Given** a board with 5 Choices, **When** the user activates "Add choice", **Then** a 6th Choice appears and the control becomes disabled.
3. **Given** a board with 6 Choices, **When** the user removes one, **Then** the "Add choice" control becomes enabled again.
4. **Given** a board with 6 Choices each holding points and scores, **When** the user reloads the page, **Then** all 6 Choices, their points, scores, titles, and ordering are restored.
5. **Given** a board with 5 or 6 Choices, **When** the user switches between Sort and Group views, **Then** points are arranged correctly across all Choices with the same ordering guarantees that hold for 2–4 Choices.

---

### User Story 2 - Readable layout at any Choice count and screen size (Priority: P2)

A user with 5 or 6 Choices views the board on a phone, a tablet, a laptop, and a wide monitor. Choice cards never shrink to an unusable width: when the screen cannot comfortably fit all Choices side by side, the cards wrap onto additional rows instead of cramming into ever-narrower columns. On narrow screens the cards stack; on wide screens they sit side by side.

**Why this priority**: Raising the cap without a wrapping layout would make the board unusable on common screens — six fixed columns at laptop width are too narrow to read or edit.

**Independent Test**: With 6 Choices on the board, resize the viewport from narrow (~360px) to wide (~1600px) and confirm cards stack, then wrap into balanced rows, then sit in a single row — with every card remaining wide enough to read titles and operate point controls at each size.

**Acceptance Scenarios**:

1. **Given** 6 Choices on a narrow (phone-width) screen, **When** the board renders, **Then** Choice cards are stacked vertically and each spans the available width.
2. **Given** 6 Choices on a medium (tablet/laptop-width) screen, **When** the board renders, **Then** cards wrap onto two or more rows rather than rendering six cramped columns, and every card stays at or above a readable minimum width.
3. **Given** 6 Choices on a wide screen, **When** the board renders, **Then** cards can sit in a single row when each still meets the readable minimum width.
4. **Given** 2–4 Choices, **When** the board renders at the same widths that worked before this feature, **Then** the layout is not degraded relative to current behavior (no regression for existing counts).
5. **Given** any Choice count in Group view, **When** the board renders at any width, **Then** the grouped arrangement follows the same wrapping behavior and stays readable.

---

### User Story 3 - Gentle complexity hint at higher Choice counts (Priority: P3)

A user growing their board past a handful of candidates sees a single quiet, non-judgmental hint near the "Add choice" control once the board reaches 4 Choices (and while it has 5 or 6): a short sentence noting that many choices can make a dilemma harder to feel clear about. It never blocks anything, never labels a specific Choice, and disappears when the board drops back to 2–3 Choices.

**Why this priority**: It reinforces the product's reflective, calm character while the cap widens — but the cap and layout (US1/US2) deliver full value without it.

**Independent Test**: Add Choices from 2 upward and confirm the hint is absent at 2–3, appears at 4, persists through 5 and 6, and disappears again after removing down to 3 — with adding never blocked.

**Acceptance Scenarios**:

1. **Given** a board with 3 Choices, **When** the user adds a 4th, **Then** a muted hint sentence appears near the "Add choice" control.
2. **Given** a board with 4–6 Choices, **When** the board renders, **Then** the hint is visible as plain always-visible text (no hover/tooltip required to read it) in the user's language.
3. **Given** a board with 4 Choices, **When** the user removes one (3 remain), **Then** the hint disappears.
4. **Given** the hint is visible, **When** the user activates "Add choice" (below the cap), **Then** the addition proceeds normally — the hint is informational only.

---

### Edge Cases

- Removing Choices from a 6-Choice board down to the minimum of 2 keeps the layout consistent at every intermediate count (5, 4, 3).
- A previously saved board (created when the cap was 4) loads unchanged; the user can immediately add a 5th and 6th Choice to it.
- A saved board that somehow contains more than 6 Choices (hand-edited storage) is handled the same way out-of-range data is handled today (rejected/sanitized per existing persistence validation), never crashing the app.
- New Choices 5 and 6 get distinct placeholder names ("Choice 5", "Choice 6") in both supported languages, consistent with Choices 1–4.
- Wrapped rows with an odd remainder (e.g., 5 cards wrapping 3+2) remain visually balanced enough that no card is orphaned at an unreadable width.
- "Clear" on a 6-Choice board resets to the same default board it produces today (the complexity hint disappears with it, since the default board has fewer than 4 Choices).
- The complexity hint reflects the live count immediately: loading a saved 4–6-Choice board shows it on first render; removing down to 3 hides it without reload.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST allow a board to contain up to 6 Choices (raised from 4); the minimum remains 2.
- **FR-002**: The "Add choice" control MUST remain enabled while the board has fewer than 6 Choices and MUST be disabled at exactly 6, re-enabling when a Choice is removed.
- **FR-003**: The 5th and 6th Choices MUST support the complete existing Choice lifecycle: title editing, point add/edit/remove, scoring, Choice removal, and participation in Sort and Group views with the same ordering guarantees as Choices 1–4.
- **FR-004**: Boards with 5 or 6 Choices MUST persist and restore through the existing local save mechanism without changing the storage format version; boards saved under the previous 4-Choice cap MUST load unchanged.
- **FR-005**: Persistence validation MUST accept 2–6 Choices and continue to reject/sanitize boards outside that range exactly as out-of-range data is treated today.
- **FR-006**: On boards with 5 or more Choices, cards MUST wrap onto additional rows whenever the viewport cannot fit all Choices side by side at a readable card width — cards never compress below a usable minimum just to stay on one row. (Boards of 2–4 Choices are governed by FR-008's no-change rule, not by this wrap obligation.)
- **FR-007**: On narrow (phone-width) screens, Choice cards MUST stack in a single column, preserving today's mobile behavior.
- **FR-008**: The wrap rule (FR-006) applies to 5–6-Choice boards in both Sort and Group views; boards of 2–4 Choices MUST keep their current layout unchanged at every screen size (no regression — per Clarifications, the count-conditional styling cannot affect them).
- **FR-009**: Placeholder names for unnamed Choices MUST extend to "Choice 5" and "Choice 6" in both supported languages (English and Ukrainian), consistent with the existing pattern.
- **FR-010**: Existing accessibility and interaction behaviors (keyboard operability of Choice controls, reduced-motion-aware reorder animation, score formula display) MUST be preserved for boards of any size up to 6.
- **FR-011**: The wrapping MUST be implemented in presentation styling only (pure CSS, conditional on the rendered Choice count) — no script-computed layout values and no markup restructuring; the score summary row MUST remain column-aligned with the Choice cards in every wrapped configuration (5 → 3+2, 6 → 3+3). At side-by-side widths, all Choice cards MUST render at equal height — growing together with the card holding the most points (including across wrapped rows); on the phone-width single-column stack each card hugs its own content.
- **FR-012**: While the board has 4–6 Choices, a single muted hint sentence MUST be shown near the "Add choice" control, noting that many choices can make a dilemma harder to feel clear about. The hint MUST be always-visible plain text (never tooltip-only), localized in both supported languages, non-judgmental in tone, attached to the board state (never to an individual Choice), purely informational (it never disables or delays adding), and absent at 2–3 Choices.

### Key Entities

- **Choice**: A compared candidate; unchanged in shape (title, points, score). Only the allowed count per board changes (2–4 → 2–6).
- **Board (persisted state)**: The saved set of Choices, points, and view preferences; the count constraint widens, the format version stays the same.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A user can go from a fresh board to a fully populated 6-Choice comparison (titles + at least one point each) without encountering any disabled or broken control before the 6-Choice cap.
- **SC-002**: At every viewport width from small phone (~360px) to wide desktop (~1600px), every visible Choice card on a 6-Choice board remains wide enough to read its title and operate its point controls — verified by a manual resize sweep with zero unusable states.
- **SC-003**: 100% of boards saved under the previous 4-Choice cap load without data loss or visual breakage after the update.
- **SC-004**: All existing automated checks for the 2–4 Choice behaviors (ordering, scoring, persistence, removal) continue to pass, and equivalent checks pass at 5 and 6 Choices.
- **SC-005**: The complexity hint is present at exactly the 4-, 5-, and 6-Choice states and absent at the 2- and 3-Choice states, in both languages, with adding never blocked while below the cap — verified by automated state checks.

## Assumptions

- The minimum Choice count stays at 2; only the maximum changes (the user asked to extend "from 4 to 6").
- No change to the persisted storage format version is needed — widening an allowed range is backward compatible, since every previously valid board remains valid.
- "Different screen sizes" means responsive wrapping driven by available width, not new user-facing layout settings; no per-user column configuration is in scope.
- Wrap behavior (per Clarifications): phones keep the single-column stack; at tablet/desktop widths boards with 5–6 Choices render 3 cards per row (3+2 / 3+3) while 2–4 Choices keep today's one-column-per-Choice layout unchanged; the mechanism is pure CSS conditional on Choice count.
- The app targets evergreen browsers (already true for the current stack), so modern CSS count-detection (`:has()`) is an acceptable dependency-free mechanism.
- The complexity hint's exact wording is finalized at planning (tone: gentle observation, no imperative, no "too many" judgment); it follows the existing localization pattern for EN/UA strings.
- The default board produced by "Clear" keeps its current Choice count; this feature does not change the default, only the allowed maximum.
- Layout verification at multiple viewport widths will be partly manual, consistent with how this project verifies visual behavior (automated tests cover logic/limits, not rendered geometry).
