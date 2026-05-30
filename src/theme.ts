// Theme application. Sets the <html> data-theme attribute from the chosen Theme;
// `system` defers to the OS via prefers-color-scheme (handled in CSS). US2 extends
// this with a matchMedia listener + a pre-paint snippet in index.html.

import type { Theme } from './types';

export function applyTheme(theme: Theme): void {
  const root = document.documentElement;
  if (theme === 'system') root.removeAttribute('data-theme');
  else root.setAttribute('data-theme', theme);
}
