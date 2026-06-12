import { describe, it, expect } from 'vitest';
import type { Choice, Note, NoteType, ViewPrefs, Weight } from '../../src/types';
import { arrange, orderedChoices, scoreSign, signed } from '../../src/view';

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
    rankByTotal: false,
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

// 015 (FR-003/SC-004): regression lock — arrange() is a per-Choice pure function, so its
// Sort/Group ordering guarantees (009) must hold identically for a 5th/6th Choice. May
// pass on first run (count-agnostic by construction); locks the contract, not red-first.
describe('arrange — parity on a 6-choice board (015)', () => {
  const sixthChoice: Choice = { ...mixed, id: 'c6', title: 'Choice 6' };

  it.each([
    ['default', prefs({ mode: 'default' })],
    ['grouped by type', prefs({ mode: 'grouped', groupKey: 'type' })],
    ['grouped by weight', prefs({ mode: 'grouped', groupKey: 'weight' })],
    ['sorted by weight desc', prefs({ mode: 'sorted', sortKey: 'weight', direction: 'desc' })],
    ['sorted by type asc', prefs({ mode: 'sorted', sortKey: 'type', direction: 'asc' })],
  ] as const)('%s — identical sections whether the notes live on choice 1 or choice 6', (_label, p) => {
    const first = arrange(mixed, p);
    const sixth = arrange(sixthChoice, p);
    expect(sixth.map((s) => [s.label, ids(s.notes)])).toEqual(
      first.map((s) => [s.label, ids(s.notes)]),
    );
  });
});

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

// 009 — lock the Group-mode ordering contract (specs/009-group-ordering/contracts/
// group-ordering.md). These assert the behaviour already shipped in 008 and are expected to
// pass with no production code change (FR-010); a red here is a genuine regression.
//
// Fixture exercises every weight (3,2,1) in BOTH kinds plus a neutral, so within-section
// 3→2→1 ordering is fully checked (the `mixed` fixture only has weights 3 and 1).
const typeFull = choice([
  note('a3', 'advantage', 3),
  note('a2', 'advantage', 2),
  note('a1', 'advantage', 1),
  note('d1', 'disadvantage', 1),
  note('d2', 'disadvantage', 2),
  note('d3', 'disadvantage', 3),
  note('nu', 'neutral', null),
]);

describe('arrange — group ordering locked (009)', () => {
  it('Type: Adv(3→2→1) → Disadv(3→2→1) → Neutral(creation order) [FR-001/002/003]', () => {
    const out = arrange(typeFull, prefs({ mode: 'grouped', groupKey: 'type' }));
    expect(out.map((s) => s.label)).toEqual(['advantage', 'disadvantage', 'neutral']);
    expect(ids(out[0].notes)).toEqual(['a3', 'a2', 'a1']);
    expect(ids(out[1].notes)).toEqual(['d3', 'd2', 'd1']);
    expect(ids(out[2].notes)).toEqual(['nu']);
  });

  it('Weight: sections 3→2→1→weightless, types mixed in creation order [FR-004/005]', () => {
    const out = arrange(typeFull, prefs({ mode: 'grouped', groupKey: 'weight' }));
    expect(out.map((s) => s.label)).toEqual([3, 2, 1, 'weightless']);
    expect(ids(out[0].notes)).toEqual(['a3', 'd3']); // weight 3, creation order, types mixed
    expect(ids(out[1].notes)).toEqual(['a2', 'd2']); // weight 2
    expect(ids(out[2].notes)).toEqual(['a1', 'd1']); // weight 1
    expect(ids(out[3].notes)).toEqual(['nu']); // weightless (0)
  });

  it('Weight: an absent weight value yields no section [FR-006 weight-side]', () => {
    const noTwo = choice([note('a3', 'advantage', 3), note('d1', 'disadvantage', 1)]);
    const out = arrange(noTwo, prefs({ mode: 'grouped', groupKey: 'weight' }));
    expect(out.map((s) => s.label)).toEqual([3, 1]); // no `2`, no `weightless`
  });

  it('Weight: a choice with no neutral points has no weightless section [FR-006]', () => {
    const noNeutral = choice([note('a3', 'advantage', 3), note('d3', 'disadvantage', 3)]);
    const out = arrange(noNeutral, prefs({ mode: 'grouped', groupKey: 'weight' }));
    expect(out.map((s) => s.label)).toEqual([3]);
  });

  it('deterministic & stable: repeated arrange() gives identical structure [FR-007]', () => {
    for (const groupKey of ['type', 'weight'] as const) {
      const p = prefs({ mode: 'grouped', groupKey });
      const a = arrange(typeFull, p).map((s) => [s.label, ids(s.notes)]);
      const b = arrange(typeFull, p).map((s) => [s.label, ids(s.notes)]);
      expect(a).toEqual(b);
    }
  });

  it('pure & total: input untouched, every note in exactly one section [FR-008]', () => {
    const before = typeFull.notes;
    const beforeIds = ids(before);
    for (const groupKey of ['type', 'weight'] as const) {
      const out = arrange(typeFull, prefs({ mode: 'grouped', groupKey }));
      // input array identity and element order preserved (no mutation)
      expect(typeFull.notes).toBe(before);
      expect(ids(typeFull.notes)).toEqual(beforeIds);
      // union of section notes === input notes, no drops, no duplicates
      const emitted = out.flatMap((s) => ids(s.notes));
      expect(emitted.slice().sort()).toEqual(beforeIds.slice().sort());
      expect(new Set(emitted).size).toBe(emitted.length);
    }
  });
});

// 018 (US1) — orderedChoices: pure display-order helper. Stable sort by choiceScore
// descending; identity when off; never mutates input. See contracts O1–O6.
describe('orderedChoices — rank Choices by total (018)', () => {
  const mk = (id: string, notes: Note[]): Choice => ({ id, title: id, notes });
  const adv = (id: string, w: Weight): Note => note(id, 'advantage', w);
  const dis = (id: string, w: Weight): Note => note(id, 'disadvantage', w);

  const c5 = mk('c5', [adv('a', 3), adv('b', 2)]); // +5
  const c3 = mk('c3', [adv('c', 3)]); // +3
  const c0 = mk('c0', []); // 0
  const cNeg = mk('cNeg', [dis('d', 2)]); // −2
  const idsOf = (cs: Choice[]): string[] => cs.map((c) => c.id);

  it('O1: returns original order when rankByTotal is false', () => {
    const input = [c0, c5, c3];
    expect(idsOf(orderedChoices(input, false))).toEqual(['c0', 'c5', 'c3']);
  });

  it('O2/O4: orders by score descending; negative sinks below zero/positive', () => {
    expect(idsOf(orderedChoices([c0, c5, cNeg, c3], true))).toEqual(['c5', 'c3', 'c0', 'cNeg']);
  });

  it('O3: ties keep original relative order (stable)', () => {
    const c3a = mk('c3a', [adv('x', 3)]);
    const c3b = mk('c3b', [adv('y', 3)]);
    expect(idsOf(orderedChoices([c3a, c3b], true))).toEqual(['c3a', 'c3b']);
    expect(idsOf(orderedChoices([c3b, c3a], true))).toEqual(['c3b', 'c3a']);
  });

  it('O5: pure — does not mutate the input array or its order', () => {
    const input = [c0, c5, c3];
    const snapshot = idsOf(input);
    orderedChoices(input, true);
    expect(idsOf(input)).toEqual(snapshot);
  });

  it('O6: handles empty, single, and all-equal lists', () => {
    expect(orderedChoices([], true)).toEqual([]);
    expect(idsOf(orderedChoices([c3], true))).toEqual(['c3']);
    const e1 = mk('e1', []);
    const e2 = mk('e2', []);
    expect(idsOf(orderedChoices([e1, e2], true))).toEqual(['e1', 'e2']);
  });
});

// 020 (F3) — signed/scoreSign extracted from Summary.svelte so the card footer and the
// summary band share one formatting/classification source (SC-003).
describe('signed / scoreSign — shared score formatting (020)', () => {
  it('signed: + prefix, U+2212 minus, bare zero', () => {
    expect(signed(5)).toBe('+5');
    expect(signed(1)).toBe('+1');
    expect(signed(-3)).toBe('−3'); // U+2212, not the ASCII hyphen
    expect(signed(0)).toBe('0');
  });

  it('scoreSign: positive / negative / neutral classification', () => {
    expect(scoreSign(7)).toBe('positive');
    expect(scoreSign(-1)).toBe('negative');
    expect(scoreSign(0)).toBe('neutral');
  });
});
