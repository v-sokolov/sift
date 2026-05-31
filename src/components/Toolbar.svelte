<script lang="ts">
  import type { Lang, Theme } from "../types";
  import { LANGS, MAX_CHOICES } from "../types";
  import {
    addChoice,
    clearDilemma,
    cycleTheme,
    getState,
    setDirection,
    setGroupKey,
    setLang,
    setSortKey,
    toggleGroup,
    toggleSort,
  } from "../store.svelte";
  import { t } from "../i18n";

  const THEME_KEY: Record<Theme, string> = {
    system: "theme.system",
    light: "theme.light",
    dark: "theme.dark",
  };
  const LANG_LABEL: Record<Lang, string> = { en: "EN", uk: "UA" };

  let s = $derived(getState());
  let lang = $derived(s.view.lang);
  let n = $derived(s.dilemma.choices.length);
  let atMax = $derived(n >= MAX_CHOICES);
  let mode = $derived(s.view.mode);
  let showConfig = $derived(mode === "grouped" || mode === "sorted");
  // Save-status indicator (010): hidden shows nothing; editing/saved show a dot + label.
  let statusLabel = $derived(
    s.status === "editing"
      ? t(lang, "toolbar.editing")
      : s.status === "saved"
        ? t(lang, "toolbar.saved")
        : "",
  );

  function clear() {
    if (window.confirm(t(lang, "confirm.clear"))) clearDilemma();
  }
</script>

<div class="toolbar">
  <div class="toolbar__row">
    <div
      class="seg langtoggle"
      role="group"
      aria-label={t(lang, "header.langAria")}
    >
      {#each LANGS as l}
        <button
          data-action="set-lang"
          data-lang={l}
          class="langbtn{l === lang ? ' is-active' : ''}"
          aria-pressed={l === lang}
          onclick={() => setLang(l)}>{LANG_LABEL[l]}</button
        >
      {/each}
    </div>
    <button
      class="btn"
      data-action="cycle-theme"
      title={t(lang, "toolbar.themeTitle")}
      onclick={cycleTheme}>{t(lang, THEME_KEY[s.view.theme])}</button
    >
    <button class="btn" data-action="clear" onclick={clear}
      >{t(lang, "toolbar.clear")}</button
    >
    <span class="saved" aria-live="polite"
      >{#if s.status !== "hidden"}<span
          class="status-dot status-dot--{s.status}"
          aria-hidden="true"
        ></span>{statusLabel}{/if}</span
    >
    <span class="toolbar__spacer"></span>
    <button
      class="btn btn--primary"
      data-action="add-choice"
      disabled={atMax}
      title={atMax ? t(lang, "toolbar.maxChoices") : undefined}
      onclick={addChoice}
      >{t(lang, "toolbar.addChoice")} {n} / {MAX_CHOICES}</button
    >
    <button
      class="btn toggle"
      data-action="toggle-group"
      aria-pressed={mode === "grouped"}
      onclick={toggleGroup}>{t(lang, "toolbar.group")}</button
    >
    <button
      class="btn toggle"
      data-action="toggle-sort"
      aria-pressed={mode === "sorted"}
      onclick={toggleSort}>{t(lang, "toolbar.sort")}</button
    >
  </div>

  {#if showConfig}
    <div class="toolbar__row">
      {#if mode === "grouped"}
        <span class="count">{t(lang, "toolbar.groupBy")}</span>
        <div
          class="seg"
          role="group"
          aria-label={t(lang, "toolbar.groupKeyAria")}
        >
          <button
            data-action="set-groupkey"
            data-key="type"
            aria-pressed={s.view.groupKey === "type"}
            onclick={() => setGroupKey("type")}>{t(lang, "toolbar.type")}</button
          >
          <button
            data-action="set-groupkey"
            data-key="weight"
            aria-pressed={s.view.groupKey === "weight"}
            onclick={() => setGroupKey("weight")}
            >{t(lang, "toolbar.weight")}</button
          >
        </div>
      {:else if mode === "sorted"}
        <span class="count">{t(lang, "toolbar.by")}</span>
        <div
          class="seg"
          role="group"
          aria-label={t(lang, "toolbar.sortKeyAria")}
        >
          <button
            data-action="set-sortkey"
            data-key="weight"
            aria-pressed={s.view.sortKey === "weight"}
            onclick={() => setSortKey("weight")}
            >{t(lang, "toolbar.weight")}</button
          >
          <button
            data-action="set-sortkey"
            data-key="type"
            aria-pressed={s.view.sortKey === "type"}
            onclick={() => setSortKey("type")}>{t(lang, "toolbar.type")}</button
          >
        </div>
        <span class="count">{t(lang, "toolbar.direction")}</span>
        <div
          class="seg"
          role="group"
          aria-label={t(lang, "toolbar.directionAria")}
        >
          <button
            data-action="set-direction"
            data-dir="asc"
            aria-pressed={s.view.direction === "asc"}
            onclick={() => setDirection("asc")}>{t(lang, "toolbar.asc")}</button
          >
          <button
            data-action="set-direction"
            data-dir="desc"
            aria-pressed={s.view.direction === "desc"}
            onclick={() => setDirection("desc")}>{t(lang, "toolbar.desc")}</button
          >
        </div>
      {/if}
    </div>
  {/if}
</div>
