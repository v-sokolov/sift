// Pure note arrangement. Given a Choice + ViewPrefs, return the note structure to
// render. Never mutates the choice. See contracts/view.md.

import type { Choice, Direction, Note, NoteType, ViewPrefs, Weight } from './types';

export interface Section {
  // null = flat list; NoteType = grouped-by-type; Weight = a by-weight section;
  // 'weightless' = the trailing by-weight section holding neutral (weightless) notes (008).
  label: NoteType | Weight | 'weightless' | null;
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
    // By weight (008): one section per present weight value, heaviest first, types mixed;
    // then a trailing 'weightless' section for neutral (null-weight) notes. Empty sections
    // are omitted. Members keep creation order.
    if (prefs.groupKey === 'weight') {
      const sections: Section[] = [];
      for (const w of [3, 2, 1] as const) {
        const inWeight = notes.filter((n) => n.weight === w);
        if (inWeight.length) sections.push({ label: w, notes: inWeight });
      }
      const weightless = notes.filter((n) => n.weight === null);
      if (weightless.length) sections.push({ label: 'weightless', notes: weightless });
      return sections;
    }

    // By type: fixed Adv → Disadv → Neutral. Weighted sections heaviest first (the prior
    // grouped default); neutral keeps creation order. Direction is ignored in grouped mode.
    const heaviestFirst = byWeight('desc');
    return [
      {
        label: 'advantage',
        notes: stableSort(notes.filter((n) => n.type === 'advantage'), heaviestFirst),
      },
      {
        label: 'disadvantage',
        notes: stableSort(notes.filter((n) => n.type === 'disadvantage'), heaviestFirst),
      },
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
