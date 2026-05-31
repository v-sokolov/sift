import { beforeEach, describe, it, expect } from 'vitest';
import { flushSync } from 'svelte';
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
} from '../../src/store.svelte';
import App from '../../src/App.svelte';
import { render } from '../svelte';
import type { NoteType, Weight } from '../../src/types';

let container: HTMLElement;

function addNoteVia(choiceId: string, type: NoteType, weight: Weight | null, text: string): void {
  openAddForm(choiceId);
  setFormType(type);
  if (weight) setFormWeight(weight);
  setFormText(text);
  submitForm();
}

beforeEach(() => {
  setState(emptyDilemma());
  ({ container } = render(App));
  flushSync();
});

describe('US1 — weigh a decision and see a quiet score', () => {
  it('adds a choice and shows the live count 3 / 4', () => {
    addChoice();
    flushSync();
    expect(container.querySelectorAll('.choice')).toHaveLength(3);
    // The live count is shown inside the Add-choice control.
    expect(container.querySelector('[data-action="add-choice"]')!.textContent).toContain('3 / 4');
  });

  it('computes score +2 with for 3 / against 1', () => {
    const id = getState().dilemma.choices[0].id;
    addNoteVia(id, 'advantage', 3, 'great pay');
    addNoteVia(id, 'disadvantage', 1, 'long commute');
    flushSync();
    const cell = container.querySelectorAll('.summary .sum')[0];
    expect(cell.querySelector('.sum__score')!.textContent).toBe('+2');
    expect(cell.querySelector('.sum__totals')!.textContent).toContain('for 3');
    expect(cell.querySelector('.sum__totals')!.textContent).toContain('against 1');
  });

  it('neutral notes do not change the score', () => {
    const id = getState().dilemma.choices[0].id;
    addNoteVia(id, 'advantage', 2, 'a');
    addNoteVia(id, 'neutral', null, 'just noting');
    flushSync();
    const cell = container.querySelectorAll('.summary .sum')[0];
    expect(cell.querySelector('.sum__score')!.textContent).toBe('+2');
    expect(cell.querySelector('.sum__totals')!.textContent).toContain('against 0');
  });

  it('highlights the single leading choice', () => {
    const [a, b] = getState().dilemma.choices;
    addNoteVia(a.id, 'advantage', 3, 'strong');
    addNoteVia(b.id, 'advantage', 1, 'weak');
    flushSync();
    const cells = container.querySelectorAll('.summary .sum');
    expect(cells[0].classList.contains('sum--leader')).toBe(true);
    expect(cells[1].classList.contains('sum--leader')).toBe(false);
  });

  it('weight is rendered as dot count alongside color (FR-031)', () => {
    const id = getState().dilemma.choices[0].id;
    addNoteVia(id, 'advantage', 3, 'x');
    flushSync();
    const dots = container.querySelector('.note .dots')!;
    expect(dots.textContent).toBe('●●●');
  });

  it('renders a decorative favicon beside the Sift wordmark (010, FR-015)', () => {
    const brand = container.querySelector('.header__brand')!;
    const logo = brand.querySelector('img');
    expect(logo).not.toBeNull();
    expect(logo!.getAttribute('alt')).toBe('');
    expect(logo!.getAttribute('aria-hidden')).toBe('true');
  });

  it('places exactly one "Suggest a feature" button, in the brand row (010, FR-016)', () => {
    expect(container.querySelectorAll('[data-action="open-suggest"]')).toHaveLength(1);
    expect(
      container.querySelector('.header__brand [data-action="open-suggest"]'),
    ).not.toBeNull();
  });

  it('typing in the title never loses focus while the score updates (FR-002/SC-002)', () => {
    const title = container.querySelector('.header__title') as HTMLInputElement;
    title.focus();
    expect(document.activeElement).toBe(title);
    // Simulate continuous typing: each keystroke drives a store update + re-render.
    for (const value of ['W', 'Wh', 'Whe', 'Wher', 'Where']) {
      title.value = value;
      title.dispatchEvent(new Event('input', { bubbles: true }));
      flushSync();
      // Same node, still focused — Svelte patches the value in place (no remount).
      const after = container.querySelector('.header__title') as HTMLInputElement;
      expect(after).toBe(title);
      expect(document.activeElement).toBe(title);
    }
    expect(getState().dilemma.title).toBe('Where');
  });
});
