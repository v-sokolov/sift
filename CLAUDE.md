<!-- SPECKIT START -->
## Active feature: Fix Suggest-Dialog Positioning (`014-fix-dialog-positioning`)

For technologies, project structure, shell commands, and other context, read the
current implementation plan and its design artifacts:

- Plan: `specs/014-fix-dialog-positioning/plan.md`
- Spec: `specs/014-fix-dialog-positioning/spec.md` (incl. Clarifications, Session 2026-05-31)
- Research / decisions: `specs/014-fix-dialog-positioning/research.md` (R1–R4)
- Contracts: `specs/014-fix-dialog-positioning/contracts/dialog-positioning.md` (P1–P6 layout, S1–S3 stacking)
- Quickstart: `specs/014-fix-dialog-positioning/quickstart.md` (A1–A3 automated, M1–M9 manual, H1–H3 honesty)
- (No `data-model.md` — presentation-only fix.)

014 fixes a **visual regression from 012**: Bits UI's `Dialog` renders `Dialog.Overlay`
(`.modal-overlay`) and `Dialog.Content` (`.modal`) as **inline siblings**, but the CSS
(`src/styles/app.css:686–712`) assumes `.modal` is the *child* of a flex-centering `.modal-overlay`
(panel only `position: relative`). With no flex parent, the panel drops into normal page flow (below
`<Footer />`) and the backdrop is an empty dim layer → mis-positioned/mis-stacked on all breakpoints.
**Fix (decided over revert):** re-style `.modal` to self-center as its own fixed, top-layer element —
`position: fixed; inset: 0; margin: auto; height: fit-content; z-index: 101` — keeping
`width:100%; max-width:460px; max-height:90dvh; overflow:auto`; `.modal-overlay` stays the fixed
`z-index:100` backdrop. **Bits UI retained** (no revert; 012's focus-trap/Esc/outside-click/scroll-lock/
focus-return preserved). **Presentation-only**: CSS (and markup only if strictly needed), no domain/
scoring/arrangement/persisted-state (`sift.v1` v1) change; `.modal`/`.modal-overlay` classes + `data-*`
test hooks preserved (FR-009). Breakpoint-agnostic (no media query targets the modal). Layout verified
manually (jsdom has no layout engine); behavior/contract tests stay green.

Prior features: `specs/013-fix-bits-ui-peerdep/` (restored `@internationalized/date` as a **required
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
