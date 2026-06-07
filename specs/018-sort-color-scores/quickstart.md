# Quickstart: 018-sort-color-scores

## Prerequisites

- Node + Yarn (project uses **yarn**, not npm).
- `yarn install` (offline cache is fine — **no new dependency** is introduced by 018).

## Build / test / verify (the gates, Constitution v2.2.0)

```bash
yarn test          # vitest — unit + component (TDD: new tests red first)
yarn build         # svelte-check + vite build — MUST pass on a clean install
```

## Automated coverage (what the tests assert)

- **Pure** `tests/unit/view.test.ts` → `orderedChoices`: O1–O6 (descending, stable ties,
  identity when off, negative-after-positive, empty/single/all-equal).
- **Pure** `tests/unit/persistence.test.ts` → P1–P2 (`rankByTotal` round-trip; old payload
  defaults to `false`).
- **State** `tests/components/store.test.ts` → T1–T3 (`toggleRank` flips, persists, does NOT
  touch save-status).
- **DOM** `tests/components/toolbar.test.ts` → S1–S3 (Rank checkbox present, left of the
  divider with "Choices"/"Points" scope labels, wired to `toggleRank`, i18n EN/UA).
- **DOM** `tests/components/sort-color.test.ts` → O2/C1–C4 (rendered order reflects
  descending totals; `.sum__score` sign class matches +/−/0).

## Manual sweep (jsdom can't do these — do before calling it done)

Run `yarn dev` and open the app.

- **A1 — Rank basics**: Add 3+ Choices with differing totals (e.g. +5, −2, +3). Tick
  **Rank** → cards reorder +5, +3, −2 (highest first). Untick → original order returns. *(O1,O2)*
- **A2 — Ties**: Give two Choices equal totals → their relative order is unchanged and
  doesn't jitter on edits. *(O3)*
- **M1 — Colour by sign**: Confirm a positive score shows green (`--advantage`), negative
  red (`--disadvantage`), zero grey (`--neutral`) — and the +/−/0 text is still present. *(C1–C4)*
- **M2 — Contrast**: Check all three score colours are legible in **light** and **dark**,
  including on the **leader** (tinted) cell. *(FR-012, R5)*
- **M3 — Motion**: Toggling Rank animates the reorder smoothly; enable OS "reduce motion"
  and confirm the reorder is instant. *(FR-008)*
- **M4 — Alignment**: With Rank on, each score cell sits directly under its own card at every
  breakpoint (incl. the 5–6-Choice wrap). *(R2)*
- **M5 — Live sign change**: Edit a point so a total crosses zero → the card re-ranks (Rank
  on) AND its colour updates immediately. *(FR-013, SC-007)*
- **P — Persistence**: Tick Rank, reload → still ranked. *(FR-007)*
- **H — Honesty**: A board where every total is 0 → no reordering occurs and every score is
  neutral-grey. Two-Choice board → Rank works but offers little (no error).
