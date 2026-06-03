<script lang="ts">
  import type { Choice, NoteType, Weight } from '../types';
  import { MIN_CHOICES } from '../types';
  import { arrange } from '../view';
  import { getState, removeChoice, renameChoice } from '../store.svelte';
  import { t } from '../i18n';
  import NoteRow from './NoteRow.svelte';
  import ConfirmDialog from './ConfirmDialog.svelte';

  let { choice, index }: { choice: Choice; index: number } = $props();

  let s = $derived(getState());
  let lang = $derived(s.view.lang);
  let placeholder = $derived(t(lang, 'choice.placeholder', { n: String(index + 1) }));
  let canRemove = $derived(s.dilemma.choices.length > MIN_CHOICES);
  let sections = $derived(arrange(choice, s.view));

  // 016: removing a choice that holds points asks first (the count is read at click
  // time); an empty choice keeps the instant one-click removal. The store mutation is
  // untouched — declining simply never calls it (contract B1–B3).
  let confirming = $state(false);
  function onRemoveClick() {
    if (choice.notes.length > 0) {
      confirming = true;
    } else {
      removeChoice(choice.id);
    }
  }

  const GROUP_KEY: Record<NoteType, string> = {
    advantage: 'group.advantage',
    disadvantage: 'group.disadvantage',
    neutral: 'group.neutral',
  };

  // A section label is a NoteType (group-by-type), a Weight number or 'weightless'
  // (group-by-weight), or null (flat). Render the right localized heading (008).
  type SectionLabel = NoteType | Weight | 'weightless' | null;
  function heading(label: SectionLabel): string {
    if (label === null) return '';
    if (label === 'weightless') return t(lang, 'group.weightless');
    if (typeof label === 'number') return t(lang, 'group.weight', { n: String(label) });
    return t(lang, GROUP_KEY[label]);
  }
</script>

<article class="choice" data-choice-id={choice.id}>
  <div class="choice__head">
    <span class="choice__edit" aria-hidden="true">✎</span>
    <input
      class="choice__title"
      data-field="choice-title-{choice.id}"
      type="text"
      value={choice.title}
      oninput={(e) => renameChoice(choice.id, e.currentTarget.value)}
      {placeholder}
      aria-label={t(lang, 'choice.nameAria')}
    />
    <button
      class="iconbtn"
      data-action="remove-choice"
      title={canRemove ? t(lang, 'choice.remove') : t(lang, 'choice.removeDisabled')}
      aria-label={t(lang, 'choice.removeAria')}
      disabled={!canRemove}
      onclick={onRemoveClick}>✕</button
    >
  </div>

  <ConfirmDialog
    open={confirming}
    message={t(lang, 'confirm.removeChoice', { name: choice.title || placeholder })}
    confirmLabel={t(lang, 'confirm.removeAction')}
    onConfirm={() => {
      confirming = false;
      removeChoice(choice.id);
    }}
    onCancel={() => (confirming = false)}
  />

  {#if choice.notes.length === 0}
    <div class="empty">{t(lang, 'choice.empty')}</div>
  {:else}
    {#each sections as section}
      {#if !(section.label && section.notes.length === 0)}
        {#if section.label !== null}
          <div class="group-label">{heading(section.label)}</div>
        {/if}
        <ul class="notes">
          {#each section.notes as nt (nt.id)}
            <NoteRow note={nt} choiceId={choice.id} {lang} />
          {/each}
        </ul>
      {/if}
    {/each}
  {/if}
</article>
