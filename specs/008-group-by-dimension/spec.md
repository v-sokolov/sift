# Feature Specification: Group by Dimension & Add-Point Placement

**Feature Branch**: `008-group-by-dimension`

**Created**: 2026-05-31

**Status**: Draft

**Input**: User description: "group works wrong. it should display type/weight, not asc/desc" — plus: "move 'add point' above the 'score'"

## Clarifications

### Session 2026-05-31

- Q: In Group mode, what should the type/weight control do? → A: Pick the **grouping dimension** — Group mode groups notes **by type** (Advantages / Disadvantages / Neutral — today's behaviour) **or by weight** (one section per weight value). The toolbar shows a type/weight segment in place of the asc/desc segment. This adds a new view preference and changes how grouping is computed.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Choose how points are grouped (Priority: P1)

A person comparing choices turns on **Group** to organise each choice's points into sections.
Today, Group always splits points by *kind* (Advantages / Disadvantages / Neutral) and the only
control offered is an **Asc / Desc** direction toggle — which does not match what Group is for and
confuses the user. Instead, Group should offer a **Type / Weight** choice that decides the
*dimension* points are grouped by:

- **By Type** — sections for Advantages, Disadvantages, and Neutral (the existing grouping).
- **By Weight** — one section per weight value (weight 3, weight 2, weight 1), with neutral
  (weightless) points collected in their own section.

**Why this priority**: This is the reported defect. The Group control currently shows an option
(direction) that doesn't belong to grouping, and withholds the option that does (the grouping
dimension). Fixing it makes Group behave as users expect and unlocks a genuinely useful second
grouping view (by weight) with no added complexity for the user.

**Independent Test**: Add points of mixed types and weights to a choice, turn on Group, and
confirm the toolbar offers a Type/Weight segment (not Asc/Desc). Switching to **By Type** shows
Advantages/Disadvantages/Neutral sections; switching to **By Weight** shows weight-3/2/1 sections
with neutral points in their own section. Sort mode is unaffected.

**Acceptance Scenarios**:

1. **Given** Group is off, **When** the user turns Group on, **Then** the configuration row shows
   a **Type / Weight** segment and does **not** show an Asc / Desc segment.
2. **Given** Group is on with **By Type** selected, **When** a choice has advantages, disadvantages,
   and neutral points, **Then** the choice renders Advantages, Disadvantages, and Neutral sections
   (matching the prior grouped behaviour).
3. **Given** Group is on, **When** the user selects **By Weight**, **Then** points are grouped into
   sections by their weight value (3, then 2, then 1), each section labelled by its weight, with
   neutral/weightless points shown in a distinct final section.
4. **Given** **By Weight** is selected, **When** an advantage and a disadvantage share the same
   weight, **Then** they appear together in that weight's section (grouping is by weight, not type).
5. **Given** a grouping dimension is selected, **When** the user reloads the app, **Then** the same
   grouping dimension is still in effect.
6. **Given** Group is on, **When** the user turns Group off and turns **Sort** on, **Then** Sort
   still offers both its Type / Weight (sort key) and Asc / Desc (direction) controls unchanged.

---

### User Story 2 - Add a point without scrolling past the score (Priority: P2)

When weighing a choice, the person frequently adds points. Today the **Add point** control sits
*below* the running **score** summary, so the primary repeated action is visually subordinate to a
read-only result. Move **Add point** **above** the score so the main action is encountered first
and the score reads as the consequence of the points entered above it.

**Why this priority**: A small layout correction that improves the everyday add-a-point flow. It is
independent of US1 and carries no data or logic change.

**Independent Test**: Open the app and confirm the **Add point** control appears above the score
summary in the page order; adding a point still works and the score still updates.

**Acceptance Scenarios**:

1. **Given** the main screen, **When** it renders, **Then** the **Add point** control appears
   above the score summary.
2. **Given** the Add-point control is in its new position, **When** the user adds a point, **Then**
   the point is added and the score below updates exactly as before.

---

### Edge Cases

- **By Weight with empty weights**: a weight value with no points produces no section (empty
  sections are not rendered, consistent with today's grouped behaviour).
- **All-neutral choice under By Weight**: all points fall into the single neutral/weightless
  section; no numbered weight sections appear.
- **Order within a section**: points within a section retain a stable, predictable order (Type
  dimension: heaviest-first in weighted sections, creation order for Neutral; Weight dimension:
  creation order), so re-rendering never reshuffles equal items.
- **Switching dimensions**: toggling Type ↔ Weight re-sections the same points instantly; no point
  is lost, duplicated, or altered.
- **Persistence of an unknown/missing grouping dimension**: a saved state from before this feature
  (no stored grouping dimension) loads with the default **By Type**, preserving prior behaviour.
- **Add-point move**: when the add/edit form is open, it continues to appear in the Add-point
  control's position (now above the score), not below it.

## Requirements *(mandatory)*

### Functional Requirements

**US1 — Group by dimension**

- **FR-001**: Group mode MUST group each choice's points by a user-selectable **grouping
  dimension** with exactly two options: **Type** and **Weight**.
- **FR-002**: When the grouping dimension is **Type**, the system MUST render Advantages,
  Disadvantages, and Neutral sections, matching the grouped behaviour that existed before this
  feature.
- **FR-003**: When the grouping dimension is **Weight**, the system MUST render one section per
  weight value present (weight 3, 2, 1), ordered from highest to lowest weight, and MUST collect
  weightless (neutral) points into a single distinct section shown after the weighted sections.
- **FR-004**: When grouping by **Weight**, points MUST be grouped by weight regardless of type
  (e.g. an advantage and a disadvantage of the same weight share a section).
- **FR-005**: While Group mode is active, the configuration row MUST present the **Type / Weight**
  grouping-dimension control and MUST NOT present the Asc / Desc direction control.
- **FR-006**: The grouping-dimension control MUST clearly indicate which dimension is currently
  active.
- **FR-007**: Points within a section MUST appear in a stable, predictable order so equal items
  never reshuffle on re-render: within the **Type** dimension's weighted sections (Advantages,
  Disadvantages) points are ordered heaviest weight first (the prior grouped default), and the
  Neutral section keeps creation order; within the **Weight** dimension every section keeps
  creation order.
- **FR-008**: Empty sections (a dimension bucket with no points) MUST NOT be rendered.
- **FR-009**: The selected grouping dimension MUST persist across reloads, alongside the other view
  preferences.
- **FR-010**: A previously saved state that has no stored grouping dimension MUST load successfully
  and default to grouping **By Type** (no data loss, prior behaviour preserved).
- **FR-011**: Each rendered section MUST carry a human-readable label: type names for the Type
  dimension, and a weight indication for each weight section plus a distinct label for the
  neutral/weightless section, in both supported languages (EN and UK).
- **FR-012**: **Sort** mode MUST remain unchanged — it MUST continue to offer both its sort-key
  (Type / Weight) and direction (Asc / Desc) controls and produce the same ordering as before.

**US2 — Add-point placement**

- **FR-013**: The **Add point** control MUST be positioned above the score summary in the page
  order.
- **FR-014**: Moving the Add-point control MUST NOT change how adding, editing, or scoring points
  behaves.

**Cross-cutting invariants**

- **FR-015**: This feature MUST NOT change the point data model (point fields, types, weights) or
  the scoring formula.
- **FR-016**: Aside from adding the grouping-dimension preference (and any section labels needed
  for the Weight dimension), no existing saved-state field's meaning may change; existing saves
  MUST continue to load.
- **FR-017**: The feature MUST preserve the project's existing accessibility posture for the
  affected controls (the grouping-dimension control is keyboard-operable, focus-visible, labelled,
  and meets the established touch-target size), consistent with the segmented controls already in
  the toolbar.

### Key Entities *(include if feature involves data)*

- **View preference — grouping dimension**: a single stored preference indicating whether Group
  mode groups by **Type** or by **Weight**. Default **Type**. Lives with the other view
  preferences (mode, sort key, direction, theme, language) and is persisted with them.
- **Section**: a labelled bucket of points produced for display. Under Type grouping the buckets
  are the point kinds; under Weight grouping the buckets are weight values plus one weightless
  bucket.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: With Group on, 100% of the time the user sees a Type/Weight control and never an
  Asc/Desc control.
- **SC-002**: Selecting **By Type** reproduces the exact section structure that existed before this
  feature for any given set of points.
- **SC-003**: Selecting **By Weight** places every point in exactly one section determined solely
  by its weight (weightless points in the neutral section), with sections ordered highest weight
  first.
- **SC-004**: The chosen grouping dimension survives a reload in 100% of cases; pre-existing saves
  load without error and default to By Type.
- **SC-005**: Switching the grouping dimension re-sections the visible points in under 1 second
  with no point lost, duplicated, or modified.
- **SC-006**: Sort mode produces byte-for-byte the same ordering before and after this feature for
  identical inputs.
- **SC-007**: The Add-point control is rendered above the score summary, and adding a point still
  updates the score exactly as before.

## Assumptions

- The two grouping dimensions are **Type** and **Weight** only — no further dimensions are in
  scope.
- Under **By Weight**, sections are ordered from highest weight (3) to lowest (1), with the
  neutral/weightless section last; this mirrors the "most important first" reading users expect.
- Within-section order is fixed (no within-section direction control in Group mode — direction
  belongs to Sort mode): the **Type** dimension keeps the prior grouped default (weighted sections
  heaviest-first, Neutral in creation order); the **Weight** dimension uses creation order in every
  section. Equal items always tie-break on creation order so re-renders are stable.
- The Asc / Desc direction preference still exists for **Sort** mode; it is simply not surfaced
  while Group mode is active.
- "Move Add point above the score" refers to the page order of the Add-point control (and the
  add/edit form it expands into) relative to the score summary block; no change to either
  component's internal behaviour is intended.
- Adding the grouping-dimension preference is an additive, backward-compatible change to the saved
  view preferences; no migration/version bump of the saved format is required (a missing value
  defaults to By Type, exactly as the language field is defaulted today).
