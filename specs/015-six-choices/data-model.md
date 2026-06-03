# Data Model: Extend Choices to Six Options (015)

No entity shapes change. One constraint widens.

## Entities (unchanged shapes)

- **Choice** (`src/types.ts:13`) — `id`, `title` (may be `''` → ghost placeholder
  "Choice {n}"), `notes`. Shape untouched.
- **Dilemma / Board** (`src/types.ts:22`) — `choices: Choice[]`. The doc comment
  "length constrained 2..4" becomes "2..6".

## Constraint change

| Constant | File | Before | After |
|----------|------|--------|-------|
| `MIN_CHOICES` | `src/types.ts:96` | 2 | 2 (unchanged) |
| `MAX_CHOICES` | `src/types.ts:97` | 4 | **6** |

### Enforcement points (all read the constants — no logic edits)

| Site | Role |
|------|------|
| `store.svelte.ts:136` | `addChoice` no-ops at `length >= MAX_CHOICES` |
| `store.svelte.ts:153` | `removeChoice` no-ops at `length <= MIN_CHOICES` |
| `persistence.ts:92` | load-time validation rejects boards outside `[MIN, MAX]` → default board fallback |
| `Toolbar.svelte:28,84` | `atMax` disables the control; label renders "… n / 6" automatically |
| `ChoiceCard.svelte:14` | `canRemove` gates the ✕ control at MIN |

## Derived presentation value (CSS-only — Clarifications 2026-06-03)

- No script-side derived value. The grid column count at ≥720px is resolved entirely in
  CSS: the base rule reads the raw count via `--choice-count` (unchanged), and
  count-conditional `:has(… :nth-child(5))` overrides switch `.choices`/`.summary` to 3
  columns when a 5th Choice exists — effective mapping `2→2, 3→3, 4→4, 5→3, 6→3`
  (contract L1–L2). Nothing persisted, nothing computed in components.

## Complexity hint (FR-012 — derived, not stored)

- Visibility = `choices.length >= 4` (live count; thresholds 4–6 visible, 2–3 hidden).
  No new state, no persistence, no dismissal flag — the hint derives entirely from the
  existing `dilemma.choices` array.

## Persisted state (`sift.v1`)

- Format/version: **unchanged**. Boards with 2–6 choices round-trip; legacy 2–4 boards
  load as-is (strict superset). Boards with <2 or >6 choices are rejected by the existing
  validator and fall back to the default board (never crash).

## State transitions

Unchanged. `addChoice` / `removeChoice` transitions simply operate over the wider range;
`editing` cleanup on choice removal (`store.svelte.ts:155`) is count-agnostic.
