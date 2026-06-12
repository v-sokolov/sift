# Contract: Scoring (`scoring.ts`)

Pure, side-effect-free. Derived live on every render; nothing stored (FR-013–FR-015).

## API

```ts
function forTotal(choice: Choice): number;      // Σ weight of advantage notes
function againstTotal(choice: Choice): number;  // Σ weight of disadvantage notes
function choiceScore(choice: Choice): number;   // forTotal - againstTotal

// Set of choice ids sharing the single highest score; empty when all scores are 0.
function leaders(choices: Choice[]): Set<string>;
```

## Laws

- **S1**: Neutral notes contribute 0 to every total (filtered out). (FR-014)
- **S2**: `forTotal`/`againstTotal` sum the `weight` (1–3) of matching notes; a
  non-neutral note with `weight === null` cannot occur (guaranteed by store I2).
- **S3**: `choiceScore = forTotal − againstTotal`. Sign rendered as `+N` / `−N` / `0`.
- **S4**: `leaders` returns **all** choices tied for the max score (no tiebreaker, FR-017).
- **S5**: When every choice scores 0, `leaders` returns ∅ (don't highlight an all-zero board).
- **S6**: Pure — no I/O, no Date, no randomness; same input → same output.

## Worked example (must hold as tests)

| Choice  | Advantages | Disadvantages | forTotal | againstTotal | score |
|---------|------------|---------------|---------:|-------------:|------:|
| Acme    | 3, 2       | 3             | 5        | 3            | +2    |
| Globex  | 3, 2, 1    | 2             | 6        | 2            | +4    |
| Initech | 2          | 3, 2          | 2        | 5            | −3    |

→ `leaders([Acme, Globex, Initech]) = {Globex.id}`. Two choices at +4 → both ids.
Adding a neutral note (weight null) changes no number.
