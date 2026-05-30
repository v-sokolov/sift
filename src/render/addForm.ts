import type { AppState, NoteType, Weight } from '../types';
import { dots, esc } from './util';
import { t } from '../i18n';

const TYPE_KEY: Record<NoteType, string> = {
  advantage: 'form.typeAdvantage',
  disadvantage: 'form.typeDisadvantage',
  neutral: 'form.typeNeutral',
};

// Unified on-demand add/edit form (FR-009). When hidden, a single trigger shows.
export function renderAddForm(state: AppState): string {
  const lang = state.view.lang;

  if (!state.editing || !state.draft) {
    return `<div class="addtrigger">
      <button class="btn" data-action="open-add-form">${t(lang, 'form.addNote')}</button>
    </div>`;
  }

  const d = state.draft;
  const isEdit = state.editing.kind === 'edit';

  const choiceOptions = state.dilemma.choices
    .map(
      (c, i) =>
        `<option value="${c.id}"${c.id === state.editing!.choiceId ? ' selected' : ''}>${esc(
          c.title || t(lang, 'choice.placeholder', { n: String(i + 1) }),
        )}</option>`,
    )
    .join('');

  const typeBtn = (tp: NoteType): string =>
    `<button type="button" data-action="form-type" data-type="${tp}" aria-pressed="${
      d.type === tp
    }">${t(lang, TYPE_KEY[tp])}</button>`;

  // Weight greys out (does not vanish) when type = neutral (FR-011).
  const weightBtn = (w: Weight): string =>
    `<button type="button" data-action="form-weight" data-weight="${w}" aria-pressed="${
      d.weight === w
    }"${d.type === 'neutral' ? ' disabled' : ''} aria-label="${t(lang, 'form.weightN', {
      n: String(w),
    })}">${dots(w)}</button>`;

  return `<form class="form" data-action="form" novalidate>
    <div class="form__row">
      <label>${t(lang, 'form.choice')}
        <select data-action="form-choice"${isEdit ? ' disabled' : ''}>${choiceOptions}</select>
      </label>
      <div class="seg" role="group" aria-label="${t(lang, 'form.noteTypeAria')}">
        ${typeBtn('advantage')}${typeBtn('disadvantage')}${typeBtn('neutral')}
      </div>
      <div class="seg" role="group" aria-label="${t(lang, 'form.weightAria')}">
        ${weightBtn(1)}${weightBtn(2)}${weightBtn(3)}
      </div>
    </div>
    <div class="form__row">
      <textarea
        data-field="note-text"
        data-action="form-text"
        placeholder="${esc(t(lang, 'form.textPlaceholder'))}"
        aria-label="${t(lang, 'form.textAria')}"
      >${esc(d.text)}</textarea>
    </div>
    <div class="form__row form__row--actions">
      <button type="button" class="btn" data-action="form-cancel">${t(lang, 'form.cancel')}</button>
      <button type="submit" class="btn btn--primary" data-action="form-submit">${
        isEdit ? t(lang, 'form.save') : t(lang, 'form.add')
      }</button>
    </div>
  </form>`;
}
