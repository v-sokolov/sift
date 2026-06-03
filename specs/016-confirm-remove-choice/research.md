# Research: Confirm Removing a Choice with Points (016)

All Technical Context unknowns resolved. Three decisions.

## R1 — Mechanism: shared in-app `ConfirmDialog` on Bits UI `Dialog`; Clear migrates too (user-decided 2026-06-03)

**Decision**: Build one shared `ConfirmDialog.svelte` on **Bits UI `Dialog`** (rendered
inline, no portal — the 012 `SuggestDialog` pattern) and use it for BOTH destructive
confirmations: the new Choice-removal guard and the existing board Clear, which migrates
off `window.confirm` (`Toolbar.svelte:41`) — retiring the product's last native prompt
(FR-010). Placement reuses the **014-hardened CSS verbatim**: `Dialog.Overlay
class="modal-overlay"` (fixed, `z-index:100` backdrop) + `Dialog.Content class="modal
modal--confirm"` (fixed, `inset:0; margin:auto; height:fit-content; z-index:101`), with
only a narrow `.modal--confirm` width modifier added. **Background scroll-lock,
focus-trap, Esc-decline, outside-click dismiss, and focus-return are provided by the
primitive** — all five were verified in 012 and re-verified after 014.

**Rationale**:
- **User direction**: a unified, themed in-app dialog for both destructive actions was
  chosen over the native-prompt shortcut after weighing complexity (see cost note below).
- **Risk is pre-paid**: the three historically tricky parts — dialog placement (014 fixed
  exactly this), scroll-lock/focus behavior (012 delegated it to Bits UI), and z-order
  vs. the note form — are already solved and regression-tested in this codebase. The
  component is consumer #2 of a proven pattern, not a new pattern.
- **Consistency & calm (Constitution I)**: native `confirm` is browser chrome — unthemed,
  jarring against the app's quiet visual language, and inconsistent with the Suggest
  dialog. One in-app dialect for every modal interaction is the calmer end state, and the
  codebase finishes with FEWER confirmation patterns than it started with (2 → 1).
- **Spec fit**: outside-click-counts-as-decline (spec edge case) and Esc-decline map
  directly onto `Dialog`'s `onOpenChange(false)`; FR-006's placement + scroll-lock
  requirements are exactly the 014 contract + Bits UI behavior.

**Cost note (the "too complex?" question)**: bounded — ~60-line component, two call-site
edits, ~4 i18n strings, one CSS modifier, DOM-driven tests. Roughly 2–3× the
`window.confirm` diff, paid once; in exchange Clear's confirm path gains its first
automated tests and the native-prompt dialect disappears.

**Alternatives considered**:
- **Native `window.confirm`** (the original draft of this plan) — rejected per user
  decision: unthemed browser chrome, can't match the app's visual language, leaves two
  confirmation dialects in the product, and its message/buttons aren't stylable or
  consistently localizable (button labels are browser-controlled).
- **Bits UI `AlertDialog`** (present in the installed package, `node_modules/bits-ui/
  dist/bits/alert-dialog/`) — rejected: it intentionally blocks outside-click dismissal,
  while the spec's edge case requires outside-click to decline; `Dialog` is also the
  pattern already proven against this codebase's CSS and tests. Semantics gap is small
  (role) and covered by labelled title/description.
- **Inline two-step ✕ ("click again to confirm")** — rejected: not modal (stray-click
  edge case fails), poor discoverability, timing-dependent state.
- **Undo/toast** — rejected: transient state + timer, contradicts the spec's
  confirmation-based protection model.

## R2 — Message wording & name interpolation

**Decision**: New key `confirm.removeChoice`, interpolating the Choice's display name:
- EN: `'Remove "{name}" and all its points? This can\'t be undone.'`
- UA: `'Видалити "{name}" і всі його пункти? Це не можна скасувати.'`

Display name = `choice.title` when non-empty, else the existing localized placeholder
(`choice.placeholder`, "Choice {n}"/"Варіант {n}") — `ChoiceCard` already derives exactly
this string for the title input, so the handler reuses it (FR-005's SHOULD satisfied with
zero new logic).

**Rationale**: mirrors `confirm.clear`'s register ("This can't be undone." /
"Це не можна скасувати.") for a uniform destructive-action voice; "all its points" states
the consequence without needing count pluralization (EN/UA plural rules differ — avoiding
`{count}` keeps both catalogs simple and the tone calm).

**Alternatives considered**: including the point count (`{count} points`) — rejected:
UA pluralization (пункт/пункти/пунктів) would need plural-rule machinery the i18n layer
doesn't have; "all its points" carries the same warning weight.

## R3 — Test strategy: DOM-driven component tests (dialog buttons, not spies)

**Decision**: New `tests/components/remove-choice.test.ts` (the ✕ control and Clear's
confirm path have no DOM-level tests today). Render the App (house pattern); the dialog
renders inline (no portal, 012 pattern) so `container` queries reach it. Branches:

1. ✕ on a Choice with ≥1 point → dialog visible (`[data-action="confirm-dialog-confirm"]`
   present), message contains the display name (titled and untitled/placeholder variants,
   EN and UA), board NOT yet changed (FR-001/005/007).
2. Cancel click — and separately Esc, and outside-click on the
   `[data-action="confirm-dialog-backdrop"]` overlay — → dialog closed and the full
   `AppState` deep-equal to its pre-click value (FR-003, SC-002, honesty check H2), with a
   `subscribePersist` counter staying 0 across the open+decline flow (B2). If Bits UI's
   outside-pointer dismissal proves un-simulatable in jsdom, the outside-click case falls
   back to manual M1 with an explicit skip-comment — never silently dropped.
3. Confirm click → Choice removed; post-removal behavior intact: open form tied to the
   Choice closes, count drops, add re-enables (FR-004).
4. ✕ on a 0-point Choice → NO dialog appears, instant removal (FR-002, SC-003).
5. Neutral-only points → still prompts (edge case: any point is data).
6. Clear migration (SC-006/FR-010): Clear button opens the same dialog (no
   `window.confirm` call — assert via spy that it is never invoked), decline no-op,
   confirm clears the board preserving theme and language (the existing store tests'
   guarantees, now exercised through the UI).

Placement/scroll-lock geometry is NOT jsdom-assertable (no layout engine) — covered by
the manual smoke (quickstart M1/M4), exactly like 014. Esc handling IS assertable
(keyboard event → Bits UI closes the dialog in jsdom).

**Alternatives considered**: spy-driven `window.confirm` tests (previous draft) — moot
with the dialog; retained only as the negative assertion in branch 6. Store-level guard
(confirmation inside `removeChoice`) — rejected: browser/UI concern inside the store
breaks the state/presentation separation and the mutation's purity.
