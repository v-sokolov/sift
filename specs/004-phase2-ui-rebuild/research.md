# Research & Decisions: Phase-2 UI Rebuild

> **Status: Shipped — condensed 2026-06-09**

Decision log (R1–R9) that turned the headline stack into an executable, constitution-aligned
plan. Trimmed to Decision + Rationale; key alternatives kept only where load-bearing.

## R1 — Reuse the pure core verbatim (parity strategy)

**Decision**: Treat `types.ts`, `scoring.ts`, `view.ts`, `ids.ts`, `mailto.ts`, `config.ts`,
`persistence.ts`, `i18n/*` as framework-agnostic and frozen; reuse unchanged in place, keep
`tests/unit/*` unedited.

**Rationale**: FR-001/SC-001 (zero regression) and SC-003 (saved boards load intact) are
cheapest when the behavior-defining logic is not rewritten — all real logic is already pure
and tested. The rebuild is a presentation + store swap, keeping Constitution IV trivially
satisfied. Keeping paths stable preserves the unedited-tests guarantee (reimplementing or
moving files was rejected as gratuitous parity risk / test churn).

## R2 — Svelte 5 runes store replacing the imperative store

**Decision**: Replace `state.ts` (custom pub/sub + `structuredClone`) with `store.svelte.ts`
exposing a `$state`-backed `AppState` and the **same mutation functions, signatures, and
invariants** (2–4 choices, `neutral ⇒ weight null`, new-note form stays open / edit closes,
Clear preserves lang, boot lang / `setLastSaved` render-only).

**Rationale**: runes give reactivity + `bind:value` (the focus-loss fix, FR-002) while a 1:1
API port keeps the behavioral surface identical, so component tests mirror the old DOM tests;
`theme` already modeled so theming needs no schema change.

## R3 — Headless component library: Melt UI preferred, Bits UI fallback

**Decision**: Melt UI builders as primary (Select, Dialog/AlertDialog, Popover, Toggle Group,
form/Textarea), drop to Bits UI's component API where a builder is more boilerplate than
warranted. shadcn-svelte reference-only (copy-into-repo disallowed by Principle III). Wrap
each primitive in a thin `components/ui/*.svelte`.

**Rationale**: headless/ownable primitives supply ARIA + focus management (Principle V,
FR-010..013) while Sift owns markup/styling/motion for the calm bespoke look; installed deps,
no copying. Pre-styled kits (Skeleton/Flowbite) rejected (opinionated styling fights the calm
look); hand-rolled ARIA rejected (re-implements what these libs get right).

## R4 — Tailwind v4, CSS-first tokens, theming

**Decision**: Tailwind v4 via `@tailwindcss/vite` (zero-config, build-time only); migrate
`src/styles/tokens.css` into a CSS-first `@theme` block; light/dark via CSS custom properties
on a `data-theme`/`.dark` `<html>` attribute; `system` resolves `prefers-color-scheme`.

**Rationale**: build-time CSS adds no runtime cost (clean under II/III); `@theme` tokens are
one source of truth for both palettes, making AA-contrast tuning explicit (FR-008/SC-005).

## R5 — Theme application & no-flash pre-paint

**Decision**: a tiny inline `<script>` in `index.html` runs before mount, reads
`localStorage['sift.v1'].view.theme` (fallback `system` → `prefers-color-scheme` → light), and
sets the `<html>` theme attribute synchronously. `theme.ts` owns runtime changes + a
`matchMedia('(prefers-color-scheme: dark)')` listener so `system` users follow OS live.

**Rationale**: pre-paint is the only way to satisfy FR-009 (no wrong-theme flash); reading the
existing key avoids a second persisted datum and keeps SC-003 intact.

## R6 — Component testing: testing-library + jsdom (not a browser runner)

**Decision**: test components with `@testing-library`-style queries on the existing jsdom
Vitest environment; keep pure-logic tests as plain Vitest; re-express each `tests/dom/*` as
`tests/components/*` and add `theme.test.ts` + `a11y.test.ts`.

**Rationale**: reuses the current jsdom setup with the minimum dev dep (Principle III), keeps
the suite fast and runner-only (no Playwright/CI surface) for a one-screen app; role/label
queries push tests toward a11y. `vitest-browser-svelte` (the source doc's pick) is the
documented heavier fallback if true browser fidelity is ever needed — the one place this plan
deliberately diverges from the source research.

## R7 — Motion: built-in Svelte transitions, reduced-motion gated

**Decision**: built-in `svelte/transition` (`fade`/`scale`/`slide`) for form/dialog/popover
and `animate:flip` (`svelte/animate`) for note reorder on Group/Sort (the highest-value
animation). No animation-library dependency; all motion gated by `prefers-reduced-motion`,
brief/subtle per the calm ethos (FR-016..018, SC-008).

**Rationale**: motion ships in the Svelte language at ~0 KB, covering all needs on-brand;
GSAP/Motion One/AutoAnimate would violate "minimal justified deps" for no real gain
(AutoAnimate deferred to only-if-`flip`-proves-fiddly).

## R8 — Project metadata & MIT license

**Decision**: fill `package.json` with `name`, `description`, `version`, `author` (name + URL),
`repository`, `homepage` (003 Pages URL), `keywords`, `license: "MIT"`; add an MIT `LICENSE` at
repo root © Vitalii Sokolov. Maintainer email stays mailto-only (config.ts / suggest flow),
never visible site text.

**Rationale**: completes FR-019/FR-020/SC-009; MIT is permissive and lets the author retain
copyright while keeping the project open.

## R9 — Offline-install adaptation (implementation reality)

**Decision**: the only reachable npm registry was the **Wix internal mirror**
(`npm.dev.wixpress.com`); public npm is blocked by a Palo Alto GlobalProtect content-filter
(allows GitHub + the Wix mirror). The mirror lacks `@melt-ui/svelte` and
`@testing-library/svelte`. Adaptations, all within previously-documented fallbacks:

- **Component lib → Bits UI 2.18.1** (R3's stated fallback): component API (`<Dialog.Root>…`),
  less wiring, same accessible primitives. Peer `@internationalized/date` added.
- **Testing → local helper** (`tests/svelte.ts`): Svelte 5 `mount()` + cached
  `@testing-library/{dom,jest-dom,user-event}` instead of `@testing-library/svelte`. Keeps
  jsdom + minimal dev deps (III); `vitest-browser-svelte` remains the documented heavier
  fallback (R6).
- **`@sveltejs/vite-plugin-svelte` pinned `^4`** (4.0.4: peer `vite ^5` + `svelte ^5`) to stay
  on Vite 5 so the 003 deploy is unaffected.
- **Lockfile**: install resolves from the mirror, so `yarn.lock` is **gitignored** (a
  wixpress-pinned lock breaks the public GitHub Pages CI — the 003 gotcha). CI resolves these
  public packages from public npm on the runner.

## Summary of decisions

| # | Area | Decision |
|---|------|----------|
| R1 | Parity | Reuse pure core verbatim; keep `tests/unit/*` unedited |
| R2 | Store | `store.svelte.ts` (runes) replaces `state.ts`; identical mutation API + invariants |
| R3 | Components | Melt UI preferred, Bits UI fallback, shadcn reference-only; thin `ui/` wrappers |
| R4 | CSS | Tailwind v4 (`@tailwindcss/vite`), `@theme` tokens migrated from `tokens.css` |
| R5 | Theme | Inline pre-paint reads `sift.v1`; `theme.ts` owns runtime + `matchMedia`; no flash |
| R6 | Testing | testing-library + jsdom (minimal dev dep); `vitest-browser-svelte` fallback |
| R7 | Motion | Built-in `svelte/transition` + `animate:flip`; reduced-motion gated; no anim lib |
| R8 | Metadata | Full `package.json` metadata + MIT `LICENSE`; email stays mailto-only |
| R9 | Install | Bits UI + local test helper (offline mirror); plugin-svelte `^4`; gitignored lock |
