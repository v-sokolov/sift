// US1 (008) — Group mode exposes a Type/Weight grouping-dimension control (not Asc/Desc),
// and selecting it re-sections the points. Renders the whole App (house pattern) and drives
// the toolbar via DOM. Sort mode must keep both its controls unchanged.

import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { flushSync } from 'svelte';
import {
  addNote,
  emptyDilemma,
  getState,
  setDilemmaTitle,
  setLastSaved,
  setState,
  toggleGroup,
  toggleSort,
} from '../../src/store.svelte';
import { t } from '../../src/i18n';
import App from '../../src/App.svelte';
import { render, cleanup } from '../svelte';

let container: HTMLElement;

const groupKeyBtn = (key: string) =>
  container.querySelector(`[data-action="set-groupkey"][data-key="${key}"]`) as HTMLButtonElement;
const directionSeg = () => container.querySelector('[data-action="set-direction"]');
const sortKeySeg = () => container.querySelector('[data-action="set-sortkey"]');
const groupLabels = () =>
  Array.from(container.querySelectorAll('.group-label')).map((el) => el.textContent?.trim() ?? '');

function seedNotes() {
  const cid = getState().dilemma.choices[0].id;
  addNote(cid, { text: 'pay', type: 'advantage', weight: 3 });
  addNote(cid, { text: 'risk', type: 'disadvantage', weight: 3 });
  addNote(cid, { text: 'meh', type: 'neutral', weight: null });
  flushSync();
}

beforeEach(() => {
  setState(emptyDilemma());
  ({ container } = render(App));
  flushSync();
});
afterEach(cleanup);

describe('US1 — Group toolbar shows the grouping dimension, not direction (FR-005)', () => {
  it('grouped mode offers a Type/Weight segment and no Asc/Desc segment', () => {
    toggleGroup();
    flushSync();
    expect(groupKeyBtn('type')).not.toBeNull();
    expect(groupKeyBtn('weight')).not.toBeNull();
    expect(directionSeg()).toBeNull();
  });

  it('the grouping-dimension buttons are localized and indicate the active one (FR-006)', () => {
    toggleGroup();
    flushSync();
    const lang = getState().view.lang;
    expect(groupKeyBtn('type').textContent?.trim()).toBe(t(lang, 'toolbar.type'));
    expect(groupKeyBtn('weight').textContent?.trim()).toBe(t(lang, 'toolbar.weight'));
    // default groupKey is 'type'
    expect(groupKeyBtn('type').getAttribute('aria-pressed')).toBe('true');
    expect(groupKeyBtn('weight').getAttribute('aria-pressed')).toBe('false');
  });

  it('selecting Weight re-sections from type headings to weight headings', () => {
    seedNotes();
    toggleGroup();
    flushSync();
    const lang = getState().view.lang;
    // By Type: a section labelled "Advantages" exists.
    expect(groupLabels()).toContain(t(lang, 'group.advantage'));

    groupKeyBtn('weight').click();
    flushSync();
    // By Weight: the type heading is gone; at least one heading carries a weight number.
    expect(groupLabels()).not.toContain(t(lang, 'group.advantage'));
    expect(groupLabels().some((l) => /\d/.test(l))).toBe(true);
    expect(getState().view.groupKey).toBe('weight');
  });
});

describe('save-status indicator (010)', () => {
  const statusEl = () => container.querySelector('.saved') as HTMLElement;
  const dot = () => container.querySelector('.saved .status-dot');

  it('is hidden by default — no dot, no label text (FR-008)', () => {
    expect(dot()).toBeNull();
    expect(statusEl().textContent?.trim()).toBe('');
  });

  it('shows "Editing" + an editing-modifier dot after a content edit (FR-003)', () => {
    setDilemmaTitle('q');
    flushSync();
    const lang = getState().view.lang;
    expect(statusEl().textContent).toContain(t(lang, 'toolbar.editing'));
    expect(dot()).not.toBeNull();
    expect(dot()!.classList.contains('status-dot--editing')).toBe(true);
  });

  it('shows "Saved" + a saved-modifier dot once the save completes (FR-004)', () => {
    setDilemmaTitle('q');
    setLastSaved(123);
    flushSync();
    const lang = getState().view.lang;
    expect(statusEl().textContent).toContain(t(lang, 'toolbar.saved'));
    expect(dot()!.classList.contains('status-dot--saved')).toBe(true);
  });
});

describe('US1 — Sort mode is unchanged (FR-012)', () => {
  it('sorted mode keeps both the sort-key and the Asc/Desc direction segments', () => {
    toggleSort();
    flushSync();
    expect(sortKeySeg()).not.toBeNull();
    expect(directionSeg()).not.toBeNull();
    // and it does not show the grouping-dimension control
    expect(groupKeyBtn('type')).toBeNull();
  });
});
