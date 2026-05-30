import { defineConfig } from 'vitest/config';

// Minimal local typing for the one build-time env var we read, so `tsc --noEmit`
// passes without depending on @types/node (keeps dev deps minimal, Constitution III).
declare const process: { env: Record<string, string | undefined> };

export default defineConfig({
  // Project page serves under /sift/; the deploy workflow sets GITHUB_PAGES=true so
  // production assets resolve from the sub-path. Local dev/preview stay root-served.
  base: process.env.GITHUB_PAGES ? '/sift/' : '/',
  test: {
    environment: 'jsdom',
    include: ['tests/**/*.test.ts'],
  },
});
