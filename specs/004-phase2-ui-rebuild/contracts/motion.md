# Contract: Motion (`svelte/transition`, `svelte/animate`)

Calm, brief, reduced-motion-aware micro-interactions. Maps to FR-016..FR-018, SC-008,
Principle I (calm).

## Transition catalog (built-in Svelte; no animation dependency)

| Surface | Motion | Notes |
|---------|--------|-------|
| Add/edit form reveal | `fade`/`scale` (short) | gentle in/out on open/close |
| Dialog (Clear / Suggest) | `fade` + subtle `scale` | brief; backdrop fade |
| Popover (Arrange) | `fade`/`slide` (short) | anchored, quick |
| Note reorder on Group/Sort | `animate:flip` (`svelte/animate`) | the standout — cards glide to new positions instead of snapping |
| Toolbar row reveal | `slide`/`fade` | when secondary controls show/hide |
| Score change (optional) | none by default | a `tweened` count is allowed only if it stays subtle |

## Constraints

- **Brief & subtle**: short durations, gentle easing. No bounce, glow, particles, gradients-
  in-motion, or anything that pulls focus from the decision (FR-018, Principle I).
- **Reduced motion (FR-017/SC-008)**: a reactive `prefersReducedMotion` helper (backed by
  `matchMedia('(prefers-reduced-motion: reduce)')`) MUST suppress non-essential animation —
  transitions become instant and `flip` duration drops to 0. Honored live if toggled.
- **No animation library**: GSAP / Motion One / showpiece libraries are out of scope
  (Principle III); AutoAnimate only if `flip` wiring proves impractical (research R7).

## Acceptance (`tests/components/*`)

- Group/Sort change reorders notes (order asserted via `view.arrange`); with reduced-motion
  set, the same change applies with no animation delay.
- Opening/closing form, dialog, popover works identically with reduced-motion on/off
  (behavior never depends on animation completing).
