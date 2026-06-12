// Theme application (012). The chosen Theme is resolved to an *explicit* light/dark and
// written to <html data-theme> — never left unset — so the dark palette (keyed off
// [data-theme="dark"]) is in effect from the first paint. The FOUC is prevented by a tiny
// pre-paint snippet in index.html that runs the same resolution before the bundle loads;
// a matchMedia('(prefers-color-scheme: dark)') listener (installed once in main.ts) keeps
// the attribute live while the stored theme is 'system'.

import type { Theme } from './types';

/** Resolve a Theme to the concrete palette to apply, given the OS dark preference. */
export function resolveTheme(theme: Theme, prefersDark: boolean): 'light' | 'dark' {
  if (theme === 'dark' || theme === 'light') return theme;
  return prefersDark ? 'dark' : 'light';
}

/** True when the OS prefers a dark color scheme (false in environments without matchMedia). */
function osPrefersDark(): boolean {
  return typeof matchMedia === 'function' && matchMedia('(prefers-color-scheme: dark)').matches;
}

export function applyTheme(theme: Theme): void {
  document.documentElement.dataset.theme = resolveTheme(theme, osPrefersDark());
}
