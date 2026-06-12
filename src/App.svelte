<script lang="ts">
  import { flip } from 'svelte/animate';
  import { closeForm, getState } from './store.svelte';
  import { SHOW_SUMMARY } from './config';
  import { orderedChoices } from './view';
  import { applyTheme } from './theme';
  import Header from './components/Header.svelte';
  import Toolbar from './components/Toolbar.svelte';
  import ChoiceCard from './components/ChoiceCard.svelte';
  import Summary from './components/Summary.svelte';
  import AddEditForm from './components/AddEditForm.svelte';
  import Footer from './components/Footer.svelte';
  import SuggestDialog from './components/SuggestDialog.svelte';

  let s = $derived(getState());
  // 018: display Choice cards in Rank order (display-only). The placeholder index passed to
  // each card stays the *stored* index so untitled "Choice N" labels don't renumber on sort.
  let ordered = $derived(orderedChoices(s.dilemma.choices, s.view.rankByTotal));

  // Reorder animation, gated on reduced-motion (FR-008); jsdom has no matchMedia.
  const prefersReduced =
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const flipMs = prefersReduced ? 0 : 200;

  // Keep <html data-theme> in sync with the chosen theme.
  $effect(() => {
    applyTheme(getState().view.theme);
  });

  // The suggest dialog's Esc / focus-trap / focus-return / scroll-lock are owned by Bits UI
  // (012). This handler only closes the note form on Esc (the dialog sits above it and handles
  // its own Esc while open).
  function onkeydown(e: KeyboardEvent) {
    if (e.key === 'Escape' && !getState().suggest.open && getState().editing) {
      closeForm();
    }
  }
</script>

<svelte:window {onkeydown} />

<Header />
<Toolbar />
<section class="choices" style="--choice-count:{s.dilemma.choices.length}">
  {#each ordered as choice (choice.id)}
    <div class="choice-cell" animate:flip={{ duration: flipMs }}>
      <ChoiceCard {choice} index={s.dilemma.choices.indexOf(choice)} />
    </div>
  {/each}
</section>
<AddEditForm />
{#if SHOW_SUMMARY}
  <!-- Hidden since 020 (FR-011 superseded): card footers carry the scores. -->
  <Summary />
{/if}
<Footer />
<SuggestDialog />
