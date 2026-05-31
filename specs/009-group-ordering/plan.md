# Implementation Plan: Group Ordering — Confirm & Document

**Branch**: `009-group-ordering` | **Date**: 2026-05-31 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/009-group-ordering/spec.md`

## Summary

Lock down the **Group mode** ordering contract so it cannot silently regress. The behaviour the
user described already ships (008): **Type** mode renders Advantages → Disadvantages → Neutral
(weighted sections heaviest-first 3→2→1, Neutral in creation order); **Weight** mode renders
sections 3 → 2 → 1 → weightless(0), empty weights omitted, members in creation order with types
mixed. This feature is **documentation + regression-protection**: it pins the ordering rules into
explicit, fail-first unit tests around the pure `arrange()` function (and the renderer's
empty-section skip), with **no expected production code change** (FR-010). If a test reveals the
live behaviour diverges from the contract, that becomes a bug fix scoped to restore the contract.

## Technical Context

**Language/Version**: TypeScript 5.x (strict)

**Primary Dependencies**: Vite 5, Svelte 5 (runes), Tailwind v4, Bits UI — all pre-existing; this
feature adds none (FR-010).

**Storage**: `localStorage` key `sift.v1` (unchanged; no schema touch).

**Testing**: Vitest (unit) on jsdom; existing `tests/unit/view.test.ts` is the home for the
ordering regression cases; component-level empty-section skip covered via the existing
`tests/svelte.ts` mount helper if needed.

**Target Platform**: Static SPA in the browser, offline-capable.

**Project Type**: Single-project client-side web app (Svelte 5 + Vite).

**Performance Goals**: Re-sectioning a choice is instant (<1s, effectively sub-ms); pure function.

**Constraints**: Fully client-side, no network/telemetry (Principle II); pure, deterministic
arrangement (Principle IV); no color-only meaning (Principle V — unaffected, no UI change).

**Scale/Scope**: One pure function (`arrange`) + one renderer guard; ~3–5 added/strengthened unit
tests. No new files in `src/`.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **I. Calm Over Features**: PASS — no UI/feature addition; this only protects existing behaviour.
- **II. Client-Side & Private**: PASS — no backend/network/telemetry; no new data egress.
- **III. Deliberate Simplicity**: PASS — zero new dependencies; no new production code expected;
  adds only tests. Strengthens separation of concerns by documenting where the empty-section guard
  lives (renderer) vs. ordering (pure `arrange`).
- **IV. Pure Core, Test-First (NON-NEGOTIABLE)**: PASS and central — the feature *is* test-first
  hardening of the pure `arrange()` core. New/strengthened tests are written to assert the contract
  and run green against current behaviour; any red reveals a real regression to fix.
- **V. Accessibility by Default**: PASS — no presentation change; existing a11y posture untouched.

**Result**: No violations. Complexity Tracking not required.

## Project Structure

### Documentation (this feature)

```text
specs/009-group-ordering/
├── plan.md              # This file
├── research.md          # Phase 0 — behaviour confirmation + empty-section nuance
├── data-model.md        # Phase 1 — Section shape (unchanged); ordering rules
├── quickstart.md        # Phase 1 — on-device + test acceptance matrix
├── contracts/
│   └── group-ordering.md  # Phase 1 — the locked arrange() ordering contract
└── checklists/
    └── requirements.md  # Spec quality checklist (from /speckit-specify)
```

### Source Code (repository root)

```text
src/
├── view.ts                 # arrange() — pure grouping/sorting (NO CHANGE EXPECTED)
└── components/
    └── ChoiceCard.svelte    # renders sections, skips zero-note sections (NO CHANGE EXPECTED)

tests/
└── unit/
    └── view.test.ts         # ADD/STRENGTHEN: Type 3→2→1 within sections (incl. weight-2),
                             # Weight 3→2→1→0 order, empty-section omission, stability/purity
```

**Structure Decision**: Single-project Svelte SPA (option 1). The pure ordering logic lives in
`src/view.ts`; the empty-section render guard lives in `src/components/ChoiceCard.svelte`. This
feature touches only `tests/unit/view.test.ts` (and, only if a component-level assertion is needed
for FR-006, a small ChoiceCard test via `tests/svelte.ts`). No `src/` change is planned.

## Complexity Tracking

> Not applicable — Constitution Check passed with no violations.
