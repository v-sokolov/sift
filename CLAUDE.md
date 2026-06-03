<!-- SPECKIT START -->
## Active feature: Confirm Removing a Choice with Points (`016-confirm-remove-choice`)

For technologies, project structure, shell commands, and other context, read the
current implementation plan and its design artifacts:

- Plan: `specs/016-confirm-remove-choice/plan.md`
- Spec: `specs/016-confirm-remove-choice/spec.md` (incl. Clarifications, Session 2026-06-03)
- Research / decisions: `specs/016-confirm-remove-choice/research.md` (R1–R3)
- Contracts: `specs/016-confirm-remove-choice/contracts/remove-confirmation.md` (B1–B6, D1–D4 dialog, S1–S3)
- Quickstart: `specs/016-confirm-remove-choice/quickstart.md` (A1–A3, M1–M6 manual, H1–H3 honesty)
- (No `data-model.md` — no entity/persisted-state change.)

016 guards the ✕ remove control: a Choice with **≥1 point** (any type, incl. neutral-only)
asks before removal; an **empty Choice keeps today's instant one-click removal** (count
read at click time). Mechanism (clarified 2026-06-03, R1): a **shared
`ConfirmDialog.svelte` on Bits UI `Dialog`** — inline/no-portal (012 pattern), reusing the
**014 placement CSS verbatim** (`.modal-overlay` z-100 backdrop + `.modal` fixed/inset-0/
margin-auto/fit-content z-101) plus a narrow `.modal--confirm` modifier; focus-trap, Esc-
decline, outside-click-decline, focus-return, and **background scroll-lock** come from the
primitive (verified 012). **Board Clear migrates onto the same dialog** (FR-010) —
`window.confirm` count goes 1 → 0 (B6: tests assert the spy is never called; AlertDialog
rejected — it blocks outside-click dismissal, which the spec requires as decline). Call
sites own open state (ChoiceCard ✕ gate, Toolbar Clear); `removeChoice`/`clearDilemma`
mutations **unchanged** (decline = never called → no-op incl. no persist notification).
i18n: `confirm.removeChoice` interpolates the display name (`choice.title` or existing
`choice.placeholder`) — EN 'Remove "{name}" and all its points? This can't be undone.' /
UA 'Видалити "{name}" і всі його пункти? Це не можна скасувати.' (no point-count — UA
pluralization, R2) + Cancel/Remove/Clear action labels. No persisted state (FR-008).
Tests (R3, TDD red-first): DOM-driven `tests/components/remove-choice.test.ts` — dialog
buttons, Esc, deep-equal decline no-op (H2), empty-skip, Clear migration incl. negative
`window.confirm` assertion (H3). Placement/scroll-lock geometry manual only (M1/M2/M4 —
jsdom has no layout engine, 014 precedent).

## Prior feature: Extend Choices to Six Options (`015-six-choices`, merged PR #17)

- Spec & artifacts: `specs/015-six-choices/` (spec incl. Clarifications, research R1–R5,
  contracts B1–B5/L1–L6/S1–S3, quickstart; tasks 16/18 — T011/T017 manual sweeps pending)

015 raised the Choice cap **4 → 6** (`MAX_CHOICES`; min 2; constitution re-scoped to
v2.2.0), wrapped 5–6-Choice boards via pure CSS `:has()` overrides (3+2 / 3+3 at ≥720px,
`grid-auto-rows:1fr` equal-height cards, `.summary` mirrored with a `.sum`-scoped selector,
2–4 layouts bit-identical), parameterized `toolbar.maxChoices` to "Maximum {n} choices",
and added the muted **complexity hint** at 4–6 Choices (`data-hint="many-choices"`,
`toolbar.manyChoices` EN/UA — dash later flattened to "-", post-merge copy edit).

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
