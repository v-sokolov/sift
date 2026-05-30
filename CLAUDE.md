<!-- SPECKIT START -->
## Active feature: Remove Point & Preserve Preferences on Clear (`007-remove-point`)

For technologies, project structure, shell commands, and other context, read the
current implementation plan and its design artifacts:

- Plan: `specs/007-remove-point/plan.md`
- Spec: `specs/007-remove-point/spec.md` (incl. Clarifications, Session 2026-05-31)
- Research / decisions: `specs/007-remove-point/research.md` (R1–R8)
- Data model: `specs/007-remove-point/data-model.md` (no data changes; T1/T2 transitions)
- Contracts: `specs/007-remove-point/contracts/` (`remove-point.md`, `clear-preferences.md`)
- Quickstart: `specs/007-remove-point/quickstart.md` (on-device acceptance matrix)

007 is the small follow-up deferred out of 006. Two changes on the 004/006 Svelte stack:
**(US1, P1) Remove a point** — an **always-visible** (never hover-only) ✕ on each point row
wiring the existing `removeNote(choiceId, noteId)` store action; reuses the `.iconbtn` ✕
pattern (44px, `:focus-visible`, `@media (hover)`-gated emphasis from 006); the ✕ must
`stopPropagation` so it does not trigger the row's click-to-edit (FR-010); `removeNote` gains a
guard that closes the edit form if it targets the removed note (FR-011). **(US2, P2) Clear
preserves preferences** — `clearDilemma()` already keeps Language; it is amended to also keep
**Theme** (today it resets theme to `system`). One new i18n key `note.removeAria` (EN/UK
parity). **No new deps; no data-model/scoring/persistence-format change** (FR-014/FR-015); the
one intentional behavior change is Clear preserving theme. TDD per Principle IV: store tests
(clear-preserves-theme; remove-while-editing closes form) + a NoteRow component test (✕ removes,
✕ ≠ edit, aria-label present), written to fail first.

Prior features: `specs/001-sift-mvp/` (frozen MVP), `specs/002-post-mvp-improvements/`
(UA/EN i18n, suggest-a-feature, footer, README), `specs/003-github-pages-hosting/`
(GitHub Pages deploy), `specs/004-phase2-ui-rebuild/` (Svelte 5 + Tailwind v4 + Bits UI
rebuild; merged PR #5), `specs/005-ui-copy-refinements/` (header intro, score-formula
caption, note→point relabel; merged PR #6), `specs/006-mobile-responsive-ui/` (mobile/
responsive hardening; merged PR #7).

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
