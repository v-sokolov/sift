import type { AppState } from '../types';
import { esc } from './util';

// Editable, persistent dilemma title with a ghost placeholder (FR-001).
export function renderHeader(state: AppState): string {
  return `<header>
    <input
      class="header__title"
      data-field="title"
      data-action="title"
      type="text"
      value="${esc(state.dilemma.title)}"
      placeholder="What are you deciding?"
      aria-label="The decision you're weighing"
    />
  </header>`;
}
