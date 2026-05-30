---
description: "Task list for Phase-2 UI Rebuild"
---

# Tasks: Phase-2 UI Rebuild

**Input**: Design documents from `/specs/004-phase2-ui-rebuild/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Test tasks ARE included — Constitution IV (Pure Core, Test-First) is NON-NEGOTIABLE.
The pure core (`src/{scoring,view,types,ids,mailto,config,persistence}.ts`, `src/i18n/*`) and
its `tests/unit/*` are **reused verbatim** (the parity contract, research R1); the old
`tests/dom/*` suites are **ported** to `tests/components/*` using a local `tests/svelte.ts`
helper (Svelte 5 `mount()` + `@testing-library/dom`; `@testing-library/svelte` is unavailable
on the offline mirror — see T002/T006), and `theme` + `a11y` + reduced-motion tests are added.

**Organization**: Tasks grouped by user story (priority order P1 → P6). Domain term for a
compared candidate is **Choice**.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: US1–US6
- Exact file paths included.

## Path Conventions

Single client-side web app at repo root. **Frozen (reused, do NOT edit)**:
`src/{types,scoring,view,ids,mailto,config,persistence}.ts`, `src/i18n/*`, `tests/unit/*`.
**Replaced**: `src/state.ts` → `src/store.svelte.ts`; `src/render/*` → `src/components/*.svelte`;
`src/main.ts`; `src/styles/*` → `src/styles/app.css`; `tests/dom/*` → `tests/components/*`.
**Added**: `src/theme.ts`, `index.html` pre-paint, `LICENSE`, `package.json` metadata.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Bring Svelte 5, Tailwind v4, and the component-test harness into the toolchain.

- [X] T001 Install runtime deps with yarn: `yarn add svelte bits-ui @internationalized/date`. **Offline adaptation**: `@melt-ui/svelte` is not on the only reachable registry (the Wix mirror; public npm is blocked by a GlobalProtect content filter), so we use **Bits UI** — the documented research-R3 fallback (component-API, less wiring). `@internationalized/date` is a bits-ui peer.
- [X] T002 Install dev deps with yarn: `yarn add -D @sveltejs/vite-plugin-svelte@^4 @tailwindcss/vite tailwindcss svelte-check @testing-library/dom @testing-library/jest-dom @testing-library/user-event`. **Offline adaptations**: `@testing-library/svelte` is not on the mirror → use Svelte 5's built-in `mount()` + the cached `@testing-library/{dom,jest-dom,user-event}` via a local `tests/svelte.ts` helper (T006). `@sveltejs/vite-plugin-svelte` pinned to `^4` (peer `vite ^5` + `svelte ^5`) so we stay on Vite 5 (003 deploy unaffected). Resolved: svelte 5.55.7, bits-ui 2.18.1, tailwindcss 4.3.0, @tailwindcss/vite 4.3.0, vite-plugin-svelte 4.0.4, svelte-check 4.4.8.
- [X] T003 Update `vite.config.ts`: add `svelte()` (from `@sveltejs/vite-plugin-svelte`) and the `@tailwindcss/vite` plugin; **preserve** the env-guarded `base: process.env.GITHUB_PAGES ? '/sift/' : '/'` (feature 003) and the Vitest config `{ environment: 'jsdom', include: ['tests/**/*.test.ts'] }`; add `test.setupFiles: ['tests/setup.ts']`. **Svelte-5-in-jsdom gotcha**: also set `resolve.conditions: ['browser']` (and, if components still fail to mount, `test.server.deps.inline` for the svelte/Melt packages) so `@testing-library/svelte` mounts Svelte 5 components under jsdom.
- [X] T004 [P] Update `package.json` scripts: keep `dev`/`preview`; set `build` to `svelte-check && vite build` and `check` to `svelte-check --tsconfig ./tsconfig.json`; keep `test`/`test:watch`. **Do not** re-add `tsc --noEmit` — `svelte-check` is the complete type gate (it checks both `.ts` and `.svelte`), and running plain `tsc` over a tsconfig that includes `.svelte` would fail.
- [X] T005 [P] Update `tsconfig.json` for Svelte: ensure `moduleResolution: "bundler"`, include `src/**/*.svelte`, and add Svelte/Vite client types as needed so `svelte-check` and editor resolve `.svelte` modules.
- [X] T006 Create `tests/setup.ts` (import `@testing-library/jest-dom/vitest`) and `tests/svelte.ts` — a local `render(Component, props)` helper using Svelte 5's `mount`/`unmount` + a fresh container, returning `@testing-library/dom` `within(container)` queries, plus `afterEach` cleanup (replaces `@testing-library/svelte`, which the mirror lacks).

**Checkpoint**: `yarn check` runs (no Svelte resolution errors) and `yarn test` still runs the
existing `tests/unit/*` green.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: The runes store, the Tailwind token layer, and the app mount + persistence boot —
required before ANY component/story can be built. Pure core is reused unchanged.

- [X] T007 [P] Create `src/styles/app.css`: `@import "tailwindcss";` plus an `@theme` block migrating the semantic design tokens from `src/styles/tokens.css` (define the token names + light/default values now; dark values land in US2). This becomes the single CSS entry.
- [X] T008 Write store invariant tests in `tests/components/store.test.ts` (TDD — must fail first): choices stay within 2..4 (`addChoice` no-op at 4, `removeChoice` no-op at 2), `neutral ⇒ weight null` else default 3, `submitForm` new-stays-open / edit-closes, `clearDilemma` preserves `view.lang`, `initLang`/`setLastSaved` are render-only.
- [X] T009 Implement `src/store.svelte.ts` (Svelte 5 runes): `$state`-backed `AppState` + **all** mutation functions ported from `src/state.ts` with identical names/signatures/invariants (per `contracts/store.md`), plus a persistence-notify channel equivalent to `subscribePersist`; then delete `src/state.ts`. Make T008 pass.
- [X] T010 Create `src/App.svelte` (region layout importing the store) and replace `src/main.ts`: mount `App`; boot sequence = `load()` → `setState` (fallback `emptyDilemma()`), subscribe persistence → `scheduleSave` + `setLastSaved`, `installUnloadFlush`, detect language → `initLang` (render-only). No imperative DOM rendering remains.
- [X] T011 Verify foundation: `yarn check` clean; `yarn test` green (unchanged `tests/unit/*` + new store tests); `yarn dev` mounts the shell without errors.

**Checkpoint**: Store + mount + token layer in place; pure core + its tests intact.

---

## Phase 3: User Story 1 - The same tool, with nothing lost (Priority: P1) 🎯 MVP

**Goal**: Full functional parity on Svelte — create/choices/notes/Group/Sort/score/Clear,
suggest→mailto, i18n, footer — with **no focus loss** while typing and existing saved boards
loading intact.

**Independent Test**: The ported `tests/components/{flow,lifecycle,suggest,i18n}` pass with
identical behavior to the old `tests/dom/*`; typing continuously in title/choice/note never
loses focus/caret; a board saved by the current app loads unchanged.

### Tests for User Story 1 (TDD — write first, port from tests/dom/*)

- [X] T012 [P] [US1] Port `tests/dom/flow.test.ts` → `tests/components/flow.test.ts` (create dilemma → add/name up to 4 choices → add/edit/remove notes → Group/Sort → score) via `@testing-library/svelte`.
- [X] T013 [P] [US1] Port `tests/dom/lifecycle.test.ts` → `tests/components/lifecycle.test.ts` (defensive load of a current-app board, debounced persist, Clear preserves language).
- [X] T014 [P] [US1] Port `tests/dom/suggest.test.ts` → `tests/components/suggest.test.ts` (open dialog, `canSend` gating, Send composes `mailto:` via `mailto.ts`, no network, email never shown).
- [X] T015 [P] [US1] Port `tests/dom/i18n.test.ts` → `tests/components/i18n.test.ts` (language toggle re-renders EN/UA via pure `t(lang,key)`).

### Implementation for User Story 1

> **US1 control strategy (revised during implementation):** US1 builds the form/dialog
> controls with **native, accessible HTML elements** driven by Svelte (controlled
> `value` + `oninput`, which fixes focus loss because Svelte patches nodes in place — no
> remount). This keeps the parity tests robust in jsdom and the bundle minimal. The
> **Bits UI** primitives (T017–T020) are deferred to **US3**, where keyboard a11y is
> formally hardened and verified, and Bits UI is introduced where it materially helps
> (its portal/floating behavior is also better exercised there). The spec defers the
> per-widget pick to implementation, so this is in-scope.
- [X] T016 [US1] Native labelled inputs/textarea with controlled `value`+`oninput` across `Header`/`ChoiceCard`/`AddEditForm`/`SuggestDialog` — the focus-loss fix (FR-002, verified by `flow.test.ts`). (No separate `ui/Field.svelte`; pattern applied inline.)
- [~] T017 [US1] Choice selector: native `<select>` in `AddEditForm.svelte` (keyboard-operable). **Bits UI Select deferred to US3.**
- [X] T018 [US1] Type / Weight / Sort: native `<button aria-pressed>` segmented groups (`AddEditForm`, `Toolbar`). **Bits UI Toggle Group evaluation deferred to US3.**
- [X] T019 [US1] Suggest modal: native `role="dialog" aria-modal` overlay + Esc + focus-trap + focus-return (`SuggestDialog.svelte` + `App.svelte`). Clear uses `window.confirm`. **Bits UI Dialog evaluation deferred to US3.**
- [~] T020 [US1] Arrange config rendered inline in `Toolbar.svelte` (sortKey/direction segments). **Bits UI Popover deferred to US3.**
- [X] T021 [US1] Create `src/components/Summary.svelte` — for/against/score via `$derived` over `scoring.ts`; leader highlight by dot+color using `leaders()` (no leader when all scores 0).
- [X] T022 [US1] Create `src/components/NoteRow.svelte` — note text + type + weight as explicit **dot count + color** (never color alone); edit/remove actions wired to store.
- [X] T023 [US1] Create `src/components/AddEditForm.svelte` — unified add/edit: text via `Field` `bind:value` (no focus loss), type/weight via `ToggleGroup`, choice via `Select`; submit semantics (new keeps form open & clears text; edit closes); Esc closes (`closeForm`).
- [X] T024 [US1] Create `src/components/ChoiceCard.svelte` — choice title `bind:value` + ghost placeholder; render `arrange(choice, view)` sections → `NoteRow` list; embed `Summary`; add-note trigger (`openAddForm`).
- [X] T025 [US1] Create `src/components/Header.svelte` — dilemma title `bind:value` + ghost placeholder (`setDilemmaTitle`).
- [X] T026 [US1] Create `src/components/Toolbar.svelte` — row order (left→right): language toggle (`setLang`), theme toggle (`cycleTheme`), Clear (`window.confirm` → `clearDilemma`), Saved indicator, spacer, Group/Sort toggles (`toggleGroup`/`toggleSort`), Add-choice (`addChoice`) with the live `n / MAX` count shown **inside** the Add-choice control (no separate `.count` span in the main row). Inline `sortKey`/`direction` config row when grouped/sorted. (Theme toggle is wired here in US1; pre-paint/matchMedia land in US2.)
- [X] T027 [US1] Create `src/components/Footer.svelte` — author name + GitHub/LinkedIn links from `config.ts` and a "Suggest a feature" trigger; **do not** render `CONTACT_EMAIL`.
- [X] T028 [US1] Create `src/components/SuggestDialog.svelte` — `Dialog` with `Field`s (name/description/email/github/linkedin), `canSend` gates Send, Send opens `mailto:` (`mailto.ts`) with no network; Esc/close resets.
- [X] T029 [US1] Compose everything in `src/App.svelte` (Header, Toolbar, ChoiceCard×N, Summary, Footer, SuggestDialog) wired to store actions; then **delete `src/render/*` and `tests/dom/*`** and confirm no remaining imports.
- [X] T030 [US1] Make T012–T015 pass; run full `yarn test`; `yarn dev` parity smoke; explicitly verify continuous typing in title, a choice name, and a note never loses focus/caret while the score updates (FR-002/SC-002).

**Checkpoint**: A faithful Svelte rebuild — every current behavior preserved, no focus loss,
saved boards load. This is the shippable MVP.

---

## Phase 4: User Story 2 - A theme that fits the room (Priority: P2)

**Goal**: OS-default dark/light, manual toggle, persisted, AA contrast, no wrong-theme flash.

**Independent Test**: OS dark + no stored choice ⇒ dark on load; toggle switches + persists
across reload; stored value overrides OS; pre-paint sets the `<html>` attribute before mount.

**Depends on**: US1 (Toolbar + app shell exist).

- [ ] T031 [P] [US2] Write `tests/components/theme.test.ts` (TDD): OS-dark default, toggle persists across reload, stored `light`/`dark` overrides OS, pre-paint sets `<html>` theme attribute before mount, AA token assertions.
- [ ] T032 [US2] Add dark token values to the `@theme`/`.dark` (or `[data-theme]`) layer in `src/styles/app.css`; verify both palettes meet WCAG AA (normal text ≥ 4.5:1) per `contracts/theming.md`.
- [ ] T033 [US2] Create `src/theme.ts` — resolve `system|light|dark` (system → `prefers-color-scheme`, default light), apply to `<html>`, and subscribe to `matchMedia('(prefers-color-scheme: dark)')` so `system` users follow OS live.
- [ ] T034 [US2] Add the pre-paint inline `<script>` to `index.html`: read `localStorage['sift.v1'].view.theme` (fallback system→`prefers-color-scheme`→light) and set the `<html>` attribute synchronously before mount (FR-009).
- [ ] T035 [US2] Add a theme toggle control to `Toolbar.svelte` (`cycleTheme`/`setTheme`) and call `theme.ts` on boot in `main.ts`; make T031 pass.

**Checkpoint**: Full theming with no flash; choice persists via existing `sift.v1` (no new key).

---

## Phase 5: User Story 3 - Operable entirely by keyboard (Priority: P3)

**Goal**: Full keyboard operability — logical tab order, always-visible focus, Esc dismiss,
arrow-key nav in Select/Toggle Group, Enter submits; information never by color alone.

**Independent Test**: Complete a full comparison with no mouse; Esc closes form/dialog/popover;
arrows move Select/Toggle Group selection; focus is always visible.

**Depends on**: US1 (components + ui/ wrappers exist).

- [ ] T036 [P] [US3] Write `tests/components/a11y.test.ts` (TDD): keyboard-only flow (Tab/arrows/Enter/Esc), Esc closes form + dialog + popover with focus return, arrow nav in `Select`/`ToggleGroup`, and weight exposes an explicit dot count (assert without relying on color).
- [ ] T037 [US3] Add visible `focus-visible` focus-ring styling (Tailwind tokens) across all interactive elements in `src/components/*` and `src/styles/app.css`.
- [ ] T038 [US3] Verify/complete logical tab order, Esc wiring, and arrow/roving-tabindex behavior across `ui/*` and `AddEditForm.svelte` (lean on Bits UI's ARIA/focus management); make T036 pass.

**Checkpoint**: Every control is keyboard-operable with visible focus; a11y suite green.

---

## Phase 6: User Story 4 - Comfortable from phone to wide desktop (Priority: P4)

**Goal**: Fluid layout; choice cards reflow side-by-side ↔ vertical stack without breakpoint
snapping; no horizontal scroll/overlap at any width.

**Independent Test**: Resize continuously 320px → ≥1440px — cards reflow smoothly, no
horizontal scroll, no overlap/clipping.

**Depends on**: US1 (ChoiceCard/App layout exist).

- [ ] T039 [US4] Implement the fluid layout in `src/App.svelte` / `src/components/ChoiceCard.svelte` using container queries / fluid grid / `clamp()` sizing so choice cards flow columns→stack gracefully (FR-014); long titles/names/notes wrap or truncate without breaking the grid.
- [ ] T040 [US4] ⏸ MANUAL — Verify responsiveness across 320px→≥1440px (and a `flow`-test assertion that the layout container uses fluid/grid classes, not fixed widths): no horizontal scroll, no overlap (SC-007).

**Checkpoint**: Usable and uncramped from small phone to wide desktop.

---

## Phase 7: User Story 5 - Calm motion that never shouts (Priority: P5)

**Goal**: Subtle transitions + note-reorder glide; strictly reduced-motion-aware; on-ethos.

**Independent Test**: Group/Sort glides notes to new positions; with reduced-motion enabled,
non-essential animation is suppressed and changes apply instantly; behavior never depends on
an animation completing.

**Depends on**: US1 (components exist), benefits from US4 layout.

- [ ] T041 [P] [US5] Add reduced-motion assertions to `tests/components/*` (TDD): with `prefers-reduced-motion: reduce`, Group/Sort reorder and form/dialog/popover open-close apply instantly and behavior is unchanged (SC-008).
- [ ] T042 [US5] Add `svelte/transition` (`fade`/`scale`/`slide`, brief) to AddEditForm / Dialog / Popover open-close, and `animate:flip` (`svelte/animate`) to the note list on Group/Sort reorder per `contracts/motion.md` — no animation library.
- [ ] T043 [US5] Add a `prefersReducedMotion` helper (`matchMedia('(prefers-reduced-motion: reduce)')`, reactive) gating all motion (transitions instant, flip duration 0) and honored live; make T041 pass and confirm motion stays subtle/on-ethos (FR-016..018).

**Checkpoint**: Tasteful, calm motion that fully respects reduced-motion.

---

## Phase 8: User Story 6 - A properly described, openly licensed project (Priority: P6)

**Goal**: Complete project metadata + MIT license.

**Independent Test**: `package.json` has all required fields + `license: "MIT"`; an MIT
`LICENSE` file at the repo root names the author as copyright holder.

- [ ] T044 [P] [US6] Fill `package.json` metadata: `description`, `author` (name + URL from `config.ts`, no bare email), `repository` (GitHub URL), `homepage` (the Pages URL `https://v-sokolov.github.io/sift/`), `keywords`, `license: "MIT"` (FR-019).
- [ ] T045 [P] [US6] Add an MIT `LICENSE` file at the repo root, © Vitalii Sokolov (FR-020/SC-009).

**Checkpoint**: Project is fully described and openly licensed.

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Remove dead code, final gates, and the full quickstart verification.

- [ ] T046 [P] Remove dead files and stale styles: confirm `src/state.ts`, `src/render/*`, and `tests/dom/*` are deleted, and retire `src/styles/main.css` / `src/styles/tokens.css` once fully migrated into `app.css`; grep for any lingering imports.
- [ ] T047 Full quality gate: `yarn check` clean; `yarn test` green (unchanged `tests/unit/*` + all `tests/components/*`); `GITHUB_PAGES=true yarn build` succeeds and emits `dist/` with sub-path assets (feature 003 unaffected).
- [ ] T048 [P] Update `README.md` stack note to reflect the Svelte 5 + Tailwind v4 phase-2 stack (keep maintainer email out of the README).
- [ ] T049 ⏸ MANUAL — Run the full `quickstart.md` verification: parity (US1), theme/no-flash (US2), keyboard + Esc + focus (US3), responsive 320px→≥1440px (US4), motion + reduced-motion (US5), metadata + LICENSE (US6).

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: no dependencies — start immediately.
- **Foundational (Phase 2)**: after Setup. **Blocks all user stories** (store + mount + tokens).
- **US1 (Phase 3)**: after Foundational. The MVP; later stories build on its components.
- **US2 (Phase 4)**: after US1 (needs Toolbar + shell). Independent of US3–US6.
- **US3 (Phase 5)**: after US1 (needs components/ui). Independent of US2, US4–US6.
- **US4 (Phase 6)**: after US1 (needs ChoiceCard/App layout).
- **US5 (Phase 7)**: after US1; benefits from US4.
- **US6 (Phase 8)**: independent of US1–US5 (metadata/license) — can run any time after Setup.
- **Polish (Phase 9)**: after the stories being shipped are complete.

### Story dependency note

This is a **rebuild**: US1 (faithful Svelte rebuild) is the large foundational increment; US2–US6
are independent layers on top of it. Each story is still independently *verifiable* (US1 via the
ported parity suites; US2 via theme tests; US3 via the a11y suite; US4 via responsive inspection;
US5 via reduced-motion tests; US6 via manifest/LICENSE inspection).

### Parallel Opportunities

- Setup: T004 ∥ T005 (different files).
- Foundational: T007 ∥ T008 (tokens vs store test).
- US1 tests: T012 ∥ T013 ∥ T014 ∥ T015 (different test files).
- US1 ui wrappers: T016 ∥ T017 ∥ T018 ∥ T019 ∥ T020 (different component files).
- US6: T044 ∥ T045; and the whole of US6 can proceed in parallel with US1–US5.
- Polish: T046 ∥ T048.

---

## Implementation Strategy

### MVP First (US1)

1. Phase 1 Setup → Phase 2 Foundational (store + mount + tokens, pure core reused).
2. Phase 3 US1 — port the parity test suites, build the components on headless primitives,
   compose in `App.svelte`, delete the old imperative layer. Ship a faithful rebuild.

### Incremental Delivery

1. Setup → Foundational → US1 (faithful rebuild; MVP).
2. US2 (theme) → US3 (keyboard a11y) → US4 (responsive) → US5 (motion) — each an independent layer.
3. US6 (metadata + license) — any time after Setup.
4. Polish — dead-code removal, full gate, quickstart verification.

---

## Notes

- [P] = different files / independent, no ordering dependency.
- **Pure core is frozen**: `src/{types,scoring,view,ids,mailto,config,persistence}.ts`,
  `src/i18n/*`, and `tests/unit/*` are reused unedited — the strongest parity guarantee
  (SC-001/SC-003). Do not rewrite them.
- TDD (Constitution IV): write/port the test task before the implementation it covers; the
  type-check + suite is the merge gate.
- Standing constraints honored: **yarn** (not npm); never commit/push unless explicitly asked;
  maintainer email stays **mailto-only** (never rendered in UI or README).
- Constitution v2.0.0 is the governing authority for the framework adoption (plan Constitution
  Check = PASS); reverting that amendment would invalidate this plan.
