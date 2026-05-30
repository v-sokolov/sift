<!-- SPECKIT START -->
## Active feature: UI Copy Refinements (`005-ui-copy-refinements`)

For technologies, project structure, shell commands, and other context, read the
current implementation plan and its design artifacts:

- Plan: `specs/005-ui-copy-refinements/plan.md`
- Spec: `specs/005-ui-copy-refinements/spec.md`
- Research / decisions: `specs/005-ui-copy-refinements/research.md`
- Data model: `specs/005-ui-copy-refinements/data-model.md`
- Contracts: `specs/005-ui-copy-refinements/contracts/` (i18n, components)
- Quickstart: `specs/005-ui-copy-refinements/quickstart.md`

005 is a presentation-only change on the 004 Svelte stack: a header wordmark+tagline
intro, a muted score-formula caption under the score band, and a "note"→"point" /
«нотатка»→«пункт» umbrella-noun relabel (display values only). No new deps, no behavior
or data-shape change.

Prior features: `specs/001-sift-mvp/` (frozen MVP), `specs/002-post-mvp-improvements/`
(UA/EN i18n, suggest-a-feature, footer, README), `specs/003-github-pages-hosting/`
(GitHub Pages deploy), `specs/004-phase2-ui-rebuild/` (Svelte 5 + Tailwind v4 + Bits UI
rebuild; merged PR #5).

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
