<script lang="ts">
  import { getState, openSuggest, setDilemmaTitle } from '../store.svelte';
  import { t } from '../i18n';

  let s = $derived(getState());
  let lang = $derived(s.view.lang);
</script>

<header>
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
</header>
