import { afterEach, beforeEach, describe, it, expect } from 'vitest';
import {
  addChoice,
  emptyDilemma,
  getState,
  openAddForm,
  setFormText,
  setFormType,
  setFormWeight,
  setState,
  submitForm,
  subscribe,
} from '../../src/state';
import { renderApp } from '../../src/render';
import type { NoteType, Weight } from '../../src/types';

let root: HTMLElement;
let unsub: () => void;

function addNoteVia(choiceId: string, type: NoteType, weight: Weight | null, text: string): void {
  openAddForm(choiceId);
  setFormType(type);
  if (weight) setFormWeight(weight);
  setFormText(text);
  submitForm();
}

beforeEach(() => {
  document.body.innerHTML = '<div id="app"></div>';
  root = document.getElementById('app')!;
  setState(emptyDilemma());
  unsub = subscribe((s) => renderApp(root, s));
  renderApp(root, getState());
});

afterEach(() => unsub());

describe('US1 — weigh a decision and see a quiet score', () => {
  it('adds a choice and shows the live count 3 / 4', () => {
    addChoice();
    expect(root.querySelectorAll('.choice')).toHaveLength(3);
    expect(root.querySelector('.count')!.textContent).toContain('3 / 4');
  });

  it('computes score +2 with for 3 / against 1', () => {
    const id = getState().dilemma.choices[0].id;
    addNoteVia(id, 'advantage', 3, 'great pay');
    addNoteVia(id, 'disadvantage', 1, 'long commute');
    const cell = root.querySelectorAll('.summary .sum')[0];
    expect(cell.querySelector('.sum__score')!.textContent).toBe('+2');
    expect(cell.querySelector('.sum__totals')!.textContent).toContain('for 3');
    expect(cell.querySelector('.sum__totals')!.textContent).toContain('against 1');
  });

  it('neutral notes do not change the score', () => {
    const id = getState().dilemma.choices[0].id;
    addNoteVia(id, 'advantage', 2, 'a');
    addNoteVia(id, 'neutral', null, 'just noting');
    const cell = root.querySelectorAll('.summary .sum')[0];
    expect(cell.querySelector('.sum__score')!.textContent).toBe('+2');
    expect(cell.querySelector('.sum__totals')!.textContent).toContain('against 0');
  });

  it('highlights the single leading choice', () => {
    const [a, b] = getState().dilemma.choices;
    addNoteVia(a.id, 'advantage', 3, 'strong');
    addNoteVia(b.id, 'advantage', 1, 'weak');
    const cells = root.querySelectorAll('.summary .sum');
    expect(cells[0].classList.contains('sum--leader')).toBe(true);
    expect(cells[1].classList.contains('sum--leader')).toBe(false);
  });

  it('weight is rendered as dot count alongside color (FR-031)', () => {
    const id = getState().dilemma.choices[0].id;
    addNoteVia(id, 'advantage', 3, 'x');
    const dots = root.querySelector('.note .dots')!;
    expect(dots.textContent).toBe('●●●');
  });
});
