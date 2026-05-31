# Research: Fix Suggest-Feature Dialog Positioning

**Feature**: `014-fix-dialog-positioning` · **Phase 0**

The spec leaves no `NEEDS CLARIFICATION` (revert-vs-fix is settled). The one open technical question
is *how* to center the panel now that it is a sibling of the backdrop rather than its child.

## R1 — Why the panel is mis-positioned (confirmed root cause)

**Decision**: Treat this as a CSS-structure mismatch, not a Bits UI defect.

**Evidence**:
- `src/styles/app.css:686–695` — `.modal-overlay` is `position: fixed; inset: 0; display: flex;
  align-items/justify-content: center`. It centers **its children**.
- `src/styles/app.css:696–712` — `.modal` is only `position: relative` and relies on that flex
  parent for centering.
- `src/components/SuggestDialog.svelte:64–71` — Bits UI renders `<Dialog.Overlay class="modal-overlay" />`
  and `<Dialog.Content class="modal" />` as **siblings**, inline (no portal). So `.modal` is not a
  child of `.modal-overlay`; nothing centers it, and `position: relative` leaves it in normal flow
  (rendered after `<Footer />` because `<SuggestDialog />` is last in `App.svelte`). The backdrop is
  a correct full-screen dim layer but empty.

**Rationale**: The hand-rolled pre-012 modal nested `.modal` inside `.modal-overlay`, so flex
centering worked. 012 swapped in Bits UI's sibling structure but kept child-dependent centering CSS.

## R2 — Centering technique for a sibling panel

**Decision**: Center `.modal` as its **own** fixed, top-layer element using
`position: fixed; inset: 0; margin: auto; height: fit-content;` with the existing
`width: 100%; max-width: 460px; max-height: 90dvh; overflow: auto`, at a `z-index` above the backdrop.

**Why this works**: With `position: fixed; inset: 0`, the element's containing block is the viewport
and all four offsets are 0; a constrained `width`/`height` plus `margin: auto` then distributes the
free space equally on every side — centering on **both** axes without a flex parent and without
transforms. `max-height: 90dvh` + `overflow: auto` keeps the panel viewport-bounded with internal
scroll on short/landscape viewports (preserves the 006/012 behavior). `height: fit-content` is needed
so the panel shrinks to its content (otherwise `inset: 0` would stretch it to full height and
`margin: auto` would have no vertical free space to distribute).

**Stacking**: `.modal-overlay` keeps `z-index: 100`; `.modal` gets `z-index: 101` so the panel sits
above the backdrop. Both are `position: fixed`, so both establish their stacking via `z-index`
against the rest of the app (which is in the normal flow / lower stacking). This satisfies FR-002/003.

**Alternatives considered**:
- **`top:50%; left:50%; transform: translate(-50%,-50%)`** — classic centering, also parent-free.
  Rejected as the primary because (a) subpixel `transform` can soften text rendering, and (b) with
  `max-height` + internal scroll the translate approach is fussier; `inset:0 + margin:auto` composes
  more cleanly with the existing `max-height: 90dvh; overflow:auto`. (Kept as a fallback if a target
  browser misbehaves.)
- **Re-introduce nesting** (wrap `Dialog.Content` so `.modal` is inside `.modal-overlay`) — rejected:
  Bits UI emits Overlay and Content as siblings by design; forcing nesting fights the primitive and
  risks breaking its layer/scroll behaviors.
- **Portal the dialog to `<body>`** — rejected: 012 deliberately renders inline (no portal) to keep
  the dialog in the app subtree; portalling is a larger behavioral change out of scope here, and is
  unnecessary because fixed positioning already escapes the in-flow problem.
- **Revert to the hand-rolled modal** — rejected at spec time (Clarifications): discards 012's
  accessibility wins for a much larger change than a CSS fix.

## R3 — Breakpoint scope

**Decision**: A single positioning rule fixes all breakpoints; no media query needed.

**Evidence**: `grep '@media' src/styles/app.css` shows breakpoints at 719/720px for header/choices/
add-form, but **no media query targets `.modal`/`.modal-overlay`**. The bug is therefore
breakpoint-independent, and so is the fix — `position: fixed` + `margin:auto` centering holds at every
width. `width: 100%` + `max-width: 460px` already make the panel fluid on narrow screens, and the
existing `padding: var(--space-4)` on the backdrop provides edge gutter; we move/replicate that
gutter so the fixed panel does not touch screen edges on small viewports.

## R4 — Verification approach (jsdom limitation)

**Decision**: Verify via the **preserved** behavior/contract component tests (must stay green) plus a
documented **manual** cross-breakpoint visual pass (quickstart). Do not attempt to assert pixel
layout in jsdom.

**Rationale**: jsdom has no layout/render engine — `getBoundingClientRect`, centering, and stacking
are not meaningfully computable there (the same reason 012 demoted Tab-trap/backdrop/scroll-lock to
manual checks). The automated guard is that the dialog still mounts, keeps its `.modal`/`.modal-overlay`
classes and `data-*` hooks, and its event behaviors (Esc/inside-click) still pass. Layout correctness
is a human eyeball check at mobile/tablet/desktop widths + a short viewport.

## Decisions summary

| ID | Decision |
|----|----------|
| R1 | Root cause = child-dependent centering CSS vs Bits UI sibling rendering (confirmed in code). |
| R2 | Center `.modal` via `position: fixed; inset: 0; margin: auto; height: fit-content` + `z-index: 101`; `.modal-overlay` stays the fixed `z-index: 100` backdrop. |
| R3 | One breakpoint-agnostic rule; no media query (nothing else targets the modal). |
| R4 | Verify by green behavior/contract tests + manual cross-breakpoint visual pass; no jsdom layout assertions. |
