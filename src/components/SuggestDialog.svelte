<script lang="ts">
  import type { SuggestionDraft } from '../types';
  import { canSend, closeSuggest, getState, setSuggestField } from '../store.svelte';
  import { buildMailto } from '../mailto';
  import { CONTACT_EMAIL, LINKEDIN_URL } from '../config';
  import { t } from '../i18n';

  let s = $derived(getState());
  let lang = $derived(s.view.lang);
  let draft = $derived(s.suggest.draft);
  let sendDisabled = $derived(!canSend(draft));

  // Split the localized fallback around its {link} token so the LinkedIn anchor is
  // a real element (the maintainer email is never rendered — invariant I-S2).
  let fbParts = $derived(t(lang, 'suggest.fallback').split('{link}'));

  let modalEl: HTMLElement | undefined = $state();

  // Move focus into the dialog when it opens (FR-008).
  $effect(() => {
    modalEl?.querySelector<HTMLElement>('[data-field="suggest-name"]')?.focus();
  });

  // Lock background scroll while the modal is open; restore on close. This component only
  // mounts while the modal is open, so the effect cleanup runs on close. (006 UI refinement.)
  $effect(() => {
    const root = document.documentElement;
    const prev = root.style.overflow;
    root.style.overflow = 'hidden';
    return () => {
      root.style.overflow = prev;
    };
  });

  const FIELDS: Array<{
    key: keyof SuggestionDraft;
    labelKey: string;
    phKey: string;
    kind: 'input' | 'textarea';
  }> = [
    { key: 'name', labelKey: 'suggest.name', phKey: 'suggest.namePlaceholder', kind: 'input' },
    {
      key: 'description',
      labelKey: 'suggest.description',
      phKey: 'suggest.descriptionPlaceholder',
      kind: 'textarea',
    },
    { key: 'email', labelKey: 'suggest.email', phKey: 'suggest.emailPlaceholder', kind: 'input' },
    { key: 'github', labelKey: 'suggest.github', phKey: 'suggest.github', kind: 'input' },
    { key: 'linkedin', labelKey: 'suggest.linkedin', phKey: 'suggest.linkedin', kind: 'input' },
  ];

  function send(e: SubmitEvent) {
    e.preventDefault();
    const d = getState().suggest.draft;
    if (!canSend(d)) return;
    // Hand off via a transient anchor so the page itself never navigates.
    const a = document.createElement('a');
    a.href = buildMailto(d, CONTACT_EMAIL);
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    a.remove();
    closeSuggest();
  }

  function backdrop(e: MouseEvent) {
    if (e.target === e.currentTarget) closeSuggest();
  }
</script>

<!-- Overlay backdrop closes on click; Esc + focus-trap handled in App (FR-008). The
     backdrop is presentational — the dialog inside carries the interactive semantics. -->
<!-- svelte-ignore a11y_click_events_have_key_events -->
<div class="modal-overlay" role="presentation" data-action="suggest-backdrop" onclick={backdrop}>
  <div bind:this={modalEl} class="modal" role="dialog" aria-modal="true" aria-labelledby="suggest-title" data-region="suggest">
    <button class="modal__close" data-action="close-suggest" aria-label={t(lang, 'suggest.close')} onclick={closeSuggest}>✕</button>
    <h2 id="suggest-title" class="modal__title">{t(lang, 'suggest.title')}</h2>
    <p class="modal__intro">{t(lang, 'suggest.intro')}</p>
    <form data-action="suggest-form" novalidate onsubmit={send}>
      {#each FIELDS as f (f.key)}
        <label class="modal__field"
          >{t(lang, f.labelKey)}
          {#if f.kind === 'textarea'}
            <textarea
              data-field="suggest-{f.key}"
              data-action="suggest-field"
              data-suggest-field={f.key}
              placeholder={t(lang, f.phKey)}
              value={draft[f.key]}
              oninput={(e) => setSuggestField(f.key, e.currentTarget.value)}
            ></textarea>
          {:else}
            <input
              type="text"
              data-field="suggest-{f.key}"
              data-action="suggest-field"
              data-suggest-field={f.key}
              placeholder={t(lang, f.phKey)}
              value={draft[f.key]}
              oninput={(e) => setSuggestField(f.key, e.currentTarget.value)}
            />
          {/if}
        </label>
      {/each}
      <div class="modal__actions">
        <button type="button" class="btn btn--half" data-action="close-suggest" onclick={closeSuggest}
          >{t(lang, 'suggest.cancel')}</button
        >
        <button type="submit" class="btn btn--primary btn--half" data-action="suggest-send" disabled={sendDisabled}
          >{t(lang, 'suggest.send')}</button
        >
      </div>
    </form>
    <p class="modal__fallback">
      {fbParts[0]}<a class="footer__link" href={LINKEDIN_URL} target="_blank" rel="noopener noreferrer"
        >{t(lang, 'suggest.fallbackLink')}</a
      >{fbParts[1] ?? ''}
    </p>
  </div>
</div>
