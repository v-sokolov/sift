# Implementation Plan: Remove Point & Preserve Preferences on Clear

**Branch**: `007-remove-point` | **Date**: 2026-05-31 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/007-remove-point/spec.md`

## Summary

Two small, related changes on the existing Svelte 5 + Tailwind v4 stack:

1. **Remove a point (US1, P1)** — give every point row an **always-visible** ✕ remove control
   that wires the existing `removeNote(choiceId, noteId)` store action. The control is
   de-emphasized at rest, keyboard- and touch-operable, meets the 44px touch floor, carries a
   localized accessible label, and must NOT trigger the row's existing click-to-edit behavior.
   Because removal is a behavior change, a small store guard is added: removing a point that is
   currently being edited closes/resets the open form (FR-011).
2. **Clear preserves preferences (US2, P2)** — `clearDilemma()` already preserves Language; it is
   amended to also preserve **Theme** (today it resets theme to `system`). This is the single
   intentional behavior change; it is one line in the store plus a regression test.

No new runtime dependencies, no data-model or scoring change, no network. One new i18n key
(`note.removeAria`) added to both EN and UK catalogs. Everything else is presentation + wiring.

## Technical Context

**Language/Version**: TypeScript 5.x (strict) + Svelte 5 (runes), built with Vite 5

**Primary Dependencies**: Svelte 5, Tailwind v4, Bits UI (all already present; **none added**)

**Storage**: browser `localStorage` only, versioned key `sift.v1` (unchanged format)

**Testing**: Vitest on jsdom; pure/store unit tests in `tests/`; component tests via the local
`tests/svelte.ts` helper (Svelte 5 `mount()` + `@testing-library/dom`)

**Target Platform**: static SPA, modern evergreen browsers (desktop + mobile), offline-capable

**Project Type**: single-project client-side web app (no backend)

**Performance Goals**: removal reflected in < 1s (effectively instant, local state mutation);
no animation budget concerns beyond existing reduced-motion-aware transitions

**Constraints**: fully client-side/private (no network/telemetry); WCAG AA; 44×44 CSS-px touch
targets; nothing conveyed by color or hover alone (Principle V + 006 hardening)

**Scale/Scope**: single active dilemma, 2–4 choices, a handful of points each; ~3 component
edits, 1 store edit, 2 i18n keys, plus tests

## Constitution Check

*GATE: evaluated against Constitution v2.0.0.*

| Principle | Assessment | Verdict |
|---|---|---|
| **I. Calm Over Features** | A per-point remove is a calm, expected affordance that reduces friction (today the only ways to drop a point are blanking its text or the destructive global Clear). The ✕ is de-emphasized, not attention-grabbing; no "winner" pressure introduced. | ✅ Pass |
| **II. Client-Side & Private** | Pure local state mutation + existing `localStorage` persistence. No network, account, or telemetry. | ✅ Pass |
| **III. Deliberate Simplicity** | **Zero new dependencies.** Reuses the existing `removeNote` action and the established `.iconbtn` ✕ pattern from ChoiceCard. Small, single-purpose edits; separation of state/presentation preserved. | ✅ Pass |
| **IV. Pure Core, Test-First (NON-NEGOTIABLE)** | Two behavior changes (Clear preserves theme; removeNote closes an open edit form for the removed note) are TDD'd: tests written first and made to fail, then implementation. Pure scoring/arrangement untouched. Suite + `tsc`/`svelte-check` must be green. | ✅ Pass (via TDD) |
| **V. Accessibility by Default** | The control is always visible (never hover/color-only), keyboard-operable with a visible focus ring, 44px target, and a localized aria-label distinct from the row's edit action. This **advances** Principle V and the 006 hardening. | ✅ Pass |

**No violations.** Complexity Tracking is empty.

## Project Structure

### Documentation (this feature)

```text
specs/007-remove-point/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output (no data changes — documents why)
├── quickstart.md        # Phase 1 output (manual acceptance matrix)
├── contracts/           # Phase 1 output (component + store contracts)
│   ├── remove-point.md
│   └── clear-preferences.md
├── checklists/
│   └── requirements.md  # from /speckit-specify (all items pass)
└── tasks.md             # Phase 2 output (/speckit-tasks — NOT created here)
```

### Source Code (repository root)

```text
src/
├── store.svelte.ts          # EDIT: clearDilemma preserves theme; removeNote closes open edit form
├── components/
│   └── NoteRow.svelte       # EDIT: add always-visible ✕ remove button (stopPropagation vs edit)
├── i18n/
│   ├── en.ts                # EDIT: add note.removeAria (authoritative)
│   └── uk.ts                # EDIT: add note.removeAria (mirror — parity test enforces)
└── styles/
    └── app.css              # EDIT: .note layout for the remove control; reuse .iconbtn touch/focus rules

tests/
├── components/
│   ├── store.test.ts        # EDIT/ADD: clearDilemma preserves theme; removeNote-while-editing closes form
│   └── note-row.test.ts     # ADD (or extend): ✕ removes the point; ✕ does not trigger edit; aria-label present
└── unit/                    # i18n parity test already covers the new key (no new file needed)
```

**Structure Decision**: Single-project client-side app — the established 004/006 layout. Pure
core (`scoring`, `view`, `types`, …) is untouched. Changes are confined to the store
(`store.svelte.ts`), one component (`NoteRow.svelte`), the two i18n catalogs, and `app.css`,
exactly mirroring how 006 was scoped.

## Complexity Tracking

> No Constitution violations — no entries.
