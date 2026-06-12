// 018 — Rank ordering reflected in the rendered board (US1) and sign-based score colour
// (US2). Drives the whole App and reads the DOM (jsdom): real contrast/animation are manual.
// 020 (FR-011 superseded): the summary band no longer renders inside App, so the .sum
// assertions mount the retained <Summary /> component directly — the 018 contracts keep
// guarding the hidden-but-kept code.

import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { flushSync } from 'svelte';
import {
  addChoice,
  addNote,
  emptyDilemma,
  getState,
  setState,
  toggleRank,
} from '../../src/store.svelte';
import App from '../../src/App.svelte';
import Summary from '../../src/components/Summary.svelte';
import { render, cleanup } from '../svelte';

let container: HTMLElement;
let sumC: HTMLElement;

const cardOrder = () =>
  Array.from(container.querySelectorAll('.choices .choice')).map(
    (el) => el.getAttribute('data-choice-id') ?? '',
  );
const scoreEl = () => sumC.querySelectorAll('.summary .sum__score');

/** Seed three choices with distinct totals; returns their ids [a, b, c]. */
function seedThree(): [string, string, string] {
  setState(emptyDilemma());
  addChoice(); // now 3 choices
  const [a, b, c] = getState().dilemma.choices.map((ch) => ch.id);
  addNote(a, { text: 'x', type: 'advantage', weight: 1 }); // +1
  addNote(b, { text: 'y', type: 'advantage', weight: 3 });
  addNote(b, { text: 'z', type: 'advantage', weight: 2 }); // +5
  addNote(c, { text: 'w', type: 'disadvantage', weight: 2 }); // −2
  return [a, b, c];
}

beforeEach(() => {
  setState(emptyDilemma());
  ({ container } = render(App));
  ({ container: sumC } = render(Summary));
  flushSync();
});
afterEach(cleanup);

describe('US1 — Rank order reflected in the DOM', () => {
  it('O2: with Rank on, cards are ordered highest-total-first', () => {
    const [a, b, c] = seedThree();
    flushSync();
    // before ranking: authoring order a, b, c
    expect(cardOrder()).toEqual([a, b, c]);
    toggleRank();
    flushSync();
    expect(cardOrder()).toEqual([b, a, c]); // +5, +1, −2
  });

  it('O1: turning Rank off restores authoring order', () => {
    const [a, b, c] = seedThree();
    toggleRank();
    flushSync();
    toggleRank();
    flushSync();
    expect(cardOrder()).toEqual([a, b, c]);
  });

  it('FR-004: editing a total re-orders the board while Rank is on', () => {
    const [a, b, c] = seedThree();
    toggleRank();
    flushSync();
    expect(cardOrder()).toEqual([b, a, c]);
    // Boost a above b: add +6 (two advantage-3 points) → a = +7
    addNote(a, { text: 'p', type: 'advantage', weight: 3 });
    addNote(a, { text: 'q', type: 'advantage', weight: 3 });
    flushSync();
    expect(cardOrder()).toEqual([a, b, c]);
  });
});

describe('US2 — score colour by sign', () => {
  function seedSigns(): void {
    setState(emptyDilemma());
    addChoice(); // 3 choices: positive, negative, neutral
    const [a, b] = getState().dilemma.choices.map((ch) => ch.id);
    addNote(a, { text: 'x', type: 'advantage', weight: 3 }); // +3
    addNote(b, { text: 'y', type: 'disadvantage', weight: 3 }); // −3
    // third choice left empty → 0
  }

  it('C1–C3: each score carries the class matching its sign', () => {
    seedSigns();
    flushSync();
    expect(sumC.querySelector('.sum__score--positive')).not.toBeNull();
    expect(sumC.querySelector('.sum__score--negative')).not.toBeNull();
    expect(sumC.querySelector('.sum__score--neutral')).not.toBeNull();
  });

  it('C4: the +/−/0 text is still rendered regardless of colour', () => {
    seedSigns();
    flushSync();
    const texts = Array.from(scoreEl()).map((el) => el.textContent?.trim() ?? '');
    expect(texts).toContain('+3');
    expect(texts).toContain('−3'); // U+2212 minus, per signed()
    expect(texts).toContain('0');
  });

  it('FR-014: colour classes apply with Rank off as well', () => {
    seedSigns();
    flushSync();
    expect(getState().view.rankByTotal).toBe(false);
    expect(sumC.querySelector('.sum__score--positive')).not.toBeNull();
    expect(sumC.querySelector('.sum__score--negative')).not.toBeNull();
  });
});
