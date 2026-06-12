# Implementation Plan: Group by Dimension & Add-Point Placement

**Branch**: `008-group-by-dimension` | **Date**: 2026-05-31 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/008-group-by-dimension/spec.md`

## Summary

Two changes on the 004/006/007 Svelte 5 + Tailwind v4 stack:

- **US1 (P1) — Group by dimension.** Group mode currently hardcodes grouping by note **type** and
  surfaces an **Asc/Desc** direction control that doesn't belong to grouping. Add a single new view
  preference `groupKey: 'type' | 'weight'` (default `'type'`) and rewrite the `grouped` branch of
  the pure `arrange()` to section by the chosen dimension: **type** → Advantages/Disadvantages/
  Neutral (prior behaviour, weighted sections heaviest-first, neutral in creation order); **weight**
  → one section per weight value (3→2→1) plus a trailing neutral/weightless section, each section
  in creation order. The Toolbar's grouped config row shows a **Type/Weight** segment (reusing the
  existing `toolbar.weight`/`toolbar.type` labels) instead of the Asc/Desc segment. **Sort mode is
  untouched.** Persistence accepts the new field and defaults a missing one to `'type'` exactly as
  `lang` is defaulted today (no schema-version bump).

- **US2 (P2) — Add-point placement.** Swap the render order of `<Summary />` and `<AddEditForm />`
  in `App.svelte` so the Add-point control (and the form it expands into) sits **above** the score.

**Approach**: pure-core-first per Principle IV — `arrange()` and persistence are pure/typed and get
fail-first unit tests; the Toolbar and App changes are presentation. No new runtime deps. No change
to the scoring formula or the note data model.

## Technical Context

**Language/Version**: TypeScript 5.x (strict), Svelte 5 (runes), Vite 5

**Primary Dependencies**: Svelte 5, Tailwind v4, Bits UI (no new deps added by this feature)

**Storage**: browser `localStorage`, key `sift.v1`, `schemaVersion: 1` (unchanged — additive field
only, defaulted on load)

**Testing**: Vitest (jsdom). Pure unit tests in `tests/unit/`; component/store tests in
`tests/components/` via the local `tests/svelte.ts` mount helper. Offline sandbox → run
`node_modules/.bin/{vitest,svelte-check,vite}` directly.

**Target Platform**: static SPA (modern browsers, mobile + desktop), offline-capable

**Project Type**: single-project client-side SPA

**Performance Goals**: re-section/re-render on a dimension toggle is visually instant (<1s, SC-005);
no perceptible jank.

**Constraints**: fully client-side, no network/telemetry (Principle II); WCAG AA, keyboard-operable
focus-visible segmented control, ≥44px targets consistent with existing toolbar segments
(Principle V / FR-017).

**Scale/Scope**: a single dilemma, 2–4 choices, a handful of points each; EN + UK catalogs.

## Constitution Check

*GATE: evaluated against Constitution v2.0.0.*

- **I. Calm Over Features** — PASS. No new surface area; it fixes a confusing control and removes a
  mismatched one (Asc/Desc out of Group). Group-by-weight is a quiet reorganisation of existing
  data, not a new feature axis. US2 is a layout nudge.
- **II. Client-Side & Private** — PASS. Pure-local; no network, account, or egress. Persistence
  stays in `localStorage`.
- **III. Deliberate Simplicity** — PASS. Zero new dependencies. One new enum field on `ViewPrefs`;
  one rewritten branch in `arrange()`; reuses existing i18n labels and the existing `.seg`
  segmented-control pattern. YAGNI honoured: only `type`/`weight` dimensions, no extra config.
- **IV. Pure Core, Test-First (NON-NEGOTIABLE)** — PASS by construction. `arrange()` and the
  persistence validator/defaulting are pure; new behaviour gets unit tests written to fail first
  (existing `tests/unit/view.test.ts` grouped cases are updated to the new contract; new By-Weight
  cases added). No merge with failing tests/`svelte-check`.
- **V. Accessibility by Default** — PASS. The Type/Weight grouped control reuses the existing
  segmented-button pattern (role=group, `aria-pressed`, focus-visible, 44px). Weight is still shown
  by dot count, not colour; By-Weight section labels are text. Nothing conveyed by colour alone.

**Result**: PASS — no violations; Complexity Tracking not required.

## Project Structure

### Documentation (this feature)

```text
specs/008-group-by-dimension/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── spec.md              # Condensed shipped spec (2026-06-09)
└── contracts/           # Phase 1 output (arrange-grouping.md, group-toolbar.md, addpoint-order.md)
```

### Source Code (repository root)

```text
src/
├── types.ts                    # + GroupKey type; ViewPrefs gains `groupKey`
├── view.ts                     # arrange(): rewrite the `grouped` branch to section by groupKey
├── persistence.ts              # validView stays lenient; load() defaults missing groupKey → 'type'
├── store.svelte.ts             # emptyDilemma().view.groupKey = 'type'; + setGroupKey() mutation
├── i18n/
│   ├── en.ts                   # + toolbar.groupKeyAria, toolbar.groupBy, group-by-weight labels
│   └── uk.ts                   # mirror keys (parity)
├── components/
│   ├── Toolbar.svelte          # grouped config row: Type/Weight segment instead of Asc/Desc
│   └── ChoiceCard.svelte       # render weight-section labels (extend GROUP_KEY label lookup)
└── App.svelte                  # swap <Summary/> and <AddEditForm/> order

tests/
├── unit/
│   ├── view.test.ts            # update grouped cases to groupKey contract; add By-Weight cases
│   └── persistence.test.ts     # add: missing/invalid groupKey loads & defaults to 'type'
└── components/
    ├── toolbar.test.ts (new or extend)  # Group shows Type/Weight not Asc/Desc; toggles groupKey
    └── (App order asserted via existing component harness)
```

**Structure Decision**: Single-project client SPA — the established Sift layout. This feature edits
existing files only; it adds no new module. Pure logic (`view.ts`), state (`store.svelte.ts`),
persistence (`persistence.ts`), and presentation (`components/*`, `App.svelte`) stay separated per
Principle III.

## Complexity Tracking

No constitution violations — section intentionally empty.
