# Phase 1 Data Model: Mobile & Responsive UI Hardening

## No data changes

This feature introduces **no new entity, no new field, and no new persisted datum**. The
application state shape, the runes store (`store.svelte.ts`), the domain types (`types.ts`), and
the `localStorage` schema (`sift.v1`, `PersistedV1`, `schemaVersion: 1`) are all **unchanged**.

- No layout, orientation, viewport, or touch preference is stored — all adaptation is derived
  live from the device/CSS environment (media queries, `env()`, `dvh`), never persisted.
- The existing `ViewPrefs.theme` (system/light/dark) is reused as-is; this feature does not add
  to it.
- Boards saved by the current app continue to load intact (FR-016 — no migration, no schema
  bump).

State invariants (2–4 choices; neutral notes carry no weight; etc.) are untouched because no
store mutation is added or modified.

## Presentation surface (not data — for traceability)

The only "model" this feature changes is the **CSS environment contract** — inputs the layout
reacts to, all read live, none stored:

| Environment input | Source | Used for |
|---|---|---|
| `env(safe-area-inset-{top,right,bottom,left})` | device (via `viewport-fit=cover`) | M6 padding (R1) |
| dynamic viewport height (`dvh`) | browser chrome state | M7 root min-height (R2) |
| `@media (hover) / (pointer)` | input capability | M9 hover-gating (R5) |
| `prefers-reduced-motion` | OS setting | M12 (already in 004) |
| `prefers-color-scheme` | OS setting | M11 default theme (already in 004) |
| platform text-scale / zoom | OS/browser | M3 relative units (R8) |

These are device/runtime signals, not entities; they require no persistence and no migration.
