# Quickstart: Mobile & Responsive UI Hardening

## Prerequisites

- On branch `006-mobile-responsive-ui`.
- Package manager: **yarn** (not npm). This sandbox has a known yarn-wrapper quirk
  (`yarn test` may report "doesn't seem to be part of the project…"). Workaround used by prior
  features: run the binaries directly, and keep `yarn.lock` empty/absent locally.

## Build & verify (automated gates)

```bash
# type-check (Svelte + TS)
node_modules/.bin/svelte-check

# full test suite — must stay 100% green (no-regression contract, FR-016/FR-017)
node_modules/.bin/vitest run

# production build (skip/at-least type-check+test if the bundler step needs network offline)
node_modules/.bin/vite build
```

A change is **done** only when `svelte-check` is clean and the existing suite is fully green.
If the optional viewport-meta guard test is added, it must pass too.

## Manual on-device acceptance (the real verification)

Most of this feature is not observable in jsdom. Use browser device-emulation (Chrome DevTools
device toolbar, with safe-area inset simulation) plus at least one real phone if available. Map
each check to its Success Criterion.

| # | Check | SC |
|---|-------|----|
| 1 | On a notched profile (e.g. iPhone 14 Pro), portrait **and** landscape: no text/control under the notch/rounded corners; footer links clear the home indicator and are tappable. | SC-003 |
| 2 | Resize continuously 320px → 1440px: fluid reflow (choices columns→stack), **no horizontal scroll**, no overlap/clip at any width. | SC-004 |
| 3 | Toolbar at ~320px: controls **wrap to multiple rows**, all visible; no overflow menu, no sideways scroll; Add-choice not stranded. | SC-004 |
| 4 | Focus each editable field with the on-screen keyboard open (title, choice name, note textarea, suggest form): field scrolls into view, **not covered** by keyboard or footer; caret never lost. | SC-005, SC-011 |
| 5 | Scroll to collapse/expand the address bar: footer/full-height column never clip or leave a gap. | SC-006 |
| 6 | Inspect computed sizes: every interactive control (buttons, segmented options, language toggle, choice ✕, select, note row) is **≥44×44 CSS px**; adjacent taps don't mis-fire. | SC-001 |
| 7 | On a touch profile: nothing is hidden until hover; every action reachable by tap + keyboard; no stuck-hover after tap. | SC-002 |
| 8 | Set platform text size / browser zoom to max at the narrowest width: legible, **no clip/overlap**. | SC-007 |
| 9 | Enter very long dilemma title, choice name, and a note with a long unbroken token at narrowest width: wraps/truncates gracefully; grid intact; no overflow. | SC-004, SC-007 |
| 10 | Both themes on-device match OS scheme and hold WCAG AA contrast (computed ≥4.5:1 normal text). | SC-008 |
| 11 | Rotate to landscape incl. short height (~375px tall): no lost function/content, no horizontal scroll. | SC-009 |
| 12 | Mid-range CPU throttle: reorder/reveal motion smooth; enable reduced-motion → non-essential motion suppressed. | SC-010 |

## Guardrails while implementing

- Edit **only** `index.html` (one attribute) and `src/styles/app.css` (the bulk); touch a
  component **only** to add a class hook — never a handler, `bind`, or store call (FR-017).
- **No** new dependency; **no** scoped `<style>` blocks (keep styling in `app.css`).
- **No** edits to `store.svelte.ts`, `theme.ts`, `types.ts`, pure-core `*.ts`, or `i18n/*`.
- "Remove point" is **out of scope** (deferred to 007) — do not wire `removeNote` here.
- Prefer CSS `scroll-margin` over JS for keyboard avoidance; if any JS is added, it must not
  blur/refocus or disturb the caret.
