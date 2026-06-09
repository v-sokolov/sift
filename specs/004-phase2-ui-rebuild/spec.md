# Feature Specification: Phase-2 UI Rebuild

> **Status: Shipped — condensed 2026-06-09**

## What shipped

A **presentation + maintainability rebuild** of Sift on **Svelte 5 (runes) + Tailwind v4 +
Bits UI** (headless primitives), tested with Vitest on jsdom. It deliberately changes **no
product behavior**: same dilemma, same up-to-four choices, same notes, same Group/Sort/
Arrange controls, same score, same Clear, same private `localStorage` persistence. What
changed is how the surface looks, how accessible and responsive it is, how calmly it moves,
and how the project is described and licensed. Merged PR #5.

The rebuild **reuses the pure core verbatim** — `types.ts`, `scoring.ts`, `view.ts`,
`ids.ts`, `mailto.ts`, `config.ts`, `persistence.ts`, `i18n/*` and their `tests/unit/*` (the
parity contract). Only the imperative store (`state.ts` → `store.svelte.ts`, runes, identical
mutation API + invariants) and the DOM renderers (`render/*`, `main.ts`, `styles/*` →
`components/*.svelte`, `App.svelte`, `app.css`) were replaced. Component tests are re-
expressed as `tests/components/*` (parity of the old `tests/dom/*`) plus new theme/a11y suites.

## Why

- **Parity-first (zero functional regression).** A rebuild's whole promise is "nicer, nothing
  lost." Reusing the pure logic verbatim makes parity (and saved-board compatibility) the
  cheapest, strongest guarantee instead of a re-implementation risk.
- **Svelte `bind:value` structurally fixes the focus-loss bug** that motivated the rebuild:
  derived values (the `$derived` score) recompute without remounting inputs, so caret/focus
  never jump while typing.
- **Headless primitives (Bits UI) give ARIA + focus management for free** so full keyboard
  operability and Esc-to-dismiss are correct by construction, while Sift owns markup/styling/
  motion for its calm bespoke look.
- **Tailwind v4 `@theme` tokens** make a two-palette light/dark system with explicit AA-
  contrast tuning a single source of truth, at zero runtime cost.
- **Calm, bounded motion** (built-in Svelte transitions + `animate:flip`) elevates feel
  without an animation dependency, and disappears under `prefers-reduced-motion`.
- **Project hygiene**: complete `package.json` metadata + an MIT `LICENSE`.

## Key decisions

- **Stack**: Svelte 5 runes (reactivity + `bind:value`), Tailwind v4 via `@tailwindcss/vite`
  (build-time, no runtime), Bits UI 2.18.1 headless primitives (Select, Dialog/AlertDialog,
  Popover, ToggleGroup, Field). All client-side, no network/telemetry (Constitution II held).
- **Bits UI over Melt UI**: Melt was the planned preference but the offline registry lacked
  `@melt-ui/svelte`; Bits UI was the documented R3 fallback (see R9). Peer:
  `@internationalized/date`. shadcn-svelte reference-only (copy-into-repo disallowed).
- **Constitution v2.0.0 enabling amendment**: Principle III amended to permit a framework +
  minimal, justified runtime deps (bounded by Principle II). This plan would FAIL under
  v1.0.0; it passes only because the constitution was amended first.
- **Theme is not new schema**: `ViewPrefs.theme ∈ {system, light, dark}` already exists and
  persists in `sift.v1`. A pre-paint inline `<script>` in `index.html` applies it before
  mount (no wrong-theme flash); `theme.ts` owns runtime + a `matchMedia` listener so `system`
  users follow live OS changes.
- **Testing on jsdom** via a local `tests/svelte.ts` helper (Svelte 5 `mount()` + cached
  `@testing-library/{dom,jest-dom,user-event}`) — minimal dev deps; `vitest-browser-svelte`
  is the documented heavier fallback.

## Requirements (preserved verbatim from the MVP — no functional change)

**Parity & privacy.** Every existing capability is preserved with identical behavior
(FR-001); typing never loses focus/caret as derived values update (FR-002); boards saved by
the current app load intact, no schema change (FR-003); fully client-side, no backend/network/
telemetry (FR-004).

**Theming.** Default to OS color-scheme on first visit (FR-005); visible toggle between light/
dark (FR-006); choice persists and reapplies (FR-007); both themes meet **WCAG AA** contrast
(FR-008, normal text ≥ 4.5:1); applied before first paint, no flash (FR-009).

**Keyboard accessibility.** All controls reachable/operable by keyboard in logical order
(FR-010); visible focus indicator on every focusable element (FR-011); Esc dismisses form/
dialog/popover and returns focus (FR-012); arrow-key navigation in segmented controls/
selectors, Enter submits (FR-013).

**Responsive layout.** Fluid reflow mobile→desktop, choice cards column↔stack without abrupt
snapping (FR-014); no horizontal scroll, overlap, or clipping at any supported width — ~320px
to ≥1440px (FR-015). See [`mobile-responsive-matrix.md`](./mobile-responsive-matrix.md) for
the device-lens dimensions M1–M12.

**Motion.** State changes use subtle, brief motion not instant snaps (FR-016); honor reduced-
motion by suppressing non-essential animation (FR-017); stay within the calm ethos — no
flashy/attention-grabbing effects (FR-018).

**Metadata & licensing.** Complete `package.json` metadata — name, description, version,
author (name + URL), repository, homepage, keywords, MIT declaration (FR-019); MIT `LICENSE`
at repo root naming the author as copyright holder (FR-020). Maintainer email stays
mailto-only, never rendered as site text.

## Edge cases

- **No stored theme + no OS signal** → default light (accessible, no flash).
- **Reduced motion toggled mid-session** → respected live, no restart.
- **Very long titles/names/notes** → wrap or truncate gracefully without breaking the grid.
- **Smallest supported width** → all controls reachable, no horizontal scroll.
- **Existing saved board** → never lost or corrupted by the rebuilt app.

## Key entity

- **Theme preference** (`ViewPrefs.theme`): `system` | `light` | `dark`; persisted locally and
  reapplied on load. The only datum this feature surfaces in the UI; not new schema — all
  other data is unchanged from the current app.

## Assumptions

- Product requirements from `001-sift-mvp` and `002-post-mvp-improvements` carry over verbatim;
  the domain term for a compared candidate remains **Choice**.
- Accessibility target is **WCAG AA** (public consumer web app), not AAA.
- Supported width ~320px (small phone) to wide desktop; evergreen mobile + desktop browsers.
- Hosting unchanged: GitHub Pages static model from `003-github-pages-hosting` still applies;
  the rebuild adds no backend or network dependency.
- Local persistence reused: saved boards stay in `sift.v1`; theme rides alongside in `view`,
  no new storage key.
