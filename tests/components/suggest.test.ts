import { afterEach, beforeEach, describe, it, expect, vi } from 'vitest';
import { flushSync } from 'svelte';
import {
  emptyDilemma,
  openSuggest,
  setLang,
  setState,
  setSuggestField,
} from '../../src/store.svelte';
import App from '../../src/App.svelte';
import { render } from '../svelte';
import { messages } from '../../src/i18n';
import { CONTACT_EMAIL, LINKEDIN_URL } from '../../src/config';

describe('US2 — suggest modal (render/state)', () => {
  let container: HTMLElement;
  beforeEach(() => {
    localStorage.clear();
    setState(emptyDilemma());
    ({ container } = render(App));
    flushSync();
  });

  it('is hidden until opened, then shows an accessible dialog', () => {
    expect(container.querySelector('.modal')).toBeNull();
    openSuggest();
    flushSync();
    const dialog = container.querySelector('.modal')!;
    expect(dialog).not.toBeNull();
    expect(dialog.getAttribute('role')).toBe('dialog');
    expect(dialog.getAttribute('aria-modal')).toBe('true');
  });

  it('disables Send until both name and description are non-whitespace (FR-010)', () => {
    openSuggest();
    flushSync();
    const send = () =>
      container.querySelector('[data-action="suggest-send"]') as HTMLButtonElement;
    expect(send().disabled).toBe(true);
    setSuggestField('name', 'Ann');
    flushSync();
    expect(send().disabled).toBe(true);
    setSuggestField('description', '   ');
    flushSync();
    expect(send().disabled).toBe(true);
    setSuggestField('description', 'Add dark mode');
    flushSync();
    expect(send().disabled).toBe(false);
  });

  it('offers a LinkedIn fallback and never shows the maintainer email (FR-012, I-S2)', () => {
    openSuggest();
    flushSync();
    const fallback = container.querySelector('.modal__fallback a') as HTMLAnchorElement;
    expect(fallback.getAttribute('href')).toBe(LINKEDIN_URL);
    expect(container.innerHTML).not.toContain(CONTACT_EMAIL);
  });

  it('localizes the form and preserves entered data when language switches (FR-013)', () => {
    openSuggest();
    setSuggestField('name', 'Ann');
    setSuggestField('description', 'Idea');
    setLang('uk');
    flushSync();
    expect(container.querySelector('.modal__title')!.textContent).toBe(messages.uk['suggest.title']);
    expect((container.querySelector('[data-field="suggest-name"]') as HTMLInputElement).value).toBe(
      'Ann',
    );
    expect(
      (container.querySelector('[data-field="suggest-description"]') as HTMLTextAreaElement).value,
    ).toBe('Idea');
  });
});

describe('US2 — suggest modal (wired interactions)', () => {
  let clicks: string[];
  let r: HTMLElement;

  beforeEach(() => {
    localStorage.clear();
    setState(emptyDilemma());
    clicks = [];
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function (
      this: HTMLAnchorElement,
    ) {
      clicks.push(this.href);
    });
    // Mount the real app (same Svelte instance as flushSync) and exercise it via DOM
    // events — the mailto hand-off lives in SuggestDialog, so main.ts isn't needed.
    ({ container: r } = render(App));
    flushSync();
  });

  afterEach(() => vi.restoreAllMocks());

  it('opens the modal and moves focus into it when the header link is clicked', () => {
    (r.querySelector('[data-action="open-suggest"]') as HTMLButtonElement).click();
    flushSync();
    expect(r.querySelector('.modal')).not.toBeNull();
    expect(document.activeElement).toBe(r.querySelector('[data-field="suggest-name"]'));
  });

  it('closes on Esc and returns focus to the trigger (FR-008)', () => {
    (r.querySelector('[data-action="open-suggest"]') as HTMLButtonElement).click();
    flushSync();
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    flushSync();
    expect(r.querySelector('.modal')).toBeNull();
    expect(document.activeElement).toBe(r.querySelector('[data-action="open-suggest"]'));
  });

  function typeField(field: string, value: string): void {
    const el = r.querySelector(`[data-field="suggest-${field}"]`) as
      | HTMLInputElement
      | HTMLTextAreaElement;
    el.value = value;
    el.dispatchEvent(new Event('input', { bubbles: true }));
    flushSync();
  }

  it('submitting a valid form fires a mailto with the entered values and closes', () => {
    (r.querySelector('[data-action="open-suggest"]') as HTMLButtonElement).click();
    flushSync();
    typeField('name', 'Ann');
    typeField('description', 'Add dark mode');

    const form = r.querySelector('[data-action="suggest-form"]') as HTMLFormElement;
    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    flushSync();

    expect(clicks).toHaveLength(1);
    expect(clicks[0]).toContain('mailto:');
    expect(decodeURIComponent(clicks[0])).toContain('Name: Ann');
    expect(decodeURIComponent(clicks[0])).toContain('Description: Add dark mode');
    expect(r.querySelector('.modal')).toBeNull();
  });

  it('does not fire a mailto when the form is incomplete', () => {
    (r.querySelector('[data-action="open-suggest"]') as HTMLButtonElement).click();
    flushSync();
    const form = r.querySelector('[data-action="suggest-form"]') as HTMLFormElement;
    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    flushSync();
    expect(clicks).toHaveLength(0);
    expect(r.querySelector('.modal')).not.toBeNull();
  });

  it('switches language when the header toggle is clicked', () => {
    (r.querySelector('[data-action="set-lang"][data-lang="uk"]') as HTMLButtonElement).click();
    flushSync();
    expect((r.querySelector('.header__title') as HTMLInputElement).placeholder).toBe(
      messages.uk['header.titlePlaceholder'],
    );
  });

  it('closes when the backdrop itself is clicked, but not when the dialog body is clicked', () => {
    (r.querySelector('[data-action="open-suggest"]') as HTMLButtonElement).click();
    flushSync();
    (r.querySelector('.modal__title') as HTMLElement).click();
    flushSync();
    expect(r.querySelector('.modal')).not.toBeNull();
    const overlay = r.querySelector('[data-action="suggest-backdrop"]') as HTMLElement;
    overlay.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    flushSync();
    expect(r.querySelector('.modal')).toBeNull();
  });

  it('traps Tab focus within the modal (wraps last → first)', () => {
    (r.querySelector('[data-action="open-suggest"]') as HTMLButtonElement).click();
    flushSync();
    const modal = r.querySelector('.modal') as HTMLElement;
    const focusables = modal.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled])',
    );
    const last = focusables[focusables.length - 1];
    last.focus();
    const ev = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true });
    window.dispatchEvent(ev);
    expect(ev.defaultPrevented).toBe(true);
    expect(document.activeElement).toBe(focusables[0]);
  });
});
