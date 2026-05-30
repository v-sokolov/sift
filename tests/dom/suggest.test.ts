import { afterEach, beforeEach, describe, it, expect, vi } from 'vitest';
import {
  emptyDilemma,
  getState,
  openSuggest,
  setLang,
  setState,
  setSuggestField,
  subscribe,
} from '../../src/state';
import { renderApp } from '../../src/render';
import { messages } from '../../src/i18n';
import { CONTACT_EMAIL, LINKEDIN_URL } from '../../src/config';

let root: HTMLElement;
let unsub: () => void;

beforeEach(() => {
  document.body.innerHTML = '<div id="app"></div>';
  root = document.getElementById('app')!;
  localStorage.clear();
  setState(emptyDilemma());
  unsub = subscribe((s) => renderApp(root, s));
  renderApp(root, getState());
});

afterEach(() => unsub());

describe('US2 — suggest modal (render/state)', () => {
  it('is hidden until opened, then shows an accessible dialog', () => {
    expect(root.querySelector('.modal')).toBeNull();
    openSuggest();
    const dialog = root.querySelector('.modal')!;
    expect(dialog).not.toBeNull();
    expect(dialog.getAttribute('role')).toBe('dialog');
    expect(dialog.getAttribute('aria-modal')).toBe('true');
  });

  it('disables Send until both name and description are non-whitespace (FR-010)', () => {
    openSuggest();
    const send = () => root.querySelector('[data-action="suggest-send"]') as HTMLButtonElement;
    expect(send().disabled).toBe(true);
    setSuggestField('name', 'Ann');
    expect(send().disabled).toBe(true); // description still empty
    setSuggestField('description', '   '); // whitespace only
    expect(send().disabled).toBe(true);
    setSuggestField('description', 'Add dark mode');
    expect(send().disabled).toBe(false);
  });

  it('offers a LinkedIn fallback and never shows the maintainer email (FR-012, I-S2)', () => {
    openSuggest();
    const fallback = root.querySelector('.modal__fallback a') as HTMLAnchorElement;
    expect(fallback.getAttribute('href')).toBe(LINKEDIN_URL);
    expect(root.innerHTML).not.toContain(CONTACT_EMAIL);
  });

  it('localizes the form and preserves entered data when language switches (FR-013)', () => {
    openSuggest();
    setSuggestField('name', 'Ann');
    setSuggestField('description', 'Idea');
    setLang('uk');
    // Labels re-translated…
    expect(root.querySelector('.modal__title')!.textContent).toBe(messages.uk['suggest.title']);
    // …and entered data preserved.
    expect((root.querySelector('[data-field="suggest-name"]') as HTMLInputElement).value).toBe('Ann');
    expect(
      (root.querySelector('[data-field="suggest-description"]') as HTMLTextAreaElement).value,
    ).toBe('Idea');
  });
});

describe('US2 — suggest modal (wired interactions via main.ts)', () => {
  let clicks: string[];
  let r: HTMLElement;

  beforeEach(async () => {
    vi.resetModules();
    document.body.innerHTML = '<div id="app"></div>';
    localStorage.clear();
    Object.defineProperty(navigator, 'language', { value: 'en-US', configurable: true });
    clicks = [];
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function (
      this: HTMLAnchorElement,
    ) {
      clicks.push(this.href);
    });
    await import('../../src/main');
    r = document.getElementById('app')!;
  });

  afterEach(() => vi.restoreAllMocks());

  it('opens the modal and moves focus into it when the header link is clicked', () => {
    (r.querySelector('[data-action="open-suggest"]') as HTMLButtonElement).click();
    expect(r.querySelector('.modal')).not.toBeNull();
    expect(document.activeElement).toBe(r.querySelector('[data-field="suggest-name"]'));
  });

  it('closes on Esc and returns focus to the trigger (FR-008)', () => {
    (r.querySelector('[data-action="open-suggest"]') as HTMLButtonElement).click();
    r.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    expect(r.querySelector('.modal')).toBeNull();
    // The trigger is re-rendered; focus returns to the fresh node.
    expect(document.activeElement).toBe(r.querySelector('[data-action="open-suggest"]'));
  });

  // The full re-render replaces nodes on every input, so re-query before each step.
  function typeField(field: string, value: string): void {
    const el = r.querySelector(`[data-field="suggest-${field}"]`) as
      | HTMLInputElement
      | HTMLTextAreaElement;
    el.value = value;
    el.dispatchEvent(new Event('input', { bubbles: true }));
  }

  it('submitting a valid form fires a mailto with the entered values and closes', () => {
    (r.querySelector('[data-action="open-suggest"]') as HTMLButtonElement).click();
    typeField('name', 'Ann');
    typeField('description', 'Add dark mode');

    const form = r.querySelector('[data-action="suggest-form"]') as HTMLFormElement;
    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));

    expect(clicks).toHaveLength(1);
    expect(clicks[0]).toContain('mailto:');
    expect(decodeURIComponent(clicks[0])).toContain('Name: Ann');
    expect(decodeURIComponent(clicks[0])).toContain('Description: Add dark mode');
    expect(r.querySelector('.modal')).toBeNull(); // closed after send
  });

  it('does not fire a mailto when the form is incomplete', () => {
    (r.querySelector('[data-action="open-suggest"]') as HTMLButtonElement).click();
    const form = r.querySelector('[data-action="suggest-form"]') as HTMLFormElement;
    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    expect(clicks).toHaveLength(0);
    expect(r.querySelector('.modal')).not.toBeNull(); // stays open
  });

  it('switches language when the header toggle is clicked', () => {
    (r.querySelector('[data-action="set-lang"][data-lang="uk"]') as HTMLButtonElement).click();
    expect((r.querySelector('.header__title') as HTMLInputElement).placeholder).toBe(
      messages.uk['header.titlePlaceholder'],
    );
  });

  it('closes when the backdrop itself is clicked, but not when the dialog body is clicked', () => {
    (r.querySelector('[data-action="open-suggest"]') as HTMLButtonElement).click();
    // Clicking inside the dialog must NOT close it.
    (r.querySelector('.modal__title') as HTMLElement).click();
    expect(r.querySelector('.modal')).not.toBeNull();
    // Clicking the overlay backdrop itself closes it.
    const overlay = r.querySelector('[data-action="suggest-backdrop"]') as HTMLElement;
    overlay.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(r.querySelector('.modal')).toBeNull();
  });

  it('traps Tab focus within the modal (wraps last → first)', () => {
    (r.querySelector('[data-action="open-suggest"]') as HTMLButtonElement).click();
    const modal = r.querySelector('.modal') as HTMLElement;
    const focusables = modal.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled])',
    );
    const last = focusables[focusables.length - 1];
    last.focus();
    const ev = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true });
    r.dispatchEvent(ev);
    expect(ev.defaultPrevented).toBe(true);
    expect(document.activeElement).toBe(focusables[0]);
  });
});
