// Single source-of-truth store, Svelte 5 runes edition. Replaces state.ts: same
// mutation names/signatures/invariants (see contracts/store.md), backed by `$state`.
// Reactivity is automatic — components read getState() and re-render on change. A
// persistence channel still fires on content/view mutations so persistence.ts can
// debounce-save. setLastSaved / initLang are render-only (no save → no loop).

import type {
  AppState,
  Choice,
  Direction,
  EditTarget,
  Lang,
  NoteDraft,
  NoteType,
  SortKey,
  SuggestionDraft,
  SuggestState,
  Theme,
  Weight,
} from './types';
import { DEFAULT_LANG, MAX_CHOICES, MIN_CHOICES } from './types';
import { newId } from './ids';

type Listener = (state: AppState) => void;
const saveListeners = new Set<Listener>();

export function emptyChoice(): Choice {
  return { id: newId(), title: '', notes: [] };
}

export function emptyDraft(): SuggestionDraft {
  return { name: '', description: '', email: '', github: '', linkedin: '' };
}

export function emptySuggest(): SuggestState {
  return { open: false, draft: emptyDraft(), status: 'idle' };
}

export function emptyDilemma(): AppState {
  const now = Date.now();
  return {
    dilemma: {
      id: newId(),
      title: '',
      choices: [emptyChoice(), emptyChoice()],
      createdAt: now,
      updatedAt: now,
    },
    view: {
      mode: 'default',
      sortKey: 'weight',
      direction: 'desc',
      theme: 'system',
      lang: DEFAULT_LANG,
    },
    editing: null,
    draft: null,
    suggest: emptySuggest(),
    lastSavedAt: null,
  };
}

// The reactive source of truth. Reading `current` (directly or via getState()) inside
// a component template/effect registers a dependency; mutating it re-renders.
let current = $state<AppState>(emptyDilemma());

function notifySave(): void {
  for (const cb of saveListeners) cb(current);
}

export function getState(): AppState {
  return current;
}

/** Persistence channel: fires on every content/view mutation (not on setLastSaved). */
export function subscribePersist(cb: Listener): () => void {
  saveListeners.add(cb);
  return () => saveListeners.delete(cb);
}

export function setState(next: AppState): void {
  current = next;
  notifySave();
}

/** Set the "Saved" timestamp WITHOUT triggering another save (avoids a loop). */
export function setLastSaved(ts: number): void {
  current.lastSavedAt = ts;
}

function update(producer: (draft: AppState) => AppState | void): void {
  // $state.snapshot gives a plain, non-proxied deep copy (proxy-safe clone).
  const draft = $state.snapshot(current) as AppState;
  const ret = producer(draft);
  current = (ret ?? draft) as AppState;
  notifySave();
}

function touch(d: AppState): void {
  d.dilemma.updatedAt = Date.now();
}

function findChoice(d: AppState, choiceId: string): Choice | undefined {
  return d.dilemma.choices.find((c) => c.id === choiceId);
}

function normalizeWeight(type: NoteType, weight: Weight | null): Weight | null {
  if (type === 'neutral') return null;
  return weight ?? 3;
}

// ---- Dilemma & choices (US1) ----

export function setDilemmaTitle(title: string): void {
  update((d) => {
    d.dilemma.title = title;
    touch(d);
  });
}

export function addChoice(): void {
  update((d) => {
    if (d.dilemma.choices.length >= MAX_CHOICES) return;
    d.dilemma.choices.push(emptyChoice());
    touch(d);
  });
}

export function renameChoice(choiceId: string, title: string): void {
  update((d) => {
    const c = findChoice(d, choiceId);
    if (!c) return;
    c.title = title;
    touch(d);
  });
}

export function removeChoice(choiceId: string): void {
  update((d) => {
    if (d.dilemma.choices.length <= MIN_CHOICES) return;
    d.dilemma.choices = d.dilemma.choices.filter((c) => c.id !== choiceId);
    if (d.editing && d.editing.choiceId === choiceId) {
      d.editing = null;
      d.draft = null;
    }
    touch(d);
  });
}

// ---- Notes (US1) ----

export function addNote(choiceId: string, draft: NoteDraft): void {
  update((d) => {
    const c = findChoice(d, choiceId);
    if (!c || !draft.text.trim()) return;
    c.notes.push({
      id: newId(),
      text: draft.text.trim(),
      type: draft.type,
      weight: normalizeWeight(draft.type, draft.weight),
    });
    touch(d);
  });
}

export function updateNote(choiceId: string, noteId: string, draft: NoteDraft): void {
  update((d) => {
    const n = findChoice(d, choiceId)?.notes.find((x) => x.id === noteId);
    if (!n) return;
    n.text = draft.text.trim();
    n.type = draft.type;
    n.weight = normalizeWeight(draft.type, draft.weight);
    touch(d);
  });
}

export function removeNote(choiceId: string, noteId: string): void {
  update((d) => {
    const c = findChoice(d, choiceId);
    if (!c) return;
    c.notes = c.notes.filter((n) => n.id !== noteId);
    // FR-011: if the edit form is open for the note being removed, close it so it
    // never stays bound to a now-nonexistent note.
    if (d.editing?.kind === 'edit' && d.editing.noteId === noteId) {
      d.editing = null;
      d.draft = null;
    }
    touch(d);
  });
}

// ---- Add/edit form (US1) ----

export function openAddForm(choiceId: string): void {
  update((d) => {
    d.editing = { kind: 'new', choiceId };
    d.draft = { text: '', type: 'advantage', weight: 3 };
  });
}

export function openEditForm(choiceId: string, noteId: string): void {
  update((d) => {
    const n = findChoice(d, choiceId)?.notes.find((x) => x.id === noteId);
    if (!n) return;
    d.editing = { kind: 'edit', choiceId, noteId };
    d.draft = { text: n.text, type: n.type, weight: n.weight };
  });
}

export function closeForm(): void {
  update((d) => {
    d.editing = null;
    d.draft = null;
  });
}

export function setFormChoice(choiceId: string): void {
  update((d) => {
    if (d.editing && d.editing.kind === 'new') d.editing = { kind: 'new', choiceId };
  });
}

export function setFormType(type: NoteType): void {
  update((d) => {
    if (!d.draft) return;
    d.draft.type = type;
    d.draft.weight = type === 'neutral' ? null : (d.draft.weight ?? 3);
  });
}

export function setFormWeight(weight: Weight): void {
  update((d) => {
    if (d.draft && d.draft.type !== 'neutral') d.draft.weight = weight;
  });
}

export function setFormText(text: string): void {
  update((d) => {
    if (d.draft) d.draft.text = text;
  });
}

/** Commit the form. New notes keep the form open (FR-010); edits close it. */
export function submitForm(): void {
  update((d) => {
    const editing: EditTarget | null = d.editing;
    const draft = d.draft;
    if (!editing || !draft) return;
    if (!draft.text.trim()) return;
    const c = findChoice(d, editing.choiceId);
    if (!c) return;
    if (editing.kind === 'new') {
      c.notes.push({
        id: newId(),
        text: draft.text.trim(),
        type: draft.type,
        weight: normalizeWeight(draft.type, draft.weight),
      });
      d.draft = { text: '', type: draft.type, weight: draft.weight };
    } else {
      const n = c.notes.find((x) => x.id === editing.noteId);
      if (n) {
        n.text = draft.text.trim();
        n.type = draft.type;
        n.weight = normalizeWeight(draft.type, draft.weight);
      }
      d.editing = null;
      d.draft = null;
    }
    touch(d);
  });
}

// ---- Lifecycle (US2 of MVP) ----

/** Erase the board/view to defaults but PRESERVE the language AND theme choices (FR-016/017/018). */
export function clearDilemma(): void {
  const { lang, theme } = current.view;
  const fresh = emptyDilemma();
  fresh.view.lang = lang;
  fresh.view.theme = theme;
  setState(fresh);
}

// ---- Language ----

export function setLang(lang: Lang): void {
  update((d) => {
    d.view.lang = lang;
  });
}

/** Apply a detected language at boot WITHOUT triggering a save (render-only). */
export function initLang(lang: Lang): void {
  current.view.lang = lang;
}

// ---- Suggest a feature ----

/** True when the suggestion can be sent: name AND description are non-whitespace. */
export function canSend(draft: SuggestionDraft): boolean {
  return draft.name.trim() !== '' && draft.description.trim() !== '';
}

export function openSuggest(): void {
  update((d) => {
    d.suggest = { open: true, draft: emptyDraft(), status: 'idle' };
  });
}

export function closeSuggest(): void {
  update((d) => {
    d.suggest.open = false;
  });
}

export function setSuggestField(field: keyof SuggestionDraft, value: string): void {
  update((d) => {
    d.suggest.draft[field] = value;
  });
}

// ---- View prefs ----

export function toggleGroup(): void {
  update((d) => {
    d.view.mode = d.view.mode === 'grouped' ? 'default' : 'grouped';
  });
}

export function toggleSort(): void {
  update((d) => {
    d.view.mode = d.view.mode === 'sorted' ? 'default' : 'sorted';
  });
}

export function setSortKey(key: SortKey): void {
  update((d) => {
    d.view.sortKey = key;
  });
}

export function setDirection(direction: Direction): void {
  update((d) => {
    d.view.direction = direction;
  });
}

// ---- Theme ----

export function setTheme(theme: Theme): void {
  update((d) => {
    d.view.theme = theme;
  });
}

export function cycleTheme(): void {
  update((d) => {
    d.view.theme =
      d.view.theme === 'system' ? 'light' : d.view.theme === 'light' ? 'dark' : 'system';
  });
}
