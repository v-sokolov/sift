# Contract: Sub-path Base (`vite.config.ts`)

Guarantees production builds resolve assets under the project sub-path while leaving local
development at root.

## Required change

Add a `base` field to the exported Vite/Vitest config, env-guarded:

```ts
import { defineConfig } from 'vitest/config';

// Minimal local typing so `tsc --noEmit` passes without @types/node (Constitution III).
declare const process: { env: Record<string, string | undefined> };

export default defineConfig({
  base: process.env.GITHUB_PAGES ? '/sift/' : '/',
  test: {
    environment: 'jsdom',
    include: ['tests/**/*.test.ts'],
  },
});
```

Note: `tsconfig.json` includes `vite.config.ts` and `@types/node` is not a dependency,
so the env var is read through a one-line ambient `process` declaration rather than a
types package — keeps dev dependencies minimal.

## Invariants

- `GITHUB_PAGES` truthy (set only by the deploy workflow's build step) ⇒ `base === '/sift/'`.
- `GITHUB_PAGES` unset (local `yarn dev`, `yarn preview`, `yarn test`) ⇒ `base === '/'`.
- The `test` block MUST remain unchanged; adding `base` MUST NOT affect Vitest runs.
- The sub-path literal MUST be `/sift/` (matches the repo name; the project page serves at
  `https://v-sokolov.github.io/sift/`).

## Acceptance (maps to spec)

- Production build's `index.html` references assets under `/sift/...` → zero 404s when
  served from the project sub-path. (FR-004, SC-001)
- `yarn dev` / `yarn preview` still serve correctly from `/`. (FR-005)
- `yarn test` behavior is identical to before. (Constitution IV — suite stays green)

## Verification

- Local: `GITHUB_PAGES=true yarn build` then inspect `dist/index.html` — asset URLs begin
  with `/sift/`. Unset build → asset URLs begin with `/`.
- `yarn preview` (no env) serves at root without 404s.
