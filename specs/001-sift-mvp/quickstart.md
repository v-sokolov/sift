# Quickstart: Sift MVP

A minimalist, fully client-side decision-weighing app. No backend, no account.

## Prerequisites

- Node.js 18+ (for Vite 5 / Vitest)
- A modern browser

## Setup

```bash
yarn install       # installs vite, typescript, vitest, jsdom (dev deps only)
yarn dev           # start Vite dev server → open the printed localhost URL
```

## Scripts (package.json)

| Script | Does |
|--------|------|
| `yarn dev` | Vite dev server with HMR |
| `yarn build` | Type-check + Vite production build → `dist/` (static) |
| `yarn preview` | Serve the built `dist/` locally |
| `yarn test` | Run Vitest (unit + jsdom DOM tests) |
| `yarn test:watch` | Vitest watch mode |

## Deploy

`yarn build` emits a fully static `dist/`. Host it anywhere static
(GitHub Pages, Netlify, any file server). No environment variables, no server.

## Manual smoke test (maps to spec acceptance scenarios)

1. **Create & compare (US1)** — Open the app. Type a question in the header. You start
   with two choices; click **＋ Add choice** to add a third (count shows `3 / 4`). Open
   the note form, add an advantage `●●●` and a disadvantage `●` to a choice → its score
   reads `+2`, totals `3 / 1`. Add a neutral note → numbers unchanged. The highest-
   scoring choice gets a gentle highlight; tie two choices → both highlight.
2. **Persist (US2)** — Reload the page → everything restored. Click **Clear**, confirm →
   back to the empty default (blank question, two empty starter choices, scores `0`).
3. **Organize (US3)** — With several mixed notes, toggle **Group** → sections
   Advantages → Disadvantages → Neutral. Toggle **Sort** → Group turns off; notes flatten
   and sort by the chosen key/direction. Reload → the view mode is remembered.
4. **Accessible & calm (US4)** — Switch light/dark; weights still readable by dot count
   alone. Open the note form, press **Esc** → it closes. A fresh board shows calm
   placeholders, never blank cards.

## Where things live

- Pure logic (unit-tested): `src/scoring.ts`, `src/view.ts`
- State + mutations: `src/state.ts` (see `contracts/state-store.md`)
- Save/load: `src/persistence.ts` (key `sift.v1`, 400ms debounce — see `contracts/persistence.md`)
- Rendering: `src/render/*` (full region re-render from state, event delegation on `#app`)
- Boot: `src/main.ts`

See `plan.md` for architecture and `data-model.md` for the types.
