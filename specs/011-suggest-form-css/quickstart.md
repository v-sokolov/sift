# Quickstart: Suggest-Feature Form Button Layout

Feature: `011-suggest-form-css` · Date: 2026-05-31

## Run

```bash
yarn test    # vitest run — all suites incl. suggest.test.ts
yarn check   # svelte-check / tsc — 0 errors
yarn dev     # manual on-device verification
```

## Test acceptance matrix

| ID | Check | How | Verified by |
|----|-------|-----|-------------|
| A1 | Action row has exactly two buttons, Cancel then Send | `suggest.test.ts` queries `.modal__actions button`, asserts order via `data-action` | Automated |
| A2 | Both action buttons carry `btn--half` (equal-width opt-in) | `suggest.test.ts` asserts class on both | Automated |
| A3 | Send keeps `btn--primary` + disabled gating; Cancel keeps behavior | existing Send-gating + mailto tests | Automated (regression) |
| A4 | Dialog open/close, Esc, backdrop, focus-trap, i18n unchanged | existing suggest behavior tests | Automated (regression) |
| A5 | Cancel and Send render at equal width (desktop) | `yarn dev`, open dialog, measure/eyeball both buttons | Manual |
| A6 | Buttons + gap fill the row, no horizontal overflow (desktop) | `yarn dev`, inspect action row | Manual |
| A7 | Equal width holds in Ukrainian (longer "Скасувати" label) | `yarn dev`, switch language, open dialog | Manual |
| A8 | Equal width + no overflow + no label clipping on narrow/mobile width | `yarn dev`, narrow viewport / device emulation | Manual |
| A9 | Footnote still left-aligned (unchanged) | `yarn dev`, visual | Manual |

A1–A4 gate the merge (automated). A5–A9 are the on-device visual confirmation that jsdom cannot
assert (no layout/stylesheet in the test env — see research R2).

## Definition of done

- New `suggest.test.ts` contract test (A1, A2) written first and failing, then green.
- All existing tests green (regression gate, A3/A4); `yarn check` clean.
- Manual A5–A9 confirmed once on `yarn dev` (light + dark, EN + UK, desktop + narrow).
