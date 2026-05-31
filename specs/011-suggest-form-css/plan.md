# Implementation Plan: Suggest-Feature Form Button Layout

**Branch**: `011-suggest-form-css` | **Date**: 2026-05-31 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/011-suggest-form-css/spec.md`

## Summary

Make the suggest-a-feature dialog's two action buttons (Cancel, Send) share the action row
equally — each flexes to ≈50% of the row minus its share of the existing gap — instead of
sitting right-aligned at their natural content widths. This is a presentation-only change: the
existing `.modal__actions` flex row keeps its `gap`, drops `justify-content: flex-end`, and both
buttons get an equal-flex basis (`flex: 1 1 0`) so they stay equal-width regardless of label
length or language. A small markup hook (a shared class on the two action buttons) makes the
contract test-observable in jsdom, where external CSS and layout are not applied. The footnote
stays left-aligned (settled in spec Clarifications). No store, persistence, i18n, or behavior
change.

## Technical Context

**Language/Version**: TypeScript 5.x (strict)

**Primary Dependencies**: Svelte 5 (runes) + Tailwind v4 + Bits UI (existing; no new deps)

**Storage**: N/A (no persistence change — runtime/visual only)

**Testing**: Vitest + jsdom via `tests/svelte.ts` mount helper (`mount()` + `@testing-library/dom`)

**Target Platform**: Static SPA in modern browsers (desktop + mobile)

**Project Type**: Single-project client-side web app

**Performance Goals**: N/A (static CSS; no runtime cost)

**Constraints**: Offline-capable, client-side only; WCAG AA preserved; no horizontal overflow at
any supported viewport width; buttons remain ≥44px touch target (unchanged).

**Scale/Scope**: One component (`SuggestDialog.svelte`) + one CSS block (`.modal__actions`) +
one component test. ~3 files touched.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **I. Calm Over Features**: PASS — purely a layout refinement; no new feature, no number-chasing,
  quieter/more balanced action row. Reduces visual noise.
- **II. Client-Side & Private**: PASS — no backend, network, telemetry, or data egress introduced.
- **III. Deliberate Simplicity**: PASS — no new dependency; a single CSS rule plus one marker
  class. Keeps state/presentation separation (touches presentation only).
- **IV. Pure Core, Test-First (NON-NEGOTIABLE)**: PASS — no pure-core/domain logic changes. The
  markup contract (equal-width hook on both buttons) is locked with a component test written
  first (red), then satisfied (green). Existing suggest-dialog behavior tests act as the
  regression gate. `tsc` (`yarn check`) + `vitest` (`yarn test`) MUST be green.
- **V. Accessibility by Default**: PASS — no color-only meaning added; labels, order, focus
  order, keyboard operability, and 44px touch floor all unchanged. Equal-width affects geometry
  only.

No violations → Complexity Tracking not required.

## Project Structure

### Documentation (this feature)

```text
specs/011-suggest-form-css/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output (no data entities — documents "none")
├── quickstart.md        # Phase 1 output (manual + test acceptance matrix)
├── contracts/
│   └── ui-presentation.md   # Phase 1 output (markup + CSS contract)
└── checklists/
    └── requirements.md  # From /speckit-specify
```

### Source Code (repository root)

```text
src/
├── components/
│   └── SuggestDialog.svelte   # MODIFY — add equal-width hook class to Cancel + Send buttons
└── styles/
    └── app.css                # MODIFY — .modal__actions: drop justify-content:flex-end;
                               #          add equal-flex rule for the two action buttons

tests/
└── components/
    └── suggest.test.ts        # MODIFY — add "equal-width action buttons (011)" describe;
                               #          existing suggest tests are the regression gate
```

**Structure Decision**: Single-project client-side app (the established Svelte 5 + Tailwind v4
layout). This feature touches only presentation (`SuggestDialog.svelte` markup hook + `app.css`
action-row rule) and its test; the pure core, store, persistence, and i18n catalogs are
untouched.

## Complexity Tracking

> No Constitution Check violations — section intentionally empty.
