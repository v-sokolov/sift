import type { AppState, NoteType, Weight } from '../types';
import { dots, esc } from './util';

const TYPE_LABEL: Record<NoteType, string> = {
  advantage: '＋ advantage',
  disadvantage: '− disadvantage',
  neutral: '~ neutral',
};

// Unified on-demand add/edit form (FR-009). When hidden, a single trigger shows.
export function renderAddForm(state: AppState): string {
  if (!state.editing || !state.draft) {
    return `<div class="addtrigger">
      <button class="btn" data-action="open-add-form">＋ add note</button>
    </div>`;
  }

  const d = state.draft;
  const isEdit = state.editing.kind === 'edit';

  const choiceOptions = state.dilemma.choices
    .map(
      (c, i) =>
        `<option value="${c.id}"${c.id === state.editing!.choiceId ? ' selected' : ''}>${esc(
          c.title || `Choice ${i + 1}`,
        )}</option>`,
    )
    .join('');

  const typeBtn = (t: NoteType): string =>
    `<button type="button" data-action="form-type" data-type="${t}" aria-pressed="${
      d.type === t
    }">${TYPE_LABEL[t]}</button>`;

  // Weight greys out (does not vanish) when type = neutral (FR-011).
  const weightBtn = (w: Weight): string =>
    `<button type="button" data-action="form-weight" data-weight="${w}" aria-pressed="${
      d.weight === w
    }"${d.type === 'neutral' ? ' disabled' : ''} aria-label="Weight ${w}">${dots(w)}</button>`;

  return `<form class="form" data-action="form" novalidate>
    <div class="form__row">
      <label>Choice
        <select data-action="form-choice"${isEdit ? ' disabled' : ''}>${choiceOptions}</select>
      </label>
      <div class="seg" role="group" aria-label="Note type">
        ${typeBtn('advantage')}${typeBtn('disadvantage')}${typeBtn('neutral')}
      </div>
      <div class="seg" role="group" aria-label="Weight">
        ${weightBtn(1)}${weightBtn(2)}${weightBtn(3)}
      </div>
    </div>
    <div class="form__row">
      <textarea
        data-field="note-text"
        data-action="form-text"
        placeholder="What's the point?"
        aria-label="Note text"
      >${esc(d.text)}</textarea>
    </div>
    <div class="form__row form__row--actions">
      <button type="button" class="btn" data-action="form-cancel">Cancel</button>
      <button type="submit" class="btn btn--primary" data-action="form-submit">${
        isEdit ? 'Save' : 'Add'
      }</button>
    </div>
  </form>`;
}
