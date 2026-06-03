# Quickstart: Confirm Removing a Choice with Points (016)

## Automated (gates)

- **A1 — Tests**: `yarn vitest run` — all green, including the new
  `tests/components/remove-choice.test.ts` (B1–B6: dialog on pointed Choice with named
  message EN/UA, Cancel/Esc/backdrop-click deep-equal no-op with a silent
  `subscribePersist` counter, confirm removes with form-cleanup, empty-Choice instant
  removal with no dialog, neutral-only prompts, Clear migration with a never-called
  `window.confirm` spy).
- **A2 — Types**: `yarn tsc --noEmit` — clean.
- **A3 — Build gate**: `yarn build` (svelte-check + vite) — succeeds. No dependency
  changes → clean-install dimension unchanged; CI re-proves it on push.

## Manual (placement/scroll-lock have no jsdom surface — 014 precedent)

- **M1 — Remove flow & placement**: `yarn dev` → add 2 points to a Choice → click ✕ →
  dialog appears **centered as a fixed top layer** (not in page flow, never below the
  footer — the 014 regression shape), backdrop dims the page; Cancel/Esc/outside-click →
  nothing changes (incl. an open point form); ✕ again → Remove → Choice gone,
  score/summary update, Add-choice re-enables if at cap.
- **M2 — Scroll-lock**: grow the board until the page scrolls; open the dialog →
  background does NOT scroll (wheel/touch/keyboard); close → scrolling restored.
- **M3 — Empty stays instant**: remove a Choice with no points → no dialog, immediate.
- **M4 — Breakpoints & stacking**: repeat M1 at ~360px and ≥1100px — dialog centered at
  both; open the note form first, then the dialog → dialog sits above; focus returns to
  the ✕ trigger on close.
- **M5 — Clear migration**: Clear button → same dialog style with the existing Clear
  message; cancel → board intact; confirm → board resets, theme & language survive
  (SC-006). No native browser prompt appears anywhere.
- **M6 — Localization & themes**: switch to UA → repeat M1/M5 (message, Cancel, action
  labels all Ukrainian; untitled Choice named "Варіант N"); check both light and dark
  themes for AA-readable dialog text.

## Honesty checks

- **H1**: Placement and scroll-lock are NOT covered by automated tests (jsdom has no
  layout engine) — M1/M2/M4 are the evidence; don't claim otherwise.
- **H2**: The decline no-op assertion MUST deep-compare the full state, not just the
  choice count — a sneaky partial mutation (e.g. closed form) would otherwise pass.
- **H3**: The Clear-migration test MUST include the negative assertion (`window.confirm`
  spy never called) — without it, a leftover native prompt would silently coexist with
  the dialog (B6).
