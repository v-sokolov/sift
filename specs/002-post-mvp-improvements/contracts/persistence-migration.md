# Contract: Persistence migration for `view.lang` (`src/persistence.ts`)

Extends the MVP persistence contract. Key and schema version are unchanged
(`STORAGE_KEY = 'sift.v1'`, `schemaVersion: 1`). Adds a backward-compatible, forgiving
`view.lang`.

## Write

- `serialize(state)` writes `view` **including** `lang` (always one of `LANGS`).
- Debounce (400 ms) and flush-on-unload behavior unchanged.

## Load (forgiving `lang`)

Current `validView` requires `mode`, `sortKey`, `direction`, `theme`. Change:

- `validView` MUST continue to require the existing four fields.
- `lang` is **not** required to validate. After a payload otherwise validates, resolve `lang`:
  - if `parsed.view.lang ∈ LANGS` → keep it;
  - else → leave it unset and let boot detection fill it (`detectLang(navigator.language)`).
- A missing/invalid `lang` MUST NOT cause the whole payload to be rejected (no board loss).

### Resulting load behavior

| Stored `view.lang` | Result |
|--------------------|--------|
| `'en'` / `'uk'` | used as-is (stored choice wins — FR-004) |
| absent (old MVP payload) | detection runs at boot → first-visit behavior (FR-002) |
| invalid (`'fr'`, number, …) | treated as absent → detection |

## Boot sequence (`main.ts`)

```
const restored = load();                 // dilemma + view (lang maybe unset)
const view = restored?.view ?? emptyDilemma().view;
const lang = isLang(view.lang) ? view.lang : detectLang(navigator.language);
setState({ ...emptyDilemma(), dilemma: restored?.dilemma ?? …, view: { ...view, lang } });
```

- Stored language always overrides detection (FR-004).
- First visit / no valid stored language → detection (FR-002), default `en`.
