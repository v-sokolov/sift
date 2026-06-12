# Feature Specification: UI Polish — Toolbar Density, Collapsed-Card Summary & Contrast

**Feature Branch**: `022-ui-polish-density-contrast`

**Created**: 2026-06-12

**Status**: Implemented (revised 2026-06-12)

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Toolbar density: label-above-control fields, inline sub-options (Priority: P1)

The toolbar views row adopts a "labelled field" anatomy — each scope label (Choices · Points · mode config) sits as a small-caps caption *above* its control. Fields wrap as whole units at ≤850 px (2-per-row) and stack full-width at ≤540 px. Sub-options (Group-by, Sort-by, Direction) slide in inline next to their parent field. Add-choice and Add-point share one "Create" container that wraps as a 50/50 band on narrow screens. Save-status is always visible (adding an "Idle" neutral dot state).

**Why this priority**: Biggest visual regression reported; affects the most-used device class.

**Independent Test**: The `.toolbar__field` pattern (scope label above control), `.seg--multi` wrapper, and `toolbar__add` Create container are all verifiable by DOM assertions. Visual 2-up layout at ≤850 px and inline sub-options are manual (jsdom has no layout engine).

**Acceptance Scenarios**:

1. **Given** a board at 760 px, **When** the user views the toolbar, **Then** view fields appear 2-per-row (50% each); Add-choice and Add-point are in a full-width 50/50 band below.
2. **Given** a board at 520 px, **When** the user views the toolbar, **Then** each field occupies a full row (one per row stacking).
3. **Given** a board at 1280 px, **When** the user views the toolbar without Group/Sort active, **Then** all view fields and the Create container sit on one coherent row.
4. **Given** Group is active, **When** the user views the toolbar at 1280 px, **Then** the "Group by: [Type][Weight]" field appears inline immediately after the Points field.
5. **Given** Sort is active, **When** the user views the toolbar at 1280 px, **Then** "By: [Weight][Type]" and "Direction: [Asc][Desc]" fields appear inline — both animate in/out with `transition:slide`.
6. **Given** the 018 S1–S3 and 020 Increment-3 toolbar regression tests, **When** the suite runs, **Then** all pass.

---

### User Story 2 — ~~Collapsed cards communicate point balance at a glance~~ *(Cancelled during implementation)*

> **Removed 2026-06-12**: The point-summary line inside the collapsed card header was implemented (tests P1–P8 written and passing), then removed after visual review — the accordion header felt cluttered with a second line of numbers. The feature was reverted cleanly; `pointSummary` and `.choice__summary` are absent from the shipped code. See Clarifications for details.

---

### User Story 3 — Empty cards show no sign-colour tint (Priority: P2)

A Choice card with zero notes displays a neutral "no points yet" state rather than a grey-tinted "Score 0" footer, so sign colour reliably signals "evidence present".

**Why this priority**: Removes false signal; low risk (CSS class carve-out only).

**Independent Test**: Given a Choice with 0 notes the footer either renders a faint "no points yet" label or is suppressed; the sign-tint classes are absent. A Choice whose notes net to 0 but are non-empty keeps the neutral tint (net-zero ≠ no-points).

**Acceptance Scenarios**:

1. **Given** a Choice with 0 notes, **When** the card renders, **Then** the `.choice__footer` carries no sign-tint class (`--positive`, `--negative`, `--neutral`) and shows a faint "no points yet" label.
2. **Given** a Choice with 1 positive and 1 negative note (net 0), **When** the card renders, **Then** the footer keeps the neutral tint (same as before).
3. **Given** 018/020 colour contracts (C1–C4, F1–F4), **When** the suite runs, **Then** the zero-points carve-out tests pass and the existing sign-tint tests are unchanged.

---

### User Story 4 — Real labels meet AA contrast (Priority: P1)

Every text element that carries semantic meaning (score labels, group-type labels, section headings) meets WCAG 2.1 AA (4.5:1) in both light and dark themes. Ghost placeholder titles may remain faint — that deviation is recorded and accepted.

**Why this priority**: Legal/accessibility compliance; affects all users.

**Independent Test**: The CSS custom-property *assignment* (`color: var(--text-muted)`) on affected class selectors is asserted by unit/component tests. Actual contrast ratios verified by manual sweep.

**Acceptance Scenarios**:

1. **Given** the "Score"/"БАЛИ" footer labels and "Advantages"/"Disadvantages" group labels, **When** rendered in light theme, **Then** they use `--text-muted` (≥ 4.5:1), not `--text-faint`.
2. **Given** the same labels in dark theme, **When** rendered, **Then** the dark-theme `--text-muted` value is confirmed ≥ 4.5:1 (measured before committing).
3. **Given** a Choice with an untitled card (ghost placeholder), **When** rendered, **Then** the ghost text retains `--text-faint` (accepted deviation, documented in Assumptions).
4. **Given** an audit of all `--text-faint` usages, **When** classified, **Then** zero non-placeholder usages of `--text-faint` remain.

---

### User Story 5 — CTA colour hierarchy: blue = build, warm = talk, red = destroy (Priority: P2)

"Add choice" and "Add a point" become the sole blue-accented (primary) CTAs. "Suggest a feature" adopts a warm variant with a lightbulb "off → on" affordance on hover/focus. Destructive confirm actions adopt a danger variant. Pressed view toggles soften to a tint. The result is three legible colour voices across both themes.

**Why this priority**: Removes misleading blue on destructive actions; elevates primary build actions; warm lightbulb is a brand-distinguishing micro-interaction.

**Independent Test**: Class assertions for `.btn--primary` (Add CTAs), `.btn--warm` (Suggest), `.btn--danger` (Remove/Clear confirms) and the tint recipe for pressed toggles can all be tested via DOM; contrast and hover animation are manual.

**Acceptance Scenarios**:

1. **Given** the Add-choice button and Add-a-point submit, **When** rendered, **Then** both carry `.btn--primary` (blue accent text + border).
2. **Given** the Suggest-a-feature button, **When** at rest, **Then** it carries `.btn--warm` with the bulb emoji/SVG in "off" state; at hover/focus-visible it enters "on" state (warm glow + lit bulb).
3. **Given** the confirm-dialog "Remove" and "Clear" actions, **When** rendered, **Then** they carry `.btn--danger` (`--disadvantage` text + border).
4. **Given** a pressed view-toggle (`aria-pressed="true"`), **When** rendered, **Then** it uses the tint recipe (not solid fill), so it reads as state rather than action.
5. **Given** light and dark themes, **When** warm text/border is rendered, **Then** contrast ≥ 4.5:1 on `--surface` (measured before committing).
6. **Given** 020 Increment-3 sole-accent regression tests, **When** updated for new colour roles, **Then** the updated tests pass.

---

### User Story 6 — Collapsed card header signals interactivity on hover (Priority: P3)

On pointer devices, hovering the collapsed Choice card header shows a subtle background change, making the full header feel tappable rather than only the chevron.

**Why this priority**: Low-effort polish; pure CSS; no test requirement.

**Independent Test**: Manual only — hover `.choice__head` at ≥720 px and verify subtle bg tint appears. No automated test needed.

**Acceptance Scenarios**:

1. **Given** a pointer device (hover capable), **When** the user hovers a collapsed card header, **Then** a subtle background tint appears on `.choice__head` inside `@media (hover:hover) and (pointer:fine)`.
2. **Given** a touch device, **When** the user taps the header, **Then** no persistent hover tint appears.

---

### Edge Cases

- A Choice with only neutral-scored notes: US2 shows "~N"; US3 sees non-empty so tint stays neutral.
- Board with 0 Choices: toolbar renders normally; no cards to collapse/expand.
- Reduced-motion preference: any transition on the lightbulb "on" state is gated by `prefers-reduced-motion`.
- Dark theme: warm bulb glow must be visible but not garish on `#242421` background.
- UA locale: count-free "+N −M" summary format requires no grammatical-number forms.

## Requirements *(mandatory)*

### Functional Requirements

**Toolbar density (US1)**
- **FR-001**: Each scope group (Choices, Points, and mode-config sub-options) MUST be wrapped in a `.toolbar__field` container — `display: flex; flex-direction: column` — with the small-caps scope label as the first child and the control(s) as the second child.
- **FR-002**: At ≤850 px the fields MUST lay out 2-per-row (`flex: 1 1 calc(50% - gap)`); at ≤540 px fields MUST stack full-width. Exception bands (851–999 px with ≥3 visible fields; 1000–1199 px with ≥4) trigger the wrapped-band layout via `:has(.toolbar__field:nth-of-type(N))`.
- **FR-003**: Group and Sort MUST be presented as a visually joined multi-select segmented control (`.seg--multi`); both toggles remain independently activatable.
- **FR-004**: Sub-options (Group-by key or Sort-by key + Direction) MUST be each wrapped in a `.toolbar__field` and animate in/out with `transition:slide={{duration:150}}` (Svelte's `slide` transition, gated by the global `prefers-reduced-motion` rule).
- **FR-005**: Add-choice and Add-point MUST share a single `.toolbar__add` "Create" container with a scope label; at ≤850 px the container is full-width with buttons splitting 50/50. The Add-point trigger (`openAddForm`) is exposed in the toolbar so users can open the form without scrolling to the cards grid.
- **FR-005b**: The save-status indicator MUST always be visible. The previously hidden ("hidden") state MUST be replaced by an "idle" variant: neutral dot (`--neutral`) + "Idle" / "Очікування" label.
- **FR-005c**: 018 S1–S3 and 020 Increment-3 regression tests MUST remain green.

**Collapsed-card summary (US2) — Cancelled**
- ~~FR-006 through FR-010~~: Removed. See Clarifications.

**Empty-card tint (US3)**
- **FR-011**: When a Choice has 0 notes, the `.choice__footer` MUST carry no sign-tint class and MUST show a faint "no points yet" / "ще немає пунктів" label.
- **FR-012**: A Choice whose notes are non-empty but net to 0 MUST retain the neutral tint (zero-points ≠ net-zero distinction).
- **FR-013**: 018/020 colour contracts C1–C4 and F1–F4 MUST receive an explicit zero-points carve-out, not deletion.

**AA contrast (US4)**
- **FR-014**: All non-placeholder text (score labels, group labels, section headings) MUST use `--text-muted` in both themes.
- **FR-015**: Ghost placeholder titles MAY remain on `--text-faint` (accepted deviation).
- **FR-016**: The dark-theme `--text-muted` value MUST be verified ≥ 4.5:1 contrast before implementation is committed.

**CTA colour roles (US5/US7)**
- **FR-017**: "Add choice" and "Add a point" submit MUST carry `.btn--primary` (blue accent).
- **FR-018**: The Suggest-a-feature button MUST carry `.btn--warm` with a lightbulb in "off" state at rest; "on" state MUST activate on `:hover` and `:focus-visible`; "on" state also fires on `:active` (touch support).
- **FR-019**: The lightbulb MUST be implemented via CSS filter on the emoji span: "off" state applies `filter: grayscale(1) opacity(.6)`; "on" state removes the filter (zero markup change; rendering is font/OS-dependent — accepted trade-off).
- **FR-020**: The warm token MUST be derived by promoting `--status-editing` to a shared `--warm` / `--warm-dark` pair (avoids near-duplicate tokens; one source of truth).
- **FR-021**: Confirm-dialog "Remove" and "Clear" actions MUST carry `.btn--danger` (`--disadvantage` text + border). Toolbar "Clear" button at rest stays neutral (danger applies only inside the confirm dialog).
- **FR-022**: `aria-pressed="true"` view toggles MUST use the tint recipe (`color-mix(in srgb, var(--accent) 12%, transparent)` bg + accent text/border) instead of solid fill.
- **FR-023**: Suggest modal "Send" button MUST also adopt the warm variant.
- **FR-024**: The 020 Increment-3 regression tests asserting Suggest-as-sole-blue-accent MUST be deliberately updated as part of this story.

**Header hover affordance (US6)**
- **FR-025**: Inside `@media (hover:hover) and (pointer:fine)`, `.choice__head` MUST show a subtle background tint on `:hover`.

### Key Entities

- **Choice**: Compared candidate with a title, array of notes, and an accordion expand/collapse state.
- **Note**: A typed scored point (positive/negative/neutral) belonging to a Choice.
- **ColourRole**: Semantic button variant (`--primary` / `--warm` / `--danger` / neutral); maps to CSS classes and design tokens.
- **ToolbarField**: Visual unit — `.toolbar__field` — a scope label above its control(s); wraps as a whole at narrow widths.
- **StatusVariant**: `"editing"` / `"saved"` / `"idle"` — the save-status dot state. `"idle"` replaces the hidden no-dot state.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-1**: At 760 px viewport the views row occupies ≤ 2 rows (fields 2-per-row + Create band below).
- **SC-2**: ~~Every collapsed non-empty card communicates its point balance~~ — **Cancelled** (US2 removed).
- **SC-3**: Zero `--text-faint` usages remain on non-placeholder text in the production stylesheet; all real labels ≥ 4.5:1 in both themes (manual sweep confirms).
- **SC-4**: Empty Choice cards (0 notes) carry no sign-tint class.
- **SC-5**: The existing test suite stays green *except* the 020 sole-accent locks, which are rewritten for new colour roles; new tests cover the US1 seg-multi wrapper (T2–T3), US3 empty-state carve-out (Z1–Z4), and US5 variant classes (R1–R5). US4 contrast changes are CSS-only selector reassignments verified by code inspection and manual M7 sweep.
- **SC-6**: Add choice & Add a point are the only blue-accented CTAs; Suggest renders the warm variant with bulb "off" at rest and "on" at hover/focus-visible, in both themes, reduced-motion-safe; warm text/border ≥ 4.5:1 on `--surface`.
- **SC-7**: Save-status dot always visible — idle (neutral), editing (amber), saved (green).

## Assumptions

- No schema change, no new persisted state, no `schemaVersion` bump is needed for any story in this feature (US2/US3 are pure derivations; US1/US4/US5/US6/US7 are CSS/markup only).
- No new runtime dependency will be introduced (native CSS + existing `.seg` pattern + optional SVG inline only).
- Ghost placeholder titles are intentionally faint by design; the contrast deviation is accepted and documented.
- The dark-theme `--text-muted` value (#6c6c66 equivalent) will be measured and confirmed ≥ 4.5:1 before US4 is committed; if it fails, a slightly darker value will be chosen.
- Warm hue will reuse/promote `--status-editing` rather than minting a near-duplicate token (one source of truth preferred).
- Toolbar "Clear" button at rest stays neutral; only the confirm-dialog destructive actions use `.btn--danger`.
- The lightbulb "on" state also fires on `:active` so touch users can perceive the feedback on tap.
- jsdom has no layout engine: stacking bands (US1), hover affordance (US6), and manual contrast sweeps (US4/US7) are M-law (manual-only) verification items; class assignment and derivation logic are unit/component-testable.
- i18n: every new string (US2 summary labels, US3 "no points yet") lands in EN + UA simultaneously.
- Must stay green: 015 grid B-laws, 016 confirm, 018 O1–O6/C1–C4, 020 A/F/E/H-laws and 4 Increment-3 toolbar regression tests (239 passing at feature completion).

## Clarifications

### Session 2026-06-12

- Q: Should the collapsed card point-summary (US2) ship? → A: **No** — removed after visual review; the accordion header felt cluttered; reverted cleanly (no tests or code remain).
- Q: What toolbar layout pattern replaces the simple 2-col grid for US1? → A: **`toolbar__field` vertical-label-above-control** — each scope group is a column-flex container with a small-caps label above the control; breakpoints 850 px / 540 px (not 800 / 541); `:has()` exception bands handle 3-field and 4-field overflow at 851–999 px and 1000–1199 px respectively.
- Q: Should Add-point be surfaced in the toolbar alongside Add-choice? → A: **Yes** — Add-choice and Add-point share a `toolbar__add` "Create" container (scope label above a 50/50 button band); the trigger calls `openAddForm(choices[0].id)` from the toolbar.
- Q: Should save-status always be visible (no hidden state)? → A: **Yes** — "hidden" replaced by "idle" variant: neutral dot + "Idle" / "Очікування" label; `statusVariant` derived state maps "hidden" → "idle" in Toolbar.svelte.
- Q: Should `toolbar.scopeActions` ("Create" / "Створення") and `toolbar.idle` ("Idle" / "Очікування") be added to i18n? → A: **Yes** — both keys shipped in `src/i18n/en.ts` and `src/i18n/uk.ts`.
