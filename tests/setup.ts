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

// jsdom lacks scrollIntoView (021 S1–S3). Stub so the auto-scroll $effect in
// App.svelte doesn't throw during tests — real scroll verified manually (M2/M6).
if (typeof Element !== 'undefined' && !Element.prototype.scrollIntoView) {
  Element.prototype.scrollIntoView = () => {};
}

afterEach(() => {
  cleanup();
  localStorage.clear();
});
