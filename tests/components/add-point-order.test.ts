// US2 (008) — the Add-point control sits above the score summary. Renders the whole App
// and asserts DOM order; adding a point still updates the score.
// 020 (FR-011 superseded): the summary band is hidden in App (SHOW_SUMMARY=false), so
// the 008 DOM-order laws are gated on the flag — they resume automatically if the band
// is reinstated. The score-update law migrates to a direct <Summary /> mount.

import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { flushSync } from 'svelte';
import { addNote, emptyDilemma, getState, openAddForm, setState } from '../../src/store.svelte';
import { SHOW_SUMMARY } from '../../src/config';
import App from '../../src/App.svelte';
import Summary from '../../src/components/Summary.svelte';
import { render, cleanup } from '../svelte';

let container: HTMLElement;
let sumC: HTMLElement;

const addTrigger = () => container.querySelector('[data-action="open-add-form"]') as HTMLElement;
const formEl = () => container.querySelector('[data-action="form"]') as HTMLElement;
const summaryEl = () => container.querySelector('.summary') as HTMLElement;

/** True when `a` precedes `b` in document order. */
function precedes(a: Node, b: Node): boolean {
  return Boolean(a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING);
}

beforeEach(() => {
  setState(emptyDilemma());
  ({ container } = render(App));
  ({ container: sumC } = render(Summary));
  flushSync();
});
afterEach(cleanup);

describe('US2 — Add point above the score (FR-013)', () => {
  it.skipIf(!SHOW_SUMMARY)('the Add-point trigger precedes the score summary in DOM order', () => {
    expect(addTrigger()).not.toBeNull();
    expect(summaryEl()).not.toBeNull();
    expect(precedes(addTrigger(), summaryEl())).toBe(true);
  });

  it.skipIf(!SHOW_SUMMARY)('the open add/edit form also precedes the summary', () => {
    const cid = getState().dilemma.choices[0].id;
    openAddForm(cid);
    flushSync();
    expect(formEl()).not.toBeNull();
    expect(precedes(formEl(), summaryEl())).toBe(true);
  });

  it('adding a point still updates the score (FR-014; band mounted directly since 020)', () => {
    const cid = getState().dilemma.choices[0].id;
    const before = (sumC.querySelector('.sum__score') as HTMLElement).textContent;
    addNote(cid, { text: 'pay', type: 'advantage', weight: 3 });
    flushSync();
    const after = (sumC.querySelector('.sum__score') as HTMLElement).textContent;
    expect(before).toBe('0');
    expect(after).toBe('+3');
  });
});
