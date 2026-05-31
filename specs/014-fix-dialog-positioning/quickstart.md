# Quickstart: Verify Suggest-Dialog Positioning Fix

**Feature**: `014-fix-dialog-positioning`

Layout correctness is a visual property jsdom cannot assert (no layout engine), so verification is
split: **automated** behavior/contract guards that must stay green, and a **manual** cross-breakpoint
visual pass.

## Automated (must stay green — regression gate)

- **A1** `yarn check` → 0 errors. (SC-005)
- **A2** `yarn test` → full suite passes, no net loss of tests. (SC-005)
  - Includes `tests/components/suggest.test.ts`: dialog mounts; `.modal` / `.modal-overlay` present;
    Esc closes; inside-body click does not dismiss — unchanged from 012.
- **A3** `yarn build` → svelte-check + vite build succeed (Build gate, v2.1.0). Authoritative check
  is the CI clean-install build.

## Manual — cross-breakpoint visual pass (`yarn dev`)

Open the app, click **Suggest a feature**, and confirm at each width:

- **M1 — Desktop (≥1024px)**: panel centered horizontally and vertically; full-page dim backdrop
  behind it; nothing from the page bleeds over the panel. (P1–P3, S1–S3 / FR-001..003)
- **M2 — Tablet (~768px)**: same — centered, dim backdrop, correct stacking. (FR-001..003)
- **M3 — Mobile (~375px)**: panel centered and fluid with a visible gutter to the screen edges (does
  not touch edges); backdrop covers the full viewport. (P5 / FR-001)
- **M4 — Long page / scrolled**: with the board scrolled down, open the dialog → it appears fixed and
  centered in the viewport, **not** down in the page flow below the footer. (P4 / FR-005)
- **M5 — Short / landscape viewport** (e.g. phone landscape or a short window): the panel is bounded
  to the viewport height and its content scrolls **inside** the panel while the panel stays centered;
  the page behind does not scroll. (P6 / FR-006)
- **M6 — Stacking**: confirm the panel is above the backdrop and the backdrop is above the header,
  choices, and footer at every width. (S1–S3 / FR-003)

## Manual — accessible-behavior regression (unchanged from 012)

- **M7 — Focus on open**: opening the dialog moves focus to the first field (Name). (FR-007)
- **M8 — Tab trap + focus-return**: Tab cycles within the panel; closing returns focus to the
  Suggest trigger. (FR-007)
- **M9 — Esc / outside-click / scroll-lock**: Esc closes; clicking the dim backdrop dismisses;
  the page body cannot scroll while the dialog is open. (FR-007)

## Honesty checks

- **H1** No domain logic, scoring, arrangement, or persisted-state (`sift.v1`) change — diff is CSS
  (and markup only if strictly needed to carry the styles, preserving classes/`data-*`). (FR-008)
- **H2** Bits UI `Dialog` retained — no revert; `.modal`/`.modal-overlay` classes and `data-*` hooks
  intact. (FR-009)
- **H3** A pre-existing saved board still loads and renders unchanged after the fix.
