<script lang="ts">
  import type { NoteType, Weight } from '../types';
  import {
    closeForm,
    getState,
    setFormChoice,
    setFormText,
    setFormType,
    setFormWeight,
    submitForm,
  } from '../store.svelte';
  import { t } from '../i18n';
  import { autofocus } from '../actions';

  let s = $derived(getState());
  let lang = $derived(s.view.lang);
  let editing = $derived(s.editing);
  let draft = $derived(s.draft);
  let isEdit = $derived(editing?.kind === 'edit');

  const TYPE_KEY: Record<NoteType, string> = {
    advantage: 'form.typeAdvantage',
    disadvantage: 'form.typeDisadvantage',
    neutral: 'form.typeNeutral',
  };
  const TYPES: NoteType[] = ['advantage', 'disadvantage', 'neutral'];
  const WEIGHTS: Weight[] = [1, 2, 3];

  function dots(w: number): string {
    return '●'.repeat(w);
  }
  function onsubmit(e: SubmitEvent) {
    e.preventDefault();
    submitForm();
  }
</script>

<!-- 022: the Add-point trigger lives in the Toolbar's add row now; this component
     renders only the open add/edit form (still placed below the cards grid). -->
{#if editing && draft}
  <form class="form" data-action="form" novalidate {onsubmit}>
    <div class="form__row">
      <label
        >{t(lang, 'form.choice')}
        <select
          data-action="form-choice"
          disabled={isEdit}
          value={editing.choiceId}
          onchange={(e) => setFormChoice(e.currentTarget.value)}
        >
          {#each s.dilemma.choices as c, i (c.id)}
            <option value={c.id}
              >{c.title || t(lang, 'choice.placeholder', { n: String(i + 1) })}</option
            >
          {/each}
        </select>
      </label>
      <div class="seg" role="group" aria-label={t(lang, 'form.noteTypeAria')}>
        {#each TYPES as tp}
          <button
            type="button"
            data-action="form-type"
            data-type={tp}
            aria-pressed={draft.type === tp}
            onclick={() => setFormType(tp)}>{t(lang, TYPE_KEY[tp])}</button
          >
        {/each}
      </div>
      <div class="seg" role="group" aria-label={t(lang, 'form.weightAria')}>
        {#each WEIGHTS as w}
          <button
            type="button"
            data-action="form-weight"
            data-weight={w}
            aria-pressed={draft.weight === w}
            disabled={draft.type === 'neutral'}
            aria-label={t(lang, 'form.weightN', { n: String(w) })}
            onclick={() => setFormWeight(w)}>{dots(w)}</button
          >
        {/each}
      </div>
    </div>
    <div class="form__row">
      <textarea
        use:autofocus
        data-field="note-text"
        data-action="form-text"
        placeholder={t(lang, 'form.textPlaceholder')}
        aria-label={t(lang, 'form.textAria')}
        value={draft.text}
        oninput={(e) => setFormText(e.currentTarget.value)}
      ></textarea>
    </div>
    <div class="form__row form__row--actions">
      <button type="button" class="btn" data-action="form-cancel" onclick={closeForm}
        >{t(lang, 'form.cancel')}</button
      >
      <button type="submit" class="btn btn--primary" data-action="form-submit"
        >{isEdit ? t(lang, 'form.save') : t(lang, 'form.add')}</button
      >
    </div>
  </form>
{/if}
