# Research & Decisions: Phase-2 UI Rebuild

Phase 0 output. The spec carries no `NEEDS CLARIFICATION` markers. The source research doc
(`docs/research/2026-05-30-phase2-ui-stack-research.md`) already decided the headline stack;
this document records the decisions that turn that into an executable, constitution-aligned
plan, and resolves the few open tooling choices.

---

## R1 — Reuse the pure core verbatim (the parity strategy)

**Decision**: Treat `types.ts`, `scoring.ts`, `view.ts`, `ids.ts`, `mailto.ts`, `config.ts`,
`persistence.ts`, and `i18n/*` as **framework-agnostic and frozen**. Reuse them unchanged,
in place, and keep their existing unit tests (`tests/unit/*`) running unedited.

**Rationale**: FR-001/SC-001 (zero functional regression) and SC-003 (saved boards load
intact) are guaranteed most cheaply by *not rewriting the logic that defines behavior*. The
only real logic in Sift lives in scoring/arrangement/persistence; all of it is already pure
and tested. The rebuild is therefore a presentation + store swap, not a logic rewrite —
which also keeps Constitution IV (pure core) trivially satisfied.

**Alternatives considered**: Reimplement logic idiomatically in Svelte — rejected: pure
gratuitous risk to parity with no benefit. Move pure files into `lib/domain/` — rejected:
churns every test import for cosmetic gain; keeping paths stable preserves the unedited-tests
guarantee.

---

## R2 — Svelte 5 runes store replacing the imperative store

**Decision**: Replace `state.ts` (custom pub/sub + `structuredClone` `update()`) with
`store.svelte.ts` exposing a `$state`-backed `AppState` and the **same mutation functions
with identical names, signatures, and invariants** (`addChoice`, `removeChoice`,
`submitForm`, `clearDilemma`, `toggleGroup`, `setTheme`/`cycleTheme`, `openSuggest`, …).
Invariants preserved exactly: 2–4 choices (MIN/MAX), `neutral ⇒ weight null`, new-note form
stays open while edits close it, Clear preserves language, boot lang/`setLastSaved` are
render-only (no save loop).

**Rationale**: Runes give reactivity and `bind:value` (the focus-loss fix, FR-002) while a
1:1 API port keeps the behavioral surface identical, so component tests can mirror the old
DOM tests. The existing store already models `theme`, so theming needs no schema change.

**Alternatives considered**: Keep the custom store and bolt Svelte on top — rejected:
two reactivity systems fighting; loses `bind:` ergonomics. Svelte stores (`writable`) —
rejected: runes are the idiomatic Svelte 5 path and compose better with `$derived` scores.

---

## R3 — Headless component library: Melt UI preferred, Bits UI fallback

**Decision**: Use **Melt UI builders** as the primary source for Select (choice selector),
Dialog/AlertDialog (Clear confirm + Suggest shell), Popover (Arrange), Toggle Group
(Type/Weight/Sort), and form/Textarea behavior; drop to **Bits UI**'s component API where a
builder is more boilerplate than a widget warrants. **shadcn-svelte is reference-only** (its
copy-source-into-repo model is disallowed by Principle III's "avoid copy-into-repo" clause).
Wrap each primitive in a thin `components/ui/*.svelte` so the rest of the app depends on a
small Sift-local surface, not the vendor API. Final per-widget pick is confirmed at
implementation (spec defers it; this is the shortlist deliverable).

**Rationale**: Headless/ownable primitives give us ARIA + focus management (Principle V,
FR-010..013) while we own markup/styling/motion for the calm bespoke look. Installed deps,
no copying — aligns with amended Principle III.

**Alternatives considered**: Pre-styled kits (Skeleton, Flowbite) — rejected: opinionated
styling fights the calm bespoke look and over-constrains a one-screen app. Hand-rolled ARIA
— rejected: re-implements exactly what these libraries exist to get right; higher a11y bug
risk.

---

## R4 — Tailwind v4, CSS-first tokens, theming

**Decision**: Adopt **Tailwind v4** via the `@tailwindcss/vite` plugin (zero-config,
build-time only). Migrate the existing design tokens from `src/styles/tokens.css` into a
CSS-first `@theme` block. Light/dark is driven by CSS custom properties switched on a
`data-theme` / `.dark` attribute on `<html>`, with `system` resolving `prefers-color-scheme`.

**Rationale**: Tailwind is held constant in the source doc's comparison and adds **no runtime
cost** (build-time CSS), so it is clean under Principle II/III. `@theme` tokens give one
source of truth for both palettes and make AA-contrast tuning explicit (FR-008/SC-005).

**Alternatives considered**: Keep hand-written CSS only — rejected: Tailwind speeds the fluid
responsive work (FR-014) and token theming; the doc already chose it. Runtime CSS-in-JS —
rejected: runtime cost + egression risk for no benefit.

---

## R5 — Theme application & no-flash pre-paint

**Decision**: A tiny **inline `<script>` in `index.html`** runs before Svelte mounts: it
reads the persisted theme from `localStorage['sift.v1'].view.theme` (falling back to
`system` → `prefers-color-scheme`, default light) and sets the `<html>` theme attribute
synchronously. `theme.ts` then owns runtime changes (toggle, persistence via the existing
store/persistence path, and a `matchMedia('(prefers-color-scheme: dark)')` listener so a
`system` user follows OS changes live).

**Rationale**: Applying the theme before first paint is the only way to satisfy FR-009 (no
wrong-theme flash). Reading the *existing* storage key avoids a second persisted datum and
keeps SC-003 intact.

**Alternatives considered**: Resolve theme only after mount — rejected: guarantees a flash.
A separate `theme` storage key — rejected: duplicates state already in `view.theme`; risks
divergence.

---

## R6 — Component testing: `@testing-library/svelte` + jsdom (not a browser runner)

**Decision**: Test Svelte components with **`@testing-library/svelte` on the existing jsdom
environment**. Keep pure-logic tests as plain Vitest (unchanged). Re-express each
`tests/dom/*` suite as a `tests/components/*` suite asserting the same behavior, and add
`theme.test.ts` + `a11y.test.ts`.

**Rationale**: This reuses the current jsdom Vitest setup and adds the **minimum** dev
dependency (Constitution III "minimal dev deps"). It keeps the suite fast and runner-only
(no Playwright/browser provider to install, configure, or run in CI on GitHub Pages).
`@testing-library` role/label queries also push tests toward accessibility assertions.

**Alternatives considered**: **`vitest-browser-svelte`** (the source doc's pick) — a real
browser via Playwright with auto-retrying `expect.element`. Rejected as the default: it adds
a browser-runner dependency and CI surface disproportionate to a one-screen app, against
Principle III. **It remains the documented fallback** if a future interaction needs true
browser fidelity (e.g. real focus/IME or layout-dependent behavior jsdom can't model). This
is the one place this plan deliberately diverges from the source research doc; flagged so it
can be overridden at implementation if real-browser testing is wanted.

---

## R7 — Motion: built-in Svelte transitions, reduced-motion gated

**Decision**: Use **built-in `svelte/transition`** (`fade`/`scale`/`slide`) for form/dialog/
popover enter-leave and **`animate:flip`** (`svelte/animate`) for note reordering on
Group/Sort — the single highest-value animation. No animation-library dependency. All motion
is gated by `prefers-reduced-motion` (a small reactive helper) and kept brief/subtle per the
calm ethos (FR-016..018, SC-008).

**Rationale**: Motion ships *in the Svelte language* at ~0 KB, covering all of Sift's needs
on-brand. Adding GSAP/Motion One/AutoAnimate would violate "minimal justified deps" for no
real gain.

**Alternatives considered**: AutoAnimate — deferred: only if `flip` wiring proves fiddly.
GSAP / showpiece libraries — rejected outright (off-ethos, heavy).

---

## R8 — Project metadata & MIT license

**Decision**: Fill `package.json` with `name`, `description`, `version`, `author` (name +
URL, no bare email beyond what config already uses for mailto), `repository`, `homepage`
(the GitHub Pages URL from 003), `keywords`, and `license: "MIT"`. Add an **MIT `LICENSE`**
at the repo root, © Vitalii Sokolov. The maintainer email stays **mailto-only** (config.ts /
suggestion flow) and is **not** added as visible site text (standing constraint).

**Rationale**: Completes FR-019/FR-020/SC-009; MIT is permissive and lets the author retain
copyright while keeping the project open.

**Alternatives considered**: No license / "all rights reserved" — rejected: contradicts the
open, public posture and the existing README credit. A copyleft license — rejected: heavier
than needed for a calm utility; MIT was specified.

---

## R9 — Offline-install adaptation (implementation reality)

**Decision**: During `/speckit-implement` the only reachable npm registry was the **Wix internal
mirror** (`npm.dev.wixpress.com`); public npm is blocked on this machine by a Palo Alto
**GlobalProtect content-filter** system extension (category-blocks package registries; allows
GitHub + the Wix mirror). The mirror carries the core stack but **not** `@melt-ui/svelte` nor
`@testing-library/svelte`. Adaptations, all within previously-documented fallbacks:

- **Component lib → Bits UI 2.18.1** (research R3's stated fallback) instead of Melt UI.
  Component-API (`<Dialog.Root>…`), less wiring; same accessible primitives (Select, Dialog/
  AlertDialog, Popover, ToggleGroup). Peer `@internationalized/date` added.
- **Testing → local helper** (`tests/svelte.ts`) using **Svelte 5 `mount()` + the cached
  `@testing-library/{dom,jest-dom,user-event}`** instead of `@testing-library/svelte` (which the
  mirror lacks). Keeps jsdom + minimal dev deps (Constitution III); `vitest-browser-svelte`
  remains the documented heavier fallback (R6).
- **`@sveltejs/vite-plugin-svelte` pinned `^4`** (4.0.4: peer `vite ^5` + `svelte ^5`) to stay on
  Vite 5 so the 003 deploy is unaffected (v5+ would force a Vite 6/7 upgrade).
- **Lockfile**: install resolves from the mirror, so `yarn.lock` is **gitignored** (a
  wixpress-pinned lock breaks the public GitHub Pages CI — the 003 gotcha). CI keeps resolving
  these public packages from public npm on the GitHub runner.

## Summary of decisions

| # | Area | Decision |
|---|------|----------|
| R1 | Parity | Reuse pure core (`scoring`/`view`/`persistence`/`mailto`/`i18n`/`types`/`config`/`ids`) verbatim; keep `tests/unit/*` unedited |
| R2 | Store | `store.svelte.ts` (runes) replaces `state.ts`; identical mutation API + invariants |
| R3 | Components | Melt UI preferred, Bits UI fallback, shadcn-svelte reference-only; thin `ui/` wrappers; final pick at impl |
| R4 | CSS | Tailwind v4 (`@tailwindcss/vite`), `@theme` tokens migrated from `tokens.css` |
| R5 | Theme | Inline pre-paint snippet reads `sift.v1`; `theme.ts` owns runtime + `matchMedia` listener; no flash |
| R6 | Testing | `@testing-library/svelte` + jsdom (minimal dev dep); `vitest-browser-svelte` documented fallback |
| R7 | Motion | Built-in `svelte/transition` + `animate:flip`; `prefers-reduced-motion` gated; no anim lib |
| R8 | Metadata | Full `package.json` metadata + MIT `LICENSE`; email stays mailto-only |
