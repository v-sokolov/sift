// Debounced localStorage persistence with defensive load. See contracts/persistence.md.

import type {
  AppState,
  Dilemma,
  Direction,
  Lang,
  NoteType,
  SortKey,
  Theme,
  ViewMode,
  ViewPrefs,
  PersistedV1,
} from './types';
import { LANGS, MAX_CHOICES, MIN_CHOICES } from './types';

export const STORAGE_KEY = 'sift.v1';
export const DEBOUNCE_MS = 400;

let timer: ReturnType<typeof setTimeout> | null = null;

function serialize(state: AppState): string {
  const payload: PersistedV1 = {
    schemaVersion: 1,
    dilemma: state.dilemma,
    view: state.view,
  };
  return JSON.stringify(payload);
}

function write(state: AppState): boolean {
  try {
    localStorage.setItem(STORAGE_KEY, serialize(state));
    return true;
  } catch {
    return false; // quota / private mode — keep working in-memory (P5)
  }
}

/** Coalesce rapid mutations into a single write after DEBOUNCE_MS idle (P2). */
export function scheduleSave(state: AppState, onSaved?: (ts: number) => void): void {
  if (timer) clearTimeout(timer);
  timer = setTimeout(() => {
    timer = null;
    if (write(state)) onSaved?.(Date.now());
  }, DEBOUNCE_MS);
}

/** Cancel any pending debounce and write immediately (P3). */
export function flushSave(state: AppState, onSaved?: (ts: number) => void): void {
  if (timer) {
    clearTimeout(timer);
    timer = null;
  }
  if (write(state)) onSaved?.(Date.now());
}

// ---- Defensive load (P4) ----

const NOTE_TYPES: NoteType[] = ['advantage', 'disadvantage', 'neutral'];
const VIEW_MODES: ViewMode[] = ['default', 'grouped', 'sorted'];
const SORT_KEYS: SortKey[] = ['weight', 'type'];
const DIRECTIONS: Direction[] = ['asc', 'desc'];
const THEMES: Theme[] = ['system', 'light', 'dark'];

export function isLang(v: unknown): v is Lang {
  return typeof v === 'string' && (LANGS as string[]).includes(v);
}

function isObj(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null;
}

// `lang` is intentionally NOT validated here so that older payloads (pre-i18n,
// no `lang`) still load — language is resolved at boot via detection. A present
// but invalid `lang` is normalized away in load().
function validView(v: unknown): v is ViewPrefs {
  if (!isObj(v)) return false;
  return (
    VIEW_MODES.includes(v.mode as ViewMode) &&
    SORT_KEYS.includes(v.sortKey as SortKey) &&
    DIRECTIONS.includes(v.direction as Direction) &&
    THEMES.includes(v.theme as Theme)
  );
}

function validDilemma(d: unknown): d is Dilemma {
  if (!isObj(d)) return false;
  if (typeof d.id !== 'string' || typeof d.title !== 'string') return false;
  if (typeof d.createdAt !== 'number' || typeof d.updatedAt !== 'number') return false;
  if (!Array.isArray(d.choices)) return false;
  if (d.choices.length < MIN_CHOICES || d.choices.length > MAX_CHOICES) return false;
  return d.choices.every((c: unknown) => {
    if (!isObj(c)) return false;
    if (typeof c.id !== 'string' || typeof c.title !== 'string') return false;
    if (!Array.isArray(c.notes)) return false;
    return c.notes.every((n: unknown) => {
      if (!isObj(n)) return false;
      if (typeof n.id !== 'string' || typeof n.text !== 'string') return false;
      if (!NOTE_TYPES.includes(n.type as NoteType)) return false;
      if (n.type === 'neutral') return n.weight === null;
      return n.weight === 1 || n.weight === 2 || n.weight === 3;
    });
  });
}

/** Returns null when missing/unparseable/invalid; caller falls back to emptyDilemma(). */
export function load(): { dilemma: Dilemma; view: ViewPrefs } | null {
  let raw: string | null = null;
  try {
    raw = localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
  if (!raw) return null;

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return null;
  }
  if (!isObj(parsed) || parsed.schemaVersion !== 1) return null;
  if (!validDilemma(parsed.dilemma) || !validView(parsed.view)) return null;
  const view = parsed.view as unknown as Record<string, unknown>;
  // Drop a missing/invalid language so boot detection resolves it (FR-002/FR-004).
  if (!isLang(view.lang)) {
    delete view.lang;
  }
  // 008: groupKey is additive — a missing/invalid value defaults to 'type' (the prior
  // grouped behaviour), so pre-008 saves load unchanged without a schemaVersion bump.
  if (view.groupKey !== 'type' && view.groupKey !== 'weight') {
    view.groupKey = 'type';
  }
  return { dilemma: parsed.dilemma, view: parsed.view };
}

/** Wire flush-on-unload so nothing is lost when the tab closes (P3). */
export function installUnloadFlush(
  getState: () => AppState,
  onSaved?: (ts: number) => void,
): void {
  const flush = () => flushSave(getState(), onSaved);
  window.addEventListener('beforeunload', flush);
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') flush();
  });
}
