# Feature Specification: Sort Choices by Total & Colour-Code Scores

> **Status: Shipped — condensed 2026-06-09**

Merged as PR #19. Branch `018-sort-color-scores`.

**Input**: User description: "Add card sorting by their total - can be useful for more than two choices present. Highlight negative | positive | neutral (zero) scores with different colours"

## Clarifications

### Session 2026-06-07

- Q: Where should the sort-Choices-by-total control live in the UI? → A: In the toolbar,
  **left of a visual divider** that separates it from the per-point Group/Sort controls. A
  **"Choices" scope label** precedes the new control and a **"Points" scope label** precedes
  Group/Sort, so the layout reads `Choices [Rank by score] │ Points [Group][Sort]` — coarse
  (whole-board) axis first, fine (per-point) axis second. (The Add-choice button was
  subsequently moved to its own row alongside the complexity hint.)
- Q: What control style should it use? → A: A **toggle button styled like the existing
  Group/Sort toggles** (`aria-pressed`), for visual consistency across the toolbar.
  (Superseded an initial "labelled checkbox" idea at the user's request.)
- Q: What word/label should it use? → A: **"Rank by score"** — deliberately distinct from
  the existing point-level "Sort" toggle to avoid confusion.
- Q: How should the complexity hint and the score-formula caption be styled? → A: As a
  **quote-style callout** — a soft surface background, italic muted text, rounded corners
  and padding; legible in both themes. (An accent left border was tried then removed.)
- Q: How should "message left / button right" apply to those two captions? → A: The toolbar
  complexity hint sits as the **message on the left with the Add-choice button to its right**
  (swapping the current order); the **score-formula is a full-width, text-only callout** (no
  button — it has no natural action).

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Rank Choices by their total score (Priority: P1)

A person comparing several Choices turns on a "sort by total" control and the Choice cards
reorder so the highest-scoring Choice appears first and the lowest last. Especially valuable
on three-to-six-Choice boards where ranking by eye is hard. This is the headline request and
the larger behavioural change.

**Acceptance (A1)**: With totals 5, −2, 3, enabling Rank displays cards as 5, 3, −2 (highest
first). Editing a point that changes a total re-orders live. Disabling Rank restores the
original (pre-sort) order. Equal totals keep their original relative order (stable). The Rank
preference survives reload.

---

### User Story 2 - Read a score's meaning at a glance via colour (Priority: P2)

Each Choice's total score is shown in a distinct colour by sign: positive in one colour,
negative in another, zero/neutral in a third muted colour. Polish that speeds comprehension,
independent of sorting (the board is usable without it).

**Acceptance (A2)**: A total > 0 shows the positive colour, < 0 the negative colour, exactly
0 the neutral colour — legible in both themes. A score changing sign after an edit updates
its colour to match.

---

### Edge Cases

- **Ties**: Multiple Choices with identical totals keep a stable, deterministic order
  (their original relative order) so the board does not jitter on every recalculation.
- **Two or fewer Choices**: Sort-by-total still works but offers little benefit; it must
  not error or behave oddly with the minimum of two Choices.
- **Empty Choice**: A Choice with no points has a total of zero — it sorts as zero and is
  shown in the neutral colour.
- **All-equal board**: If every Choice has the same total, the order is unchanged when
  sorting is enabled.
- **Live editing while sorted**: Adding, editing, or removing points re-ranks the board;
  the reorder must be visually smooth and respect reduced-motion preferences.
- **Colour-only meaning**: The sign of the score is already visible as text (e.g. a minus
  sign / number), so colour is supplementary and never the only way to read the value.
- **Interaction with existing point views**: Colour-coding and card sorting (Rank) are
  independent of the existing per-Choice point Group/Sort views and must not change how
  points are grouped or ordered inside a card. The Rank checkbox is visually separated
  from Group/Sort (divider + "Choices"/"Points" scope labels) so the card-level and
  point-level controls are not mistaken for one another.

## Requirements *(mandatory)*

### Functional Requirements

**Sort Choices by total (US1)**

- **FR-001**: The board MUST provide a user-controlled **toggle button labelled "Rank by
  score"** (styled like the existing Group/Sort toggles, `aria-pressed`) that sorts Choice
  cards by their total score. It MUST sit in the toolbar **left of a visual divider** that
  separates it from the per-point Group/Sort controls; a **"Choices" scope label** precedes
  the Rank control and a **"Points" scope label** precedes the Group/Sort controls, so the
  two axes read as distinct (`Choices [Rank by score] │ Points [Group][Sort]`). The wording
  MUST stay distinct from the existing point-level "Sort" control.
- **FR-002**: When sorting is enabled, Choice cards MUST be ordered by total score from
  highest to lowest.
- **FR-003**: Ties (equal totals) MUST resolve to a stable, deterministic order that
  preserves the Choices' original relative order.
- **FR-004**: When sorting is enabled and any total changes (point added, edited, or
  removed), the card order MUST update to reflect the new totals.
- **FR-005**: When sorting is disabled, the board MUST restore the Choices' original
  (authoring/insertion) order.
- **FR-006**: Sorting MUST be presentation-only — it MUST NOT alter the stored identity or
  authoring order of Choices, and MUST NOT change any Choice's total or its points.
- **FR-007**: The sort-enabled preference MUST persist across page reloads using the
  existing local persistence mechanism.
- **FR-008**: Card reordering MUST animate smoothly and MUST honour the user's
  reduced-motion preference.
- **FR-009**: All new control text — the "Rank" checkbox label and the "Choices" /
  "Points" scope labels — MUST be available in both supported interface languages (EN and
  UA).

**Colour-code scores (US2)**

- **FR-010**: Each Choice's total score MUST be displayed in a colour determined by its
  sign: one colour for positive (> 0), one for negative (< 0), and one neutral colour for
  zero (= 0).
- **FR-011**: Colour-coding MUST be supplementary; the numeric value and its sign MUST
  remain readable so meaning is never conveyed by colour alone.
- **FR-012**: Score colours MUST meet **WCAG AA** contrast against both the light and dark
  theme backgrounds (including over the leader-cell background tint).
- **FR-013**: When a Choice's total changes sign, its score colour MUST update to match.
- **FR-014**: Colour-coding MUST NOT depend on the sort toggle — scores are colour-coded
  whether or not sorting is enabled.

**Caption styling (UI polish)**

- **FR-015**: The complexity hint and the score-formula caption MUST be presented as a
  quote-style callout — a soft surface background, italic muted text, rounded corners and
  padding — remaining legible (WCAG AA) in both light and dark themes.
- **FR-016**: In the toolbar, the complexity hint MUST appear as the message on the left with
  the Add-choice button to its right. The score-formula caption MUST remain a full-width
  caption with no associated button.
- **FR-017**: Each score cell MUST also be tinted by sign — a soft sign-coloured background
  plus a sign-coloured top border (positive / negative / neutral), mirroring the leader-cell
  treatment. The leader cell MUST retain its distinct, stronger highlight and take precedence
  over the positive tint. All tints MUST stay legible (WCAG AA) in both themes.

### Key Entities *(include if feature involves data)*

- **Choice**: A candidate being compared. Relevant attribute: its total score (a signed
  number derived from its points). Gains an effective *display position* when sorting is
  active, without changing its stored authoring order.
- **Sort preference**: A single persisted on/off flag indicating whether the board sorts
  Choices by total.
- **Score**: The signed total of a Choice. Its sign (positive / negative / zero) drives
  both the sort ranking and the colour applied to it.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: With three or more Choices of differing totals, enabling sort places the
  highest-total Choice first and the lowest last in 100% of cases.
- **SC-002**: A user can identify the top-ranked Choice on a six-Choice board in under 3
  seconds with sorting enabled.
- **SC-003**: Disabling sort restores the exact original Choice order in 100% of cases.
- **SC-004**: 100% of score values are shown in the colour matching their sign (positive,
  negative, or zero) across both themes.
- **SC-005**: A first-time user can correctly state whether a Choice is net-positive,
  negative, or neutral from its colour and value with at least 90% accuracy.
- **SC-006**: The sort preference is retained across reloads in 100% of sessions.
- **SC-007**: Changing a point so a total changes sign updates both the card's rank (when
  sorting) and its score colour within the same interaction, with no manual refresh.

## Assumptions

- **Sort direction is descending** (highest total first), because the goal is to surface
  the strongest Choice for a decision; ascending order was not requested.
- **Sort is an opt-in checkbox, unchecked by default**, preserving today's authoring-order
  board for users who do not want reordering.
- **Sorting is non-destructive / display-only**, consistent with how the existing
  per-Choice point views (Group/Sort) are derived presentations rather than stored order.
- **Zero is treated as neutral** (the boundary case), with strictly positive and strictly
  negative on either side.
- **The three colours are a red-family for negative, a green-family for positive, and a
  muted/grey tone for neutral**, theme-aware in both light and dark modes; exact palette
  values are an implementation/design decision.
- **No new persisted data beyond a single sort on/off flag** is introduced; scores and
  points are unchanged.
- **The minimum of two and maximum of six Choices established by prior features remain
  unchanged**; this feature only affects display order and score colour.
- **Card sorting and score colour are independent** of the existing in-card point
  Group/Sort views and do not modify them.
