// Vitest global setup: jest-dom matchers + auto-cleanup of mounted components.
import '@testing-library/jest-dom/vitest';
import { afterEach } from 'vitest';
import { cleanup } from './svelte';

afterEach(() => {
  cleanup();
  localStorage.clear();
});
