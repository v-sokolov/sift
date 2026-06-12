# Research: UI Polish — Toolbar Density, Collapsed-Card Summary & Contrast

## R1 — Toolbar stacking breakpoint (US1)

**Decision**: Narrow-stack cutoff set at `540px`; the 2-up band covers `541px–800px`.

**Rationale**: The `.toolbar__views` flex container already has `flex-wrap: wrap` and `gap: var(--space-3)`. At ≤540 px each toggle fills a full row because its min-content width (button label + padding) exceeds half the container. Adding an `@media (min-width: 541px) and (max-width: 800px)` rule that applies `flex: 1 1 calc(50% - var(--space-3))` to each `.btn.toggle` inside `.toolbar__views` produces 2-per-row in the intermediate band without touching the `@media (max-width: 800px)` rule that collapses the `--views` row to its own full-width line at ≤1024px.

**Alternatives considered**: 
- A single `flex: 1 1 40%` on all toggles at all widths — rejected: breaks the ≥800px side-by-side layout where there is plenty of room.
- CSS container queries — rejected: the toolbar is already layout-only CSS; no script overhead needed; media queries are simpler and have identical support.

**018/020 regression scope**: Existing breakpoints (`max-width: 800px` for views row width, `max-width: 719px` for settings segs, `max-width: 474px` for settings-row two-column) are additive-only; no existing rule is touched.

---

## R2 — Group/Sort multi-select seg (US1/FR-003)

**Decision**: Wrap the Group and Sort `.btn.toggle` buttons in `<div class="seg seg--multi" role="group">`. The `.seg--multi` modifier adds no exclusive-select semantics — the `aria-pressed` on each button remains independent. Remove the `.btn` class from Group/Sort and apply `.seg button` styling (which is already `background: var(--surface); border-left: 1px solid var(--border)`) so the joined appearance reads as "related controls" not "radio". `aria-label` on the `role="group"` div communicates the relationship to screen readers.

**Rationale**: Both Group and Sort are legitimately independent toggles; the spec requires the visual joining while keeping both activatable. The existing `.seg button[aria-pressed="true"]` rule (`background: var(--surface-2); font-weight: 600`) provides a non-exclusive pressed indicator — exactly the right treatment. No new CSS rule is needed for the base `.seg--multi` appearance; the modifier class is a semantic marker used in tests.

**Alternatives considered**: A custom radio-like variant — rejected as over-engineering two toggles that can be simultaneously on.

---

## R3 — Point summary derivation (US2)

**Decision**: New pure function `pointSummary(notes: Note[]): string | null` added to `view.ts`. Returns `null` when `notes.length === 0`. Otherwise counts positive (`+`), negative (`−`, U+2212), and neutral (`~`) notes and formats them as a space-separated string omitting any zero-count group (e.g., `"+3 −2"`, `"+3 −2 · ~1"`, `"~2"`). The `·` separator is the `U+00B7 MIDDLE DOT`.

**Placement**: rendered in `ChoiceCard.svelte` as a second line inside `choice__head` — a `<span class="choice__summary">` sibling of `choice__name`, only visible when the accordion is collapsed (`!isExpanded(choice.id)`) and the card is non-empty. The header layout switches from `align-items: center` (single-line) to wrapping flex-column for title+summary, with the chevron Accordion.Header spanning the height via `align-self: center`.

**Rationale**: Pure derivation (no store touch); the count-free format matches the 016 "avoid UA pluralisation" precedent. The `.choice__head` already hosts the title and chevron in a flex row; adding a flex-column sub-wrapper for title+summary is the least-intrusive structural change.

**i18n**: None needed — `+N`, `−N`, `~N` are numerals with universal punctuation; no locale-specific text is required for the summary string itself.

---

## R4 — Empty-card footer (US3)

**Decision**: Add a `choice.notes.length === 0` branch in `ChoiceCard.svelte` that renders the footer with class `choice__foot choice__foot--empty` and a faint "no points yet" / "ще немає пунктів" label (new i18n key `choice.noPoints`). The existing `choice__foot--{positive|negative|neutral}` path is guarded to `notes.length > 0` only.

**Rationale**: The score when `notes.length === 0` is always 0 and `scoreSign(0)` returns `'neutral'`, so the grey tint was applied to every empty card. The spec requires "no tint" not "no footer" — a faint placeholder reads better than a collapsed footer that leaves unexpected vertical whitespace (the `margin-top: auto` footer is load-bearing for grid alignment).

**Zero-points vs net-zero**: `notes.length === 0` is the distinguishing condition. A non-empty card with net-zero score has `notes.length > 0` and keeps the neutral tint — the existing C1–C4 and F1–F4 contracts remain correct; only the new carve-out test is additive.

---

## R5 — Contrast audit (US4)

**Decision**: Move the following selectors from `--text-faint` to `--text-muted`:
- `.choice__scorelabel` (score footer label "Score"/"БАЛИ")  
- `.group-label` (section headings "Advantages"/"Disadvantages"/"Neutral")
- `.actbtn` (rest-state text of Rename/Remove action buttons — interactive labels)
- `.saved` (save-status text "Editing..."/"Saved" — status copy)

Keep on `--text-faint` (accepted deviations):
- `.choice__name--ghost` (untitled choice placeholder)
- `::placeholder` in `.choice__title`, `input`, `textarea`
- `.iconbtn` colour (decorative icon; text alternative present)

**Token verification**:
- Light: `--text-muted: #6c6c66` on `--surface: #ffffff` → ~4.95:1 ✓
- Dark: `--text-muted: #a8a89f` on `--surface: #242421` → ~6.37:1 ✓

No token value change needed; reassignment of selectors only.

---

## R6 — Warm colour token (US5/US7)

**Decision**: Introduce `--warm` as a new design token in both theme blocks. `--status-editing: var(--warm)` so one source of truth governs both the save-dot and button text/border.

**Values**:
- Light: `--warm: #8c6400` (contrast on `--surface #ffffff` ≈ 4.8:1 ✓)  
  *(current `--status-editing: #c08a00` is only ~3:1 — not AA-safe for text)*
- Dark: `--warm: #e0b34d` (same value as current `--status-editing`; contrast on `#242421` ≈ 7.3:1 ✓)

The light-theme dot will shift from `#c08a00` (amber-gold) to `#8c6400` (deeper amber) — a minor visual change that is acceptable because the dot is decorative (the text label carries the meaning, Constitution V).

**Alternatives considered**: Keep `--status-editing` unchanged and mint `--warm` separately — rejected because it duplicates a near-identical amber; one token is better.

---

## R7 — Danger button variant (US5/US7)

**Decision**: New CSS class `.btn--danger` with `border-color: var(--disadvantage); color: var(--disadvantage)`. Apply to the confirm-dialog confirm button (`confirm-dialog-confirm`). The toolbar "Clear" button at rest stays `.btn` (neutral) — it only opens the dialog; danger styling lives inside the confirmation step.

**Contrast verification**:
- Light `--disadvantage: #b5483d` on `#ffffff` → ~5.3:1 ✓
- Dark `--disadvantage: #e0897e` on `#242421` → ~5.5:1 ✓

**btn--primary migration**: `ConfirmDialog.svelte` currently applies `.btn--primary` (blue) to the confirm button → replace with `.btn--danger`. No other call site of `ConfirmDialog` exists.

---

## R8 — Pressed toggle tint (US5/FR-022)

**Decision**: Replace `.toggle[aria-pressed="true"]` solid fill with the house tint recipe:
```css
.toggle[aria-pressed="true"] {
  background: color-mix(in srgb, var(--accent) 12%, transparent);
  color: var(--accent);
  border-color: var(--accent);
}
```
This is the same `color-mix` pattern used by `.choice__foot--positive` and `.sum--positive` (018), consistent with the "state, not action" principle.

**Scope**: Applies to the standalone Rank toggle AND to the Group/Sort buttons if they remain `.toggle`. After FR-003, Group/Sort move inside `.seg--multi` and become `.seg button` style — their `aria-pressed="true"` state uses the existing `var(--surface-2)` rule from `.seg button[aria-pressed="true"]`. The Rank button stays as `.btn.toggle` and gets the new tint.

---

## R9 — Lightbulb "off/on" filter (US5/US7)

**Decision**: Wrap the 💡 emoji in `<span class="btn__bulb" aria-hidden="true">💡</span>`. Apply CSS:
```css
.btn--warm .btn__bulb { filter: grayscale(1) opacity(0.6); }
.btn--warm:hover .btn__bulb,
.btn--warm:focus-visible .btn__bulb,
.btn--warm:active .btn__bulb { filter: none; }
```
The warm glow on "on" state uses `box-shadow: 0 0 0 2px color-mix(in srgb, var(--warm) 30%, transparent)` — soft enough for both themes.

**Reduced-motion gate**: The `box-shadow` transition is gated by the global `@media (prefers-reduced-motion: reduce)` block that sets all transitions to `0.001ms`.

**Markup change**: Adding the `<span>` wrapper is a one-line change to `Header.svelte`; the emoji is currently inline text inside the button. No accessible label change needed — the button already has `aria-label` or `t(lang, 'suggest.title')`.

---

## R10 — Existing boundary contracts

**Must stay green** (no regressions):
- 015 grid B-laws (choice grid layout)
- 016 confirm B1–B6 / D1–D4 / S1–S3 (dialog removal flow)
- 018 O1–O6 (order), C1–C4 (colour), T1–T3 (toggleRank/toggleGroup mutations), S1–S3 (toolbar structure)
- 020 A1–A6 (accordion), F1–F4 (score footer), E1–E6 (expand/collapse), H1–H5 (header), S1–S2 (summary), B1–B4 (regression locks)
- Current test count: 226 passing.

**Deliberately updated tests**: The 020 Increment-3 sole-blue-accent locks (B1–B4, which assert Suggest as the only `.btn--primary` element) will be rewritten to assert the new role split (Add CTAs = primary, Suggest = warm). This is intentional, not collateral damage (FR-024).
