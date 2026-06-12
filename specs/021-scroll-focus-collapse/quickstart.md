# Quickstart: Scroll, Focus, Collapsible Header & Scrollbar Gutter

## Gates

Before shipping, all of the following must be green:

| Gate | Command |
|------|---------|
| Type-check | `yarn tsc --noEmit` |
| Tests (≥211 + new) | `yarn test` |
| Build | `yarn build` |

Run `yarn dev` for the local dev server.

## Manual Walkthrough (10 steps)

1. **Start fresh** — open the app at `localhost:5173`; confirm the page header shows the tagline text on desktop.

2. **scrollbar-gutter** — resize the browser window to make content just fit without a scrollbar, then widen it to trigger one; confirm the main content width does not shift horizontally. Open the SuggestDialog; confirm no layout jump as the body scrollbar disappears.

3. **Collapsible header (desktop)** — at ≥720 px, confirm the description is visible and no toggle button is rendered.

4. **Collapsible header (mobile)** — resize to 375 px wide (or use DevTools). Confirm the tagline is hidden and a toggle button ("Show description") is visible. Click it — tagline appears, button label changes to "Hide description". Click again — tagline hides. Reload — tagline hidden again.

5. **Collapsible header a11y** — tab to the toggle button; press Enter to expand; confirm `aria-expanded` flips in DevTools; confirm screen-reader announcement (if available).

6. **Auto-focus Add Point** — expand any Choice card; click "+ Add point"; confirm the textarea is immediately focused (cursor blinking, no extra click needed).

7. **Auto-focus on re-submit** — type a point and submit; confirm the textarea is focused again for the next entry.

8. **Auto-focus keyboard** — tab to the "+ Add point" trigger; press Enter to open the form; confirm focus lands in the textarea without pressing Tab.

9. **Auto-scroll (desktop)** — add 5+ choices so the board is full; add one more ("Add choice"); confirm the viewport scrolls to reveal the new card.

10. **Auto-scroll reduced-motion** — enable `prefers-reduced-motion: reduce` via OS or DevTools `Emulate prefers-reduced-motion`; add a Choice; confirm the new card is brought into view instantly (no smooth animation).

## Key Files

| File | Change |
|------|--------|
| `src/actions.ts` | New — shared `autofocus` Svelte action |
| `src/components/App.svelte` | Add `$effect` for auto-scroll after `choices.length` changes |
| `src/components/AddEditForm.svelte` | Add `use:autofocus` to textarea |
| `src/components/ChoiceCard.svelte` | Replace inline `autofocus` with import from `src/actions.ts` |
| `src/components/Header.svelte` | Add toggle button + `descOpen` state + conditional tagline |
| `src/i18n/en.ts` | Add `header.taglineToggleShow` / `header.taglineToggleHide` |
| `src/i18n/uk.ts` | Add Ukrainian translations for the two new keys |
| `src/app.css` | Add `scrollbar-gutter: stable` to `html`; add `.header__tagline*` mobile rules |
| `tests/components/header.test.ts` | New — H1–H6 contracts |
| `tests/components/add-edit-form.test.ts` | Extend — F1–F3 contracts |
