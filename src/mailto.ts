// Pure mailto composer for the Suggest-a-feature flow. No DOM, no network — just
// returns a `mailto:` URL string; the caller fires it (Constitution II, IV).
// See contracts/suggestion.md.

import type { SuggestionDraft } from './types';

// Non-localized constant: keeps buildMailto pure/language-agnostic and gives the
// maintainer a consistent inbox subject. (Form UI is localized; this is not.)
export const SUGGEST_SUBJECT = 'Sift - feature suggestion';

/**
 * Build `mailto:<to>?subject=<enc>&body=<enc>`. The body is a readable template
 * of the entered fields; empty optionals are omitted. All values are percent-encoded.
 */
export function buildMailto(draft: SuggestionDraft, to: string): string {
  const lines: string[] = [
    `Name: ${draft.name.trim()}`,
    `Description: ${draft.description.trim()}`,
  ];
  if (draft.email.trim()) lines.push(`Contact: ${draft.email.trim()}`);
  if (draft.github.trim()) lines.push(`GitHub: ${draft.github.trim()}`);
  if (draft.linkedin.trim()) lines.push(`LinkedIn: ${draft.linkedin.trim()}`);

  const subject = encodeURIComponent(SUGGEST_SUBJECT);
  const body = encodeURIComponent(lines.join('\n'));
  return `mailto:${to}?subject=${subject}&body=${body}`;
}
