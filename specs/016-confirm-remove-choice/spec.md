# Feature Specification: Confirm Removing a Choice with Points

> **Status: Shipped — condensed 2026-06-09**

Merged in PR #18.

## What shipped

Removing a Choice that holds **≥1 point** (any type, incl. neutral-only) now asks for
confirmation before anything changes; an **empty Choice keeps today's instant one-click
removal**. The point count is read at click time, so a Choice whose points were all deleted
earlier removes instantly.

The confirmation is a shared **`ConfirmDialog.svelte` built on Bits UI `Dialog`**, rendered
inline (no portal — the 012 `SuggestDialog` pattern). It reuses the **014 placement CSS
verbatim** (`.modal-overlay` fixed z-100 backdrop + `.modal modal--confirm` fixed
`inset:0; margin:auto; height:fit-content; z-101`, the modifier only narrowing max-width).
Focus-trap, Esc-decline, outside-click dismiss, focus-return, and **background scroll-lock**
all come from the primitive. The message renders inside `Dialog.Title` (it is the accessible
name), with two equal-width buttons (011 `btn--half`): Cancel and the destructive action.

The **board Clear confirmation migrated onto the same dialog**, retiring the product's last
`window.confirm` — after 016, no destructive action uses a native browser prompt. Call sites
own the open state (ChoiceCard ✕ gate, Toolbar Clear); the `removeChoice`/`clearDilemma`
mutations are **unchanged**. **Decline (Cancel, Esc, outside-click) is a strict no-op** — no
state change, no persist notification.

## Why

Points are the user's only hand-entered data and there is no undo; one stray click could
destroy them. Empty cards are not worth a prompt, so they stay frictionless. A single themed
in-app dialog replaces jarring native browser chrome and unifies both destructive actions, so
the codebase ends with **fewer** confirmation patterns than it started with (2 → 1).

## Key decisions

- **Bits UI `Dialog`, not `AlertDialog`** — `AlertDialog` intentionally blocks outside-click
  dismissal, but the spec requires outside-click to count as decline; `Dialog` is also the
  pattern already proven against this codebase's CSS and tests.
- **No point count in the message** — EN/UA plural rules differ and the i18n layer has no
  plural machinery; "all its points" carries the same warning weight without `{count}`.
  New key `confirm.removeChoice` interpolates the display name (`choice.title`, else the
  existing localized `choice.placeholder`), mirroring `confirm.clear`'s "can't be undone"
  register. Cancel/Remove/Clear action labels added (EN/UA).
- **No persisted state** — no "don't ask again"; open state is local component state. Domain
  logic, count invariants (2–6), and the `sift.v1` format are untouched (presentation only).

## Contract

Behavior, dialog, and stability laws (B1–B6, D1–D4, S1–S3) live in
[`contracts/remove-confirmation.md`](./contracts/remove-confirmation.md).
