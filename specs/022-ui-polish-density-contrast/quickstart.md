# Quickstart: UI Polish — Toolbar Density, Collapsed-Card Summary & Contrast

## Automated gates (run before declaring done)

```bash
yarn test          # 226 → expected ≥240 passing; zero failures
yarn tsc           # strict; zero errors
yarn build         # vite build + svelte-check; must succeed on clean deps
```

## Implementation sequence

Stories are independent after the CSS token work (US4 tokens / US5 classes) lands first,
since several stories reuse `--warm`, `--text-muted`, and `--btn--danger`. Recommended order:

1. **US4** — CSS token reassignment (selectors to `--text-muted`); no new tests, but add K-law assertions.
2. **US5 / US7** — new `.btn--warm` / `.btn--danger` tokens + tint toggle + component class changes + bulb markup; update B1–B4 regression locks.
3. **US3** — empty-card footer carve-out + `choice.noPoints` i18n; add Z-law tests.
4. **US2** — `pointSummary` in `view.ts` (TDD: P1–P8 red first); render in `ChoiceCard.svelte`.
5. **US1** — CSS breakpoint + `.seg--multi` wrapper + T2/T3 tests.
6. **US6** — `.choice__head:hover` CSS; manual only (no tests).

## Manual verification walkthrough (M-laws)

### M1/M2 — Toolbar band
1. Open the app at 760 px viewport width (Chrome DevTools responsive mode).
2. Confirm the views row (Rank | Group+Sort) fits in ≤ 2 rows.
3. Resize to 520 px — confirm each toggle fills its own row.
4. Resize to 900 px — confirm all controls are on a single row.

### M3/M4 — Lightbulb warm affordance
1. Find the "💡 Suggest a feature" button in the header.
2. Verify emoji appears greyscale/dim at rest.
3. Hover/focus the button — emoji returns to full-colour and a warm glow appears.
4. Verify in dark mode — glow is visible but not harsh on the dark surface.

### M5 — Toggle tint
1. Click "Rank by score" — button should show a soft blue tint, not solid blue fill.
2. Click "Group" — same tint treatment.
3. Check both light and dark themes.

### M6 — Header hover
1. On a pointer device, hover a collapsed choice card header.
2. Verify a subtle background highlight appears across the full `.choice__head` row.

### M7 — Contrast sweep
Run browser DevTools accessibility panel or a colour-contrast checker on:
- Score footer label ("Score" / "БАЛИ")
- Group labels ("Advantages" / "Disadvantages" / "Neutral")
- Rename / Remove action button text
- Save-status text ("Editing..." / "Saved")

All should report ≥ 4.5:1 in both light and dark themes.

### M8 — Reduced motion
Enable "Reduce motion" in OS settings and repeat M3/M5.
All state changes should be instant (no transition).

## Key files

| File | Change |
|------|--------|
| `src/styles/app.css` | `--warm` token, `.btn--warm`, `.btn--danger`, tint toggle, breakpoint, K-laws |
| `src/view.ts` | `pointSummary()` |
| `src/components/ChoiceCard.svelte` | US2 summary render, US3 empty footer |
| `src/components/ConfirmDialog.svelte` | `btn--danger` on confirm |
| `src/components/Toolbar.svelte` | `.seg--multi` wrapper, `btn--primary` on Add-choice |
| `src/components/Header.svelte` | `btn--warm` + bulb span on Suggest |
| `src/components/SuggestDialog.svelte` | `btn--warm` on Send |
| `src/components/AddEditForm.svelte` | `btn--primary` on Add-point submit (verify) |
| `src/i18n/en.ts` + `uk.ts` | `choice.noPoints`, `toolbar.groupSortAria` |
| `tests/unit/view.test.ts` | P1–P8 (pointSummary) |
| `tests/components/accordion.test.ts` | P6–P8, Z1–Z4 |
| `tests/components/sort-color.test.ts` | K1–K4, Z3–Z4 additions |
| `tests/components/toolbar.test.ts` | T2–T3, R1, R7 update |
| `tests/components/suggest.test.ts` | R3–R4, R7 update |
| `tests/components/remove-choice.test.ts` | R5, B2 update |
