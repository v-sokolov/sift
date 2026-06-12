# Contracts: Scroll, Focus, Collapsible Header & Scrollbar Gutter

## Scroll Contracts (S)

**S1** — After `addChoice()` is called and the DOM is updated, `scrollIntoView` MUST be called on the newly created choice card element.

**S2** — The scroll behavior MUST be `smooth` when `prefers-reduced-motion` is not set, and `instant` when it is set.

**S3** — `scrollIntoView` MUST NOT be called when a choice is removed, reordered, or on initial load — only on addition.

---

## Focus Contracts (F)

**F1** — When `AddEditForm` mounts with `editing.kind === 'new'`, the textarea element (`data-field="note-text"`) MUST become `document.activeElement`.

**F2** — When the Add Point form is submitted and re-opens (draft reset, same `editing.kind === 'new'`), the textarea MUST receive focus again.

**F3** — The `autofocus` action imported from `src/actions.ts` MUST call `node.focus()` and `node.select()` on mount.

---

## Header Collapsible Contracts (H)

**H1** — On initial render, `descOpen` in `Header.svelte` MUST be `false`.

**H2** — At viewport width ≤719 px: the `.header__tagline-toggle` button MUST be visible; the tagline content MUST NOT be visible when `descOpen === false`.

**H3** — At viewport width ≤719 px: clicking the toggle MUST set `descOpen = true`; the tagline content MUST become visible.

**H4** — At viewport width ≥720 px: the `.header__tagline-toggle` button MUST have `display: none`; the tagline content MUST be visible regardless of `descOpen`.

**H5** — The toggle button MUST carry `aria-expanded` reflecting `descOpen`, and `aria-controls` pointing to the tagline element's `id`.

**H6** — The toggle `aria-label` MUST be `t(lang, 'header.taglineToggleShow')` when collapsed and `t(lang, 'header.taglineToggleHide')` when expanded.

---

## Scrollbar Gutter Contract (G)

**G1** — The `html` element MUST have `scrollbar-gutter: stable` applied in `app.css`, ensuring consistent layout width regardless of scrollbar presence.

---

## Boundary Contracts (B)

**B1** — The `sift.v1` `localStorage` payload MUST remain byte-for-byte identical to a pre-021 payload after all four enhancements are applied (S1–S3, F1–F3, H1–H6, G1 introduce zero persisted state changes).

**B2** — All contracts from 015 (grid), 016 (confirm-remove), 018 (rank-colour), and 020 (accordion, rename, score footer, expand state) MUST remain green.

**B3** — The automated test count MUST be ≥211 (existing) plus new tests for H and F contracts.

---

## Manual Tests (M)

**M1** — `scrollbar-gutter: stable`: Resize viewport to trigger/remove scrollbar; confirm no horizontal layout shift. Open a dialog (SuggestDialog) and close it; confirm no layout shift.

**M2** — Auto-scroll: Add a 5th or 6th Choice when the board is full; confirm the new card scrolls into view. Verify smooth scroll on standard, instant on `prefers-reduced-motion`.

**M3** — Auto-focus: Open the Add Point form; confirm the textarea is immediately focused (cursor visible). Submit and confirm refocus on re-open.

**M4** — Collapsible header (mobile, ≤719 px): Load page; confirm description hidden, toggle visible. Tap toggle; confirm description visible. Tap again; confirm hidden. Reload; confirm hidden again.

**M5** — Collapsible header (desktop, ≥720 px): Load page; confirm description always visible, toggle not rendered.

**M6** — Reduced-motion scroll: Enable `prefers-reduced-motion: reduce` in OS/DevTools; add a Choice; confirm scroll is instant (no animation).

**M7** — Collapsible header keyboard: Tab to the `.header__tagline-toggle` button; press Enter; confirm description expands and focus remains on the button. Press Enter again; confirm description collapses. Satisfies SC-005 keyboard-operable requirement.
