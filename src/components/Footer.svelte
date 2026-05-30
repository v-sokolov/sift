<script lang="ts">
  import { getState } from '../store.svelte';
  import { AUTHOR_NAME, GITHUB_URL, LINKEDIN_URL } from '../config';
  import { t } from '../i18n';

  let s = $derived(getState());
  let lang = $derived(s.view.lang);
  // `footer.madeBy` carries a `{name}` token; we render the surrounding text plus the
  // name as plain text (Svelte auto-escapes), then the GitHub/LinkedIn links.
  let sentence = $derived(t(lang, 'footer.madeBy', { name: AUTHOR_NAME }));
</script>

<footer class="footer">
  <span class="footer__text">{sentence}</span>
  <span class="footer__links">
    <a
      class="footer__link"
      href={GITHUB_URL}
      target="_blank"
      rel="noopener noreferrer">{t(lang, 'footer.github')}</a
    >
    ·
    <a
      class="footer__link"
      href={LINKEDIN_URL}
      target="_blank"
      rel="noopener noreferrer">{t(lang, 'footer.linkedin')}</a
    >
  </span>
</footer>
