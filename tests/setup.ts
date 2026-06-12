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

// jsdom lacks Element.animate (Web Animations API); Svelte's `transition:slide` (022)
// calls it. Return a minimal Animation-like object so the transition doesn't throw —
// real animation is verified manually (quickstart M1/M7).
if (typeof Element !== 'undefined' && !Element.prototype.animate) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (Element.prototype as any).animate = () => ({ cancel: () => {}, finished: Promise.resolve() });
}

afterEach(() => {
  cleanup();
  localStorage.clear();
});
