// F1–F3: autofocus contracts for the Add Point form (contracts/ux-enhancements.md).
// F1 — textarea focused on mount when editing.kind === 'new'
// F2 — textarea refocused after re-submit (form re-opens)
// F3 — autofocus action calls focus() + select() on mount

import { afterEach, beforeEach, describe, it, expect, vi } from 'vitest';
import { flushSync } from 'svelte';
import { emptyDilemma, getState, openAddForm, setState, submitForm } from '../../src/store.svelte';
import { autofocus } from '../../src/actions';
import App from '../../src/App.svelte';
import { render, cleanup } from '../svelte';

beforeEach(() => {
  localStorage.clear();
  setState(emptyDilemma());
});

afterEach(() => {
  cleanup();
});

describe('F3 — autofocus action', () => {
  it('calls focus() and select() on an input element', () => {
    const input = document.createElement('input');
    const focus = vi.spyOn(input, 'focus');
    const select = vi.spyOn(input, 'select');
    autofocus(input);
    expect(focus).toHaveBeenCalledOnce();
    expect(select).toHaveBeenCalledOnce();
  });

  it('calls focus() and select() on a textarea element', () => {
    const textarea = document.createElement('textarea');
    const focus = vi.spyOn(textarea, 'focus');
    const select = vi.spyOn(textarea, 'select');
    autofocus(textarea);
    expect(focus).toHaveBeenCalledOnce();
    expect(select).toHaveBeenCalledOnce();
  });

  it('calls focus() but not select() on a generic element', () => {
    const div = document.createElement('div');
    const focus = vi.spyOn(div, 'focus');
    autofocus(div);
    expect(focus).toHaveBeenCalledOnce();
  });
});

describe('F1 — textarea focused when Add Point form opens', () => {
  it('textarea is document.activeElement after openAddForm()', () => {
    const { container } = render(App);
    flushSync();
    const choiceId = getState().dilemma.choices[0].id;
    openAddForm(choiceId);
    flushSync();
    const textarea = container.querySelector<HTMLTextAreaElement>('[data-field="note-text"]');
    expect(textarea).not.toBeNull();
    expect(document.activeElement).toBe(textarea);
  });
});

describe('F2 — textarea refocused after re-submit', () => {
  it('textarea regains focus after form submit resets state', () => {
    const { container } = render(App);
    flushSync();
    const choiceId = getState().dilemma.choices[0].id;
    openAddForm(choiceId);
    flushSync();
    // Submit (empty text — store may no-op, but draft resets)
    submitForm();
    flushSync();
    // Re-open the form
    openAddForm(choiceId);
    flushSync();
    const textarea = container.querySelector<HTMLTextAreaElement>('[data-field="note-text"]');
    expect(textarea).not.toBeNull();
    expect(document.activeElement).toBe(textarea);
  });
});
