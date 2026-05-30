# Sift

**A quiet way to weigh a decision.** Compare 2–4 options with weighted pros & cons and a
calm summary score — entirely in your browser, with nothing to sign up for.

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
