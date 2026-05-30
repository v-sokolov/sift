# Research & Decisions: Sift Post-MVP Improvements

Phase 0 output. All Technical-Context unknowns are resolved here; there are no remaining
`NEEDS CLARIFICATION` items (the spec's `/speckit-clarify` session fixed author identity and
the mailto fallback; the stack question was resolved to plain-TS).

---

## R1 — Localization mechanism

**Decision**: In-house dictionary + a pure `t(lang, key, vars?)` helper. One module per
language (`src/i18n/en.ts`, `src/i18n/uk.ts`), each a flat `Record<string, string>`. A
`messages: Record<Lang, Catalog>` map. `t` returns `messages[lang][key]`, falling back to
`messages.en[key]`, and finally to the key itself only if English is also missing (which a
test forbids).

**Rationale**: Zero runtime dependency (Constitution III); pure and trivially unit-testable
(Constitution IV); English is the complete reference set and natural fallback (FR-005). A
pure `t(lang, key)` (lang passed explicitly, not read from a global) keeps render functions
deterministic and fits the existing "compute from state at render time" model.

**Alternatives considered**: i18n libraries (`i18next`, `svelte-i18n`) — rejected: runtime
dependency + framework coupling, violates III and YAGNI. A global mutable "current language"
read inside `t()` — rejected: hidden side-channel, harder to test; passing `lang` is cleaner.

**Variable interpolation**: minimal `{name}`-style replacement in `t(lang, key, vars)` for
the footer sentence (author name). No pluralization, no date/number formatting (out of scope).

---

## R2 — Language detection & persistence

**Decision**: Language is a persisted view preference: add `lang: Lang` to `ViewPrefs`
(persisted under the existing `sift.v1` key). On boot, **after** defensive load:
- if the loaded payload has a valid `view.lang` → use it (stored choice wins, FR-004);
- else detect: `const nav = navigator.language.toLowerCase(); lang = (nav.startsWith('uk')
  || nav.startsWith('ru')) ? 'uk' : 'en'` (FR-002), default `en`.
`detectLang(navigatorLanguage: string): Lang` is a pure function (unit-tested). The toggle
calls `setLang(lang)`, which persists immediately via the normal save channel.

**Rationale**: Reuses the existing persistence + view model; "stored choice overrides
detection" falls out naturally. Detection isolated as a pure function.

**Alternatives considered**: a separate `localStorage` key for language — rejected: a second
key and load path for no benefit; `view` already carries per-user UI prefs (theme).

---

## R3 — Backward-compatible persistence migration

**Decision**: Keep `schemaVersion: 1` and `STORAGE_KEY = 'sift.v1'`. Make `view.lang`
**optional on load**: relax `validView` to accept a missing/invalid `lang` and have `load()`
inject the resolved language (detection) rather than rejecting the whole payload. New writes
always include `view.lang`. Treat a missing stored `lang` as "no choice yet" → detection runs.

**Rationale**: Existing MVP users have `sift.v1` payloads with no `lang`; rejecting them would
wipe a saved board — unacceptable and contrary to the defensive-load principle. Additive +
backward-compatible is the calmest migration (Constitution: "invalid/old data falls back to a
valid default — never crashes").

**Alternatives considered**: bump to `schemaVersion: 2` with an explicit migrator — rejected
as overkill for one optional additive field; reserved for a future structural change.

---

## R4 — "Suggest a feature" modal: custom accessible overlay

> **Implementation update (during /speckit-implement)**: native `<dialog>.showModal()` is
> **not implemented in jsdom 26** (the test environment) and re-calling `showModal()` after
> every full re-render conflicts with the render pipeline. We therefore ship a **custom
> accessible overlay** (`role="dialog"` + `aria-modal="true"`) rendered through the existing
> innerHTML pipeline, with focus-into-modal on open, focus-return on close, Esc-to-close, a
> Tab focus-trap, and a backdrop-click close — all handled in `main.ts`. This keeps the
> jsdom DOM tests runnable and stays consistent with the full-re-render architecture. The
> original native-`<dialog>` decision below is superseded for these reasons.

**Original decision**: Use the platform **`<dialog>`** element with `showModal()`. Back it with
`state.suggest = { open, draft, status }` (NOT persisted). Render the dialog markup in a new
`render/suggest.ts` region; after each `renderApp`, reconcile imperatively: if
`state.suggest.open` and the dialog isn't open → `dialog.showModal()` and move focus to the
first field; if closed and open → `dialog.close()`. On close, return focus to the trigger
link (store/recall the trigger via the existing focus-restoration mechanism).

**Rationale**: `showModal()` provides a real focus trap, `Esc`-to-close, the top layer, and
`::backdrop` inerting the page — for free, with **no dependency** (replaces Bits UI Dialog,
honoring III & V). Imperative reconcile-after-render is the same side-effect class the app
already performs (`applyTheme`, caret restoration), so it fits the architecture.

**Alternatives considered**: a hand-built `role="dialog"` with manual focus-trap JS —
rejected: re-implements what `<dialog>` gives natively, more code and more a11y risk. Bits UI
Dialog — rejected: framework + runtime dep (violates III).

**Esc handling**: `<dialog>` emits `cancel`/`close`; listen and route to `closeSuggest()` so
state stays the source of truth (mirrors the existing Esc-closes-form pattern in `main.ts`).

---

## R5 — Submission via `mailto:` (no network)

**Decision**: On Send, build a `mailto:` URL with a pure `buildMailto(draft, to)`:
`mailto:<to>?subject=<enc>&body=<enc>` where the body is a readable template populated from
Name, Description, and optional Contact/GitHub/LinkedIn, each value `encodeURIComponent`-d.
Trigger it via `window.location.href = url` (or a transient anchor). The maintainer address
comes from `config.ts` and is never rendered. There are no submitting/success/error network
states; after firing the mailto we simply close the dialog. A quiet **LinkedIn** link is
shown in the dialog as the fallback for users without a mail client (FR-012); the email is
never displayed.

**Rationale**: A `mailto:` hand-off keeps the app fully client-side (Constitution II) — no
fetch, no third-party form service, nothing stored. `buildMailto` is pure → unit-tested for
correct encoding and field inclusion/omission. Validation (Name + Description non-empty,
trimmed) gates the Send control (FR-010).

**Alternatives considered**: Web3Forms / external form POST (original design) — rejected:
outbound network call to a third-party runtime service, violates Constitution II (the reason
we chose option (b)). Clipboard-copy fallback — considered, rejected in clarify in favor of
the LinkedIn link.

**Edge cases**: very long descriptions are URL-encoded safely (browsers tolerate long
`mailto:` bodies; if a body is extreme we still produce a valid URL — no app-side cap needed
for expected use). Whitespace-only Name/Description is treated as empty (trim) → Send stays
disabled.

---

## R6 — Author footer

**Decision**: New `render/footer.ts` renders a localized sentence (e.g. EN: "Sift — a quiet
way to weigh a decision. Made by {name}.") where `{name}` is the author's name as **plain
text**, followed by two muted links — a **GitHub** profile link and a **LinkedIn** profile
link. Constants from `config.ts`. Styled as small, muted inline links meeting AA contrast in
both themes (reuse existing theme tokens; add a muted-link token only if contrast requires).

**Rationale**: Pure render from constants + `t()`; calm and unobtrusive per Constitution I/V.

---

## R7 — Author constants (`src/config.ts`)

**Decision**: A single module exporting fixed identity:
`AUTHOR_NAME = 'Vitalii Sokolov'`, `GITHUB_URL = 'https://github.com/v-sokolov'`,
`LINKEDIN_URL = 'https://www.linkedin.com/in/vitalii-sokolov/'`,
`CONTACT_EMAIL = 'vetalsokolov4@gmail.com'` (used only to build the `mailto:` target).
Repository URL added when known.

**Rationale**: One place for identity; keeps render/mailto modules free of literals. The
email shipping inside a `mailto:` link is expected and is not data egress; it is never shown
in the DOM as text (FR-012, clarified).

---

## R8 — Public README & LICENSE

**Decision**: A short root `README.md`: title + one-line pitch → screenshot of the comparison
screen → concise feature list (2–4 choices, weighted notes, group/sort, live score,
dark/light, UA/EN, local-only/no account/no tracking) → tech stack (TypeScript, Vite, Vitest;
`localStorage`; `mailto:`) → run locally (`yarn install` / `yarn dev` / `yarn test`) →
License (MIT) → Author (name + GitHub + LinkedIn links). English only. Add an MIT `LICENSE`
file. The README MUST NOT contain the contact email (clarified).

**Rationale**: Matches the product's minimal, welcoming tone; documents the *actual* plain-TS
stack (not the superseded Svelte target); accurate run instructions validated on a clean
checkout (FR-019/SC-007).

---

## R9 — Structure cleanup scope (FR-020/FR-021)

**Decision**: Keep churn minimal. The current layout is already coherent (pure logic,
`state.ts`, `persistence.ts`, `render/*`, `tests/{unit,dom}`). Cleanup is limited to: adding
`src/i18n/`, `src/mailto.ts`, `src/config.ts`, `src/render/footer.ts`, `src/render/suggest.ts`
in keeping with existing conventions; removing any dead code encountered; and routing all
visible literals through `t()`. We explicitly **do not** colocate tests or rename files — the
existing split is fine and reshuffling is not a clear win (FR-021). Behavior must not change;
the existing Vitest suite is the regression guard (FR-020/SC-008).

**Rationale**: "If needed & safe" — favor reviewable, low-risk additions over a broad refactor
that risks regressions for no user-visible gain.

---

## R10 — Localization coverage & testing strategy

**Decision**: Enumerate every user-facing string as a key in `en.ts` (header, toolbar,
choice placeholders, add/edit form, summary, empty states, footer, suggest modal, Clear
confirm). `uk.ts` mirrors the same keys. A unit test asserts `uk` has no key missing relative
to `en` (or, if intentionally absent, that `t('uk', key)` returns the English value, never a
raw key/blank) — guaranteeing SC-001/FR-005. DOM test flips the toggle and asserts copy
changes and the board is preserved (FR-006); reload test asserts persistence (FR-004).

**Rationale**: A key-parity test is the cheapest guarantee of "no raw keys / no blanks."

---

## Summary of decisions

| # | Area | Decision |
|---|------|----------|
| R1 | i18n | In-house flat catalogs + pure `t(lang,key,vars)`; EN fallback |
| R2 | Detection/persist | `view.lang`; pure `detectLang`; stored choice wins; detect on first visit |
| R3 | Migration | Backward-compatible optional `view.lang`; keep `sift.v1`/schema 1 |
| R4 | Modal | Native `<dialog>` + `showModal()`, state-backed, reconciled after render |
| R5 | Delivery | Pure `buildMailto`; `mailto:` hand-off; no network; LinkedIn fallback |
| R6 | Footer | Localized sentence, GitHub + LinkedIn links, AA in both themes |
| R7 | Config | `src/config.ts` identity constants; email only as hidden mailto target |
| R8 | README | Short MIT-licensed README documenting the plain-TS stack; no email |
| R9 | Cleanup | Minimal additive tidy; no test reshuffle; suite is the regression guard |
| R10 | Coverage | Key-parity + DOM toggle/persist tests guarantee SC-001/FR-005/FR-006 |
