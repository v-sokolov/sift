<!-- SPECKIT START -->
## Active feature: UI Polish — Toolbar Density, Collapsed-Card Summary & Contrast (`022-ui-polish-density-contrast`)

Six UX polish enhancements — no new runtime dependency, no `AppState`/`sift.v1` change:
**(US1) Toolbar 2-up band** — at 541–800 px toggles lay out 2-per-row (not one-per-row);
Group+Sort wrapped in `.seg.seg--multi` joined multi-select control (T2–T3, M1–M2).
**(US2) Collapsed-card point summary** — new `pointSummary(notes)` pure function in `view.ts`;
`choice__summary` span in `ChoiceCard.svelte` header, shown only when collapsed + non-empty;
count-free "+N −M · ~K" format, null for empty (P1–P8).
**(US3) Empty-card footer** — 0-notes cards render `choice__foot--empty` (no sign tint) with
faint "no points yet" copy; net-zero non-empty cards keep neutral tint (Z1–Z4).
**(US4) AA contrast for real labels** — `choice__scorelabel`, `group-label`, `actbtn`, `saved`
move from `--text-faint` to `--text-muted`; ghost placeholders keep `--text-faint` (K1–K4, M5/M7).
**(US5/US7) CTA colour hierarchy** — three voices: `btn--primary` (blue) for Add-choice + Add-point;
`btn--warm` (amber, new `--warm` token promoted from `--status-editing`) for Suggest trigger + Send;
`btn--danger` (`--disadvantage`) for confirm Remove/Clear; toggle `aria-pressed="true"` softens
to tint recipe; 020 sole-accent regression locks updated (R1–R8, M3–M5, M8).
**(US6) Header hover affordance** — `.choice__head:hover` subtle bg inside pointer-capable media
query; CSS only, manual verification (M6).

- Plan: `specs/022-ui-polish-density-contrast/plan.md`
- Spec: `specs/022-ui-polish-density-contrast/spec.md`
- Research: `specs/022-ui-polish-density-contrast/research.md` (R1–R10: breakpoint, seg-multi, summary derivation, empty footer, contrast audit, warm token, danger variant, tint toggle, bulb filter, boundary)
- Contracts: `specs/022-ui-polish-density-contrast/contracts/ui-polish.md` (T1–T4 toolbar, P1–P8 summary, Z1–Z4 empty state, K1–K5 contrast, R1–R8 colour roles, B1–B6 boundary, M1–M8 manual)
- Data model: `specs/022-ui-polish-density-contrast/data-model.md` (`pointSummary()`, `--warm` token, `.btn--warm/.btn--danger`, modified selectors, 2 i18n keys)
- Quickstart: `specs/022-ui-polish-density-contrast/quickstart.md` (gates + 6-phase walkthrough + M1–M8 manual sweep)

## Just shipped: Scroll, Focus, Collapsible Header & Scrollbar Gutter (`021-scroll-focus-collapse`, merged PR #22)

Four UX polish enhancements — no new runtime dependency, no `AppState`/`sift.v1` change:
scrollbar-gutter stable (G1); autofocus action in `src/actions.ts` (F1–F3); auto-scroll to new
Choice via `$effect`+`tick()` (S1–S3); collapsible tagline in `Header.svelte` at ≤719 px with
`slide` transition, `aria-expanded`, and 2 i18n keys (H1–H6). 226 tests passing.

- Plan: `specs/021-scroll-focus-collapse/plan.md`

## Just shipped: Accordion Choice Cards (`020-accordion-choice-cards`, merged PR #21)

Per-card Bits UI Accordion (header = read-only title + CaretDown chevron Trigger; body =
Points list + Rename/Remove actions row; footer = signed total coloured by sign). Ephemeral
`expanded` record in `store.svelte.ts` outside `AppState`. `signed`/`scoreSign` extracted to
`view.ts`. Summary band hidden (`SHOW_SUMMARY=false`). Grid 1-col/<720·2-up/≥720·3-up/≥1280.
Toolbar regrouped; tagline privacy sentence EN/UA. 214 tests + 4 regression locks.

- Plan: `specs/020-accordion-choice-cards/plan.md`
- Spec: `specs/020-accordion-choice-cards/spec.md`
- Contracts: `specs/020-accordion-choice-cards/contracts/accordion.md` (A1–A6, F1–F4, E1–E6, H1–H5, S1–S2, B1–B4)

## Just shipped: Review & Compact Existing Specs (`019-compact-specs`, merged PR #20)

A **documentation-only** maintenance feature: compact all 17 shipped spec folders (~15k lines)
**in place** with a two-tier treatment — **FREEZE** the cosmetic specs (005, 011) to a single
archived stub; **CONDENSE** the other 15 (cut process scaffolding — `tasks.md`/`checklists/`/
`quickstart.md` — trim prose, remove redundancy vs this `CLAUDE.md` index). A pre-built **anchor
inventory** guarantees zero loss of cross-referenced decision context (FR-007: research `R*`,
contract laws `O*/C*/B*/…`, named patterns like "012 pattern"/"014 placement CSS"/"008 groupKey
precedent", governance amendments). 018 condensed conservatively (still recent); folders kept in
place, 017 gap untouched; diff confined to `specs/**` + this index. No source/test/build/dep change.

- Plan: `specs/019-compact-specs/plan.md`
- Spec: `specs/019-compact-specs/spec.md` (incl. Clarifications, Session 2026-06-09)
- Research / decisions: `specs/019-compact-specs/research.md` (R1–R8: tiering, anchor inventory, stub/marker, git-reversibility)
- Contracts: `specs/019-compact-specs/contracts/compaction.md` (T1–T3 tier, A1–A3 anchor, F1–F3 freeze, C1–C4 condense, S1–S2 banner, B1–B4 boundary)
- Data model: `specs/019-compact-specs/data-model.md` (tier table for all 17 folders + per-tier file-treatment rule)
- Quickstart: `specs/019-compact-specs/quickstart.md` (SC-001 size, SC-002 anchor check, SC-005 source-untouched)

## Prior feature: Sort Choices by Total & Colour-Code Scores (`018-sort-color-scores`, merged PR #19)

- Plan: `specs/018-sort-color-scores/plan.md`
- Spec: `specs/018-sort-color-scores/spec.md` (incl. Clarifications, Session 2026-06-07)
- Research / decisions: `specs/018-sort-color-scores/research.md` (R1–R7)
- Contracts: `specs/018-sort-color-scores/contracts/sort-color-scores.md` (O1–O6 order law, C1–C4 colour, T1–T3 mutation, P1–P2, S1–S3, M1–M5 manual)
- Data model: `specs/018-sort-color-scores/data-model.md` (one field: `ViewPrefs.rankByTotal`)
- Quickstart: `specs/018-sort-color-scores/quickstart.md` (A1–A2, M1–M5 manual, P/H honesty)

018 adds two independent presentation changes. **(US1) Rank** — an opt-in toolbar
**toggle button** (off by default, styled like Group/Sort, label "Rank by score") re-orders
Choice cards highest-total-first, **display-only** (FR-006) and **persisted**. Mechanism: new persisted `rankByTotal: boolean`
on `ViewPrefs` (additive, defensive-default `false` on load — the 008 `groupKey` precedent,
**no `schemaVersion` bump**); new `toggleRank()` view mutation (preference, so it persists
via the channel but does NOT `touch()` save-status, like `toggleGroup`); a single **pure**
helper **`orderedChoices(choices, rankByTotal)`** in `view.ts` (stable sort by `choiceScore`
**desc**, ties by original index; identity when off) consumed by **both** `App.svelte`
(`.choices`) and `Summary.svelte` (`.sum`) so the two column-aligned CSS grids reorder in
lockstep (R2). Placeholder index stays the **stored** index via `indexOf` so untitled
"Choice N" labels don't renumber on sort (R3). Reorder uses `animate:flip`, reduced-motion-
gated (R6). **(US2) Colour-coded scores** — `.sum__score` coloured by sign via a modifier
class reusing the **existing** palette tokens `--advantage`/`--disadvantage`/`--neutral`
(both themes; zero new vars); the old `.sum--leader .sum__score` green override is **removed**
so sign colour wins on the leader cell (leader bg tint kept). Each cell is also tinted by
sign (`.sum--positive/--negative/--neutral`: soft `color-mix` bg + sign-coloured top border,
FR-017); `.sum--leader` is applied last so the top choice stays distinct. `signed()` keeps the +/−/0
text so colour is supplementary (Principle V, FR-011). **No new runtime dependency** (native
toggle button + pure sort + CSS) — deliberately avoids the 013 clean-install failure mode
(unlike 017). Toolbar gains scope labels + divider: `Choices [Rank by score] │ Points
[Group][Sort]` (Add-choice moved to its own row beside the complexity hint). `animate:flip`
needed an `Element.prototype.getAnimations` stub in `tests/setup.ts` (jsdom lacks the Web
Animations API). New i18n: `toolbar.rank`/`scopeChoices`/`scopePoints` (EN/UA). Tests
(R7, TDD red-first): `tests/unit/view.test.ts` (O1–O6), `tests/unit/persistence.test.ts`
(P1–P2), `tests/components/{store,toolbar}.test.ts` (T1–T3, S1–S3), new
`tests/components/sort-color.test.ts` (O2/C1–C4). AA contrast (incl. leader cell), flip
smoothness, reduced-motion, alignment = manual only (M1–M5; jsdom has no layout engine).

## Prior feature: Confirm Removing a Choice with Points (`016-confirm-remove-choice`, merged PR #18)

- Spec & artifacts: `specs/016-confirm-remove-choice/` (spec incl. Clarifications, research
  R1–R3, contracts B1–B6/D1–D4/S1–S3, quickstart; T011 manual sweep M1–M6 pending)

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
