# Feature Specification: Mobile & Responsive UI Hardening

**Feature Branch**: `006-mobile-responsive-ui`

**Created**: 2026-05-30

**Status**: Draft

**Input**: User description: "specs/004-phase2-ui-rebuild/mobile-responsive-matrix.md — promote the abstract mobile & responsive requirements matrix (M1–M12) into a testable specification: touch ergonomics, no-hover input, device safe-areas, dynamic viewport, on-screen keyboard, reading comfort, reachability, orientation, on-device theming, and calm on-device motion."

## User Scenarios & Testing *(mandatory)*

This feature is a **mobile and responsive hardening pass** over the existing Sift comparison
tool as rebuilt in `004-phase2-ui-rebuild`. It deliberately changes **no product behavior**:
the same dilemma, the same up-to-four choices, the same notes, the same Group/Sort/Arrange
controls, the same score, the same Clear, the same private local persistence, the same two
themes and the same copy. What changes is how reliably the surface behaves **on real
handheld devices and across the full size spectrum** — that finger-sized controls never
require hover, that nothing is occluded by a notch or home indicator, that a focused field
stays visible above the on-screen keyboard, that the layout survives a collapsing address bar
and works in both orientations, and that text scaling and on-device theming stay legible.

It promotes the device-and-tool-agnostic requirements matrix
([`004/mobile-responsive-matrix.md`](../004-phase2-ui-rebuild/mobile-responsive-matrix.md),
dimensions **M1–M12**) into concrete, verifiable requirements. Dimensions already satisfied by
`004` (M1 layout adaptivity, M2 content integrity, M11 theming, M12 motion) are **cross-
referenced, not re-implemented**; this spec hardens them on-device and adds the dimensions a
width-range alone misses (M3, M4, M5, M6, M7, M8, M9, M10).

### User Story 1 - Operable by touch, never by hover (Priority: P1)

A person opens Sift on a phone and runs a full comparison with their thumb: they add and name
choices, tap to add and edit notes, change Type/Weight, group and sort, and clear the board —
every control is big enough to hit reliably, neighbouring controls don't mis-trigger, and
nothing they need is hidden behind a hover state that a finger can't produce.

**Why this priority**: Sift is a quick, on-the-spot decision aid most often reached for on a
phone. If controls are too small, too crowded, or hover-gated, the tool is simply unusable on
its primary device — this is the single biggest mobile risk (matrix **M4**, **M9**, both P1).

**Independent Test**: On a touch device (or touch emulation), complete every interaction using
only taps — add/edit/remove choices and notes, all segmented controls, Arrange/Clear — and
confirm each target is comfortably tappable, adjacent controls never mis-fire, and no action
or information is reachable only via hover.

**Acceptance Scenarios**:

1. **Given** the app on a touch device, **When** the user taps any interactive control
   (button, segmented option, selector, remove control, note), **Then** the control activates
   reliably without requiring a precise tap, and adjacent controls are not accidentally
   triggered.
2. **Given** any affordance that appears on hover at desktop (e.g. a note's edit/remove
   control), **When** the user is on a touch device, **Then** that same affordance is reachable
   by tap or focus and is never hover-only.
3. **Given** the add/edit note form on a phone, **When** the user operates Type, Weight, Save,
   and Cancel by tapping, **Then** every control is finger-sized and spaced so the intended one
   is hit.

---

### User Story 2 - Fits inside the device's physical frame (Priority: P1)

A user on a modern phone with a notch, rounded corners, and a home indicator opens Sift and
finds that no content, control, or the sticky footer is clipped, hidden behind the hardware
cut-outs, or stranded under the home-indicator bar — and as they resize from phone to wide
desktop the board reflows fluidly with no horizontal scroll or overlap at any width.

**Why this priority**: A layout that ignores the safe-area insets puts the footer links or
edge controls under the notch/home indicator on exactly the common devices the tool targets
(matrix **M6** P1, plus **M1** fluid reflow, P1, cross-referenced from `004`). Breakage here is
visible and blocking on first open.

**Independent Test**: On a device profile with display cut-outs and a home indicator (or
emulation with simulated safe-area insets), confirm nothing critical is occluded and the
sticky footer clears the bottom inset; then resize continuously from the narrowest supported
width to a wide desktop and confirm fluid reflow with no horizontal scroll, overlap, or
clipping at any width.

**Acceptance Scenarios**:

1. **Given** a device with a notch and rounded corners, **When** the app is shown in either
   orientation, **Then** no text or control is occluded by the cut-outs and content respects
   the left/right/top safe-area insets.
2. **Given** a device with a home-indicator bar, **When** the sticky footer is shown, **Then**
   the footer and its links clear the bottom safe-area inset and remain fully tappable.
3. **Given** the viewport is resized from the narrowest supported width to a wide desktop,
   **When** width changes, **Then** the layout reflows fluidly (columns → stack) with no
   horizontal scroll and no element overlap or clipping at any width.

---

### User Story 3 - Survives a moving viewport and the on-screen keyboard (Priority: P2)

A user typing a dilemma title or a note on a phone sees the field they're editing stay
visible above the on-screen keyboard rather than being covered by it or by the sticky footer;
and as the browser's address bar collapses and expands while they scroll, full-height regions
and the footer never clip or hide controls.

**Why this priority**: The on-screen keyboard and a collapsing browser chrome are mobile-only
realities that desktop testing never surfaces (matrix **M8**, **M7**, both P2). A field hidden
behind the keyboard, or a footer that jumps and covers content as chrome moves, degrades every
text-entry interaction on a phone.

**Independent Test**: On a phone (or emulation), focus each editable field and confirm it
scrolls into view and is not covered by the keyboard or any fixed element; scroll to toggle
the address bar's collapse/expand and confirm full-height regions and the sticky footer never
clip or obscure controls.

**Acceptance Scenarios**:

1. **Given** a phone with the on-screen keyboard open, **When** the user focuses the dilemma
   title, a choice name, a note field, or the suggest-a-feature form, **Then** the focused
   field scrolls into view and is not covered by the keyboard or the sticky footer.
2. **Given** a browser whose chrome (address bar) collapses or expands on scroll, **When** the
   chrome height changes, **Then** any full-height region and the sticky footer adjust without
   clipping controls or leaving a gap.
3. **Given** the keyboard is dismissed, **When** layout settles, **Then** the view returns to a
   stable state with no residual offset or stranded scroll position.

---

### User Story 4 - Readable, content-safe, and theme-legible on a real screen (Priority: P2)

A user who enlarges their device's text size, or who has long choice names and notes, finds
everything still readable and intact — text wraps or truncates gracefully without breaking the
grid or overflowing — and both light and dark themes match their device preference and stay
legible in real lighting.

**Why this priority**: Reading comfort under user text-scaling (matrix **M3**, P2) is an
accessibility baseline distinct from raw width; content integrity (**M2**, cross-ref `004`) and
on-device theming (**M11**, cross-ref `004`) round out "legible on the device in hand." Valuable
but builds on the touch/frame core.

**Independent Test**: Enlarge the platform text size to its maximum and confirm no clipping or
overlap; enter very long dilemma titles, choice names, and notes and confirm graceful wrap or
truncation with no grid break or horizontal overflow at the narrowest width; confirm the
default theme matches the OS scheme and contrast holds on-device in both themes.

**Acceptance Scenarios**:

1. **Given** the device text size is increased to the platform maximum, **When** the app is
   shown, **Then** text remains legible with no clipping or overlap of content or controls.
2. **Given** very long dilemma titles, choice names, and notes, **When** displayed at the
   narrowest supported width, **Then** they wrap or truncate gracefully and the grid neither
   breaks nor overflows horizontally.
3. **Given** the device color-scheme preference, **When** the app first loads, **Then** the
   matching theme is applied and text and indicators meet contrast requirements on-device in
   both themes.

---

### User Story 5 - Comfortable in any posture, calm on any device (Priority: P3)

A user holding a large phone can reach the primary actions comfortably; the app stays fully
usable rotated into landscape, including short landscape heights; and the calm reorder/reveal
motion stays smooth on mid-range hardware and disappears entirely when reduced motion is
requested.

**Why this priority**: Reachability (matrix **M5**), orientation robustness (**M10**), and
on-device motion calm (**M12**, cross-ref `004`) are polish and judgment (all P3) — they refine
comfort once the tool already works on the device.

**Independent Test**: On a large-phone profile confirm primary actions aren't stranded only in
hard-to-reach corners; rotate to landscape (including a short landscape height) and confirm no
loss of function or content; on a mid-range device profile confirm reorder/reveal motion is
smooth, and with reduced-motion enabled confirm non-essential motion is suppressed.

**Acceptance Scenarios**:

1. **Given** a large phone, **When** the user performs the primary actions (add choice, add
   note, score-relevant controls), **Then** those actions are reachable without requiring a
   second hand or an awkward stretch to a far corner.
2. **Given** the device is rotated to landscape, including a short landscape height, **When**
   the app is shown, **Then** no function or content is lost and there is no horizontal scroll.
3. **Given** a mid-range device and reduced-motion **not** requested, **When** notes reorder or
   a surface reveals, **Then** motion is smooth and free of jank; **and** with reduced-motion
   requested, non-essential motion is suppressed.

---

### Edge Cases

- **Notch in landscape**: with the device rotated, the cut-out moves to a side edge — content
  must respect the left/right safe-area inset, not only the top.
- **Keyboard open + short viewport**: when the keyboard occupies most of the height, the
  focused field must still be brought into the remaining visible area.
- **Address bar mid-collapse during typing**: chrome height changing while a field is focused
  must not strand the caret off-screen or cover it.
- **Very long unbroken token** (e.g. a long URL pasted into a note): must wrap or truncate
  rather than force horizontal scroll at the narrowest width.
- **Maximum text scaling at the narrowest width simultaneously**: the most hostile combination
  must still avoid overlap and horizontal scroll.
- **Hover-capable touch device** (e.g. tablet + trackpad, or a stylus with hover): hover
  affordances may enhance but MUST NOT be the only way to reach any action.
- **Reduced motion toggled mid-session**: honored without a reload, consistent with `004`.

## Clarifications

### Session 2026-05-30

- Q: On a narrow phone, how should the add/edit note form present? → A: Full-width inline
  expansion of the existing form (no bottom sheet, no modal), scrolled into view above the
  on-screen keyboard.
- Q: On a narrow phone, how should the toolbar adapt when it no longer fits one row? → A: Wrap
  to multiple rows with every control staying visible — no overflow/"more" menu and no
  horizontal scroll strip.
- Q: How should the sticky footer behave on mobile? → A: Stay sticky on all viewports, padded
  above the bottom safe-area inset.
- Q: Should a "remove point" feature (surfacing the dormant `removeNote` store logic) be added
  here? → A: No — it is **new behavior** and is deferred to a separate feature (`007`); `006`
  stays presentation-only (FR-016 unchanged).
- Q: When that remove-point affordance is later built, how must it be revealed so it does not
  violate the no-hover rule (M9)? → A: As an **always-present, low-emphasis `✕`** on each point,
  reachable by tap and keyboard as a sibling control of the click-to-edit row; hover/focus may
  only raise its emphasis, never be the sole means of access.

### Session 2026-05-31 (layout refinements during implementation)

- Q: Toolbar order? → A: **Add choice** sits after Clear/status and before Group/Sort (all
  viewports). On widths < 720px, Add choice, Group, Sort, and the Sort-by / Direction
  segmented controls each take a **full-width row**; the language toggle keeps its natural
  width. (Refines FR-019.)
- Q: The "＋ add point" trigger? → A: **centered** horizontally, and **full-width** at
  widths < 720px (matching Add choice/Group/Sort).
- Q: NoteRow layout? → A: two boxes with `space-between` — note **text** on the left, a
  **dots + sign** cluster on the right (dots then sign; dots only when a weight exists).
  Presentation only; `aria-label` and click-to-edit behavior unchanged.
- Q: Editability cue for the Choice name field? → A: a small, always-visible **pencil glyph**
  (`✎`, decorative/`aria-hidden`) before the borderless input, brightening on focus
  (M9-safe — not hover-gated). The **dilemma title** input gets the same cue.
- Q: "＋ add point" trigger width? → A: also **full-width** at widths < 720px.
- Q: Header on small screens? → A: "Suggest a feature" and the dilemma title each take a
  **full-width row** (flex-wrap), with **Suggest shown above** the title (order swapped).
- Q: While the "Suggest a feature" modal is open? → A: **lock background scroll**
  (`<html>` overflow hidden) and restore it on close.
- Q: Footer text? → A: dropped the "Sift — a quiet way to weigh a decision." lead; the
  footer now reads just "Made by {name}." / «Створив {name}.» plus the links (display value
  only; `footer.madeBy` key/token unchanged).
- Note: `form.addNote` display value was capitalized to "＋ Add point" / «＋ Додати пункт»
  for consistency with "＋ Add choice" / «＋ Додати варіант» (display value only; key and
  code identifiers unchanged — same class as the 005 relabel).

## Requirements *(mandatory)*

### Functional Requirements

**Touch ergonomics & input model (M4, M9 — US1)**

- **FR-001**: Every interactive control MUST present a touch target that meets the platform
  touch-target floor and MUST be spaced from adjacent controls so that an ordinary tap does not
  mis-trigger a neighbour.
- **FR-002**: All functionality and all information MUST be reachable by tap or keyboard focus;
  nothing may be available **only** on hover or only via a precise pointer.
- **FR-003**: Any affordance that is revealed on hover at pointer-capable widths MUST also be
  persistently reachable (visible or focus-revealed) on touch devices.

**Device envelope & fluid layout (M6, M1 — US2)**

- **FR-004**: Content and fixed elements MUST respect the device safe-area insets (notch,
  rounded corners, home indicator) in both orientations, so nothing critical is occluded.
- **FR-005**: The sticky footer MUST clear the bottom safe-area inset and remain fully visible
  and tappable above the home-indicator region.
- **FR-006**: The layout MUST reflow fluidly across the full supported width range — multi-
  column where space allows, a single stack when narrow — with no horizontal scroll and no
  overlap or clipping at any width (hardens `004` FR-014/FR-015 on-device).

**Dynamic viewport & on-screen keyboard (M7, M8 — US3)**

- **FR-007**: Full-height regions and the sticky footer MUST remain correct as browser chrome
  (e.g. the address bar) collapses or expands, never clipping controls or leaving a gap.
- **FR-008**: When an editable field is focused and the on-screen keyboard opens, the focused
  field MUST scroll into the visible area and MUST NOT be covered by the keyboard or by any
  fixed element.
- **FR-009**: After the keyboard is dismissed, the layout MUST return to a stable state with no
  residual offset or stranded scroll position.

**Reading comfort, content integrity & on-device theming (M3, M2, M11 — US4)**

- **FR-010**: Text MUST be legible without zooming at the default size and MUST honor the user's
  platform text-scaling up to the platform maximum without clipping or overlap.
- **FR-011**: Long dilemma titles, choice names, and notes — including long unbroken tokens —
  MUST wrap or truncate gracefully in every layout, never breaking the grid or causing
  horizontal overflow at the narrowest width (hardens `004` M2 on-device).
- **FR-012**: The default theme MUST match the device color-scheme preference and both themes
  MUST hold WCAG AA contrast as rendered on-device (hardens `004` FR-005/FR-008 on-device).

**Reachability, orientation & on-device motion (M5, M10, M12 — US5)**

- **FR-013**: Primary actions MUST NOT be stranded only in hard-to-reach corners on large
  phones; they MUST remain within comfortable thumb reach.
- **FR-014**: The app MUST remain fully usable in both portrait and landscape, including short
  landscape heights, with no loss of function or content and no horizontal scroll.
- **FR-015**: Reorder and reveal motion MUST stay smooth on mid-range hardware and MUST be
  suppressed when the user requests reduced motion (consistent with `004` FR-016/FR-017).

**Component adaptation on mobile (clarified 2026-05-30 — US1/US2/US3)**

- **FR-018**: On narrow widths the add/edit note form MUST present as a full-width inline
  expansion of the existing form — not a bottom sheet, modal, or other new overlay pattern —
  and MUST scroll into view above the on-screen keyboard (supports FR-008, M8).
- **FR-019**: When the toolbar no longer fits a single row, it MUST wrap onto additional rows
  with every control remaining visible; it MUST NOT hide controls behind an overflow/"more"
  menu and MUST NOT become a horizontally scrolling strip (supports M1/M4/M5/M9).
- **FR-020**: The footer MUST remain sticky at all viewport widths and MUST be padded clear of
  the bottom safe-area inset (refines FR-005; no per-viewport switch to a static footer).

**Invariants (carried over — no regression)**

- **FR-016**: This feature MUST NOT change any product behavior, data shape, persisted keys,
  copy, or the EN/UA catalogs; it is presentation/markup/style only and adds no runtime
  dependency, network call, or telemetry (Constitution II/III preserved).
- **FR-017**: Typing in any editable field MUST NOT lose focus or caret position as a result of
  any layout, viewport, or scroll-into-view behavior introduced here (preserves `004` FR-002).

### Key Entities *(include if feature involves data)*

No new data entities. This feature introduces no persisted datum and no change to the existing
state shape; the theme preference and board data from prior features are reused unchanged.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of interactive controls present a touch target of at least 44×44 CSS pixels
  (the platform touch-target floor) with adequate spacing; zero controls fall below it.
- **SC-002**: 100% of actions and information are reachable by tap or keyboard focus; zero
  affordances are hover-only.
- **SC-003**: On devices with display cut-outs and a home indicator, zero critical elements are
  occluded and the sticky footer clears the bottom safe-area inset in both orientations.
- **SC-004**: Across the full supported width range (≈320px phone to ≥1440px desktop) there is
  zero horizontal scroll and zero element overlap or clipping.
- **SC-005**: With the on-screen keyboard open, the focused field is visible (not covered by
  the keyboard or any fixed element) in 100% of editable fields.
- **SC-006**: As browser chrome collapses/expands, full-height regions and the sticky footer
  never clip controls and leave no gap — verified across the chrome's full range.
- **SC-007**: At the platform maximum text-scaling, there is zero clipping or overlap of content
  or controls at the narrowest supported width.
- **SC-008**: Both themes meet WCAG AA contrast (normal-text ratio ≥ 4.5:1) as rendered
  on-device, and a first-time visitor's theme matches the OS scheme.
- **SC-009**: The app is fully usable in portrait and landscape (including a short landscape
  height ≈ 375px tall) with no loss of function and no horizontal scroll.
- **SC-010**: With reduced-motion enabled, zero non-essential animations play; with it
  disabled, reorder/reveal motion completes smoothly on a mid-range device profile.
- **SC-011**: Continuous typing in every editable field produces zero focus/caret-loss
  incidents, including while a field is scrolled into view above the keyboard.

## Assumptions

- **Built on the `004` Svelte 5 + Tailwind v4 stack.** This is a CSS/markup hardening pass on
  the rebuilt UI; all product requirements from `001`/`002`/`004` carry over verbatim and the
  domain term for a compared candidate remains **Choice**.
- **Presentation-only, no new dependencies.** Achieved with standard responsive techniques
  (fluid layout, safe-area-inset environment values, dynamic-viewport length units, hover/any-
  pointer media queries, scroll-into-view on focus); no new runtime dependency, backend,
  network call, or telemetry is added (Constitution II/III preserved).
- **Touch-target floor = 44×44 CSS px**, the common platform minimum (Apple HIG 44pt; WCAG 2.5.5
  AAA 44px; Material 48dp is stricter and also satisfies it). Chosen as a reasonable default; if
  a stricter 48px floor is later preferred it supersedes this without changing the FRs.
- **Supported width range ≈ 320px to ≥1440px**, reused from `004` SC-007; specific device and
  viewport targets and exact numeric thresholds live in a derived device matrix, not in this
  spec, per the matrix's abstraction rule.
- **No-hover is the contract, hover is an enhancement.** Hover affordances may add polish on
  pointer-capable devices but are never the sole path to any action (M9).
- **Verification is by responsive emulation and computation where a physical device lab is
  unavailable**, consistent with prior features' offline/jsdom approach; on-device spot checks
  are a manual acceptance step.
- **Accessibility target is WCAG AA**, carried over from `004`.
- **"Remove point" is out of scope** for this feature. It is a new behavior (surfacing the
  existing-but-unwired `removeNote` store function) and is deferred to a separate feature
  (`007`). If/when built, its affordance MUST obey M9 (always-present, tap/keyboard-reachable;
  never hover-only) per the Clarifications above.
