---
description: "Task list for Sift Post-MVP Improvements"
---

# Tasks: Sift Post-MVP Improvements

**Input**: Design documents from `/specs/002-post-mvp-improvements/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: INCLUDED and written-first — Constitution Principle IV (Pure Core, Test-First) is
NON-NEGOTIABLE for this project. Every behavior change ships with a failing test first.

**Organization**: Tasks grouped by user story (US1–US4) for independent implementation and
testing. Stack: plain TypeScript 5 (strict) + Vite, **no runtime deps**; Vitest + jsdom.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependency on an incomplete task)
- **[Story]**: US1–US4 (Setup/Foundational/Polish carry no story label)

## Path Conventions

Single project: `src/`, `tests/` at repo root (matches plan.md Structure Decision).

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Constants and type additions every later phase compiles against.

- [X] T001 [P] Create `src/config.ts` exporting author identity constants: `AUTHOR_NAME = 'Vitalii Sokolov'`, `GITHUB_URL = 'https://github.com/v-sokolov'`, `LINKEDIN_URL = 'https://www.linkedin.com/in/vitalii-sokolov/'`, `CONTACT_EMAIL = 'vetalsokolov4@gmail.com'` (email is the hidden mailto target only — never rendered).
- [X] T002 Extend `src/types.ts`: add `Lang = 'en'|'uk'`, `LANGS`, `DEFAULT_LANG='en'`; add `lang: Lang` to `ViewPrefs`; add `SuggestStatus='idle'`, `SuggestionDraft`, `SuggestState`; add `suggest: SuggestState` to `AppState`. (See data-model.md.)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: The i18n engine + catalogs + state initialization that US1, US2, and US3 all
depend on (every region routes copy through `t()`).

**⚠️ CRITICAL**: No user-story work begins until this phase is complete.

- [X] T003 [P] Write FAILING unit tests in `tests/unit/i18n.test.ts`: `t()` returns uk when present, falls back to en when missing, interpolates `{var}`, never blank for an en key; `detectLang()` mapping (`uk*`/`ru*`→`uk`, else `en`); catalog parity (every `uk` key exists in `en`; no raw-key/blank). (Per contracts/i18n.md.)
- [X] T004 Implement `src/i18n/index.ts`: `Lang`, `LANGS`, `DEFAULT_LANG`, `Catalog`, `messages` map, pure `t(lang,key,vars?)` (resolution en-fallback + `{var}` interpolation), pure `detectLang(navigatorLanguage)`.
- [X] T005 Create `src/i18n/en.ts` — complete English catalog enumerating ALL existing user-facing strings (read `src/render/header.ts`, `toolbar.ts`, `choice.ts`, `addForm.ts`, `summary.ts`, `note.ts` and the Clear confirm in `main.ts`); en is the authoritative reference set.
- [X] T006 Create `src/i18n/uk.ts` — mirror every `en` key with Ukrainian translations (same key set; T003 parity test guards completeness).
- [X] T007 Update `src/state.ts` `emptyDilemma()` to initialize `view.lang = DEFAULT_LANG` and `suggest = { open:false, draft: emptyDraft(), status:'idle' }` (add an `emptyDraft()` helper) so `AppState` compiles for all stories.

**Checkpoint**: i18n core green and importable; state initializes new fields. User stories can begin.

---

## Phase 3: User Story 1 — Use Sift in Ukrainian or English (Priority: P1) 🎯 MVP

**Goal**: Detect language on first visit (uk/ru→UA else EN), a header EN/UA toggle that flips
all copy live and persists, with stored choice overriding detection — board untouched.

**Independent Test**: Clear storage; uk browser language → UI is Ukrainian; toggle → all copy
flips and the board is preserved; reload → chosen language persists regardless of browser.

### Tests for User Story 1 (write first — must FAIL)

- [X] T008 [P] [US1] Write FAILING unit tests in `tests/unit/persistence.test.ts`: round-trip `view.lang='uk'`; an old payload with **no** `lang` still loads (board not null) with `lang` unset; an invalid `lang` is accepted with `lang` unset; existing MVP persistence tests stay green. (Per contracts/persistence-migration.md.)
- [X] T009 [P] [US1] Write FAILING DOM tests in `tests/dom/i18n.test.ts`: boot with stubbed `navigator.language='uk'` and empty storage → header/toolbar copy is Ukrainian; clicking the toggle flips all visible copy while dilemma/choices/notes are unchanged; re-init from persisted state keeps the chosen language.

### Implementation for User Story 1

- [X] T010 [US1] Add `setLang(lang)` mutation in `src/state.ts` (render + persist) and make `clearDilemma()` preserve the current `view.lang`.
- [X] T011 [US1] Update `src/persistence.ts`: `serialize` writes `view.lang`; relax `validView` so `lang` is optional/forgiving; `load()` keeps a valid `lang`, leaves missing/invalid unset (no payload rejection).
- [X] T012 [US1] Boot language resolution in `src/main.ts`: after `load()`, use stored `view.lang` if valid else `detectLang(navigator.language)`; set initial state with the resolved `lang`.
- [X] T013 [US1] Add the EN/UA toggle to `src/render/header.ts` (`data-action="set-lang"`, `data-lang`), show active selection (distinguished by more than color — Constitution V), localize header copy via `t()`; wire the `set-lang` click in `src/main.ts`.
- [X] T014 [P] [US1] Route all copy in `src/render/toolbar.ts` through `t(state.view.lang, …)`.
- [X] T015 [P] [US1] Route all copy in `src/render/choice.ts` through `t()` (incl. ghost placeholders).
- [X] T016 [P] [US1] Route all copy in `src/render/addForm.ts` through `t()` (labels/placeholders).
- [X] T017 [P] [US1] Route all copy in `src/render/summary.ts` through `t()`.
- [X] T018 [P] [US1] Route all copy in `src/render/note.ts` through `t()`.
- [X] T019 [US1] Localize the Clear `window.confirm` text in `src/main.ts` via `t()`.

**Checkpoint**: Full localization + detection + toggle + persistence works; tests green. **MVP complete.**

---

## Phase 4: User Story 2 — Suggest a feature (Priority: P2)

**Goal**: A quiet header "Suggest a feature" link opens an accessible native `<dialog>`; Send
(enabled only when Name+Description are non-empty) composes a `mailto:` and hands off to the
user's mail client — no network, nothing stored; localized; LinkedIn fallback; email hidden.

**Independent Test**: Open link → dialog with focus inside; Send disabled until Name+Description
filled; Send → `location.href` becomes a `mailto:` containing the entered values, dialog closes;
Esc → closes, focus returns; LinkedIn fallback present, email never shown.

### Tests for User Story 2 (write first — must FAIL)

- [X] T020 [P] [US2] Write FAILING unit tests in `tests/unit/mailto.test.ts`: `buildMailto(draft,to)` produces `mailto:<to>?subject=…&body=…`; required-only draft omits empty optionals; all-fields draft includes each line; values percent-encoded (test spaces, `&`, newline, Cyrillic). (Per contracts/suggestion.md.)
- [X] T021 [P] [US2] Write FAILING DOM tests in `tests/dom/suggest.test.ts`: open → dialog open + focus inside; Esc → closed + focus back on trigger; Send disabled until Name+Description non-whitespace; valid submit sets `window.location.href` to a `mailto:` with entered values (spy/stub location) and closes; LinkedIn fallback anchor uses `config.LINKEDIN_URL`; the email string is absent from the DOM; switching language while open re-labels and preserves entered data.

### Implementation for User Story 2

- [X] T022 [P] [US2] Implement pure `src/mailto.ts` `buildMailto(draft, to)` (subject constant + readable body template, `encodeURIComponent` all values, omit empty optionals).
- [X] T023 [US2] Add suggest mutations to `src/state.ts`: `openSuggest()`, `closeSuggest()`, `setSuggestField(field,value)`, `submitSuggest()` (no-op unless `canSend = name.trim() && description.trim()`).
- [X] T024 [US2] Create `src/render/suggest.ts`: `<dialog data-region="suggest">` + `<form>` with Name*, Description* (textarea), Contact email, GitHub, LinkedIn; labels/placeholders via `t()`; Send `disabled` unless `canSend`; quiet LinkedIn fallback link (`config.LINKEDIN_URL`); close control. Email never rendered.
- [X] T025 [US2] Add suggest-form **static UI** keys (field labels, placeholders, Send/close text, LinkedIn fallback text) to `src/i18n/en.ts` and `src/i18n/uk.ts`. NOTE: the email **subject is a non-localized constant** inside `buildMailto` (not an i18n key), and user-entered field values are passed through verbatim (never translated).
- [X] T026 [US2] Add the quiet "Suggest a feature" link to `src/render/header.ts` (`data-action="open-suggest"`), localized — not a CTA.
- [X] T027 [US2] Append `renderSuggest(state)` to `src/render/index.ts` output (dialog always in DOM).
- [X] T028 [US2] Wire events + dialog reconcile in `src/main.ts`: `open-suggest`→`openSuggest`; `suggest-field` input→`setSuggestField`; form submit→`preventDefault`, if `canSend` set `window.location.href = buildMailto(draft, CONTACT_EMAIL)` then `closeSuggest`; dialog `cancel`/`close`→`closeSuggest`; post-render reconcile `showModal()`/`close()` + focus first field on open and restore focus to trigger on close.
- [X] T029 [US2] Style the `<dialog>` in `src/styles/main.css`: calm card, dimmed `::backdrop`, themed for light & dark, preserve focus-visible rings.

**Checkpoint**: US1 and US2 both work independently; suggestion flow is fully client-side.

---

## Phase 5: User Story 3 — Find the author from the app (Priority: P3)

**Goal**: A localized footer sentence with the author name as plain text plus a GitHub profile
link and a LinkedIn profile link; calm and AA-contrast in both themes.

**Independent Test**: Footer shows the sentence; name is plain text; GitHub link → GitHub,
LinkedIn link → LinkedIn; legible and calm in light & dark; localized; no email anywhere.

### Tests for User Story 3 (write first — must FAIL)

- [X] T030 [P] [US3] Write FAILING DOM test in `tests/dom/i18n.test.ts` (footer section): footer renders an anchor to `config.GITHUB_URL` and an anchor to `config.LINKEDIN_URL` (author name is plain text), copy is localized, and no email text appears in the DOM.

### Implementation for User Story 3

- [X] T031 [US3] Create `src/render/footer.ts`: localized sentence via `t(lang,'footer.madeBy',{name})` with `{name}` as plain text, plus a GitHub profile link (`t(lang,'footer.github')`) and a LinkedIn profile link (`t(lang,'footer.linkedin')`) (constants from `config.ts`).
- [X] T032 [US3] Add `footer.madeBy` (with `{name}` token), `footer.github`, and `footer.linkedin` keys to `src/i18n/en.ts` and `src/i18n/uk.ts`.
- [X] T033 [US3] Append `renderFooter(state)` to `src/render/index.ts` output.
- [X] T034 [US3] Style the footer in `src/styles/main.css` (small, muted inline links; AA contrast in light & dark — add a token in `styles/tokens.css` only if needed).

**Checkpoint**: All in-app stories (US1–US3) independently functional.

---

## Phase 6: User Story 4 — Understand the project from its README (Priority: P4)

**Goal**: A concise public README (and MIT LICENSE) documenting the real plain-TS stack.

**Independent Test**: README has, in order, pitch → screenshot → features → stack → run → MIT →
author links; run steps work on a clean checkout; no email present.

### Implementation for User Story 4

- [X] T035 [P] [US4] Create root `README.md`: title + one-line pitch, screenshot referenced from `./assets/` (see T037), feature list (2–4 choices, weighted notes, group/sort, live score, dark/light, UA/EN, local-only/no account/no tracking), tech stack (TypeScript, Vite, Vitest; localStorage; mailto), run locally (`yarn install`/`yarn dev`/`yarn test`), License (MIT), Author (name + GitHub + LinkedIn links). **No email.**
- [X] T036 [P] [US4] Add an MIT `LICENSE` file at repo root (copyright Vitalii Sokolov, 2026).
- [X] T037 [US4] Capture a comparison-screen screenshot (light, optional dark) and commit it under a **tracked** `./assets/` folder at repo root (NOT `docs/`, which is git-ignored), then reference it from `README.md` (requires running `yarn dev`). If a screenshot is impractical, omit the image from the README rather than referencing an untracked path.

**Checkpoint**: Repository is presentable; all four stories delivered.

---

## Phase 7: Polish & Cross-Cutting Concerns

- [X] T038 [P] Grep `src/render/*` and `src/main.ts` for hard-coded user-facing English strings; confirm none remain outside the i18n catalogs (SC-001), and the parity test passes.
- [X] T039 Run the full suite: `yarn test` green and `yarn build` (`tsc --noEmit` + vite build) clean — no type errors, no failing tests (Constitution IV gate; FR-020/SC-008).
- [X] T040 Run `quickstart.md` manual smoke for US1–US4, including a light/dark AA-contrast check on the footer links and the dialog (SC-006), and the keyboard-only modal path (SC-005).
- [X] T041 [P] Verify Constitution compliance: `package.json` has **no new runtime dependency**; no `fetch`/network call exists; the contact email appears nowhere in rendered DOM (only inside `mailto:` hrefs) — Principles II & III.
- [X] T042 Minimal structure tidy (FR-021): remove any dead code encountered during the work; do NOT reshuffle the `tests/{unit,dom}` layout. Confirm behavior unchanged via the suite.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: no dependencies — start immediately.
- **Foundational (Phase 2)**: depends on Setup; **blocks all user stories** (i18n engine + state init).
- **User Stories (Phases 3–6)**: all depend on Foundational. US1/US2/US3 are independent of each
  other (US2/US3 only consume `t()` + `config`, which Foundational provides; `view.lang` defaults
  via `emptyDilemma`). US4 (README) is fully independent and can run any time after Setup.
- **Polish (Phase 7)**: after all desired stories.

### User Story Dependencies

- **US1 (P1)**: after Foundational. No dependency on other stories. → MVP.
- **US2 (P2)**: after Foundational. Independent (consumes `t()`/`config`); testable with `view.lang` at its default.
- **US3 (P3)**: after Foundational. Independent (consumes `t()`/`config`).
- **US4 (P4)**: after Setup (only needs `config.ts` for author links); independent of the app code.

### Within Each User Story

- Tests written first and FAIL before implementation (Constitution IV).
- State/persistence mutations before render wiring; render region before `index.ts` assembly + `main.ts` events.

### Parallel Opportunities

- T001 ∥ (then T002).
- Foundational: T003 can be authored ∥ early; T004→T005→T006 are sequential-ish (impl then catalogs); T007 touches `state.ts`.
- US1 localization passes T014–T018 are ∥ (distinct render files); T008 ∥ T009 (distinct test files).
- US2: T020 ∥ T021 (tests); T022 (`mailto.ts`) ∥ T020. Render/state/main tasks touching shared files are sequential.
- US3: T031/T032/T034 are largely ∥ (distinct files), T033 edits `index.ts`.
- US4: T035 ∥ T036.
- **Cross-story**: with capacity, US1, US2, US3, US4 proceed in parallel after Foundational —
  watch shared files (`render/header.ts`: T013+T026; `render/index.ts`: T027+T033;
  `main.ts`: T012/T013/T019+T028; `i18n/*`: T005/T006+T025+T032) and sequence edits to those.

---

## Parallel Example: User Story 1

```bash
# Tests first (distinct files):
Task: "Unit tests for persistence lang migration in tests/unit/persistence.test.ts"  # T008
Task: "DOM tests for localization in tests/dom/i18n.test.ts"                          # T009

# Then localize render regions in parallel (distinct files):
Task: "Localize src/render/toolbar.ts via t()"   # T014
Task: "Localize src/render/choice.ts via t()"    # T015
Task: "Localize src/render/addForm.ts via t()"   # T016
Task: "Localize src/render/summary.ts via t()"   # T017
Task: "Localize src/render/note.ts via t()"      # T018
```

---

## Implementation Strategy

### MVP First (User Story 1 only)

1. Phase 1 Setup → 2. Phase 2 Foundational (i18n engine) → 3. Phase 3 US1 →
4. **STOP & VALIDATE**: localization + detection + toggle + persistence work, suite green →
5. Ship the bilingual app as the MVP increment.

### Incremental Delivery

Foundation → US1 (bilingual MVP) → US2 (suggest/mailto) → US3 (footer) → US4 (README/LICENSE),
testing and demoing after each. Each story adds value without breaking the previous ones.

### Notes

- [P] = different files, no incomplete-task dependency.
- Verify each test FAILS before implementing (red-green-refactor).
- Constitution gates: no runtime deps, no network, info never by color alone, AA contrast,
  keyboard-operable — checked in Phase 7 (T039–T041).
- Commit after each task or logical group (per the user's own discretion — no auto-commit).
