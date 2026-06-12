// 009 — renderer side of the group-ordering contract. FR-006 ("empty sections MUST NOT be
// rendered") is enforced for the Type dimension by ChoiceCard's render guard
// (`{#if !(section.label && section.notes.length === 0)}`), because pure arrange() returns an
// empty `neutral` type section. Confirm that empty section is not displayed. See
// specs/009-group-ordering/research.md R2 and contracts/group-ordering.md assertion 6.

import { beforeEach, describe, it, expect } from 'vitest';
import { flushSync } from 'svelte';
import {
  emptyDilemma,
  getState,
  openAddForm,
  setFormText,
  setFormType,
  setFormWeight,
  setState,
  submitForm,
  toggleGroup,
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

describe('ChoiceCard — grouped Type mode hides empty sections (009, FR-006)', () => {
  it('a choice with no neutral points renders no Neutral section', () => {
    const id = getState().dilemma.choices[0].id;
    addNoteVia(id, 'advantage', 3, 'plenty of upside');
    addNoteVia(id, 'disadvantage', 1, 'minor downside');
    toggleGroup(); // default groupKey is 'type'
    flushSync();

    // Group-by-type yields Adv/Disadv/Neutral, but the empty Neutral section is skipped:
    // exactly two headings render for this choice (Advantages, Disadvantages).
    const card = container.querySelector('.choice')!;
    const labels = card.querySelectorAll('.group-label');
    expect(labels).toHaveLength(2);
    const texts = Array.from(labels, (el) => el.textContent);
    expect(texts).toEqual(['Advantages', 'Disadvantages']);
  });

  it('adding a neutral point makes the Neutral section appear (guard is content-driven)', () => {
    const id = getState().dilemma.choices[0].id;
    addNoteVia(id, 'advantage', 3, 'plenty of upside');
    addNoteVia(id, 'neutral', null, 'just noting');
    toggleGroup();
    flushSync();

    const card = container.querySelector('.choice')!;
    const labels = card.querySelectorAll('.group-label');
    // Advantages + Neutral render; the empty Disadvantages section is skipped.
    const texts = Array.from(labels, (el) => el.textContent);
    expect(texts).toEqual(['Advantages', 'Neutral']);
  });
});
