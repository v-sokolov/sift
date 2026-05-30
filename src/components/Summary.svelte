<script lang="ts">
  import { getState } from '../store.svelte';
  import { againstTotal, choiceScore, forTotal, leaders } from '../scoring';
  import { t } from '../i18n';

  let s = $derived(getState());
  let lang = $derived(s.view.lang);
  let choices = $derived(s.dilemma.choices);
  let ldrs = $derived(leaders(choices));

  function signed(n: number): string {
    if (n > 0) return `+${n}`;
    if (n < 0) return `−${Math.abs(n)}`;
    return '0';
  }
</script>

<section
  class="summary"
  style="--choice-count:{choices.length}"
  aria-label={t(lang, 'summary.aria')}
>
  {#each choices as c (c.id)}
    <div class="sum{ldrs.has(c.id) ? ' sum--leader' : ''}">
      <div class="sum__score">{signed(choiceScore(c))}</div>
      <div class="sum__totals">
        {t(lang, 'summary.totals', { for: String(forTotal(c)), against: String(againstTotal(c)) })}
      </div>
    </div>
  {/each}
</section>
