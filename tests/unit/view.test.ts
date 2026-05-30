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
  return {
    mode: 'default',
    sortKey: 'weight',
    direction: 'desc',
    groupKey: 'type',
    theme: 'system',
    lang: 'en',
    ...p,
  };
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

describe('arrange — grouped by type (008)', () => {
  it('fixed section order Adv → Disadv → Neutral', () => {
    const out = arrange(mixed, prefs({ mode: 'grouped', groupKey: 'type' }));
    expect(out.map((s) => s.label)).toEqual(['advantage', 'disadvantage', 'neutral']);
  });

  it('weighted sections are heaviest first; neutral keeps creation order', () => {
    const out = arrange(mixed, prefs({ mode: 'grouped', groupKey: 'type' }));
    expect(ids(out[0].notes)).toEqual(['a3', 'a1']);
    expect(ids(out[1].notes)).toEqual(['d3', 'd1']);
    expect(ids(out[2].notes)).toEqual(['nu']);
  });

  it('ignores direction — grouping by type is identical for asc and desc', () => {
    const asc = arrange(mixed, prefs({ mode: 'grouped', groupKey: 'type', direction: 'asc' }));
    const desc = arrange(mixed, prefs({ mode: 'grouped', groupKey: 'type', direction: 'desc' }));
    expect(asc.map((s) => [s.label, ids(s.notes)])).toEqual(
      desc.map((s) => [s.label, ids(s.notes)]),
    );
  });
});

// Separate fixture so the 3→2→1 weight grouping is fully exercised without disturbing
// the `mixed`-based default/sorted regression cases.
const weighted = choice([
  note('a3', 'advantage', 3),
  note('d2', 'disadvantage', 2),
  note('a1', 'advantage', 1),
  note('nn', 'neutral', null),
  note('a2', 'advantage', 2),
]);

describe('arrange — grouped by weight (008)', () => {
  it('mixed fixture: sections for present weights desc, then weightless', () => {
    const out = arrange(mixed, prefs({ mode: 'grouped', groupKey: 'weight' }));
    expect(out.map((s) => s.label)).toEqual([3, 1, 'weightless']);
    expect(ids(out[0].notes)).toEqual(['d3', 'a3']); // weight 3, creation order, types mixed
    expect(ids(out[1].notes)).toEqual(['a1', 'd1']); // weight 1, creation order
    expect(ids(out[2].notes)).toEqual(['nu']); // weightless (neutral)
  });

  it('full 3→2→1 ordering with a weight-2 section; members in creation order', () => {
    const out = arrange(weighted, prefs({ mode: 'grouped', groupKey: 'weight' }));
    expect(out.map((s) => s.label)).toEqual([3, 2, 1, 'weightless']);
    expect(ids(out[0].notes)).toEqual(['a3']);
    expect(ids(out[1].notes)).toEqual(['d2', 'a2']); // both weight 2, creation order, types mixed
    expect(ids(out[2].notes)).toEqual(['a1']);
    expect(ids(out[3].notes)).toEqual(['nn']);
  });

  it('all-neutral choice yields a single weightless section', () => {
    const allNeutral = choice([note('x', 'neutral', null), note('y', 'neutral', null)]);
    const out = arrange(allNeutral, prefs({ mode: 'grouped', groupKey: 'weight' }));
    expect(out.map((s) => s.label)).toEqual(['weightless']);
    expect(ids(out[0].notes)).toEqual(['x', 'y']);
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
