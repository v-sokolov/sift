# Tasks: Codebase-Health Remediation (Repo Review Follow-up)

**Feature**: `012-review-remediation` · **Branch**: `012-review-remediation`
**Inputs**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md) (R1–R8),
[data-model.md](./data-model.md), [contracts/](./contracts/) (dialog-ui, theme),
[quickstart.md](./quickstart.md)

**Tests**: TDD is mandatory here (Constitution Principle IV). New observable contracts get a
failing test first; behavior-preserving changes are guarded by the existing suite as a regression
gate (research R8).

**Conventions**: `[P]` = may run in parallel (different files, no incomplete dependency).
`[US#]` maps to the spec's user stories. Paths are repo-relative.

---

## Phase 1: Setup

- [X] T001 Confirm a clean baseline before any change: run `yarn check` (expect 0 errors) and
  `yarn test` (expect the full suite green); note the passing test count so regressions are
  detectable later.
- [X] T002 Smoke-confirm the Bits UI `Dialog` import path resolves in this offline workspace:
  verify `node_modules/bits-ui/dist/bits/dialog/exports.js` exports `Root`/`Overlay`/`Content`/
  `Title`/`Close` (already validated in research R1) — no code change, just a guard before the
  US2 rebuild.

---

## Phase 2: Foundational

No cross-cutting prerequisites block the stories — each user story below is independently
implementable and testable. (Setup's baseline check is the only shared precondition.)

---

## Phase 3: User Story 1 — No theme flash on load (Priority: P1) 🎯 MVP

**Goal**: Resolve the theme to an explicit `light`/`dark` attribute before first paint
(eliminating the FOUC) and collapse the duplicated dark-palette CSS to one block.

**Independent test**: With `Dark` saved under a Light OS, the first painted frame is dark (no
flash); the dark palette is defined exactly once in `app.css`. (quickstart A1, A10, M1–M5)

- [X] T003 [P] [US1] **(RED)** Write a failing unit test `tests/unit/theme.test.ts` asserting a
  pure `resolveTheme(theme, prefersDark)` per contract C-1: `dark`→`'dark'`, `light`→`'light'`,
  `system`+`true`→`'dark'`, `system`+`false`→`'light'`. Import will not exist yet → fails.
- [X] T004 [US1] **(GREEN)** In `src/theme.ts`: add and export the pure
  `resolveTheme(theme, prefersDark): 'light' | 'dark'`; rework `applyTheme(theme)` to set an
  **always-explicit** `data-theme` (compute via `resolveTheme(theme, matchMedia('(prefers-color-scheme: dark)').matches)`; never `removeAttribute`); install a `matchMedia('(prefers-color-scheme: dark)')`
  `change` listener that re-applies while the stored theme is `system` (contract C-2/C-4). Make
  T003 pass.
- [X] T005 [US1] Rewrite the stale `src/theme.ts` header comment (`:1-3`) to describe the
  implemented behavior — explicit pre-paint resolution in `index.html` + the `matchMedia` listener
  here — removing the false "US2 extends this…" promise (FR-012, contract C-6).
- [X] T006 [US1] Add the pre-paint inline `<script>` to `index.html` `<head>` (before the module
  bundle): read `localStorage['sift.v1']`, `JSON.parse`, take `.view.theme`, resolve as in C-1
  (system via `matchMedia`), set `document.documentElement.dataset.theme` to the explicit value;
  wrap in `try/catch` so a missing/malformed entry falls back to `light` and never throws
  (FR-006/FR-007, contract C-3).
- [X] T007 [US1] Ensure the `matchMedia` listener from T004 is installed at boot (called from the
  existing `applyTheme` `$effect` in `src/App.svelte:15-17`, or wired once in `src/main.ts`) so an
  OS flip updates the theme live while in `system` mode — verify no duplicate listeners are
  registered on re-render.
- [X] T008 [US1] In `src/styles/app.css`: delete the entire `@media (prefers-color-scheme: dark)`
  block (`:50-72`) now made dead by the always-explicit attribute; keep the single
  `:root[data-theme="dark"]` block as the one dark-palette source (FR-008, contract C-5).
- [X] T009 [US1] Verify US1: `tests/unit/theme.test.ts` green; `yarn check` clean;
  `grep -c '@media (prefers-color-scheme: dark)' src/styles/app.css` returns `0` (quickstart A1,
  A10). Record M1–M5 as manual on-device checks.

**Checkpoint**: theme FOUC fixed and dark palette de-duplicated, independently shippable.

---

## Phase 4: User Story 2 — Honest dependency surface & docs (Priority: P1)

**Goal**: Adopt Bits UI's `Dialog` in `SuggestDialog` (making `bits-ui` genuinely used), delete
the hand-rolled focus-trap, remove unused `@internationalized/date`, and keep the docs truthful.

**Independent test**: Every declared runtime dep is imported by `src/`; the suggest dialog opens/
focuses/Esc-closes/backdrop-closes/traps-Tab/scroll-locks exactly as before; docs match the code.
(quickstart A2–A7, A11, A12, H1)

- [X] T010 [US2] **(RED/guide)** Update `tests/components/suggest.test.ts` to assert the same
  observable behavior against the Bits UI DOM (contract C-2/C-3): dialog present with
  `role="dialog"` + `aria-modal="true"`; focus → `[data-field="suggest-name"]` on open; Esc
  closes and returns focus to `[data-action="open-suggest"]`; backdrop/outside click closes,
  dialog-body click does not; Tab traps (wraps last→first); keep the 011 `btn--half`/order test
  and the mailto-handoff + disabled-Send tests. (Rendered **inline/no Portal**, so container
  queries still resolve.) Expect failures against the current hand-rolled markup until T011–T012.
  **jsdom caveat (analyze F1)**: Bits UI's `FocusScope` (Tab-trap) and `ScrollLock` may rely on
  visibility/layout that jsdom does not compute. Keep the **event-driven** behaviors automated
  (open, focus-on-open, Esc-close + focus-return, backdrop/outside-close, disabled-Send, mailto
  handoff). If the **Tab-trap** and/or **scroll-lock** assertions prove undrivable under jsdom,
  demote *only those two* to the manual matrix (quickstart M6) rather than fighting the
  environment — mirroring how SC-002 (no-flash) is handled. Do not drop the behavior, only the
  jsdom assertion.
- [X] T011 [US2] Rebuild `src/components/SuggestDialog.svelte` on `bits-ui`'s `Dialog`
  (`Dialog.Root` controlled by the store: `open={s.suggest.open}` +
  `onOpenChange={(v) => (v ? openSuggest() : closeSuggest())}`; `Dialog.Overlay class="modal-overlay"
  data-action="suggest-backdrop"`; `Dialog.Content class="modal" data-region="suggest"
  aria-labelledby="suggest-title"` with `onOpenAutoFocus` → focus the name field;
  `Dialog.Title id="suggest-title" class="modal__title"`; `Dialog.Close class="modal__close"
  data-action="close-suggest"`), rendered **inline (no `Dialog.Portal`)**. Delete the hand-rolled
  `backdrop()` handler and the focus + scroll-lock `$effect`s; keep the form, fields, `btn--half`
  actions, and the LinkedIn fallback unchanged (contract C-2/C-4).
- [X] T012 [US2] In `src/App.svelte`: remove the suggest-Esc branch, the entire Tab focus-trap
  block (`:42-61`), and the focus-return `$effect` (`:19-27`) — now owned by Bits UI; **keep** the
  note-form Esc branch (`closeForm` when `editing`) (research R2, contract C-4).
- [X] T013 [P] [US2] Remove `@internationalized/date` from `package.json` `dependencies`
  (FR-002); leave `bits-ui` (now imported) and `svelte`.
- [X] T014 [P] [US2] Doc-honesty pass (FR-005, H1): confirm `CLAUDE.md` and the constitution
  rationale describe Bits UI as genuinely used by the dialog (the active-feature + stack wording
  was repointed during planning — verify no remaining text claims it was already in use, and no
  text still implies `@internationalized/date` is needed).
- [X] T015 [US2] Verify US2: `yarn check` clean; `yarn test` — `suggest.test.ts` and the full
  suite green; confirm `bits-ui` is imported in `SuggestDialog.svelte` and `package.json` has no
  `@internationalized/date` (quickstart A11, A12).

**Checkpoint**: dialog runs on Bits UI with identical behavior; dependency surface and docs honest.

---

## Phase 5: User Story 3 — Constitution committed & discoverable (Priority: P2)

**Goal**: Commit `.specify/memory/constitution.md` while keeping the rest of `.specify/` ignored.

**Independent test**: The constitution is tracked on a fresh clone; `.specify/extensions.yml`,
`feature.json`, `scripts/`, `templates/` remain ignored. (quickstart A13)

- [X] T016 [US3] Replace the blanket `.specify/` line in `.gitignore` with the narrowing pattern
  (research R6): `.specify/*` / `!.specify/memory/` / `.specify/memory/*` /
  `!.specify/memory/constitution.md`.
- [X] T017 [US3] Stage the file (`git add .specify/memory/constitution.md`) and verify with
  `git check-ignore .specify/extensions.yml .specify/feature.json` that the rest of `.specify/`
  stays ignored and no other `.specify/` file became tracked (`git status --porcelain .specify/`)
  (FR-009, quickstart A13).

**Checkpoint**: constitution is part of the repo; the 80 specs' "Constitution Check" links resolve.

---

## Phase 6: User Story 4 — Leaner, dead-code-free core (Priority: P3)

**Goal**: De-duplicate the note-commit path and remove the write-only `SuggestStatus` scaffolding,
with no behavior change.

**Independent test**: Note add/edit via the UI is unchanged; the note-commit body lives in one
place; no one-member status union or unread `status` field remains; suite green. (quickstart A8, A9)

- [X] T018 [US4] Refactor `submitForm` in `src/store.svelte.ts:258-286` to **delegate** the note
  mutation to `addNote(editing.choiceId, draft)` / `updateNote(editing.choiceId, editing.noteId,
  draft)`, keeping only the form lifecycle in `submitForm` (new → reset draft preserving
  `type`/`weight`, keep form open; edit → close form). Remove the duplicated push/assign body
  (FR-010, research R4). Existing `submitForm`/`addNote`/`updateNote` tests are the regression gate.
- [X] T019 [US4] Remove the write-only suggest status (FR-011, data-model): delete
  `type SuggestStatus = 'idle'` and the `status` field from `SuggestState` in `src/types.ts`
  (`:67`, `:80`); drop `status: 'idle'` from `emptySuggest` (`store.svelte.ts:37`) and from the
  `openSuggest` object literal (`:321`). **Do not touch** `SaveStatus`/`AppState.status` (010).
- [X] T020 [US4] Update tests for the removal: grep `tests/components/store.test.ts` (and others)
  for any assertion on `suggest.status` / `SuggestStatus` and delete those assertions; keep the
  `addNote`/`updateNote` and `submitForm` behavior tests intact (research R8, quickstart A9).
- [X] T021 [US4] Verify US4: `yarn check` clean; `yarn test` green; confirm no `SuggestStatus`
  symbol remains (`grep -rn SuggestStatus src tests` → none) (quickstart A8, A9).

**Checkpoint**: core is dead-code-free; behavior identical.

---

## Phase 7: Polish & Cross-Cutting

- [X] T022 [P] Remove the CSS spec-tag comments coupling `src/styles/app.css` to spec history —
  the `(006)`/`(007)`/`(008)` and `M#/FR-###` tags (e.g. `:22`, `:153`, `:160`, `:286`, `:315`,
  `:340`, `:394`, `:469` …); **keep** the substantive *why* explanations (only the spec-history
  tags are trimmed) (FR-013, H3). Re-run `yarn check`/`yarn test` after, as CSS edits can affect
  the build.
- [X] T023 Final gate: `yarn check` (0 errors) and `yarn test` (full suite green) across all
  stories together; confirm declared-but-unused runtime deps = 0 (SC-001) and one dark-palette
  block (SC-003). **FR-014 regression gate (analyze F2)**: `tests/unit/persistence.test.ts` (the
  `sift.v1` schema-v1 serialize/defensive-load suite) MUST stay green here — that is the automated
  guard that the persisted schema is untouched and no migration was introduced; M8 is the
  on-device confirmation.
- [X] T024 [P] Scope-guard (FR-015, H4): confirm the out-of-scope items are untouched — the store
  snapshot/`update(producer)` pattern, flat folder layout, hand-rolled i18n, `data-*` test
  attributes, and the shipped specs (001–011) — via `git diff --stat` review.
- [ ] T025 Manual on-device pass (jsdom can't paint): run `yarn dev` and walk quickstart M1–M8
  (theme: no flash for Dark/Light conflicts, OS-pref fallback, malformed `sift.v1` fallback, live
  OS flip in system mode, runtime toggle still cycles; dialog: focus/Tab/Esc/backdrop/scroll-lock;
  a pre-existing saved board loads unchanged).

---

## Dependencies & Execution Order

- **Setup (T001–T002)** → before everything.
- **User stories are independent** and may be done in any order (or in parallel by different
  people). Recommended priority order: **US1 (P1) → US2 (P1) → US3 (P2) → US4 (P3)**.
- Within **US1**: T003 (RED) → T004 (GREEN) → T005–T008 → T009. T005/T008 touch different files
  from T004 but stay within the story.
- Within **US2**: T010 (update tests) → T011 → T012 → T015; T013/T014 are `[P]` (different files).
- Within **US4**: T018 → T019 → T020 are **sequential** — T018 and T019 both edit
  `src/store.svelte.ts` (and T019 also `src/types.ts`), so they are not parallel-safe; T020
  (test updates) follows T019.
- **Polish (T022–T025)** after all stories.

## Parallel Opportunities

- T003 [US1] and the US2/US4 test-and-code work touch disjoint files — different stories can run
  concurrently.
- Within stories: T013 + T014 (US2); T022 + T024 (polish) are `[P]`. (US4's T018→T019→T020 are
  sequential — same files.)

## MVP Scope

**US1 alone** (theme FOUC + dark-palette de-dup) is the smallest independently shippable slice and
the only *user-visible* improvement — a viable MVP. US2 (the dependency/dialog honesty pass) is the
other P1 and the largest chunk; US3/US4 are smaller follow-on cleanups.

## Format validation

All tasks use `- [ ] T### [P?] [US#?] <description with file path>`; Setup/Foundational/Polish
carry no story label; every user-story task carries its `[US#]` label and names concrete files.
