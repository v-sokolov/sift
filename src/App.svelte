<script lang="ts">
  import { closeForm, getState } from './store.svelte';
  import { applyTheme } from './theme';
  import Header from './components/Header.svelte';
  import Toolbar from './components/Toolbar.svelte';
  import ChoiceCard from './components/ChoiceCard.svelte';
  import Summary from './components/Summary.svelte';
  import AddEditForm from './components/AddEditForm.svelte';
  import Footer from './components/Footer.svelte';
  import SuggestDialog from './components/SuggestDialog.svelte';

  let s = $derived(getState());

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
  {#each s.dilemma.choices as choice, index (choice.id)}
    <ChoiceCard {choice} {index} />
  {/each}
</section>
<AddEditForm />
<Summary />
<Footer />
<SuggestDialog />
