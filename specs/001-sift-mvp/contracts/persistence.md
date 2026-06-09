# Contract: Persistence (`persistence.ts`)

Debounced save of dilemma + view prefs to `localStorage`; defensive load on boot.
(FR-024–FR-026.)

## API

```ts
const STORAGE_KEY = 'sift.v1';
const DEBOUNCE_MS = 400;

function scheduleSave(state: AppState): void;   // schedule a debounced write
function flushSave(state: AppState): void;       // immediate sync write (visibilitychange/beforeunload)
function load(): { dilemma: Dilemma; view: ViewPrefs } | null;  // null when absent/invalid
function installUnloadFlush(getState: () => AppState): void;     // wire flush-on-unload once at boot
```

## Persisted envelope

```ts
interface PersistedV1 { schemaVersion: 1; dilemma: Dilemma; view: ViewPrefs; }
```

Only `dilemma` and `view` are persisted; `editing` and `lastSavedAt` are runtime-only.
After a successful write the caller sets `lastSavedAt` to drive the "Saved" indicator.

## Laws

- **P1**: Single key `sift.v1`, single JSON object — atomic write, no field desync.
- **P2**: Debounce coalesces rapid mutations into one write after `DEBOUNCE_MS` idle.
- **P3**: `flushSave` cancels any pending debounce and writes immediately; called on
  `visibilitychange` (hidden) and `beforeunload` so nothing is lost on close.
- **P4**: `load()` parses defensively — returns `null` (never throws) if the key is
  missing, JSON unparseable, `schemaVersion !== 1`, or shape/invariant checks fail
  (e.g. choices length not 2–4, weight/type mismatch). Caller falls back to
  `emptyDilemma()`. (FR-029)
- **P5**: A `localStorage` write failure (quota/private-mode) is caught and swallowed;
  the app keeps working in-memory and the indicator reflects the last success (no crash).
- **P6**: `schemaVersion` enables future migration by transforming older envelopes in
  `load()` before returning.
