<script lang="ts">
  import { Dialog } from 'bits-ui';
  import { getState } from '../store.svelte';
  import { t } from '../i18n';

  let {
    open,
    message,
    confirmLabel,
    onConfirm,
    onCancel,
  }: {
    open: boolean;
    message: string;
    confirmLabel: string;
    onConfirm: () => void;
    onCancel: () => void;
  } = $props();

  let lang = $derived(getState().view.lang);
</script>

<!-- 016: shared destructive-action confirmation (choice removal + board Clear). Dialog
     semantics, focus-trap, Esc-decline, outside-click dismiss, scroll-lock, and
     focus-return are provided by Bits UI's Dialog (012 pattern) — none are hand-rolled.
     Rendered inline (no Portal) so it stays in the app subtree; placement comes from the
     014 .modal/.modal-overlay rules plus the narrow .modal--confirm modifier. The message
     renders inside Dialog.Title: for a one-sentence dialog the message IS the accessible
     name (contract D3). Esc and outside-click arrive as onOpenChange(false) → onCancel. -->
<Dialog.Root {open} onOpenChange={(v) => { if (!v) onCancel(); }}>
  <Dialog.Overlay class="modal-overlay" data-action="confirm-dialog-backdrop" />
  <Dialog.Content class="modal modal--confirm" data-region="confirm-dialog">
    <Dialog.Title class="modal__title">{message}</Dialog.Title>
    <div class="modal__actions">
      <button type="button" class="btn btn--half" data-action="confirm-dialog-cancel" onclick={onCancel}
        >{t(lang, 'confirm.cancel')}</button
      >
      <button
        type="button"
        class="btn btn--primary btn--half"
        data-action="confirm-dialog-confirm"
        onclick={onConfirm}>{confirmLabel}</button
      >
    </div>
  </Dialog.Content>
</Dialog.Root>
