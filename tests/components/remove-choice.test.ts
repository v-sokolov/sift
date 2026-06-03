// 016 — destructive-action confirmation (contracts B1–B6, D1–D4). DOM-driven through the
// shared ConfirmDialog (Bits UI Dialog, rendered inline — queries reach it on `container`).
// The ✕ control had no DOM-level tests before this feature; Clear's confirm path gains its
// first tests here too.

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { flushSync } from 'svelte';
import {
  addChoice,
  addNote,
  emptyDilemma,
  getState,
  openAddForm,
  removeNote,
  renameChoice,
  setLang,
  setState,
  setTheme,
  subscribePersist,
} from '../../src/store.svelte';
import App from '../../src/App.svelte';
import { render, cleanup } from '../svelte';
import { t } from '../../src/i18n';

let container: HTMLElement;

const removeBtns = () =>
  Array.from(container.querySelectorAll('[data-action="remove-choice"]')) as HTMLButtonElement[];
const dialogMsg = () =>
  container.querySelector('[data-region="confirm-dialog"] .modal__title') as HTMLElement | null;
const confirmBtn = () =>
  container.querySelector('[data-action="confirm-dialog-confirm"]') as HTMLButtonElement | null;
const cancelBtn = () =>
  container.querySelector('[data-action="confirm-dialog-cancel"]') as HTMLButtonElement | null;
const snap = () => JSON.parse(JSON.stringify(getState()));

beforeEach(() => {
  localStorage.clear();
  setState(emptyDilemma());
  ({ container } = render(App));
  flushSync();
});
afterEach(cleanup);

// Board with 3 choices (✕ is disabled at the 2-choice minimum) where choice 0 has points.
function seedPointedBoard(): string {
  addChoice();
  const cid = getState().dilemma.choices[0].id;
  renameChoice(cid, 'Acme');
  addNote(cid, { text: 'pay', type: 'advantage', weight: 3 });
  addNote(cid, { text: 'risk', type: 'disadvantage', weight: 2 });
  flushSync();
  return cid;
}

describe('016 US1 — ✕ on a pointed Choice opens the confirmation (B1/B4)', () => {
  it('shows the dialog with the named message and does not change the board yet', () => {
    seedPointedBoard();
    removeBtns()[0].click();
    flushSync();
    expect(confirmBtn()).not.toBeNull();
    expect(dialogMsg()!.textContent).toBe(t('en', 'confirm.removeChoice', { name: 'Acme' }));
    // Nothing removed yet (FR-001).
    expect(getState().dilemma.choices).toHaveLength(3);
  });

  it('names an untitled Choice by its placeholder and localizes message + buttons (UA)', () => {
    addChoice(); // 3 choices, all untitled; give the 3rd a point
    const third = getState().dilemma.choices[2].id;
    addNote(third, { text: 'x', type: 'neutral', weight: null });
    flushSync();
    removeBtns()[2].click();
    flushSync();
    expect(dialogMsg()!.textContent).toBe(t('en', 'confirm.removeChoice', { name: 'Choice 3' }));
    setLang('uk');
    flushSync();
    expect(dialogMsg()!.textContent).toBe(t('uk', 'confirm.removeChoice', { name: 'Варіант 3' }));
    expect(cancelBtn()!.textContent).toBe(t('uk', 'confirm.cancel'));
    expect(confirmBtn()!.textContent).toBe(t('uk', 'confirm.removeAction'));
  });

  it('neutral-only points still count as data and prompt (edge case)', () => {
    addChoice();
    const cid = getState().dilemma.choices[1].id;
    addNote(cid, { text: 'meh', type: 'neutral', weight: null });
    flushSync();
    removeBtns()[1].click();
    flushSync();
    expect(confirmBtn()).not.toBeNull();
    expect(getState().dilemma.choices).toHaveLength(3);
  });
});

describe('016 US1 — declining is a complete no-op (B2, H2)', () => {
  it('Cancel: dialog closes, full AppState deep-equal, persistence channel silent', async () => {
    seedPointedBoard();
    let persists = 0;
    const off = subscribePersist(() => (persists += 1));
    const before = snap();
    removeBtns()[0].click();
    flushSync();
    cancelBtn()!.click();
    flushSync();
    await vi.waitFor(() => expect(confirmBtn()).toBeNull());
    expect(snap()).toEqual(before);
    expect(persists).toBe(0);
    off();
  });

  it('Esc: same deep-equal no-op', async () => {
    seedPointedBoard();
    const before = snap();
    removeBtns()[0].click();
    flushSync();
    // Bits UI's EscapeLayer listens on `document`; presence layer defers removal (012 F1).
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    flushSync();
    await vi.waitFor(() => expect(confirmBtn()).toBeNull());
    expect(snap()).toEqual(before);
  });

  it('a click inside the dialog body does NOT dismiss it (positive control)', () => {
    seedPointedBoard();
    removeBtns()[0].click();
    flushSync();
    const msg = dialogMsg()!;
    msg.dispatchEvent(new MouseEvent('pointerdown', { bubbles: true }));
    msg.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    flushSync();
    expect(confirmBtn()).not.toBeNull();
  });

  // Outside-click (backdrop) decline: NOT simulatable in jsdom — Bits UI's
  // DismissibleLayer needs real pointer-event fidelity (established in 012 analyze F1;
  // see the identical note in suggest.test.ts). Verified manually per quickstart M1
  // against `data-action="confirm-dialog-backdrop"`. Esc + Cancel above cover the same
  // onOpenChange(false) → onCancel wiring in jsdom.
});

// US2 — regression locks written AFTER the guard landed: they pin the `> 0` trigger
// condition (FR-002, count read at click time). They may pass on first run — that is the
// point (locks, not red-first gates). If one fails, fix ChoiceCard's condition, not the test.
describe('016 US2 — empty Choices keep frictionless one-click removal (B1/FR-002)', () => {
  it('✕ on a 0-point Choice removes instantly with no dialog', () => {
    addChoice(); // 3 untitled, empty choices
    flushSync();
    removeBtns()[2].click();
    flushSync();
    expect(confirmBtn()).toBeNull();
    expect(getState().dilemma.choices).toHaveLength(2);
  });

  it('a Choice whose points were all deleted earlier removes without a prompt', () => {
    addChoice();
    const cid = getState().dilemma.choices[1].id;
    addNote(cid, { text: 'x', type: 'advantage', weight: 1 });
    flushSync();
    const nid = getState().dilemma.choices[1].notes[0].id;
    removeNote(cid, nid);
    flushSync();
    removeBtns()[1].click();
    flushSync();
    expect(confirmBtn()).toBeNull();
    expect(getState().dilemma.choices).toHaveLength(2);
  });
});

describe('016 US1 — confirming removes with existing post-removal behavior (B3)', () => {
  it('removes the Choice, closes a point form tied to it, drops the count', async () => {
    const cid = seedPointedBoard();
    openAddForm(cid);
    flushSync();
    expect(getState().editing?.choiceId).toBe(cid);
    removeBtns()[0].click();
    flushSync();
    confirmBtn()!.click();
    flushSync();
    await vi.waitFor(() => expect(confirmBtn()).toBeNull());
    expect(getState().dilemma.choices).toHaveLength(2);
    expect(getState().dilemma.choices.find((c) => c.id === cid)).toBeUndefined();
    expect(getState().editing).toBeNull();
    expect(getState().draft).toBeNull();
  });
});

describe('016 — Clear migrates onto the shared dialog (B6, FR-010, SC-006)', () => {
  const clearBtn = () => container.querySelector('[data-action="clear"]') as HTMLButtonElement;

  it('opens the dialog with the Clear message — window.confirm is NEVER called (H3)', () => {
    const native = vi.spyOn(window, 'confirm');
    clearBtn().click();
    flushSync();
    expect(native).not.toHaveBeenCalled();
    expect(dialogMsg()!.textContent).toBe(t('en', 'confirm.clear'));
    expect(confirmBtn()!.textContent).toBe(t('en', 'confirm.clearAction'));
    native.mockRestore();
  });

  it('declining Clear changes nothing (deep-equal)', async () => {
    seedPointedBoard();
    const before = snap();
    clearBtn().click();
    flushSync();
    cancelBtn()!.click();
    flushSync();
    await vi.waitFor(() => expect(confirmBtn()).toBeNull());
    expect(snap()).toEqual(before);
  });

  it('confirming Clear resets the board while theme and language survive', async () => {
    setTheme('dark');
    setLang('uk');
    seedPointedBoard();
    flushSync();
    clearBtn().click();
    flushSync();
    confirmBtn()!.click();
    flushSync();
    await vi.waitFor(() => expect(confirmBtn()).toBeNull());
    const s = getState();
    expect(s.dilemma.title).toBe('');
    expect(s.dilemma.choices).toHaveLength(2);
    expect(s.dilemma.choices.every((c) => c.notes.length === 0)).toBe(true);
    expect(s.view.theme).toBe('dark');
    expect(s.view.lang).toBe('uk');
  });
});
