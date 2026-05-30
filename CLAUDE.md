<!-- SPECKIT START -->
## Active feature: Mobile & Responsive UI Hardening (`006-mobile-responsive-ui`)

For technologies, project structure, shell commands, and other context, read the
current implementation plan and its design artifacts:

- Plan: `specs/006-mobile-responsive-ui/plan.md`
- Spec: `specs/006-mobile-responsive-ui/spec.md` (incl. Clarifications)
- Research / decisions: `specs/006-mobile-responsive-ui/research.md` (R1–R10)
- Data model: `specs/006-mobile-responsive-ui/data-model.md` (no data changes)
- Contracts: `specs/006-mobile-responsive-ui/contracts/` (responsive, components)
- Quickstart: `specs/006-mobile-responsive-ui/quickstart.md` (on-device acceptance matrix)

006 is a presentation-only mobile/responsive hardening pass on the 004 Svelte stack,
promoting the abstract matrix `specs/004-phase2-ui-rebuild/mobile-responsive-matrix.md`
(M1–M12) into testable requirements. Almost entirely CSS in `src/styles/app.css` plus one
`index.html` attribute (`viewport-fit=cover`): safe-area insets (M6), `100vh`→`100dvh`
(M7), `scroll-margin` keyboard avoidance (M8), 44px touch floor (M4), `@media (hover)`-gated
hover + `:focus-visible` parity so nothing is hover-only (M9), toolbar `flex-wrap` and a
full-width inline add/edit form (per Clarifications). **No new deps; no store/i18n/pure-core
edits; no behavior/data/copy change** (FR-016/FR-017). "Remove point" was considered and
**deferred to a separate feature (007)** with an always-present (never hover-only) ✕.

Prior features: `specs/001-sift-mvp/` (frozen MVP), `specs/002-post-mvp-improvements/`
(UA/EN i18n, suggest-a-feature, footer, README), `specs/003-github-pages-hosting/`
(GitHub Pages deploy), `specs/004-phase2-ui-rebuild/` (Svelte 5 + Tailwind v4 + Bits UI
rebuild; merged PR #5), `specs/005-ui-copy-refinements/` (header intro, score-formula
caption, note→point relabel; merged PR #6).

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
