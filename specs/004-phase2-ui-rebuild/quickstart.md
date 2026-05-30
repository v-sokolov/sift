# Quickstart: Phase-2 UI Rebuild

A presentation + store rebuild on **Svelte 5 + Tailwind v4 + a headless component library**,
reusing Sift's pure core verbatim. Enabled by **Constitution v2.0.0** (Principle III permits
a framework + minimal, justified runtime deps).

## What changes

- **Reused unchanged**: `src/{types,scoring,view,ids,mailto,config,persistence}.ts`,
  `src/i18n/*`, and all of `tests/unit/*` (the parity contract).
- **Replaced**: `src/state.ts` → `src/store.svelte.ts` (runes); `src/render/*` →
  `src/components/*.svelte`; `src/main.ts` (mounts `App.svelte`); `src/styles/*` →
  `src/styles/app.css` (Tailwind v4 `@theme`). `tests/dom/*` → `tests/components/*`.
- **Added**: `src/theme.ts`, `index.html` pre-paint snippet, `LICENSE` (MIT), full
  `package.json` metadata, Svelte + Tailwind Vite plugins.

## New dependencies (all client-side / build-time — Constitution II safe)

- Runtime: `svelte`, a headless lib (**Melt UI** preferred, **Bits UI** fallback).
- Dev/build: `@sveltejs/vite-plugin-svelte`, `@tailwindcss/vite` + `tailwindcss`,
  `svelte-check`, `@testing-library/svelte` (+ `@testing-library/dom`/`jest-dom` as needed).
- **Not** added: any browser-test runner (jsdom is reused — research R6),
  any animation library (Svelte built-ins — research R7).

Install with **yarn** (project standard): `yarn add ...` / `yarn add -D ...`.

## Verify locally

```bash
yarn check        # svelte-check (type gate — checks both .ts and .svelte)
yarn test         # Vitest: tests/unit/* (unchanged) + tests/components/* (new) green
yarn dev          # manual smoke at /
GITHUB_PAGES=true yarn build   # production sub-path build (from feature 003) still works
```

## Parity & acceptance checklist (maps to spec)

- **Feature parity (US1/SC-001)**: create dilemma → add/name up to 4 choices → add/edit/
  remove notes → Group/Sort → score → Clear all behave as the current app.
- **No focus loss (US1/FR-002/SC-002)**: type continuously in title, a choice name, and a
  note — focus/caret never jump; score updates live.
- **Saved board loads (US1/SC-003)**: a board saved by the current app loads intact.
- **Theme (US2)**: OS dark ⇒ dark on first load; toggle switches + persists; no flash.
- **Keyboard (US3/SC-004)**: complete a full comparison with no mouse; Esc closes form/
  dialog/popover; arrows drive Select/Toggle Group; focus always visible.
- **Responsive (US4/SC-007)**: resize 320px→≥1440px — cards reflow column↔stack, no
  horizontal scroll/overlap.
- **Motion (US5/SC-008)**: Group/Sort glides notes; enable reduced-motion ⇒ no non-essential
  animation.
- **Metadata + license (US6/SC-009)**: `package.json` complete; MIT `LICENSE` at root.

## Constraints carried over

- No backend / network / telemetry; offline-capable; `localStorage` key `sift.v1` unchanged.
- Maintainer email stays **mailto-only** (config.ts) — never rendered as visible site text.
- GitHub Pages deploy (003) unaffected: same `GITHUB_PAGES` base, same workflow.

## Where things live

- Pure core (frozen): `src/{scoring,view,persistence,mailto,types,config,ids}.ts`, `src/i18n/*`
- Store: `src/store.svelte.ts` (contract: `contracts/store.md`)
- Components: `src/components/*` + `src/components/ui/*` (contract: `contracts/components.md`)
- Theming: `src/styles/app.css`, `src/theme.ts`, `index.html` (contract: `contracts/theming.md`)
- Motion: Svelte built-ins (contract: `contracts/motion.md`)

See `plan.md` for the Constitution Check (v2.0.0 PASS) and `research.md` (R1–R8) for decisions.
