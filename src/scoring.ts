// Pure scoring. Derived live; nothing stored. See contracts/scoring.md.

import type { Choice, Note } from './types';

const weightOf = (n: Note): number => n.weight ?? 0;

export function forTotal(choice: Choice): number {
  return choice.notes
    .filter((n) => n.type === 'advantage')
    .reduce((sum, n) => sum + weightOf(n), 0);
}

export function againstTotal(choice: Choice): number {
  return choice.notes
    .filter((n) => n.type === 'disadvantage')
    .reduce((sum, n) => sum + weightOf(n), 0);
}

export function choiceScore(choice: Choice): number {
  return forTotal(choice) - againstTotal(choice);
}

/**
 * Choice ids sharing the single highest score. Empty when every score is 0
 * (an all-zero board has no leader to highlight — S5).
 */
export function leaders(choices: Choice[]): Set<string> {
  if (choices.length === 0) return new Set();
  const scores = choices.map((c) => ({ id: c.id, score: choiceScore(c) }));
  if (scores.every((s) => s.score === 0)) return new Set();
  const max = Math.max(...scores.map((s) => s.score));
  return new Set(scores.filter((s) => s.score === max).map((s) => s.id));
}
