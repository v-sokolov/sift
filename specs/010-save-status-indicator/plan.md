# Implementation Plan: Save-Status Indicator & Header/Footer Polish

**Branch**: `010-save-status-indicator` | **Date**: 2026-05-31 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/010-save-status-indicator/spec.md`

## Summary

Two related work streams shipped together on one branch:

1. **Save-status indicator (core)** — Replace today's single, always-"Saved" hint with a three-state
   indicator: **hidden** (default, until the first content edit), **"Editing"** (yellow dot, the
   instant Dilemma/Choice/Point content changes), and **"Saved"** (green dot, after the change is
   stored). The debounce lengthens from 400ms to **2s**. Crucially, **only content changes** (dilemma
   title, choices, points) drive the indicator; **all view preferences** (Language, Theme, Sort,
   Group, Mode, Direction) continue to persist silently and never flip it.

2. **Header/footer presentation pass** — Drop the "Greg McKeown" author credit from the footer
   (keep the *Essentialism* book reference) in both languages; place the existing brand favicon to
   the left of the "Sift" wordmark (decorative); and move the "Suggest a feature" button into the
   brand row, right of the title, with a space-between layout.

**Technical approach (core)**: Add a runtime-only `status: SaveStatus` field to `AppState`
(`'hidden' | 'editing' | 'saved'`), set to `'editing'` inside the eight content mutations, flipped
to `'saved'` by the save-completion callback **only when currently `'editing'`** (so a
preference-triggered save never claims "Saved"), and reset to `'hidden'` by `clearDilemma()` and on
fresh load. `status` is **not** persisted — no `PersistedV1`/schema change (FR-013). The 2s value is
a single constant change in `persistence.ts`. The indicator stays in the existing toolbar status
span; the dot is decorative and the text carries the meaning (Principle V). Presentation changes are
markup/CSS/i18n only.

## Technical Context

**Language/Version**: TypeScript 5.x (strict)

**Primary Dependencies**: Svelte 5 (runes), Vite 5, Tailwind v4, Bits UI — all pre-existing; this
feature adds none (Principle III).

**Storage**: `localStorage` key `sift.v1`, schema `PersistedV1` (`{schemaVersion: 1, dilemma, view}`)
— **unchanged**. The new `status` is runtime/session state, like `lastSavedAt`, `editing`, `draft`,
`suggest` — never serialized.

**Testing**: Vitest on jsdom. Unit tests for the store status transitions (`tests/components/store.test.ts`)
and the debounce constant/behaviour (`tests/unit/persistence.test.ts`); component tests via the
`tests/svelte.ts` mount helper for the indicator rendering (`tests/components/toolbar.test.ts`),
footer copy (`tests/components/i18n.test.ts` or a footer test), and header layout
(a header/flow component test).

**Target Platform**: Static SPA in the browser, offline-capable.

**Project Type**: Single-project client-side web app (Svelte 5 + Vite).

**Performance Goals**: Status reflects a content change within one render frame (Svelte reactivity,
effectively sub-ms); save coalesced to a single write per 2s idle window.

**Constraints**: Fully client-side, no network/telemetry (Principle II); pure scoring/arrangement
untouched (Principle IV); status conveyed by text, not color alone, announced via the existing
polite live region (Principle V).

**Scale/Scope**: One added store field + helper, one constant change, ~3 i18n keys (× 2 langs),
toolbar/header/footer markup + CSS. No new files in `src/` except a small type addition in
`types.ts`. No new dependencies.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **I. Calm Over Features**: PASS — the indicator is a quiet, reassuring signal (calm "Editing" /
  "Saved" wording chosen over an alarming "Unsaved!"); the header/footer pass reduces clutter and
  trims copy. No number-chasing, no winner declaration.
- **II. Client-Side & Private**: PASS — no backend/network/telemetry; `status` lives only in memory
  and is never persisted or sent anywhere; storage key/schema unchanged.
- **III. Deliberate Simplicity**: PASS — zero new dependencies; the change is one typed state field,
  one helper, one constant, and presentation tweaks. Separation of concerns preserved: pure core
  (scoring/arrangement) untouched; persistence stays in `persistence.ts`; state transitions stay in
  the typed store; presentation in components/CSS.
- **IV. Pure Core, Test-First (NON-NEGOTIABLE)**: PASS — no change to pure functions. The behaviour
  change (status transitions, 2s debounce) is in the typed store/persistence layer and is covered
  test-first: tests asserting content-vs-preference transitions and the debounce are written and
  must fail before implementation, then go green. No merge with red tests/types.
- **V. Accessibility by Default**: PASS — status meaning is in the **text label**, the colored dot is
  supplementary (FR-010); green/yellow follow theme tokens and must meet WCAG AA in both themes;
  changes announced via the existing `aria-live="polite"` region (FR-011); the favicon is decorative
  (`aria-hidden`) so it does not double-announce the brand.

**Result**: No violations. Complexity Tracking not required.

### Post-Design Re-check (after Phase 1)

Re-evaluated after the contracts: design keeps `status` runtime-only (no schema bump),
mutates only the typed store, and adds no dependency. All five principles still PASS. No new
violations introduced.

## Project Structure

### Documentation (this feature)

```text
specs/010-save-status-indicator/
├── spec.md              # Condensed shipped summary (what/why/decisions)
├── plan.md              # This file
└── contracts/
    ├── save-status.md   # Status state machine + store/persistence API contract (authoritative)
    └── ui-presentation.md  # Indicator render + header layout + footer copy contract
```

> Condensed 2026-06-09: `research.md` (decisions R1–R8), `data-model.md`, `quickstart.md`,
> `tasks.md`, and `checklists/` were folded into `spec.md` + the contracts and removed.

### Source Code (repository root)

```text
src/
├── types.ts                  # ADD: SaveStatus type; AppState.status field (runtime-only)
├── store.svelte.ts           # ADD: status init 'hidden'; mark 'editing' in the 8 content
│                             #      mutations; setLastSaved flips editing→saved (guarded);
│                             #      clearDilemma → 'hidden'. View mutations untouched.
├── persistence.ts            # CHANGE: DEBOUNCE_MS 400 → 2000
├── i18n/
│   ├── en.ts                 # ADD: 'toolbar.editing'; EDIT: 'footer.inspiredPre/Post'
│   └── uk.ts                 # ADD: 'toolbar.editing'; EDIT: 'footer.inspiredPre/Post'
├── components/
│   ├── Toolbar.svelte        # CHANGE: derive 3-state status; render dot + label (or nothing)
│   ├── Header.svelte         # CHANGE: favicon left of wordmark; move Suggest button into brand row
│   └── Footer.svelte         # (no code change — copy lives in i18n; verify rendering)
└── styles/
    └── app.css               # ADD: .status-dot (+ editing/saved color modifiers); header brand
                              #      row space-between; favicon sizing. Replaces/augments .saved.

tests/
├── components/
│   ├── store.test.ts         # ADD: status transitions (content → editing; view → unchanged;
│   │                         #      setLastSaved guard; clearDilemma → hidden; initial hidden)
│   ├── toolbar.test.ts       # ADD: indicator renders hidden / editing(yellow) / saved(green)
│   ├── i18n.test.ts          # ADD: footer no longer contains author name (both langs)
│   └── flow.test.ts          # ADD (or header test): favicon present + Suggest button in brand row
└── unit/
    └── persistence.test.ts   # ADD/CHANGE: DEBOUNCE_MS === 2000; coalesced single write per window
```

**Structure Decision**: Single-project Svelte SPA. The status state machine lives in the typed store
(`store.svelte.ts`) — the established home for mutations and session-only fields like `lastSavedAt`.
Persistence timing stays in `persistence.ts`. Presentation (dot, header layout) is component + CSS;
copy is i18n. This preserves the constitution's strict separation of pure logic / state / persistence
/ presentation, and confines the core behavioural change to the store + one constant.

## Complexity Tracking

> Not applicable — Constitution Check passed with no violations.
