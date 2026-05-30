# Data Model: UI Copy Refinements

This feature adds **no application-state entities** and changes **no stored data shape**
(`localStorage` `sift.v1` is untouched). The only "data" is the i18n catalog: new keys and
relabeled display values. Documented here for completeness.

## i18n keys — additions (both catalogs)

| Key | Section | EN value (verbatim) | UA value (verbatim) |
|-----|---------|---------------------|---------------------|
| `header.tagline` | `// Header` | A quiet way to weigh a decision. Compare a few options by their pros and cons, and let a gentle score help you think — it never decides for you. | Тихий спосіб зважити рішення. Порівняйте кілька варіантів за перевагами й недоліками, а делікатна оцінка допоможе подумати — вона ніколи не вирішує за вас. |
| `summary.formula` | `// Summary` | Each advantage adds its weight (1–3), each disadvantage subtracts it; neutral points don't count. | Кожна перевага додає свою вагу (1–3), кожен недолік її віднімає; нейтральні пункти не враховуються. |

> **F1 alignment**: the caption uses "points"/«пункти» (not "notes"/«нотатки») to stay consistent
> with the US3 umbrella-noun relabel. "neutral points" pairs correctly with the unchanged neutral
> type word.

## i18n keys — relabeled values (display only; key names unchanged)

| Key | EN: old → new | UA: old → new |
|-----|---------------|---------------|
| `choice.empty` | No notes yet → **No points yet** | Поки немає нотаток → **Поки немає пунктів** |
| `note.empty` | (empty note) → **(empty point)** | (порожня нотатка) → **(порожній пункт)** |
| `form.addNote` | ＋ add note → **＋ add point** | ＋ додати нотатку → **＋ додати пункт** |
| `form.noteTypeAria` | Note type → **Point type** | Тип нотатки → **Тип пункту** |
| `form.textAria` | Note text → **Point text** | Текст нотатки → **Текст пункту** |

## Invariants (unchanged / enforced)

- **Catalog parity**: every key in `en.ts` exists in `uk.ts` and vice versa (parity test). The two
  new keys must be added to both; the five relabeled keys already exist in both.
- **No blank/raw-key values**: every value is non-empty and not equal to its key.
- **Unchanged keys**: `note.emptyShort`, `note.weightLabel`, `note.editAria`, `noteType.*`,
  `group.*`, `form.type*`, `form.textPlaceholder`, and all `choice.*`/«Варіант» strings keep their
  current values.
- **Brand literal**: `Sift` is a hardcoded markup literal, not an i18n key.

## UI-text elements (presentation entities)

| Element | DOM | Source | Theme behavior |
|---------|-----|--------|----------------|
| Wordmark | `h1.header__wordmark` | literal `Sift` | `--text`; never localized |
| Tagline | `p.header__tagline` | `t(lang, 'header.tagline')` | `--text-muted` (or `--text` if AA fails) |
| Score caption | `p.summary__formula` | `t(lang, 'summary.formula')` | `--text-muted` (or `--text` if AA fails); `grid-column: 1 / -1`; not `.sum` |
