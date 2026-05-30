// Pure note arrangement. Given a Choice + ViewPrefs, return the note structure to
// render. Never mutates the choice. See contracts/view.md.

import type { Choice, Direction, Note, NoteType, ViewPrefs } from './types';

export interface Section {
  label: NoteType | null; // null = flat list
  notes: Note[];
}

const typeRankAsc: Record<NoteType, number> = {
  advantage: 0,
  disadvantage: 1,
  neutral: 2,
};

const weightOf = (n: Note): number => n.weight ?? 0;

/** Stable sort: equal keys preserve original (creation) order. */
function stableSort(notes: Note[], cmp: (a: Note, b: Note) => number): Note[] {
  return notes
    .map((n, i) => [n, i] as const)
    .sort((a, b) => {
      const c = cmp(a[0], b[0]);
      return c !== 0 ? c : a[1] - b[1];
    })
    .map(([n]) => n);
}

function byWeight(dir: Direction): (a: Note, b: Note) => number {
  return (a, b) => (dir === 'asc' ? weightOf(a) - weightOf(b) : weightOf(b) - weightOf(a));
}

export function arrange(choice: Choice, prefs: ViewPrefs): Section[] {
  const notes = choice.notes;

  if (prefs.mode === 'default') {
    return [{ label: null, notes: [...notes] }];
  }

  if (prefs.mode === 'grouped') {
    const cmp = byWeight(prefs.direction);
    return [
      {
        label: 'advantage',
        notes: stableSort(notes.filter((n) => n.type === 'advantage'), cmp),
      },
      {
        label: 'disadvantage',
        notes: stableSort(notes.filter((n) => n.type === 'disadvantage'), cmp),
      },
      // Neutral has no weight → keep creation order.
      { label: 'neutral', notes: notes.filter((n) => n.type === 'neutral') },
    ];
  }

  // sorted: one flat list.
  let cmp: (a: Note, b: Note) => number;
  if (prefs.sortKey === 'weight') {
    cmp = byWeight(prefs.direction);
  } else {
    cmp = (a, b) => {
      const r = typeRankAsc[a.type] - typeRankAsc[b.type];
      return prefs.direction === 'asc' ? r : -r;
    };
  }
  return [{ label: null, notes: stableSort(notes, cmp) }];
}
