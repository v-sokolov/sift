# Implementation Plan: Phase-2 UI Rebuild

> **Status: Shipped — condensed 2026-06-09**

Condensed to the unique architecture rationale. The shipped WHAT/WHY lives in
[`spec.md`](./spec.md); the decision log is [`research.md`](./research.md) (R1–R9); the
contracts hold the durable architecture (`contracts/{store,components,theming,motion}.md`,
[`data-model.md`](./data-model.md), [`mobile-responsive-matrix.md`](./mobile-responsive-matrix.md)).

## Stack

TypeScript 5.x strict + **Svelte 5 (runes)** + **Tailwind v4** (`@tailwindcss/vite`, build-
time, zero runtime) + **Bits UI 2.18.1** (headless primitives; peer `@internationalized/date`).
Vite 5 (kept — `@sveltejs/vite-plugin-svelte` pinned `^4` so the 003 deploy is unaffected),
Vitest on jsdom via a local `tests/svelte.ts` helper. Storage unchanged: `localStorage`
`sift.v1` (`PersistedV1`, `schemaVersion: 1`). Single client-side SPA on GitHub Pages, offline-
capable, no backend/network/telemetry.

## Architecture rationale (R1–R9)

- **R1 — Reuse pure core verbatim (parity strategy).** Treat `types/scoring/view/ids/mailto/
  config/persistence/i18n` as frozen, in place, with `tests/unit/*` unedited. *Rationale:* zero
  functional regression + saved-board compat are cheapest when the behavior-defining logic is
  not rewritten; keeps Constitution IV trivially satisfied. The rebuild is a presentation +
  store swap, not a logic rewrite.
- **R2 — Runes store replaces the imperative store.** `state.ts` → `store.svelte.ts`,
  `$state`-backed, **same mutation names/signatures/invariants**. *Rationale:* runes give
  reactivity + `bind:value` (the focus-loss fix) while a 1:1 API port keeps the behavioral
  surface identical so component tests mirror the old DOM tests; `theme` already modeled, no
  schema change.
- **R3 — Headless lib: Melt UI preferred, Bits UI fallback, shadcn reference-only.** Thin
  `components/ui/*` wrappers so the app depends on a Sift-local surface. *Rationale:* headless/
  ownable primitives supply ARIA + focus management (Principle V) while Sift owns the calm
  bespoke styling; installed deps, no copy-into-repo (Principle III).
- **R4 — Tailwind v4, CSS-first `@theme` tokens.** Migrate `tokens.css` into a `@theme` block;
  light/dark via CSS custom properties on a `<html>` attribute. *Rationale:* build-time only
  (no runtime cost, Principle II/III); one token source of truth makes AA-contrast tuning
  explicit; speeds the fluid responsive work.
- **R5 — No-flash pre-paint theme.** Inline `<script>` in `index.html` reads
  `sift.v1.view.theme` (fallback `system`→`prefers-color-scheme`→light) and sets `<html>`
  synchronously before mount; `theme.ts` owns runtime + a `matchMedia` listener. *Rationale:*
  pre-paint is the only way to satisfy "no wrong-theme flash"; reading the existing key avoids
  a second persisted datum.
- **R6 — Component tests on jsdom, not a browser runner.** `@testing-library`-style on the
  existing jsdom Vitest setup; re-express each `tests/dom/*` as `tests/components/*` + add
  theme/a11y suites. *Rationale:* minimum dev deps, fast, runner-only (no Playwright/CI
  surface) for a one-screen app; role/label queries push tests toward a11y.
  `vitest-browser-svelte` is the documented heavier fallback.
- **R7 — Built-in Svelte motion, reduced-motion gated.** `svelte/transition` (`fade`/`scale`/
  `slide`) for form/dialog/popover, `animate:flip` for note reorder; a reactive
  `prefersReducedMotion` helper suppresses non-essential motion. *Rationale:* motion ships in
  the language at ~0 KB and covers all needs on-brand; an animation library would violate
  "minimal justified deps."
- **R8 — Full `package.json` metadata + MIT `LICENSE`.** Name/description/version/author(name+
  URL)/repository/homepage(003 Pages URL)/keywords/`license: MIT`; LICENSE © Vitalii Sokolov;
  email stays mailto-only. *Rationale:* completes FR-019/FR-020; MIT keeps the project open
  while the author retains copyright.
- **R9 — Offline-install adaptation (impl reality).** Public npm blocked (GlobalProtect
  content-filter); only the Wix mirror reachable, which lacks `@melt-ui/svelte` and
  `@testing-library/svelte`. Adaptations, all within documented fallbacks: component lib →
  **Bits UI 2.18.1** (R3 fallback); testing → local `tests/svelte.ts` helper (Svelte `mount()`
  + cached testing-library); `vite-plugin-svelte` pinned `^4` (stay on Vite 5); `yarn.lock`
  gitignored (a wixpress-pinned lock breaks the public GitHub Pages CI — the 003 gotcha).

## Constitution Check

Evaluated against **Constitution v2.0.0**. **PASS, no violations** — Complexity Tracking
empty (the framework adoption is governed by amended Principle III, not a deviation).

- **I Calm Over Features** — no new product features; motion bounded by calm ethos + reduced-
  motion.
- **II Client-Side & Private** — Svelte/Bits UI/Tailwind are build-time/client-only; no
  backend, network, telemetry, or egress; data stays in `localStorage`. The hard boundary
  every dep was checked against.
- **III Deliberate Simplicity (v2.0.0)** — amended to permit a framework + minimal justified
  deps; each justified (Svelte fixes focus-loss + manual re-render; Bits UI = ownable a11y
  primitives; Tailwind = build-time). Pure core stays dependency-free. Would FAIL under v1.0.0.
- **IV Pure Core, Test-First (NON-NEGOTIABLE)** — pure core reused with passing tests; store
  invariants preserved; new components built test-first; type-check + green suite is the gate.
- **V Accessibility by Default** — headless primitives supply ARIA + focus management; weight
  shown by dot count + color (never color alone); Esc closes; full keyboard; AA both themes.

> This gate passes only because the constitution was amended to v2.0.0 first. If that
> amendment is ever reverted, this plan must be revisited.
