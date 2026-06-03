# Quickstart: Extend Choices to Six Options (015)

## Automated (gates)

- **A1 — Tests**: `yarn vitest run` — all green, including new: store add/remove gating at
  5/6/7 (B1–B2), persistence accepts 2–6 / rejects 1 and 7 (B3), `arrange()`/scoring parity
  on a 6-Choice board (B4/SC-004), toolbar-suite gating "n / 6" + "Maximum 6 choices"
  title, complexity hint absent at 2–3 / present at 4–6 in EN and UA with adding unblocked
  (B5/SC-005). (Layout is CSS-only — there is no `choiceColumns` helper to unit-test.)
- **A2 — Types**: `yarn tsc --noEmit` (or the project's check script) — clean.
- **A3 — Build gate (Constitution v2.1.0+)**: clean install + `yarn build`
  (`svelte-check` + `vite build`) succeeds.

## Manual layout sweep (jsdom has no layout engine — geometry is verified by eye)

Run `yarn dev`, open the app, then:

- **M1 — Reach six**: from default board, click "Add choice" four times → 6 cards; button
  disables, reads "… 6 / 6", hover title says "Maximum 6 choices". Remove one → re-enables
  (B1–B2). Along the way: the muted complexity hint appears at the 4th Choice, stays
  through 5–6, never blocks adding, and disappears after removing down to 3 (B5). Tone
  check: it reads as a gentle observation, not a scolding.
- **M2 — ~360px (phone)**: 6 Choices stack in one column, each full-width (L3/FR-007).
- **M3 — 720–1100px (tablet/laptop)**: 6 Choices render 3+3; 5 Choices render 3+2; no
  card is cramped or orphaned (L1/L5). Load the cards unevenly (e.g. 5 points on one,
  none on another) — all cards, including those on the other row, share the tallest
  card's height and grow together as points are added (L6); at <720px the stack reverts
  to per-card content height.
- **M4 — ≥1100px (wide)**: still 3 columns (≈340px cards) — six-across intentionally never
  renders (R2).
- **M5 — No 2–4 regression**: with 2, 3, 4 Choices, sweep 360→1600px and compare against
  `main` — layouts identical (L4).
- **M6 — Summary alignment**: with 5 and 6 Choices at ≥720px, each score cell sits in the
  same column as its card (3+3 / 3+2 in both grids); formula caption spans full width;
  leader highlight on the correct cell (L2/L5).
- **M7 — Group & Sort views**: with 6 Choices holding mixed-weight points, toggle
  Group/Sort — arrangement correct in all cards, wrapping identical in both views (B4/FR-008).
- **M8 — Placeholders & i18n**: Choices 5–6 ghost-render "Choice 5"/"Choice 6"; switch to
  UA → "Варіант 5"/"Варіант 6"; the complexity hint and the max-title also switch language
  (B4/B5/FR-009).
- **M9 — Persistence**: populate 6 Choices with points/scores, reload → all restored.
  In devtools, hand-edit `sift.v1` to 7 choices, reload → default board, no crash (B3).
- **M10 — Reduced motion & keyboard**: with 6 cards, reorder animation honors
  `prefers-reduced-motion`; full keyboard pass over add/remove/point controls (FR-010).

## Honesty checks

- **H1**: Do NOT claim wrap geometry is covered by automated tests — the wrap is a pure-CSS
  `:has()` rule that jsdom cannot resolve; M2–M7 are the only geometry evidence. Pay
  special attention in M6 that a **4-Choice** board did NOT wrap (guards against the
  `.summary` bare-child-count selector trap, contract L2).
- **H2**: The constitution amendment (scope 2–4 → 2–6, v2.2.0) must be committed with the
  feature, not promised.
- **H3**: A green `tsc` + `vitest` does not prove the build — run A3 against a clean
  install (013 lesson).
