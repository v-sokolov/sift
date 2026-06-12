# Contracts: UI Polish — Toolbar Density, Collapsed-Card Summary & Contrast

Law prefix guide: **T** = toolbar density, **P** = point summary, **Z** = zero-points empty state,
**K** = kontrast (contrast class assignment), **R** = colour roles, **B** = boundary (regression),
**M** = manual verification only.

---

## T — Toolbar density (US1)

**T1**: At viewport width 760 px the `.toolbar__views` container contains no direct flex-line
with a lone toggle button (i.e., each flex-row in the 541–800px band has ≥ 2 buttons).
*(Manual M-law — jsdom has no layout engine.)*

**T2**: The Group and Sort buttons are direct children of a `[class*="seg--multi"]` element;
both retain `data-action="toggle-group"` and `data-action="toggle-sort"` attributes respectively.
*(Component-testable.)*

**T3**: The Group and Sort buttons inside `.seg--multi` each carry an independent `aria-pressed`
attribute; pressing one MUST NOT affect the `aria-pressed` state of the other.
*(Component-testable.)*

**T4**: 018 S1–S3 tests (toolbar structure) and 020 Increment-3 regression tests that do NOT
reference button colour class remain green.
*(Suite gate.)*

---

## P — Point summary (US2)

**P1**: `pointSummary([])` returns `null`.

**P2**: `pointSummary(notes)` where all notes are `type:'advantage'` returns `"+N"` (no minus segment).

**P3**: `pointSummary(notes)` where notes include both advantage and disadvantage, but no neutral,
returns `"+A −D"` (no `~` segment).

**P4**: `pointSummary(notes)` where notes include all three types returns `"+A −D · ~N"` with
`U+00B7 MIDDLE DOT` and a space on each side of the dot.

**P5**: `pointSummary(notes)` where all notes are neutral returns `"~N"`.

**P6**: In a rendered collapsed Choice with ≥ 1 note, the DOM contains an element with class
`choice__summary` whose text content matches the `pointSummary` result for that choice's notes.

**P7**: In a rendered collapsed Choice with 0 notes, no element with class `choice__summary`
exists in the header.

**P8**: In a rendered EXPANDED Choice (regardless of note count), no element with class
`choice__summary` exists in the header.

---

## Z — Zero-points empty state (US3)

**Z1**: When a Choice has 0 notes, the rendered `.choice__foot` carries class `choice__foot--empty`
and MUST NOT carry any of `choice__foot--positive`, `choice__foot--negative`, `choice__foot--neutral`.

**Z2**: When a Choice has 0 notes, the footer element contains the `choice.noPoints` i18n string
for both EN and UA locales.

**Z3**: When a Choice has ≥ 1 note (regardless of net score), the rendered `.choice__foot` does NOT
carry `choice__foot--empty`.

**Z4**: A Choice with equal counts of advantage and disadvantage notes (net 0) renders with
`choice__foot--neutral` (not `--empty`).

---

## K — Contrast class assignment (US4)

**K1**: The `.choice__scorelabel` element uses CSS custom property `--text-muted` for its colour
(not `--text-faint`). *(Asserted via computed style or class inspection in component test.)*

**K2**: The `.group-label` element uses `--text-muted`. *(Component test.)*

**K3**: The `.actbtn` elements (Rename, Remove) use `--text-muted` as their resting colour.
*(Component test.)*

**K4**: The `.choice__name--ghost` element retains `--text-faint` (accepted deviation — placeholder
text, not a real label). *(Asserted to NOT change.)*

**K5**: Manual sweep confirms zero `--text-faint` usages on non-placeholder elements in the
production stylesheet (light and dark themes). *(M-law.)*

---

## R — Colour roles (US5/US7)

**R1**: The Add-choice button (`data-action="add-choice"`) has class `btn--primary`.

**R2**: The Add-a-point submit button (`data-action="suggest-send"` is the send; the Add point
submit is `data-action="add-note"` or equivalent) has class `btn--primary`.
*(Verify exact `data-action` in AddEditForm.svelte during implementation.)*

**R3**: The Suggest-a-feature trigger button in the header has class `btn--warm` and MUST NOT
have class `btn--primary`.

**R4**: The Suggest modal Send button (`data-action="suggest-send"`) has class `btn--warm` and
MUST NOT have class `btn--primary`.

**R5**: The confirm-dialog confirm button (`data-action="confirm-dialog-confirm"`) has class
`btn--danger` and MUST NOT have class `btn--primary`.

**R6**: A view-toggle button with `aria-pressed="true"` has `background` set via the tint recipe
(NOT a solid fill — the resolved computed background-color is NOT `--accent` solid).
*(M-law — computed style checks are impractical in jsdom. Verified by visual manual review.)*

**R7**: The 020 Increment-3 regression tests previously asserting Suggest as the sole
`.btn--primary` element have been updated to assert the new role split; the updated tests pass.

**R8**: Manual sweep confirms warm text/border ≥ 4.5:1 on `--surface` in both themes. *(M-law.)*

---

## B — Boundary (regression protection)

**B1**: 015 grid B-laws (choice grid layout) remain green.

**B2**: 016 confirm D1–D4 (dialog button semantics) remain green. *(Note: D2/D4 that assert
`btn--primary` on the confirm button are updated in parallel with R5 as part of this feature.)*

**B3**: 018 C1–C4 (sign colour classes on non-empty footers) remain green.

**B4**: 020 F1–F4 (score footer sign classes on non-empty cards) remain green.

**B5**: No new runtime dependency appears in `package.json`.

**B6**: `yarn build` succeeds on a clean install after all changes.

---

## M — Manual verification

**M1**: At 760 px viewport width the views row has ≤ 2 rows of buttons.

**M2**: At 520 px viewport width each toggle occupies its own row (full-width stack preserved).

**M3**: The lightbulb emoji appears dimmed/greyscale at rest and full-colour on hover/focus in
both light and dark themes.

**M4**: The warm glow (`box-shadow`) is visible but not garish on the dark `#242421` surface.

**M5**: View-toggle `aria-pressed="true"` state appears as a tint (not solid blue fill) in both
themes.

**M6**: `.choice__head` shows a subtle background tint on pointer-hover in a hover-capable device.

**M7**: All real labels (score labels, group labels, action button text) are visibly legible
(manual confirmation of ≥ 4.5:1 contrast).

**M8**: Reduced-motion: lightbulb filter transition is instant; toggle tint transition is instant.

**M9**: At 760 px viewport, scope labels ("Choices" / "Points") remain visually bound to their associated controls — they MUST NOT orphan on their own row, separated from the buttons they label. (FR-004.)
