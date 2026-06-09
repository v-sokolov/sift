# Implementation Plan: Sift Post-MVP Improvements

**Branch**: `002-post-mvp-improvements` | **Date**: 2026-05-30 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/002-post-mvp-improvements/spec.md`

## Summary

Add four additive improvements to the existing **plain-TS MVP** without introducing a UI
framework or any runtime dependency: (1) UA/EN localization via a tiny in-house dictionary
and a pure `t(lang, key)` helper, with browser detection and a persisted language toggle;
(2) a quiet "Suggest a feature" header link that opens an accessible native `<dialog>` whose
Send action composes a `mailto:` hand-off (no network call); (3) author footer links
(GitHub + LinkedIn, localized, AA-contrast in both themes); (4) a concise public README.
A light, low-risk structure tidy (add `src/i18n/`, a small `src/config.ts`) accompanies the
work. All domain logic (`t`, language detection, mailto compose) is implemented as pure,
test-first functions; UI integrates through the MVP's existing state→render→persist
architecture (full region re-render with focus/caret restoration, event delegation on
`#app`, debounced `localStorage`).

## Technical Context

**Language/Version**: TypeScript 5.9 (strict), ES modules

**Primary Dependencies**: None at runtime (constitution-mandated). Dev only: Vite 5, Vitest 3,
jsdom 26. UI uses the native `<dialog>` element for the modal — no Bits UI / no framework.

**Storage**: Browser `localStorage`, single key `sift.v1` (existing). Language preference is
added to the persisted `view` slice; load remains defensive and backward-compatible (a
payload with no `view.lang` is accepted and the language is resolved by detection).

**Testing**: Vitest (unit) + jsdom (DOM). Unit-test the pure core (`t`/fallback, language
detection, `buildMailto`, persistence migration); jsdom-test the toggle, the dialog
(open/Esc/focus-return/validation), and the mailto hand-off. TDD per Constitution IV.

**Target Platform**: Modern evergreen browsers; static single-page app from static hosting;
fully offline-capable.

**Project Type**: Single-project front-end SPA (no backend).

**Performance Goals**: Language switch re-renders the whole UI in well under 1 second
(SC-003); interactions stay at 60 fps; no perceptible jank on the existing board sizes
(2–4 choices).

**Constraints**: No network calls, no telemetry, no third-party runtime services
(Constitution II); no UI framework / no runtime deps (Constitution III); information never
by color alone and full keyboard operability (Constitution V); the maintainer email is used
ONLY as the hidden `mailto:` target and is never displayed (clarified).

**Scale/Scope**: Two languages (EN default + UK); ~1 modal, 1 footer, 1 header toggle;
single active dilemma unchanged. English message catalog is the complete reference set.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Evaluated against Constitution v1.0.0:

| Principle | Assessment | Status |
|-----------|------------|--------|
| I. Calm Over Features | Toggle is a small EN/UA switch; Suggest is a quiet text link, not a CTA; footer stays muted; modal is opt-in. Each addition has clear reflective/relational value (reach, feedback, attribution) and adds no number-chasing. | ✅ PASS |
| II. Client-Side & Private | `mailto:` hand-off means the app makes **no** network call and stores nothing about suggestions; language lives in `localStorage`. No backend, no telemetry, no third-party runtime service. Email is a hidden mailto target, not data egress. | ✅ PASS |
| III. Simplicity & Clean Structure | Plain TS, native `<dialog>`, in-house `t()` — **zero new runtime deps**, no framework. Small single-purpose modules (`i18n/`, `config.ts`, `render/footer.ts`, `render/suggest.ts`). YAGNI honored (no i18n lib, no pluralization). | ✅ PASS |
| IV. Pure Core, Test-First (NON-NEGOTIABLE) | `t(lang,key)`, `detectLang()`, `buildMailto()` are pure and side-effect-free; persistence stays typed and defensive. Tests written first (red-green-refactor); type-check + suite green before done. | ✅ PASS |
| V. Accessibility by Default | Native `<dialog>` gives focus trap + Esc + inert background; toggle and link are keyboard-operable; footer/links meet AA in light & dark; localized copy; empty/placeholder states stay calm. No information by color alone is unaffected (dot-count rule untouched). | ✅ PASS |

**Technology & Architecture Constraints**: satisfied — TS+Vite static SPA, no runtime deps,
`localStorage`-only with defensive load, single-source-of-truth `AppState` + typed mutations,
pure functions isolated, per-region renders. **Scope discipline**: single active dilemma and
English-complete catalog preserved; the only scope addition (a second language + a voluntary
mailto feedback link) is explicitly in-spec and re-evaluated above against I & II.

**Result**: All gates PASS. No violations → **Complexity Tracking is empty**.

*(Post-Phase-1 re-check: design introduces no new dependency and no new state-management
pattern; `<dialog>` and `t()` keep the pure-core/typed-mutation split intact. Gates still
PASS.)*

## Project Structure

### Documentation (this feature)

> **Condensed 2026-06-09**: this feature shipped. Per-task tracking
> (`tasks.md`), the requirements checklist, `quickstart.md`, `data-model.md`, and the
> `render-regions` contract were folded into `spec.md` and the retained contracts and removed.

```text
specs/002-post-mvp-improvements/
├── plan.md              # This file (/speckit-plan output)
├── research.md          # Phase 0 output (condensed)
└── contracts/           # surviving laws (i18n / suggestion / persistence-migration)
    ├── i18n.md
    ├── suggestion.md
    └── persistence-migration.md
```

### Source Code (repository root)

```text
src/
├── config.ts            # NEW — author identity + links + mailto target (constants)
├── i18n/                # NEW — localization
│   ├── index.ts         #   t(lang, key, vars?), detectLang(), LANGS
│   ├── en.ts            #   English catalog (complete reference set)
│   └── uk.ts            #   Ukrainian catalog
├── mailto.ts            # NEW — pure buildMailto(draft, to) → mailto: URL
├── types.ts             # EDIT — add Lang; ViewPrefs.lang; SuggestState; AppState.suggest
├── state.ts             # EDIT — setLang(); suggest mutations; clear preserves lang
├── persistence.ts       # EDIT — accept/migrate optional view.lang (backward-compatible)
├── main.ts              # EDIT — boot language detection; suggest events; dialog Esc/focus
├── render/
│   ├── header.ts        # EDIT — EN/UA toggle + "Suggest a feature" link
│   ├── footer.ts        # NEW — localized author sentence (GitHub + LinkedIn links)
│   ├── suggest.ts       # NEW — <dialog> markup + states (idle/submitting-n-a/error)
│   ├── index.ts         # EDIT — render footer + suggest; route copy through t()
│   ├── toolbar.ts       # EDIT — labels via t()
│   ├── choice.ts        # EDIT — placeholders/labels via t()
│   ├── addForm.ts       # EDIT — labels/placeholders via t()
│   ├── summary.ts       # EDIT — labels via t()
│   └── note.ts          # EDIT — any visible copy via t()
└── styles/
    ├── main.css         # EDIT — footer, toggle, dialog styling (calm, themed)
    └── tokens.css       # (theme tokens reused; add only if needed for AA)

tests/
├── unit/
│   ├── i18n.test.ts        # NEW — t() fallback, detectLang() mapping
│   ├── mailto.test.ts      # NEW — buildMailto encoding/fields
│   └── persistence.test.ts # EDIT — lang migration / missing-lang default
└── dom/
    ├── i18n.test.ts        # NEW — toggle switches all copy, persists, preserves board
    └── suggest.test.ts     # NEW — open/validate/Esc/focus-return/mailto + LinkedIn fallback

README.md                   # NEW — public README (repo root)
LICENSE                     # NEW — MIT
```

**Structure Decision**: Keep the existing single-project layout (pure logic + `state.ts` +
`persistence.ts` + `render/*`). Add one cohesive `src/i18n/` folder, a flat `src/mailto.ts`
pure module, and a `src/config.ts` for fixed author constants. Localization plugs into the
**existing** full-re-render pipeline: render functions become `t()`-aware by reading
`state.view.lang`. The modal becomes a new render region backed by `state.suggest`, using a
native `<dialog>` reconciled imperatively after each re-render (same class of render
side-effect as the existing `applyTheme` and focus/caret restoration). The current
`tests/unit` + `tests/dom` split is retained (it already separates pure-logic from DOM tests
cleanly); per FR-021 we do **not** churn it into colocated tests — not a clear-enough win.

## Complexity Tracking

> No Constitution Check violations — this section is intentionally empty.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| — | — | — |
