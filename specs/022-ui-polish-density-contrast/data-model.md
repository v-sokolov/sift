# Data Model: UI Polish — Toolbar Density, Collapsed-Card Summary & Contrast

No `AppState`, `sift.v1` schema, or persistence change. This feature is pure presentation —
all additions are derivation helpers, design tokens, and CSS classes.

---

## New pure function — `view.ts`

### `pointSummary(notes: Note[]): string | null`

Pure; side-effect-free; exported.

| Input | Output |
|-------|--------|
| `[]` | `null` |
| `[{type:'advantage',...}]` | `"+1"` |
| `[{type:'advantage',...}, {type:'disadvantage',...}]` | `"+1 −1"` |
| 3 advantage + 2 disadvantage + 1 neutral | `"+3 −2 · ~1"` |
| 2 neutral only | `"~2"` |

Rules:
- Count notes by `type`: `advantage` → `+`, `disadvantage` → `−` (U+2212), `neutral` → `~`.
- Omit any group whose count is 0 (e.g., no neutral → no `~` segment).
- The `·` (U+00B7) separator precedes `~K` only when `+` or `−` segments are also present.
- Signs and counts use the same `+N` / `−N` numeric formatting as `signed()` but without the full-score semantics — these are raw counts, not weighted sums.
- Returns `null` for empty input so callers can use a single falsy guard.

---

## New design tokens — `src/styles/app.css`

### `--warm` / `--warm-dark` (added to `:root` and `[data-theme="dark"]`)

| Theme | Token | Value | Purpose |
|-------|-------|-------|---------|
| light | `--warm` | `#8c6400` | Warm amber — AA-safe on `--surface` (~4.8:1) |
| dark | `--warm` | `#e0b34d` | Light amber — AA-safe on `--surface` (~7.3:1) |

`--status-editing: var(--warm)` replaces the current literal values in both blocks,
making the save-dot and the warm button variant share one source of truth.

---

## New CSS classes — `src/styles/app.css`

### `.btn--warm`

Warm accent CTA — Suggest-a-feature button and Suggest modal Send button.

```css
.btn--warm {
  border-color: var(--warm);
  color: var(--warm);
}
.btn--warm:hover,
.btn--warm:focus-visible,
.btn--warm:active {
  box-shadow: 0 0 0 2px color-mix(in srgb, var(--warm) 30%, transparent);
}
```
The hover/focus/active glow is inside `@media (hover:hover) and (pointer:fine)` guard for the
`box-shadow`; `:focus-visible` and `:active` rules are outside that guard so keyboard and touch
users still get the "on" state.

### `.btn__bulb` (emoji span inside `.btn--warm`)

```css
.btn--warm .btn__bulb { filter: grayscale(1) opacity(0.6); }
.btn--warm:hover .btn__bulb,
.btn--warm:focus-visible .btn__bulb,
.btn--warm:active .btn__bulb { filter: none; }
```

### `.btn--danger`

Destructive confirm action — confirm-dialog confirm button only.

```css
.btn--danger {
  border-color: var(--disadvantage);
  color: var(--disadvantage);
}
```

### `.choice__foot--empty`

Empty-card footer state (0 notes).

```css
.choice__foot--empty {
  /* No tint, no border colour — just a faint placeholder label. */
}
.choice__foot--empty .choice__scorelabel {
  color: var(--text-faint);  /* intentional — this is placeholder text, not a real label */
}
```
The `.choice__scorelabel` rule for non-empty footers changes to `--text-muted` (US4); the empty
variant keeps `--text-faint` because the "no points yet" text is placeholder copy.

### `.seg--multi`

Semantic modifier on `.seg` — signals a multi-select (non-exclusive) control group.
No additional CSS needed beyond what `.seg` and `.seg button[aria-pressed="true"]` already
provide. Used as a test hook and screen-reader group label anchor.

---

## Modified CSS rules — `src/styles/app.css`

| Selector | Property | Before | After | Story |
|----------|----------|--------|-------|-------|
| `.choice__scorelabel` | `color` | `var(--text-faint)` | `var(--text-muted)` | US4 |
| `.group-label` | `color` | `var(--text-faint)` | `var(--text-muted)` | US4 |
| `.actbtn` | `color` | `var(--text-faint)` | `var(--text-muted)` | US4 |
| `.saved` | `color` | `var(--text-faint)` | `var(--text-muted)` | US4 |
| `.toggle[aria-pressed="true"]` | background/color/border | solid `--accent` fill + `#fff` | tint recipe (`color-mix 12%`) | US5 |
| `@media 540–800px .toolbar__views .btn.toggle` | flex | *(unset)* | `flex: 1 1 calc(50% - var(--space-3))` | US1 |
| `.choice__head` | layout | single-row flex | flex-column sub-wrapper for title+summary | US2 |
| `.choice__head` inside `@media (hover:hover)` | `:hover` background | *(none)* | subtle `var(--surface-2)` tint | US6 |

---

## Modified components

### `src/view.ts`
- Export `pointSummary` (new function, pure, no imports needed — uses `Note` type only).

### `src/components/ChoiceCard.svelte`
- Import `pointSummary` from `../view`.
- US2: Add `<span class="choice__summary">` inside `choice__head`, shown when `!isExpanded(choice.id) && choice.notes.length > 0`.
- US3: Conditionally render `choice__foot--empty` footer when `choice.notes.length === 0` (faint `choice.noPoints` i18n label); existing footer path guarded to `notes.length > 0`.

### `src/components/ConfirmDialog.svelte`
- US5: Change confirm button class from `btn btn--primary btn--half` → `btn btn--danger btn--half`.

### `src/components/Toolbar.svelte`
- US1/FR-003: Wrap Group (`toggle-group`) and Sort (`toggle-sort`) buttons in `<div class="seg seg--multi" role="group" aria-label={t(lang,'toolbar.groupSortAria')}>`.
  Remove `.btn` class from Group/Sort; keep `aria-pressed` and `data-action` attributes.
- US5: Add class `btn--primary` to the Add-choice button.

### `src/components/Header.svelte`
- US5: Change Suggest-a-feature button class to include `btn--warm`; add `<span class="btn__bulb" aria-hidden="true">💡</span>` wrapper around the emoji.

### `src/components/SuggestDialog.svelte`
- US5: Change Send button class to `btn btn--warm btn--half` (from `btn btn--primary btn--half`).

### `src/components/AddEditForm.svelte`
- US5: Verify the "Add" submit button already has `btn--primary`; add if missing (currently likely `btn btn--primary`).

---

## New i18n keys

| Key | EN | UA |
|-----|----|----|
| `choice.noPoints` | `No points yet` | `Ще немає пунктів` |
| `toolbar.groupSortAria` | `Group and sort points` | `Групування та сортування пунктів` |

---

## Invariants (unchanged)

- `AppState` / `sift.v1` schema: untouched — no `schemaVersion` bump.
- `store.svelte.ts` mutations: untouched — `toggleGroup`, `toggleSort`, `toggleRank` remain as-is.
- `choiceScore`, `scoreSign`, `signed`, `orderedChoices`, `arrange`: untouched.
- No new runtime dependency introduced.
- Test suite entry point: 226 tests currently passing; suite must stay green after each story.
