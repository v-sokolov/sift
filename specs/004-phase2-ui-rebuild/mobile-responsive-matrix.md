# Mobile & Responsive UI — Requirements Matrix

> **Status: Shipped — condensed 2026-06-09**

**Feature**: Phase-2 UI Rebuild (`004-phase2-ui-rebuild`) — abstract, device-agnostic layer

## Purpose

Abstract, device- and tool-agnostic requirements for how the rebuilt UI must behave on
mobile and across screen sizes. Each row is a quality **dimension** with a MUST requirement
and an observable acceptance signal — not a device list, a pixel threshold, or a test recipe.

Concrete artifacts derive **from** this matrix and live elsewhere:

- the exact device / viewport targets (a device matrix),
- numeric thresholds (touch-target size, contrast ratio, max zoom),
- the FR- / SC- entries in [`spec.md`](./spec.md),
- the verification method and tooling.

This file is the layer above all of those — change it first, then propagate downward.

## Matrix

| ID | Dimension | Requirement (MUST) | Acceptance signal | Priority |
|---|---|---|---|---|
| **M1** | Layout adaptivity | Reflow fluidly across the full supported size spectrum — multi-column where space allows, single stack when narrow | No horizontal scroll, no overlap or clipping at any width; column→stack transition is gradual, not snapped | P1 |
| **M2** | Content integrity | Long dilemma titles, choice names, and notes wrap or truncate gracefully in every layout | Grid never breaks or overflows at the narrowest width; truncation stays readable | P2 |
| **M3** | Reading comfort | Text is legible without zoom and honors user text-scaling | Readable at default; no clipping or overlap when text is enlarged to the platform maximum | P2 |
| **M4** | Touch ergonomics | Interactive targets are finger-sized and adequately spaced | Every control meets the touch-target floor; adjacent controls don't mis-trigger | P1 |
| **M5** | Reachability | Primary actions stay within comfortable reach on large phones | Key actions aren't stranded only in hard-to-reach corners | P3 |
| **M6** | Device envelope | Content and fixed elements avoid hardware intrusions (notch, rounded corners, home indicator) | Nothing critical is occluded; the sticky footer clears the safe-area inset | P1 |
| **M7** | Dynamic viewport | Robust to browser chrome that collapses or expands (e.g. the address bar) | Full-height regions never clip controls or footer as chrome changes | P2 |
| **M8** | On-screen keyboard | A focused field stays visible while the virtual keyboard is open | Focused input scrolls into view; fixed elements don't cover it or float over the keyboard | P2 |
| **M9** | Input model | Interactions never require hover or a precise pointer | Everything revealed on hover is also reachable by tap or focus; nothing is hover-only | P1 |
| **M10** | Orientation | Usable in both portrait and landscape | No loss of function or content in either, including short landscape height | P3 |
| **M11** | Theming in context | Both themes stay legible on a real screen and match the device preference | Default matches OS scheme; contrast holds on-device in both themes | P2 |
| **M12** | Motion on device | Motion stays calm and smooth on mid-range hardware and obeys reduced-motion | No jank on a typical device; non-essential motion suppressed when requested | P3 |

## Priority legend

- **P1 — breaks on common devices if wrong** (must-fix): M1, M4, M6, M9
- **P2 — degrades the experience**: M2, M3, M7, M8, M11
- **P3 — polish / judgment**: M5, M10, M12

## Relationship to `spec.md`

- **Already covered** (listed here only through the device lens; cross-reference, don't duplicate):
  - M1, M2 ↔ User Story 4 / FR-014, FR-015 (+ the "long text" and "smallest width" edge cases)
  - M11 ↔ FR-005–009 (theming)
  - M12 ↔ FR-016–018 (motion)
- **New dimensions not yet in `spec.md`** — the value a width-range alone misses:
  - **M4** touch ergonomics, **M6** device envelope / safe areas, **M7** dynamic viewport,
    **M8** on-screen keyboard, **M9** no-hover input model.
