# Data Model: 018-sort-color-scores

This feature is almost entirely presentation. There is **one** state/persistence delta and
**no** new entity. Ranking is display-only and never mutates Choice order; colour is derived
from the existing score.

## Changed: `ViewPrefs`

`src/types.ts` — add one field:

| Field | Type | Default | Persisted | Notes |
|-------|------|---------|-----------|-------|
| `rankByTotal` | `boolean` | `false` | yes (in `view` slice of `PersistedV1`) | When `true`, Choice cards + score cells are displayed highest-`choiceScore`-first. Display-only — does not affect stored `dilemma.choices` order. |

All other `ViewPrefs` fields unchanged (`mode`, `sortKey`, `direction`, `groupKey`, `theme`,
`lang`).

## Persistence (`PersistedV1`)

- **No** structural change and **no** `schemaVersion` bump (`schemaVersion` stays `1`).
  `rankByTotal` lives inside the already-persisted `view` object.
- **Defensive load** (`persistence.ts.load()`): if `view.rankByTotal` is missing or not a
  boolean, coerce to `false` (mirrors the 008 `groupKey` default-on-load). `validView` is
  **not** tightened to require it, so pre-018 payloads remain valid and load unchanged.

## Derived (not stored)

- **Display order** — `orderedChoices(choices, rankByTotal)` (pure, `view.ts`): stable sort
  by `choiceScore` descending, ties by original index; identity when `rankByTotal` is false.
  Recomputed on render; nothing persisted.
- **Score sign** — `Math.sign(choiceScore(choice))` → `positive | negative | neutral`,
  driving the `.sum__score` colour class. Derived per render from existing data.

## Invariants (unchanged, must continue to hold)

- `dilemma.choices` length stays within `MIN_CHOICES..MAX_CHOICES` (2..6).
- Ranking never adds/removes/reorders stored Choices or changes any Choice's notes/score
  (FR-006).
- Neutral notes carry no weight (`weight === null`) — `choiceScore` already encodes this.
