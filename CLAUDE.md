<!-- SPECKIT START -->
## Active feature: Group by Dimension & Add-Point Placement (`008-group-by-dimension`)

For technologies, project structure, shell commands, and other context, read the
current implementation plan and its design artifacts:

- Plan: `specs/008-group-by-dimension/plan.md`
- Spec: `specs/008-group-by-dimension/spec.md` (incl. Clarifications, Session 2026-05-31)
- Research / decisions: `specs/008-group-by-dimension/research.md` (R1–R10)
- Data model: `specs/008-group-by-dimension/data-model.md` (additive `groupKey`; widened `Section.label`)
- Contracts: `specs/008-group-by-dimension/contracts/` (`arrange-grouping.md`, `group-toolbar.md`, `addpoint-order.md`)
- Quickstart: `specs/008-group-by-dimension/quickstart.md` (on-device acceptance matrix)

008 fixes the Group control + a small layout nudge, on the 004/006/007 Svelte stack.
**(US1, P1) Group by dimension** — Group mode wrongly showed an **Asc/Desc** control and
hardcoded grouping by type. Add `ViewPrefs.groupKey: 'type' | 'weight'` (default `'type'`) +
`setGroupKey()`, and rewrite the `grouped` branch of pure `arrange()`: **type** → Adv/Disadv/
Neutral (weighted sections heaviest-first, neutral creation-order — the prior default);
**weight** → sections per weight 3→2→1 (mixing types) + a trailing weightless/neutral section,
all creation-order. `Section.label` widens to `NoteType | Weight | 'weightless' | null`. Toolbar's
grouped row shows a **Type/Weight** `.seg` (reusing `toolbar.type`/`toolbar.weight`) instead of
Asc/Desc; **Sort mode unchanged**. New i18n: `toolbar.groupBy`, `toolbar.groupKeyAria`,
`group.weight` (`Weight {n}`), `group.weightless` (EN/UK parity). Persistence is additive — missing/
invalid `groupKey` defaults to `'type'` on load, **no `schemaVersion` bump** (like `lang`).
**(US2, P2) Add point above score** — swap `<Summary/>` and `<AddEditForm/>` order in `App.svelte`.
**No new deps; no scoring/data-model change** (FR-015). TDD per Principle IV: `view.test.ts` grouped
cases migrated to the `groupKey` contract + new By-Weight cases; persistence default-on-load test;
Toolbar component test (Group shows Type/Weight not Asc/Desc) — all written to fail first.

Prior features: `specs/001-sift-mvp/` (frozen MVP), `specs/002-post-mvp-improvements/`
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
