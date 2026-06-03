<!-- SPECKIT START -->
## Active feature: Extend Choices to Six Options (`015-six-choices`)

For technologies, project structure, shell commands, and other context, read the
current implementation plan and its design artifacts:

- Plan: `specs/015-six-choices/plan.md`
- Spec: `specs/015-six-choices/spec.md` (incl. Clarifications, Session 2026-06-03)
- Research / decisions: `specs/015-six-choices/research.md` (R1–R4)
- Data model: `specs/015-six-choices/data-model.md` (constraint change only)
- Contracts: `specs/015-six-choices/contracts/choice-layout.md` (B1–B4 behavior, L1–L5 layout, S1–S3 stability)
- Quickstart: `specs/015-six-choices/quickstart.md` (A1–A3 automated, M1–M10 manual, H1–H3 honesty)

015 raises the per-board Choice cap **4 → 6** (`MAX_CHOICES`, `src/types.ts:97`; min stays 2),
adds **balanced wrapping** for 5–6 Choices, and adds a **complexity hint at 4–6 Choices**
(FR-012, clarified 2026-06-03): one muted always-visible sentence near the Add-choice control
(`data-hint="many-choices"`, new i18n key `toolbar.manyChoices` EN/UA, visible iff
`choices.length >= 4`, informational only — never blocks adding, no tooltip, no per-card
badge, no persisted/dismissal state; jsdom-testable, SC-005/B5). The cap is a single constant
consumed by the store guard (`store.svelte.ts:136`), the `sift.v1` validator
(`persistence.ts:92`), and the Toolbar "Add choice n / MAX" control — `'choice.placeholder':
'Choice {n}'` already covers Choices 5–6, but **`'toolbar.maxChoices'` hardcodes "Maximum 4
choices"** (`en.ts:14`/`uk.ts`, disabled-button `title` at `Toolbar.svelte:82`) → parameterize
to `'Maximum {n} choices'` (R5). Layout
is **pure CSS** (clarified 2026-06-03, FR-011 — no script-computed layout values, no markup
diff): inside the existing `@media (min-width:720px)` block, count-conditional overrides
`.choices:has(> .choice:nth-child(5))` and `.summary:has(> .sum:nth-child(5))` switch both
grids to `repeat(3,1fr)` → effective columns **2→2, 3→3, 4→4, 5→3 (3+2), 6→3 (3+3)**;
single column <720px; **bit-identical 2–4 layouts** (override can't match <5 cards). ⚠ The
`.summary` selector must count `.sum` cells, not bare children — the formula caption is a
grid child (bare `:nth-child(5)` would falsely wrap a 4-Choice board). `--choice-count`
keeps the raw count for the unchanged base rule; `.summary` sibling-grid alignment holds
because both grids carry matching rules. `#app` stays `max-width:1100px` → six-across
intentionally never renders (R2). **No storage change** (widened range is a strict
superset; 7+ rejected → default board). Requires a **constitution amendment**: scope "2–4
choices" → "2–6" + Principle IV example, v2.1.0 → **v2.2.0** (the documented "explicitly
re-scoped" path). Wrap geometry verified manually (jsdom resolves neither `:has()`-vs-grid
nor track sizing); automated tests cover gating/persistence/lifecycle boundaries only.
Gates: tsc + vitest + clean-install build.

Prior features: `specs/014-fix-dialog-positioning/` (re-styled `.modal` to self-center as a
fixed top-layer element — `position:fixed; inset:0; margin:auto; height:fit-content;
z-index:101` over the `z-index:100` backdrop — fixing 012's Bits UI inline-sibling
regression that dropped the panel below `<Footer />`; Bits UI retained; merged PR #16),
`specs/013-fix-bits-ui-peerdep/` (restored `@internationalized/date` as a **required
`bits-ui` peer dep** that 012 wrongly dropped as "unused", breaking the clean-install build; added the
Constitution **Build gate**, v2.1.0; merged PR #15), `specs/012-review-remediation/` (codebase-health:
adopted Bits UI `Dialog` in `SuggestDialog` rendered **inline/no Portal** + deleted the hand-rolled
focus-trap/Esc/scroll-lock; pre-paint theme FOUC fix via `resolveTheme()` + one `[data-theme="dark"]`
palette; `submitForm` delegates to `addNote`/`updateNote`; removed `SuggestStatus` scaffolding;
committed the constitution; merged PRs #13–#14), `specs/011-suggest-form-css/` (equal-width Cancel/Send via `btn--half` +
`flex:1 1 0`; merged PR #12), `specs/010-save-status-indicator/` (save-status indicator hidden→editing→saved +
header/footer polish; merged PR #11), `specs/001-sift-mvp/` (frozen MVP), `specs/009-group-ordering/` (locked Group-mode
`arrange()` ordering with regression tests; merged PR #10), `specs/008-group-by-dimension/`
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
component lib; chosen over Melt UI because the offline registry lacked it — research R9). Bits UI
was declared in 004 but only **genuinely adopted in 012** (its `Dialog` powers `SuggestDialog`);
it is permitted by **Constitution v2.1.0**
Principle III (minimal, justified runtime deps), still bounded by Principle II (no
backend/network/telemetry; `localStorage` `sift.v1` only). The rebuild **reuses the pure
core verbatim** — `src/{scoring,view,types,ids,mailto,config,persistence}.ts` + `src/i18n/*`
and their `tests/unit/*` (the parity contract) — and replaces only `state.ts` →
`store.svelte.ts` (runes, same mutation API/invariants), `render/*` → `components/*.svelte`
(`bind:value` kills focus loss), `main.ts`, and `styles/*` → `app.css` (Tailwind `@theme`).
Adds dark/light theming (pre-paint FOUC fix landed in 012), headless-primitive keyboard a11y, fluid responsive
layout, reduced-motion-aware Svelte transitions (`animate:flip` on reorder), full
`package.json` metadata + MIT `LICENSE`. Component tests via a local `tests/svelte.ts`
helper (Svelte 5 `mount()` + `@testing-library/dom`) on jsdom (no browser runner). Domain
term for a compared candidate is **Choice**.
<!-- SPECKIT END -->
