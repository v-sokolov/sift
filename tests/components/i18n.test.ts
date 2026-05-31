import { afterEach, beforeEach, describe, it, expect, vi } from 'vitest';
import { flushSync } from 'svelte';
import {
  clearDilemma,
  emptyDilemma,
  getState,
  setDilemmaTitle,
  setLang,
  setState,
} from '../../src/store.svelte';
import App from '../../src/App.svelte';
import { render } from '../svelte';
import { flushSave, load } from '../../src/persistence';
import { messages } from '../../src/i18n';
import { CONTACT_EMAIL, GITHUB_URL, LINKEDIN_URL } from '../../src/config';

let container: HTMLElement;

beforeEach(() => {
  localStorage.clear();
  setState(emptyDilemma());
  ({ container } = render(App));
  flushSync();
});

describe('US1 — localization at the DOM level', () => {
  it('renders English copy by default', () => {
    const title = container.querySelector('.header__title') as HTMLInputElement;
    expect(title.placeholder).toBe(messages.en['header.titlePlaceholder']);
    expect(container.querySelector('[data-action="clear"]')!.textContent).toBe(
      messages.en['toolbar.clear'],
    );
  });

  it('switches all visible copy to Ukrainian when language changes', () => {
    setLang('uk');
    flushSync();
    const title = container.querySelector('.header__title') as HTMLInputElement;
    expect(title.placeholder).toBe(messages.uk['header.titlePlaceholder']);
    expect(container.querySelector('[data-action="clear"]')!.textContent).toBe(
      messages.uk['toolbar.clear'],
    );
    // The Add-choice control carries the localized label plus the live count suffix.
    expect(container.querySelector('[data-action="add-choice"]')!.textContent).toContain(
      messages.uk['toolbar.addChoice'],
    );
  });

  it('does not lose the board when switching language (FR-006)', () => {
    setDilemmaTitle('Where to live?');
    setLang('uk');
    flushSync();
    expect((container.querySelector('.header__title') as HTMLInputElement).value).toBe(
      'Where to live?',
    );
    expect(getState().dilemma.choices).toHaveLength(2);
  });

  it('persists the chosen language and re-renders it after a reload (FR-004)', () => {
    setLang('uk');
    flushSave(getState());
    const restored = load();
    expect(restored!.view.lang).toBe('uk');
    setState({ ...emptyDilemma(), dilemma: restored!.dilemma, view: restored!.view });
    flushSync();
    expect((container.querySelector('.header__title') as HTMLInputElement).placeholder).toBe(
      messages.uk['header.titlePlaceholder'],
    );
  });

  it('marks the active language on the toggle (not by color alone)', () => {
    setLang('uk');
    flushSync();
    const active = container.querySelector('[data-action="set-lang"][data-lang="uk"]')!;
    expect(active.getAttribute('aria-pressed')).toBe('true');
    expect(active.classList.contains('is-active')).toBe(true);
  });

  it('preserves the chosen language through Clear (board resets, language stays)', () => {
    setLang('uk');
    setDilemmaTitle('Where to live?');
    clearDilemma();
    flushSync();
    expect(getState().view.lang).toBe('uk');
    expect(getState().dilemma.title).toBe('');
    expect((container.querySelector('.header__title') as HTMLInputElement).placeholder).toBe(
      messages.uk['header.titlePlaceholder'],
    );
  });

  it('shows the localized header tagline (US1)', () => {
    expect(container.querySelector('.header__tagline')!.textContent).toBe(
      messages.en['header.tagline'],
    );
    setLang('uk');
    flushSync();
    expect(container.querySelector('.header__tagline')!.textContent).toBe(
      messages.uk['header.tagline'],
    );
  });

  it('renders the Essentialism inspiration with a real link in the footer', () => {
    const inspired = container.querySelector('.footer .footer__inspired')!;
    const link = inspired.querySelector('a') as HTMLAnchorElement;
    expect(link).not.toBeNull();
    expect(link.textContent).toBe(messages.en['footer.inspiredBook']);
    expect(link.getAttribute('href')).toBe(
      'https://www.goodreads.com/book/show/54644719-essentialism',
    );
    expect(link.getAttribute('rel')).toContain('noopener');
    expect(inspired.textContent).toContain(messages.en['footer.inspiredPre'].trim());
    expect(inspired.textContent).toContain(messages.en['footer.inspiredPost'].trim());
    setLang('uk');
    flushSync();
    expect(container.querySelector('.footer .footer__inspired a')!.textContent).toBe(
      messages.uk['footer.inspiredBook'],
    );
  });

  it('shows the localized score-formula caption below the score band (US2)', () => {
    // The caption lives inside .summary but is not one of the .sum score cells.
    expect(container.querySelector('.summary .sum')).not.toBeNull();
    const caption = container.querySelector('.summary__formula')!;
    expect(caption.classList.contains('sum')).toBe(false);
    expect(caption.textContent).toBe(messages.en['summary.formula']);
    setLang('uk');
    flushSync();
    expect(container.querySelector('.summary__formula')!.textContent).toBe(
      messages.uk['summary.formula'],
    );
  });
});

describe('US1 — boot language detection (wired via main.ts)', () => {
  afterEach(() => vi.restoreAllMocks());

  it('detects Ukrainian on first visit when navigator.language starts with uk/ru', async () => {
    vi.resetModules();
    document.body.innerHTML = '<div id="app"></div>';
    localStorage.clear();
    Object.defineProperty(navigator, 'language', { value: 'uk-UA', configurable: true });
    await import('../../src/main');
    const app = document.getElementById('app')!;
    expect((app.querySelector('.header__title') as HTMLInputElement).placeholder).toBe(
      messages.uk['header.titlePlaceholder'],
    );
  });

  it('defaults to English for any other browser language', async () => {
    vi.resetModules();
    document.body.innerHTML = '<div id="app"></div>';
    localStorage.clear();
    Object.defineProperty(navigator, 'language', { value: 'de-DE', configurable: true });
    await import('../../src/main');
    const app = document.getElementById('app')!;
    expect((app.querySelector('.header__title') as HTMLInputElement).placeholder).toBe(
      messages.en['header.titlePlaceholder'],
    );
  });

  it('lets a stored language choice override browser detection (FR-004)', async () => {
    vi.resetModules();
    document.body.innerHTML = '<div id="app"></div>';
    localStorage.clear();
    const seed = await import('../../src/store.svelte');
    const persist = await import('../../src/persistence');
    const s = seed.emptyDilemma();
    s.view.lang = 'en';
    persist.flushSave(s);
    Object.defineProperty(navigator, 'language', { value: 'uk-UA', configurable: true });
    await import('../../src/main');
    const app = document.getElementById('app')!;
    expect((app.querySelector('.header__title') as HTMLInputElement).placeholder).toBe(
      messages.en['header.titlePlaceholder'],
    );
  });
});

describe('US3 — author footer', () => {
  it('links the author name to GitHub and adds a LinkedIn link', () => {
    const links = Array.from(container.querySelectorAll('.footer a')) as HTMLAnchorElement[];
    const hrefs = links.map((a) => a.getAttribute('href'));
    expect(hrefs).toContain(GITHUB_URL);
    expect(hrefs).toContain(LINKEDIN_URL);
  });

  it('localizes the footer sentence', () => {
    setLang('uk');
    flushSync();
    const footer = container.querySelector('.footer')!;
    expect(footer.textContent).toContain('Створив');
  });

  it('never renders the maintainer email anywhere', () => {
    expect(container.innerHTML).not.toContain(CONTACT_EMAIL);
  });

  it('drops the author name from the inspiration credit, keeps the book (010, FR-014)', () => {
    const footer = container.querySelector('.footer')!;
    expect(footer.textContent).toContain('Essentialism');
    expect(footer.textContent).not.toContain('Greg McKeown');
    setLang('uk');
    flushSync();
    const footerUk = container.querySelector('.footer')!;
    expect(footerUk.textContent).toContain('Essentialism');
    expect(footerUk.textContent).not.toContain('Мак-Кеоуна');
  });
});
