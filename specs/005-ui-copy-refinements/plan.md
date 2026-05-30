# Implementation Plan: UI Copy Refinements — Header Intro, Score Formula, "Point" Relabel

**Branch**: `005-ui-copy-refinements` | **Date**: 2026-05-30 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/005-ui-copy-refinements/spec.md`

## Summary

Three presentation-only refinements to the Svelte 5 + Tailwind v4 UI, with no behavior change:

1. **Header intro** — prepend a non-translated wordmark (`Sift`) and a localized tagline above
   the dilemma input, restructuring `<header>` into a vertical stack (`.header__brand` + a
   `.header__bar` wrapping the existing input + tools).
2. **Score-formula caption** — add one full-width muted caption below the per-choice score band
   inside `<section class="summary">`, explaining advantages-minus-disadvantages (neutrals
   excluded).
3. **"note" → "point" relabel** — change the *displayed values* of five umbrella-noun i18n keys
   per catalog (EN "point", UA «пункт»), leaving keys, code identifiers, the
   advantage/disadvantage/neutral type words, and "Choice"/«Варіант» untouched.

Technical approach: add two new i18n keys (`header.tagline`, `summary.formula`) to both catalogs
with verbatim copy, retarget five existing umbrella-noun values, edit two components
(`Header.svelte`, `Summary.svelte`) for markup, extend `src/styles/app.css` with calm/muted
rules for the new elements, and add DOM assertions to `tests/components/i18n.test.ts`. The pure
core, store, scoring, persistence, and all other components are untouched.

## Technical Context

**Language/Version**: TypeScript 5.x (strict) + Svelte 5 (runes) + Tailwind v4 (CSS-first via `@theme` in `app.css`)

**Primary Dependencies**: svelte ^5, @tailwindcss/vite ^4 — no new dependencies added

**Storage**: Browser `localStorage` (`sift.v1`) — unchanged; no data shape change

**Testing**: Vitest + jsdom; local Svelte mount helper (`tests/svelte.ts`); `svelte-check` type-check

**Target Platform**: Static SPA (Vite build), hosted on GitHub Pages; offline-capable

**Project Type**: Single-project client-side web app (no backend)

**Performance Goals**: No regression; static text additions only (no new reactivity hot paths)

**Constraints**: No backend/network/telemetry; WCAG AA contrast in light + dark; no focus-loss; EN/UA catalog parity; copy/markup/CSS only

**Scale/Scope**: 2 new i18n keys, 5 relabeled values per catalog, 2 component edits, 1 CSS section, 2 new DOM tests

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Evaluated against Constitution v2.0.0:

- **I. Calm Over Features** — PASS. Tagline and caption are quiet, muted, understated; they aid
  orientation/trust without pushing number-chasing or declaring a winner. No accent color, no bold.
- **II. Client-Side & Private** — PASS. No backend, network, telemetry, or data egress; no new
  dependency. Pure copy/markup/CSS.
- **III. Deliberate Simplicity** — PASS. Zero new dependencies. Reuses existing i18n catalog,
  `t()` lookup, theming tokens, and component structure. Small, single-purpose edits; separation
  of concerns preserved (pure core/store untouched).
- **IV. Pure Core, Test-First (NON-NEGOTIABLE)** — PASS with discipline note. No domain-logic
  change. New user-facing strings get DOM tests added to `tests/components/i18n.test.ts`; catalog
  parity + "no blank/raw key" tests in `tests/unit/i18n.test.ts` automatically cover the new keys.
  Tests are written before/with the component+catalog edits (red → green).
- **V. Accessibility by Default** — PASS. New text must meet WCAG AA in both themes (verified;
  fall back from `--text-muted` to `--text` if too faint). Wordmark is an `<h1>`; caption is a
  `<p>`. No information conveyed by color alone; no interactive controls added; focus behavior of
  the title input is preserved (new elements are static, no inputs).

**Result: PASS — no violations, Complexity Tracking not required.**

## Project Structure

### Documentation (this feature)

```text
specs/005-ui-copy-refinements/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output (i18n keys + UI-text entities)
├── quickstart.md        # Phase 1 output (verify steps)
├── contracts/           # Phase 1 output (i18n + component UI contracts)
│   ├── i18n.md
│   └── components.md
└── checklists/
    └── requirements.md  # Spec quality checklist (from /speckit-specify)
```

### Source Code (repository root)

```text
src/
├── i18n/
│   ├── en.ts            # EDIT: add header.tagline, summary.formula; relabel 5 umbrella values
│   └── uk.ts            # EDIT: mirror both new keys; relabel 5 umbrella values
├── components/
│   ├── Header.svelte    # EDIT: .header__brand (wordmark + tagline) + .header__bar wrapper
│   └── Summary.svelte   # EDIT: append .summary__formula caption inside <section class="summary">
└── styles/
    └── app.css          # EDIT: Header section (stack + .header__bar + brand/tagline);
                         #       Summary section (.summary__formula)

tests/
├── components/
│   └── i18n.test.ts     # EDIT: assert .header__tagline and .summary__formula localized text
└── unit/
    └── i18n.test.ts     # NO EDIT NEEDED: parity + no-blank/raw-key tests auto-cover new keys
```

**Structure Decision**: Single-project client-side web app. The feature reuses the existing
Svelte component + global-CSS + key-based i18n architecture established in 004; no new
directories, modules, or dependencies are introduced. Edits are confined to two catalogs, two
components, one stylesheet, and one test file. The pure core
(`scoring/view/types/ids/mailto/config/persistence`) and the store are untouched.

## Complexity Tracking

> No Constitution violations. Section intentionally empty.
