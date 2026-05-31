# Tasks: Suggest-Feature Form Button Layout

**Feature**: `011-suggest-form-css` · **Date**: 2026-05-31
**Input**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [contracts/ui-presentation.md](./contracts/ui-presentation.md), [quickstart.md](./quickstart.md)

This is a **presentation-only** feature with one user story (US1, P1). Per Constitution IV
(Test-First, NON-NEGOTIABLE) the markup contract is locked with a test written first (red) then
satisfied (green); existing suggest-dialog tests are the regression gate. jsdom applies no CSS
and does no layout, so pixel-equality (A5–A9) is verified manually per the quickstart.

## Phase 1: Setup

_No setup needed — existing Svelte 5 + Tailwind v4 project; no new dependencies (plan.md)._

## Phase 2: Foundational

_None — no blocking prerequisites; the single story is self-contained._

## Phase 3: User Story 1 — Balanced action buttons (Priority: P1)

**Goal**: Cancel and Send share the suggest-dialog action row equally (each ≈50% minus the gap),
holding across viewports and languages; footnote unchanged.

**Independent Test**: Open the suggest dialog; the action row holds exactly two buttons
(Cancel→Send) both carrying the `btn--half` equal-width hook; existing dialog behavior intact.

### Tests (write first — MUST fail before implementation)

- [X] T001 [US1] Add a `describe('equal-width action buttons (011)')` block to `tests/components/suggest.test.ts` that opens the dialog and asserts: (a) `.modal__actions` contains exactly two buttons, in order Cancel (`[data-action="close-suggest"]`) then Send (`[data-action="suggest-send"]`) — contract C-1; (b) BOTH action buttons carry the `btn--half` class — contract C-2. Run `yarn test` and confirm the new test FAILS (class not yet present).

### Implementation (make T001 green)

- [X] T002 [US1] In `src/components/SuggestDialog.svelte`, add the `btn--half` class to BOTH action buttons in `.modal__actions`: Cancel → `class="btn btn--half"`, Send → `class="btn btn--primary btn--half"`. Leave order, `type`, `data-action`, `disabled` binding, and click handlers unchanged (contract C-3).
- [X] T003 [US1] In `src/styles/app.css`, update the `.modal__actions` rule: remove `justify-content: flex-end;`, keep `display: flex;` and `gap: var(--space-2);`; add `.modal__actions .btn--half { flex: 1 1 0; }` (zero basis → equal halves regardless of label length/language — contracts C-5/C-6).

### Verification

- [X] T004 [US1] Run `yarn test` — T001 now PASSES and the full suite is green (existing suggest behavior tests are the regression gate for C-3/C-4: open/close, Esc, backdrop, focus-trap, Send-gating, mailto hand-off, i18n). Run `yarn check` — 0 svelte-check/tsc errors.

## Phase 4: Polish & Cross-Cutting

- [ ] T005 Manual on-device pass via `yarn dev` per quickstart A5–A9: equal button widths (desktop), buttons+gap fill row with no overflow, equal width in Ukrainian (longer "Скасувати" label), equal width + no clipping on a narrow/mobile width, and footnote still left-aligned. (Not headlessly verifiable — see research R2.)

## Dependencies

- T001 (failing test) → T002, T003 (implementation) → T004 (green/regression + typecheck) → T005 (manual).
- T002 and T003 touch different files (`.svelte` vs `.css`) and are jointly required to turn T001 green; they may be done in either order but both must land before T004.

## Parallel Execution

- T002 and T003 are independent files and could be edited in parallel `[P]`, but both are needed before T004 verifies. Given the tiny scope, sequential is fine.

## Implementation Strategy

Single-story MVP = the entire feature. Order: red test (T001) → markup hook (T002) + CSS rule
(T003) → green + regression + typecheck (T004) → manual visual confirmation (T005). No
incremental slicing needed.
