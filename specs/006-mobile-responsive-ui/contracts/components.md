# Contract: Per-File Changes & No-Hover-Only Audit

Concrete, minimal edits. The bulk is `src/styles/app.css`; markup is touched only where CSS
needs a class hook. **No** store / i18n / pure-core edits.

## `index.html`

- **Change**: viewport meta →
  `<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />`
- **Why**: enables `env(safe-area-inset-*)` (M6/R1). Only change to this file.

## `src/styles/app.css` (primary surface)

| Region / selector | Edit | Dim |
|---|---|---|
| `#app` | `min-height: 100vh;` → add `min-height: 100dvh;` after it; change `padding` to use `max(<token>, env(safe-area-inset-top/left/right))` | M7, M6 |
| `.footer` | add `padding-bottom: max(var(--space-3), env(safe-area-inset-bottom));` | M6 |
| `.btn`, `.seg button`, `.langbtn` | add `min-height: 44px;` + ensure horizontal padding; segmented buttons get min-inline-size where they can shrink | M4 |
| `.iconbtn` (choice remove ✕) | `min-block-size: 44px; min-inline-size: 44px;` (keep visual glyph small via centering) | M4 |
| `select`, `.form textarea` | `min-height: 44px;` (textarea already 64px — ok); full-width on narrow | M4, M8 |
| `.note` | ensure comfortable min tap height (`min-height: 44px`) | M4 |
| `.toolbar__row` | `flex-wrap: wrap;` + `row-gap`; neutralize `.toolbar__spacer` on wrap | M1/M4/M5, FR-019 |
| `.form` / `.form__row` | full-width stacking at narrow widths; `.form { scroll-margin: <token>; }` | M8, FR-018 |
| Hover rules: `.iconbtn:hover`, `.note:hover`, `.linklike:hover`, `.modal__close:hover`, `.footer__link:hover` | wrap in `@media (hover: hover) and (pointer: fine) { … }`; confirm each has a `:focus-visible` counterpart | M9 |
| Long-text fields: `.choice__title`, `.note__text`, dilemma title input | `overflow-wrap: anywhere;` (+ `hyphens:auto` where apt) | M2 |
| (audit) no fixed `vh` heights; fonts in `rem` | verify/adjust | M3, M10 |

> `:focus-visible` global outline already exists — keep it; it provides the keyboard parity M9
> requires for the gated hovers.

## Components — class hooks only (no behavior change)

| File | Change (as implemented) |
|---|---|
| `src/components/AddEditForm.svelte` | No markup change (CSS-only: `.form__row` stacks full-width and gets `scroll-margin` at narrow widths). Handlers, `bind`, submit logic untouched (FR-017). |
| `src/App.svelte` | None — the inline form region already existed; native scroll-into-view + `scroll-margin` sufficed (no JS fallback needed). |
| `src/components/ChoiceCard.svelte` | **Markup**: added a decorative `<span class="choice__edit" aria-hidden>✎</span>` pencil cue before the choice-name input (UI refinement — signals the borderless field is editable; M9-safe, brightens on `:focus-within`). `.iconbtn` touch sizing in CSS. |
| `src/components/NoteRow.svelte` | **Markup**: restructured the row into two boxes — `.note__text` (left) and a new `.note__meta` cluster (right) holding the weight `.dots` then the type `.note__sign`; `.note` uses `justify-content: space-between`. Decorative parts stay `aria-hidden`; the row's `aria-label` and click-to-edit behavior are unchanged. Remove ✕ remains **out of scope** (feature 007). |
| `src/components/Header.svelte` | **Markup**: wrapped the dilemma-title input in `.header__titlebox` with a decorative `✎` pencil cue (same pattern as ChoiceCard). CSS: at < 720px the title box and `.header__tools` each take a full-width row, with Suggest ordered above the title (`order: -1`). |
| `src/components/SuggestDialog.svelte` | **Behavior (UI)**: added an `$effect` that locks `<html>` scroll while the modal is open and restores it on close (effect cleanup on unmount). No change to the mailto/send flow. |
| `src/components/Footer.svelte` | None — bottom safe-area padding handled in CSS. Footer copy trimmed via `footer.madeBy` value (i18n display only). |
| `src/components/Toolbar.svelte` | **Markup**: moved the Add-choice button to sit after Clear/status and before Group/Sort (all viewports; also reorders its Tab position). CSS handles small-screen layout: Add-choice, Group, Sort, and the Sort-by / Direction segmented controls each take a full-width row < 720px; the `.toolbar__spacer` is dropped < 720px. |

## No-hover-only audit (M9 / FR-002, FR-003)

Result of auditing current `:hover` usage:

| Selector | Hover does | Hover-only access? | Action |
|---|---|---|---|
| `.iconbtn:hover` | color/bg emphasis | No (button always visible) | gate behind `@media (hover)` |
| `.note:hover` | bg emphasis | No (row always tappable) | gate behind `@media (hover)` |
| `.linklike:hover` | underline/color | No | gate behind `@media (hover)` |
| `.footer__link:hover` | (empty rule) | No | gate or remove empty rule |
| `.modal__close:hover` | color/bg | No | gate behind `@media (hover)` |

**Conclusion**: nothing is hover-only today, so M9 is satisfied; the gating is defensive (avoids
stuck-hover on touch) and documents the contract. The one feature that *would* have introduced a
hover-only control — "remove point" — is deferred to **007** with an always-present ✕ mandate
(see spec Clarifications).

## Test hooks (jsdom-observable guards only)

- **Viewport meta guard** (optional, recommended): a unit test reading `index.html` asserts the
  viewport `content` contains `viewport-fit=cover`. This is the one cheaply-assertable mobile
  guarantee in jsdom.
- **No-regression**: the entire existing `tests/unit/*` and `tests/components/*` suite must pass
  unchanged — that is the contract for FR-016/FR-017.
- Everything else (touch sizes, safe-area, keyboard avoidance, orientation, contrast-on-device)
  is verified by emulation/computation/on-device (see spec "Verification") — **not** asserted in jsdom.
