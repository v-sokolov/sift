# Implementation Plan: Accordion Choice Cards

**Branch**: `020-accordion-choice-cards` | **Date**: 2026-06-12 (rev. 2 — header redesign) | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/020-accordion-choice-cards/spec.md`
(clarified three times on 2026-06-12: scope/persistence → Bits UI primitive → header redesign)

## Summary

Turn each Choice card into a three-zone accordion. **Increment 1 (already implemented
on this branch, 207 tests green)**: per-card Bits UI `Accordion` (`Root type="single"`
+ one `Item`), collapsed by default, ephemeral expand state in `store.svelte.ts`
outside `AppState` (auto-expand on `addNote`/`updateNote`/`removeNote`), score footer
with `signed()`/`scoreSign()` extracted to `view.ts`, footer zone tinted like a
`.sum--*` cell, grid `minmax(0,1fr)` overflow fixes. **Increment 2 (this revision —
FR-001 rev/FR-007 rev/FR-013/FR-014)**: header redesign — the chevron `Trigger` sits
at the far right of a **read-only title** (whole header toggles, FR-013); the ✎ and
✕ controls move into the collapsible body as a labeled actions row ("✎ Rename" ·
"✕ Remove", FR-001); **Rename becomes the only entry point** for title editing —
in-place header input, autofocused, Enter/blur commits, Esc cancels and restores
(FR-007); Remove keeps the 016 confirm semantics but now requires expanding first
(FR-014). No persisted-state change of any kind; no new dependency.
**Increment 3 (post-implementation polish, same day — user-directed, CSS/markup/i18n
only)**: footer tinted like a `.sum--*` cell; CaretDown SVG toggle icon (down closed /
180° open) at the header's right edge; board grid re-tiered (1-col <720px, 2-up ≥720px,
3-up ≥1280px, summary mirrored — supersedes 015 wrap); actions row `space-between`
single-line icon+label buttons; header tagline below the brand row + privacy sentence
(EN/UA); accent moved Add-choice → Suggest; toolbar regrouped (Add-choice right of the
views row; settings row = [lang+theme] ⟷ [status+Clear] pairs, two-row stack <475px
with 50%−gap member caps, 50/50 lang toggle, centred status). See spec "Session
2026-06-12 — post-implementation polish" and tasks Phase 8.

## Technical Context

**Language/Version**: TypeScript 5.x (strict)

**Primary Dependencies**: Svelte 5 (runes), Tailwind v4 (via `app.css` tokens), Bits UI
2.18.1 (`Accordion` per card — R1), Vite 5. **No new dependency.**

**Storage**: browser `localStorage` key `sift.v1` — **unchanged**; expand state AND the
new title-edit state are both ephemeral (R2, R9)

**Testing**: vitest + jsdom; component tests via local `tests/svelte.ts` mount helper +
`@testing-library/dom`; layout/contrast/motion checks manual. Increment 2 REWRITES
contracts A1/A4 (they currently lock in the old header) — per Principle IV the test
rewrites land red-first, before the markup change.

**Target Platform**: static SPA (GitHub Pages), modern evergreen browsers, offline-capable

**Project Type**: single-page web app (existing structure: pure core + Svelte components)

**Performance Goals**: fold animation smooth at 60fps on a 6-Choice board; zero impact at boot

**Constraints**: no persisted-schema change; 015 grid semantics / 016 confirm flow /
018 rank-colour behaviour stay intact (B-contracts); reduced-motion honoured; WCAG AA.
Increment 2 migrates the 016 `remove-choice` test selectors (the ✕ moved into the
body) without weakening any 016 assertion.

**Scale/Scope**: 2–6 Choices × dozens of Points; Increment-2 diff confined to
`ChoiceCard.svelte`, `app.css`, `i18n/*`, the affected test files, and these spec docs

## Constitution Check

*GATE: evaluated against Constitution v2.2.0 — PASS (re-evaluated post-design, rev. 2).*

- **I. Calm Over Features — PASS.** The redesign *reduces* header noise: a collapsed
  card is just chevron + name + tinted score. Edit/remove affordances appear only when
  the user opens a card to work on it; destructive actions gain natural friction.
- **II. Client-Side & Private — PASS.** No network, no telemetry, no new dependency;
  expand state and title-edit state are both in-memory only.
- **III. Deliberate Simplicity — PASS.** Increment 2 is markup + one component-local
  boolean (R9) + two i18n keys; it *removes* the always-mounted per-card `<input>` in
  favour of one rendered only while editing. Title-edit state deliberately does NOT go
  into the store — no cross-module consumer exists (YAGNI; contrast R2's expand record,
  which `addNote` must reach).
- **IV. Pure Core, Test-First (NON-NEGOTIABLE) — PASS with explicit sequencing.**
  No pure-logic change in Increment 2 (`renameChoice` reused verbatim). The existing
  A1/A4 tests assert the OLD header; they are rewritten/extended (H1–H5) and MUST fail
  against the current markup before `ChoiceCard.svelte` changes (red → green).
- **V. Accessibility by Default — PASS.** The chevron stays the single accessible
  toggle button (`aria-expanded`; whole-header click is a pointer convenience layered
  on top, R10); the Rename/Remove buttons are real labeled `<button>`s (better than
  today's icon-only ✕); Esc cancels editing with focus returned to Rename (FR-007);
  the read-only title keeps the "Choice N" ghost placeholder so empty states stay
  legible.

No violations → Complexity Tracking left empty.

## Project Structure

### Documentation (this feature)

```text
specs/020-accordion-choice-cards/
├── plan.md              # This file (rev. 2)
├── spec.md              # Clarified ×3, Session 2026-06-12
├── research.md          # R1–R8 (rev.) + R9–R10 (header redesign)
├── data-model.md        # + title-edit state (component-local)
├── quickstart.md        # Updated walkthrough
├── contracts/
│   └── accordion.md     # A* rewritten for the new header; + H1–H5 rename/toggle laws
├── checklists/requirements.md
└── tasks.md             # Increment-1 tasks T001–T020 (done); /speckit-tasks appends Increment 2
```

### Source Code (repository root) — Increment-2 delta

```text
src/
├── components/ChoiceCard.svelte  # MODIFIED — header: Trigger + read-only title (whole
│                                 #   head toggles, R10); title-edit input swap (R9);
│                                 #   body gains .choice__actions row (✎ Rename · ✕ Remove)
├── styles/app.css                # MODIFIED — .choice__name, .choice__actions, head cursor
└── i18n/{en,uk}.ts               # MODIFIED — choice.rename, choice.removeLabel

tests/
├── components/accordion.test.ts     # A1/A4 rewritten; H1–H5 added (red-first)
└── components/remove-choice.test.ts # selector migration: ✕ reached via expanded body
```

**Structure Decision**: unchanged single-project layout; Increment 2 touches one
component, styles, i18n, and two test files.

## Complexity Tracking

*No constitution violations — table intentionally empty.*
