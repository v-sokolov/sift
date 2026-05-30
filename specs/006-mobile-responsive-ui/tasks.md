# Tasks: Mobile & Responsive UI Hardening

**Feature**: `006-mobile-responsive-ui` | **Branch**: `006-mobile-responsive-ui`
**Spec**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md)

**Inputs**: plan.md (no new deps; CSS-first on the 004 Svelte stack), spec.md (US1 P1, US2 P1,
US3 P2, US4 P2, US5 P3 + Clarifications), research.md (R1–R10), contracts/ (responsive,
components), data-model.md (no data changes), quickstart.md (on-device acceptance matrix).

**Tests**: Constitution Principle IV — no behavior/domain change here, so the obligation is
**(a)** keep the entire existing `tests/unit/*` + `tests/components/*` suite green (the
no-regression contract, FR-016/FR-017) and **(b)** add the one jsdom-observable guard
(viewport-meta). Pixel/touch/safe-area/keyboard/orientation/contrast behaviors are **not**
jsdom-testable and are verified by emulation + computation + on-device per quickstart.md.

**Conventions**: presentation-only; **no** new dependency; **no** edits to `store.svelte.ts`,
`theme.ts`, `types.ts`, pure-core `*.ts`, or `i18n/*`; **no** scoped `<style>` blocks (all CSS in
`src/styles/app.css`, per 004); touch floor 44×44 CSS px; WCAG AA both themes; nothing hover-only
(M9). "Remove point" is **out of scope** (deferred to feature 007).

> **File-contention reality**: nearly every implementation task edits the single file
> `src/styles/app.css`, so those tasks are **sequential** (no `[P]` between them) even though they
> serve different stories. `[P]` is reserved for genuinely different files (index.html, the test
> file, component files).

---

## Phase 1: Setup

**Purpose**: Confirm a green baseline before any change.

- [X] T001 Confirm baseline is green on branch `006-mobile-responsive-ui`: run `node_modules/.bin/svelte-check` and `node_modules/.bin/vitest run` from repo root and verify both pass before editing (per quickstart.md; `yarn test` has a known wrapper quirk in this sandbox).

---

## Phase 2: Foundational (blocking prerequisite for US2)

**Purpose**: Enable `env(safe-area-inset-*)`, which US2's device-envelope work depends on. Done
test-first for the one assertable guard.

- [X] T002 Add a failing jsdom guard test in `tests/unit/viewport.test.ts` (new file): read `index.html` from disk and assert the `<meta name="viewport">` `content` includes `viewport-fit=cover`. (Red — the attribute is not present yet.)
- [X] T003 In `index.html`, change the viewport meta to `content="width=device-width, initial-scale=1.0, viewport-fit=cover"`. Run T002 green. (R1; enables M6/M10 safe-area insets.)

**Checkpoint**: `viewport-fit=cover` shipped + guarded; safe-area insets now resolvable.

---

## Phase 3: User Story 1 — Operable by touch, never by hover (Priority: P1) 🎯 MVP

**Goal**: Every control is finger-sized and adequately spaced; nothing is hover-only; the
toolbar wraps so all controls stay reachable.

**Independent Test**: On a touch profile, complete every interaction by tap; each target computes
≥44×44 CSS px, adjacent controls don't mis-fire, nothing is hidden behind hover, and the toolbar
wraps to multiple rows at ~320px with all controls visible.

- [X] T004 [US1] In `src/styles/app.css`, add a 44×44 CSS-px touch-target floor: `min-height: 44px` (and horizontal padding) on `.btn`, `.seg button`, `.langbtn`; `min-block-size: 44px; min-inline-size: 44px` on `.iconbtn` (choice remove ✕); `min-height: 44px` on `select` and on `.note`. Keep visual glyphs centered so the box grows, not the glyph. (R4 / M4 / FR-001)
- [X] T005 [US1] In `src/styles/app.css`, gate every hover *emphasis* rule behind `@media (hover: hover) and (pointer: fine) { … }` — `.iconbtn:hover`, `.note:hover`, `.linklike:hover`, `.modal__close:hover` (and remove or gate the empty `.footer__link:hover`). Confirm each gated affordance still has a `:focus-visible` (and `:active` where relevant) equivalent so it is reachable by tap + keyboard. (R5 / M9 / FR-002, FR-003)
- [X] T006 [US1] In `src/styles/app.css`, make `.toolbar__row` wrap: `display: flex; flex-wrap: wrap; row-gap: var(--space-2)` (or existing token); ensure `.toolbar__spacer` (the `flex:1` pusher) does not strand the Add-choice button when wrapped (zero/neutralize its effect at narrow widths). No overflow menu, no horizontal scroll. (R6 / FR-019 / M1·M4·M5)
- [ ] T007 [US1] Verify US1 in browser emulation (DevTools touch profile, ~320px): all interactive boxes compute ≥44×44 with no mis-fire (quickstart row 6), nothing hover-only (row 7), toolbar wraps with all controls visible (row 3). Record results.

**Checkpoint**: US1 independently usable on touch — the MVP slice.

---

## Phase 4: User Story 2 — Fits inside the device's physical frame (Priority: P1)

**Goal**: Content and the footer respect safe-area insets in both orientations; layout reflows
fluidly with no horizontal scroll.

**Independent Test**: On a notched profile (portrait + landscape), nothing is occluded and the
footer clears the home indicator; resize 320px→1440px with fluid reflow and no horizontal scroll.

- [X] T008 [US2] In `src/styles/app.css`, update `#app` padding to honor top/left/right insets using `max()`, e.g. `padding: max(var(--space-6), env(safe-area-inset-top)) max(var(--space-4), env(safe-area-inset-right)) var(--space-5) max(var(--space-4), env(safe-area-inset-left))`. (Depends on T003.) (R1 / M6 / FR-004)
- [X] T009 [US2] In `src/styles/app.css`, add `padding-bottom: max(var(--space-3), env(safe-area-inset-bottom))` to `.footer` so links clear the home indicator. (R1 / M6 / FR-005, FR-020)
- [ ] T010 [US2] Verify US2 in emulation: notched device portrait + landscape — no element under the cut-out, footer links tappable above the home indicator (quickstart row 1); continuous resize 320→1440px reflows with no horizontal scroll/overlap (row 2). Record results.

**Checkpoint**: US2 independently testable — content + footer fit the hardware frame.

---

## Phase 5: User Story 3 — Survives a moving viewport and the on-screen keyboard (Priority: P2)

**Goal**: Full-height column tracks collapsing browser chrome; a focused field stays visible above
the keyboard; the inline add/edit form is full-width and scrolls clear.

**Independent Test**: Collapse/expand the address bar — no clip/gap; focus each field with the
keyboard open — field visible, not covered, caret never lost.

- [X] T011 [US3] In `src/styles/app.css`, change `#app` height to dynamic viewport: keep `min-height: 100vh;` as a fallback then add `min-height: 100dvh;`. (R2 / M7 / FR-007)
- [X] T012 [US3] In `src/styles/app.css`, make the inline add/edit form mobile-friendly: at narrow widths stack `.form__row` and make `select` / `textarea` / `.seg` groups full-width; add `scroll-margin` (e.g. `scroll-margin-block: var(--space-4)`) to `.form` and to editable fields (`.choice__title`, dilemma title input, `.form textarea`) so a focused field clears the keyboard/edges. Do **not** alter any handler, `bind`, or submit logic. (R3·R7 / M8 / FR-018, FR-008, FR-009, FR-017)
- [ ] T013 [US3] Verify US3 in emulation/device: address-bar collapse/expand leaves no clip or gap (quickstart row 5); with the on-screen keyboard open, focusing title/choice-name/note/suggest fields keeps each visible and uncovered, caret preserved (rows 4, 11). Only if native scroll-into-view proves insufficient, add a minimal non-focus-stealing `scrollIntoView({block:'nearest'})` on form-open in `src/components/AddEditForm.svelte` (per R3) and re-verify; otherwise keep it CSS-only. Record results.

**Checkpoint**: US3 independently testable — viewport + keyboard handled without focus loss.

---

## Phase 6: User Story 4 — Readable, content-safe, and theme-legible (Priority: P2)

**Goal**: Text honors platform scaling; long content wraps without breaking the grid; both themes
stay legible on-device.

**Independent Test**: Max text-scaling at narrowest width → no clip/overlap; long unbroken tokens
wrap; default theme matches OS and contrast holds.

- [X] T014 [US4] In `src/styles/app.css`, add graceful wrapping to long-text fields: `overflow-wrap: anywhere` (and `hyphens: auto` where appropriate) on `.choice__title`, `.note__text`, and the dilemma title input; confirm no fixed widths clip when text grows. (R8 / M2 / FR-011)
- [X] T015 [US4] In `src/styles/app.css`, audit that font sizes use `rem`/tokens (no fixed `px` that defeats text-scaling) and that the choices grid / summary don't impose heights that clip enlarged text; adjust any offender to relative units. (R8 / M3 / FR-010)
- [ ] T016 [US4] Verify US4: set platform text size / browser zoom to max at narrowest width — legible, no clip/overlap (quickstart row 8); long title/name/note incl. a long unbroken token wrap gracefully, grid intact (row 9); both themes match OS scheme and hold WCAG AA contrast on-device (row 10, computed ≥4.5:1). Record results. (M11/FR-012 re-verify — no code change.)

**Checkpoint**: US4 independently testable — readable and content-safe on-device.

---

## Phase 7: User Story 5 — Comfortable in any posture, calm on any device (Priority: P3)

**Goal**: Primary actions stay reachable on large phones; landscape (incl. short height) loses
nothing; motion stays calm and reduced-motion-aware.

**Independent Test**: Large-phone reach OK; landscape incl. short height has no lost
function/content and no horizontal scroll; motion smooth on mid-range, suppressed under
reduced-motion.

- [X] T017 [US5] In `src/styles/app.css`, audit for portrait-only assumptions / fixed `vh` heights that would break short landscape; confirm the `100dvh` column (T011) + fluid grid + side insets (T008) cover landscape, and fix any offender found. (R9 / M10 / FR-014)
- [ ] T018 [US5] Verify US5 in emulation: large-phone profile — primary actions (Add choice, Add note, score-relevant controls) reachable without a far-corner stretch (M5/FR-013); rotate to landscape incl. short height (~375px tall) — no lost function/content, no horizontal scroll (quickstart row 11); mid-range CPU throttle — reorder/reveal smooth, reduced-motion suppresses non-essential motion (row 12, M12/FR-015 re-verify, no code change). Record results.

**Checkpoint**: US5 independently testable — posture/motion comfort confirmed.

---

## Phase 8: Polish & Cross-Cutting Concerns

- [X] T019 Run `node_modules/.bin/svelte-check` (0 errors/0 warnings) and `node_modules/.bin/vitest run` (entire suite green, including the T002 viewport guard) from repo root — the no-regression gate (FR-016/FR-017).
- [X] T020 Run `node_modules/.bin/vite build`; confirm it succeeds. If the bundler step needs network and is offline, at minimum confirm svelte-check + vitest are green (per quickstart.md).
- [X] T021 Confirm scope discipline by diffing the branch: only `index.html`, `src/styles/app.css`, `tests/unit/viewport.test.ts` (and, *only if* T013 required it, `src/components/AddEditForm.svelte`) changed — and **no** edits to `store.svelte.ts`, `theme.ts`, `types.ts`, pure-core `*.ts`, or `i18n/*`. "Remove point" not wired (out of scope → 007).
- [ ] T022 Complete the full on-device acceptance matrix in `quickstart.md` (rows 1–12 → SC-001…011) on browser emulation and at least one real phone if available; note any deviations.

---

## Dependencies & Execution Order

- **Setup (T001)** → before everything.
- **Foundational (T002–T003)** → before **US2** (T008 depends on `viewport-fit=cover`). US1, US3,
  US4, US5 do not strictly require it, but default order is priority P1→P3.
- **US1 (T004–T007)** and **US2 (T008–T010)** are both P1; US2's T008 depends on T003.
- **US3 (T011–T013)**, **US4 (T014–T016)**, **US5 (T017–T018)** follow. T017 references the `dvh`
  column from T011 and side insets from T008 — sequence US3/US2 before T017's verification.
- **Polish (T019–T022)** → after all stories.

### File-contention notes

- `src/styles/app.css` is edited by T004, T005, T006, T008, T009, T011, T012, T014, T015, T017 —
  **same file, sequential** (no `[P]` among them); follow phase order.
- `index.html` (T003) and `tests/unit/viewport.test.ts` (T002) are distinct files.
- `src/components/AddEditForm.svelte` is touched **only if** T013's optional JS fallback is needed.

### Parallel opportunities

- Genuinely parallel work is minimal because the CSS lives in one file. The only cross-file
  parallel pair is **T002 (test) ‖ nothing** before T003; and verification tasks (T007, T010,
  T013, T016, T018) are independent of each other once their CSS lands, but each depends on its
  own story's edits. Treat verification tasks as runnable in any order at the end of their phase.

---

## Implementation Strategy

- **MVP = US1 (touch + no-hover + toolbar wrap)**: the slice that makes Sift usable at all on a
  phone; independently shippable after T007.
- **Then US2 (device frame)** — the other P1; safe-areas prevent visible clipping on common
  notched devices.
- **Then US3 → US4 → US5** in priority order; each is a complete, independently verifiable slice.
- **No-regression is the spine**: keep the existing suite green throughout (T001 baseline,
  T019 gate). The bulk is one CSS file + one HTML attribute; resist scope creep (no behavior, no
  deps, no remove-point).
