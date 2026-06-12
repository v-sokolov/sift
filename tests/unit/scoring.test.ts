import { describe, it, expect } from 'vitest';
import type { Choice, Note, NoteType, Weight } from '../../src/types';
import { againstTotal, choiceScore, forTotal, leaders } from '../../src/scoring';

let n = 0;
function note(type: NoteType, weight: Weight | null): Note {
  return { id: `n${n++}`, text: 't', type, weight };
}
function choice(id: string, notes: Note[]): Choice {
  return { id, title: id, notes };
}

describe('scoring totals', () => {
  it('forTotal sums advantage weights only', () => {
    const c = choice('a', [note('advantage', 3), note('advantage', 2), note('disadvantage', 3)]);
    expect(forTotal(c)).toBe(5);
  });

  it('againstTotal sums disadvantage weights only', () => {
    const c = choice('a', [note('disadvantage', 3), note('disadvantage', 2), note('advantage', 1)]);
    expect(againstTotal(c)).toBe(5);
  });

  it('neutral notes never count (S1)', () => {
    const c = choice('a', [note('advantage', 2), note('neutral', null), note('neutral', null)]);
    expect(forTotal(c)).toBe(2);
    expect(againstTotal(c)).toBe(0);
    expect(choiceScore(c)).toBe(2);
  });

  it('worked examples from the design doc', () => {
    const acme = choice('acme', [note('advantage', 3), note('advantage', 2), note('disadvantage', 3)]);
    const globex = choice('globex', [
      note('advantage', 3),
      note('advantage', 2),
      note('advantage', 1),
      note('disadvantage', 2),
    ]);
    const initech = choice('initech', [
      note('advantage', 2),
      note('disadvantage', 3),
      note('disadvantage', 2),
    ]);
    expect(choiceScore(acme)).toBe(2);
    expect(choiceScore(globex)).toBe(4);
    expect(choiceScore(initech)).toBe(-3);
    expect(leaders([acme, globex, initech])).toEqual(new Set(['globex']));
  });
});

// 015 (FR-003/SC-004): regression locks for 6-choice boards. The scoring functions are
// count-agnostic pure functions, so these may pass on first run — they exist to lock the
// guarantee at the new 2..6 range, not as red-first TDD gates.
describe('six-choice boards (015)', () => {
  const six = [
    choice('c1', [note('advantage', 1)]), // +1
    choice('c2', [note('disadvantage', 2)]), // -2
    choice('c3', [note('neutral', null)]), // 0
    choice('c4', [note('advantage', 3), note('disadvantage', 1)]), // +2
    choice('c5', [note('advantage', 2), note('advantage', 3)]), // +5
    choice('c6', [note('advantage', 3), note('advantage', 2), note('neutral', null)]), // +5
  ];

  it('scores compute independently for all six choices', () => {
    expect(six.map(choiceScore)).toEqual([1, -2, 0, 2, 5, 5]);
  });

  it('leaders scans the full six-choice board, including ties on the 5th/6th', () => {
    expect(leaders(six)).toEqual(new Set(['c5', 'c6']));
  });

  it('totals on a 6th choice behave exactly as on a 1st (position-agnostic)', () => {
    const sixth = six[5];
    expect(forTotal(sixth)).toBe(5);
    expect(againstTotal(sixth)).toBe(0);
    expect(leaders([sixth])).toEqual(new Set(['c6']));
  });
});

describe('leaders', () => {
  it('returns all tied leaders, no tiebreaker (S4)', () => {
    const a = choice('a', [note('advantage', 3)]);
    const b = choice('b', [note('advantage', 2), note('advantage', 1)]);
    expect(leaders([a, b])).toEqual(new Set(['a', 'b']));
  });

  it('returns empty set when every score is 0 (S5)', () => {
    const a = choice('a', [note('neutral', null)]);
    const b = choice('b', []);
    expect(leaders([a, b]).size).toBe(0);
  });

  it('highlights the highest even when scores are negative', () => {
    const a = choice('a', [note('disadvantage', 1)]); // -1
    const b = choice('b', [note('disadvantage', 3)]); // -3
    expect(leaders([a, b])).toEqual(new Set(['a']));
  });
});
