import { describe, it, expect } from 'vitest';
import { buildMailto, SUGGEST_SUBJECT } from '../../src/mailto';
import type { SuggestionDraft } from '../../src/types';

function draft(p: Partial<SuggestionDraft> = {}): SuggestionDraft {
  return { name: '', description: '', email: '', github: '', linkedin: '', ...p };
}

const TO = 'maintainer@example.com';

function decodeBody(url: string): string {
  const m = url.match(/[?&]body=([^&]*)/);
  return m ? decodeURIComponent(m[1]) : '';
}

describe('buildMailto()', () => {
  it('targets the given address and encodes the constant subject', () => {
    const url = buildMailto(draft({ name: 'A', description: 'B' }), TO);
    expect(url.startsWith(`mailto:${TO}?`)).toBe(true);
    expect(url).toContain(`subject=${encodeURIComponent(SUGGEST_SUBJECT)}`);
  });

  it('includes only Name and Description when optionals are empty', () => {
    const body = decodeBody(buildMailto(draft({ name: 'Ann', description: 'Add X' }), TO));
    expect(body).toContain('Name: Ann');
    expect(body).toContain('Description: Add X');
    expect(body).not.toContain('Contact:');
    expect(body).not.toContain('GitHub:');
    expect(body).not.toContain('LinkedIn:');
  });

  it('includes every non-empty optional field', () => {
    const body = decodeBody(
      buildMailto(
        draft({
          name: 'Ann',
          description: 'Add X',
          email: 'ann@x.io',
          github: 'gh/ann',
          linkedin: 'in/ann',
        }),
        TO,
      ),
    );
    expect(body).toContain('Contact: ann@x.io');
    expect(body).toContain('GitHub: gh/ann');
    expect(body).toContain('LinkedIn: in/ann');
  });

  it('percent-encodes special characters and newlines, and round-trips Cyrillic', () => {
    const url = buildMailto(draft({ name: 'A & B', description: 'лінія1\nрядок2' }), TO);
    // raw url must not contain a literal space, ampersand-in-value, or newline
    expect(url).not.toMatch(/\n/);
    expect(url).toContain('%0A'); // encoded newline in the body
    const body = decodeBody(url);
    expect(body).toContain('Name: A & B');
    expect(body).toContain('лінія1\nрядок2');
  });

  it('trims whitespace around values', () => {
    const body = decodeBody(buildMailto(draft({ name: '  Ann  ', description: '  Add X ' }), TO));
    expect(body).toContain('Name: Ann');
    expect(body).toContain('Description: Add X');
  });
});
