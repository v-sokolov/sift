<script lang="ts">
  import { getState, openSuggest, setDilemmaTitle } from '../store.svelte';
  import { t } from '../i18n';

  let s = $derived(getState());
  let lang = $derived(s.view.lang);
</script>

<header>
  <div class="header__brand">
    <div class="header__brandmain">
      <span class="header__brandleft">
        <img
          class="header__logo"
          src="{import.meta.env.BASE_URL}favicon.svg"
          alt=""
          aria-hidden="true"
        />
        <h1 class="header__wordmark">Sift</h1>
      </span>
      <button class="btn" data-action="open-suggest" onclick={openSuggest}
        >{t(lang, 'suggest.open')} <span aria-hidden="true">💡</span></button
      >
    </div>
    <p class="header__tagline">{t(lang, 'header.tagline')}</p>
  </div>
  <div class="header__bar">
    <div class="header__titlebox">
      <span class="header__edit" aria-hidden="true">✎</span>
      <input
        class="header__title"
        data-field="title"
        type="text"
        value={s.dilemma.title}
        oninput={(e) => setDilemmaTitle(e.currentTarget.value)}
        placeholder={t(lang, 'header.titlePlaceholder')}
        aria-label={t(lang, 'header.titleAria')}
      />
    </div>
  </div>
</header>
