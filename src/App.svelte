<script lang="ts">
  import { closeForm, closeSuggest, getState } from './store.svelte';
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

  // Return focus to the Suggest trigger when the modal closes (FR-008).
  let prevSuggestOpen = false;
  $effect(() => {
    const open = getState().suggest.open;
    if (!open && prevSuggestOpen) {
      document.querySelector<HTMLElement>('[data-action="open-suggest"]')?.focus();
    }
    prevSuggestOpen = open;
  });

  function onkeydown(e: KeyboardEvent) {
    // Esc closes the suggest modal first (it sits above the note form), then the form.
    if (e.key === 'Escape') {
      if (getState().suggest.open) {
        closeSuggest();
        return;
      }
      if (getState().editing) {
        closeForm();
        return;
      }
    }
    // Focus trap within the open suggest modal (FR-008).
    if (e.key === 'Tab' && getState().suggest.open) {
      const modal = document.querySelector<HTMLElement>('.modal');
      if (!modal) return;
      const focusables = Array.from(
        modal.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      );
      if (!focusables.length) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const active = document.activeElement;
      if (e.shiftKey && active === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      }
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
{#if s.suggest.open}
  <SuggestDialog />
{/if}
