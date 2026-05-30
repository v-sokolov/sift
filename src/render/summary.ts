import type { AppState } from '../types';
import { againstTotal, choiceScore, forTotal, leaders } from '../scoring';
import { t } from '../i18n';

function signed(n: number): string {
  if (n > 0) return `+${n}`;
  if (n < 0) return `−${Math.abs(n)}`;
  return '0';
}

// Quiet, understated, numeric summary per choice with a gentle leader highlight
// (FR-016, FR-017). Always visible.
export function renderSummary(state: AppState): string {
  const lang = state.view.lang;
  const ldrs = leaders(state.dilemma.choices);
  const n = state.dilemma.choices.length;
  const cells = state.dilemma.choices
    .map((c) => {
      const leader = ldrs.has(c.id) ? ' sum--leader' : '';
      const totals = t(lang, 'summary.totals', {
        for: String(forTotal(c)),
        against: String(againstTotal(c)),
      });
      return `<div class="sum${leader}">
        <div class="sum__score">${signed(choiceScore(c))}</div>
        <div class="sum__totals">${totals}</div>
      </div>`;
    })
    .join('');
  return `<section class="summary" style="--choice-count:${n}" aria-label="${t(lang, 'summary.aria')}">${cells}</section>`;
}
