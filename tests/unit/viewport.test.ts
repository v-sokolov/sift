/// <reference types="vite/client" />
import { describe, expect, it } from 'vitest';
// Vite `?raw` import — no Node builtins needed (the project has no @types/node).
import indexHtml from '../../index.html?raw';

// Guard for feature 006 (M6 / R1): safe-area insets only resolve when the document
// opts in via `viewport-fit=cover`. This is the one mobile guarantee observable without
// a real device, so we assert it on the shipped index.html.
describe('index.html viewport meta', () => {
  it('opts into safe-area insets with viewport-fit=cover', () => {
    const meta = indexHtml.match(/<meta\s+name="viewport"[^>]*>/i)?.[0] ?? '';
    expect(meta).not.toBe('');
    expect(meta).toMatch(/content="[^"]*\bviewport-fit=cover\b[^"]*"/i);
  });
});
