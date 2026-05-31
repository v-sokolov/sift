# Quickstart: Save-Status Indicator & Header/Footer Polish

## What this feature is

Two streams on one branch: (1) a three-state **save-status indicator** (hidden → "Editing" yellow →
"Saved" green) with a **2s** debounce, reacting only to content edits; (2) a small **header/footer
polish** (favicon by the title, Suggest button in the brand row, author name dropped from the footer).

## Verify on device (manual acceptance)

Start the app (`yarn dev`).

**Indicator**
1. Fresh load: the status area shows **nothing** (no dot/text).
2. Type in the dilemma title (or add/edit a point): it shows **"Editing"** with a **yellow** dot
   immediately.
3. Stop typing ~2s: it switches to **"Saved"** with a **green** dot. Reload → your edit persisted.
4. Toggle **Theme**, switch **Language**, change **Sort/Group**: the status does **not** change to
   "Editing" (and your preferences persist on reload).
5. **Clear** the dilemma: the status returns to **hidden**; the next content edit brings back
   "Editing".

**Header / footer**
6. The brand favicon sits to the **left of "Sift"**; the **"Suggest a feature"** button sits at the
   **far right** of the brand row (space-between). The button still opens the dialog.
7. The footer reads **"Inspired by the *Essentialism* book."** (EN) / **"Натхненна книжкою
   *Essentialism*."** (UK) — no author name; the book link still works.

## Acceptance matrix

| # | Scenario | Expected | Source |
|---|----------|----------|--------|
| 1 | Fresh open / after Clear | no dot, no text | FR-008 / FR-009 / SC-004 |
| 2 | Content edit (title/choice/point) | "Editing" + yellow dot, immediately | FR-001/002/003 / SC-001 |
| 3 | Editing, then 2s idle | "Saved" + green dot | FR-004 / SC-002 |
| 4 | Theme / Language / Sort / Group / Mode / Direction change | status unchanged; still persists | FR-006/007 / SC-003 |
| 5 | Rapid burst of edits in <2s | one write, settles on "Saved" once | FR-005 / SC-006 |
| 6 | Leave page while "Editing" | pending change still stored (exit-flush) | edge case |
| 7 | Status meaning without color + announced | text label present; polite live region | FR-010/011 / SC-005 |
| 8 | Favicon left of "Sift" (decorative) | present; not announced separately | FR-015 / SC-008 |
| 9 | Suggest button in brand row (once) | far right via space-between; opens dialog | FR-016 / SC-009 |
| 10 | Footer author removed (both langs) | no "Greg McKeown" / "Мак-Кеоуна"; book kept | FR-014 / SC-007 |

## Run the tests

```bash
yarn test     # vitest — store status transitions, persistence debounce, toolbar/header/footer
yarn check    # svelte-check (strict typecheck) — must be green
```

Tests are written **first** and must fail against current code (no `status` field, 400ms debounce,
author name present, button in old position), then pass after implementation with no failing
tests or type errors (Principle IV).

> Note: the repo's typecheck script is `yarn check` (svelte-check); there is no `yarn typecheck`.
