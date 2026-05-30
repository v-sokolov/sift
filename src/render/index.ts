import type { AppState, Theme } from '../types';
import { renderHeader } from './header';
import { renderToolbar } from './toolbar';
import { renderChoice } from './choice';
import { renderSummary } from './summary';
import { renderAddForm } from './addForm';

function applyTheme(theme: Theme): void {
  const root = document.documentElement;
  if (theme === 'system') root.removeAttribute('data-theme');
  else root.setAttribute('data-theme', theme);
}

function cssEscape(s: string): string {
  if (typeof CSS !== 'undefined' && typeof CSS.escape === 'function') return CSS.escape(s);
  return s.replace(/["\\]/g, '\\$&');
}

// Full region re-render from state, with focus/caret restoration so editing a
// text field survives the rebuild (research R8).
export function renderApp(root: HTMLElement, state: AppState): void {
  const active = document.activeElement as HTMLElement | null;
  const focusKey = active?.dataset?.field ?? null;
  let selStart: number | null = null;
  let selEnd: number | null = null;
  if (active instanceof HTMLInputElement || active instanceof HTMLTextAreaElement) {
    selStart = active.selectionStart;
    selEnd = active.selectionEnd;
  }

  applyTheme(state.view.theme);

  const n = state.dilemma.choices.length;
  const choicesHtml = state.dilemma.choices
    .map((c, i) => renderChoice(c, i, state))
    .join('');

  root.innerHTML = `
    ${renderHeader(state)}
    ${renderToolbar(state)}
    <section class="choices" style="--choice-count:${n}">${choicesHtml}</section>
    ${renderSummary(state)}
    ${renderAddForm(state)}
    <footer class="footer">Sift — a quiet way to weigh a decision. Made with care.</footer>
  `;

  if (focusKey) {
    const el = root.querySelector<HTMLElement>(`[data-field="${cssEscape(focusKey)}"]`);
    if (el) {
      el.focus();
      if (
        selStart != null &&
        (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement)
      ) {
        try {
          el.setSelectionRange(selStart, selEnd ?? selStart);
        } catch {
          /* some input types don't support selection range */
        }
      }
    }
  }
}
