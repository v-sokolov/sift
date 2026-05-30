<script lang="ts">
  import { getState, openSuggest, setDilemmaTitle } from '../store.svelte';
  import { t } from '../i18n';

  let s = $derived(getState());
  let lang = $derived(s.view.lang);
</script>

<header>
  <div class="header__brand">
    <h1 class="header__wordmark">Sift</h1>
    <p class="header__tagline">{t(lang, 'header.tagline')}</p>
  </div>
  <div class="header__bar">
    <input
      class="header__title"
      data-field="title"
      type="text"
      value={s.dilemma.title}
      oninput={(e) => setDilemmaTitle(e.currentTarget.value)}
      placeholder={t(lang, 'header.titlePlaceholder')}
      aria-label={t(lang, 'header.titleAria')}
    />
    <div class="header__tools">
      <button class="linklike" data-action="open-suggest" onclick={openSuggest}
        >{t(lang, 'suggest.open')}</button
      >
    </div>
  </div>
</header>
