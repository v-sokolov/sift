# Feature Specification: Phase-2 UI Rebuild

**Feature Branch**: `004-phase2-ui-rebuild`

**Created**: 2026-05-30

**Status**: Draft

**Input**: User description: "docs/research/2026-05-30-phase2-ui-stack-research.md — phase-2 UI upgrade: improve look, feel, polish, and maintainability without changing any functional requirement; full dark/light theming, full keyboard accessibility, fluid responsive layout, tasteful calm motion, proper project metadata + MIT license."

## User Scenarios & Testing *(mandatory)*

This feature is a **presentation and maintainability rebuild** of the existing Sift
comparison tool. It deliberately changes **no product behavior**: the same dilemma, the
same up-to-four choices, the same notes, the same Group/Sort/Arrange controls, the same
score, the same Clear, the same private local persistence. What changes is how the surface
looks, how accessible and responsive it is, how calmly it moves, and how well the project is
described and licensed.

### User Story 1 - The same tool, with nothing lost (Priority: P1)

A returning user opens the rebuilt app and finds everything works exactly as before: they
create a dilemma, add and name choices, jot notes, group and sort, watch the score update,
and clear the board — with their previously saved board loading intact. Nothing they relied
on is missing or behaves differently.

**Why this priority**: Feature parity is the whole promise of a rebuild and the single
biggest risk. If the rebuilt UI drops or changes any behavior, no amount of polish matters.
A user must never pay for "nicer" with "broken." This slice alone — a faithful rebuild — is
already a viable, shippable product.

**Independent Test**: Run the complete set of existing product scenarios against the rebuilt
UI and confirm identical outcomes; confirm a board saved by the current app loads and behaves
unchanged after the rebuild; confirm that typing in any field never loses focus or caret.

**Acceptance Scenarios**:

1. **Given** the rebuilt app, **When** a user creates a dilemma, adds up to four named
   choices, adds notes, groups and sorts, and reads the score, **Then** every result matches
   the current app's behavior exactly.
2. **Given** a board previously saved by the current app, **When** the rebuilt app loads,
   **Then** the saved dilemma, choices, notes, and arrangement are restored unchanged.
3. **Given** any editable field (dilemma title, a choice name, a note), **When** the user
   types continuously, **Then** focus and caret position are never lost and the score/derived
   values update live without interrupting typing.
4. **Given** the user clicks Clear, **When** they confirm, **Then** the board resets exactly
   as in the current app.

---

### User Story 2 - A theme that fits the room (Priority: P2)

A user who prefers a dark interface (or whose device is in dark mode) opens Sift and sees a
dark theme automatically; another user in a bright room flips a control to light. Either way
the choice is remembered next time, and both themes are comfortable and legible.

**Why this priority**: Theming is the most visible quality upgrade and the most requested
comfort feature. It directly serves the calm, low-strain ethos and benefits every session.

**Independent Test**: With OS set to dark, a first visit shows dark; with OS light, shows
light; the manual toggle switches and persists across reload; both themes pass contrast
checks.

**Acceptance Scenarios**:

1. **Given** a first-time visitor whose OS prefers dark, **When** they open Sift, **Then**
   the dark theme is applied by default.
2. **Given** any visitor, **When** they use the theme toggle, **Then** the interface switches
   between light and dark and the choice persists across reloads.
3. **Given** either theme is active, **When** content is displayed, **Then** text and
   interactive elements meet accessibility contrast requirements.

---

### User Story 3 - Operable entirely by keyboard (Priority: P3)

A keyboard-only user (by preference or assistive need) completes a full comparison —
create, add choices, edit notes, open and dismiss the Arrange/Clear controls, change
Type/Weight/Sort — without ever reaching for a mouse, always able to see where focus is.

**Why this priority**: Accessibility is a first-class principle for Sift, and full keyboard
operability is the backbone of it. It is independently verifiable and broadly beneficial.

**Independent Test**: Perform every interaction using only Tab/Shift-Tab, arrow keys, Enter,
and Esc; confirm logical order, an always-visible focus indicator, Esc-to-dismiss on
transient surfaces, and arrow navigation within grouped/segmented controls.

**Acceptance Scenarios**:

1. **Given** keyboard-only input, **When** the user tabs through the page, **Then** focus
   moves in a logical order and the focused element is always visibly indicated.
2. **Given** the add/edit form, a dialog, or a popover is open, **When** the user presses
   Esc, **Then** it closes and focus returns sensibly.
3. **Given** a segmented control (e.g. Type/Weight/Sort) or a selector is focused, **When**
   the user presses arrow keys, **Then** the selection moves between options, and Enter
   confirms/submits where applicable.

---

### User Story 4 - Comfortable from phone to wide desktop (Priority: P4)

A user on a narrow phone, a tablet, and a wide monitor each gets a layout that fits their
screen: choice cards sit side by side when there is room and stack vertically when there
isn't, resizing smoothly rather than snapping between fixed breakpoints, with no horizontal
scrolling or overlap.

**Why this priority**: Sift is a quick on-the-spot decision aid often used on a phone; a
fluid layout makes it usable everywhere. Valuable but builds on the parity + theme core.

**Independent Test**: Resize the viewport continuously from a narrow phone width to a wide
desktop width and confirm the layout reflows fluidly, choice cards transition from columns
to a stack gracefully, and there is no horizontal scroll or element overlap at any width.

**Acceptance Scenarios**:

1. **Given** a wide viewport, **When** the board is shown, **Then** choice cards are arranged
   side by side using the available width.
2. **Given** a narrow viewport, **When** the board is shown, **Then** choice cards stack
   vertically and all controls remain reachable with no horizontal scroll.
3. **Given** the viewport is resized between those extremes, **When** width changes, **Then**
   the layout adjusts smoothly without abrupt jumps or clipped content.

---

### User Story 5 - Calm motion that never shouts (Priority: P5)

As a user groups or sorts notes, the cards glide to their new positions; forms and dialogs
fade gently in and out. The motion is subtle and reassuring — it never flashes, bounces for
attention, or pulls focus away from the decision — and it disappears entirely for users who
ask for reduced motion.

**Why this priority**: Tasteful micro-interactions are the polish layer. They elevate feel
but are the least essential and must be strictly bounded by Sift's calm ethos.

**Independent Test**: Trigger group/sort reordering and open/close transient surfaces and
confirm motion is gentle and brief; enable the OS "reduce motion" setting and confirm
non-essential animation no longer plays.

**Acceptance Scenarios**:

1. **Given** notes are displayed, **When** the user changes Group or Sort, **Then** cards
   animate smoothly to their new positions rather than snapping.
2. **Given** the add/edit form, a dialog, or a popover, **When** it opens or closes, **Then**
   it transitions with a brief, gentle motion.
3. **Given** the user has "reduce motion" enabled, **When** any of the above occurs, **Then**
   non-essential animation is suppressed and changes apply instantly.

---

### User Story 6 - A properly described, openly licensed project (Priority: P6)

A developer who finds the repository sees complete project metadata (name, description,
author, repository and homepage links, keywords) and a clear open-source license, so they
understand what Sift is, who made it, and the terms under which they may use it.

**Why this priority**: Metadata and licensing are quick, valuable hygiene that round out the
phase-2 work, but deliver no end-user runtime behavior, so they come last.

**Independent Test**: Inspect the project manifest for complete, accurate metadata fields and
an MIT license declaration, and confirm an MIT license file exists at the repository root
naming the author as copyright holder.

**Acceptance Scenarios**:

1. **Given** the repository, **When** a reader inspects project metadata, **Then** name,
   description, version, author, repository URL, homepage, keywords, and an MIT license
   declaration are all present and accurate.
2. **Given** the repository root, **When** a reader looks for license terms, **Then** an MIT
   license file is present and names the author as the copyright holder.

---

### Edge Cases

- **No stored theme + no OS signal**: the app picks a sensible, accessible default (light)
  rather than failing or flashing.
- **Theme flash on load**: the chosen theme is applied before first paint so the user does
  not see a wrong-theme flash.
- **Reduced motion mid-session**: if the user toggles the OS reduced-motion setting, the app
  respects the new value without requiring a manual restart.
- **Very long dilemma titles / choice names / notes**: text wraps or truncates gracefully in
  both layouts without breaking the grid or causing overflow.
- **Smallest supported width**: at the narrowest target width, all controls remain reachable
  and legible with no horizontal scroll.
- **Migrating an existing saved board**: a board saved by the current app must not be lost or
  corrupted by the rebuilt app.

## Requirements *(mandatory)*

### Functional Requirements

**Feature parity (no functional regression)**

- **FR-001**: The rebuilt UI MUST preserve every existing product capability — create a
  dilemma; add, name, edit, and remove choices up to the existing maximum; add and edit
  notes; Group / Sort / Arrange controls; live score; Clear with confirmation — with
  behavior and outcomes identical to the current app.
- **FR-002**: While a user types in any editable field, the app MUST NOT lose input focus or
  caret position when derived values (e.g. the score) or other regions update.
- **FR-003**: The rebuilt app MUST continue to read and honor boards saved by the current app
  in existing local storage, with no loss or corruption of saved data.
- **FR-004**: The app MUST remain fully client-side and private — no backend, no network
  calls, no telemetry — as in the current app.

**Theming**

- **FR-005**: The app MUST default to the user's operating-system color-scheme preference
  (light or dark) on first visit.
- **FR-006**: Users MUST be able to switch between light and dark themes via a visible
  control.
- **FR-007**: The app MUST persist the user's theme choice and reapply it on subsequent
  visits.
- **FR-008**: Both light and dark themes MUST meet accessibility contrast requirements
  (WCAG AA) for text and interactive elements.
- **FR-009**: The selected theme MUST be applied before first paint so no wrong-theme flash
  is visible.

**Keyboard accessibility**

- **FR-010**: All interactive elements MUST be reachable and operable using only the keyboard,
  in a logical tab order.
- **FR-011**: Every focusable element MUST show a clearly visible focus indicator.
- **FR-012**: Pressing Esc MUST dismiss the open add/edit form, dialog, or popover and return
  focus sensibly.
- **FR-013**: Grouped/segmented controls and selectors MUST support arrow-key navigation
  between options, and Enter MUST submit/confirm where applicable.

**Responsive layout**

- **FR-014**: The layout MUST adapt fluidly across mobile, tablet, and desktop widths, with
  choice cards reflowing from a side-by-side arrangement to a vertical stack as width
  decreases, without abrupt breakpoint "snapping."
- **FR-015**: At every supported width there MUST be no horizontal scrolling and no element
  overlap or clipping.

**Motion**

- **FR-016**: State changes — add/edit form reveal, dialog/popover open and close, and
  Group/Sort reordering of notes — MUST use subtle, brief motion rather than instant snaps.
- **FR-017**: The app MUST honor the user's reduced-motion preference by suppressing
  non-essential animation.
- **FR-018**: Motion MUST stay within Sift's calm ethos — no flashy, attention-grabbing, or
  focus-pulling effects.

**Project metadata & licensing**

- **FR-019**: Project metadata MUST be complete and accurate: name, description, version,
  author (name + contact/URL), repository URL, homepage, keywords, and an MIT license
  declaration.
- **FR-020**: An MIT license file MUST exist at the repository root, naming the author as the
  copyright holder.

### Key Entities *(include if feature involves data)*

- **Theme preference**: the user's chosen interface theme. Possible values: follow-system,
  light, or dark. Persisted locally and reapplied on load. This is the only new persisted
  datum introduced by this feature; all other data is unchanged from the current app.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of existing product scenarios produce identical outcomes in the rebuilt
  UI (zero functional regressions).
- **SC-002**: Across all editable fields, continuous typing results in zero focus/caret-loss
  incidents.
- **SC-003**: A board saved by the current app loads intact in the rebuilt app in 100% of
  cases (no data loss or corruption).
- **SC-004**: 100% of interactive controls are fully operable using only the keyboard.
- **SC-005**: Both themes meet WCAG AA contrast (normal text contrast ratio ≥ 4.5:1).
- **SC-006**: A first-time visitor's theme matches their OS color-scheme preference, and a
  saved theme choice is reapplied on 100% of subsequent visits.
- **SC-007**: The layout is usable with no horizontal scroll or element overlap across the
  full supported width range (from a 320px phone width to a ≥1440px desktop width).
- **SC-008**: With reduced-motion enabled, no non-essential animation plays.
- **SC-009**: Project metadata is complete (all required fields present) and an MIT license
  file exists at the repository root.

## Assumptions

- **Product requirements are unchanged.** This feature alters presentation, accessibility,
  responsiveness, motion, and project hygiene only. All functional requirements from the MVP
  (`001-sift-mvp`) and post-MVP improvements (`002-post-mvp-improvements`) carry over verbatim;
  the domain term for a compared candidate remains **Choice**.
- **The implementation stack is decided during planning, not here.** The source research doc
  records a decision to rebuild on a UI framework + headless component library + utility-CSS
  with component testing. That is an implementation choice and is intentionally **not** baked
  into this (technology-agnostic) spec. It MUST be reconciled against the project Constitution
  at `/speckit-plan`: Principle III currently mandates "no framework, no runtime deps," and
  the current `CLAUDE.md` stack statement says the same. Adopting a framework therefore
  requires either an explicit Constitution amendment (via `/speckit-constitution`) or a
  documented, justified deviation recorded in the Constitution Check. This tension is a known
  open item for the planning phase, not a spec-level clarification.
- **Component selection is a planning/research deliverable**, expressed as a shortlist mapping
  each UI need to candidate components with tradeoffs; the final per-widget pick is deferred to
  implementation.
- **Accessibility target is WCAG AA** (a reasonable default for a public consumer web app),
  not AAA, unless changed later.
- **Supported width range** spans roughly 320px (small phone) to wide desktop; specific
  device targets are evergreen mobile and desktop browsers.
- **Hosting and deployment are unaffected.** The GitHub Pages static-hosting model from
  `003-github-pages-hosting` continues to apply; this rebuild changes only what is built, not
  how it is published, and it adds no backend or network dependency (Constitution II
  preserved).
- **Local persistence is reused.** Existing saved boards remain in their current local-storage
  location; the theme preference is added alongside without disturbing existing data.
