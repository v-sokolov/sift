import type { AppState, Choice, NoteType } from '../types';
import { MIN_CHOICES } from '../types';
import { arrange } from '../view';
import { renderNote } from './note';
import { esc } from './util';

const GROUP_LABEL: Record<NoteType, string> = {
  advantage: 'Advantages',
  disadvantage: 'Disadvantages',
  neutral: 'Neutral',
};

// One choice card: editable title, remove control, and notes per the active view.
export function renderChoice(choice: Choice, index: number, state: AppState): string {
  const placeholder = `Choice ${index + 1}`;
  const canRemove = state.dilemma.choices.length > MIN_CHOICES;

  let notesHtml: string;
  if (choice.notes.length === 0) {
    notesHtml = `<div class="empty">No notes yet</div>`;
  } else {
    notesHtml = arrange(choice, state.view)
      .map((section) => {
        if (section.label && section.notes.length === 0) return ''; // hide empty group
        const label = section.label
          ? `<div class="group-label">${GROUP_LABEL[section.label]}</div>`
          : '';
        const items = section.notes.map(renderNote).join('');
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
        placeholder="${placeholder}"
        aria-label="Choice name"
      />
      <button
        class="iconbtn"
        data-action="remove-choice"
        title="${canRemove ? 'Remove choice' : 'At least 2 choices'}"
        aria-label="Remove choice"
        ${canRemove ? '' : 'disabled'}
      >✕</button>
    </div>
    ${notesHtml}
  </article>`;
}
