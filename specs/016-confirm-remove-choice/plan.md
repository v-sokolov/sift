# Implementation Plan: Confirm Removing a Choice with Points

**Branch**: `016-confirm-remove-choice` | **Date**: 2026-06-03 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/016-confirm-remove-choice/spec.md`

## Summary

Guard the ✕ remove control: when a Choice holds ≥1 point, ask before destroying it; when
empty, remove instantly as today. **Mechanism (research R1, user-decided): a shared in-app
`ConfirmDialog.svelte` built on Bits UI `Dialog`** — the primitive already proven inline by
`SuggestDialog` (012), reusing the 014-hardened placement CSS (`.modal-overlay` fixed
z-100 backdrop; `.modal` fixed/inset-0/margin-auto/fit-content z-101) plus a narrow
`.modal--confirm` modifier; Bits UI provides focus-trap, Esc-decline, outside-click
dismiss, and **background scroll-lock** out of the box (verified in 012). The **board
Clear confirmation migrates onto the same component** (FR-010), retiring the product's
last `window.confirm` (`Toolbar.svelte:41`). Call sites own their open state: `ChoiceCard`
gates ✕ (`notes.length > 0` → open dialog, else remove instantly), `Toolbar` gates Clear;
confirming calls the **unchanged** `removeChoice`/`clearDilemma` mutations (FR-009),
declining just closes (FR-003 no-op). New i18n: `confirm.removeChoice` message
interpolating the display name (title or existing `choice.placeholder`), plus
Cancel/action button labels. Fully jsdom-testable DOM-first: dialog open/cancel/Esc/
confirm branches asserted on real buttons (TDD; stronger than the spy approach — and
Clear's confirm path gains its first tests).

## Technical Context

**Language/Version**: TypeScript 5.x (strict) on Svelte 5 (runes)

**Primary Dependencies**: none added — Bits UI `Dialog` is already a dependency (012); `alert-dialog` primitive exists in the installed package but is NOT used (R1: `Dialog` is the proven path and outside-click-decline is spec'd)

**Storage**: none — no persisted-state change (`sift.v1` untouched; FR-008 forbids "don't ask again" state)

**Testing**: Vitest + jsdom; DOM-driven — open the dialog via ✕/Clear, click Cancel/confirm buttons, assert state; new `tests/components/remove-choice.test.ts` + Clear-migration cases (the ✕ control and Clear's confirm path currently have no DOM-level tests). jsdom renders the dialog inline (no portal, 012 pattern) so queries work on `container`; placement/scroll-lock geometry is manual (jsdom has no layout engine — 014 precedent)

**Target Platform**: Static SPA (GitHub Pages), evergreen browsers, offline

**Project Type**: Single-page web app (single project: `src/` + `tests/`)

**Performance Goals**: n/a — one synchronous branch in a click handler

**Constraints**: Presentation/interaction-flow only; `data-action="remove-choice"`/`"clear"` hooks and disabled-at-MIN behavior preserved; `.modal`/`.modal-overlay` classes reused per the 014 contract (placement + z-order verified there); domain logic and count invariants (2–6) untouched

**Scale/Scope**: 1 new shared component (~60 lines), 2 call-site edits (ChoiceCard, Toolbar), ~4 i18n strings, 1 small CSS modifier, 1 new test file + Clear-migration tests

## Constitution Check

*GATE: evaluated against Constitution v2.2.0. Re-checked after Phase 1 design — PASS.*

- **I. Calm Over Features**: PASS. Protects user data without adding UI surface for the
  common case (empty cards stay one-click); both destructive actions converge on ONE
  consistent, quiet dialog (replacing jarring native browser chrome) — a consolidation,
  not an addition. No nagging (no prompt repetition state).
- **II. Client-Side & Private**: PASS. No network, no new dependency (Bits UI already
  installed and adopted in 012), no storage change.
- **III. Deliberate Simplicity**: PASS. One shared component reusing a proven primitive
  and proven CSS; the migration RETIRES the second confirmation dialect (`window.confirm`)
  so the codebase ends with fewer patterns than it started with. The dependency is
  already justified and in use — this deepens existing adoption rather than adding
  anything new.
- **IV. Pure Core, Test-First**: PASS. `removeChoice`/`clearDilemma` mutations and all
  invariants unchanged; the gate is presentation-layer state. TDD: the new component
  tests are written first and observed RED (✕ currently removes unconditionally; Clear
  currently calls `window.confirm`).
- **V. Accessibility by Default**: PASS — improved: Bits UI Dialog provides focus-trap,
  Esc, focus-return, and `aria` dialog semantics (already exercised by Suggest); message
  and both actions are plain localized, themed text meeting AA in both palettes; the
  scroll-lock prevents disorienting background movement.
- **TDD gate / Build gate**: planned — red tests → implementation → `tsc` + `vitest` +
  `yarn build` (no dependency changes → clean-install dimension unchanged, re-proven by CI).

**Initial Constitution Check: PASS. Post-Phase-1 re-check: PASS** (no violations, no
Complexity Tracking entries).

## Project Structure

### Documentation (this feature)

```text
specs/016-confirm-remove-choice/
├── plan.md              # This file
├── research.md          # Phase 0 — R1 mechanism, R2 wording, R3 test strategy
├── quickstart.md        # Phase 1 — automated + manual verification
├── contracts/
│   └── remove-confirmation.md  # Phase 1 — B1–B6 behavior contract
└── tasks.md             # Phase 2 (/speckit-tasks — NOT created by /speckit-plan)
(No data-model.md — no entity or persisted-state change; trigger condition reads the
 existing live point count.)
```

### Source Code (repository root)

```text
src/
├── components/
│   ├── ConfirmDialog.svelte # NEW shared confirmation: Bits UI Dialog (inline, no portal —
│   │                        #   012 pattern); props { open, message, confirmLabel, onConfirm,
│   │                        #   onCancel }; Overlay class="modal-overlay"
│   │                        #   data-action="confirm-dialog-backdrop", Content
│   │                        #   class="modal modal--confirm" (014 placement CSS reused);
│   │                        #   message rendered inside Dialog.Title (accessible name — no
│   │                        #   separate title prop); Cancel + destructive-action buttons
│   │                        #   (btn--half pattern, 011);
│   │                        #   data-action="confirm-dialog-{cancel,confirm}" test hooks
│   ├── ChoiceCard.svelte    # ✕ handler: notes.length > 0 → open local ConfirmDialog
│   │                        #   (message = confirm.removeChoice with display name — the
│   │                        #   existing `placeholder` derived covers untitled); onConfirm →
│   │                        #   removeChoice(id); 0 points → removeChoice(id) directly
│   └── Toolbar.svelte       # Clear migrates: window.confirm (line ~41) → ConfirmDialog with
│                            #   the existing confirm.clear message (FR-010)
├── i18n/
│   ├── en.ts                # + 'confirm.removeChoice': 'Remove "{name}" and all its points? This can't be undone.'
│   │                        # + 'confirm.cancel': 'Cancel' + action labels (reuse/add
│   │                        #   'confirm.removeAction': 'Remove', 'confirm.clearAction': 'Clear')
│   └── uk.ts                # + UA mirrors ('Видалити "{name}" і всі його пункти? Це не можна
│                            #   скасувати.', 'Скасувати', 'Видалити', 'Очистити')
├── store.svelte.ts          # no change — removeChoice/clearDilemma mutations untouched (FR-009)
└── styles/app.css           # + .modal--confirm modifier (narrower max-width, e.g. 360px) —
                             #   .modal/.modal-overlay base rules from 014 reused as-is

tests/
└── components/
    └── remove-choice.test.ts  # NEW (TDD, red-first), DOM-driven:
                               #   ✕ on pointed Choice → dialog visible, message contains
                               #     name/placeholder, localized EN/UA; board untouched yet;
                               #   Cancel / Esc / backdrop-click → full AppState deep-equal
                               #     (B2/H2) + subscribePersist counter stays 0;
                               #   confirm → removed + form-cleanup/count behavior intact;
                               #   0 points → no dialog, instant removal;
                               #   neutral-only points still prompt;
                               #   Clear migration: dialog (not window.confirm), decline no-op,
                               #     confirm clears preserving theme+lang (SC-006)
```

**Structure Decision**: Existing single-project layout. One new shared component (the
codebase's second Bits UI Dialog consumer), two call-site edits, i18n strings, one CSS
modifier, one test file. `window.confirm` count goes 1 → 0.

## Complexity Tracking

> No violations — table intentionally empty.
