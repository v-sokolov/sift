# Feature Specification: Sift Post-MVP Improvements

> **Status: Shipped — condensed 2026-06-09**

A batch of additive, post-MVP improvements layered onto the existing **plain-TS MVP** (no
UI framework, no runtime dependency, Constitution III). Four things shipped: UA/EN
localization, a Suggest-a-feature flow, an author footer, and a public README — plus a
light, low-risk structure tidy.

## What shipped

### UA/EN localization (US1)

All user-facing copy renders in either Ukrainian or English, driven by a single active
language stored on the device (`view.lang`).

- **First visit / no stored preference**: default to Ukrainian when the browser's primary
  language begins `uk` or `ru`, English otherwise (`detectLang`).
- **Header toggle** flips the language live (no reload), updating every visible string at
  once; the chosen language is persisted and **overrides** browser detection on later
  visits.
- **Switching language never touches the board** (question, choices, points, scores, view
  settings) — language is presentation, not decision data. Clear likewise preserves the
  current language.
- **Missing-key fallback**: a key with no Ukrainian value renders the English string — never
  a blank, never a raw key. English is the complete reference catalog.

Scope is exactly two languages, English default and fallback. No pluralization, no
date/number formatting, no async message loading, no route-based locales.

### Suggest a feature (US2)

A quiet, non-CTA "Suggest a feature" link in the header opens an accessible modal with a
form: name (required), description (required), and optional contact email, GitHub link,
LinkedIn link. Send stays disabled until name and description both contain non-whitespace
content. On Send, the user's own email client opens with a message addressed to the
maintainer, subject and body pre-filled from the entered fields — the app transmits and
stores **nothing** (`mailto:` hand-off, Constitution II).

The modal traps focus, closes on Esc / outside-click / close control, and returns focus to
the trigger. A quiet **LinkedIn** link is the fallback for users without a mail client; the
maintainer email is **never displayed** — it is only the hidden `mailto:` target. All form
labels and placeholders are localized.

### Author footer (US3)

A muted footer sentence links the author's name to their GitHub profile, with a second
quiet link to LinkedIn. Links meet AA contrast in both light and dark themes, stay
unobtrusive, and are localized. No email anywhere.

### Public README (US4)

A concise root `README.md` (English) in order: one-line pitch, a screenshot of the
comparison screen, a short feature list, the tech stack, local-run instructions (`yarn`),
the MIT license, and author links. Run instructions are accurate against a clean checkout.
An MIT `LICENSE` file ships alongside. The README never contains the contact email.

### Structure cleanup (cross-cutting)

Limited to clear, low-risk additions (new `src/i18n/`, `src/mailto.ts`, `src/config.ts`,
`render/footer.ts`, `render/suggest.ts`; dead-code removal; routing visible literals through
`t()`). No file renames or test reshuffles. Observable behavior is unchanged; the existing
test suite is the regression guard.

## Key decisions

- **Author identity is fixed**: display name **Vitalii Sokolov**, GitHub
  `https://github.com/v-sokolov`, LinkedIn `https://www.linkedin.com/in/vitalii-sokolov/`.
  Maintainer email `vetalsokolov4@gmail.com` is used **only** as the hidden `mailto:` target
  and appears nowhere in the UI or README.
- **No-mail-client fallback is the LinkedIn link**, never the email (clarified 2026-05-30).
- **`mailto:` over a form service**: keeps the app fully client-side — no network call, no
  third-party runtime, nothing stored.
- **Persisted `view.lang`** rather than a separate storage key; stored choice wins over
  detection. Load is forgiving (see `contracts/persistence-migration.md`): an old MVP payload
  with no `lang` is accepted, not rejected, and detection fills it.
- **Plain-TS stack retained**: the source design doc's Svelte 5 + Tailwind + Bits UI target
  was superseded; everything here is plain TypeScript on the MVP's accessible render
  patterns. (Phase-2 004 later rebuilt the UI on Svelte.)

## Contracts (surviving laws)

- `contracts/i18n.md` — EN/UA catalogs, the pure `t(lang, key, vars?)` resolution +
  interpolation law, `detectLang`, and catalog parity.
- `contracts/suggestion.md` — pure `buildMailto` composer (encoding, field omission,
  non-localized subject) and the modal flow / no-transmit guarantee.
- `contracts/persistence-migration.md` — backward-compatible optional `view.lang` on the
  unchanged `sift.v1` / schema 1 payload.

## Success criteria

- **SC-001**: 100% of user-facing strings render in the active language — no raw keys or
  blanks in either language.
- **SC-002**: First-time UA/RU-browser visitor sees Ukrainian; anyone else sees English, on
  load with no manual action.
- **SC-003**: A language switch updates the whole interface in under 1 second and survives a
  reload.
- **SC-004 / SC-005**: A user can complete the suggestion form and have their mail client
  open pre-composed in under a minute; the modal is fully keyboard-operable and closes on Esc
  with focus restored.
- **SC-006**: Footer and themed text meet AA contrast in both themes.
- **SC-007**: A newcomer following the README runs the app on the first attempt from a clean
  checkout.
- **SC-008**: The full automated suite passes after the cleanup with no user-facing behavior
  change.
