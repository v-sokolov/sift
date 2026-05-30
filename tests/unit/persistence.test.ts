import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { AppState } from '../../src/types';
import { emptyDilemma } from '../../src/store.svelte';
import { STORAGE_KEY, flushSave, load, scheduleSave } from '../../src/persistence';

function seedState(): AppState {
  const s = emptyDilemma();
  s.dilemma.title = 'Which job?';
  s.dilemma.choices[0].title = 'Acme';
  s.dilemma.choices[0].notes.push({ id: 'x', text: 'pay', type: 'advantage', weight: 3 });
  s.view.mode = 'sorted';
  return s;
}

beforeEach(() => {
  localStorage.clear();
  vi.useRealTimers();
});

describe('round-trip', () => {
  it('flushSave then load returns an equal dilemma + view', () => {
    const s = seedState();
    flushSave(s);
    const out = load();
    expect(out).not.toBeNull();
    expect(out!.dilemma).toEqual(s.dilemma);
    expect(out!.view).toEqual(s.view);
  });
});

describe('language migration (002)', () => {
  it('round-trips a stored language', () => {
    const s = seedState();
    s.view.lang = 'uk';
    flushSave(s);
    expect(load()!.view.lang).toBe('uk');
  });

  it('still loads an old payload that has no lang (board not lost); lang left unset', () => {
    const s = seedState();
    const view = { ...s.view } as unknown as Record<string, unknown>;
    delete view.lang;
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ schemaVersion: 1, dilemma: s.dilemma, view }));
    const out = load();
    expect(out).not.toBeNull();
    expect(out!.dilemma.title).toBe('Which job?');
    expect((out!.view as unknown as Record<string, unknown>).lang).toBeUndefined();
  });

  it('accepts a payload with an invalid lang and drops it (no rejection)', () => {
    const s = seedState();
    const view = { ...s.view, lang: 'fr' };
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ schemaVersion: 1, dilemma: s.dilemma, view }));
    const out = load();
    expect(out).not.toBeNull();
    expect((out!.view as unknown as Record<string, unknown>).lang).toBeUndefined();
  });
});

describe('defensive load (P4)', () => {
  it('returns null when key is missing', () => {
    expect(load()).toBeNull();
  });
  it('returns null on unparseable JSON', () => {
    localStorage.setItem(STORAGE_KEY, 'not json');
    expect(load()).toBeNull();
  });
  it('returns null on wrong schemaVersion', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ schemaVersion: 99, dilemma: {}, view: {} }));
    expect(load()).toBeNull();
  });
  it('returns null when choices length is out of range', () => {
    const s = seedState();
    const bad = { schemaVersion: 1, dilemma: { ...s.dilemma, choices: [s.dilemma.choices[0]] }, view: s.view };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(bad));
    expect(load()).toBeNull();
  });
  it('returns null when a non-neutral note has null weight', () => {
    const s = seedState();
    s.dilemma.choices[0].notes = [{ id: 'b', text: 'x', type: 'advantage', weight: null }];
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ schemaVersion: 1, dilemma: s.dilemma, view: s.view }));
    expect(load()).toBeNull();
  });
});

describe('debounce (P2/P3)', () => {
  it('coalesces rapid scheduleSave calls into a single write', () => {
    vi.useFakeTimers();
    const setItem = vi.spyOn(Storage.prototype, 'setItem');
    const s = seedState();
    scheduleSave(s);
    scheduleSave(s);
    scheduleSave(s);
    expect(setItem).not.toHaveBeenCalled();
    vi.advanceTimersByTime(400);
    expect(setItem).toHaveBeenCalledTimes(1);
    setItem.mockRestore();
  });

  it('flushSave writes through a pending debounce and fires onSaved', () => {
    vi.useFakeTimers();
    const onSaved = vi.fn();
    const s = seedState();
    scheduleSave(s);
    flushSave(s, onSaved);
    expect(onSaved).toHaveBeenCalledTimes(1);
    expect(load()).not.toBeNull();
    // The earlier pending debounce must not fire a second write.
    const setItem = vi.spyOn(Storage.prototype, 'setItem');
    vi.advanceTimersByTime(400);
    expect(setItem).not.toHaveBeenCalled();
    setItem.mockRestore();
  });
});
