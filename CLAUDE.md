<!-- SPECKIT START -->
## Active feature: Codebase-Health Remediation (`012-review-remediation`)

For technologies, project structure, shell commands, and other context, read the
current implementation plan and its design artifacts:

- Plan: `specs/012-review-remediation/plan.md`
- Spec: `specs/012-review-remediation/spec.md` (incl. Clarifications, Session 2026-05-31)
- Research / decisions: `specs/012-review-remediation/research.md` (R1–R8)
- Data model: `specs/012-review-remediation/data-model.md` (transient-state removals; no persisted-schema change)
- Contracts: `specs/012-review-remediation/contracts/{dialog-ui,theme}.md`
- Quickstart: `specs/012-review-remediation/quickstart.md` (A1–A13 automated, M1–M8 manual, H1–H4 honesty)

012 acts on `REVIEW.md` (repo review, commit `9dedf17`). Five threads: (1) **adopt Bits UI's
`Dialog`** in `SuggestDialog` (controlled `open` from the store, rendered **inline / no Portal**,
preserving `.modal`/`.modal-overlay` classes + `data-*` hooks) and delete the hand-rolled focus-trap /
Esc / backdrop / scroll-lock in `App.svelte` + the dialog's focus/scroll `$effect`s — making the
already-declared `bits-ui` dep genuinely **used** (true-by-use). (NB: 012 also removed
`@internationalized/date` as "unused" — but it is a **required `bits-ui` peer dependency**
(`^3.8.1`) once `Dialog` is imported, which broke the clean-install build; **013 restored it**.)
(2) **Pre-paint theme resolution** — inline `<script>` in `index.html`
resolves `sift.v1`→`.view.theme` (system via `matchMedia`) to an **always-explicit**
`data-theme`, killing the FOUC; a new pure `resolveTheme()` (test-first) + a `matchMedia` listener
land in `theme.ts`; the `@media (prefers-color-scheme: dark)` CSS block is **deleted** so the dark
palette lives in **one** `[data-theme="dark"]` block (#4+#5 in one stroke). (3) `submitForm`
**delegates** to `addNote`/`updateNote` (DRY + makes them UI-reachable, #2). (4) Remove write-only
`SuggestStatus`/`SuggestState.status` scaffolding (#3, YAGNI). (5) Governance/doc honesty: **commit
the constitution** (narrow `.gitignore` to un-ignore only `.specify/memory/constitution.md`), fix
the stale `theme.ts` comment + CSS spec-tags, keep `CLAUDE.md` truthful. No persisted-schema change
(`sift.v1` v1). **Out of scope** (review says leave): store snapshot pattern (#6), folder layout,
hand-rolled i18n, `data-*` test attrs, shipped specs, ceremony-scaling levers.

Prior features: `specs/011-suggest-form-css/` (equal-width Cancel/Send via `btn--half` +
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
