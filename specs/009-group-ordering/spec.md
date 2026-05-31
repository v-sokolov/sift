# Feature Specification: Group Ordering — Confirm & Document

**Feature Branch**: `009-group-ordering`

**Created**: 2026-05-31

**Status**: Draft

**Input**: User description: "Group feature should work in the next way: type option selected => Advantages (from heavier to ligher 3 > 2 > 1) > Disadvantages (from heavier to ligher 3 > 2 > 1) > Neutral, while weight option selected is from heavier to ligher 3 > 2 > 1 > 0"

## Clarifications

### Session 2026-05-31

- Q: The section-level ordering described is already shipped (008). What specifically should change?
  → A: **Confirm & document.** The behaviour is correct as-is; pin the exact ordering down in the
  spec and in automated tests so it cannot silently regress. This is a documentation +
  regression-protection feature with **minimal/no production code change** expected.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Grouped points always appear in a predictable, weight-aware order (Priority: P1)

A person comparing choices turns on **Group** and expects each choice's points to fall into a
stable, intuitive order every time — never reshuffling between renders, and always reading
"most important first". The two grouping dimensions must each have one unambiguous, documented
ordering:

- **By Type** — points are split into **Advantages**, then **Disadvantages**, then **Neutral**.
  Inside the Advantages section points run from heaviest to lightest weight (3 → 2 → 1); inside the
  Disadvantages section likewise (3 → 2 → 1); the Neutral section keeps the order points were
  added.
- **By Weight** — points are split into one section per weight value, heaviest first
  (3 → 2 → 1), followed by a final weightless/neutral section (the "0" bucket); within each weight
  section points keep the order they were added.

**Why this priority**: This is the entire feature. The ordering is the user-visible contract for
Group mode, and the goal is to lock it down so future changes cannot regress it without a failing
test.

**Independent Test**: With a single fixed set of points spanning both types and all weights, turn
Group on and confirm the rendered section order and within-section order match the rules above for
both **By Type** and **By Weight**; reload and re-render and confirm nothing reshuffles.

**Acceptance Scenarios**:

1. **Given** Group is on with **By Type** selected and a choice with advantages and disadvantages
   of mixed weights plus at least one neutral point, **When** it renders, **Then** the sections
   appear in the order **Advantages → Disadvantages → Neutral**.
2. **Given** the same choice under **By Type**, **When** it renders, **Then** within the Advantages
   section points are ordered heaviest weight first (3 before 2 before 1), and within the
   Disadvantages section points are ordered heaviest weight first (3 before 2 before 1).
3. **Given** the same choice under **By Type**, **When** it renders, **Then** the Neutral section
   lists its points in the order they were added (creation order).
4. **Given** Group is on with **By Weight** selected and a choice with points of weights 3, 2,
   and 1 plus at least one neutral (weightless) point, **When** it renders, **Then** the sections
   appear in the order **3 → 2 → 1 → weightless (0)**.
5. **Given** the same choice under **By Weight**, **When** an advantage and a disadvantage share a
   weight, **Then** they appear together in that weight's section, each in the order it was added.
6. **Given** any choice under either dimension, **When** a weight value has no points (e.g. no
   weight-2 points), **Then** no empty section is shown for that value.
7. **Given** any grouped view, **When** the same choice is re-rendered or the app is reloaded,
   **Then** points with equal ordering keys keep their previous relative order (no reshuffle).

---

### Edge Cases

- **All-neutral choice**: Under **By Type** only the Neutral section appears; under **By Weight**
  only the weightless (0) section appears — no numbered weight sections.
- **No neutral points**: Under **By Type** the Neutral section is absent; under **By Weight** the
  weightless (0) section is absent.
- **Ties within a section**: Two points with the same weight (By Type weighted sections) keep the
  order they were added — ordering is deterministic, never random.
- **Switching dimension**: Toggling Type ↔ Weight re-sections the same points with no point lost,
  duplicated, or modified.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Under the **Type** grouping dimension, the system MUST render sections in the fixed
  order **Advantages → Disadvantages → Neutral**.
- **FR-002**: Under the **Type** dimension, the **Advantages** section MUST order its points from
  heaviest to lightest weight (3 → 2 → 1), and the **Disadvantages** section MUST do the same
  (3 → 2 → 1).
- **FR-003**: Under the **Type** dimension, the **Neutral** section MUST keep points in the order
  they were added (creation order).
- **FR-004**: Under the **Weight** grouping dimension, the system MUST render one section per
  present weight value in descending order **3 → 2 → 1**, followed by a single trailing
  weightless/neutral section (the "0" bucket).
- **FR-005**: Under the **Weight** dimension, each weight section MUST contain every point of that
  weight regardless of type (advantages and disadvantages of the same weight share the section),
  in the order the points were added.
- **FR-006**: Under both dimensions, a section that would contain no points MUST NOT be rendered.
- **FR-007**: Ordering MUST be deterministic and stable: points with equal ordering keys MUST keep
  their existing relative (creation) order across re-renders and reloads, so equal items never
  reshuffle.
- **FR-008**: Every point in a choice MUST appear in exactly one section under either dimension —
  none dropped, none duplicated.
- **FR-009**: This ordering contract MUST be covered by automated tests that fail if any of the
  above orderings change, providing regression protection.
- **FR-010**: This feature MUST NOT change the point data model (fields, types, weights), the
  scoring formula, the available grouping dimensions, the toolbar controls, or saved-state format;
  it documents and protects the existing behaviour only.

### Key Entities *(include if feature involves data)*

- **Grouped section**: a labelled, ordered bucket of points produced for display in Group mode.
  Under the Type dimension the buckets are Advantages, Disadvantages, Neutral; under the Weight
  dimension they are weight values 3, 2, 1 plus one weightless (0) bucket. Each section has a fixed
  position relative to the others and a defined within-section order.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: For any set of points, **By Type** renders sections in exactly the order Advantages →
  Disadvantages → Neutral, 100% of the time.
- **SC-002**: For any set of points, **By Type** orders Advantages and Disadvantages heaviest
  weight first (3 → 2 → 1), and Neutral in creation order, 100% of the time.
- **SC-003**: For any set of points, **By Weight** renders sections 3 → 2 → 1 → weightless(0),
  omitting any weight with no points, 100% of the time.
- **SC-004**: Re-rendering or reloading the same choice never changes the relative order of points
  that share an ordering key (0 observed reshuffles).
- **SC-005**: Automated tests assert every ordering rule above and fail if any rule is violated;
  the test suite passes against the current behaviour with no production code change required.

## Assumptions

- The behaviour described already matches the shipped 008 implementation (`arrange()` in the view
  layer); this feature's purpose is to confirm and lock it in, not to alter it.
- The "0" in the user's "3 > 2 > 1 > 0" refers to the weightless/neutral bucket (neutral points
  carry no weight and contribute 0 to the score), shown as the final section in Weight mode.
- Within-section order for the Weight dimension is creation order with types mixed (an advantage
  and a disadvantage of the same weight sit together) — the existing behaviour; this feature does
  not introduce a type sub-ordering inside weight sections.
- No within-section direction control exists in Group mode; direction (Asc/Desc) remains a Sort-mode
  concern only, unchanged by this feature.
- No new dependencies, no scoring change, no data-model change, and no saved-state/version change
  are introduced.
