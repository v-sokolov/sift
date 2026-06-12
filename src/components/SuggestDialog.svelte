<script lang="ts">
  import { Dialog } from 'bits-ui';
  import type { SuggestionDraft } from '../types';
  import { canSend, closeSuggest, getState, setSuggestField } from '../store.svelte';
  import { buildMailto } from '../mailto';
  import { CONTACT_EMAIL, LINKEDIN_URL } from '../config';
  import { t } from '../i18n';

  let s = $derived(getState());
  let lang = $derived(s.view.lang);
  let draft = $derived(s.suggest.draft);
  let sendDisabled = $derived(!canSend(draft));
  let open = $derived(s.suggest.open);

  // Split the localized fallback around its {link} token so the LinkedIn anchor is
  // a real element (the maintainer email is never rendered — invariant I-S2).
  let fbParts = $derived(t(lang, 'suggest.fallback').split('{link}'));

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

  // Move focus to the first field on open instead of Bits UI's default (the close button),
  // preserving the prior behavior (FR-008/FR-004). Focus-return to the trigger on close is
  // handled by the primitive's focus scope.
  function focusFirstField(e: Event) {
    e.preventDefault();
    const el = document.querySelector('[data-field="suggest-name"]');
    if (el instanceof HTMLElement) el.focus();
  }
</script>

<!-- Dialog semantics, focus-trap, Esc, outside-click dismiss, and scroll-lock are provided by
     Bits UI's Dialog (012). Open is controlled by the store; the external Header trigger calls
     openSuggest(). Rendered inline (no Portal) so the dialog stays in the app subtree. -->
<Dialog.Root {open} onOpenChange={(v) => { if (!v) closeSuggest(); }}>
  <Dialog.Overlay class="modal-overlay" data-action="suggest-backdrop" />
  <Dialog.Content
    class="modal"
    data-region="suggest"
    aria-labelledby="suggest-title"
    onOpenAutoFocus={focusFirstField}
  >
    <Dialog.Close class="modal__close" data-action="close-suggest" aria-label={t(lang, 'suggest.close')}
      >✕</Dialog.Close
    >
    <Dialog.Title id="suggest-title" class="modal__title">{t(lang, 'suggest.title')}</Dialog.Title>
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
        <button type="submit" class="btn btn--warm btn--half" data-action="suggest-send" disabled={sendDisabled}
          >{t(lang, 'suggest.send')}</button
        >
      </div>
    </form>
    <p class="modal__fallback">
      {fbParts[0]}<a class="footer__link" href={LINKEDIN_URL} target="_blank" rel="noopener noreferrer"
        >{t(lang, 'suggest.fallbackLink')}</a
      >{fbParts[1] ?? ''}
    </p>
  </Dialog.Content>
</Dialog.Root>
