import { describe, it, expect } from 'vitest';
import { resolveTheme } from '../../src/theme';

// Pure resolver behind the pre-paint FOUC fix (012, contract theme.md C-1). The inline
// index.html snippet and applyTheme both resolve a Theme to an explicit 'light'|'dark'
// using the OS prefers-dark signal; this is the testable seam (Principle IV).
describe('resolveTheme (012, FR-006)', () => {
  it('returns the explicit theme verbatim regardless of OS preference', () => {
    expect(resolveTheme('dark', false)).toBe('dark');
    expect(resolveTheme('dark', true)).toBe('dark');
    expect(resolveTheme('light', true)).toBe('light');
    expect(resolveTheme('light', false)).toBe('light');
  });

  it('resolves system to the OS preference', () => {
    expect(resolveTheme('system', true)).toBe('dark');
    expect(resolveTheme('system', false)).toBe('light');
  });
});
