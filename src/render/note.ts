import type { Lang, Note } from '../types';
import { dots, esc } from './util';
import { t } from '../i18n';

const SIGN: Record<Note['type'], string> = {
  advantage: '+',
  disadvantage: '−',
  neutral: '~',
};

// A note row: sign + color + weight dots + text (FR-012). Weight is conveyed by
// dot count AND color, never color alone (FR-031). Clickable/keyboard to edit.
export function renderNote(note: Note, lang: Lang): string {
  const dotsHtml = note.weight
    ? `<span class="dots" aria-hidden="true">${dots(note.weight)}</span>`
    : '';
  const weightLabel = note.weight ? t(lang, 'note.weightLabel', { n: String(note.weight) }) : '';
  const text = note.text.trim()
    ? esc(note.text)
    : `<span class="note__text--empty">${t(lang, 'note.empty')}</span>`;
  const typeWord = t(lang, `noteType.${note.type}`);
  const ariaText = esc(note.text || t(lang, 'note.emptyShort'));
  return `<li
      class="note note--${note.type}"
      data-action="edit-note"
      data-note-id="${note.id}"
      role="button"
      tabindex="0"
      aria-label="${t(lang, 'note.editAria', { type: typeWord, weight: weightLabel, text: ariaText })}"
    >
    <span class="note__sign" aria-hidden="true">${SIGN[note.type]}</span>
    ${dotsHtml}
    <span class="note__text">${text}</span>
  </li>`;
}
