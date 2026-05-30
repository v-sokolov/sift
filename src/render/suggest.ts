import type { AppState } from '../types';
import { LINKEDIN_URL } from '../config';
import { canSend } from '../state';
import { esc } from './util';
import { t } from '../i18n';

// Suggest-a-feature modal (US2). Rendered only when open. A custom accessible
// overlay (role=dialog, aria-modal) rather than native <dialog>.showModal(), which
// jsdom does not implement and which conflicts with the full-re-render pipeline.
// Esc / focus-trap / focus-return are handled in main.ts. Fields carry data-field
// so caret/focus survive re-render; the maintainer email is never rendered (I-S2).
export function renderSuggest(state: AppState): string {
  const { suggest } = state;
  if (!suggest.open) return '';

  const lang = state.view.lang;
  const d = suggest.draft;
  const sendDisabled = canSend(d) ? '' : ' disabled';
  const fallbackLink = `<a class="footer__link" href="${LINKEDIN_URL}" target="_blank" rel="noopener noreferrer">${t(
    lang,
    'suggest.fallbackLink',
  )}</a>`;

  const field = (key: string, labelKey: string, phKey: string, kind: 'input' | 'textarea') => {
    const label = t(lang, labelKey);
    const ph = esc(t(lang, phKey));
    const common = `data-field="suggest-${key}" data-action="suggest-field" data-suggest-field="${key}" placeholder="${ph}"`;
    const control =
      kind === 'textarea'
        ? `<textarea ${common}>${esc((d as unknown as Record<string, string>)[key])}</textarea>`
        : `<input type="text" ${common} value="${esc((d as unknown as Record<string, string>)[key])}" />`;
    return `<label class="modal__field">${label}${control}</label>`;
  };

  return `<div class="modal-overlay" data-action="suggest-backdrop">
    <div
      class="modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="suggest-title"
      data-region="suggest"
    >
      <button class="modal__close" data-action="close-suggest" aria-label="${t(lang, 'suggest.close')}">✕</button>
      <h2 id="suggest-title" class="modal__title">${t(lang, 'suggest.title')}</h2>
      <p class="modal__intro">${t(lang, 'suggest.intro')}</p>
      <form data-action="suggest-form" novalidate>
        ${field('name', 'suggest.name', 'suggest.namePlaceholder', 'input')}
        ${field('description', 'suggest.description', 'suggest.descriptionPlaceholder', 'textarea')}
        ${field('email', 'suggest.email', 'suggest.emailPlaceholder', 'input')}
        ${field('github', 'suggest.github', 'suggest.github', 'input')}
        ${field('linkedin', 'suggest.linkedin', 'suggest.linkedin', 'input')}
        <div class="modal__actions">
          <button type="button" class="btn" data-action="close-suggest">${t(lang, 'suggest.cancel')}</button>
          <button type="submit" class="btn btn--primary" data-action="suggest-send"${sendDisabled}>${t(lang, 'suggest.send')}</button>
        </div>
      </form>
      <p class="modal__fallback">${t(lang, 'suggest.fallback', { link: fallbackLink })}</p>
    </div>
  </div>`;
}
