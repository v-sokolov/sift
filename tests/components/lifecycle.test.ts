import { beforeEach, describe, it, expect } from 'vitest';
import { flushSync } from 'svelte';
import {
  addChoice,
  clearDilemma,
  emptyDilemma,
  getState,
  removeChoice,
  setState,
} from '../../src/store.svelte';
import App from '../../src/App.svelte';
import { render } from '../svelte';
import { flushSave, load } from '../../src/persistence';
import { MAX_CHOICES, MIN_CHOICES } from '../../src/types';

let container: HTMLElement;

beforeEach(() => {
  localStorage.clear();
  setState(emptyDilemma());
  ({ container } = render(App));
  flushSync();
});

describe('US2 — persistence & lifecycle', () => {
  it('restores a saved dilemma on boot', () => {
    const s = emptyDilemma();
    s.dilemma.title = 'Where to live?';
    s.dilemma.choices[0].title = 'City';
    flushSave(s);

    const restored = load();
    expect(restored).not.toBeNull();
    setState({ ...emptyDilemma(), dilemma: restored!.dilemma, view: restored!.view });
    flushSync();

    expect((container.querySelector('.header__title') as HTMLInputElement).value).toBe(
      'Where to live?',
    );
    expect((container.querySelector('.choice__title') as HTMLInputElement).value).toBe('City');
  });

  it('Clear erases all data back to the empty default state (FR-027)', () => {
    const s = emptyDilemma();
    s.dilemma.title = 'X';
    s.dilemma.choices[0].notes.push({ id: 'n', text: 't', type: 'advantage', weight: 3 });
    s.view.theme = 'dark';
    s.view.mode = 'sorted';
    setState(s);

    clearDilemma();
    const d = getState();
    expect(d.dilemma.title).toBe('');
    expect(d.dilemma.choices).toHaveLength(MIN_CHOICES);
    expect(d.dilemma.choices.every((c) => c.notes.length === 0)).toBe(true);
    expect(d.view.theme).toBe('system');
    expect(d.view.mode).toBe('default');
  });

  it('cannot remove below the minimum of 2 choices (I8)', () => {
    const id = getState().dilemma.choices[0].id;
    removeChoice(id);
    expect(getState().dilemma.choices).toHaveLength(MIN_CHOICES);
  });

  it('cannot add beyond the maximum of 4 choices (I9)', () => {
    addChoice();
    addChoice();
    addChoice(); // would be the 5th
    expect(getState().dilemma.choices).toHaveLength(MAX_CHOICES);
  });
});
