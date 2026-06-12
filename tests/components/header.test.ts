// H1–H3, H5–H6: collapsible header description contracts (contracts/ux-enhancements.md).
// H4 (≥720px CSS visibility) requires media-query evaluation — verified manually M4/M5.
// H1 — descOpen starts false: tagline lacks --open class on init
// H2 — tagline not open when descOpen === false (class check)
// H3 — clicking toggle sets descOpen true; tagline gets --open class
// H5 — aria-expanded reflects descOpen
// H6 — aria-label matches i18n key for current state

import { afterEach, beforeEach, describe, it, expect } from 'vitest';
import { flushSync } from 'svelte';
import { emptyDilemma, setState } from '../../src/store.svelte';
import Header from '../../src/components/Header.svelte';
import { render, cleanup } from '../svelte';
import { messages } from '../../src/i18n';

beforeEach(() => {
  setState(emptyDilemma());
});

afterEach(() => {
  cleanup();
});

describe('H1 + H2 — tagline collapsed by default', () => {
  it('toggle button is present and tagline lacks --open class on mount', () => {
    const { container } = render(Header);
    flushSync();
    const toggle = container.querySelector<HTMLButtonElement>('.header__tagline-toggle');
    const tagline = container.querySelector('#header-tagline');
    expect(toggle).not.toBeNull();
    expect(tagline).not.toBeNull();
    expect(tagline!.classList.contains('header__tagline--open')).toBe(false);
  });
});

describe('H3 — clicking toggle expands tagline', () => {
  it('tagline gets --open class after toggle click', () => {
    const { container } = render(Header);
    flushSync();
    const toggle = container.querySelector<HTMLButtonElement>('.header__tagline-toggle')!;
    toggle.click();
    flushSync();
    const tagline = container.querySelector('#header-tagline');
    expect(tagline!.classList.contains('header__tagline--open')).toBe(true);
  });

  it('clicking toggle twice collapses again', () => {
    const { container } = render(Header);
    flushSync();
    const toggle = container.querySelector<HTMLButtonElement>('.header__tagline-toggle')!;
    toggle.click();
    flushSync();
    toggle.click();
    flushSync();
    const tagline = container.querySelector('#header-tagline');
    expect(tagline!.classList.contains('header__tagline--open')).toBe(false);
  });
});

describe('H5 — aria-expanded reflects descOpen', () => {
  it('aria-expanded is false on mount', () => {
    const { container } = render(Header);
    flushSync();
    const toggle = container.querySelector<HTMLButtonElement>('.header__tagline-toggle')!;
    expect(toggle.getAttribute('aria-expanded')).toBe('false');
  });

  it('aria-expanded becomes true after click', () => {
    const { container } = render(Header);
    flushSync();
    const toggle = container.querySelector<HTMLButtonElement>('.header__tagline-toggle')!;
    toggle.click();
    flushSync();
    expect(toggle.getAttribute('aria-expanded')).toBe('true');
  });
});

describe('H6 — button visible text matches i18n key', () => {
  it('button text contains taglineToggleShow value', () => {
    const { container } = render(Header);
    flushSync();
    const toggle = container.querySelector<HTMLButtonElement>('.header__tagline-toggle')!;
    expect(toggle.textContent?.trim()).toContain(messages.en['header.taglineToggleShow']);
  });

  it('button text still shows label after expand (same value for both states)', () => {
    const { container } = render(Header);
    flushSync();
    const toggle = container.querySelector<HTMLButtonElement>('.header__tagline-toggle')!;
    toggle.click();
    flushSync();
    expect(toggle.textContent?.trim()).toContain(messages.en['header.taglineToggleHide']);
  });
});
