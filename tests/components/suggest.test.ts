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
import { render, cleanup } from '../svelte';
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

describe('equal-width action buttons (011)', () => {
  let container: HTMLElement;
  beforeEach(() => {
    localStorage.clear();
    setState(emptyDilemma());
    ({ container } = render(App));
    flushSync();
    openSuggest();
    flushSync();
  });

  const actionButtons = () =>
    Array.from(
      (container.querySelector('.modal__actions') as HTMLElement).querySelectorAll('button'),
    );

  it('action row holds exactly two buttons, Cancel then Send (C-1, FR-005)', () => {
    const btns = actionButtons();
    expect(btns).toHaveLength(2);
    expect(btns[0].getAttribute('data-action')).toBe('close-suggest');
    expect(btns[1].getAttribute('data-action')).toBe('suggest-send');
  });

  it('both action buttons carry the btn--half equal-width hook (C-2, FR-001/003)', () => {
    for (const btn of actionButtons()) {
      expect(btn.classList.contains('btn--half')).toBe(true);
    }
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

  it('closes on Esc (FR-008; focus-return to trigger verified manually — quickstart M6)', async () => {
    (r.querySelector('[data-action="open-suggest"]') as HTMLButtonElement).click();
    flushSync();
    // Bits UI's EscapeLayer listens on `document`; its presence layer defers the DOM
    // removal past flushSync, so await the close (012, analyze F1).
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    flushSync();
    await vi.waitFor(() => expect(r.querySelector('.modal')).toBeNull());
  });

  function typeField(field: string, value: string): void {
    const el = r.querySelector(`[data-field="suggest-${field}"]`) as
      | HTMLInputElement
      | HTMLTextAreaElement;
    el.value = value;
    el.dispatchEvent(new Event('input', { bubbles: true }));
    flushSync();
  }

  it('submitting a valid form fires a mailto with the entered values and closes', async () => {
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
    // Close is deferred by Bits UI's presence layer (012, analyze F1).
    await vi.waitFor(() => expect(r.querySelector('.modal')).toBeNull());
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

  it('does not dismiss when a click lands inside the dialog body', () => {
    (r.querySelector('[data-action="open-suggest"]') as HTMLButtonElement).click();
    flushSync();
    // A pointer interaction inside the content must NOT trigger Bits UI's interact-outside.
    const title = r.querySelector('.modal__title') as HTMLElement;
    title.dispatchEvent(new MouseEvent('pointerdown', { bubbles: true }));
    title.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    flushSync();
    expect(r.querySelector('.modal')).not.toBeNull();
  });

  // Verified on-device (quickstart M6, 012 analyze F1) rather than in jsdom, because they are
  // owned by Bits UI primitives whose detection needs real layout / pointer-event fidelity:
  //   - backdrop (outside) click dismisses the dialog (DismissibleLayer),
  //   - Tab focus-trap wraps within the dialog (FocusScope, via focus-guard sentinels),
  //   - focus returns to the trigger on close (FocusScope),
  //   - background scroll is locked while open (ScrollLock).
  // The close-wiring itself is covered above by the Esc-close and submit-close tests.
});

describe('022 US5 — CTA colour roles: Suggest warm (R3, R4)', () => {
  let container: HTMLElement;
  beforeEach(() => {
    localStorage.clear();
    setState(emptyDilemma());
    ({ container } = render(App));
    flushSync();
  });
  afterEach(cleanup);

  it('R3: Suggest trigger has btn--warm and NOT btn--primary', () => {
    const btn = container.querySelector('[data-action="open-suggest"]') as HTMLButtonElement;
    expect(btn).not.toBeNull();
    expect(btn.classList.contains('btn--warm')).toBe(true);
    expect(btn.classList.contains('btn--primary')).toBe(false);
  });

  it('R4: Suggest modal Send button has btn--warm and NOT btn--primary', () => {
    openSuggest();
    flushSync();
    const btn = container.querySelector('[data-action="suggest-send"]') as HTMLButtonElement;
    expect(btn).not.toBeNull();
    expect(btn.classList.contains('btn--warm')).toBe(true);
    expect(btn.classList.contains('btn--primary')).toBe(false);
  });
});
