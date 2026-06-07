// Vitest global setup: jest-dom matchers + auto-cleanup of mounted components.
import '@testing-library/jest-dom/vitest';
import { afterEach } from 'vitest';
import { cleanup } from './svelte';

// jsdom lacks the Web Animations API; Svelte's `animate:flip` (018) calls
// element.getAnimations(). Stub it so animated reorders don't crash the (layout-less)
// jsdom environment — real animation behaviour is verified manually (quickstart M3).
if (typeof Element !== 'undefined' && !Element.prototype.getAnimations) {
  Element.prototype.getAnimations = () => [];
}

afterEach(() => {
  cleanup();
  localStorage.clear();
});
