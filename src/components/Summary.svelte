<script lang="ts">
  import { flip } from 'svelte/animate';
  import { getState } from '../store.svelte';
  import { againstTotal, choiceScore, forTotal, leaders } from '../scoring';
  import { orderedChoices, scoreSign as sign, signed } from '../view';
  import { t } from '../i18n';

  let s = $derived(getState());
  let lang = $derived(s.view.lang);
  let choices = $derived(s.dilemma.choices);
  let ldrs = $derived(leaders(choices));
  // 018: score cells follow the same Rank order as the cards so they stay column-aligned.
  let ordered = $derived(orderedChoices(choices, s.view.rankByTotal));

  // Reorder animation, gated on reduced-motion (FR-008); jsdom has no matchMedia.
  const prefersReduced =
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const flipMs = prefersReduced ? 0 : 200;

  // 018: sign of the score drives both the cell tint (.sum--*) and the score-text colour
  // (.sum__score--*), supplementary to the +/−/0 text (Principle V). Since 020 the
  // signed/sign helpers live in view.ts, shared with the card footer (SC-003).
</script>

<section
  class="summary"
  style="--choice-count:{choices.length}"
  aria-label={t(lang, 'summary.aria')}
>
  {#each ordered as c (c.id)}
    <div
      class="sum sum--{sign(choiceScore(c))}{ldrs.has(c.id) ? ' sum--leader' : ''}"
      animate:flip={{ duration: flipMs }}
    >
      <div class="sum__score sum__score--{sign(choiceScore(c))}">{signed(choiceScore(c))}</div>
      <div class="sum__totals">
        {t(lang, 'summary.totals', { for: String(forTotal(c)), against: String(againstTotal(c)) })}
      </div>
    </div>
  {/each}
  <p class="summary__formula callout">{t(lang, 'summary.formula')}</p>
</section>
