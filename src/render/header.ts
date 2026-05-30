import type { AppState } from '../types';
import { esc } from './util';
import { t } from '../i18n';

// Editable dilemma title + a quiet Suggest-a-feature link. (The language toggle
// lives in the toolbar, next to the theme picker.)
export function renderHeader(state: AppState): string {
  const lang = state.view.lang;

  return `<header>
    <input
      class="header__title"
      data-field="title"
      data-action="title"
      type="text"
      value="${esc(state.dilemma.title)}"
      placeholder="${esc(t(lang, 'header.titlePlaceholder'))}"
      aria-label="${t(lang, 'header.titleAria')}"
    />
    <div class="header__tools">
      <button class="linklike" data-action="open-suggest">${t(lang, 'suggest.open')}</button>
    </div>
  </header>`;
}
