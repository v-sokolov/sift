# Implementation Plan: Review & Compact Existing Specs

**Branch**: `019-compact-specs` | **Date**: 2026-06-09 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/019-compact-specs/spec.md`

## Summary

Compact all 17 shipped spec folders (~15,000 lines) **in place** with a two-tier treatment:
**FREEZE** the two cosmetic specs (005, 011) to a single archived stub, and **CONDENSE** the
other 15 — cutting process scaffolding, trimming prose, and removing redundancy against
`CLAUDE.md` — while a pre-built **anchor inventory** guarantees no cross-referenced decision
context is lost (FR-007). Documentation-only: zero source/test/build/dependency changes.
Technical approach and tier map are fixed in `research.md` (R1–R8) and `data-model.md`.

## Technical Context

**Language/Version**: N/A — Markdown documentation only (repo is TypeScript 5.x + Vite/Svelte 5,
untouched here).

**Primary Dependencies**: None added/changed (FR-005).

**Storage**: N/A (no persisted state touched).

**Testing**: No new tests. Verification is grep/git/line-count + a human readability pass
(`quickstart.md`); existing `vitest`/`vite build` remain green as an unaffected no-op.

**Target Platform**: Repository `specs/` tree.

**Project Type**: Single project — documentation maintenance within the existing repo.

**Performance Goals**: SC-001 — reduce `specs/**` line count by ≥ 50% (~15k → ≤ ~7.5k).

**Constraints**: FR-007 (zero anchor loss) is the hard invariant; diff confined to `specs/**`
plus the `CLAUDE.md` SPECKIT pointer (FR-005/B1); folders kept in place, 017 gap untouched.

**Scale/Scope**: 17 folders, ~120 markdown files; 2 FREEZE, 15 CONDENSE.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Evaluated against Constitution v2.2.0:

- **I. Calm Over Features** — N/A (no product feature). The change *removes* clutter, aligned in
  spirit with restraint. ✅
- **II. Client-Side & Private** — No backend/network/telemetry/data egress; docs only. ✅
- **III. Deliberate Simplicity** — Directly advances it: "no dead code", small/legible artifacts,
  YAGNI on process scaffolding. The whole feature is a simplification. ✅
- **IV. Pure Core, Test-First** — Not applicable: no domain logic, no behaviour change, nothing
  to type-check or red-green. Asserting the TDD gate over a docs edit is vacuous; `research.md`
  R8 records this. No violation. ✅ (gate inapplicable)
- **V. Accessibility by Default** — N/A (no UI). ✅
- **Build gate** — No build input changes; build remains green as a no-op sanity check, not a gate
  this work can fail. ✅
- **Workflow** — This follows specify → plan → tasks → implement and will be cross-checked by
  `/speckit-analyze`. ✅

**Result**: PASS. No violations; Complexity Tracking not required. The only gate-shaped nuance
(TDD/Build inapplicability) is justified in R8, not a deviation needing Complexity Tracking.

## Project Structure

### Documentation (this feature)

```text
specs/019-compact-specs/
├── plan.md              # This file
├── spec.md              # Feature spec (what/why)
├── research.md          # R1–R8 (tiering, anchor inventory, stub/marker, reversibility)
├── data-model.md        # Tier classification table for all 17 folders + file-treatment rule
├── contracts/
│   └── compaction.md    # Laws T1–T3, A1–A3, F1–F3, C1–C4, S1–S2, B1–B4
├── quickstart.md        # Verification commands for SC-001..005
└── checklists/
    └── requirements.md  # Spec quality checklist (all pass)
```

### Target of the change (repository root)

```text
specs/                   # the compaction operates here, in place
├── 001-sift-mvp/ … 016-confirm-remove-choice/, 018-sort-color-scores/
│                        # 15 CONDENSE (trim + drop tasks/checklists/quickstart),
│                        # 2 FREEZE (005, 011 → single archived stub)
CLAUDE.md                # canonical index — NOT compacted; only SPECKIT pointer updated,
                         # plus any reference fix required by FR-010 (none expected)
.specify/memory/constitution.md  # untouched; independently preserves 013/015 governance
```

**Structure Decision**: No source structure involved. Work is confined to editing/removing
markdown under `specs/**` in place per the `data-model.md` tier map, plus the mandatory
`CLAUDE.md` SPECKIT-block pointer update. Order of operations (for `/speckit-tasks`): (1) build
anchor inventory → (2) FREEZE the 2 stubs → (3) CONDENSE the 15 (anchors-defining files first) →
(4) verify A2/SC-002 + B1 + line-count.

## Complexity Tracking

> Not applicable — Constitution Check passed with no violations.
