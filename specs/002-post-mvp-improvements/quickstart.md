# Quickstart: Sift Post-MVP Improvements

Builds on the MVP quickstart (`specs/001-sift-mvp/quickstart.md`). Same plain-TS stack, same
scripts — no new runtime dependencies.

## Prerequisites

- Node.js 18+ and **yarn** (project package manager).
- A modern browser.

## Setup

```bash
yarn install       # dev deps only: vite, typescript, vitest, jsdom
yarn dev           # Vite dev server → open the printed localhost URL
yarn test          # Vitest unit + jsdom DOM tests
yarn build         # tsc --noEmit + vite build → static dist/
```

## What's new in this feature

- **UA/EN localization** — every label routed through `t(lang, key)`; browser-detected on
  first visit (uk/ru → Ukrainian, else English), with a header toggle that persists.
- **Suggest a feature** — a quiet header link opening a native `<dialog>`; Send composes a
  `mailto:` to the maintainer (no network call, nothing stored).
- **Author footer** — localized sentence with GitHub + LinkedIn links.
- **Public README** — short, friendly, MIT, documents the plain-TS stack.

## Manual smoke test (maps to spec user stories)

1. **Localization (US1)** — Clear `localStorage` for the site. Set the browser/OS language to
   Ukrainian and load → the whole UI is Ukrainian. Set it to English (or anything non-uk/ru)
   and reload → English. Use the header **EN/UA** toggle → all copy flips instantly and your
   current question/choices/notes are untouched. Reload → the chosen language sticks
   regardless of browser language.
2. **Suggest a feature (US2)** — Click **Suggest a feature** in the header → an accessible
   dialog opens with focus inside it. The **Send** button stays disabled until both Name and
   Description have non-whitespace text. Fill them (plus optional contact/links) and Send →
   your email client opens with a message to the maintainer pre-filled from the fields; the
   dialog closes. Press **Esc** (or click the backdrop) → it closes and focus returns to the
   link. Confirm the maintainer's email is **never shown** on screen, and a quiet **LinkedIn**
   link is available as the no-mail-client fallback. Switch language while open → labels
   re-translate, entered text preserved.
3. **Author footer (US3)** — Read the footer sentence; the author name is plain text, with a
   GitHub profile link and a LinkedIn profile link beside it. Toggle light/dark → links stay
   legible (AA) and calm. Toggle EN/UA → the sentence is localized.
4. **README (US4)** — Open `README.md`: title + one-line pitch, screenshot, feature list,
   tech stack, `yarn install/dev/test`, MIT license, author links — and no email. Follow the
   run steps on a clean checkout → the app starts.
5. **Refactor safety** — `yarn test` is green and `yarn build` succeeds; no user-facing
   behavior changed versus the MVP (SC-008).

## Where new things live

- Localization: `src/i18n/{index,en,uk}.ts` (pure `t`, `detectLang`)
- Mailto compose: `src/mailto.ts` (pure `buildMailto`)
- Author constants: `src/config.ts` (email only as hidden mailto target)
- Footer & dialog: `src/render/footer.ts`, `src/render/suggest.ts`
- Language state/persistence: `src/state.ts` (`setLang`, suggest mutations),
  `src/persistence.ts` (forgiving `view.lang`)
- README/LICENSE: repo root

See `plan.md` for architecture, `data-model.md` for types, and `contracts/` for the i18n,
suggestion, persistence-migration, and render-region contracts.
