# Phase 0 Research: Mobile & Responsive UI Hardening

All decisions are CSS-first and add no dependency. Each resolves how a matrix dimension
(M1–M12) and its FR(s) are met on the existing 004 stack. Format: Decision / Rationale /
Alternatives considered.

## R1 — Device safe-areas (M6 → FR-004, FR-005)

**Decision**: Add `viewport-fit=cover` to the `index.html` viewport meta, then pad the root
`#app` and the `.footer` using `max(<existing pad>, env(safe-area-inset-*))` so insets are
honored on notched devices and ignored (0) elsewhere. Apply left/right insets too (matters in
landscape when the notch moves to a side edge) and `env(safe-area-inset-bottom)` to the footer.

**Rationale**: `env(safe-area-inset-*)` is the standard, JS-free mechanism and only resolves to
non-zero on devices that actually have insets; `viewport-fit=cover` is its required opt-in.
Wrapping in `max()` preserves the current comfortable padding on non-notched screens while
guaranteeing the footer/links clear the home indicator. The footer is a flexbox sticky-footer
(`margin-top:auto`), **not** `position:fixed`, so padding is sufficient — no overlap logic.

**Alternatives considered**: JS reading `env()` via `getComputedStyle` (unnecessary, adds
script); `constant()` legacy syntax (obsolete); ignoring side insets (fails M6 in landscape).

## R2 — Dynamic viewport / collapsing chrome (M7 → FR-007)

**Decision**: Replace `#app { min-height: 100vh }` with `min-height: 100dvh`, keeping
`100vh` as a preceding fallback declaration for browsers without `dvh`.

**Rationale**: `100vh` on mobile equals the *largest* viewport (chrome collapsed), so with the
address bar visible the bottom is cut off / the footer is pushed under chrome. `dvh` tracks the
*dynamic* viewport as chrome expands/collapses, keeping the sticky-footer correct with no gap or
clip. CSS-only, no resize listener.

**Alternatives considered**: `svh`/`lvh` (static small/large — `dvh` is the right "follows
chrome" choice here); a JS `--vh` custom property updated on `resize` (the classic hack —
heavier, and `dvh` makes it obsolete).

## R3 — On-screen keyboard, focused field visibility (M8 → FR-008, FR-009)

**Decision**: Rely on the browser's native "scroll focused input into view" behavior, and add
`scroll-margin` (and/or `scroll-padding` on the scroll container) to the editable fields and the
inline add/edit form so the field isn't flush against the keyboard or a screen edge when
scrolled into view. No fixed/sticky element overlaps inputs (the form and footer are in normal
flow), so nothing covers the field. Optionally call `element.scrollIntoView({block:'nearest'})`
on form-open as a progressive enhancement **only if** emulation shows the native behavior
insufficient — preferred to keep it CSS-only.

**Rationale**: Because the add/edit form is rendered inline (not a fixed overlay) and the footer
is a flow sticky-footer, the keyboard cannot be "covered" by a floating element — the remaining
risk is only that the focused field sits too low; `scroll-margin` solves that declaratively.
Keeps the feature presentation-only and avoids the flicker/complexity of VisualViewport JS.

**Alternatives considered**: VisualViewport API + JS repositioning (powerful but overkill and
risks focus/caret disruption — would also conflict with FR-017); making the form a bottom sheet
(explicitly rejected in Clarifications).

## R4 — Touch targets & spacing (M4 → FR-001)

**Decision**: Establish a 44×44 CSS-px minimum on all interactive controls — `.btn`,
`.seg button`, `.langbtn`, `.iconbtn` (choice remove ✕), `select`, and the `.note` row — via
`min-block-size`/`min-inline-size` (or min-height + adequate padding), and ensure adjacent
controls have ≥8px effective separation through existing gaps. The `.note` row is already a
full-width tap target; just enforce a comfortable min height.

**Rationale**: 44px is the spec's adopted floor (Apple HIG 44pt; WCAG 2.5.5). Several current
controls (icon ✕, segmented buttons, language toggle) are visually small and likely below it;
explicit min-size guarantees SC-001. Spacing prevents mis-fire (M4 acceptance).

**Alternatives considered**: 48px Material floor (stricter; would also satisfy 44 — recorded as
a future option in the spec, not adopted now); enlarging only via padding (insufficient when
content is tiny — min-size is the guarantee).

## R5 — No-hover input model (M9 → FR-002, FR-003)

**Decision**: Gate all *emphasis* hover rules (`.iconbtn:hover`, `.note:hover`, `.linklike:hover`,
`.iconbtn`/`.modal__close` hovers) behind `@media (hover: hover) and (pointer: fine)`, and
guarantee every one also has a `:focus-visible` (and where relevant `:active`) equivalent so the
affordance is reachable by keyboard and visible on touch. Audit confirms **no current affordance
is hover-only** (hovers only change color/background; the choice ✕ and note row are always
present), so M9 is satisfied defensively — the gate just prevents "stuck hover" states on touch
and documents the contract.

**Rationale**: `@media (hover: hover)` is the standard way to keep hover purely additive on
pointer devices while touch users get the always-visible/focus state. The deferred "remove
point" feature (007) is the one place a hover-only control was proposed — the Clarifications
already bind it to an always-present ✕, so M9 stays intact.

**Alternatives considered**: `any-hover`/`any-pointer` (matches hybrid devices but can keep hover
styling on touch-primary hybrids — `hover: hover` is the safer primary-capability test); leaving
hovers ungated (risks sticky-hover artifacts on tap).

## R6 — Toolbar adaptation (M1/M4/M5 → FR-019, Clarifications)

**Decision**: Ensure `.toolbar__row` uses `display:flex; flex-wrap:wrap` with a `row-gap` so
controls wrap onto additional rows at narrow widths with everything visible; verify the
`.toolbar__spacer` (a `flex:1` spacer) degrades gracefully when wrapped (drop or zero it on
narrow via the wrap so it doesn't strand the Add button). No overflow menu, no horizontal
scroll.

**Rationale**: Matches the clarified decision; wrapping is the calmest, lowest-complexity option
and keeps all controls discoverable (reinforces M9). Pure CSS.

**Alternatives considered**: overflow "more" menu and horizontal scroll strip — both rejected in
Clarifications.

## R7 — Add/edit form on mobile (M8 → FR-018, Clarifications)

**Decision**: Keep the existing **inline** form (already rendered in flow in `App.svelte`); make
it full-width at narrow widths (stack `.form__row` contents, full-width `select`/`textarea`/
segmented groups) and give the form container a `scroll-margin` so opening it brings it clear of
the keyboard. No modal/sheet.

**Rationale**: The form is already inline — the clarified choice — so this is sizing/stacking
only, the smallest change that satisfies M8 without a new interaction pattern.

**Alternatives considered**: bottom sheet / centered modal — rejected in Clarifications.

## R8 — Reading comfort, content integrity (M3/M2 → FR-010, FR-011)

**Decision**: Keep font sizes in relative units (`rem`/existing tokens) so platform text-scaling
and browser zoom apply; allow text to wrap and add `overflow-wrap: anywhere` (and `hyphens:auto`
where appropriate) to long fields — dilemma title, choice name, `.note__text` — so a long
unbroken token can't force horizontal scroll at the narrowest width. Verify the choices grid
and summary don't set fixed widths that clip when text grows.

**Rationale**: Relative units honor M3; `overflow-wrap` is the standard guard for the long-token
edge case (M2). 004 already stacks choices to one column at narrow widths, so this hardens rather
than rebuilds.

**Alternatives considered**: `text-overflow: ellipsis` truncation everywhere (loses content;
wrapping is calmer and preserves the note text); fixed px fonts (would defeat text-scaling).

## R9 — Orientation & short landscape (M10 → FR-014)

**Decision**: Avoid fixed/large `vh`-based heights that break in short landscape; the
`min-height:100dvh` sticky-footer column and fluid grid already adapt. Verify no element assumes
portrait aspect; confirm no horizontal scroll in landscape including when the side-notch inset
applies (covered by R1 side insets).

**Rationale**: The layout is already fluid; orientation robustness falls out of dvh + safe-area
side insets + wrapping. Mostly a verification task.

**Alternatives considered**: orientation-specific media queries (unnecessary; fluid layout
covers both).

## R10 — Theming & motion on-device (M11/M12 → FR-012, FR-015) + verification method

**Decision**: No code change for M11/M12 — 004 already implements per-theme tokens with WCAG AA
(verified by computation in 004/005) and `prefers-reduced-motion`-aware transitions; this feature
only **re-verifies** them on-device. Overall verification: responsive emulation (device profiles
with cut-outs, landscape, throttled CPU), computed contrast, and manual on-device spot checks per
quickstart.md; jsdom guards limited to the viewport-meta assertion. Touch-target sizes verified by
inspecting computed box sizes in emulation/dev-tools.

**Rationale**: Re-using proven 004 work respects YAGNI and the no-regression contract; the
honest verification split (emulation/computation/on-device, not jsdom) is consistent with the
spec Assumptions and Constitution IV note in the plan.

**Alternatives considered**: adding a browser-based test runner (Playwright/WebdriverIO) to
assert responsive/touch behavior — rejected: a new heavyweight dev dependency for a small
presentation feature violates Principle III's minimalism; emulation + on-device checks suffice.
