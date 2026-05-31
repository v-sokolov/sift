# Implementation Plan: Codebase-Health Remediation (Repo Review Follow-up)

**Branch**: `012-review-remediation` | **Date**: 2026-05-31 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/012-review-remediation/spec.md` (derived from `REVIEW.md`)

## Summary

Act on the actionable findings of the repository review. Five threads: (1) **adopt Bits UI's
`Dialog`** in `SuggestDialog` — making the already-declared `bits-ui` dependency real and the
constitution/CLAUDE.md rationale true-by-use — and delete the hand-rolled focus-trap/Esc/backdrop/
scroll-lock; **remove the unused `@internationalized/date`**; (2) eliminate the theme
flash-of-unstyled-content with a **pre-paint theme resolution**, which also lets the **duplicated
dark-palette CSS collapse to one block**; (3) **de-duplicate the note-commit path** by having
`submitForm` delegate to `addNote`/`updateNote`; (4) **remove the write-only `SuggestStatus`**
scaffolding; (5) governance/doc honesty — **commit the constitution** (narrow `.gitignore`) and
keep `CLAUDE.md` + the two named stale comments honest. Technical approach is detailed in
[research.md](./research.md) (R1–R8); test-first per Principle IV ([R8](./research.md)).

## Technical Context

**Language/Version**: TypeScript 5.9.3 (strict), Svelte 5.55.7 (runes)

**Primary Dependencies**: Svelte 5; **Bits UI 2.18.1** (headless `Dialog` — being adopted);
Tailwind v4 (build). Removing `@internationalized/date` (unused). No new dependency.

**Storage**: `localStorage` key `sift.v1`, schema version **1** — unchanged (no migration).

**Testing**: Vitest 3.2.4 on jsdom; `tests/svelte.ts` mount helper; svelte-check for types.

**Target Platform**: Static SPA (modern browsers), offline-capable, GitHub Pages.

**Project Type**: Single project (web SPA) — existing layout.

**Performance Goals**: Calm UI; the one measurable target is **no theme flash on load** (SC-002).

**Constraints**: Fully client-side, no network/telemetry (Principle II); WCAG AA; 44px touch
floor; no persisted-schema change; behavior of dialog and note add/edit preserved.

**Scale/Scope**: ~1,800 LOC app. Files touched: `index.html`, `src/theme.ts`,
`src/components/SuggestDialog.svelte`, `src/App.svelte`, `src/styles/app.css`,
`src/store.svelte.ts`, `src/types.ts`, `package.json`, `.gitignore`, `CLAUDE.md`,
`.specify/memory/constitution.md` (committed), plus `tests/` updates and one new theme test.

## Constitution Check

*GATE: evaluated against Constitution v2.0.0.*

| Principle | Assessment | Verdict |
|---|---|---|
| **I. Calm Over Features** | Removes a flash on load (calmer first impression); no new features; no number-chasing. | ✅ PASS |
| **II. Client-Side & Private** | No backend/network/telemetry added. Bits UI is a client-only headless lib (no egress); `@internationalized/date` removed. Persistence untouched. | ✅ PASS |
| **III. Deliberate Simplicity** | Net dependency **decrease** (−1); the remaining `bits-ui` becomes *justified by material a11y/maintainability gain* (the exact case the v2.0.0 rationale describes) by replacing a hand-rolled focus-trap with a headless primitive whose markup we own. Removes dead code (#2), write-only scaffolding (#3, YAGNI), and CSS duplication (#5). | ✅ PASS |
| **IV. Pure Core, Test-First** | New `resolveTheme` pure fn gets a failing test first; store invariants and the note-commit behavior preserved and guarded by the existing suite; no merge with failing tests/types. | ✅ PASS |
| **V. Accessibility by Default** | Dialog a11y *improves* (robust, audited focus management/Esc/scroll-lock); dot-count + color weight encoding untouched; Esc-to-close preserved. | ✅ PASS |

**Result**: PASS, no violations → **no Complexity Tracking required**. (Note: this feature also
*commits* the constitution per FR-009, and amends `CLAUDE.md`; the constitution text itself is not
changed, so no version bump is needed.)

## Project Structure

### Documentation (this feature)

```text
specs/012-review-remediation/
├── plan.md              # This file
├── spec.md              # Feature spec (with resolved Clarification)
├── research.md          # Phase 0 — R1–R8 decisions
├── data-model.md        # Phase 1 — type/state deltas (no persisted-schema change)
├── quickstart.md        # Phase 1 — verification matrix (automated + manual)
├── contracts/
│   ├── dialog-ui.md      # SuggestDialog/Bits UI markup + behavior contract
│   └── theme.md          # Pre-paint theme resolution + resolveTheme contract
└── checklists/
    └── requirements.md  # Spec quality checklist
```

### Source Code (repository root) — files this feature touches

```text
index.html                              # + pre-paint theme <script> in <head> (R3)
src/
├── theme.ts                            # + resolveTheme(); applyTheme reworked; matchMedia listener; comment fixed (R3/R7)
├── components/SuggestDialog.svelte     # rebuilt on Bits UI Dialog (R1)
├── App.svelte                          # remove hand-rolled trap/Esc/scroll/focus-return (R1/R2)
├── styles/app.css                      # delete prefers-color-scheme block; drop CSS spec-tags (R3/R7)
├── store.svelte.ts                     # submitForm delegates to addNote/updateNote; drop status:'idle' (R4/R5)
└── types.ts                            # remove SuggestStatus + SuggestState.status (R5)
package.json                            # remove @internationalized/date (R1)
.gitignore                              # narrow .specify/ to un-ignore constitution.md (R6)
CLAUDE.md                               # active-feature → 012; Bits-UI wording true-by-use (R7)
.specify/memory/constitution.md         # now committed (R6) — content unchanged
tests/
├── unit/theme.test.ts                  # NEW — resolveTheme (test-first, R8)
├── unit/store.test.ts (or equiv)       # drop status assertions; addNote/updateNote stay (R5/R8)
└── components/suggest.test.ts          # queries updated to Bits UI DOM; same behavior asserted (R8)
```

**Structure Decision**: Single-project SPA; no new directories. All changes are in-place edits to
existing files plus one new unit test. This is a **substantial** change (per the review's own
ceremony table), so the full artifact package is justified.

## Phase 0 — Outline & Research

Complete → [research.md](./research.md). All decisions resolved (no NEEDS CLARIFICATION remain);
the one spec-level clarification (bits-ui in-or-out) was settled in `spec.md` Clarifications.

## Phase 1 — Design & Contracts

- [data-model.md](./data-model.md) — the `SuggestState`/`SuggestStatus` deltas; confirmation that
  `PersistedV1` (schemaVersion 1) is unchanged.
- [contracts/dialog-ui.md](./contracts/dialog-ui.md) — the markup + behavior contract the rebuilt
  dialog must honor (class hooks, `data-*`, role/aria, focus, Esc, dismiss, scroll-lock).
- [contracts/theme.md](./contracts/theme.md) — `resolveTheme` truth table + the pre-paint /
  attribute-always-explicit contract.
- [quickstart.md](./quickstart.md) — automated + manual verification matrix.
- Agent context: `CLAUDE.md` active-feature section repointed to this plan (done in this phase).

## Complexity Tracking

No constitution violations — not applicable.
