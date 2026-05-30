# Contract: Render regions (`src/render/*`)

How localization, the footer, and the suggest dialog integrate with the MVP's full
region-re-render pipeline. Implements FR-003, FR-014..FR-017, US3 footer.

## Localization integration

- Every region function reads the active language from `state.view.lang` and routes **all
  visible copy** through `t(state.view.lang, key, vars?)`. No hard-coded user-facing English
  strings remain in `render/*` (test/grep-enforced where practical).
- Touched regions: `header.ts`, `toolbar.ts`, `choice.ts`, `addForm.ts`, `summary.ts`,
  `note.ts`, plus new `footer.ts`, `suggest.ts`, and the `index.ts` assembler.
- The `window.confirm` Clear text in `main.ts` is also localized via `t()`.
- Switching language calls `setLang`, which re-renders everything (FR-003); because rendering
  is a pure function of state, all `t()` outputs update at once in < 1s (SC-003) and the
  board is untouched (FR-006).

## Header — `render/header.ts`

- Adds, in the header (top area), kept calm/minimal (Constitution I):
  - an **EN/UA language toggle** (`data-action="set-lang"`, `data-lang="en|uk"`), showing the
    current selection; keyboard-operable (FR-003, V).
  - a quiet **"Suggest a feature"** text link (`data-action="open-suggest"`) — not a CTA
    (FR-007).
- Both labels via `t()`.

## Footer — `render/footer.ts` (new)

- Renders a localized sentence with `{name}` interpolated as a link:
  `t(lang, 'footer.madeBy', { name })` where the rendered name is an anchor to
  `config.GITHUB_URL`, plus a second muted `t(lang,'footer.linkedin')` link to
  `config.LINKEDIN_URL` (FR-015, FR-017).
- Small, muted inline links; MUST meet AA contrast in light **and** dark (FR-016) — reuse
  theme tokens in `styles/tokens.css`; add a muted-link token only if contrast requires.
- No email anywhere (I-S2).

## Assembler — `render/index.ts`

- Appends `${renderFooter(state)}` and `${renderSuggest(state)}` to the region output.
- The `<dialog>` markup is always present in the DOM; visibility is controlled by the
  imperative `showModal()`/`close()` reconcile (see contracts/suggestion.md), performed in the
  same post-render side-effect block that does `applyTheme` and focus/caret restoration.

## Styling — `styles/main.css` (+ tokens if needed)

- Footer: small, muted, unobtrusive; links underlined-on-hover, AA contrast both themes.
- `<dialog>`: calm card, `::backdrop` dim; respects existing spacing/tokens; readable in both
  themes; focus-visible rings preserved.
- Language toggle: compact, clearly indicates active language by more than color alone
  (e.g., active state has weight/underline, not just hue) — consistent with Constitution V.

## Tests (write first — `tests/dom/i18n.test.ts`)

- Boot in `uk` (stub `navigator.language='uk'`, no stored lang) → header/toolbar/footer copy
  is Ukrainian.
- Click the toggle → all visible copy switches; the dilemma/choices/notes are unchanged
  (FR-006); reload (re-init from persisted state) keeps the chosen language (FR-004).
- Footer renders GitHub + LinkedIn anchors with `config` URLs; no email text in DOM.
