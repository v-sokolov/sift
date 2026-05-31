# Implementation Plan: Fix Suggest-Feature Dialog Positioning

**Branch**: `014-fix-dialog-positioning` | **Date**: 2026-05-31 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/014-fix-dialog-positioning/spec.md`

## Summary

Fix a visual regression from 012: Bits UI's `Dialog` renders `Dialog.Overlay` (`.modal-overlay`) and
`Dialog.Content` (`.modal`) as **inline siblings**, but the styles assume `.modal` is the *child* of
a flex-centering `.modal-overlay`. With no flex parent and only `position: relative`, the panel falls
into normal page flow and the backdrop is an empty dim layer. **Approach**: re-style `.modal` to
center itself as its own fixed, top-layer element (independent of being the backdrop's child), and
make `.modal-overlay` a pure fixed backdrop. Keep Bits UI (no revert). Presentation-only; the
existing class names, `data-*` hooks, dim/surface/shadow/max-width/`max-height: 90dvh` styling, and
all Bits UI accessible behaviors are preserved.

## Technical Context

**Language/Version**: TypeScript 5.9.3 (strict); CSS (Tailwind v4 `@theme` tokens)

**Primary Dependencies**: Svelte 5 (runes), Bits UI 2.18.1 (`Dialog`), Tailwind v4 — unchanged

**Storage**: N/A (no persisted-state change; `localStorage` `sift.v1` untouched)

**Testing**: Vitest 3.2.4 on jsdom (event/contract-level component tests); manual cross-breakpoint
visual verification (jsdom has no layout engine)

**Target Platform**: Static SPA in modern browsers; responsive (existing breakpoints at 719/720px)

**Project Type**: Single-project client-side web app

**Performance Goals**: N/A (no runtime/perf change; pure layout/styling)

**Constraints**: Offline-capable, client-side only; no new dependency; centering must not rely on
DOM nesting; must hold at all existing breakpoints and on short/landscape viewports
(`max-height: 90dvh` + internal scroll preserved)

**Scale/Scope**: One CSS rule-block change (`.modal` / `.modal-overlay` in `src/styles/app.css`);
no markup change expected (the existing `data-*`/class hooks already carry the styles)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.* — Constitution v2.1.0.

- **I. Calm Over Features**: PASS — restores intended calm presentation of an existing feature; adds
  nothing. No new cognitive load.
- **II. Client-Side & Private**: PASS — CSS only; no backend, network, telemetry, or data egress.
- **III. Deliberate Simplicity**: PASS — no new dependency; smallest change that fixes the layout;
  keeps headless Bits UI primitive (markup we own). Removes the latent nesting assumption rather than
  adding abstraction.
- **IV. Pure Core, Test-First (NON-NEGOTIABLE)**: PASS (with note) — no domain/pure-core logic
  changes, so no new pure-function tests are mandated. Layout cannot be asserted in jsdom (no layout
  engine), so verification is the **preserved** component behavior tests (focus/Esc/dismiss/contract)
  plus a documented manual cross-breakpoint pass. The existing suite MUST stay green (no regression).
- **V. Accessibility by Default**: PASS — all Bits UI accessible behaviors (focus trap, Esc,
  outside-click, scroll-lock, focus-return) are explicitly preserved (FR-007); correct centering and
  stacking improve usability. Weight-dot/contrast rules are untouched.

**Build gate (v2.1.0)**: `yarn build` (svelte-check + vite build) MUST succeed; verified on the CI
clean install (authoritative).

**Result**: No violations. Complexity Tracking not required.

## Project Structure

### Documentation (this feature)

```text
specs/014-fix-dialog-positioning/
├── plan.md              # This file
├── spec.md              # Feature spec
├── research.md          # Phase 0 — positioning technique decision
├── quickstart.md        # Phase 1 — manual cross-breakpoint verification + regression checks
├── contracts/
│   └── dialog-positioning.md   # Phase 1 — the positioning/stacking contract
└── checklists/
    └── requirements.md  # Spec quality checklist
```

(No `data-model.md` — this feature has no data model; presentation-only.)

### Source Code (repository root)

```text
src/
├── styles/
│   └── app.css                      # CHANGE: .modal + .modal-overlay positioning/stacking (≈685–712)
└── components/
    └── SuggestDialog.svelte         # NO CHANGE expected (class/data-* hooks already present)

tests/
└── components/
    └── suggest.test.ts              # UNCHANGED — must stay green (behavior/contract guard)
```

**Structure Decision**: Single-project layout (existing). The change is confined to the
`.modal` / `.modal-overlay` rule blocks in `src/styles/app.css`. `SuggestDialog.svelte` already
applies `class="modal-overlay"` / `class="modal"` and the `data-*` hooks, so no markup change is
anticipated; if a wrapper proves necessary it must preserve those exact classes/hooks (FR-009).

## Complexity Tracking

> No Constitution Check violations — section intentionally empty.
