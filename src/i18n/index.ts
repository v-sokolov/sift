// In-house localization. No i18n library, no runtime dependency (Constitution III).
// Pure, side-effect-free helpers (Constitution IV). See contracts/i18n.md.

import type { Lang } from '../types';
import { DEFAULT_LANG } from '../types';
import { en } from './en';
import { uk } from './uk';

export type Catalog = Record<string, string>;

export const messages: Record<Lang, Catalog> = { en, uk };

/**
 * Resolve a message for `lang`, falling back to English, then to the key itself.
 * `{var}` tokens are replaced from `vars`; unmatched tokens are left as-is.
 * Never returns an empty string when the English value exists.
 */
export function t(lang: Lang, key: string, vars?: Record<string, string>): string {
  const raw = messages[lang]?.[key] ?? messages.en[key] ?? key;
  if (!vars) return raw;
  return raw.replace(/\{(\w+)\}/g, (match, name: string) =>
    Object.prototype.hasOwnProperty.call(vars, name) ? vars[name] : match,
  );
}

/**
 * First-visit language detection: a browser language beginning with `uk` or `ru`
 * → Ukrainian; everything else (and empty/garbage) → English (FR-002).
 */
export function detectLang(navigatorLanguage: string): Lang {
  const nav = (navigatorLanguage ?? '').toLowerCase();
  return nav.startsWith('uk') || nav.startsWith('ru') ? 'uk' : DEFAULT_LANG;
}
