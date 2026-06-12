// 020 — accordion choice cards (contracts A1–A6, S1–S2). DOM-driven through App so
// per-card independence and the 016 confirm flow are exercised for real. Footer
// contracts (F1–F2, A5) are added by US2 below the A-suite. Svelte's slide transition
// runs at 0ms here (no matchMedia in jsdom → reduced-motion fallback), but assertions
// still `settle()` to let outros finish.

import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { flushSync } from 'svelte';
import {
  addNote,
  emptyDilemma,
  getState,
  openAddForm,
  setExpanded,
  setState,
  toggleGroup,
  toggleRank,
} from '../../src/store.svelte';
import { flushSave, load, STORAGE_KEY } from '../../src/persistence';
import App from '../../src/App.svelte';
import Summary from '../../src/components/Summary.svelte';
import { render, cleanup } from '../svelte';
import { t } from '../../src/i18n';
import type { AppState } from '../../src/types';

let container: HTMLElement;

const cards = () => Array.from(container.querySelectorAll('.choice')) as HTMLElement[];
const triggerIn = (card: HTMLElement) =>
  card.querySelector('[data-action="toggle-choice"]') as HTMLButtonElement | null;
const bodyIn = (card: HTMLElement) => card.querySelector('.choice__body');
// Rev. 2 header: read-only name text; the input exists ONLY while editing (H1).
const nameIn = (card: HTMLElement) => card.querySelector('.choice__name') as HTMLElement | null;
const titleInput = (card: HTMLElement) =>
  card.querySelector('.choice__title') as HTMLInputElement | null;
const renameBtnIn = (card: HTMLElement) =>
  card.querySelector('[data-action="rename-choice"]') as HTMLButtonElement | null;
const removeBtnIn = (card: HTMLElement) =>
  card.querySelector('[data-action="remove-choice"]') as HTMLButtonElement | null;

/** Flush Svelte, let 0ms transitions/outros run, flush again. */
async function settle(): Promise<void> {
  flushSync();
  await new Promise((r) => setTimeout(r, 25));
  flushSync();
}

/**
 * Board built WITHOUT note mutations (which auto-expand, FR-010) so the
 * collapsed-by-default state of a freshly loaded board is genuinely observable (A1):
 * three choices — 'Acme' (+3 / −2), untitled (~), untitled (empty).
 */
function seededState(): AppState {
  const s = emptyDilemma();
  s.dilemma.choices.push({ id: 'c3', title: '', notes: [] });
  s.dilemma.choices[0].title = 'Acme';
  s.dilemma.choices[0].notes = [
    { id: 'n1', text: 'pay', type: 'advantage', weight: 3 },
    { id: 'n2', text: 'risk', type: 'disadvantage', weight: 2 },
  ];
  s.dilemma.choices[1].notes = [{ id: 'n3', text: 'meh', type: 'neutral', weight: null }];
  return s;
}

beforeEach(() => {
  localStorage.clear();
  setState(seededState());
  ({ container } = render(App));
  flushSync();
});
afterEach(cleanup);

describe('020 A — accordion behaviour', () => {
  it('A1 (rev. 2): fresh board collapsed — chevron + read-only name; no input/✎/✕ in header', () => {
    expect(cards()).toHaveLength(3);
    const names = cards().map((c) => nameIn(c)?.textContent);
    expect(names).toEqual(['Acme', 'Choice 2', 'Choice 3']); // ghost placeholders for untitled
    for (const card of cards()) {
      expect(titleInput(card)).toBeNull(); // no always-mounted input
      expect(removeBtnIn(card)).toBeNull(); // ✕ lives in the body now (H4)
      expect(renameBtnIn(card)).toBeNull(); // ✎ too (H4)
      expect(card.querySelector('.choice__edit')).toBeNull(); // pencil cue retired
      const trig = triggerIn(card);
      expect(trig).not.toBeNull();
      expect(trig!.getAttribute('aria-expanded')).toBe('false');
      expect(bodyIn(card)).toBeNull();
      expect(card.querySelector('.notes')).toBeNull();
      expect(card.querySelector('.empty')).toBeNull();
      // 022 US3: non-empty cards have .choice__score; empty card (index 2) has --empty footer instead
    }
    // Non-empty cards have a score element
    expect(cards()[0].querySelector('.choice__foot .choice__score')).not.toBeNull(); // Acme +1
    expect(cards()[1].querySelector('.choice__foot .choice__score')).not.toBeNull(); // neutral ~0
    // Empty card has no score, but has an empty footer
    expect(cards()[2].querySelector('.choice__foot .choice__score')).toBeNull();
    expect(cards()[2].querySelector('.choice__foot--empty')).not.toBeNull();
  });

  it('A2: the chevron toggles ONLY its own card, open then closed', async () => {
    triggerIn(cards()[0])!.click();
    await settle();
    expect(bodyIn(cards()[0])).not.toBeNull();
    expect(cards()[0].querySelectorAll('.note')).toHaveLength(2);
    expect(bodyIn(cards()[1])).toBeNull();
    expect(bodyIn(cards()[2])).toBeNull();

    triggerIn(cards()[0])!.click();
    await settle();
    expect(bodyIn(cards()[0])).toBeNull();
  });

  it('A3: trigger is a <button> with constant name, aria-expanded and aria-controls → body id', async () => {
    const trig = triggerIn(cards()[0])!;
    expect(trig.tagName).toBe('BUTTON');
    // Increment-3 lock: the toggle icon is the CaretDown SVG (rotation is CSS-only).
    expect(trig.querySelector('svg')).not.toBeNull();
    expect(trig.getAttribute('aria-label')).toBe(t('en', 'choice.toggleAria'));
    expect(trig.getAttribute('aria-expanded')).toBe('false');

    trig.click();
    await settle();
    expect(trig.getAttribute('aria-expanded')).toBe('true');
    // Constant accessible name (state lives in aria-expanded, R7).
    expect(trig.getAttribute('aria-label')).toBe(t('en', 'choice.toggleAria'));
    const body = bodyIn(cards()[0])!;
    expect(trig.getAttribute('aria-controls')).toBe(body.id);
  });

  it('A4 (rev. 2): header-row click toggles; no double-toggle from chevron; no toggle while editing', async () => {
    // Clicking the read-only name (a plain header click) expands (FR-013).
    nameIn(cards()[0])!.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    await settle();
    expect(bodyIn(cards()[0])).not.toBeNull();

    // Chevron click bubbles through the head but must toggle exactly ONCE (collapse).
    triggerIn(cards()[0])!.click();
    await settle();
    expect(bodyIn(cards()[0])).toBeNull();

    // While title-editing, header clicks must NOT toggle (FR-007/FR-013).
    triggerIn(cards()[0])!.click();
    await settle();
    renameBtnIn(cards()[0])!.click();
    await settle();
    const head = cards()[0].querySelector('.choice__head') as HTMLElement;
    head.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    await settle();
    expect(bodyIn(cards()[0])).not.toBeNull(); // still expanded
    expect(titleInput(cards()[0])).not.toBeNull(); // still editing
  });

  it('A6: expand → collapse → expand round-trips the arranged body (Group mode)', async () => {
    toggleGroup(); // group by type
    await settle();
    triggerIn(cards()[0])!.click();
    await settle();
    const labels = () =>
      Array.from(cards()[0].querySelectorAll('.group-label')).map((el) => el.textContent);
    const before = labels();
    expect(before).toEqual([t('en', 'group.advantage'), t('en', 'group.disadvantage')]);

    triggerIn(cards()[0])!.click();
    await settle();
    expect(bodyIn(cards()[0])).toBeNull();

    triggerIn(cards()[0])!.click();
    await settle();
    expect(labels()).toEqual(before);
    expect(cards()[0].querySelectorAll('.note')).toHaveLength(2);
    // Rev. 2: the actions row renders inside the body, after the points (FR-001).
    expect(cards()[0].querySelector('.choice__body .choice__actions')).not.toBeNull();
  });
});

describe('020 H — rename flow & relocated controls (rev. 2, H1–H5)', () => {
  const expand = async (i: number) => {
    triggerIn(cards()[i])!.click();
    await settle();
  };

  it('H1: Rename swaps in an autofocused input; typing renames live; Enter commits', async () => {
    await expand(0);
    renameBtnIn(cards()[0])!.click();
    await settle();
    const inp = titleInput(cards()[0])!;
    expect(inp).not.toBeNull();
    expect(nameIn(cards()[0])).toBeNull(); // text swapped out
    expect(document.activeElement).toBe(inp);
    inp.value = 'Acme Corp';
    inp.dispatchEvent(new Event('input', { bubbles: true }));
    flushSync();
    expect(getState().dilemma.choices[0].title).toBe('Acme Corp'); // live rename, unchanged semantics
    inp.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    await settle();
    expect(titleInput(cards()[0])).toBeNull();
    expect(nameIn(cards()[0])!.textContent).toBe('Acme Corp');
  });

  it('H2: Esc restores the prior name, spares the points form, returns focus to Rename', async () => {
    await expand(0);
    openAddForm(getState().dilemma.choices[0].id);
    flushSync();
    renameBtnIn(cards()[0])!.click();
    await settle();
    const inp = titleInput(cards()[0])!;
    inp.value = 'Oops';
    inp.dispatchEvent(new Event('input', { bubbles: true }));
    flushSync();
    expect(getState().dilemma.choices[0].title).toBe('Oops');
    inp.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    await settle();
    expect(getState().dilemma.choices[0].title).toBe('Acme'); // restored (prevTitle)
    expect(titleInput(cards()[0])).toBeNull();
    expect(getState().editing).not.toBeNull(); // App-level Esc handler NOT triggered
    expect(document.activeElement).toBe(renameBtnIn(cards()[0]));
  });

  it('H4: Rename and Remove are unreachable while every card is collapsed', () => {
    for (const card of cards()) {
      expect(renameBtnIn(card)).toBeNull();
      expect(removeBtnIn(card)).toBeNull();
    }
  });

  it('H5: collapsing via chevron mid-edit commits the typed value and exits editing', async () => {
    await expand(0);
    renameBtnIn(cards()[0])!.click();
    await settle();
    const inp = titleInput(cards()[0])!;
    inp.value = 'Mid-edit';
    inp.dispatchEvent(new Event('input', { bubbles: true }));
    flushSync();
    triggerIn(cards()[0])!.click(); // collapse while the input is open
    await settle();
    expect(bodyIn(cards()[0])).toBeNull();
    expect(getState().dilemma.choices[0].title).toBe('Mid-edit'); // committed
    expect(titleInput(cards()[0])).toBeNull();
    expect(nameIn(cards()[0])!.textContent).toBe('Mid-edit');
  });
});

describe('020 S — serialization honesty', () => {
  it('S1: the persisted payload is byte-identical across any toggle sequence', async () => {
    flushSave(getState());
    const before = localStorage.getItem(STORAGE_KEY);
    expect(before).not.toBeNull();

    triggerIn(cards()[0])!.click();
    await settle();
    triggerIn(cards()[1])!.click();
    await settle();
    setExpanded(getState().dilemma.choices[2].id, true);
    triggerIn(cards()[0])!.click();
    await settle();

    flushSave(getState());
    expect(localStorage.getItem(STORAGE_KEY)).toBe(before);
  });

});

describe('020 F — footer score (F1–F2, A5)', () => {
  const footScore = (card: HTMLElement) =>
    card.querySelector('.choice__foot .choice__score') as HTMLElement | null;
  // FR-011 superseded: the band is hidden in App, so the SC-003 cross-check mounts the
  // retained <Summary /> directly (same store, same order).
  const sumScores = () => {
    const { container: sumC } = render(Summary);
    flushSync();
    return Array.from(sumC.querySelectorAll('.sum__score')) as HTMLElement[];
  };

  it('F1: footer shows the signed total on non-empty cards; empty card shows placeholder (022 US3)', () => {
    const [a, b, c] = cards();
    // Acme: +3 −2 = +1; neutral-only: 0; empty: no score, shows empty placeholder.
    expect(footScore(a)!.textContent).toBe('+1');
    expect(footScore(b)!.textContent).toBe('0');
    // 022 US3: empty card has no .choice__score — it shows choice.empty label instead
    expect(footScore(c)).toBeNull();
    expect(c.querySelector('.choice__foot--empty')).not.toBeNull();
  });

  it('F1: negative totals use the U+2212 minus', async () => {
    const b = getState().dilemma.choices[1].id;
    addNote(b, { text: 'down', type: 'disadvantage', weight: 2 });
    await settle();
    expect(footScore(cards()[1])!.textContent).toBe('−2');
  });

  it('F2: footer sign class matches the Summary cell modifier for the same Choice (SC-003)', () => {
    const foot = footScore(cards()[0])!;
    expect(foot.classList.contains('choice__score--positive')).toBe(true);
    // Same board position: Summary renders in the same (unranked) order as the cards.
    expect(sumScores()[0].classList.contains('sum__score--positive')).toBe(true);
    expect(foot.textContent).toBe(sumScores()[0].textContent);

    const footB = footScore(cards()[1])!;
    expect(footB.classList.contains('choice__score--neutral')).toBe(true);
    expect(sumScores()[1].classList.contains('sum__score--neutral')).toBe(true);
  });

  it('F2b: the footer zone itself carries the sign tint modifier, mirroring .sum--*', async () => {
    const foot = (i: number) => cards()[i].querySelector('.choice__foot') as HTMLElement;
    expect(foot(0).classList.contains('choice__foot--positive')).toBe(true); // +1
    expect(foot(1).classList.contains('choice__foot--neutral')).toBe(true); // 0
    const bId = getState().dilemma.choices[1].id;
    addNote(bId, { text: 'down', type: 'disadvantage', weight: 2 });
    await settle();
    expect(foot(1).classList.contains('choice__foot--negative')).toBe(true);
    expect(foot(1).classList.contains('choice__foot--neutral')).toBe(false);
  });

  it('A5: the footer stays visible and live on a COLLAPSED card', async () => {
    const bId = getState().dilemma.choices[1].id;
    addNote(bId, { text: 'up', type: 'advantage', weight: 3 }); // auto-expands (FR-010)
    setExpanded(bId, false); // fold it back: footer must still show the new total
    await settle();
    const card = cards()[1];
    expect(bodyIn(card)).toBeNull();
    expect(footScore(card)!.textContent).toBe('+3');
    expect(footScore(card)!.classList.contains('choice__score--positive')).toBe(true);
  });
});

// Passed on first run (US3 emerges from US1+US2: orderedChoices reorders the keyed
// cells, each card carries its own footer) — kept as a regression lock (T015/T016).
describe('020 US3 — collapsed cards under Rank-by-score', () => {
  it('reorders collapsed cards by total and keeps each footer with its own Choice', async () => {
    // All collapsed by default. Board: Acme +1, neutral 0, empty 0 → ranked: Acme first.
    toggleRank();
    await settle();
    const titles = cards().map((c) => nameIn(c)!.textContent);
    expect(titles[0]).toBe('Acme');

    // Boost the (formerly) second choice to +3: it must overtake Acme, stay COLLAPSED
    // after re-folding, and carry its own footer along.
    const bId = getState().dilemma.choices[1].id;
    addNote(bId, { text: 'big win', type: 'advantage', weight: 3 }); // auto-expands b
    setExpanded(bId, false);
    await settle();

    const first = cards()[0];
    expect(first.getAttribute('data-choice-id')).toBe(bId);
    expect(first.querySelector('.choice__foot .choice__score')!.textContent).toBe('+3');
    expect(bodyIn(first)).toBeNull(); // still collapsed after reorder
    const second = cards()[1];
    expect(nameIn(second)!.textContent).toBe('Acme');
    expect(second.querySelector('.choice__foot .choice__score')!.textContent).toBe('+1');
  });
});

describe('020 — summary band hidden (FR-011 superseded)', () => {
  it('App renders no .summary; card footers are the only score display', () => {
    expect(container.querySelector('.summary')).toBeNull();
    // 022 US3: empty card shows --empty footer (no .choice__score) — non-empty cards have score
    expect(container.querySelectorAll('.choice__foot .choice__score')).toHaveLength(2); // Acme + neutral
    expect(container.querySelectorAll('.choice__foot--empty')).toHaveLength(1); // 1 empty card
  });
});

describe('022 US3 — empty-card footer (Z1–Z4)', () => {
  const foot = (i: number) => cards()[i].querySelector('.choice__foot') as HTMLElement;

  it('Z1: card with 0 notes has choice__foot--empty and no sign-tint class', () => {
    // cards()[2] is empty in seededState
    const f = foot(2);
    expect(f.classList.contains('choice__foot--empty')).toBe(true);
    expect(f.classList.contains('choice__foot--positive')).toBe(false);
    expect(f.classList.contains('choice__foot--negative')).toBe(false);
    expect(f.classList.contains('choice__foot--neutral')).toBe(false);
  });

  it('Z2: empty card footer shows the "no points yet" label text', () => {
    const f = foot(2);
    expect(f.textContent?.trim()).not.toBe('');
  });

  it('Z3: non-empty card does NOT have choice__foot--empty', () => {
    expect(foot(0).classList.contains('choice__foot--empty')).toBe(false);
  });

  it('Z4: net-zero non-empty card has choice__foot--neutral, not empty', () => {
    // cards()[1] has 1 neutral note (net 0) — should NOT be empty
    expect(foot(1).classList.contains('choice__foot--neutral')).toBe(true);
    expect(foot(1).classList.contains('choice__foot--empty')).toBe(false);
  });
});

describe('020 S — defensive load', () => {
  it('S2: a pre-020 sift.v1 payload loads unchanged (no new defensive-load rule)', () => {
    const pre020 = {
      schemaVersion: 1,
      dilemma: {
        id: 'd-old',
        title: 'older board',
        choices: [
          { id: 'a', title: 'A', notes: [] },
          { id: 'b', title: 'B', notes: [{ id: 'n', text: 'x', type: 'advantage', weight: 1 }] },
        ],
        createdAt: 1,
        updatedAt: 2,
      },
      view: { mode: 'default', sortKey: 'weight', direction: 'desc', theme: 'system' },
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(pre020));
    const loaded = load();
    expect(loaded).not.toBeNull();
    expect(loaded!.dilemma.id).toBe('d-old');
    expect(loaded!.dilemma.choices[1].notes[0].text).toBe('x');
  });
});
