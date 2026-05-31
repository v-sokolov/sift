# Research: Suggest-Feature Form Button Layout

Feature: `011-suggest-form-css` · Date: 2026-05-31

## R1 — How to make Cancel and Send equal-width ("50% minus the gap")

**Decision**: Keep `.modal__actions` as a flex row with its existing `gap` token; remove
`justify-content: flex-end`; give both action buttons `flex: 1 1 0`.

**Rationale**: `flex: 1 1 0` gives each button a zero flex-basis and equal grow factor, so the
two buttons divide the row's free space evenly — each ends up at exactly half of
`(row width − gap)`. This is precisely "50% width minus the space between them" (FR-001, FR-002).
A zero basis (not `auto`) means the buttons' own content (label) does not bias the split, so the
two stay equal-width even when labels differ in length or language (FR-003). The existing `gap`
remains the literal "space between them" (Assumptions). Dropping `justify-content: flex-end` is
needed because the buttons now fill the row; the property becomes a no-op once they grow, but
removing it keeps the rule honest.

**Alternatives considered**:
- `width: 50%` on each button + negative margins / `calc(50% - gap/2)`: brittle, must hardcode
  the gap into the width math; flex `gap` already handles spacing. Rejected.
- CSS Grid `grid-template-columns: 1fr 1fr; gap`: equally valid and also equal-width, but the row
  is already flex and the rest of the form's buttons use flex; introducing grid for two cells is
  gratuitous (Principle III YAGNI). Rejected in favor of the minimal flex tweak.
- `flex: 1 1 auto`: would let the longer label widen its button → unequal widths, violating
  FR-003. Rejected; basis must be `0`.

## R2 — Making the contract test-observable under jsdom

**Decision**: Add a shared marker class — `btn--half` — to both the Cancel and Send buttons.
The CSS equal-flex rule targets `.modal__actions .btn--half`. The component test asserts both
action buttons carry `btn--half` (a markup contract), rather than asserting computed pixel
widths.

**Rationale**: The vitest/jsdom environment does not load the Vite/Tailwind stylesheet and does
not perform layout, so `getComputedStyle(...).flex` and `getBoundingClientRect()` cannot verify
equal rendered widths. The honest, deterministic, test-first hook is the markup contract: both
action buttons opt into the equal-width treatment via a single shared class. This mirrors the
006 mobile-responsive feature, which validated pure-CSS changes through markup/structure
contracts plus a behavioral regression gate. Real pixel-equality is confirmed manually in the
quickstart on-device step.

**Alternatives considered**:
- Assert `getComputedStyle().flexGrow === '1'`: unreliable in jsdom (no stylesheet applied).
  Rejected.
- Assert presence of the CSS rule by parsing `app.css`: tests build artifacts, not behavior;
  fragile to formatting. Rejected.
- No new test, rely only on existing regression tests: would leave the new contract unguarded
  and violate the test-first discipline for an intentional change. Rejected.

## R3 — Footnote alignment

**Decision**: No change — the LinkedIn fallback footnote stays left-aligned.

**Rationale**: Settled in spec Clarifications (2026-05-31). Keeping it left-aligned matches the
left-aligned title, intro, and field labels; centering risked visual inconsistency with the
header. FR-006 codifies "no change."

## R4 — Mobile / narrow viewport behavior

**Decision**: The equal-flex split is viewport-independent; no media query needed. Verify in the
quickstart that at narrow widths the two buttons stay side-by-side, equal-width, no overflow, no
label clipping.

**Rationale**: `flex: 1 1 0` naturally fills whatever width the row has, so the split holds at
all widths (FR-004). The buttons already meet the 44px touch floor (006); equal-width only
changes horizontal size. If an extremely narrow width ever clips a long localized label, that is
a pre-existing concern of label length, not of this change; the quickstart records it as a check
rather than pre-emptively adding a wrap rule (YAGNI).
