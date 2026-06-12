<script lang="ts">
  import type { Lang, Note } from '../types';
  import { t } from '../i18n';
  import { openEditForm, removeNote } from '../store.svelte';

  let { note, choiceId, lang }: { note: Note; choiceId: string; lang: Lang } = $props();

  const SIGN: Record<Note['type'], string> = {
    advantage: '+',
    disadvantage: '−',
    neutral: '~',
  };

  let dotsStr = $derived(note.weight ? '●'.repeat(note.weight) : '');
  let typeWord = $derived(t(lang, `noteType.${note.type}`));
  let weightLabel = $derived(
    note.weight ? t(lang, 'note.weightLabel', { n: String(note.weight) }) : '',
  );
  let ariaText = $derived(note.text || t(lang, 'note.emptyShort'));

  function edit() {
    openEditForm(choiceId, note.id);
  }
  function onkeydown(e: KeyboardEvent) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      edit();
    }
  }

  // Remove the point. stopPropagation keeps the row's click-to-edit from also firing
  // (FR-010); the keydown handler activates the button itself and preventDefault stops
  // the native click so removal happens exactly once (FR-008).
  function remove(e: MouseEvent) {
    e.stopPropagation();
    removeNote(choiceId, note.id);
  }
  function onRemoveKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      e.stopPropagation();
      removeNote(choiceId, note.id);
    }
  }
</script>

<!-- A note row is a click/keyboard target to edit; role=button + tabindex + keydown
     give it button semantics on a list item (US3 revisits a11y formally). -->
<!-- svelte-ignore a11y_no_noninteractive_element_to_interactive_role -->
<li
  class="note note--{note.type}"
  data-action="edit-note"
  data-note-id={note.id}
  role="button"
  tabindex="0"
  aria-label={t(lang, 'note.editAria', { type: typeWord, weight: weightLabel, text: ariaText })}
  onclick={edit}
  {onkeydown}
>
  <span class="note__main">
    <span class="note__sign" aria-hidden="true">{SIGN[note.type]}</span>
    <span class="note__text"
      >{#if note.text.trim()}{note.text}{:else}<span class="note__text--empty"
          >{t(lang, 'note.empty')}</span
        >{/if}</span
    >
  </span>
  <span class="note__meta">
    {#if dotsStr}<span class="dots" aria-hidden="true">{dotsStr}</span>{/if}
    <button
      class="iconbtn note__remove"
      data-action="remove-note"
      data-note-id={note.id}
      aria-label={t(lang, 'note.removeAria')}
      title={t(lang, 'note.removeAria')}
      onclick={remove}
      onkeydown={onRemoveKeydown}>✕</button
    >
  </span>
</li>
