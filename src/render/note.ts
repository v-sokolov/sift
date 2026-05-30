import type { Note } from '../types';
import { dots, esc } from './util';

const SIGN: Record<Note['type'], string> = {
  advantage: '+',
  disadvantage: '−',
  neutral: '~',
};

// A note row: sign + color + weight dots + text (FR-012). Weight is conveyed by
// dot count AND color, never color alone (FR-031). Clickable/keyboard to edit.
export function renderNote(note: Note): string {
  const dotsHtml = note.weight
    ? `<span class="dots" aria-hidden="true">${dots(note.weight)}</span>`
    : '';
  const weightLabel = note.weight ? `, weight ${note.weight}` : '';
  const text = note.text.trim()
    ? esc(note.text)
    : `<span class="note__text--empty">(empty note)</span>`;
  return `<li
      class="note note--${note.type}"
      data-action="edit-note"
      data-note-id="${note.id}"
      role="button"
      tabindex="0"
      aria-label="Edit ${note.type}${weightLabel}: ${esc(note.text || '(empty)')}"
    >
    <span class="note__sign" aria-hidden="true">${SIGN[note.type]}</span>
    ${dotsHtml}
    <span class="note__text">${text}</span>
  </li>`;
}
