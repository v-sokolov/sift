import type { AppState, Direction, Lang, SortKey, Theme, ViewMode } from '../types';
import { LANGS, MAX_CHOICES } from '../types';
import { t } from '../i18n';

const THEME_KEY: Record<Theme, string> = {
  system: 'theme.system',
  light: 'theme.light',
  dark: 'theme.dark',
};

const LANG_LABEL: Record<Lang, string> = { en: 'EN', uk: 'UA' };

// EN/UA toggle. Active language marked by weight + underline, not colour alone
// (Constitution V).
function langToggle(lang: Lang): string {
  const buttons = LANGS.map(
    (l) =>
      `<button
        data-action="set-lang"
        data-lang="${l}"
        class="langbtn${l === lang ? ' is-active' : ''}"
        aria-pressed="${l === lang}"
      >${LANG_LABEL[l]}</button>`,
  ).join('');
  return `<div class="seg langtoggle" role="group" aria-label="${t(lang, 'header.langAria')}">${buttons}</div>`;
}

function dirSeg(direction: Direction, lang: Lang): string {
  return `<span class="count">${t(lang, 'toolbar.direction')}</span>
    <div class="seg" role="group" aria-label="${t(lang, 'toolbar.directionAria')}">
      <button data-action="set-direction" data-dir="asc" aria-pressed="${direction === 'asc'}">${t(lang, 'toolbar.asc')}</button>
      <button data-action="set-direction" data-dir="desc" aria-pressed="${direction === 'desc'}">${t(lang, 'toolbar.desc')}</button>
    </div>`;
}

function configRow(mode: ViewMode, sortKey: SortKey, direction: Direction, lang: Lang): string {
  if (mode === 'grouped') {
    return `<div class="toolbar__row">${dirSeg(direction, lang)}</div>`;
  }
  // sorted
  const keySeg = `<span class="count">${t(lang, 'toolbar.by')}</span>
    <div class="seg" role="group" aria-label="${t(lang, 'toolbar.sortKeyAria')}">
      <button data-action="set-sortkey" data-key="weight" aria-pressed="${sortKey === 'weight'}">${t(lang, 'toolbar.weight')}</button>
      <button data-action="set-sortkey" data-key="type" aria-pressed="${sortKey === 'type'}">${t(lang, 'toolbar.type')}</button>
    </div>`;
  return `<div class="toolbar__row">${keySeg}${dirSeg(direction, lang)}</div>`;
}

export function renderToolbar(state: AppState): string {
  const lang = state.view.lang;
  const n = state.dilemma.choices.length;
  const atMax = n >= MAX_CHOICES;
  const { mode, sortKey, direction, theme } = state.view;
  const showConfig = mode === 'grouped' || mode === 'sorted';
  const saved = state.lastSavedAt ? t(lang, 'toolbar.saved') : '';

  return `<div class="toolbar">
    <div class="toolbar__row">
      <button
        class="btn btn--primary"
        data-action="add-choice"
        ${atMax ? `disabled title="${t(lang, 'toolbar.maxChoices')}"` : ''}
      >${t(lang, 'toolbar.addChoice')}</button>
      <span class="count">${n} / ${MAX_CHOICES}</span>
      <button class="btn toggle" data-action="toggle-group" aria-pressed="${mode === 'grouped'}">${t(lang, 'toolbar.group')}</button>
      <button class="btn toggle" data-action="toggle-sort" aria-pressed="${mode === 'sorted'}">${t(lang, 'toolbar.sort')}</button>
      <span class="toolbar__spacer"></span>
      <span class="saved" aria-live="polite">${saved}</span>
      ${langToggle(lang)}
      <button class="btn" data-action="cycle-theme" title="${t(lang, 'toolbar.themeTitle')}">${t(lang, THEME_KEY[theme])}</button>
      <button class="btn" data-action="clear">${t(lang, 'toolbar.clear')}</button>
    </div>
    ${showConfig ? configRow(mode, sortKey, direction, lang) : ''}
  </div>`;
}
