<!-- SPECKIT START -->
## Active feature: Suggest-Feature Form Button Layout (`011-suggest-form-css`)

For technologies, project structure, shell commands, and other context, read the
current implementation plan and its design artifacts:

- Plan: `specs/011-suggest-form-css/plan.md`
- Spec: `specs/011-suggest-form-css/spec.md` (incl. Clarifications, Session 2026-05-31)
- Research / decisions: `specs/011-suggest-form-css/research.md` (R1–R4)
- Data model: `specs/011-suggest-form-css/data-model.md` (no entities — presentation-only, no schema change)
- Contracts: `specs/011-suggest-form-css/contracts/ui-presentation.md`
- Quickstart: `specs/011-suggest-form-css/quickstart.md` (test matrix A1–A9; A1–A4 automated, A5–A9 manual)

011 is a **presentation-only** polish of the suggest-a-feature dialog's action row. The two
buttons (Cancel, Send) become equal-width, sharing the row instead of sitting right-aligned at
natural content widths. Implementation: `.modal__actions` keeps its flex `gap`, drops
`justify-content: flex-end`; both action buttons gain a shared **`btn--half`** class and the CSS
rule `.modal__actions .btn--half { flex: 1 1 0; }` (zero basis → equal halves regardless of label
length/language, FR-001/003). Footnote stays **left-aligned** (settled in Clarifications, FR-006).
No store/persistence/i18n/behavior change; `SuggestionDraft`, `canSend`, order (Cancel→Send),
disabled gating, focus, Esc/backdrop close all unchanged. Test-first (Principle IV): jsdom can't
apply CSS or compute layout, so the new `suggest.test.ts` contract asserts the **markup hook**
(two buttons in order, both carry `btn--half`) — fail first, then green; existing suggest
behavior tests are the regression gate; pixel-equality verified manually (quickstart A5–A9).

Prior features: `specs/010-save-status-indicator/` (save-status indicator hidden→editing→saved +
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
