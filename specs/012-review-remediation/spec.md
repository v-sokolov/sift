# Codebase-Health Remediation (Repo Review Follow-up)

> **Status: Shipped — condensed 2026-06-09**

Acted on the actionable findings of the repository review (`REVIEW.md`, commit `9dedf17`):
polish on an already-disciplined codebase, not rescue work. Merged across PRs #13–#14.

## What shipped

- **Adopted Bits UI's `Dialog` in `SuggestDialog`** — rebuilt on the `Dialog` primitive
  (`Dialog.Root` / `Overlay` / `Content` / `Title` / `Close`) **rendered inline, no Portal**
  (the "012 pattern"), with `open` controlled by the store. Deleted the hand-rolled
  focus-trap / Esc / backdrop / scroll-lock (in `App.svelte` and the dialog). This made the
  already-declared `bits-ui` dependency real (FR-001/FR-003) and the dialog's a11y behavior is
  preserved exactly (FR-004). See `contracts/dialog-ui.md`.
- **Removed `@internationalized/date`** — imported nowhere, supports no feature (FR-002).
  *(Later re-added in 013 as a required `bits-ui` peer dep — see that spec.)*
- **Pre-paint theme FOUC fix** — an inline `<head>` snippet in `index.html` resolves the saved
  theme to an explicit `data-theme="light|dark"` **before first paint** via the new pure
  `resolveTheme(theme, prefersDark)`; `theme.ts` always sets an explicit attribute and registers
  a `matchMedia` listener for live OS flips under `theme === 'system'` (FR-006/FR-007/FR-012).
- **Collapsed the duplicated dark palette** — deleted the `@media (prefers-color-scheme: dark)`
  block so the dark custom properties live **once** under `:root[data-theme="dark"]`; made dead
  by the always-explicit attribute (FR-008). See `contracts/theme.md`.
- **De-duplicated the note-commit path** — `submitForm` now **delegates** to existing
  `addNote` / `updateNote`, keeping only form-lifecycle bits; the tested functions become
  UI-reachable instead of dead code (FR-010).
- **Removed write-only `SuggestStatus` scaffolding** — the one-member `'idle'` union and the
  unread `SuggestState.status` field, set in two places and read nowhere (FR-011). `SaveStatus`
  (010) is unaffected.
- **Committed the constitution** — narrowed `.gitignore` to un-ignore exactly
  `.specify/memory/constitution.md` while the rest of `.specify/` stays ignored, so the 80 specs'
  Constitution-Check references resolve (FR-009). Content unchanged → no version bump.
- **Doc/comment honesty** — updated `CLAUDE.md` + constitution rationale so Bits UI is described
  as genuinely used by the dialog (true-by-use, not drift, FR-005); rewrote the stale `theme.ts`
  header comment; removed the CSS spec-tag comments (`(006)`/`(007)`/`(008)`, `M[0-9]/FR-*`),
  keeping substantive *why*-comments (FR-013).

## Why

The review framed doc drift as "the live risk": a committed doc asserting Bits UI was in use while
the code never imported it erodes trust in all docs. The theme flash was the only user-visible
item — wrong first impression for a "calm" product. The rest are isolated internal cleanups.

## Key decisions

- **Adopt Bits UI rather than remove it** (clarified 2026-05-31): rewriting `SuggestDialog` on the
  primitive makes the declared dep real and the docs true-by-use; the dialog's user-facing
  behavior is preserved exactly. The headless primitive replacing a hand-rolled focus-trap is the
  Principle III "material a11y/maintainability gain" the v2.0.0 constitution rationale was written
  for.
- **Inline (no Portal)** keeps the dialog DOM in the app subtree so container-scoped component
  tests still find it; controlled `open` + `onOpenChange` from the store keeps the store the
  single source of truth (the trigger lives in `Header.svelte`, outside the dialog subtree).
- **Always-explicit `data-theme`** is what lets the `@media (prefers-color-scheme: dark)` block be
  deleted — resolving the FOUC and the CSS duplication in one stroke.
- **Delegate, don't delete** the note-commit functions — keeps the tested functions live and DRYs
  the body.

## Out of scope (review said leave alone)

The store snapshot/immutable-producer pattern, the flat folder layout, hand-rolled i18n, `data-*`
test attributes, the shipped specs (001–011), the bulk of in-code comments, and the Tier-4
ceremony-scaling process levers.

## Boundaries

- Persisted state untouched: `sift.v1` localStorage schema (version 1) is backward-compatible; no
  migration (FR-014). No new runtime dependency; net dependency change is a removal.
- No backend/network/telemetry (Principle II); dialog a11y and note add/edit behavior preserved.
