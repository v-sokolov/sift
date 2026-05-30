# Implementation Plan: Phase-2 UI Rebuild

**Branch**: `004-phase2-ui-rebuild` | **Date**: 2026-05-30 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/004-phase2-ui-rebuild/spec.md`

## Summary

Rebuild Sift's presentation layer on **Svelte 5 (runes) + Tailwind v4 + a headless
component library (Melt UI preferred, Bits UI fallback)**, tested with Vitest. The rebuild
changes **no product behavior**: the framework-agnostic pure core — `scoring.ts`, `view.ts`,
`types.ts`, `persistence.ts`, `mailto.ts`, `config.ts`, `ids.ts`, `i18n/` — is **reused
verbatim** (its existing unit tests are the parity contract). Only the imperative store
(`state.ts`) and the imperative DOM renderers (`render/*`, `main.ts`, `styles/*`) are
replaced: the store becomes a Svelte-runes module preserving every mutation signature and
invariant, and each render region becomes a Svelte component using `bind:value` (which
structurally eliminates the focus-loss problem that motivated the rebuild). The work adds
full dark/light theming with pre-paint, headless-primitive keyboard accessibility, a fluid
responsive layout, calm `prefers-reduced-motion`-aware motion, and complete project
metadata + an MIT `LICENSE`.

This plan is enabled by **Constitution v2.0.0**, whose amended Principle III permits a
framework + minimal, justified runtime dependencies bounded by Principle II
(client-side/private). See the Constitution Check below.

## Technical Context

**Language/Version**: TypeScript 5.x (strict) + Svelte 5 (runes mode); ESNext modules.

**Primary Dependencies** (runtime, all client-side, zero network/egress):
- **Svelte 5** — reactive compiler; ~few-KB runtime; `$state`/`$derived` remove manual
  re-render and the focus-loss bug.
- **Headless component library — Bits UI 2.18.1** — accessible component-API primitives
  (Select, Dialog/AlertDialog, Popover, Toggle Group, form/Textarea). Chosen over Melt UI
  during implementation because the offline registry lacks `@melt-ui/svelte`; Bits UI was the
  documented research-R3 fallback (see R9). Peer: `@internationalized/date`.
- **Tailwind v4** via `@tailwindcss/vite` — build-time utility CSS, CSS-first `@theme`
  tokens; **no runtime cost**.

**Build tooling (dev)**: Vite 5, `@sveltejs/vite-plugin-svelte`, `@tailwindcss/vite`,
`svelte-check` (Svelte+TS typecheck), TypeScript, Vitest. Component tests via
`@testing-library/svelte` + jsdom (research R6) — reuses the existing jsdom setup, no
browser-runner dependency.

**Storage**: browser `localStorage` only, existing key `sift.v1` (`PersistedV1`,
`schemaVersion: 1`) — **unchanged**, so boards saved by the current app load intact.
Theme already lives in `ViewPrefs.theme` and is persisted today.

**Testing**: Vitest. Pure-logic unit tests (`scoring`, `view`, `persistence`, `mailto`,
`i18n`) carry over **unedited** (parity guarantee). DOM-behavior tests (`tests/dom/*`) are
re-expressed as Svelte component tests (`tests/components/*`).

**Target Platform**: static single-page web app on GitHub Pages (feature 003); evergreen
desktop + mobile browsers; offline-capable.

**Project Type**: single client-side web project (no backend, no API).

**Performance Goals**: smooth 60fps micro-interactions; first paint applies the correct
theme with no flash (pre-paint inline snippet); modest bundle (framework runtime + headless
lib + Tailwind output) — calm app, no heavy deps.

**Constraints**: no backend / no network / no telemetry (Constitution II); usable with no
horizontal scroll from ~320px to ≥1440px; WCAG AA contrast in both themes; honor
`prefers-reduced-motion`.

**Scale/Scope**: one screen, one active dilemma, 2–4 choices; ~8–10 Svelte components +
a small set of `ui/` headless wrappers; one new runes store; theming + motion utilities.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Evaluated against **Constitution v2.0.0** (`.specify/memory/constitution.md`).

| Principle | Verdict | Notes |
|-----------|---------|-------|
| **I. Calm Over Features** | ✅ PASS | No new product features; this is polish. Motion is bounded by the calm ethos (FR-018) and `prefers-reduced-motion` (FR-017); the score stays a gentle aid. |
| **II. Client-Side & Private** | ✅ PASS | Svelte, Melt/Bits UI, and Tailwind are build-time/client-only and add **no** backend, network call, telemetry, or data egress. App stays offline-capable; data stays in `localStorage` (FR-004). This is the hard boundary every new dependency was checked against. |
| **III. Deliberate Simplicity (v2.0.0)** | ✅ PASS | Amended Principle III permits a framework + minimal, justified runtime deps. Each dependency is justified: **Svelte** (removes the focus-loss bug + manual re-render wiring; small runtime), **Melt/Bits UI** (accessible, *headless/ownable* primitives — preferred over heavy pre-styled kits; **no** copy-source-into-repo model, so shadcn-svelte is reference-only), **Tailwind v4** (build-time, zero runtime). State/presentation separation is preserved; pure core stays dependency-free. Pre-amendment (v1.0.0) this would have FAILED on "no framework"; v2.0.0 is the authority now. |
| **IV. Pure Core, Test-First (NON-NEGOTIABLE)** | ✅ PASS | Pure core (`scoring.ts`, `view.ts`) is reused verbatim with its existing passing tests. Store invariants (2–4 choices, neutral⇒null weight) preserved. New components are built test-first (red→green) with component tests; type-check + suite green is the merge gate. |
| **V. Accessibility by Default** | ✅ PASS | Headless primitives supply ARIA roles + focus management; weight still shown by explicit dot count + color (never color alone); Esc closes form/dialog/popover; full keyboard operability; WCAG AA in both themes (FR-008..FR-013). Directly advances this principle. |

**Result: PASS** — no violations. **Complexity Tracking is empty** (the framework adoption
is governed by Principle III as amended, not a deviation).

> Note: this gate would not pass under Constitution v1.0.0. It passes only because the
> constitution was amended to v2.0.0 first. If that amendment is ever reverted, this plan
> must be revisited.

## Project Structure

### Documentation (this feature)

```text
specs/004-phase2-ui-rebuild/
├── plan.md              # This file
├── research.md          # Phase 0 output (R1–R8)
├── data-model.md        # Phase 1 output (state/entities, unchanged + Theme)
├── quickstart.md        # Phase 1 output (setup, verify, parity checklist)
├── contracts/           # Phase 1 output
│   ├── store.md         # Runes store public API + invariants (supersedes 001 state-store, API-compatible)
│   ├── components.md     # Component tree + headless-primitive mapping + a11y behavior
│   ├── theming.md        # Tokens, pre-paint, toggle, persistence, contrast
│   └── motion.md         # Transition catalog + reduced-motion contract
└── tasks.md             # Phase 2 output (/speckit-tasks — NOT created here)
```

### Source Code (repository root)

**Reused verbatim (pure core — the parity contract; do NOT rewrite):**

```text
src/
├── types.ts            # domain types (Theme already present)
├── scoring.ts          # pure scoring  ── unit tests unchanged
├── view.ts             # pure arrangement ── unit tests unchanged
├── ids.ts              # id generation
├── mailto.ts           # mailto composition ── unit tests unchanged
├── config.ts           # author identity (email mailto-only, never rendered)
├── persistence.ts      # localStorage + defensive load ── unit tests unchanged
└── i18n/
    ├── index.ts, en.ts, uk.ts   # pure t(lang,key) ── unit tests unchanged
```

**Replaced (presentation + store):**

```text
src/
├── store.svelte.ts     # NEW: Svelte-runes store; replaces state.ts.
│                       #   Same mutation names/signatures + invariants; reactive $state.
├── theme.ts            # NEW: resolve system/light/dark, apply to <html>, persist via view.theme
├── main.ts             # REPLACED: mount App.svelte; boot persistence + lang detect + theme
├── App.svelte          # NEW: top-level layout/composition
├── components/         # NEW: replaces render/*
│   ├── Header.svelte
│   ├── Toolbar.svelte           # Arrange (Popover) + Group/Sort, lang + theme toggles
│   ├── ChoiceCard.svelte
│   ├── NoteRow.svelte
│   ├── AddEditForm.svelte       # bind:value → no focus loss
│   ├── Summary.svelte
│   ├── Footer.svelte
│   ├── SuggestDialog.svelte     # native-feeling Dialog over mailto (no network)
│   └── ui/                      # thin wrappers over headless primitives
│       ├── Select.svelte        # choice selector
│       ├── Dialog.svelte        # Clear confirm / Suggest shell (AlertDialog)
│       ├── Popover.svelte       # Arrange config
│       ├── ToggleGroup.svelte   # Type / Weight / Sort segmented controls
│       └── Field.svelte         # input/textarea form primitives
└── styles/
    └── app.css         # REPLACED: Tailwind v4 entry + @theme tokens (migrated from tokens.css)

index.html              # add pre-paint theme snippet + mount point
package.json            # full metadata (name/description/author/repo/homepage/keywords) + license:MIT + new deps/scripts
vite.config.ts          # add svelte + tailwind plugins (keep GITHUB_PAGES base from 003; keep vitest config)
LICENSE                 # NEW: MIT, © Vitalii Sokolov
tsconfig.json           # add svelte types if needed
```

**Tests:**

```text
tests/
├── unit/               # UNCHANGED — scoring, view, persistence, mailto, i18n (parity contract)
└── components/         # NEW — replaces tests/dom/*; Svelte component tests
    ├── flow.test.ts        # create→choices→notes→group/sort→score (parity of dom/flow)
    ├── lifecycle.test.ts   # persistence load/clear parity (parity of dom/lifecycle)
    ├── suggest.test.ts     # suggest dialog → mailto (parity of dom/suggest)
    ├── i18n.test.ts        # language toggle parity (parity of dom/i18n)
    ├── theme.test.ts       # NEW — default/toggle/persist/pre-paint
    └── a11y.test.ts        # NEW — keyboard ops, Esc-to-close, focus, dot-count-not-color-only
```

**Structure Decision**: Single client-side web project. Keep the **pure core files in their
current locations** so their existing unit tests pass byte-for-byte (the strongest FR-001 /
SC-001 / SC-003 guarantee). Replace only the store and the rendering layer, and add the
theming, motion, metadata, and license artifacts. `tests/dom/*` (which assert against the
old imperative DOM) are superseded by `tests/components/*`; `tests/unit/*` are untouched.

## Complexity Tracking

> No Constitution violations — this section is intentionally empty. The framework + headless
> library + Tailwind are permitted by Principle III (v2.0.0) and individually justified in
> the Constitution Check table above; none requires a deviation.
