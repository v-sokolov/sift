import type { AppState } from '../types';
import { AUTHOR_NAME, GITHUB_URL, LINKEDIN_URL } from '../config';
import { esc } from './util';
import { t } from '../i18n';

// Quiet, localized author footer: the name is plain text, followed by GitHub and
// LinkedIn links (US3). The maintainer email is NEVER shown here (invariant I-S2).
export function renderFooter(state: AppState): string {
  const lang = state.view.lang;

  // `footer.madeBy` carries a `{name}` token — the author name as plain text.
  const sentence = t(lang, 'footer.madeBy', { name: esc(AUTHOR_NAME) });
  const github = `<a class="footer__link" href="${GITHUB_URL}" target="_blank" rel="noopener noreferrer">${t(
    lang,
    'footer.github',
  )}</a>`;
  const linkedin = `<a class="footer__link" href="${LINKEDIN_URL}" target="_blank" rel="noopener noreferrer">${t(
    lang,
    'footer.linkedin',
  )}</a>`;

  return `<footer class="footer">
    <span class="footer__text">${sentence}</span>
    <span class="footer__links">${github} · ${linkedin}</span>
  </footer>`;
}
