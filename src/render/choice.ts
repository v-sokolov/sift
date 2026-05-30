import type { AppState, Choice, NoteType } from '../types';
import { MIN_CHOICES } from '../types';
import { arrange } from '../view';
import { renderNote } from './note';
import { esc } from './util';
import { t } from '../i18n';

const GROUP_KEY: Record<NoteType, string> = {
  advantage: 'group.advantage',
  disadvantage: 'group.disadvantage',
  neutral: 'group.neutral',
};

// One choice card: editable title, remove control, and notes per the active view.
export function renderChoice(choice: Choice, index: number, state: AppState): string {
  const lang = state.view.lang;
  const placeholder = t(lang, 'choice.placeholder', { n: String(index + 1) });
  const canRemove = state.dilemma.choices.length > MIN_CHOICES;

  let notesHtml: string;
  if (choice.notes.length === 0) {
    notesHtml = `<div class="empty">${t(lang, 'choice.empty')}</div>`;
  } else {
    notesHtml = arrange(choice, state.view)
      .map((section) => {
        if (section.label && section.notes.length === 0) return ''; // hide empty group
        const label = section.label
          ? `<div class="group-label">${t(lang, GROUP_KEY[section.label])}</div>`
          : '';
        const items = section.notes.map((nt) => renderNote(nt, lang)).join('');
        return `${label}<ul class="notes">${items}</ul>`;
      })
      .join('');
  }

  return `<article class="choice" data-choice-id="${choice.id}">
    <div class="choice__head">
      <input
        class="choice__title"
        data-field="choice-title-${choice.id}"
        data-action="rename-choice"
        type="text"
        value="${esc(choice.title)}"
        placeholder="${esc(placeholder)}"
        aria-label="${t(lang, 'choice.nameAria')}"
      />
      <button
        class="iconbtn"
        data-action="remove-choice"
        title="${canRemove ? t(lang, 'choice.remove') : t(lang, 'choice.removeDisabled')}"
        aria-label="${t(lang, 'choice.removeAria')}"
        ${canRemove ? '' : 'disabled'}
      >✕</button>
    </div>
    ${notesHtml}
  </article>`;
}
