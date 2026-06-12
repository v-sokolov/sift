// US1 (008) — Group mode exposes a Type/Weight grouping-dimension control (not Asc/Desc),
// and selecting it re-sections the points. Renders the whole App (house pattern) and drives
// the toolbar via DOM. Sort mode must keep both its controls unchanged.

import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { flushSync } from 'svelte';
import {
  addChoice,
  addNote,
  clearDilemma,
  emptyDilemma,
  getState,
  removeChoice,
  setDilemmaTitle,
  setLang,
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

  // 022 supersedes 010 FR-008: instead of rendering nothing, the no-pending-edit
  // state shows a neutral "Idle" dot + label (EN 'Idle' / UA 'Очікування').
  it('shows "Idle" + a neutral idle-modifier dot by default (022, supersedes FR-008)', () => {
    const lang = getState().view.lang;
    expect(dot()).not.toBeNull();
    expect(dot()!.classList.contains('status-dot--idle')).toBe(true);
    expect(statusEl().textContent).toContain(t(lang, 'toolbar.idle'));
  });

  it('Idle label is localized (EN/UA)', () => {
    expect(t('en', 'toolbar.idle')).toBe('Idle');
    expect(t('uk', 'toolbar.idle')).toBe('Очікування');
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

describe('015 US1 — six-choice cap in the toolbar (FR-002/FR-009, contract B1/B4)', () => {
  const addBtn = () => container.querySelector('[data-action="add-choice"]') as HTMLButtonElement;
  // 020 rev. 2: untitled Choices render their ghost placeholder as read-only header
  // text (.choice__name--ghost) instead of an input placeholder; same 015 law.
  const placeholders = () =>
    Array.from(container.querySelectorAll('.choice .choice__name--ghost')).map(
      (el) => el.textContent ?? '',
    );

  it('stays enabled at 5 ("5 / 6") and disables only at 6 ("6 / 6")', () => {
    addChoice();
    addChoice();
    addChoice(); // 5
    flushSync();
    expect(addBtn().disabled).toBe(false);
    expect(addBtn().textContent).toContain('5 / 6');
    addChoice(); // 6
    flushSync();
    expect(addBtn().disabled).toBe(true);
    expect(addBtn().textContent).toContain('6 / 6');
  });

  it('the disabled title reads "Maximum 6 choices" (parameterized, EN) and localizes to UA', () => {
    for (let i = 0; i < 4; i += 1) addChoice();
    flushSync();
    expect(addBtn().title).toBe('Maximum 6 choices');
    setLang('uk');
    flushSync();
    expect(addBtn().title).toBe(t('uk', 'toolbar.maxChoices', { n: '6' }));
    expect(addBtn().title).toContain('6');
  });

  it('ghost placeholders extend to "Choice 5"/"Choice 6" and localize (FR-009)', () => {
    for (let i = 0; i < 4; i += 1) addChoice();
    flushSync();
    expect(placeholders().slice(4)).toEqual(['Choice 5', 'Choice 6']);
    setLang('uk');
    flushSync();
    expect(placeholders().slice(4)).toEqual(['Варіант 5', 'Варіант 6']);
  });
});

describe('015 US3 — complexity hint at 4–6 choices (FR-012, SC-005, contract B5)', () => {
  const hint = () => container.querySelector('[data-hint="many-choices"]');
  const addBtn = () => container.querySelector('[data-action="add-choice"]') as HTMLButtonElement;

  it('is absent at 2 and 3 choices', () => {
    expect(hint()).toBeNull();
    addChoice(); // 3
    flushSync();
    expect(hint()).toBeNull();
  });

  it('appears at 4, persists through 5 and 6, as always-visible localized text', () => {
    addChoice();
    addChoice(); // 4
    flushSync();
    expect(hint()).not.toBeNull();
    expect(hint()!.textContent).toBe(t('en', 'toolbar.manyChoices'));
    addChoice(); // 5
    addChoice(); // 6
    flushSync();
    expect(hint()).not.toBeNull();
    setLang('uk');
    flushSync();
    expect(hint()!.textContent).toBe(t('uk', 'toolbar.manyChoices'));
  });

  it('is informational only — adding proceeds normally while it shows', () => {
    addChoice();
    addChoice(); // 4, hint visible
    flushSync();
    expect(hint()).not.toBeNull();
    expect(addBtn().disabled).toBe(false);
    addBtn().click(); // 5th via the UI
    flushSync();
    expect(getState().dilemma.choices).toHaveLength(5);
  });

  it('disappears after removing down to 3 and after Clear', () => {
    addChoice();
    addChoice(); // 4
    flushSync();
    expect(hint()).not.toBeNull();
    removeChoice(getState().dilemma.choices[3].id); // 3
    flushSync();
    expect(hint()).toBeNull();
    addChoice(); // 4 again
    flushSync();
    expect(hint()).not.toBeNull();
    clearDilemma(); // default board (2 choices)
    flushSync();
    expect(hint()).toBeNull();
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

// 018 (US1) — the Rank control: a toggle button styled like Group/Sort, left of a divider
// behind a "Choices" scope label, with Group/Sort under a "Points" label. Pressing it sets
// view.rankByTotal (aria-pressed reflects it).
describe('US1 — Rank toggle (018)', () => {
  const rankBtn = () =>
    container.querySelector('[data-action="toggle-rank"]') as HTMLButtonElement;

  it('S2: renders a toggle button reflecting rankByTotal via aria-pressed', () => {
    const btn = rankBtn();
    expect(btn).not.toBeNull();
    expect(btn.classList.contains('toggle')).toBe(true);
    expect(btn.getAttribute('aria-pressed')).toBe('false');
  });

  it('S2: pressing it sets view.rankByTotal and reflects back', () => {
    rankBtn().click();
    flushSync();
    expect(getState().view.rankByTotal).toBe(true);
    expect(rankBtn().getAttribute('aria-pressed')).toBe('true');
  });

  it('S1/S3: shows localized Rank + Choices/Points scope labels', () => {
    const lang = getState().view.lang;
    const text = container.querySelector('.toolbar')?.textContent ?? '';
    expect(text).toContain(t(lang, 'toolbar.rank'));
    expect(text).toContain(t(lang, 'toolbar.scopeChoices'));
    expect(text).toContain(t(lang, 'toolbar.scopePoints'));
  });

  it('S3: localizes in UA too', () => {
    setLang('uk');
    flushSync();
    const text = container.querySelector('.toolbar')?.textContent ?? '';
    expect(text).toContain(t('uk', 'toolbar.rank'));
    expect(text).toContain(t('uk', 'toolbar.scopeChoices'));
  });
});

describe('022 US5 — CTA colour roles: Add-choice (R1)', () => {
  it('R1: Add-choice button has btn--primary class', () => {
    const btn = container.querySelector('[data-action="add-choice"]') as HTMLButtonElement;
    expect(btn).not.toBeNull();
    expect(btn.classList.contains('btn--primary')).toBe(true);
  });
});

describe('022 US5 — CTA colour roles: Add-point submit (R2)', () => {
  it('R2: Add-point form submit has btn--primary', () => {
    // Open the form, check the submit button
    const openBtn = container.querySelector('[data-action="open-add-form"]') as HTMLButtonElement;
    openBtn.click();
    flushSync();
    const submit = container.querySelector('[data-action="form-submit"]') as HTMLButtonElement;
    expect(submit).not.toBeNull();
    expect(submit.classList.contains('btn--primary')).toBe(true);
  });
});

describe('022 US1 — Group/Sort multi-select seg (T2–T3)', () => {
  it('T2: Group and Sort buttons are inside a .seg--multi element', () => {
    const seg = container.querySelector('.seg--multi') as HTMLElement | null;
    expect(seg).not.toBeNull();
    expect(seg!.querySelector('[data-action="toggle-group"]')).not.toBeNull();
    expect(seg!.querySelector('[data-action="toggle-sort"]')).not.toBeNull();
  });

  it('T3: Group and Sort have independent aria-pressed — toggling one does not affect the other', () => {
    const groupBtn = container.querySelector('[data-action="toggle-group"]') as HTMLButtonElement;
    const sortBtn = container.querySelector('[data-action="toggle-sort"]') as HTMLButtonElement;
    expect(groupBtn.getAttribute('aria-pressed')).toBe('false');
    expect(sortBtn.getAttribute('aria-pressed')).toBe('false');
    groupBtn.click();
    flushSync();
    expect(groupBtn.getAttribute('aria-pressed')).toBe('true');
    expect(sortBtn.getAttribute('aria-pressed')).toBe('false');
  });
});

// 020 Increment 3 — regression LOCKS for user-directed polish decisions (written after
// the changes landed, 016 US2 precedent: they pin deliberate choices, not red-first
// gates). Geometry (grid tiers, space-between, 50% caps) stays manual — jsdom has no
// layout engine.
describe('020 polish locks — toolbar structure & accent ownership', () => {
  it('both Add CTAs share .toolbar__add, after the view controls — last before the cards', () => {
    // Re-pinned 2026-06-12 (3rd revision): Add-choice + Add-point live together in
    // one .toolbar__add container inside the views row, AFTER the .toolbar__views
    // cluster, so they render inline-right at ≥800px and wrap below it otherwise.
    const addWrap = container.querySelector('.toolbar__row--views .toolbar__add')!;
    expect(addWrap).not.toBeNull();
    expect(addWrap.querySelector('[data-action="add-choice"]')).not.toBeNull();
    expect(addWrap.querySelector('[data-action="open-add-form"]')).not.toBeNull();
    const views = container.querySelector('.toolbar__views')!;
    expect(views.compareDocumentPosition(addWrap) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it('Add container carries a localized scope label like the view fields', () => {
    const lang = getState().view.lang;
    const label = container.querySelector('.toolbar__add > .scope')!;
    expect(label).not.toBeNull();
    expect(label.textContent).toBe(t(lang, 'toolbar.scopeActions'));
    expect(t('en', 'toolbar.scopeActions')).toBe('Create');
    expect(t('uk', 'toolbar.scopeActions')).toBe('Створення');
  });

  it('settings row pairs [lang+theme] and [status+Clear], status before Clear', () => {
    const sets = container.querySelectorAll('.toolbar__row--settings .toolbar__set');
    expect(sets).toHaveLength(2);
    expect(sets[0].querySelector('.langtoggle')).not.toBeNull();
    expect(sets[0].querySelector('[data-action="cycle-theme"]')).not.toBeNull();
    const saved = sets[1].querySelector('.saved')!;
    const clear = sets[1].querySelector('[data-action="clear"]')!;
    expect(saved).not.toBeNull();
    expect(clear).not.toBeNull();
    expect(saved.compareDocumentPosition(clear) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it('022: Add-choice has btn--primary; Suggest has btn--warm (not btn--primary)', () => {
    const add = container.querySelector('[data-action="add-choice"]')!;
    const suggest = container.querySelector('[data-action="open-suggest"]')!;
    // 022 role split: Add CTAs = btn--primary, Suggest = btn--warm
    expect(add.classList.contains('btn--primary')).toBe(true);
    expect(suggest.classList.contains('btn--warm')).toBe(true);
    expect(suggest.classList.contains('btn--primary')).toBe(false);
  });
});
