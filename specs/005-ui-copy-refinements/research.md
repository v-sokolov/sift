# Research: UI Copy Refinements

All decisions below resolve the Technical Context with no remaining NEEDS CLARIFICATION. This is
a copy/markup/CSS feature; "research" here records the design decisions and the existing-code
facts they rely on.

## R1 — Header restructure (brand + tagline above the input)

**Decision**: Change `<header>` from a flex row to a vertical stack. Prepend a `.header__brand`
block (`<h1 class="header__wordmark">Sift</h1>` + `<p class="header__tagline">{t(lang,
'header.tagline')}</p>`), and wrap the existing `.header__title` input and `.header__tools` in a
new `.header__bar` flex row. Move the current row layout rules onto `.header__bar`.

**Rationale**: Keeps the input + tools row exactly as-is (no focus or behavior change) while
adding a static intro above it. `.header__title`, `.header__tools`, `.linklike`, and the
placeholder rule are untouched. The wordmark is a hardcoded literal `Sift` (never via `t()`),
satisfying FR-002.

**Alternatives considered**: (a) Put the tagline inside the existing row — rejected: clutters the
input row and fights wrap behavior. (b) A separate component — rejected: YAGNI; two static
elements belong in `Header.svelte`.

## R2 — Tagline/caption copy source & localization

**Decision**: Add `header.tagline` and `summary.formula` to both `en.ts` and `uk.ts` under their
`// Header` / `// Summary` sections, using the maintainer-supplied verbatim strings. Render via
the existing `t(lang, key)` lookup; both components already derive `lang` from
`getState().view.lang`.

**Rationale**: Matches the established key-based i18n pattern; the parity test in
`tests/unit/i18n.test.ts` enforces that both catalogs carry every key, and the "no blank/raw key"
test covers value presence — so adding to both catalogs is sufficient and self-verifying.

**Alternatives considered**: Hardcoding English copy in markup — rejected: breaks i18n parity and
language switching (FR-003, FR-005).

## R3 — Score-formula caption placement

**Decision**: Append `<p class="summary__formula">{t(lang, 'summary.formula')}</p>` after the
`{#each}` block but still inside `<section class="summary">`. The caption MUST NOT carry the
`sum` class.

**Rationale**: `.summary` is a CSS grid; a full-width child spanning `grid-column: 1 / -1` sits
naturally below the score cells using the existing grid `gap`. Existing tests query `.summary
.sum` for score cells; keeping the caption off the `sum` class preserves those assertions
(FR-006, SC-003). `Summary.svelte` already imports `t` and derives `lang`.

**Alternatives considered**: Rendering the caption outside `<section class="summary">` — rejected:
the spec wants it visually attached to the score band, and grid spacing already handles it.

## R4 — "note" → "point" relabel scope

**Decision**: Change only the *displayed values* of exactly five keys per catalog:
`choice.empty`, `note.empty`, `form.addNote`, `form.noteTypeAria`, `form.textAria`. Keep all key
names, the `Note`/`NoteType` code identifiers, the `noteType.*` type words
(advantage/disadvantage/neutral), and `note.emptyShort`, `note.weightLabel`, `note.editAria`,
`form.type*`, `group.*`, and the placeholders (`form.textPlaceholder`) unchanged.

**Rationale**: The umbrella noun is purely presentational; the underlying concept, data, and
scoring are unchanged (FR-007, FR-008, FR-010). UA «пункт» is masculine inanimate; the supplied
declensions (пунктів / порожній пункт / додати пункт / Тип пункту / Текст пункту) are correct.
No component edits are needed because these strings already render through `t()`.

**Alternatives considered**: Renaming code identifiers/keys to `point.*` — rejected: large,
risky, and out of scope; the relabel is display-only.

## R5 — Calm styling + WCAG AA verification

**Decision**: Style `.header__wordmark` (1.5rem, weight 700, `--text`), `.header__tagline`
(0.95rem, `--text-muted`, `max-width: 60ch`, line-height 1.5), and `.summary__formula`
(0.85rem, `--text-muted`, centered, `grid-column: 1 / -1`). No accent colors, no bold on body
copy. Verify `--text-muted` meets ≥ 4.5:1 against the background in BOTH light and dark themes; if
either fails, use `--text` for that element.

**Rationale**: Principle I (calm) and Principle V (AA contrast in both themes). `--text-muted` is
defined per-theme; verification is a required step, not an assumption.

**Alternatives considered**: Accent-colored or bold intro — rejected: violates the calm ethos.

## R6 — Test strategy

**Decision**: Add two DOM `it()` cases to the "US1 — localization at the DOM level" describe in
`tests/components/i18n.test.ts`: assert `.header__tagline` and `.summary__formula` `textContent`
equal `messages.en[key]` by default and `messages.uk[key]` after `setLang('uk')` + `flushSync()`.
Keep existing `.summary .sum` queries green. The unit-level i18n parity / no-blank-key tests need
no edits — they iterate the catalogs and automatically cover the two new keys and the five
relabeled values.

**Rationale**: Mirrors the existing component-test pattern (render App via the local helper,
`flushSync()` after state changes). Satisfies SC-002, SC-005, SC-007 and the test-first gate.

**Alternatives considered**: Snapshot tests — rejected: brittle for copy; key-equality assertions
are precise and localization-aware.
