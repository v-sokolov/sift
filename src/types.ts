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
  choices: Choice[]; // length constrained 2..6
  createdAt: number;
  updatedAt: number;
}

export type ViewMode = 'default' | 'grouped' | 'sorted';
export type SortKey = 'weight' | 'type';
export type GroupKey = 'type' | 'weight'; // dimension Group mode buckets points by (008)
export type Direction = 'asc' | 'desc';
export type Theme = 'system' | 'light' | 'dark';

// Save-status indicator (010). Runtime-only display state, never persisted:
//  hidden  — no content edit yet this session (fresh open / just cleared)
//  editing — a content change is pending (not yet stored)
//  saved   — the most recent content change has been stored
export type SaveStatus = 'hidden' | 'editing' | 'saved';

// Localization (002-post-mvp-improvements).
export type Lang = 'en' | 'uk';
export const LANGS: Lang[] = ['en', 'uk'];
export const DEFAULT_LANG: Lang = 'en';

export interface ViewPrefs {
  mode: ViewMode;
  sortKey: SortKey; // Sort mode only
  direction: Direction; // Sort mode only
  groupKey: GroupKey; // Group mode only (008); default 'type'
  rankByTotal: boolean; // 018: when true, Choice cards display highest-score-first (display-only)
  theme: Theme;
  lang: Lang; // active interface language
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

// Suggest-a-feature modal (002-post-mvp-improvements). Transient — never persisted.
export interface SuggestionDraft {
  name: string; // required (non-whitespace) to enable Send
  description: string; // required (non-whitespace) to enable Send
  email: string; // optional — submitter's contact (goes in the body, not the maintainer addr)
  github: string; // optional
  linkedin: string; // optional
}

export interface SuggestState {
  open: boolean;
  draft: SuggestionDraft;
}

export interface AppState {
  dilemma: Dilemma;
  view: ViewPrefs;
  editing: EditTarget | null; // the add/edit form target, or null when form hidden
  draft: NoteDraft | null; // working form values while the form is open
  suggest: SuggestState; // the suggest-a-feature modal (transient)
  lastSavedAt: number | null; // timestamp of the last successful store (transient)
  status: SaveStatus; // drives the save-status indicator (transient; not persisted) — 010
}

// Persisted slice (localStorage). See contracts/persistence.md.
export interface PersistedV1 {
  schemaVersion: 1;
  dilemma: Dilemma;
  view: ViewPrefs;
}

export const MIN_CHOICES = 2;
export const MAX_CHOICES = 6;
