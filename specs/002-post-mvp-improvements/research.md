# Research & Decisions: Sift Post-MVP Improvements

> **Status: Shipped — condensed 2026-06-09.** Rejected-alternative write-ups and TDD
> ceremony removed; the decisions that still back the contracts remain.

## R1 — Localization mechanism

In-house flat dictionaries, one module per language (`src/i18n/en.ts`, `uk.ts`), each a
`Record<string, string>`, gathered in `messages: Record<Lang, Catalog>`. A **pure**
`t(lang, key, vars?)` resolves `messages[lang][key]` → `messages.en[key]` → the key itself
(the last step is forbidden for real keys by a parity test). `{name}`-style interpolation
only; no pluralization or date/number formatting. Zero runtime dependency; `lang` is passed
explicitly (no global) so render stays deterministic. (Law: `contracts/i18n.md`.)

## R2 / R3 — Detection, persistence & migration

Language is a persisted view preference: `lang: Lang` on `ViewPrefs`, stored under the
existing `sift.v1` key, **schema stays 1**. Pure `detectLang(navigatorLanguage)` →
`startsWith('uk')`/`startsWith('ru')` ⇒ `'uk'`, else `'en'`. Boot: a valid stored
`view.lang` wins (FR-004); otherwise detect (FR-002, default `en`).

`view.lang` is **optional/forgiving on load** — `validView` still requires the original four
fields, and a missing/invalid `lang` is replaced by detection rather than rejecting the
payload. This protects existing MVP `sift.v1` boards (no `lang`) from being wiped. Writes
always include `view.lang`. (Law: `contracts/persistence-migration.md`.)

## R4 — Suggest-a-feature modal

A state-backed modal (`state.suggest = { open, draft, status:'idle' }`, never persisted),
rendered through the existing innerHTML pipeline and reconciled imperatively after each
render. **Shipped as a custom accessible overlay** (`role="dialog"`, `aria-modal="true"`)
with focus-into-modal on open, focus-return on close, Esc-to-close, a Tab focus-trap, and
backdrop-click close — all in `main.ts`. Native `<dialog>.showModal()` was the original
plan but is unimplemented in jsdom 26 and conflicts with re-calling after full re-render, so
it was superseded. (Law: `contracts/suggestion.md`.)

## R5 — Submission via `mailto:` (no network)

Pure `buildMailto(draft, to)` returns `mailto:<to>?subject=<enc>&body=<enc>`: a readable
body template of Name/Description plus any non-empty optional fields, every value
`encodeURIComponent`-d, empty optionals omitted. The subject is a **non-localized constant**
(keeps the composer language-agnostic and the maintainer's inbox consistent). Fired via
`window.location.href`; the maintainer address comes from `config.ts` and is never rendered.
No submitting/success/error states. Whitespace-only Name/Description ⇒ Send disabled. (Law:
`contracts/suggestion.md`.)

## R6 / R7 — Footer & author constants

`render/footer.ts` renders a localized sentence with the author name plus muted GitHub and
LinkedIn links, AA-contrast in both themes (reuse theme tokens). All identity lives in
`src/config.ts`: `AUTHOR_NAME = 'Vitalii Sokolov'`, `GITHUB_URL`, `LINKEDIN_URL`,
`CONTACT_EMAIL` (only ever the hidden `mailto:` target — never shown as text).

## R8 — README & LICENSE

Short English root `README.md`: pitch → comparison-screen screenshot → feature list → tech
stack (TypeScript, Vite, Vitest; `localStorage`; `mailto:`) → run locally
(`yarn install`/`yarn dev`/`yarn test`) → MIT license → author links. Documents the actual
plain-TS stack (not the superseded Svelte target); contains no contact email. MIT `LICENSE`
file added.

## R9 / R10 — Cleanup scope & coverage

Minimal additive tidy only (new `i18n/`, `mailto.ts`, `config.ts`, `render/footer.ts`,
`render/suggest.ts`; dead-code removal; literals routed through `t()`). No file renames, no
test reshuffle — the existing Vitest suite is the regression guard. Coverage rests on a
key-parity test (every `uk` key exists in `en`; every rendered key is non-blank in both) plus
DOM tests that flip the toggle (board preserved) and reload (language persists).
