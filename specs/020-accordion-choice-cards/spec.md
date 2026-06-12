# Feature Specification: Accordion Choice Cards

**Feature Branch**: `020-accordion-choice-cards`

**Created**: 2026-06-12

**Status**: Draft

**Input**: User description: "I'd like to make Choice Cards as wrappable Accordions, the Header should be Choice-Name, the wrappable content is list of Points, and the footer is its Score (keep the colour styles aligned)"

## Clarifications

### Session 2026-06-12

- Q: With each card's footer now showing its score, what happens to the existing column-aligned score summary band below the board? → A: Keep as-is — the footer score is an additional at-a-glance duplicate; the band can be revisited in a later feature.
- Q: Should a card's collapsed/expanded state survive a page reload? → A: No persistence; all cards are **collapsed by default**, and the related card expands automatically whenever its Points list updates.
- Q: Should the disclosure use a Bits UI primitive or a native toggle button? → A: A Bits UI primitive, consistent with the 012 Bits UI Dialog adoption (initially `Collapsible`; primitive choice refined in the next bullet).
- Q: `Collapsible` per card, or `Accordion`? → A: **One Bits UI `Accordion` per card** — each card hosts its own `Accordion.Root type="single"` with a single `Accordion.Item`; cards remain fully independent of each other (FR-002).
- Q: (header redesign) How does title editing work once an explicit Edit control is the only entry point? → A: **In-place header edit** — the Rename control swaps the header's read-only title text for the input, autofocused; Enter/blur commits, Esc cancels, focus returns to the Rename control; header returns to read-only text after.
- Q: (header redesign) Where do the Edit and Remove controls live and how are they named? → A: **Bottom actions row inside the collapsible body** (after the points list, before the score footer): "✎ Rename" · "✕ Remove", localized text + icon buttons.
- Q: (header redesign) Does the whole header toggle, or only the chevron? → A: **Whole header toggles** (read-only title + chevron at the far right; placement moved left→right by a follow-up direction); the chevron stays the single accessible toggle button; header-click toggling is suppressed while the title-edit input is open.

### Session 2026-06-12 — post-implementation polish (user directions, applied same day)

- Card footer mirrors the summary band's `.sum--*` sign treatment (soft tint + sign top border), not text-colour only; leader highlight stays band-only.
- Toggle icon is a **CaretDown SVG** (22px, currentColor): points down collapsed, flips 180° open. (Earlier glyph iterations ▸/▶ superseded.)
- Board grid: **2 cards per row at ≥720px** (1-2 / 3-4 / 5-6), **3 per row at ≥1280px**, single column below 720px; the summary band mirrors all breakpoints. Supersedes the 015 wrap rules.
- Card actions row: "✎ Rename" / "✕ Remove" as single-line icon+label buttons, `space-between` (Rename left edge, Remove right edge).
- App header: tagline sits below the brand row (column-grouping experiment reverted) with clear top padding; **"Suggest a feature" is the only accent (`btn--primary`) button**; Add-choice is a plain button. Tagline extended with the privacy sentence — EN "Private by design: your data is stored only in this browser, with no server backup." / UA "Приватність за задумом: ваші дані зберігаються лише в цьому браузері, без резервної копії на сервері."
- Toolbar: Add-choice moved to the views row (Rank │ Group/Sort left, Add-choice pinned right by `space-between`); settings row regrouped as two wrap-as-a-unit pairs **[language+theme]** and **[status+Clear]** (status before Clear), `space-between` at all widths, stacking into two rows below 475px where each pair member spreads to at most `50% − gap`; EN/UA always split the language toggle 50/50; the status indicator centres its content. The 018 equal-thirds mobile rule is removed.
- Q: Which Score row should be hidden (code kept, not rendered)? → A: **The summary band below the board** — `<Summary />` stays in the codebase but is not rendered; the card footers are the only visible score display. Supersedes the earlier "summary band stays as-is" answer (FR-011 rewritten); band behaviour stays contract-tested at the component level.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Collapse a Choice to its essentials (Priority: P1)

A user weighing several Choices wants to tuck away the detail of Choices they have
already filled in. They collapse a Choice card so only its name (header) and its
score (footer) remain visible; the list of Points folds away. Expanding it brings
the full Point list back exactly as it was. Each card collapses and expands
independently of the others.

**Why this priority**: This is the core of the feature — the accordion behaviour
itself. Without it nothing else in this spec exists.

**Independent Test**: Can be fully tested by creating a Choice with a few Points,
collapsing it, confirming only name and score remain visible, expanding it, and
confirming the Point list reappears unchanged — while a second card stays untouched.

**Acceptance Scenarios**:

1. **Given** an expanded Choice card with Points, **When** the user activates the collapse control, **Then** the Point list is hidden while the Choice name (header) and score (footer) remain visible.
2. **Given** a collapsed Choice card, **When** the user activates the expand control, **Then** the full Point list (including any group headings in Group mode) reappears unchanged.
3. **Given** three Choice cards, **When** the user collapses one of them, **Then** the other two cards keep their current expanded/collapsed state.
4. **Given** a collapsed Choice card, **When** the user adds, edits, or removes a Point on that Choice, **Then** the card expands automatically and the footer score reflects the change immediately.
5. **Given** a collapsed Choice card, **When** the user clicks anywhere on the header row (the Choice name or the chevron), **Then** the card expands; clicking the header again collapses it.
6. **Given** an expanded Choice card, **When** the user activates "✎ Rename" in the actions row, types a new name, and presses Enter, **Then** the header shows the new name as read-only text; **When** they instead press Esc mid-edit, **Then** the prior name is restored and focus returns to the Rename control.

---

### User Story 2 - See each Choice's score on the card (Priority: P2)

A user comparing options wants to see each Choice's total score directly on its
card, not only in the summary band below the board. Every Choice card gains a
footer showing that Choice's signed total score (with its +/−/0 prefix), coloured
by sign using the same positive/negative/neutral colour conventions already used
for scores elsewhere in the app.

**Why this priority**: The footer is what makes a collapsed card useful — name
plus score at a glance. It also stands alone as value even if cards are never
collapsed.

**Independent Test**: Can be fully tested by adding weighted Points to a Choice
and verifying the card footer shows the same signed, sign-coloured total as the
existing score summary for that Choice.

**Acceptance Scenarios**:

1. **Given** a Choice whose Points sum to a positive total, **When** the user views its card, **Then** the footer shows the total with a "+" prefix in the established positive colour.
2. **Given** a Choice whose Points sum to a negative total, **When** the user views its card, **Then** the footer shows the total with a "−" prefix in the established negative colour.
3. **Given** a Choice with no Points or a zero total, **When** the user views its card, **Then** the footer shows "0" in the established neutral colour.
4. **Given** the score summary band and a card footer for the same Choice, **When** the user compares them, **Then** the numbers and their sign colours match.

---

### User Story 3 - Compare many Choices at a glance (Priority: P3)

A user with a crowded board (up to 6 Choices, each with many Points) collapses
the cards they are not actively editing so the board shrinks to a compact list
of name + score rows, making it easy to scan and compare totals without
scrolling through Point lists.

**Why this priority**: This is the payoff scenario that motivates the accordion,
but it emerges from US1 + US2 rather than adding new behaviour of its own.

**Independent Test**: Can be fully tested by creating 5–6 Choices with several
Points each, collapsing all of them, and confirming all names and scores are
simultaneously visible and comparable.

**Acceptance Scenarios**:

1. **Given** 6 Choices each holding several Points, **When** the user collapses all cards, **Then** every Choice's name and score is visible at once on a typical desktop viewport without scrolling the board.
2. **Given** all cards collapsed with "Rank by score" enabled, **When** scores change so the order changes, **Then** the collapsed cards reorder and their footers stay correct.

---

### Edge Cases

- A Choice with zero Points: the collapsible body shows the existing "empty" hint when expanded (above the actions row); collapsing still works and the footer shows the neutral zero score.
- Renaming: the Rename control lives in the body, so renaming requires expanding first; while the title-edit input is open, clicking the header must not toggle, and collapsing by other means (chevron) commits the in-progress value (blur-commit).
- Removing: the "✕ Remove" control lives in the body, so removal requires expanding first; the 016 confirmation flow is unchanged.
- Group mode and Sort mode: the collapsible body contains whatever the current view arrangement produces (group headings included); toggling Group/Sort while collapsed must not corrupt the body on next expand.
- 5–6 Choice wrapped layouts: cards of mixed collapsed/expanded states must not break the wrapped board layout.
- Reduced motion: users with a reduced-motion preference get an instant (non-animated) collapse/expand.
- Updating the Points of a collapsed Choice (add, edit, or remove): the Choice expands so the user can see the change; other collapsed Choices stay collapsed.
- A returning user with a saved board: all cards open collapsed, giving the name + score overview first; expanding any card reveals its saved Points intact.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Each Choice card MUST present three zones: a header containing the expand/collapse Choice name followed by the expand/collapse chevron at the far right as read-only text (placeholder "Choice N" when untitled); a collapsible body containing the arranged list of Points (including group headings and the empty-Choice hint) followed by an actions row with the "✎ Rename" and "✕ Remove" controls; and a footer containing the Choice's total score.
- **FR-002**: Users MUST be able to collapse and expand each Choice card individually; one card's state never affects another's.
- **FR-003**: When a card is collapsed, its header and footer MUST remain fully visible and functional; only the body folds away.
- **FR-004**: The footer MUST display the Choice's signed total score (keeping the +/−/0 textual prefix) coloured by sign using the same positive/negative/neutral colour conventions already established for scores, in both light and dark themes, so colour remains supplementary to the text.
- **FR-005**: The footer score MUST update immediately whenever the Choice's Points change, regardless of the card's collapsed state.
- **FR-006**: Collapsing/expanding MUST be display-only: it MUST NOT change stored decision data, computed scores, ranking, or the save-status indicator.
- **FR-007**: The "✎ Rename" control MUST be the only entry point for editing the Choice name: activating it swaps the header title text for an autofocused input (Enter/blur commits, Esc cancels and restores the prior name, focus returns to the Rename control). While the title-edit input is open, header clicks MUST NOT toggle the card.
- **FR-008**: The collapse/expand control, the Rename control, and the Remove control MUST be operable by keyboard, and the card's expanded/collapsed state MUST be conveyed to assistive technologies.
- **FR-009**: Any collapse/expand animation MUST respect the user's reduced-motion preference.
- **FR-010**: When a collapsed Choice's Points list updates (a Point is added, edited, or removed), that Choice MUST expand automatically so the change is visible; updates to one Choice never expand another.
- **FR-011** *(superseded 2026-06-12, polish session)*: The score summary band MUST NOT render — its code (component, styles, i18n, pure helpers) is retained behind a single render flag for easy reinstatement, and its behaviour remains covered by component-level tests. The card footers are the sole visible score display.
- **FR-012**: Cards MUST start **collapsed** on each visit; collapse state is presentation-only and ephemeral (not persisted across reloads).
- **FR-013**: Clicking anywhere on the header row (chevron or title text) MUST toggle the card, except while the title-edit input is open (FR-007); the chevron remains the single accessible toggle button for assistive technologies.
- **FR-014**: The "✕ Remove" control in the body keeps the shipped 016 semantics unchanged: a Choice holding ≥1 Point asks for confirmation, an empty Choice removes instantly, and the control is disabled at the 2-Choice minimum. Reaching it now requires expanding the card first.

### Key Entities

- **Choice**: existing compared candidate (name, list of Points, derived total score) — unchanged by this feature.
- **Card collapse state**: per-Choice, presentation-only expanded/collapsed flag; ephemeral (collapsed on each visit, never persisted — FR-012).
- **Title-edit state**: per-Choice, presentation-only "editing name" flag toggled by the Rename control (FR-007); ephemeral, never persisted; at most one meaningful per card at a time.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A user can collapse or expand any Choice card with a single interaction (one click/tap or one key activation).
- **SC-002**: With all cards collapsed on a board of 6 Choices holding 5+ Points each, all 6 names and scores are visible simultaneously on a typical desktop viewport without scrolling the board.
- **SC-003**: The footer score for every Choice matches the score summary's value and sign colour for that Choice in 100% of cases, in both themes.
- **SC-004**: Toggling cards collapsed/expanded any number of times leaves the saved decision data byte-identical to before.
- **SC-005**: A keyboard-only user can collapse and expand every card, and can still rename and remove Choices via the body's actions row.

## Assumptions

- "Wrappable" in the feature description is read as "collapsible/fold-away content" (accordion behaviour), not as a change to the 015 wrapped grid layout — the 5–6 Choice wrap rules stay as shipped.
- The accordion is per-card and independent: no "only one open at a time" exclusivity, and no global expand/collapse-all control in this feature.
- The footer shows the Choice's **total** score only; the for/against breakdown and leader highlight remain in the summary band (FR-011).
- Removing a Choice and confirming removal behave exactly as shipped in 016; collapse state only gates *access* to the control (the card must be expanded to reach "✕ Remove"), never the flow itself.
- A Points-list update (add, edit, remove) on a Choice is the only path that auto-expands its collapsed card (FR-010); view toggles (Group/Sort/Rank), renames, and score recalculation alone never change collapse state.
- Users may still manually expand/collapse any card at any time; the collapsed-by-default rule applies only at page load.
