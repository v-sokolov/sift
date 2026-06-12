import { describe, it, expect } from 'vitest';
import { t, detectLang, messages } from '../../src/i18n';
import { LANGS } from '../../src/types';

describe('t()', () => {
  it('returns the Ukrainian string when present', () => {
    // toolbar.clear exists in both catalogs
    expect(t('uk', 'toolbar.clear')).toBe(messages.uk['toolbar.clear']);
    expect(t('uk', 'toolbar.clear')).not.toBe(messages.en['toolbar.clear']);
  });

  it('falls back to English when a key is missing in the active language', () => {
    // Inject a temporary en-only key for the test via the live catalog
    const key = '__test_only_en_key__';
    messages.en[key] = 'English only';
    try {
      expect(t('uk', key)).toBe('English only');
    } finally {
      delete messages.en[key];
    }
  });

  it('returns the key itself only when absent everywhere', () => {
    expect(t('en', '__definitely_missing__')).toBe('__definitely_missing__');
  });

  it('interpolates {var} tokens', () => {
    messages.en['__greet__'] = 'Made by {name}.';
    try {
      expect(t('en', '__greet__', { name: 'V' })).toBe('Made by V.');
    } finally {
      delete messages.en['__greet__'];
    }
  });

  it('leaves unmatched tokens untouched', () => {
    messages.en['__partial__'] = 'Hi {name}, {missing}';
    try {
      expect(t('en', '__partial__', { name: 'V' })).toBe('Hi V, {missing}');
    } finally {
      delete messages.en['__partial__'];
    }
  });

  it('never returns blank for a real English key', () => {
    for (const key of Object.keys(messages.en)) {
      expect(t('en', key)).not.toBe('');
    }
  });
});

describe('detectLang()', () => {
  it('maps uk*/ru* to Ukrainian', () => {
    for (const v of ['uk', 'uk-UA', 'UK', 'ru', 'ru-RU', 'RU']) {
      expect(detectLang(v)).toBe('uk');
    }
  });

  it('maps everything else (incl. empty/garbage) to English', () => {
    for (const v of ['en-US', 'de', 'fr', '', 'zz', 'russ']) {
      // 'russ' starts with 'ru' -> uk; keep it out. Adjust:
      if (v.startsWith('uk') || v.startsWith('ru')) continue;
      expect(detectLang(v)).toBe('en');
    }
  });
});

describe('catalog parity (SC-001 / I-L2)', () => {
  it('every Ukrainian key exists in English', () => {
    for (const key of Object.keys(messages.uk)) {
      expect(Object.prototype.hasOwnProperty.call(messages.en, key)).toBe(true);
    }
  });

  it('no rendered key resolves to blank or to the raw key in any language', () => {
    for (const lang of LANGS) {
      for (const key of Object.keys(messages.en)) {
        const out = t(lang, key);
        expect(out).not.toBe('');
        expect(out).not.toBe(key);
      }
    }
  });

  // 020 Increment 3 — copy lock: the tagline carries the privacy promise (local-only,
  // no server backup) in BOTH languages. Pins a Principle-II-adjacent product claim.
  it('tagline includes the privacy sentence in EN and UA', () => {
    expect(messages.en['header.tagline']).toContain(
      'Private by design: your data is stored only in this browser, with no server backup.',
    );
    expect(messages.uk['header.tagline']).toContain(
      'Приватність за задумом: ваші дані зберігаються лише в цьому браузері, без резервної копії на сервері.',
    );
  });
});
