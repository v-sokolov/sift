# Implementation Plan: Sift MVP

**Branch**: `001-sift-mvp` | **Date**: 2026-05-30 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/001-sift-mvp/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Sift is a single-page, fully client-side web app for laying 2–4 **choices** side by
side and weighing each with typed, weighted notes, surfacing a quiet live score per
choice. The technical approach is a **no-framework, plain-TypeScript + Vite** static
app built around a single source-of-truth `AppState` with a tiny pub/sub store: every
mutation goes through a typed function, recomputes derived data, and re-renders.
Scoring and note-arrangement are isolated as **pure functions** (trivially unit
testable); persistence is a debounced write to `localStorage`. No backend, no account,
no network — the app loads from static hosting and works offline.

## Technical Context

**Language/Version**: TypeScript 5.x (strict mode), ES2022 target

**Primary Dependencies**: Vite 5+ (dev server + build). No UI framework, no runtime
state library, no CSS framework. Dev-only: Vitest (+ jsdom) for tests.

**Storage**: Browser `localStorage` (single key for the dilemma, plus view prefs).
No backend, no IndexedDB needed at this scale.

**Testing**: Vitest for pure logic (`scoring.ts`, `view.ts`, `persistence.ts`
serialize/deserialize) and light DOM-level tests of render functions via jsdom.

**Target Platform**: Modern evergreen browsers (Chrome, Firefox, Safari, Edge),
desktop and mobile web. Static hosting (any file server / GitHub Pages / Netlify).

**Project Type**: Single-page static web application (frontend only).

**Performance Goals**: Interaction-to-repaint imperceptible (<16ms / one frame) for
edits at this scale; cold load well under 1s on broadband; 60fps scrolling.

**Constraints**: Fully client-side and offline-capable; no account, no network calls,
no third-party runtime dependencies; data never leaves the device; accessible
(weight conveyed by dot-count + color, keyboard-operable form, light/dark legible).

**Scale/Scope**: Single user, single active dilemma, 2–4 choices, tens of notes per
choice. ~4 logic modules + ~6 render functions. No concurrency, no multi-tenancy.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

The project constitution (`.specify/memory/constitution.md`) is currently the
**unmodified template** — no principles have been ratified, so there are no binding
gates to evaluate. **Status: PASS (vacuously — no ratified principles).**

Self-imposed quality gates adopted for this feature (consistent with the spec's calm,
testable intent), honored even absent a formal constitution:

- **Pure-core gate**: All scoring and arrangement logic lives in side-effect-free
  functions with unit tests. PASS by design (`scoring.ts`, `view.ts`).
- **No-framework gate**: No runtime dependencies beyond the platform. PASS.
- **Privacy gate**: No network I/O; all data local. PASS.
- **Accessibility gate**: No information by color alone; keyboard-operable. PASS by FR-031/FR-032.

> If a real constitution is later ratified, re-run `/speckit-plan` (or `/speckit-analyze`)
> to re-evaluate these gates against it.

## Project Structure

### Documentation (this feature)

```text
specs/001-sift-mvp/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md        # Phase 1 output (/speckit-plan command)
├── quickstart.md        # Phase 1 output (/speckit-plan command)
├── contracts/           # Phase 1 output (/speckit-plan command)
│   ├── state-store.md       # Store API + AppState shape
│   ├── scoring.md           # Pure scoring function signatures + invariants
│   ├── view.md              # Pure note-arrangement function signatures
│   └── persistence.md       # localStorage schema, key, versioning, debounce
└── tasks.md             # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

### Source Code (repository root)

```text
index.html               # Vite entry; mounts #app root container
src/
├── main.ts              # Boot: load state, subscribe render, attach delegated listeners
├── state.ts             # AppState type + store: getState(), update(fn), subscribe(cb)
├── persistence.ts       # Debounced save of dilemma + view prefs to localStorage; load on boot
├── scoring.ts           # Pure: choiceScore(choice), forTotal(choice), againstTotal(choice)
├── view.ts              # Pure: arrange(choice, viewPrefs) → ordered/grouped note structure
├── types.ts             # Shared domain types (Note, Choice, Dilemma, ViewPrefs, AppState)
├── ids.ts               # Small id generator (crypto.randomUUID wrapper)
├── render/
│   ├── index.ts         # renderApp(root, state): orchestrates region renders
│   ├── header.ts        # renderHeader — editable dilemma title
│   ├── toolbar.ts       # renderToolbar — add-choice, Group/Sort toggles, Clear, Saved
│   ├── choice.ts        # renderChoice — one choice card (title, rename/remove, notes)
│   ├── note.ts          # renderNote — sign + color + weight dots + text
│   ├── addForm.ts       # renderAddForm — unified add/edit form
│   └── summary.ts       # renderSummary — quiet per-choice score + for/against, leader highlight
└── styles/
    ├── main.css         # Layout, themes (light/dark via prefers-color-scheme + toggle)
    └── tokens.css       # Color/spacing/type tokens, accessible weight colors

tests/
├── unit/
│   ├── scoring.test.ts      # forTotal/againstTotal/choiceScore, neutral exclusion, ties
│   ├── view.test.ts         # default/grouped/sorted ordering, direction, tie→creation order
│   └── persistence.test.ts  # serialize/deserialize round-trip, version migration, bad data
└── dom/
    ├── flow.test.ts         # add choice/note, edit, score updates (jsdom)
    └── lifecycle.test.ts    # clear/confirm, restore-on-reload, min/max choice guards

package.json             # scripts: dev, build, preview, test
tsconfig.json            # strict
vite.config.ts           # Vite + Vitest config (jsdom env for tests)
```

**Structure Decision**: Single-project frontend-only layout (no backend tier, so the
template's web/mobile multi-project options are not used). The split mirrors the design
doc's architecture: a tiny store (`state.ts`), pure logic (`scoring.ts`, `view.ts`),
debounced persistence (`persistence.ts`), and small single-purpose render functions
under `render/`. This keeps the framework-less codebase reasoned-about via a strict
`state → render` discipline, and isolates the only real logic (scoring/arranging) in
pure, unit-testable modules.

## Complexity Tracking

> No constitution violations to justify (no ratified principles). The chosen design is
> deliberately minimal — no framework, no state library, no backend — so there is no
> added complexity requiring justification.
