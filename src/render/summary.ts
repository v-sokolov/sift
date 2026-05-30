import type { AppState } from '../types';
import { againstTotal, choiceScore, forTotal, leaders } from '../scoring';

function signed(n: number): string {
  if (n > 0) return `+${n}`;
  if (n < 0) return `−${Math.abs(n)}`;
  return '0';
}

// Quiet, understated, numeric summary per choice with a gentle leader highlight
// (FR-016, FR-017). Always visible.
export function renderSummary(state: AppState): string {
  const ldrs = leaders(state.dilemma.choices);
  const n = state.dilemma.choices.length;
  const cells = state.dilemma.choices
    .map((c) => {
      const leader = ldrs.has(c.id) ? ' sum--leader' : '';
      return `<div class="sum${leader}">
        <div class="sum__score">${signed(choiceScore(c))}</div>
        <div class="sum__totals">for ${forTotal(c)} · against ${againstTotal(c)}</div>
      </div>`;
    })
    .join('');
  return `<section class="summary" style="--choice-count:${n}" aria-label="Summary scores">${cells}</section>`;
}
