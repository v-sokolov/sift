# Contract: Persistence (`persistence.ts`)

Debounced save of dilemma + view prefs to `localStorage`; defensive load on boot.
(FR-024–FR-026, R3, R5.)

## API

```ts
const STORAGE_KEY = 'sift.v1';
const DEBOUNCE_MS = 400;

// Serialize current persisted slice and schedule a debounced write.
function scheduleSave(state: AppState): void;

// Force an immediate synchronous write (called on visibilitychange/beforeunload).
function flushSave(state: AppState): void;

// Read + validate on boot. Returns null when absent/invalid (caller uses emptyDilemma()).
function load(): { dilemma: Dilemma; view: ViewPrefs } | null;

// Wire flush-on-unload once at boot.
function installUnloadFlush(getState: () => AppState): void;
```

## Persisted envelope

```ts
interface PersistedV1 { schemaVersion: 1; dilemma: Dilemma; view: ViewPrefs; }
```

- Only `dilemma` and `view` are persisted; `editing` and `lastSavedAt` are runtime-only.
- After a successful write, the caller sets `lastSavedAt` to drive the "Saved" indicator.

## Rules

- **P1**: Single key `sift.v1`, single JSON object (atomic write — no field desync). (R5)
- **P2**: Debounce coalesces rapid mutations into one write after `DEBOUNCE_MS` idle. (R3)
- **P3**: `flushSave` cancels any pending debounce and writes immediately; called on
  `visibilitychange` (hidden) and `beforeunload` so nothing is lost on close. (R3)
- **P4**: `load()` parses defensively. Returns `null` if: key missing, JSON unparseable,
  `schemaVersion !== 1`, or shape/invariant checks fail (e.g. choices length not 2–4,
  weight/type mismatch). Never throws to the caller. (R5, FR-029)
- **P5**: A `localStorage` write failure (quota/private-mode) is caught and swallowed;
  the app keeps working in-memory and the "Saved" indicator reflects the last success
  (no crash). At this data size quota is effectively never hit.
- **P6**: `schemaVersion` enables future migration (MVP-2 shareable link / decided flag)
  by transforming older envelopes in `load()` before returning.

## Test expectations

- Round-trip: `flushSave(state)` then `load()` returns an equal dilemma + view.
- Corruption: writing `"not json"` / `{schemaVersion:99}` / choices length 1 → `load()` returns null.
- Debounce: N rapid `scheduleSave` calls within the window result in a single write.
- Unload: `flushSave` writes even with a pending debounced save outstanding.
