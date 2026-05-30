# Quickstart: On-Device Acceptance Matrix — Remove Point & Clear Preferences

Automated tests cover store behavior, the ✕ removal/edit-independence, and the new aria-label.
The rows below are the checks that jsdom cannot make (physical touch size, on-device hover,
visual emphasis) plus the end-to-end persistence checks — verify these manually before merge.

## Setup

```bash
yarn install            # offline sandbox: see CLAUDE.md / memory for yarn quirks
node_modules/.bin/vite  # dev server; or: yarn build && preview the dist/
```

Run the suite + type check first (must be green):

```bash
node_modules/.bin/vitest run
node_modules/.bin/svelte-check
```

## Acceptance matrix

| # | Scenario | Steps | Expected | Maps to |
|---|---|---|---|---|
| 1 | ✕ always visible | Add a point. Observe the row without hovering. | A de-emphasized ✕ is visible on the row at rest (desktop AND touch). | FR-002, SC-003 |
| 2 | Remove one point | Add 3 points; tap/click the ✕ on the 2nd. | Only the 2nd is removed; others keep order; no confirm dialog. | FR-003, FR-004, SC-001/002 |
| 3 | ✕ ≠ edit | Click the ✕. | The point is removed; the edit form does NOT open. | FR-010 |
| 4 | Edit still works | Click the point's text/body (not the ✕). | The edit form opens as before. | (no regression) |
| 5 | Keyboard remove | Tab to a point's ✕; press Enter, then repeat with Space. | Point is removed; behavior identical to click. Focus ring visible on the ✕. | FR-008, FR-012 |
| 6 | Remove while editing | Open edit form for a point; remove that same point (via its ✕). | Form closes/resets; no stale form bound to the gone point; Save does nothing orphaned. | FR-011 |
| 7 | Last point removed | Remove the only point of a choice. | Choice shows the calm empty-points state; can still add new points. | FR-006 |
| 8 | Score updates | Note a choice's score; remove a weighted advantage. | Score/totals update to exclude the removed point. | FR-005, SC-004 |
| 9 | Removal persists | Remove a point; reload the page. | The removed point does not reappear. | FR-007, SC-005 |
| 10 | 44px target (mobile) | On a phone / device emulation, tap the ✕. | Easy to hit; activation area ≥ 44×44 CSS px, consistent with other controls. | FR-012, SC-006 |
| 11 | Touch: no hover needed | On a real touch device, use ✕ without any hover. | Fully operable; nothing about the control depends on hover. | FR-002, FR-013, SC-003 |
| 12 | **Clear keeps theme** | Set theme to dark; add content; press Clear (confirm). | Board empties; theme stays **dark** (not reset to system/light). | FR-016, SC-007 |
| 13 | **Clear keeps language** | Set language to Ukrainian; press Clear (confirm). | Board empties; language stays Ukrainian. | FR-017, SC-007 |
| 14 | Clear prefs persist | After #12/#13, reload the page. | Preserved theme and language still apply. | FR-018, SC-007 |
| 15 | Clear still confirms + empties | Press Clear. | The existing confirmation appears; on confirm, all content (title, points, sort/mode) is emptied. | (Assumptions, no regression) |

## Done

- Automated: `vitest` green (incl. new store + NoteRow tests), `svelte-check` 0 errors, `vite
  build` succeeds.
- Manual: all rows above pass on at least one desktop browser and one real (or emulated) mobile
  viewport, in both light and dark themes.
