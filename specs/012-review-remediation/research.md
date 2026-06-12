# Research: Codebase-Health Remediation

Feature: `012-review-remediation` · Source: `REVIEW.md` (commit `9dedf17`). Design decisions for
*how* to satisfy each remediation requirement with the smallest, test-guarded change. Only the
anchors still cited by the contracts (R1–R3) are retained; the note-commit (R4), `SuggestStatus`
(R5), `.gitignore` (R6), doc/comment (R7), and test-strategy (R8) decisions are summarized in
`spec.md`.

## R1 — Adopt Bits UI's `Dialog` in `SuggestDialog` (FR-003/FR-004)

**Decision**: Rebuild `SuggestDialog.svelte` on `bits-ui`'s `Dialog` primitive
(`Dialog.Root` / `Overlay` / `Content` / `Title` / `Close`), **rendered inline (no
`Dialog.Portal`)** — the "012 pattern" — with `open` controlled by the store:
`<Dialog.Root open={s.suggest.open} onOpenChange={(v) => (v ? openSuggest() : closeSuggest())}>`.
Delete the hand-rolled focus-trap / Esc / backdrop / scroll-lock in `App.svelte` and the backdrop
handler + `modalEl` focus/scroll `$effect`s in `SuggestDialog.svelte`.

**Rationale**: Verified in `bits-ui@2.18.1` that `Dialog.Content` composes `EscapeLayer`
(Esc-to-close), `DismissibleLayer` (backdrop/outside-click dismiss), `FocusScope` (focus trap +
focus-restore on close), and `ScrollLock` — precisely the four hand-rolled behaviors. Adopting
the primitive is the Principle III "material gain in accessibility/maintainability" the v2.0.0
constitution bump was written for; it makes the declared dependency real and the docs true-by-use.

- **Inline (no Portal)** keeps the dialog DOM in the app subtree, so container-scoped component
  tests still find it (Portal would move it to `document.body`). `Dialog.Content` renders in place
  without a Portal.
- **Controlled open from the store** keeps the store the single source of truth — the trigger
  lives in `Header.svelte` (`[data-action="open-suggest"]`), outside the dialog subtree, so
  `Dialog.Trigger` is not used; controlled `open` + `onOpenChange` is the supported external-trigger
  pattern.
- **Class/markup preservation**: `class="modal-overlay"` on `Dialog.Overlay`, `class="modal"` on
  `Dialog.Content`, forwarding `data-region="suggest"` / `data-action` /
  `aria-labelledby="suggest-title"`. `Dialog.Content` emits `role="dialog"` + `aria-modal="true"`,
  so the hand-set attributes are dropped.
- **Focus into the name field on open**: `Dialog.Content`'s `onOpenAutoFocus` focuses
  `[data-field="suggest-name"]`; **focus-return** to the trigger on close is handled automatically
  by `FocusScope`.

**Alternatives rejected**: remove both deps + keep the hand-rolled dialog (leaves the docs
asserting an unused library — rejected per Clarification); `Dialog.Portal` (needs broader
test-query rewrite, no user benefit); `Dialog.Trigger` in `Header` (larger cross-component
refactor).

## R2 — Esc precedence after dialog adoption (FR-004)

**Decision**: Keep the `App.svelte` `svelte:window` `onkeydown` handler **only** for the note-form
Esc branch (`if (getState().editing) closeForm()`). Remove the suggest-Esc branch and the entire
Tab focus-trap block — Bits UI's `EscapeLayer`/`FocusScope` own those while the dialog is open.

**Rationale**: The dialog is modal and traps focus while open, so its own Esc layer fires; the
window handler's remaining form branch is only reachable when the dialog is closed. No precedence
conflict remains.

## R3 — Pre-paint theme resolution + collapse duplicated dark palette (FR-006/FR-007/FR-008)

**Decision**: Resolve the theme to an explicit `light`/`dark` attribute **before first paint**,
and make that the *only* mechanism — so the `@media (prefers-color-scheme: dark)` CSS block is
deleted and only `:root` (light) + `:root[data-theme="dark"]` remain.

Three coordinated changes:
1. **Inline pre-paint snippet** in `index.html` `<head>` (runs before the module bundle): read
   `localStorage['sift.v1']`, `JSON.parse`, take `.view.theme`; `'dark'`/`'light'` set the
   matching attribute, otherwise (`'system'`, missing, or malformed — wrapped in `try/catch`)
   resolve via `matchMedia('(prefers-color-scheme: dark)')`. Always sets an explicit attribute;
   never throws.
2. **`theme.ts`** gains a pure, testable `resolveTheme(theme, prefersDark): 'light' | 'dark'`,
   reworks `applyTheme` to set an explicit attribute (never `removeAttribute`), and installs a
   `matchMedia` `change` listener so an OS flip updates the attribute live while the stored theme
   is `'system'` (the listener the stale comment promised).
3. **CSS**: delete the `@media (prefers-color-scheme: dark)` block; keep the single
   `:root[data-theme="dark"]` block. Because the attribute is now always explicit, the media query
   is dead weight and its removal kills the verbatim duplication (FR-008).

**Rationale**: Setting the attribute pre-paint eliminates the FOUC. Always-explicit resolution is
what lets the media-query branch be deleted, resolving FOUC and CSS duplication in one stroke. The
pure `resolveTheme` is the unit-testable seam (Principle IV); the small logic duplication between
the inline snippet and `theme.ts` is the unavoidable cost of pre-paint (the snippet cannot import a
module before paint) and is kept minimal.

**Alternatives rejected**: keep `removeAttribute` for `system` + keep the media query (cannot
delete the duplicated block, fails FR-008, and a reloading `system` user risks a flash window);
move all theme logic into the inline script (bloats `index.html`, bypasses the tested module).
