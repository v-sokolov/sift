# Quickstart: Group by Dimension & Add-Point Placement

On-device / browser acceptance matrix for `008-group-by-dimension`. Run after implementation in a
desktop browser and a mobile viewport, light and dark themes. Most rows are also covered by
automated tests; the starred (★) rows are the ones worth eyeballing.

Setup fixture: a choice with mixed points — e.g. Advantage ●●● (3), Advantage ● (1),
Disadvantage ●●● (3), Disadvantage ● (1), and one Neutral.

| #  | Action | Expected | Ref |
|----|--------|----------|-----|
| 1 ★| Turn **Group** on | Config row shows a **Group by: [Type | Weight]** segment; **no Asc/Desc** anywhere | FR-005, SC-001 |
| 2  | Group on, **Type** selected | Sections: Advantages, Disadvantages, Neutral | FR-002, SC-002 |
| 3  | Inspect Advantages section (Type) | Heaviest first: ●●● before ● | FR-007 |
| 4  | Inspect Neutral section (Type) | Neutral points in creation order | FR-007 |
| 5 ★| Select **Weight** | Sections become **Weight 3**, **Weight 2**(if any), **Weight 1**, then a neutral/weightless section | FR-003 |
| 6  | Inspect **Weight 3** section | Contains the weight-3 advantage **and** weight-3 disadvantage together | FR-004, SC-003 |
| 7  | All-neutral choice + Weight | Only the weightless section appears; no numbered sections | edge case |
| 8  | A weight with no points | That weight heading does not appear | FR-008 |
| 9 ★| Toggle Type ↔ Weight a few times | Re-sections instantly (<1s); no point lost/duplicated/changed | SC-005 |
| 10 | Reload the page (Group=Weight) | Still in Group mode, still **Weight** dimension | FR-009, SC-004 |
| 11 ★| Load a pre-008 saved state (no groupKey) | Loads fine; Group defaults to **By Type** | FR-010, SC-004 |
| 12 | Turn Group off, turn **Sort** on | Sort shows **By: [Weight | Type]** and **Direction: [Asc | Desc]** — unchanged | FR-012, SC-006 |
| 13 | Score while regrouping | Score totals identical regardless of grouping dimension | FR-015 |
| 14 ★| Keyboard: Tab to the Group-by segment, activate with Enter/Space | Focus-visible ring; toggles dimension; 44px target on mobile | FR-017 |
| 15 | Dark + light theme | Group-by control and weight headings legible, AA contrast, weight shown by dots not colour | Principle V |
| 16 ★| **Add point above score**: open the app | The **Add point** control sits **above** the score summary | FR-013, SC-007 |
| 17 | Add a point | Point added; score below updates as before | FR-014, SC-007 |
| 18 | Open the add/edit form | The form appears above the score (in the Add-point slot) | edge case |

Automated coverage: rows 2–6, 11, 12, 16–17 map to unit/component tests (see contracts). Rows 1,
9, 14, 15, 18 include visual/touch/keyboard aspects to confirm on-device.
