import { describe, it, expect } from 'vitest';
import type { Choice, Note, NoteType, ViewPrefs, Weight } from '../../src/types';
import { arrange } from '../../src/view';

function note(id: string, type: NoteType, weight: Weight | null): Note {
  return { id, text: id, type, weight };
}
function choice(notes: Note[]): Choice {
  return { id: 'c', title: 'c', notes };
}
function prefs(p: Partial<ViewPrefs>): ViewPrefs {
  return { mode: 'default', sortKey: 'weight', direction: 'desc', theme: 'system', ...p };
}

const mixed = choice([
  note('a1', 'advantage', 1),
  note('d3', 'disadvantage', 3),
  note('nu', 'neutral', null),
  note('a3', 'advantage', 3),
  note('d1', 'disadvantage', 1),
]);

const ids = (notes: Note[]): string[] => notes.map((n) => n.id);

describe('arrange — default', () => {
  it('keeps creation order in one flat section', () => {
    const out = arrange(mixed, prefs({ mode: 'default' }));
    expect(out).toHaveLength(1);
    expect(out[0].label).toBeNull();
    expect(ids(out[0].notes)).toEqual(['a1', 'd3', 'nu', 'a3', 'd1']);
  });
});

describe('arrange — grouped', () => {
  it('fixed section order Adv → Disadv → Neutral regardless of direction', () => {
    const out = arrange(mixed, prefs({ mode: 'grouped', direction: 'asc' }));
    expect(out.map((s) => s.label)).toEqual(['advantage', 'disadvantage', 'neutral']);
  });

  it('desc orders each weighted section heaviest first; neutral keeps creation order', () => {
    const out = arrange(mixed, prefs({ mode: 'grouped', direction: 'desc' }));
    expect(ids(out[0].notes)).toEqual(['a3', 'a1']);
    expect(ids(out[1].notes)).toEqual(['d3', 'd1']);
    expect(ids(out[2].notes)).toEqual(['nu']);
  });

  it('asc orders weighted sections lightest first', () => {
    const out = arrange(mixed, prefs({ mode: 'grouped', direction: 'asc' }));
    expect(ids(out[0].notes)).toEqual(['a1', 'a3']);
    expect(ids(out[1].notes)).toEqual(['d1', 'd3']);
  });
});

describe('arrange — sorted', () => {
  it('by weight desc, heaviest first; neutral (0) sorts to the light end', () => {
    const out = arrange(mixed, prefs({ mode: 'sorted', sortKey: 'weight', direction: 'desc' }));
    expect(out).toHaveLength(1);
    expect(ids(out[0].notes)).toEqual(['d3', 'a3', 'a1', 'd1', 'nu']);
  });

  it('by type asc = advantage → disadvantage → neutral, ties keep creation order', () => {
    const out = arrange(mixed, prefs({ mode: 'sorted', sortKey: 'type', direction: 'asc' }));
    expect(ids(out[0].notes)).toEqual(['a1', 'a3', 'd3', 'd1', 'nu']);
  });

  it('by type desc reverses to neutral → disadvantage → advantage', () => {
    const out = arrange(mixed, prefs({ mode: 'sorted', sortKey: 'type', direction: 'desc' }));
    expect(ids(out[0].notes)).toEqual(['nu', 'd3', 'd1', 'a1', 'a3']);
  });
});
