# Quickstart: Accordion Choice Cards (020)

## Automated gates

```bash
yarn tsc --noEmit        # type gate
yarn vitest run          # A*/F*/E*/S*/B* contracts + full regression suite
yarn build               # build gate — verify against a CLEAN install (constitution)
```

## Manual walkthrough (dev server: `yarn dev`)

1. **A1 default** — open a board with saved Points: every card shows name + score only
   (collapsed); the summary band below is unchanged.
2. **A2 toggle** — click one card's chevron: it folds open alone; click again to fold
   shut. Other cards never move.
3. **F1/F2 footer** — card footers show +N green / −N red / 0 muted, matching the
   summary cell for the same Choice in value and colour. Check light AND dark themes
   (M3: AA contrast).
4. **FR-010 auto-expand** — with all cards collapsed, add a Point (form below the
   board) targeting a collapsed Choice → that card opens showing the new Point; edit
   and remove a Point likewise re-open their card. Other cards stay shut.
5. **FR-007/013/014 header & actions (rev. 2)** — the header shows the name as plain
   text; clicking anywhere on the header row toggles the card. Expand a card: the
   actions row shows "✎ Rename" · "✕ Remove". Rename → header text becomes an
   autofocused input; type (name updates live), Enter/blur keeps it, Esc restores the
   old name; while editing, clicking the header must NOT toggle. ✕ Remove on a Pointed
   Choice still asks first (016), on an empty one removes instantly; both require the
   card to be expanded.
6. **FR-006/SC-004 honesty** — toggle cards repeatedly with devtools →
   Application → localStorage `sift.v1`: the stored value never changes; the
   save-status indicator never flips; reload → all cards collapsed again (FR-012).
7. **M2 layout** — add 5–6 Choices, expand a couple: wrapped rows stay tidy; footers
   pin to card bottoms; ≤719px single-column stack hugs content.
8. **M1 motion** — OS reduced-motion ON → fold is instant.
9. **M4 keyboard** — Tab to chevron, Enter/Space toggles, focus stays sane.
10. **M5 glance** — 6 collapsed Choices visible without scrolling the board (SC-002).
