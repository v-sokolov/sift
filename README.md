# Sift

**A quiet way to weigh a decision.** Compare 2–4 options with weighted pros & cons and a
calm summary score — entirely in your browser, with nothing to sign up for.

Sift is for thinking, not deciding for you: the score is a gentle nudge, never a verdict.
It stays deliberately simple — each advantage adds its weight (1–3), each disadvantage
subtracts it, and neutral notes don't count.

**Live:** https://v-sokolov.github.io/sift/ — published to GitHub Pages; every push to
`main` auto-deploys via GitHub Actions.

<!-- Screenshot: add ./assets/screenshot.png (comparison screen) once captured. -->

## Features

- Compare **2–4 choices** side by side
- **Weighted notes** — advantages, disadvantages, and neutral notes (weight shown by dot
  count *and* colour, never colour alone)
- **Group / Sort** views and a gentle, always-visible **score**
- **Light / dark** themes
- **Ukrainian / English** — auto-detected, switchable, remembered
- **Local-only** — your data lives in your browser; no account, no backend, no tracking

## Tech stack

- **TypeScript** (strict) + **Vite**
- **Vitest** + jsdom for tests
- No UI framework and **no runtime dependencies**
- Persistence via `localStorage`; the "Suggest a feature" form hands off through a
  `mailto:` link (no network calls)

> Built almost end-to-end with **Claude Opus 4.8 (1M context)** — using the
> **Superpowers** skill workflows and **Spec Kit** (SDD — spec-driven development) —
> from brainstorming and specs through planning and implementation.

## Run locally

```bash
yarn install
yarn dev      # start the dev server, then open the printed localhost URL
yarn test     # run the unit + DOM test suites
yarn build    # type-check + production build → dist/ (static)
```

## License

[MIT](./LICENSE)

## Author

Made by **Vitalii Sokolov** — [GitHub](https://github.com/v-sokolov) ·
[LinkedIn](https://www.linkedin.com/in/vitalii-sokolov/)
