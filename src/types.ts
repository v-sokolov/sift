// Domain types for Sift. See specs/001-sift-mvp/data-model.md.

export type NoteType = 'advantage' | 'disadvantage' | 'neutral';
export type Weight = 1 | 2 | 3;

export interface Note {
  id: string;
  text: string;
  type: NoteType;
  weight: Weight | null; // null IFF type === 'neutral'
}

export interface Choice {
  id: string;
  title: string; // may be '' → render ghost placeholder ("Choice 1"...)
  notes: Note[];
}

export interface Dilemma {
  id: string;
  title: string; // the question; '' → ghost placeholder
  choices: Choice[]; // length constrained 2..4
  createdAt: number;
  updatedAt: number;
}

export type ViewMode = 'default' | 'grouped' | 'sorted';
export type SortKey = 'weight' | 'type';
export type Direction = 'asc' | 'desc';
export type Theme = 'system' | 'light' | 'dark';

export interface ViewPrefs {
  mode: ViewMode;
  sortKey: SortKey;
  direction: Direction;
  theme: Theme;
}

// Working values for the unified add/edit form.
export interface NoteDraft {
  text: string;
  type: NoteType;
  weight: Weight | null;
}

// When creating a new note the noteId is absent; when editing it is present.
export type EditTarget =
  | { kind: 'new'; choiceId: string }
  | { kind: 'edit'; choiceId: string; noteId: string };

export interface AppState {
  dilemma: Dilemma;
  view: ViewPrefs;
  editing: EditTarget | null; // the add/edit form target, or null when form hidden
  draft: NoteDraft | null; // working form values while the form is open
  lastSavedAt: number | null; // drives the quiet "Saved" indicator
}

// Persisted slice (localStorage). See contracts/persistence.md.
export interface PersistedV1 {
  schemaVersion: 1;
  dilemma: Dilemma;
  view: ViewPrefs;
}

export const MIN_CHOICES = 2;
export const MAX_CHOICES = 4;
