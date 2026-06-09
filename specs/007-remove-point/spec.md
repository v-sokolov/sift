# Feature Specification: Remove Point & Preserve Preferences on Clear

> **Status: Shipped — condensed 2026-06-09**

## Summary

Two small, independent changes, shipped together in merged PR #8:

- **US1 — Remove a point**: every point row gains an always-visible, de-emphasized ✕ remove
  control that deletes that single point immediately (no confirmation), wiring the pre-existing
  `removeNote` store action. This closes the gap where a point could be edited but never
  discarded except by blanking it or wiping the whole board with Clear.
- **US2 — Clear preserves preferences**: the global "Clear" action now keeps the user's **Theme**
  (it already kept **Language**), treating both as interface preferences rather than decision
  content. This is the only intentional behavior change in the feature.

**Why**: a per-point remove is the natural missing counterpart to add/edit, and Clear silently
resetting a user's dark/light choice was a real annoyance. Both are presentation + wiring fixes on
the current Svelte 5 stack — no data-model, scoring, or persistence-shape change, no new runtime
dependency, no backend/network/telemetry.

## Key decisions

- **Reuse `removeNote(choiceId, noteId)`** rather than a parallel delete action — it already
  filters the note and calls `touch(d)`, so removal persists via the existing debounced save for
  free (FR-007).
- **Always-visible, never hover-only**: a hover-reveal control is invisible and inoperable on
  touch, the exact platform 006 hardened; always-visible is the only option uniform across touch,
  pointer, and keyboard (FR-002, SC-003).
- **Independent from edit**: the point row is itself a `role="button"` edit target; the nested ✕
  `<button>` stops propagation so removing never also opens the edit form (FR-010). A native
  `<button>` gives focus order and Enter/Space activation for free (FR-008).
- **Edited-note guard**: `removeNote` resets `editing`/`draft` when the open edit form targets the
  removed note, so the form never points at a missing note (FR-011).
- **Clear**: `clearDilemma()` copies `view.theme` into the fresh state the same way it already
  copies `view.lang` (FR-016/FR-017); serialized shape and confirmation behavior unchanged
  (FR-018).
- **Reuse `.iconbtn`** (the ChoiceCard ✕ pattern) for 44px target, focus-visible, and hover-gated
  emphasis with no new CSS concepts (FR-012, FR-013, SC-006). One new i18n key `note.removeAria`,
  EN authoritative + UK mirror (FR-009).

## Functional Requirements

- **FR-002**: The remove control MUST be always visible whenever its point row is visible — never
  revealed only on hover or only on focus.
- **FR-003**: Activating a point's remove control MUST remove that one point and only that point,
  leaving all other points and their order unchanged.
- **FR-005**: After a removal, the choice's score and for/against totals MUST update to reflect the
  removed point no longer contributing.
- **FR-007**: A removal MUST be persisted to local storage so it survives a page reload.
- **FR-008**: The remove control MUST be operable by pointer (click/tap) and by keyboard
  (focusable, activatable with the standard activation keys), with identical behavior.
- **FR-009**: The remove control MUST carry an accessible, localized label naming the action (e.g.
  "Remove point"); activating the point row itself MUST remain "edit", distinct from remove.
- **FR-010**: Activating the remove control MUST NOT also trigger the point row's edit action.
- **FR-011**: If the add/edit form is open for the point being removed, the form MUST NOT remain
  bound to the removed point (it MUST close or reset to a safe state).
- **FR-012**: The remove control MUST meet the 44×44 CSS-pixel touch-target floor and show a
  visible keyboard focus indicator, consistent with the 006 accessibility hardening.
- **FR-013**: The remove control MUST be visually de-emphasized at rest and MAY brighten on
  hover/focus where supported, but this emphasis MUST be decorative only.
- **FR-015**: All existing automated tests MUST continue to pass; the only intentional behavior
  change is that "Clear" now preserves Theme (in addition to Language). All other behavior, copy,
  and persistence format are preserved.
- **FR-016**: "Clear" MUST preserve the user's current Theme; it MUST NOT reset it to a default.
- **FR-017**: "Clear" MUST preserve the user's current Language (already true; retained).
- **FR-018**: Preferences preserved by "Clear" (Theme and Language) MUST persist across reload.
  "Clear" continues to empty all decision content (title, points, view/sort options) as before.

## Success Criteria

- **SC-003**: 100% of point rows expose a remove control operable by touch, mouse, and keyboard,
  with no point relying on hover to reveal its control.
- **SC-004**: After removing any point, the displayed score and totals match a fresh calculation
  over the remaining points (no stale totals).
- **SC-006**: The remove control's activation area is at least 44×44 CSS pixels on mobile
  viewports.

## Contracts

- `contracts/remove-point.md` — US1 store guard, NoteRow markup/script, styling, i18n, tests.
- `contracts/clear-preferences.md` — US2 `clearDilemma` theme-preservation change + regression test.
