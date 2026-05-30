import type { AppState, Direction, SortKey, Theme, ViewMode } from '../types';
import { MAX_CHOICES } from '../types';

const THEME_ICON: Record<Theme, string> = {
  system: '◐ Auto',
  light: '☀ Light',
  dark: '☾ Dark',
};

function dirSeg(direction: Direction): string {
  return `<span class="count">Direction:</span>
    <div class="seg" role="group" aria-label="Direction">
      <button data-action="set-direction" data-dir="asc" aria-pressed="${direction === 'asc'}">Asc</button>
      <button data-action="set-direction" data-dir="desc" aria-pressed="${direction === 'desc'}">Desc</button>
    </div>`;
}

function configRow(mode: ViewMode, sortKey: SortKey, direction: Direction): string {
  if (mode === 'grouped') {
    return `<div class="toolbar__row">${dirSeg(direction)}</div>`;
  }
  // sorted
  const keySeg = `<span class="count">By:</span>
    <div class="seg" role="group" aria-label="Sort key">
      <button data-action="set-sortkey" data-key="weight" aria-pressed="${sortKey === 'weight'}">Weight</button>
      <button data-action="set-sortkey" data-key="type" aria-pressed="${sortKey === 'type'}">Type</button>
    </div>`;
  return `<div class="toolbar__row">${keySeg}${dirSeg(direction)}</div>`;
}

export function renderToolbar(state: AppState): string {
  const n = state.dilemma.choices.length;
  const atMax = n >= MAX_CHOICES;
  const { mode, sortKey, direction, theme } = state.view;
  const showConfig = mode === 'grouped' || mode === 'sorted';
  const saved = state.lastSavedAt ? 'Saved' : '';

  return `<div class="toolbar">
    <div class="toolbar__row">
      <button
        class="btn btn--primary"
        data-action="add-choice"
        ${atMax ? 'disabled title="Maximum 4 choices"' : ''}
      >＋ Add choice</button>
      <span class="count">${n} / ${MAX_CHOICES}</span>
      <button class="btn toggle" data-action="toggle-group" aria-pressed="${mode === 'grouped'}">Group</button>
      <button class="btn toggle" data-action="toggle-sort" aria-pressed="${mode === 'sorted'}">Sort</button>
      <span class="toolbar__spacer"></span>
      <span class="saved" aria-live="polite">${saved}</span>
      <button class="btn" data-action="cycle-theme" title="Theme">${THEME_ICON[theme]}</button>
      <button class="btn" data-action="clear">Clear</button>
    </div>
    ${showConfig ? configRow(mode, sortKey, direction) : ''}
  </div>`;
}
