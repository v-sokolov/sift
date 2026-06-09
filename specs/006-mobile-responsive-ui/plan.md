# Implementation Plan: Mobile & Responsive UI Hardening

**Branch**: `006-mobile-responsive-ui` | **Date**: 2026-05-30 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/006-mobile-responsive-ui/spec.md`

## Summary

Harden the existing 004 Svelte UI so it behaves correctly on real handheld devices and across
the full size spectrum, without changing any product behavior, data, copy, or dependency. The
work is almost entirely **CSS in `src/styles/app.css`** plus a one-attribute change to
`index.html` (`viewport-fit=cover`) and a few small, non-behavioral markup/class touches in
components. It promotes the abstract matrix (M1–M12) into concrete techniques: `viewport-fit`
+ `env(safe-area-inset-*)` for the device envelope (M6), dynamic-viewport units
(`100dvh` replacing `100vh`) for collapsing browser chrome (M7), `scroll-margin` so a focused
field clears the on-screen keyboard (M8), a 44×44 CSS-px touch-target floor with adequate
spacing (M4), `@media (hover: hover)`-gated hover emphasis with `:focus-visible` parity so
nothing is hover-only (M9), `flex-wrap` on the toolbar (M1/M4/M5 — per Clarifications), a
full-width inline add/edit form (M8 — per Clarifications), relative/wrapping type for text
scaling and long content (M2/M3), and orientation/short-landscape robustness (M10). Motion
(M12) and theming (M11) are already satisfied by 004 and are only re-verified on-device.

The **pure core, the runes store, the i18n catalogs, and all behavior are untouched** — every
existing unit and component test must stay green (FR-016/FR-017). No new runtime or dev
dependency is added.

## Technical Context

**Language/Version**: TypeScript 5.x (strict) + Svelte 5 (runes); Tailwind v4 (CSS-first) —
**unchanged from 004**. This feature adds **no** new dependency.

**Primary Dependencies**: none added. Uses only standard CSS features supported by evergreen
mobile/desktop browsers: `env(safe-area-inset-*)` + `viewport-fit=cover`, dynamic-viewport
length units (`dvh`), `@media (hover/pointer)` media queries, `scroll-margin`/`scroll-padding`,
`overflow-wrap`/`hyphens`, flexbox `flex-wrap`. All build-time/static; no runtime cost.

**Storage**: browser `localStorage`, key `sift.v1` — **unchanged**. No new persisted datum
(no theme/layout/orientation preference is stored).

**Testing**: Vitest + jsdom (existing). Pure-logic and behavior tests carry over **unedited**
(the no-regression contract). New assertable guards are limited to what jsdom can observe
(e.g. the `index.html` viewport meta contains `viewport-fit=cover`; presence of the
safe-area/`dvh`/touch-floor CSS in the built stylesheet). Pixel-level responsive, touch,
keyboard-avoidance, safe-area, and orientation behaviors are **not** observable in jsdom and
are verified by responsive emulation + computation + on-device spot checks (see spec "Verification"),
consistent with the spec's Assumptions and prior features' approach.

**Target Platform**: static SPA on GitHub Pages (003); evergreen mobile + desktop browsers;
offline-capable. Primary new emphasis: handheld devices with display cut-outs, an on-screen
keyboard, and collapsing browser chrome.

**Project Type**: single client-side web project (no backend, no API).

**Performance Goals**: no regressions; pure-CSS techniques add no runtime work; motion stays
60fps and reduced-motion-aware (inherited from 004).

**Constraints**: no backend/network/telemetry (Constitution II); no behavior/data/copy/
dependency change (FR-016); touch-target floor 44×44 CSS px; no horizontal scroll ~320px→
≥1440px; WCAG AA contrast both themes; honor `prefers-reduced-motion`; nothing hover-only (M9).

**Scale/Scope**: one screen. Touch surfaces: `index.html` (1 attr), `src/styles/app.css`
(the bulk), and small non-behavioral edits to `App.svelte` / `AddEditForm.svelte` /
`Footer.svelte` / `Toolbar.svelte` / `ChoiceCard.svelte` / `NoteRow.svelte` only where a class
hook or wrapper is needed. No store, no i18n, no pure-core file is edited.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Evaluated against **Constitution v2.0.0** (`.specify/memory/constitution.md`).

| Principle | Verdict | Notes |
|-----------|---------|-------|
| **I. Calm Over Features** | ✅ PASS | No new product features; this is responsive/accessibility polish on the existing surface. The "remove point" idea was explicitly deferred to a separate feature (Clarifications) to keep this scope clean. |
| **II. Client-Side & Private** | ✅ PASS | Pure CSS + one HTML attribute. No backend, network, telemetry, or data egress; app stays offline-capable; no new persisted datum. |
| **III. Deliberate Simplicity** | ✅ PASS | Zero new dependencies — the simplest possible delivery. Standard CSS features, no JS for layout, no new abstractions (YAGNI). Keeps state/presentation separation intact (only presentation changes). |
| **IV. Pure Core, Test-First (NON-NEGOTIABLE)** | ✅ PASS (with note) | No domain logic or behavior changes, so no new pure-core tests are required; the obligation is that **all existing unit + component tests stay green** (FR-016/FR-017) and that the type-check + suite are green at merge. New assertable guards are added where jsdom can observe them (viewport meta, CSS-presence); inherently visual/responsive criteria are verified by emulation + on-device checks (see spec "Verification"), since they are not unit-testable. This is a deliberate, documented limit, not a TDD waiver. |
| **V. Accessibility by Default** | ✅ PASS | Directly advances this principle: enforces touch-target sizing, guarantees no hover-only access (M9), keeps keyboard focus parity (`:focus-visible`), honors text-scaling and safe-areas, and preserves WCAG AA in both themes. |

**Result: PASS** — no violations. **Complexity Tracking is empty.**

## Project Structure

### Documentation (this feature)

```text
specs/006-mobile-responsive-ui/
├── plan.md              # This file
├── spec.md              # Feature spec (condensed)
└── contracts/
    ├── responsive.md    # Per-dimension CSS technique contract (M1–M12 → mechanism → check)
    └── components.md    # Concrete per-file markup/class/CSS changes + no-hover-only audit
```

> Condensed 2026-06-09: `research.md` (R1–R10 technique decisions), `data-model.md`
> (no data changes), `quickstart.md`, `tasks.md`, and `checklists/` were removed once the
> feature shipped; their conclusions are folded into the spec and the two contracts.

### Source Code (repository root)

**Edited (presentation only):**

```text
index.html              # viewport meta: add `viewport-fit=cover` (enables env(safe-area-inset-*))
src/styles/app.css      # the bulk of the work — see contracts/responsive.md & components.md:
                        #   • #app: 100vh → 100dvh (M7); safe-area padding via max(pad, env(...)) (M6)
                        #   • .footer: bottom safe-area padding (M6/FR-020)
                        #   • touch-target floor (≥44px) on .btn/.seg button/.iconbtn/select/.note/.langbtn (M4)
                        #   • hover emphasis wrapped in @media (hover: hover) + :focus-visible parity (M9)
                        #   • .toolbar__row: flex-wrap + row-gap (M1/M4/M5 — Clarifications)
                        #   • .form: full-width on narrow + scroll-margin so it clears the keyboard (M8 — Clarifications)
                        #   • text: relative units + overflow-wrap/hyphens for long tokens (M2/M3)
                        #   • orientation/short-landscape: avoid fixed heights; dvh handles it (M10)
```

**Touched only if a class hook / wrapper is needed (no behavior change):**

```text
src/App.svelte               # possible scroll-margin/anchor class on the inline form region
src/components/AddEditForm.svelte   # full-width class hook; scroll focused field into view (CSS-first)
src/components/Footer.svelte        # (likely none — padding handled in app.css)
src/components/Toolbar.svelte       # (likely none — wrap handled in app.css; verify .toolbar__spacer on wrap)
src/components/ChoiceCard.svelte    # ensure remove ✕ (.iconbtn) meets touch floor (CSS)
src/components/NoteRow.svelte       # ensure note tap target meets touch floor (CSS)
```

**Reused verbatim — DO NOT edit (no-regression contract):**

```text
src/{types,scoring,view,ids,mailto,config,persistence}.ts
src/store.svelte.ts
src/theme.ts
src/i18n/{index,en,uk}.ts
```

**Tests:**

```text
tests/
├── unit/               # UNCHANGED — all pure-logic + i18n parity tests stay green
├── components/         # UNCHANGED behavior tests stay green; optionally add:
│   └── (guard)         #   a jsdom-observable assertion that index.html viewport meta
│                       #   contains `viewport-fit=cover` (and CSS-presence guard if practical)
```

**Structure Decision**: Single client-side web project. Concentrate the change in
`src/styles/app.css` (global component styles, per 004's no-scoped-`<style>` convention) and the
`index.html` viewport attribute; touch components only to add a class hook where CSS alone
cannot reach. No store, i18n, or pure-core file changes — that is what guarantees FR-016/FR-017
and keeps the existing test suite green as the regression gate.

## Complexity Tracking

> No Constitution violations — this section is intentionally empty. The feature adds no
> dependency and changes no behavior; it is the simplest delivery (pure CSS + one HTML
> attribute) of the spec's requirements.
