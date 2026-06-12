<script lang="ts">
  import { Accordion } from 'bits-ui';
  import { slide } from 'svelte/transition';
  import type { Choice, NoteType, Weight } from '../types';
  import { MIN_CHOICES } from '../types';
  import { arrange, scoreSign, signed } from '../view';
  import { choiceScore } from '../scoring';
  import { getState, isExpanded, removeChoice, renameChoice, setExpanded } from '../store.svelte';
  import { t } from '../i18n';
  import NoteRow from './NoteRow.svelte';
  import ConfirmDialog from './ConfirmDialog.svelte';
  import { autofocus } from '../actions';

  let { choice, index }: { choice: Choice; index: number } = $props();

  let s = $derived(getState());
  let lang = $derived(s.view.lang);
  let placeholder = $derived(t(lang, 'choice.placeholder', { n: String(index + 1) }));
  let canRemove = $derived(s.dilemma.choices.length > MIN_CHOICES);
  let sections = $derived(arrange(choice, s.view));

  // 020: fold animation, gated like the Summary flip (FR-009). No matchMedia (jsdom)
  // means no real browser — treat as reduced motion so test outros settle instantly.
  const prefersReduced =
    typeof window === 'undefined' || typeof window.matchMedia !== 'function'
      ? true
      : window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const slideMs = prefersReduced ? 0 : 180;

  // 020 rev. 2 (R9): title editing is component-local — the body's Rename button is the
  // only entry point (FR-007). prevTitle is the Esc-restore snapshot; the input keeps
  // the live renameChoice-as-you-type semantics, so "commit" just exits edit mode.
  let editingTitle = $state(false);
  let prevTitle = $state('');
  let renameBtn = $state<HTMLButtonElement | null>(null);

  function startRename() {
    prevTitle = choice.title;
    editingTitle = true;
  }
  function commitRename() {
    if (!editingTitle) return;
    editingTitle = false;
    renameBtn?.focus();
  }
  function onTitleKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter') {
      e.preventDefault();
      commitRename();
    } else if (e.key === 'Escape') {
      // Esc must (a) win over the blur it may cause — restore BEFORE exiting — and
      // (b) not reach the App-level Esc handler that closes the points form (H2).
      e.stopPropagation();
      renameChoice(choice.id, prevTitle);
      editingTitle = false;
      renameBtn?.focus();
    }
  }
  // 020 rev. 2 (R10): the whole header row toggles as a pointer convenience (FR-013).
  // The chevron Trigger stays the single accessible toggle button; clicks on it (or any
  // other interactive child) are left to the control itself, and nothing toggles while
  // the title is being edited.
  function onHeadClick(e: MouseEvent) {
    if (editingTitle) return;
    if ((e.target as HTMLElement).closest('button, input, a')) return;
    setExpanded(choice.id, !isExpanded(choice.id));
  }

  // Collapsing by any route while the title input is open commits the typed value
  // (blur-commit, H5): the store already holds it; just leave edit mode.
  function onValueChange(v: string) {
    const open = v === choice.id;
    if (!open && editingTitle) editingTitle = false;
    setExpanded(choice.id, open);
  }

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
  <!-- 020: one Accordion PER CARD (single Item) so cards stay independent (FR-002) and
       the compound component lives entirely inside .choice — the 015 grid and 018 flip
       wrappers never see it. Root/Item render display:contents (CSS) so the existing
       flex-column card layout is untouched. Controlled by the store's ephemeral expand
       record: re-clicking the open trigger yields '' (collapse). -->
  <Accordion.Root
    type="single"
    class="choice__acc"
    value={isExpanded(choice.id) ? choice.id : ''}
    {onValueChange}
  >
    <Accordion.Item value={choice.id} class="choice__acc">
      <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions
           Pointer convenience only (R10): keyboard users toggle via the chevron button,
           so the row carries no role/tabindex — a second tab stop would announce the
           same state twice. -->
      <div class="choice__head" onclick={onHeadClick}>
        {#if editingTitle}
          <input
            class="choice__title"
            data-field="choice-title-{choice.id}"
            type="text"
            use:autofocus
            value={choice.title}
            oninput={(e) => renameChoice(choice.id, e.currentTarget.value)}
            onkeydown={onTitleKeydown}
            onblur={commitRename}
            {placeholder}
            aria-label={t(lang, 'choice.nameAria')}
          />
        {:else}
          <span class="choice__name{choice.title ? '' : ' choice__name--ghost'}"
            >{choice.title || placeholder}</span
          >
        {/if}
        <Accordion.Header level={3} class="choice__disclosure">
          <!-- aria-controls is wired by hand: this bits-ui version emits
               aria-expanded/data-state on the trigger but not the controls link. -->
          <Accordion.Trigger
            class="iconbtn choice__chevron"
            data-action="toggle-choice"
            aria-controls="choice-body-{choice.id}"
            aria-label={t(lang, 'choice.toggleAria')}
          >
            <!-- CaretDown: points down collapsed ("more below"), flips up when open. -->
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M5 9l7 7 7-7"
                stroke="currentColor"
                stroke-width="2.2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </Accordion.Trigger>
        </Accordion.Header>
      </div>

      <!-- forceMount + child snippet: the documented Bits UI route for Svelte
           transitions — the body only exists while open, sliding in/out (R5). -->
      <Accordion.Content forceMount id="choice-body-{choice.id}">
        {#snippet child({ props, open }: { props: Record<string, unknown>; open: boolean })}
          {#if open}
            <div {...props} class="choice__body" transition:slide={{ duration: slideMs }}>
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

              <!-- 020 rev. 2: the card's meta actions live below the points (FR-001) —
                   Rename is the only title-edit entry point (FR-007); Remove keeps the
                   016 confirm semantics behind expansion (FR-014). -->
              <div class="choice__actions">
                <button
                  class="actbtn actbtn--rename"
                  data-action="rename-choice"
                  bind:this={renameBtn}
                  onclick={startRename}
                  ><span class="actbtn__icon" aria-hidden="true">✎</span
                  >{t(lang, 'choice.rename')}</button
                >
                <button
                  class="actbtn actbtn--danger"
                  data-action="remove-choice"
                  title={canRemove ? t(lang, 'choice.remove') : t(lang, 'choice.removeDisabled')}
                  aria-label={t(lang, 'choice.removeAria')}
                  disabled={!canRemove}
                  onclick={onRemoveClick}
                  ><span class="actbtn__icon" aria-hidden="true">✕</span
                  >{t(lang, 'choice.removeLabel')}</button
                >
              </div>
            </div>
          {/if}
        {/snippet}
      </Accordion.Content>
    </Accordion.Item>
  </Accordion.Root>

  <!-- 020 US2: always-visible footer — the Choice's signed total, sign-coloured with
       the same tokens as the summary band (FR-004/FR-005). Text first, colour second.
       The zone mirrors the band's .sum--* treatment (tint + sign top border).
       022 US3: 0-note cards render a faint empty-state label with no sign tint. -->
  {#if choice.notes.length === 0}
    <div class="choice__foot choice__foot--empty">
      <span class="choice__scorelabel">{t(lang, 'choice.empty')}</span>
    </div>
  {:else}
    <div class="choice__foot choice__foot--{scoreSign(choiceScore(choice))}">
      <span class="choice__scorelabel">{t(lang, 'choice.scoreLabel')}</span>
      <span class="choice__score choice__score--{scoreSign(choiceScore(choice))}"
        >{signed(choiceScore(choice))}</span
      >
    </div>
  {/if}

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
</article>
