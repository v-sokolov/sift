# Implementation Plan: Sort Choices by Total & Colour-Code Scores

**Branch**: `018-sort-color-scores` | **Date**: 2026-06-07 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/018-sort-color-scores/spec.md`

## Summary

Two small, independent presentation changes to the existing Svelte board:

1. **Rank (US1)** — an opt-in toolbar checkbox that re-orders Choice cards (and their
   column-aligned score cells) highest-total-first, **display-only** and **persisted**.
2. **Colour-coded scores (US2)** — each Choice's signed total in the Summary is coloured by
   sign (positive / negative / zero), supplementary to the existing +/−/0 text.

Technical approach: add a persisted `rankByTotal: boolean` to `ViewPrefs`, a `toggleRank`
view mutation, and a single **pure** display-order helper `orderedChoices(choices, rank)`
(stable sort by `choiceScore` descending) consumed by **both** `App.svelte` (`.choices`)
and `Summary.svelte` (`.sum`) so the two CSS grids stay column-aligned. Score colour reuses
the existing `--advantage` / `--disadvantage` / `--neutral` palette tokens (defined in both
themes) via a sign-based modifier class on `.sum__score`. **No new runtime dependency** —
native `<input type="checkbox">`, a pure sort, `animate:flip` (reduced-motion-gated), and
CSS only. This deliberately avoids the 013 clean-install failure mode.

## Technical Context

**Language/Version**: TypeScript 5.x (strict)

**Primary Dependencies**: Svelte 5 (runes), Vite 5, Tailwind v4, Bits UI — **no new
runtime dependency added by this feature**

**Storage**: `localStorage` key `sift.v1` (`PersistedV1`); `view` slice gains `rankByTotal`
(additive, defensive default `false`, no `schemaVersion` bump — the 008 `groupKey`
precedent)

**Testing**: Vitest + jsdom; pure units in `tests/unit/*`, component/DOM tests via the local
`tests/svelte.ts` helper in `tests/components/*`

**Target Platform**: Static SPA (modern browsers); GitHub Pages

**Project Type**: Single-project client-side web app (frontend only)

**Performance Goals**: 60 fps reorder animation; trivial — at most `MAX_CHOICES` = 6 items
sorted

**Constraints**: Fully client-side/offline (Principle II); WCAG AA score-colour contrast in
both themes; colour never the sole signal (Principle V); reduced-motion honoured

**Scale/Scope**: 2–6 Choices on one board; ~2 source files of logic + 2 components + CSS +
i18n + tests

## Constitution Check

*GATE: evaluated against Constitution v2.2.0.*

- **I. Calm Over Features** — PASS. Rank is **opt-in, off by default**, and merely orders
  what already exists; no new "winner" verdict beyond today's leader highlight. Colour is a
  quiet sign cue, not a score amplifier. Both reduce scanning effort, aiding reflection.
- **II. Client-Side & Private** — PASS. No backend/network/telemetry; only the existing
  `localStorage` slice gains one boolean. **No new dependency.**
- **III. Deliberate Simplicity** — PASS. One pure helper, one boolean pref, one mutation,
  reuse of existing palette tokens. Pure logic / state / persistence / presentation stay
  separated. YAGNI honoured (display-only; no per-direction option since spec fixed
  descending).
- **IV. Pure Core, Test-First (NON-NEGOTIABLE)** — PASS. `orderedChoices` is pure and
  side-effect-free; written test-first (red→green). Persistence default + `toggleRank`
  invariants covered by tests before implementation.
- **V. Accessibility by Default** — PASS. Score colour is **supplementary** — `signed()`
  keeps the +/−/0 text, so meaning is never colour-only. The Rank control is a native
  checkbox (fully keyboard-operable). Score-colour AA contrast verified in both themes,
  including over the leader-cell background (manual — jsdom has no layout/contrast engine).

**Result**: PASS, no violations → Complexity Tracking left empty.

## Project Structure

### Documentation (this feature)

```text
specs/018-sort-color-scores/
├── plan.md              # This file
├── spec.md              # Feature spec (+ Clarifications 2026-06-07)
├── research.md          # Phase 0 — R1–R7
├── data-model.md        # Phase 1 — ViewPrefs delta
├── quickstart.md        # Phase 1 — setup + manual sweep
├── contracts/
│   └── sort-color-scores.md   # O1–O6 order law, C1–C4 colour, T1–T3 mutation, P1–P2, S1–S3
└── checklists/
    └── requirements.md  # spec quality checklist (from /speckit-specify)
```

### Source Code (repository root)

```text
src/
├── view.ts                      # + orderedChoices(choices, rankByTotal): Choice[]  (pure)
├── scoring.ts                   # choiceScore() reused (unchanged)
├── types.ts                     # ViewPrefs += rankByTotal: boolean
├── store.svelte.ts              # + toggleRank(); emptyDilemma() view default false
├── persistence.ts               # defensive default rankByTotal=false on load
├── components/
│   ├── Toolbar.svelte           # + "Choices" scope label + Rank checkbox + divider + "Points" label
│   └── Summary.svelte           # + sign-based colour class on .sum__score; ordered by Rank
├── App.svelte                   # .choices ordered by orderedChoices(); animate:flip (reduced-motion)
├── styles/app.css               # .sum__score--positive/negative/neutral; .toolbar divider/scope CSS
└── i18n/
    ├── en.ts                    # toolbar.rank, toolbar.scopeChoices, toolbar.scopePoints
    └── uk.ts                    # UA equivalents

tests/
├── unit/
│   ├── view.test.ts             # orderedChoices: desc, stable ties, off=identity, neg<pos, empty/single
│   └── persistence.test.ts      # rankByTotal round-trip + old-payload default false
└── components/
    ├── store.test.ts            # toggleRank flips flag, persists, does NOT touch save-status
    ├── toolbar.test.ts          # Rank checkbox present, placed left of divider, wiring
    └── sort-color.test.ts       # (new) DOM order reflects Rank; .sum__score sign class by +/−/0
```

**Structure Decision**: Reuse the established single-project Svelte layout. Pure logic in
`view.ts`/`scoring.ts`, typed state in `store.svelte.ts`, persistence in `persistence.ts`,
presentation in `components/*` + `App.svelte` + `styles/app.css` — preserving the strict
separation mandated by Principle III. No new directories.

## Complexity Tracking

> No constitution violations — section intentionally empty.
