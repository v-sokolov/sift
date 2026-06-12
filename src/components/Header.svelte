<script lang="ts">
  import { getState, openSuggest, setDilemmaTitle } from '../store.svelte';
  import { t } from '../i18n';

  let s = $derived(getState());
  let lang = $derived(s.view.lang);

  // H1: ephemeral, component-local — resets to false on every page load (FR-008).
  let descOpen = $state(false);
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
      <div class="header__brandaction">
        <button class="btn btn--warm" data-action="open-suggest" onclick={openSuggest}
          >{t(lang, 'suggest.open')} <span class="btn__bulb" aria-hidden="true">💡</span></button
        >
      </div>
    </div>
    <!-- H5/H6: toggle sits above the tagline so expanding reads top-to-bottom. -->
    <button
      class="header__tagline-toggle"
      aria-expanded={descOpen}
      aria-controls="header-tagline"
      onclick={() => (descOpen = !descOpen)}
    >
      {t(lang, 'header.taglineToggleShow')}
      <svg class="header__tagline-caret" width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M5 9l7 7 7-7" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
    </button>
    <!-- H2/H3: tagline below the toggle; max-height animation expands downward. -->
    <p
      id="header-tagline"
      class="header__tagline"
      class:header__tagline--open={descOpen}
    >{t(lang, 'header.tagline')}</p>
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
