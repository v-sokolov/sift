# Contract: Suggest-Dialog Positioning & Stacking

**Feature**: `014-fix-dialog-positioning` · **Phase 1**

A presentation contract for the open suggest dialog. It defines the observable layout/stacking
guarantees and the structural hooks that must be preserved, without prescribing exact pixel values.

## Structural invariants (preserved from 012 — MUST hold)

- Bits UI `Dialog` is retained; `Dialog.Overlay` carries `class="modal-overlay"` and
  `data-action="suggest-backdrop"`; `Dialog.Content` carries `class="modal"` and
  `data-region="suggest"`. (FR-009)
- Overlay and Content render as **inline siblings** (no portal), in the app subtree.
- `data-*` hooks used by tests (`data-action="close-suggest"`, `data-action="suggest-form"`,
  `data-field="suggest-*"`, `data-action="suggest-send"`, etc.) are unchanged.

## Layout contract (when the dialog is open)

| ID | Guarantee |
|----|-----------|
| P1 | The panel (`.modal`) is centered horizontally **and** vertically in the viewport. |
| P2 | The panel's centering does **not** depend on it being a DOM child of `.modal-overlay` (works with sibling rendering). |
| P3 | The backdrop (`.modal-overlay`) covers the full viewport with the existing dim color. |
| P4 | The panel is anchored to the viewport (fixed) — it does not scroll with the page or appear in normal flow below other content, regardless of page length or scroll position. |
| P5 | Panel width is fluid up to `max-width: 460px`, with edge gutter on small viewports so it never touches screen edges. |
| P6 | On viewports shorter than the panel, the panel is bounded to `max-height: 90dvh` and scrolls its content internally while staying centered. |

## Stacking contract

| ID | Guarantee |
|----|-----------|
| S1 | `.modal` (panel) renders **above** `.modal-overlay` (backdrop). |
| S2 | `.modal-overlay` renders **above** all other application content. |
| S3 | No application content visually bleeds over the open panel at any breakpoint. |

## Preserved appearance (unchanged from 012)

- Surface background, 1px border, radius, and box-shadow of the panel.
- Backdrop dim (`rgba(0,0,0,0.45)`), padding/gutter intent.
- Internal layout: title, intro, fields, equal-width Cancel/Send (`btn--half`), fallback link.

## Behavioral invariants (owned by Bits UI — MUST be unaffected by this change)

- Focus moves to the first field on open (`onOpenAutoFocus` → `[data-field="suggest-name"]`).
- Tab focus-trap within the panel; focus returns to the trigger on close.
- Esc closes; outside-click (on the backdrop) dismisses; body scroll-lock while open.

## Out of scope

- Any change to the suggest flow (fields, mailto hand-off, fallback link), domain logic, or
  persisted state.
- Portalling the dialog, adding animations, or introducing new breakpoints.
