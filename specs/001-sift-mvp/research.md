# Phase 0 Research: Sift MVP

This resolves the open items from the design doc (§9) and the Technical Context
unknowns. None block implementation; each records a concrete decision.

## R1. Build tooling & language

- **Decision**: TypeScript 5.x (strict) + Vite 5. No framework, no runtime deps.
- **Rationale**: The design doc mandates "plain TypeScript + Vite, no framework."
  Vite gives instant dev server, TS transpile, and a tiny static production build.
  Strict TS makes the typed-mutation discipline enforceable at compile time.
- **Alternatives considered**: React/Svelte/Vue (rejected — explicit no-framework
  intent; the app's state is small enough that a hand-rolled store is simpler than a
  framework's overhead); plain JS (rejected — types are central to the "typed
  mutations" architecture and to safe `localStorage` (de)serialization).

## R2. Test framework

- **Decision**: Vitest with the `jsdom` environment.
- **Rationale**: Vitest shares Vite's config/transform pipeline (zero extra build
  setup), runs TS natively, and supports a `jsdom` environment for DOM-level render
  tests. The design doc highlights pure functions as "trivially unit-testable" —
  Vitest covers both those and light DOM tests in one runner.
- **Alternatives considered**: Jest (rejected — heavier TS/ESM config, separate
  transform from Vite); Playwright (deferred — full e2e is overkill for MVP scope;
  jsdom flow tests cover the acceptance scenarios cheaply). Playwright can be added
  later for true cross-browser e2e without changing app code.

## R3. localStorage save debounce interval

- **Decision**: Debounce writes at **400ms** of idle after the last mutation, with a
  flush on `visibilitychange`/`beforeunload` so nothing is lost on close.
- **Rationale**: 400ms is below human "did it save?" anxiety threshold yet coalesces
  rapid keystrokes (e.g. typing a note title) into a single write. localStorage writes
  are synchronous and cheap at this data size (well under a few KB), so the interval is
  about avoiding redundant work, not avoiding cost. The unload flush guarantees
  durability for FR-024/FR-025 even if the user closes mid-debounce.
- **Alternatives considered**: Write-on-every-mutation (rejected — wasteful synchronous
  writes during typing, though harmless; debounce is cleaner); long interval like 1–2s
  (rejected — widens the lose-on-crash window without meaningful benefit).

## R4. Mobile breakpoint (columns → vertical stack)

- **Decision**: Choices render as side-by-side columns at **≥ 720px** viewport width;
  below 720px they stack vertically. Use a CSS container/media query — no JS.
- **Rationale**: With up to 4 choice columns plus padding, ~720px is the point below
  which columns become too narrow for comfortable note reading. A pure-CSS breakpoint
  keeps layout out of the state/render logic. Above the breakpoint, columns share width
  equally (`grid-template-columns: repeat(N, 1fr)` where N = choice count, 2–4).
- **Alternatives considered**: 640px (rejected — 4 columns too cramped on small
  tablets); JS-measured breakpoint (rejected — unnecessary; CSS handles it and stays
  in the styling layer per the architecture's separation).

## R5. Persistence schema versioning & corruption handling

- **Decision**: Store a single JSON object under key `sift.v1` containing
  `{ schemaVersion: 1, dilemma, view }`. On load: parse defensively — if missing,
  unparseable, or failing a shape/`schemaVersion` check, fall back to the empty default
  state (two starter choices) rather than throwing. Keep a `schemaVersion` field so a
  future migration can transform old payloads.
- **Rationale**: A versioned envelope future-proofs MVP-2 additions (shareable link,
  decided flag) without ad-hoc migration. Defensive load satisfies FR-029 (always a
  valid default) and protects against hand-edited or partially-written storage.
- **Alternatives considered**: Separate keys per field (rejected — atomicity is easier
  with one key; partial writes can't desync dilemma vs. view); no version field
  (rejected — blocks clean future migration).

## R6. IDs for choices and notes

- **Decision**: `crypto.randomUUID()` (available in all evergreen targets), wrapped in
  `ids.ts` for a single seam.
- **Rationale**: Collision-free without a counter to persist; the wrapper isolates the
  one nondeterministic call, which keeps `scoring.ts`/`view.ts` pure and lets tests
  stub IDs if needed.
- **Alternatives considered**: Incrementing integer counter (rejected — must persist
  the counter and risks reuse after Clear); `Date.now()`-based (rejected — collision
  risk on rapid adds).

## R7. Theme (light/dark)

- **Decision**: Default to `prefers-color-scheme` with a manual toggle that overrides
  and persists alongside view prefs. Weight colors chosen to meet WCAG AA contrast in
  both themes; weight always also shown as a dot count (FR-031).
- **Rationale**: Respecting OS preference is the calm default; the override covers users
  whose OS setting doesn't match their need. Persisting it keeps the experience stable.
- **Alternatives considered**: OS-only, no toggle (rejected — some users want to force
  one); toggle-only, ignore OS (rejected — worse first-run default).

## R8. Rendering strategy (no framework)

- **Decision**: Full re-render of regions from `AppState` on each `update()`, via
  string-templated `innerHTML` per region with event delegation on the `#app` root.
  Preserve focus/caret for the actively-edited field across re-renders by tracking the
  editing target in `AppState.editing` and restoring focus after render.
- **Rationale**: At this scale (≤4 choices, tens of notes) a full region re-render is
  simpler and fast enough (<16ms) than diffing, and keeps the strict `state → render`
  discipline. Event delegation means listeners attach once in `main.ts`, not per node.
- **Alternatives considered**: Manual DOM diffing / virtual DOM (rejected — complexity
  not justified at this scale); per-element listeners (rejected — re-attachment churn on
  re-render; delegation is cleaner).

## Resolved open items from design doc §9

| Open item | Resolution |
|-----------|------------|
| Debounce interval for localStorage saves | **400ms** + unload flush (R3) |
| Mobile breakpoint for columns→stack | **720px**, CSS-only (R4) |
| URL-encoding scheme for MVP-2 shareable link | **Out of scope** — deferred to MVP-2 per spec; not researched here |

**All NEEDS CLARIFICATION resolved. Ready for Phase 1.**
