# Quickstart: UI Copy Refinements

## Prerequisites

- On branch `005-ui-copy-refinements`.
- `node_modules` already installed (yarn). Offline-safe: type-check + tests run without network.

## Make the changes (summary)

1. `src/i18n/en.ts` & `src/i18n/uk.ts`: add `header.tagline` and `summary.formula`; relabel the
   five umbrella-noun values (see `data-model.md`).
2. `src/components/Header.svelte`: add `.header__brand` (wordmark + tagline) and wrap input+tools
   in `.header__bar`.
3. `src/components/Summary.svelte`: append `<p class="summary__formula">` inside `.summary`.
4. `src/styles/app.css`: stack the header, add `.header__bar`/`.header__brand`/`.header__wordmark`/
   `.header__tagline` and `.summary__formula` rules.
5. `tests/components/i18n.test.ts`: add the tagline + formula assertions.

## Verify

```bash
yarn test           # all suites green (incl. i18n parity + new DOM assertions)
yarn build          # svelte-check (type-check) + production build
```

If the build's bundling step needs network and is offline, at minimum confirm:

```bash
yarn check          # svelte-check type-check only
yarn test
```

## Manual acceptance (dev server)

```bash
yarn dev
```

- Top of the app shows **Sift** (h1) + the tagline above the dilemma input.
- Switch language → tagline and the score caption text change; **Sift** stays the same.
- A single muted caption sits directly below the score band; it is not a `.sum` cell.
- The add-entry button reads **＋ add point** / **＋ додати пункт**; empty-state and field labels
  use point/«пункт»; advantage/disadvantage/neutral and «Варіант» are unchanged.
- Toggle light/dark → tagline and caption remain legible (WCAG AA).
- Typing in the decision-title input is uninterrupted (no focus loss).
