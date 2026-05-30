<!-- SPECKIT START -->
## Active feature: Phase-2 UI Rebuild (`004-phase2-ui-rebuild`)

For technologies, project structure, shell commands, and other context, read the
current implementation plan and its design artifacts:

- Plan: `specs/004-phase2-ui-rebuild/plan.md`
- Spec: `specs/004-phase2-ui-rebuild/spec.md`
- Research / decisions: `specs/004-phase2-ui-rebuild/research.md`
- Data model: `specs/004-phase2-ui-rebuild/data-model.md`
- Contracts: `specs/004-phase2-ui-rebuild/contracts/` (store, components, theming, motion)
- Quickstart: `specs/004-phase2-ui-rebuild/quickstart.md`

Prior features: `specs/001-sift-mvp/` (frozen MVP), `specs/002-post-mvp-improvements/`
(UA/EN i18n, suggest-a-feature, footer, README), `specs/003-github-pages-hosting/`
(GitHub Pages deploy).

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
