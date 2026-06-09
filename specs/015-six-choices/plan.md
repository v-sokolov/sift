# Implementation Plan: Extend Choices to Six Options

**Branch**: `015-six-choices` | **Date**: 2026-06-03 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/015-six-choices/spec.md`

## Summary

Raise the per-board Choice cap from 4 to 6 (minimum stays 2) and make the Choice-card
layout wrap onto multiple rows instead of cramming 5–6 ever-narrower columns. The cap is
a single constant (`MAX_CHOICES`, `src/types.ts:97`) consumed by the store mutation guard,
the persistence validator, and the Toolbar's "Add choice n / MAX" control — bumping it to 6
propagates almost everywhere: `'choice.placeholder': 'Choice {n}'` already covers Choices
5–6 in EN and UA, but `'toolbar.maxChoices'` hardcodes "Maximum **4** choices" (disabled
add-button `title`, `en.ts:14`/`uk.ts`) and is parameterized to `'Maximum {n} choices'`
rendered with `MAX_CHOICES` (R5). The layout
fix is **pure CSS** (clarified 2026-06-03, FR-011): inside the existing
`@media (min-width: 720px)` block, count-conditional overrides
`.choices:has(> .choice:nth-child(5))` and `.summary:has(> .sum:nth-child(5))` switch both
grids to `repeat(3, 1fr)` when a 5th Choice exists — 6 wraps 3+3, 5 wraps 3+2, the sibling
`.summary` grid stays column-aligned with the cards, and **no script or markup changes** are
needed (the `--choice-count` var keeps carrying the raw count for the unchanged ≤4 rule;
the `.summary` selector counts `.sum` cells, not bare children, because the formula caption
is also a grid child). Below 720px both grids remain single-column (current mobile behavior
untouched). 2–4-Choice layouts are bit-for-bit identical to today (the override cannot match
them). Additionally (clarified 2026-06-03, FR-012): while the board has **4–6 Choices**, the
Toolbar renders one muted, always-visible hint sentence (new i18n key `toolbar.manyChoices`,
EN/UA) near the Add-choice control — a gentle note that many choices can make a dilemma
harder to feel clear about. Plain text (no tooltip), derived from the live count
(`choices.length >= 4`), informational only, jsdom-testable. Requires a constitution
amendment: the scope-discipline line "2–4 choices" (and Principle IV's invariant example)
re-scopes to 2–6 — exactly the "until explicitly re-scoped" path the constitution provides.

## Technical Context

**Language/Version**: TypeScript 5.x (strict) on Svelte 5 (runes)

**Primary Dependencies**: Svelte 5, Tailwind v4 (via `@theme` in `app.css`), Bits UI (dialog only — untouched here), Vite 5

**Storage**: Browser `localStorage`, versioned key `sift.v1` (format version unchanged; only the accepted choice-count range widens)

**Testing**: Vitest on jsdom; component tests via local `tests/svelte.ts` mount helper + `@testing-library/dom`; no browser runner → rendered geometry (wrap behavior) is verified manually via a resize sweep

**Target Platform**: Static SPA (GitHub Pages), evergreen browsers, offline-capable

**Project Type**: Single-page web app (single project: `src/` + `tests/`)

**Performance Goals**: No measurable change; `animate:flip` reorder stays smooth with 6 cards (same order of magnitude as 4)

**Constraints**: Client-side only (Constitution II); one constant + pure-CSS layout rules (FR-011: no script-computed layout values, no markup restructuring) — no storage-format change; `data-action`/test-hook attributes preserved; `#app` container stays `max-width: 1100px`; `:has()` requires evergreen browsers (already the target; graceful failure mode = today's narrow columns)

**Scale/Scope**: 1 constant, 2 count-conditional CSS rules in `app.css`, 1 Toolbar hint line + 2 i18n strings + 1 hint style, 1 constitution amendment, test additions at the 3/4/5/6/7 boundaries

## Constitution Check

*GATE: evaluated against Constitution v2.1.0. Re-checked after Phase 1 design — PASS with one required amendment (below).*

- **I. Calm Over Features**: PASS. The existing "Add choice" control simply allows two
  more; wrapping *reduces* visual density versus six cramped columns. The only new UI
  surface is the 4+-Choice complexity hint (FR-012), which *embodies* this principle —
  one muted, non-judgmental sentence nudging toward reflective restraint, never blocking
  or scolding (the "too many"-badge-per-card alternative was rejected as judgy noise).
- **II. Client-Side & Private**: PASS. No network, no dependency change, `localStorage`
  only; format version `sift.v1` unchanged.
- **III. Deliberate Simplicity**: PASS. Zero new dependencies, zero new abstractions: a
  constant bump plus two count-conditional CSS rules; no script or markup diff for layout.
- **IV. Pure Core, Test-First**: PASS. Domain logic is untouched; store guard /
  persistence boundary tests extend to 5, 6, and 7 (reject) and are written failing-first,
  before the constant changes. The CSS wrap rule has no jsdom-testable surface (no layout
  engine) — geometry is covered by a manual resize sweep, consistent with 014. ⚠ The
  principle's invariant example reads "e.g. **2–4 choices**" — see amendment note below.
- **V. Accessibility by Default**: PASS. No color-only information added; keyboard paths
  unchanged; wrapped rows keep cards at readable widths (that is the point of FR-006);
  dot-count weights and Esc behavior untouched. The complexity hint is always-visible
  plain text — tooltip-only delivery was explicitly rejected (hover-invisible to keyboard
  and touch users).
- **Scope discipline (Technology & Architecture Constraints)**: ⚠ **CONFLICT → AMENDMENT
  REQUIRED.** The constitution scopes Sift to "a single active dilemma with **2–4
  choices**". This feature is precisely the "explicitly re-scoped" event that line
  anticipates. Resolution: amend the constitution (2.1.0 → **2.2.0**, MINOR — materially
  changed scope guidance): scope line "2–4" → "2–6" and Principle IV's example invariant
  likewise. The amendment is a tracked task and MUST land with (or before) the constant
  change — not by diluting the principle, but by exercising the documented re-scope path.
  (Precedent: the same scope line still says "English only", which 002 re-scoped to EN/UA;
  this amendment corrects the choice-range the same deliberate way.)
- **TDD gate / Build gate**: planned — `tsc`, `vitest`, and `yarn build` against a clean
  install before done (Build gate, v2.1.0).

**Initial Constitution Check: PASS** (with the amendment tracked in Complexity Tracking).
**Post-Phase-1 re-check: PASS** — design introduced no new violations.

## Project Structure

### Documentation (this feature)

```text
specs/015-six-choices/
├── spec.md              # Condensed shipped summary
├── plan.md              # This file
├── research.md          # R1 wrap strategy, R2 container cap, R3 constitution, R4 persistence, R5 hint
├── data-model.md        # Constraint change on Board/Choice count (no shape change)
└── contracts/
    └── choice-layout.md # L1–L6 layout contract, B1–B5 behavior, S1–S3 stability
```

### Source Code (repository root)

```text
src/
├── types.ts                 # MAX_CHOICES 4 → 6 (MIN_CHOICES stays 2); comment on Dilemma.choices "2..4" → "2..6"
├── styles/app.css           # + count-conditional 3-column overrides for .choices/.summary via :has() (≥720px block)
│                            #   + muted .toolbar__hint style for the complexity hint
├── App.svelte               # no change — --choice-count keeps carrying the raw count
├── components/
│   ├── Summary.svelte       # no change — alignment handled by the matching .summary:has() rule
│   ├── Toolbar.svelte       # + complexity hint: renders t('toolbar.manyChoices') when choices.length >= 4
│   │                        #   (always-visible muted text, data-hint="many-choices"; label "… n / MAX" unchanged;
│   │                        #   maxChoices title now passes {n: MAX_CHOICES})
│   └── ChoiceCard.svelte    # no change — MIN_CHOICES gating untouched
├── view.ts                  # no change — layout is CSS-only (clarified 2026-06-03)
├── store.svelte.ts          # no change — addChoice guard reads MAX_CHOICES
├── persistence.ts           # no change — range check reads MIN/MAX_CHOICES
└── i18n/{en,uk}.ts          # + 'toolbar.manyChoices' (EN/UA); 'toolbar.maxChoices' "Maximum 4 choices" →
                             #   parameterized 'Maximum {n} choices'; 'choice.placeholder' already parameterized

tests/
├── unit/persistence.test.ts # + accepts 5 & 6 choices; rejects 7 (and still rejects 1)
├── unit/view.test.ts        # + arrange() Sort/Group ordering parity on a 6-Choice board (SC-004)
├── unit/scoring.test.ts     # + scores/totals/leaders across 6 Choices (SC-004)
└── components/
    ├── store.test.ts        # + addChoice allows 5th & 6th, refuses 7th; removeChoice re-enables;
    │                        #   rename "stops at MAX_CHOICES (4)" test
    ├── toolbar.test.ts      # + 6-cap gating ("n / 6", "Maximum 6 choices" title, placeholders 5–6 EN/UA)
    │                        #   + hint absent at 2–3, present at 4/5/6, EN/UA, add not blocked (SC-005, TDD)
    └── flow.test.ts / i18n.test.ts / lifecycle.test.ts  # update hardcoded "Maximum 4"/4-cap assumptions

.specify/memory/constitution.md  # amendment: scope 2–4 → 2–6; Principle IV example; v2.2.0
```

**Structure Decision**: Existing single-project layout; one constant + CSS-only layout
(two `:has()` rules) + one Toolbar hint line with its i18n strings and hint styling, plus
boundary-test extensions. No new files; markup diff is limited to the Toolbar hint (the
layout itself stays markup-free per FR-011).

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| Constitution scope line says "2–4 choices" (and Principle IV example) | Feature's entire purpose is re-scoping the cap to 6; constitution itself defines re-scoping as the legitimate path ("out of scope **until explicitly re-scoped**") | Ignoring the mismatch would leave the constitution contradicting shipped behavior (as the stale "English only" line already does); diluting/removing the scope line would weaken Principle I's restraint — a targeted amendment (v2.2.0) is the minimal, governed fix |
