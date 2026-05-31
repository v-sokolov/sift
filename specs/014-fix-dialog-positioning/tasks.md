# Tasks: Fix Suggest-Feature Dialog Positioning

**Feature**: `014-fix-dialog-positioning` · **Branch**: `014-fix-dialog-positioning`
**Spec**: [spec.md](./spec.md) · **Plan**: [plan.md](./plan.md) · **Contract**: [contracts/dialog-positioning.md](./contracts/dialog-positioning.md)

Presentation-only fix (one P1 story). No pure-core/domain change, so no new unit tests are mandated
(Constitution IV note in plan); layout is verified by the **preserved** behavior/contract tests plus a
manual cross-breakpoint pass. Scope is small — a single CSS rule-block change is the operative work.

## Phase 1: Setup

- [X] T001 Confirm baseline is green before changing anything: run `yarn check` (0 errors) and
  `yarn test` (full suite passes) from repo root, so any later failure is attributable to this fix.

## Phase 2: Foundational

_None._ No blocking prerequisites — the fix is a self-contained style change; the existing
`SuggestDialog.svelte` already carries the `.modal`/`.modal-overlay` classes and `data-*` hooks the
styles target.

## Phase 3: User Story 1 — Suggest dialog appears correctly centered (Priority: P1)

**Goal**: The open suggest dialog is centered over a full-viewport dimmed backdrop, above all other
content, on every breakpoint and on short viewports — without depending on `.modal` being the
backdrop's DOM child.

**Independent test**: `yarn dev`, open Suggest a feature at mobile/tablet/desktop widths + a short
viewport; panel is centered, fixed, viewport-bounded with internal scroll, and above the backdrop
(quickstart M1–M6).

- [X] T002 [US1] In `src/styles/app.css`, re-style the `.modal` rule block to self-center as its own
  fixed top-layer element instead of relying on a flex parent: set
  `position: fixed; inset: var(--space-4); margin: auto; height: fit-content; z-index: 101;` and
  **keep** `max-width: 460px; max-height: 90vh; max-height: 90dvh; overflow: auto;` plus the existing
  surface/border/radius/padding/shadow/flex-column/gap. (As-built F1 resolution: used
  `inset: var(--space-4)` as the single gutter+centering mechanism and **dropped `width: 100%`** —
  with `auto` width + both insets + `margin: auto`, the panel caps at `max-width` and centers, while
  the inset gives the screen-edge gutter; this replaces the originally-drafted `inset: 0` + `width:
  100%`, which would have conflicted with the gutter.) (FR-001, FR-004, FR-005, FR-006;
  contract P1, P2, P4, P5, P6, S1)
- [X] T003 [US1] In `src/styles/app.css`, adjust the `.modal-overlay` rule block (≈lines 686–695) to
  be a pure fixed backdrop now that it no longer parents the panel: keep `position: fixed; inset: 0;
  background: rgba(0,0,0,0.45); z-index: 100;`; the flex centering props (`display:flex;
  align-items/justify-content:center`) are now inert and SHOULD be removed for clarity, and the
  edge-gutter (`padding: var(--space-4)`) must be preserved as gutter for the fixed panel so it never
  touches screen edges on small viewports — move it onto `.modal` (e.g. via `inset: var(--space-4)`
  or a margin floor) if removing it from the overlay would otherwise let the panel reach the edges.
  (FR-002, FR-003; contract P3, P5, S2, S3)
- [X] T004 [US1] Verify no other rule or media query needs to change: re-grep `src/styles/app.css`
  for `.modal`/`@media` (breakpoints 719/720px) and confirm nothing else targets the dialog, so the
  single rule change is breakpoint-complete. No markup change to `src/components/SuggestDialog.svelte`
  unless a wrapper proves strictly necessary — if so, preserve the exact `.modal`/`.modal-overlay`
  classes and all `data-*` hooks (FR-008, FR-009; research R3).

## Phase 4: Polish & Verification

- [X] T005 Regression gate: `yarn check` → 0 errors; `yarn test` → full suite green with no net loss
  of tests (esp. `tests/components/suggest.test.ts` — mount, classes, Esc, inside-click-no-dismiss).
  (SC-005; quickstart A1–A2)
- [X] T006 Build gate (Constitution v2.1.0): `yarn build` (svelte-check + vite build) completes
  successfully. The CI clean-install build is the authoritative check. (quickstart A3)
- [ ] T007 Manual cross-breakpoint + a11y pass via `yarn dev` per quickstart M1–M9: centered & fixed
  at mobile/tablet/desktop, gutter on mobile, fixed when page scrolled, viewport-bounded internal
  scroll on short viewport, correct stacking; focus-on-open, Tab-trap + focus-return, Esc/outside-
  click/scroll-lock unchanged. Confirm honesty checks H1–H3 (CSS-only diff, Bits UI retained, saved
  board loads unchanged). _(On-device; not headless.)_

## Dependencies

- T001 (baseline) → T002 → T003 → T004 → T005 → T006 → T007.
- T002 and T003 touch the same file (`app.css`) and are sequential (no `[P]`). T004 verifies after
  both. T005/T006 are the gates; T007 is the manual visual/a11y pass.

## MVP

T002 + T003 alone deliver the fix (centered, stacked dialog); T005–T006 are the green gates; T007 is
the human visual confirmation that jsdom cannot provide.

## Parallel opportunities

None meaningful — the operative work is two edits to the same CSS file plus sequential verification
gates. The change is intentionally small (ceremony-scaled to a contained UI fix).
