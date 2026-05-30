<script lang="ts">
  import type { Choice, NoteType } from '../types';
  import { MIN_CHOICES } from '../types';
  import { arrange } from '../view';
  import { getState, removeChoice, renameChoice } from '../store.svelte';
  import { t } from '../i18n';
  import NoteRow from './NoteRow.svelte';

  let { choice, index }: { choice: Choice; index: number } = $props();

  let s = $derived(getState());
  let lang = $derived(s.view.lang);
  let placeholder = $derived(t(lang, 'choice.placeholder', { n: String(index + 1) }));
  let canRemove = $derived(s.dilemma.choices.length > MIN_CHOICES);
  let sections = $derived(arrange(choice, s.view));

  const GROUP_KEY: Record<NoteType, string> = {
    advantage: 'group.advantage',
    disadvantage: 'group.disadvantage',
    neutral: 'group.neutral',
  };
</script>

<article class="choice" data-choice-id={choice.id}>
  <div class="choice__head">
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
      onclick={() => removeChoice(choice.id)}>✕</button
    >
  </div>

  {#if choice.notes.length === 0}
    <div class="empty">{t(lang, 'choice.empty')}</div>
  {:else}
    {#each sections as section}
      {#if !(section.label && section.notes.length === 0)}
        {#if section.label}
          <div class="group-label">{t(lang, GROUP_KEY[section.label])}</div>
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
