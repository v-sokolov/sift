# Contract: Responsive & Mobile Behavior (M1–M12)

This is the authoritative mapping from each matrix dimension → the concrete CSS/HTML mechanism
→ the acceptance check. All mechanisms are CSS-first, dependency-free, and live in
`src/styles/app.css` unless noted. "Check" is how the dimension is verified (emulation / computed
/ on-device / jsdom).

| Dim | FR | Mechanism (the contract) | Acceptance check |
|----|----|--------------------------|------------------|
| **M6** Device envelope | FR-004, FR-005, FR-020 | `index.html` viewport meta gains `viewport-fit=cover`. `#app` padding becomes `max(<token>, env(safe-area-inset-{top,left,right}))`; `.footer` gains `padding-bottom: max(<token>, env(safe-area-inset-bottom))`. Side insets applied for landscape. | Emulate a notched device (portrait + landscape): no text/control under the cut-out; footer links clear the home indicator and stay tappable. |
| **M7** Dynamic viewport | FR-007 | `#app { min-height: 100vh; min-height: 100dvh; }` (fallback then `dvh`). No fixed `vh` heights elsewhere. | Scroll to collapse/expand the address bar: footer/full-height column never clip controls or leave a gap. |
| **M8** On-screen keyboard | FR-008, FR-009 | Editable fields + the inline `.form` container get `scroll-margin` (and the scroll container `scroll-padding`) so the focused field clears the keyboard. No fixed element overlaps inputs (form + footer are in flow). Optional `scrollIntoView({block:'nearest'})` on form-open **only if** emulation proves native insufficient. | With keyboard open, focus each field (title, choice name, note textarea, suggest form): field is visible, not covered; on dismiss, layout returns stable. Caret/focus never lost (FR-017). |
| **M4** Touch ergonomics | FR-001 | 44×44 CSS-px floor via `min-block-size`/`min-inline-size` (+ padding) on `.btn`, `.seg button`, `.langbtn`, `.iconbtn`, `select`, `.note`. Adjacent controls keep ≥8px effective gap. | In emulation/dev-tools, every interactive box computes ≥44×44; adjacent taps don't mis-fire. |
| **M9** Input model | FR-002, FR-003 | All hover-*emphasis* rules wrapped in `@media (hover: hover) and (pointer: fine)`; every hover affordance has a `:focus-visible` equivalent. Audit: no affordance is hover-only. | On a touch profile: nothing is hidden until hover; every action reachable by tap + keyboard; no stuck-hover artifacts after tap. |
| **M1** Layout adaptivity | FR-006 | Inherited from 004 (`.choices` grid columns→stack at the 720px boundary, fluid). Hardened only by M2/M4 above. | Resize 320px→1440px continuously: fluid reflow, no horizontal scroll, no overlap/clip at any width. |
| **M2** Content integrity | FR-011 | `overflow-wrap: anywhere` (+ `hyphens:auto` where apt) on dilemma title, choice name, `.note__text`; no fixed widths that clip. | Enter very long titles/names/notes incl. a long unbroken token at narrowest width: wraps/truncates gracefully, grid intact, no overflow. |
| **M3** Reading comfort | FR-010 | Font sizes stay in `rem`/tokens (no fixed px that defeats scaling); content wraps. | Set platform text size to max / browser zoom: legible, no clip/overlap. |
| **M5** Reachability | FR-013 | Toolbar wrap (below) keeps primary actions (Add choice, Add note) in flow near the top/thumb arc; no action stranded only in a far corner. | On a large-phone profile, primary actions are reachable without a far-corner stretch. |
| **M10** Orientation | FR-014 | `dvh` + fluid grid + side safe-area insets; no portrait-only assumptions/fixed heights. | Rotate to landscape incl. short height (~375px tall): no lost function/content, no horizontal scroll. |
| **M11** Theming in context | FR-012 | No change — 004 per-theme tokens + `prefers-color-scheme` default; WCAG AA verified by computation. | On-device: default matches OS scheme; contrast holds both themes. |
| **M12** Motion on device | FR-015 | No change — 004 `prefers-reduced-motion`-aware transitions. | On a mid-range profile: smooth reorder/reveal; reduced-motion suppresses non-essential motion. |

## Toolbar adaptation (FR-019 — Clarifications)

- `.toolbar__row { display:flex; flex-wrap:wrap; row-gap: <token>; }` — wraps onto extra rows,
  every control visible. **No** overflow/"more" menu; **no** horizontal scroll strip.
- Verify `.toolbar__spacer` (the `flex:1` pusher) does not strand the Add-choice button when the
  row wraps — drop/zero its effect at narrow widths.

## Add/edit form adaptation (FR-018 — Clarifications)

- Form stays **inline** (already in flow in `App.svelte`). At narrow widths: `.form__row` stacks,
  `select` / `textarea` / `.seg` groups go full-width; the form container carries `scroll-margin`.
- **No** bottom sheet, **no** modal.

## Invariants (must not break)

- **No behavior/data/copy/i18n change** (FR-016): no edits to `store.svelte.ts`, `theme.ts`,
  `types.ts`, pure-core `*.ts`, or `i18n/*`. No new persisted key.
- **Focus/caret preserved** (FR-017): any scroll-into-view must not steal focus or reset caret;
  prefer CSS `scroll-margin` over JS; if JS is used, it must not blur/refocus the field.
- **No new dependency** (Principle III): standard CSS only.
- **No scoped `<style>` blocks** (004 convention): all styling stays in `src/styles/app.css`.
