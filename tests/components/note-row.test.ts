// US1 (007) — the always-visible per-point remove control. Renders the whole App (the
// house pattern; see flow.test.ts) and drives the ✕ button on a point row.

import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { flushSync } from 'svelte';
import { addNote, emptyDilemma, getState, openEditForm, setState } from '../../src/store.svelte';
import { t } from '../../src/i18n';
import App from '../../src/App.svelte';
// 020 (FR-011 superseded): the summary band is hidden in App; the score assertion
// mounts the retained <Summary /> directly.
import Summary from '../../src/components/Summary.svelte';
import { render, cleanup } from '../svelte';

let container: HTMLElement;

/** The ✕ remove button for a given note id. */
function removeBtn(noteId: string): HTMLButtonElement {
  return container.querySelector(`.note__remove[data-note-id="${noteId}"]`) as HTMLButtonElement;
}

beforeEach(() => {
  setState(emptyDilemma());
  ({ container } = render(App));
  flushSync();
});
afterEach(cleanup);

describe('US1 — remove a point via the always-visible ✕', () => {
  it('exposes a localized remove label on every point row (FR-009)', () => {
    const cid = getState().dilemma.choices[0].id;
    addNote(cid, { text: 'a', type: 'advantage', weight: 1 });
    flushSync();
    const nid = getState().dilemma.choices[0].notes[0].id;
    const btn = removeBtn(nid);
    expect(btn).not.toBeNull();
    expect(btn.getAttribute('aria-label')).toBe(t(getState().view.lang, 'note.removeAria'));
  });

  it('removes only that point on click, leaving others in order (FR-003)', () => {
    const cid = getState().dilemma.choices[0].id;
    addNote(cid, { text: 'a', type: 'advantage', weight: 1 });
    addNote(cid, { text: 'b', type: 'advantage', weight: 1 });
    addNote(cid, { text: 'c', type: 'advantage', weight: 1 });
    flushSync();
    const [n1, n2, n3] = getState().dilemma.choices[0].notes;
    removeBtn(n2.id).click();
    flushSync();
    expect(getState().dilemma.choices[0].notes.map((n) => n.id)).toEqual([n1.id, n3.id]);
  });

  it('removes the point via keyboard Enter and Space, identical to click (FR-008)', () => {
    const cid = getState().dilemma.choices[0].id;
    for (const key of ['Enter', ' ']) {
      addNote(cid, { text: 'k', type: 'advantage', weight: 1 });
      flushSync();
      const nid = getState().dilemma.choices[0].notes[0].id;
      removeBtn(nid).dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }));
      flushSync();
      expect(getState().dilemma.choices[0].notes).toHaveLength(0);
    }
  });

  it('activating the ✕ does NOT open the edit form (FR-010)', () => {
    const cid = getState().dilemma.choices[0].id;
    addNote(cid, { text: 'a', type: 'advantage', weight: 1 });
    flushSync();
    const nid = getState().dilemma.choices[0].notes[0].id;
    removeBtn(nid).click();
    flushSync();
    expect(getState().editing).toBeNull();
  });

  it('updates the derived score after removing a weighted advantage (FR-005/SC-004)', () => {
    const { container: sumC } = render(Summary);
    const cid = getState().dilemma.choices[0].id;
    addNote(cid, { text: 'pro', type: 'advantage', weight: 3 });
    addNote(cid, { text: 'con', type: 'disadvantage', weight: 1 });
    flushSync();
    const cell = sumC.querySelectorAll('.summary .sum')[0];
    expect(cell.querySelector('.sum__score')!.textContent).toBe('+2');
    const proId = getState().dilemma.choices[0].notes.find((n) => n.type === 'advantage')!.id;
    removeBtn(proId).click();
    flushSync();
    // Negative scores render with a Unicode minus (U+2212), per signed().
    expect(cell.querySelector('.sum__score')!.textContent).toBe('−1');
  });

  it('the open edit form closes if its point is removed (FR-011)', () => {
    const cid = getState().dilemma.choices[0].id;
    addNote(cid, { text: 'a', type: 'advantage', weight: 1 });
    flushSync();
    const nid = getState().dilemma.choices[0].notes[0].id;
    openEditForm(cid, nid);
    flushSync();
    removeBtn(nid).click();
    flushSync();
    expect(getState().editing).toBeNull();
  });
});
