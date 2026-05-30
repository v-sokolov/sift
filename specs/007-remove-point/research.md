# Research & Decisions: Remove Point & Preserve Preferences on Clear

All decisions below are resolved — there are no open `NEEDS CLARIFICATION` items. The feature is
small; this document records the few real choices and the codebase facts they rest on.

## R1 — Reuse the existing `removeNote` store action

- **Decision**: Wire the ✕ control to the existing `removeNote(choiceId, noteId)` in
  `src/store.svelte.ts:177`. No new state API.
- **Rationale**: It already filters the note out and calls `touch(d)`, which marks the board
  dirty and drives the debounced `localStorage` persistence — so removal persists for free
  (FR-007). Adding a parallel action would violate Principle III (YAGNI).
- **Alternatives considered**: A new `deletePoint` action (rejected — duplicates `removeNote`); a
  component-local splice (rejected — bypasses the typed store and persistence channel).

## R2 — Always-visible control, not hover/focus-reveal

- **Decision**: The ✕ is rendered in the DOM at all times, visually de-emphasized at rest, and
  MAY brighten on hover/focus only as decoration.
- **Rationale**: This is the crux of why "remove point" was deferred out of 006. A hover-only
  control is invisible and inoperable on touch devices and fails Principle V / the 006 M9
  "nothing hover-only" rule. Always-visible is the only option that satisfies touch + keyboard +
  pointer uniformly (FR-002, SC-003).
- **Alternatives considered**: Hover-reveal with focus parity (rejected by the requester — still
  effectively invisible on touch, the exact platform 006 hardened). Long-press / swipe-to-delete
  (rejected — undiscoverable, no keyboard equivalent, heavier than a "tiny feature").

## R3 — Remove must not trigger the row's edit action

- **Decision**: The point row (`<li>`) is itself a `role="button"` edit target
  (`NoteRow.svelte`). The ✕ is a nested real `<button>`; its `click` and key activation
  handlers MUST call `stopPropagation()` so they neither bubble to the row's `onclick={edit}`
  nor to the row's `onkeydown` Enter/Space → edit handler (FR-010).
- **Rationale**: Without this, clicking ✕ would both delete the point and open the edit form for
  it (which FR-011 then has to clean up) — confusing and racy. Stopping propagation keeps the two
  interactions cleanly independent. A native nested `<button>` also gives correct focus order and
  Enter/Space activation for free (FR-008).
- **Alternatives considered**: Moving the remove control outside the clickable row (rejected —
  worse layout, the row already spans the width); making the whole row non-interactive and adding
  a separate "edit" button (rejected — larger change, alters established 004/006 interaction).

## R4 — Removing a point that is currently being edited

- **Decision**: Extend `removeNote` so that if the open edit form targets the note being removed
  (`editing.kind === 'edit' && editing.noteId === noteId`), it resets the form to a safe closed
  state in the same mutation (FR-011).
- **Rationale**: After removal the note no longer exists; leaving `editing` pointed at a missing
  note would show a stale form whose Save silently no-ops (`editNote` does `findChoice(...).notes
  .find(...)` → not found). Clearing it in the store keeps the invariant "the form only ever
  targets a live note" and is the smallest correct fix. This is a behavior change → TDD.
- **Alternatives considered**: Handling it in the component (rejected — the store owns `editing`
  and is the single source of truth; a component guard would be fragile and untyped). Ignoring it
  (rejected — violates FR-011 and leaves a confusing dangling form).

## R5 — `Clear` preserves Theme (and keeps preserving Language)

- **Decision**: Amend `clearDilemma()` to copy the current `view.theme` into the fresh state, the
  same way it already copies `view.lang` (`store.svelte.ts:271`).
- **Rationale**: Verified current behavior — `clearDilemma` restores only `lang`, so `theme`
  falls back to `emptyDilemma()`'s default (`'system'`), meaning Clear silently resets a user's
  dark/light choice. Theme and Language are *interface preferences*, not decision *content*;
  Clear is meant to discard content (FR-016/017/018). One-line change, persists via the same
  channel as any theme change.
- **Alternatives considered**: A confirmation that offers "also reset preferences" (rejected —
  over-engineered, violates Principle I calm). Persisting theme under a separate storage key
  (rejected — unnecessary; the existing single `sift.v1` blob already carries `view.theme`, and
  changing the persistence shape would violate the FR-014 no-format-change invariant).

## R6 — One new i18n key, EN authoritative + UK mirror

- **Decision**: Add a single key `note.removeAria` (e.g. EN "Remove point", UK "Видалити пункт")
  used as the ✕ button's `aria-label`/`title`. No existing key's meaning changes.
- **Rationale**: FR-009 requires an accessible label distinct from the row's edit label; the
  project's i18n parity + no-blank/no-raw-key unit tests already enforce that every key exists in
  both catalogs, so adding to both keeps the suite green (FR-014/FR-015).
- **Alternatives considered**: Reusing `choice.removeAria` "Remove choice" (rejected — wrong
  noun, would mislead screen-reader users). A bare "×" with no label (rejected — fails Principle
  V / FR-009).

## R7 — Styling reuses the established `.iconbtn` ✕ pattern

- **Decision**: Style the remove control with the existing `.iconbtn` class already used for the
  ChoiceCard remove ✕ (`ChoiceCard.svelte`), which 006 already gave `min-block-size: 44px;
  min-inline-size: 44px`, inline-flex centering, `:focus-visible` parity, and `@media (hover)`-
  gated emphasis. Add only the `.note`-row layout glue needed to seat it (e.g. place it in the
  `.note__meta` cluster or as a trailing element with appropriate spacing).
- **Rationale**: Maximit reuse → meets FR-012/SC-006 (44px) and the hover-gating rule with no new
  CSS concepts; visually consistent with the existing choice-remove ✕. Principle III.
- **Alternatives considered**: A new bespoke button style (rejected — duplicates `.iconbtn`,
  risks missing the 44px/focus rules 006 already encodes).

## R8 — Test posture (Principle IV)

- **Decision**: TDD the two behavior changes as store unit tests (fail first): (a)
  `clearDilemma` preserves a non-default theme; (b) `removeNote` on the currently-edited note
  clears `editing`/`draft`. Add a component test for NoteRow: the ✕ removes the point, the ✕ does
  **not** open the edit form, and it exposes the localized aria-label. i18n parity for the new
  key is covered by the existing parity test.
- **Rationale**: Principle IV is non-negotiable: behavior changes require tests, written first.
  jsdom can assert all of the above (DOM presence, click behavior, store state). Pixel-level
  touch-target size (44px) and on-device hover are not jsdom-assertable and are verified via the
  quickstart manual matrix, exactly as in 006.
- **Alternatives considered**: Skipping tests for the "trivial" wiring (rejected — violates
  Principle IV and the FR-015 green-suite gate).
