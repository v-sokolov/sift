<!-- SPECKIT START -->
## Active feature: Save-Status Indicator & Header/Footer Polish (`010-save-status-indicator`)

For technologies, project structure, shell commands, and other context, read the
current implementation plan and its design artifacts:

- Plan: `specs/010-save-status-indicator/plan.md`
- Spec: `specs/010-save-status-indicator/spec.md` (incl. Clarifications, Session 2026-05-31)
- Research / decisions: `specs/010-save-status-indicator/research.md` (R1–R7)
- Data model: `specs/010-save-status-indicator/data-model.md` (`SaveStatus` + runtime `AppState.status`; no schema change)
- Contracts: `specs/010-save-status-indicator/contracts/{save-status,ui-presentation}.md`
- Quickstart: `specs/010-save-status-indicator/quickstart.md` (on-device + test acceptance matrix)

010 is a **UI-polish pass** with two streams. **Stream 1 (save-status indicator, core)**: a
three-state runtime field `status: SaveStatus = 'hidden' | 'editing' | 'saved'` on `AppState`
(NOT persisted — no `PersistedV1`/schema change, FR-013). Set `'editing'` inside the **8 content
mutations** (`setDilemmaTitle`, `addChoice`, `renameChoice`, `removeChoice`, `addNote`,
`updateNote`, `removeNote`, `submitForm` commit); **preference** mutations (lang/theme/sort/group/
mode/direction) and **transient form** mutations MUST NOT touch it. `setLastSaved` flips
`editing→saved` **only when currently `editing`** (guard — so a preference-triggered save never
shows a false "Saved" on an empty board); `clearDilemma`→`hidden`; fresh load→`hidden`. Debounce
`DEBOUNCE_MS` 400→**2000** in `persistence.ts`. Toolbar derives the indicator from `status` (dot is
`aria-hidden`, text label inside the existing `aria-live="polite"` span carries meaning — Principle
V). **Stream 2 (header/footer polish, presentation-only)**: favicon (`public/favicon.svg`,
decorative) left of the "Sift" wordmark; move the `open-suggest` button into the brand row
(space-between, rendered once); drop the "Greg McKeown" author credit from `footer.inspired*` i18n
in EN+UK, keep the *Essentialism* book link. New i18n key `toolbar.editing` (EN/UK). Test-first
(Principle IV): store transitions, debounce, toolbar/header/footer component tests — fail first,
then green.

Prior features: `specs/001-sift-mvp/` (frozen MVP), `specs/009-group-ordering/` (locked Group-mode
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
