# Feature Specification: Mobile & Responsive UI Hardening

> **Status: Shipped — condensed 2026-06-09**

Merged PR #7. Branch `006-mobile-responsive-ui`.

## What shipped

A **presentation-only** hardening pass over the 004 Svelte UI so it behaves correctly on
real handheld devices and across the full width spectrum (~320px → ≥1440px). It promotes the
abstract 004 mobile/responsive matrix (dimensions **M1–M12**) into concrete, verifiable CSS.
**No product behavior, data shape, persisted key, copy, or EN/UA catalog changed; no runtime
dependency added** (FR-016). The pure core, runes store, `theme.ts`, and `i18n/*` were untouched —
the entire existing test suite staying green is the no-regression contract (FR-016/FR-017).

The work is almost entirely CSS in `src/styles/app.css`, one attribute in `index.html`
(`viewport-fit=cover`), and small non-behavioral markup/class hooks in a few components.

## Why

Sift is a quick decision aid most often reached for on a phone. A width-range alone misses the
dimensions that make or break it on a real device: finger-sized controls, no hover-only access,
clearance for notches and the home indicator, a focused field staying visible above the on-screen
keyboard, a layout that survives a collapsing address bar and both orientations, and legible text
under user scaling. Dimensions 004 already satisfied (M1 layout, M2 content integrity, M11 theming,
M12 motion) are **cross-referenced and re-verified on-device, not re-implemented**; this spec adds
the ones a width-range misses (M3, M4, M5, M6, M7, M8, M9, M10).

## Key decisions (mechanism per dimension)

The authoritative dimension → mechanism → acceptance mapping is
[`contracts/responsive.md`](./contracts/responsive.md); concrete per-file edits and the
no-hover-only audit are [`contracts/components.md`](./contracts/components.md). Summary:

- **M6 device envelope** — `viewport-fit=cover` + pad `#app`/`.footer` with
  `max(<token>, env(safe-area-inset-*))` (left/right too, for landscape notch). The footer is a
  flow sticky-footer (`margin-top:auto`), so padding suffices.
- **M7 dynamic viewport** — `#app { min-height: 100vh; min-height: 100dvh; }` so the sticky footer
  tracks collapsing/expanding browser chrome with no gap or clip. CSS-only, no resize listener.
- **M8 on-screen keyboard** — rely on the browser's native scroll-focused-field-into-view plus
  `scroll-margin` on editable fields and the inline form so the field clears the keyboard. No fixed
  element overlaps inputs (form + footer are in flow), so nothing covers the field; no VisualViewport JS.
- **M4 touch targets** — 44×44 CSS-px floor on all interactive controls (`.btn`, `.seg button`,
  `.langbtn`, `.iconbtn`, `select`, `.note`) with ≥8px effective spacing. (44px = Apple HIG / WCAG
  2.5.5; a stricter 48px floor would also satisfy and may supersede later.)
- **M9 no-hover input** — all hover *emphasis* gated behind `@media (hover: hover) and (pointer:
  fine)`, every affordance with a `:focus-visible` equivalent. Audit confirmed **nothing was
  hover-only**, so the gating is defensive (prevents stuck-hover on touch).
- **M1/M5 toolbar (FR-019)** — `.toolbar__row` wraps via `flex-wrap` + `row-gap`; the `flex:1`
  `.toolbar__spacer` is neutralized when wrapped so Add-choice is never stranded. No overflow/"more"
  menu, no horizontal scroll strip.
- **M8 form (FR-018)** — the add/edit form stays **inline** (no bottom sheet, no modal); at narrow
  widths `.form__row` stacks and `select`/`textarea`/`.seg` groups go full-width.
- **M2/M3 reading comfort** — fonts stay in `rem`/tokens (text-scaling applies); `overflow-wrap:
  anywhere` (+ `hyphens:auto` where apt) on dilemma title, choice name, `.note__text` so a long
  unbroken token can't force horizontal scroll.
- **M10 orientation** — no fixed `vh` heights; `dvh` + fluid grid + side safe-area insets cover
  short landscape. Mostly verification.
- **M11/M12 theming & motion** — no code change; 004 per-theme tokens (WCAG AA) and
  `prefers-reduced-motion`-aware transitions are re-verified on-device only.

### Layout refinements (during implementation)

- **Toolbar order**: Add-choice sits after Clear/status, before Group/Sort (all viewports). At
  < 720px, Add-choice / Group / Sort / the Sort-by + Direction segmented controls each take a
  full-width row; the language toggle keeps its natural width.
- **"＋ add point" trigger**: centered, full-width at < 720px.
- **NoteRow**: two boxes with `space-between` — note text left, a dots + sign cluster right (dots
  then sign; dots only when a weight exists). Presentation only; `aria-label` and click-to-edit unchanged.
- **Editability cue**: a small always-visible pencil glyph (`✎`, decorative/`aria-hidden`) before
  the borderless choice-name and dilemma-title inputs, brightening on focus (M9-safe, not hover-gated).
- **Header at < 720px**: "Suggest a feature" and the dilemma title each take a full-width row
  (flex-wrap), Suggest ordered above the title (`order: -1`).
- **Suggest modal open**: locks `<html>` background scroll, restores on close.
- **Footer copy**: dropped the lead sentence; now just "Made by {name}." / «Створив {name}.» plus
  links (display value only; `footer.madeBy` key unchanged).
- `form.addNote` display value capitalized to "＋ Add point" / «＋ Додати пункт» (display value
  only, same class as the 005 relabel).

## Out of scope

**"Remove point"** is new behavior (surfacing the unwired `removeNote` store fn) and was deferred
to feature **007**. Its affordance must obey M9 when built — an always-present, low-emphasis `✕`
reachable by tap and keyboard; hover/focus may only raise emphasis, never be the sole access.

## Functional requirements (reference)

- **FR-001/002/003** (M4/M9): 44×44 touch floor + adequate spacing; everything reachable by tap or
  keyboard focus; nothing hover-only.
- **FR-004/005/006** (M6/M1): respect safe-area insets both orientations; sticky footer clears the
  bottom inset; fluid reflow ~320px→≥1440px with no horizontal scroll/overlap/clip at any width.
- **FR-007/008/009** (M7/M8): full-height regions + footer stay correct as chrome collapses/expands;
  focused field scrolls into view above the keyboard and isn't covered; layout returns stable on dismiss.
- **FR-010/011/012** (M3/M2/M11): legible at default + up to platform-max text scaling; long
  titles/names/notes (incl. unbroken tokens) wrap gracefully; default theme matches OS scheme, both
  themes hold WCAG AA on-device.
- **FR-013/014/015** (M5/M10/M12): primary actions within thumb reach; fully usable portrait +
  landscape (incl. short landscape) with no horizontal scroll; reorder/reveal motion smooth and
  suppressed under reduced motion.
- **FR-016**: presentation/markup/style only — no behavior, data, persisted key, copy, or i18n
  change; no new dependency, network call, or telemetry.
- **FR-017**: typing in any editable field never loses focus or caret from any layout/scroll
  behavior introduced here.
- **FR-018/019/020**: form stays full-width inline (no sheet/modal), scrolling clear of the keyboard;
  toolbar wraps with every control visible (no overflow menu, no scroll strip); footer stays sticky
  at all widths, padded clear of the bottom inset.

## Success criteria (reference)

100% of interactive controls ≥44×44 CSS px with adequate spacing (SC-001); zero hover-only
affordances (SC-002); zero critical elements occluded and footer clears bottom inset both
orientations (SC-003); zero horizontal scroll/overlap/clip ~320px→≥1440px (SC-004); focused field
visible above keyboard in 100% of fields (SC-005); footer/full-height regions never clip or gap as
chrome moves (SC-006); zero clip/overlap at platform-max text scaling at narrowest width (SC-007);
both themes meet WCAG AA (≥4.5:1) and first load matches OS scheme (SC-008); fully usable
portrait + landscape incl. ~375px-tall landscape (SC-009); zero non-essential motion under
reduced-motion, smooth otherwise (SC-010); zero focus/caret-loss while typing (SC-011).

## Verification

Where a physical device lab is unavailable, verification is by responsive emulation (device
profiles with cut-outs, landscape, throttled CPU), computed contrast, and on-device spot checks.
jsdom guards are limited to what it can observe (e.g. the `index.html` viewport meta contains
`viewport-fit=cover`) plus the full existing suite staying green — the FR-016/FR-017 contract.
