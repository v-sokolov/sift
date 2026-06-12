# Research: Scroll, Focus, Collapsible Header & Scrollbar Gutter

## R1 — Auto-Scroll to New Choice: Mechanism

**Decision**: Use Svelte 5 `$effect` watching `choices.length` in `App.svelte`, paired with `tick()` from `svelte` to defer DOM query until after the reactive update is flushed, then call `scrollIntoView` on the last `.choice-cell` element.

**Rationale**: `$effect` is the idiomatic Svelte 5 replacement for `afterUpdate`. Using `tick()` inside the effect ensures the DOM reflects the new choice before we query it. Querying `document.querySelectorAll('.choice-cell')` and taking the last element is robust without requiring a ref on each card. Alternatively, `bind:this` on the card is cleaner but requires plumbing through `ChoiceCard.svelte`.

**scroll behavior**: `{ behavior: 'smooth' }` by default; `{ behavior: 'instant' }` when `window.matchMedia('(prefers-reduced-motion: reduce)').matches` (FR-002). The browser `scrollIntoView` spec supports both.

**Edge case — first card**: When 0 → 1 choice, the card is always visible; `scrollIntoView` is a no-op in practice (already in view). Acceptable.

**Alternatives considered**:
- `afterUpdate` (Svelte 4 lifecycle) — unavailable in Svelte 5 rune components; `$effect` is the correct replacement.
- Custom Svelte action `use:scrollOnMount` on the card — would require knowing which card is "new" and adding the action to `ChoiceCard.svelte`; the `$effect`-in-App approach is simpler.

---

## R2 — Auto-Focus Add Point Form: Mechanism

**Decision**: Apply the existing `autofocus` Svelte action (already defined in `ChoiceCard.svelte` lines 58–61) to the textarea in `AddEditForm.svelte`. Because the textarea is inside `{#if}` (rendered only when `editing.kind === 'new'`), the action fires exactly when the element mounts — no extra lifecycle hook needed.

**Rationale**: The codebase already uses `use:autofocus` for the title-edit input (ChoiceCard line 133). Re-using the same pattern keeps the code consistent. The action calls `node.focus(); node.select()` — appropriate for a text area where the user might type immediately.

**On re-submit**: The form resets draft state, causing `AddEditForm` to re-render the textarea. The action fires again on re-mount, restoring focus automatically (FR-003 scenario 2).

**Where to define**: Extract the `autofocus` function to a shared Svelte action module (e.g., `src/actions.ts`) so both `ChoiceCard.svelte` and `AddEditForm.svelte` import it without duplication (Principle III — no dead code, single source).

**Alternatives considered**:
- `$effect(() => { textarea?.focus() })` — works but adds reactive overhead and a `bind:this` ref; the action is cleaner.
- HTML `autofocus` attribute — unreliable in Svelte because the attribute only fires on initial page load for the first element; programmatic `node.focus()` is required for dynamically mounted elements.

---

## R3 — Collapsible Header Description: Component Choice

**Decision**: Use a plain Svelte 5 component-local `$state` boolean (`descOpen = false`) in `Header.svelte` combined with a conditional `{#if}` + `slide` transition (matching the accordion body pattern from `ChoiceCard.svelte`). No new Bits UI primitive needed.

**Rationale**: Bits UI `Collapsible` would add managed focus and ARIA, but the spec requires only a toggle with an accessible label — achievable with a `<button aria-expanded>` + `aria-controls` pair. The existing `slide` transition is already `prefers-reduced-motion`-gated in `ChoiceCard`. The collapsible is only rendered on mobile; on desktop the `{#if}` for the toggle and the `{#if}` for the description reverse: description is always shown and no button appears. CSS media query in `app.css` hides/shows the toggle button and always-on description div.

**State scope**: Component-local `let descOpen = $state(false)` in `Header.svelte`. Not in the store. Not persisted. Resets to `false` on reload automatically.

**Alternatives considered**:
- Bits UI `Collapsible` — heavier than needed; ARIA can be done manually for this simple case.
- CSS-only `:has()` approach — no JavaScript toggle means no keyboard support; fails FR-009.
- Store-level ephemeral state (like `expanded` record) — unnecessary coupling; the spec says component-local like `editingTitle` (020 precedent).

---

## R4 — Collapsible Header: Responsive Strategy

**Decision**: The toggle button and the conditional `{#if descOpen}` block both live in `Header.svelte`. On desktop (≥720 px) the toggle button is `display: none` via CSS and the description div gets `display: block !important` (or `visibility: visible`) to override any `{#if}` — or more cleanly, the `{#if}` is avoided on desktop with a CSS class that always shows the content.

**Cleaner approach**: Use a CSS class `.header__tagline--mobile-only` that wraps the `{#if}` in `Header.svelte`, and at ≥720 px breakpoint, the class forces `display: block`. The button gets `.header__tagline-toggle` that is `display: none` at ≥720 px. This avoids needing two separate rendering paths in Svelte.

**Even cleaner** (chosen): render the description unconditionally; use CSS `display: none` at ≤719 px when not open. The `descOpen` state drives a class `class:header__tagline--open={descOpen}`. At ≤719px, `.header__tagline` is `display: none` by default; `.header__tagline--open` is `display: block`. At ≥720px, `.header__tagline` is always `display: block` (toggle button hidden). This means the `slide` transition must be applied only on mobile — acceptable; the transition is cosmetic.

---

## R5 — Scrollbar Gutter: CSS Property

**Decision**: Add `scrollbar-gutter: stable` to the `html` element (or `:root`) in `app.css`.

**Rationale**: `scrollbar-gutter: stable` reserves the scrollbar track space even when no scrollbar is visible, preventing horizontal layout shift when content height crosses the scrollbar threshold. It is a CSS Level 4 property; browser support is Chromium 94+, Firefox 97+, Safari 15.4+ — all modern targets. Adding to `html` (not `body`) ensures it applies to the viewport scroll container. This is a one-line change.

**Alternatives considered**:
- `overflow-y: scroll` (always-visible scrollbar) — forces the scrollbar even when content fits; worse UX.
- JavaScript ResizeObserver compensation — far more complex; not needed.

---

## R6 — Test Coverage Strategy

**Decision**: 
- **scrollbar-gutter**: CSS-only, no automated test possible in jsdom. Manual test M1.
- **Auto-scroll**: `scrollIntoView` is not implemented in jsdom. Document as manual M2. Add a unit test that the `$effect` calls `scrollIntoView` on the correct element by mocking `scrollIntoView` on the mock DOM node.
- **Auto-focus**: jsdom supports `document.activeElement`. Test: mount `AddEditForm` with `editing.kind === 'new'`, assert `document.activeElement === textarea`. This is a component test.
- **Collapsible header**: jsdom supports DOM visibility. Test: mount `Header`, assert description not visible; click toggle, assert visible; click again, assert hidden.

**New test files**: `tests/components/header.test.ts` (H-contracts), `tests/components/add-edit-form-focus.test.ts` (F-contracts, may extend existing add-edit-form tests).

**i18n parity**: Adding `header.taglineToggleShow` / `header.taglineToggleHide` to both `en.ts` and `uk.ts` — the parity test in `tests/unit/i18n.test.ts` will enforce it automatically.
