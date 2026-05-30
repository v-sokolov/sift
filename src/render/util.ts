// Small shared render helpers.

const ESC: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

/** Escape text for safe interpolation into HTML (attribute or text content). */
export function esc(s: string): string {
  return s.replace(/[&<>"']/g, (ch) => ESC[ch]);
}

/** Weight dots (●) for weight 1–3; empty string when null. */
export function dots(weight: number | null): string {
  return weight ? '●'.repeat(weight) : '';
}
