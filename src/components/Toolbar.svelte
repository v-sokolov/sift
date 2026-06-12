<script lang="ts">
  import type { Lang, Theme } from "../types";
  import { LANGS, MAX_CHOICES } from "../types";
  import {
    addChoice,
    clearDilemma,
    cycleTheme,
    getState,
    openAddForm,
    setDirection,
    setGroupKey,
    setLang,
    setSortKey,
    toggleGroup,
    toggleRank,
    toggleSort,
  } from "../store.svelte";
  import { t } from "../i18n";
  import ConfirmDialog from "./ConfirmDialog.svelte";
  import { slide } from "svelte/transition";

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
  // Save-status indicator (010, extended 022): always visible — editing/saved show
  // their coloured dot + label; the no-pending-edit state shows a neutral "Idle".
  let statusVariant = $derived(s.status === "hidden" ? "idle" : s.status);
  let statusLabel = $derived(
    s.status === "editing"
      ? t(lang, "toolbar.editing")
      : s.status === "saved"
        ? t(lang, "toolbar.saved")
        : t(lang, "toolbar.idle"),
  );

  // 016: Clear confirms through the shared in-app dialog (FR-010) — the product's last
  // native browser prompt is gone; the clearDilemma mutation itself is untouched.
  let confirmingClear = $state(false);
  function clear() {
    confirmingClear = true;
  }
</script>

<div class="toolbar">
  <div class="toolbar__row toolbar__row--settings">
    <!-- Two wrap-as-a-unit groups: [language + theme] and [status + clear] — on small
         screens each pair stays together and the pairs wrap as wholes; on wide screens
         the pairs sit at opposite ends (space-between). -->
    <div class="toolbar__set">
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
    </div>
    <div class="toolbar__set">
      <span class="saved" aria-live="polite"
        ><span
          class="status-dot status-dot--{statusVariant}"
          aria-hidden="true"
        ></span>{statusLabel}</span
      >
      <button class="btn" data-action="clear" onclick={clear}
        >{t(lang, "toolbar.clear")}</button
      >
    </div>
  </div>

  <!-- View controls: self-contained labelled containers (label above its controls,
       like the card score labels) that wrap vertically as whole units when space
       runs out — Choices │ Points │ mode config (Group-key, or Sort-key + Direction). -->
  <div class="toolbar__row toolbar__row--views">
    <div class="toolbar__views">
      <div class="toolbar__field">
        <span class="scope">{t(lang, "toolbar.scopeChoices")}</span>
        <button
          class="btn toggle"
          data-action="toggle-rank"
          aria-pressed={s.view.rankByTotal}
          onclick={toggleRank}>{t(lang, "toolbar.rank")}</button
        >
      </div>
      <div class="toolbar__field">
        <span class="scope">{t(lang, "toolbar.scopePoints")}</span>
        <div class="seg seg--multi" role="group" aria-label={t(lang, 'toolbar.groupSortAria')}>
          <button
            data-action="toggle-group"
            aria-pressed={mode === "grouped"}
            onclick={toggleGroup}>{t(lang, "toolbar.group")}</button
          >
          <button
            data-action="toggle-sort"
            aria-pressed={mode === "sorted"}
            onclick={toggleSort}>{t(lang, "toolbar.sort")}</button
          >
        </div>
      </div>
      {#if mode === "grouped"}
        <div class="toolbar__field" transition:slide={{ duration: 150 }}>
          <span class="scope">{t(lang, "toolbar.groupBy")}</span>
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
              onclick={() => setGroupKey("weight")}>{t(lang, "toolbar.weight")}</button
            >
          </div>
        </div>
      {:else if mode === "sorted"}
        <div class="toolbar__field" transition:slide={{ duration: 150 }}>
          <span class="scope">{t(lang, "toolbar.by")}</span>
          <div
            class="seg"
            role="group"
            aria-label={t(lang, "toolbar.sortKeyAria")}
          >
            <button
              data-action="set-sortkey"
              data-key="weight"
              aria-pressed={s.view.sortKey === "weight"}
              onclick={() => setSortKey("weight")}>{t(lang, "toolbar.weight")}</button
            >
            <button
              data-action="set-sortkey"
              data-key="type"
              aria-pressed={s.view.sortKey === "type"}
              onclick={() => setSortKey("type")}>{t(lang, "toolbar.type")}</button
            >
          </div>
        </div>
        <div class="toolbar__field" transition:slide={{ duration: 150 }}>
          <span class="scope">{t(lang, "toolbar.direction")}</span>
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
        </div>
      {/if}
    </div>

    <!-- Add CTAs: one labelled "Create" container, the LAST controls before the
         cards grid (user decisions 2026-06-12). It shares the views row: inline
         right of the view controls when it fits, otherwise a full-width 50/50 band
         (see the toolbar band CSS in app.css). Add-point's trigger moved up from
         below the grid — the form itself still opens there. -->
    <div class="toolbar__add">
      <span class="scope">{t(lang, "toolbar.scopeActions")}</span>
      <div class="toolbar__addbtns">
        <button
          class="btn btn--primary"
          data-action="add-choice"
          disabled={atMax}
          title={atMax
            ? t(lang, "toolbar.maxChoices", { n: String(MAX_CHOICES) })
            : undefined}
          onclick={addChoice}
          >{t(lang, "toolbar.addChoice")} {n} / {MAX_CHOICES}</button
        >
        <button
          class="btn btn--primary"
          data-action="open-add-form"
          disabled={s.editing !== null}
          onclick={() => {
            const id = s.dilemma.choices[0]?.id;
            if (id) openAddForm(id);
          }}>{t(lang, "form.addNote")}</button
        >
      </div>
    </div>
  </div>

  <!-- 015 (FR-012) / 018: the complexity hint as a full-width quote callout under the
       controls. Informational only — shown at 4–6 choices, never blocks adding. -->
  {#if n >= 4}
    <p class="toolbar__hint callout" data-hint="many-choices">
      {t(lang, "toolbar.manyChoices")}
    </p>
  {/if}

  <ConfirmDialog
    open={confirmingClear}
    message={t(lang, "confirm.clear")}
    confirmLabel={t(lang, "confirm.clearAction")}
    onConfirm={() => {
      confirmingClear = false;
      clearDilemma();
    }}
    onCancel={() => (confirmingClear = false)}
  />

</div>
