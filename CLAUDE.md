<!-- SPECKIT START -->
## Active feature: Group Ordering — Confirm & Document (`009-group-ordering`)

For technologies, project structure, shell commands, and other context, read the
current implementation plan and its design artifacts:

- Plan: `specs/009-group-ordering/plan.md`
- Spec: `specs/009-group-ordering/spec.md` (incl. Clarifications, Session 2026-05-31)
- Research / decisions: `specs/009-group-ordering/research.md` (R1–R3)
- Data model: `specs/009-group-ordering/data-model.md` (no change — restates Section/ordering rules)
- Contracts: `specs/009-group-ordering/contracts/group-ordering.md` (locked `arrange()` ordering)
- Quickstart: `specs/009-group-ordering/quickstart.md` (on-device + test acceptance matrix)

009 is a **regression-protection** pass: it locks Group mode's ordering, which already ships
(008), with explicit fail-first tests and **no expected production code change** (FR-010).
**(US1, P1)** Pin the `arrange()` contract — **Type** → Advantages (weight 3→2→1) → Disadvantages
(3→2→1) → Neutral (creation order); **Weight** → sections 3→2→1→weightless(0), empties omitted,
members creation-order with types mixed; deterministic/stable on re-render; every point in exactly
one section; no mutation. Key nuance (research R2): the "no empty section" guarantee (FR-006) is
enforced in **`arrange`** for Weight mode but in the **renderer** (`ChoiceCard.svelte`) for Type
mode (which returns empty type sections). Work is confined to `tests/unit/view.test.ts`
(strengthen Type full-3→2→1 + Weight full-3→2→1→0 + determinism/purity cases), optionally one
ChoiceCard empty-section test via `tests/svelte.ts`. If a test goes red, it is a genuine regression
to fix per the contract — not a behaviour change.

Prior features: `specs/001-sift-mvp/` (frozen MVP), `specs/008-group-by-dimension/`
(Group by Type/Weight dimension + Add-point above score; merged PR #9),
`specs/002-post-mvp-improvements/`
(UA/EN i18n, suggest-a-feature, footer, README), `specs/003-github-pages-hosting/`
(GitHub Pages deploy), `specs/004-phase2-ui-rebuild/` (Svelte 5 + Tailwind v4 + Bits UI
rebuild; merged PR #5), `specs/005-ui-copy-refinements/` (header intro, score-formula
caption, note→point relabel; merged PR #6), `specs/006-mobile-responsive-ui/` (mobile/
responsive hardening; merged PR #7), `specs/007-remove-point/` (always-visible ✕ remove
control; Clear preserves theme; merged PR #8).

**Stack**: TypeScript 5.x (strict) + Vite 5. MVP (001) and 002/003 are **framework-free**.
Phase-2 (004) rebuilds the UI on **Svelte 5 (runes) + Tailwind v4 + Bits UI** (headless
component lib; chosen over Melt UI because the offline registry lacked it — research R9) —
permitted by **Constitution v2.0.0**
Principle III (minimal, justified runtime deps), still bounded by Principle II (no
backend/network/telemetry; `localStorage` `sift.v1` only). The rebuild **reuses the pure
core verbatim** — `src/{scoring,view,types,ids,mailto,config,persistence}.ts` + `src/i18n/*`
and their `tests/unit/*` (the parity contract) — and replaces only `state.ts` →
`store.svelte.ts` (runes, same mutation API/invariants), `render/*` → `components/*.svelte`
(`bind:value` kills focus loss), `main.ts`, and `styles/*` → `app.css` (Tailwind `@theme`).
Adds dark/light theming w/ pre-paint, headless-primitive keyboard a11y, fluid responsive
layout, reduced-motion-aware Svelte transitions (`animate:flip` on reorder), full
`package.json` metadata + MIT `LICENSE`. Component tests via a local `tests/svelte.ts`
helper (Svelte 5 `mount()` + `@testing-library/dom`) on jsdom (no browser runner). Domain
term for a compared candidate is **Choice**.
<!-- SPECKIT END -->
