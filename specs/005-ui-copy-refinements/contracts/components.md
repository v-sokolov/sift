# Contract: Component Markup & Styling

Scope: `src/components/Header.svelte`, `src/components/Summary.svelte`, `src/styles/app.css`.

## C-cmp-1: Header structure

`Header.svelte` MUST render:

```
<header>
  <div class="header__brand">
    <h1 class="header__wordmark">Sift</h1>
    <p class="header__tagline">{t(lang, 'header.tagline')}</p>
  </div>
  <div class="header__bar">
    <input class="header__title" data-field="title" ... />   <!-- unchanged attrs -->
    <div class="header__tools"> ... </div>                    <!-- unchanged -->
  </div>
</header>
```

- The input (`value`, `oninput`, `placeholder`, `aria-label`, `data-field="title"`) and the
  `.header__tools` button (`data-action="open-suggest"`, `onclick={openSuggest}`) MUST keep their
  current attributes — no behavior or focus change.
- `Sift` MUST be a literal, not `t()`.

## C-cmp-2: Summary caption

`Summary.svelte` MUST append, after the `{#each}` and still inside `<section class="summary">`:

```
<p class="summary__formula">{t(lang, 'summary.formula')}</p>
```

- The caption MUST NOT have the `sum` class.
- The `{#each}` cells (`.sum`, `.sum__score`, `.sum__totals`, `--leader`) MUST be unchanged.

## C-cmp-3: Styling (app.css)

Header section:
- `header` → vertical stack: `display:flex; flex-direction:column; align-items:stretch; gap:var(--space-3)`.
- `.header__bar` → the former row rules: `display:flex; align-items:center; gap:var(--space-3); flex-wrap:wrap`.
- `.header__wordmark` → `margin:0; font-size:1.5rem; font-weight:700; color:var(--text)`.
- `.header__tagline` → `margin:var(--space-1) 0 0; max-width:60ch; color:var(--text-muted); font-size:0.95rem; line-height:1.5`.
- `.header__title`, `.header__tools`, `.linklike`, `.header__title::placeholder` rules unchanged.

Summary section:
- `.summary__formula` → `grid-column:1 / -1; margin:0; text-align:center; color:var(--text-muted); font-size:0.85rem`.

All styling stays in `app.css` (no scoped `<style>` blocks). Calm/quiet: no accent color, no bold
on body copy.

## C-cmp-4: Accessibility

- Wordmark is the page `<h1>`; tagline and caption are `<p>`.
- `--text-muted` for tagline/caption MUST meet WCAG AA (≥ 4.5:1) in BOTH light and dark themes; if
  either fails, that element uses `--text` instead.
- No interactive controls added; keyboard and focus behavior unchanged.

## C-cmp-5: Tests

`tests/components/i18n.test.ts` ("US1 — localization at the DOM level") MUST gain:
- `.header__tagline` textContent === `messages.en['header.tagline']`, then === `messages.uk[...]`
  after `setLang('uk'); flushSync()`.
- `.summary__formula` textContent === `messages.en['summary.formula']`, then === `messages.uk[...]`
  after switch.
- Existing `.summary .sum` assertions MUST stay green.
