// Minimal Svelte 5 testing helper — replaces @testing-library/svelte (absent from the
// offline registry). Mounts a component with Svelte's built-in `mount`/`unmount` and
// exposes @testing-library/dom queries scoped to a fresh container. See research R9.

import { mount, unmount, type Component } from 'svelte';
import { within, type BoundFunctions, type queries } from '@testing-library/dom';

interface RenderResult {
  container: HTMLElement;
  component: Record<string, unknown>;
  /** @testing-library/dom queries scoped to the mounted container. */
  q: BoundFunctions<typeof queries>;
  unmount: () => void;
}

const mounted: Array<{ instance: Record<string, unknown>; container: HTMLElement }> = [];

/** Mount `Component` with `props` into a fresh container appended to <body>. */
export function render<Props extends Record<string, unknown>>(
  Component: Component<Props>,
  props?: Props,
): RenderResult {
  const container = document.createElement('div');
  document.body.appendChild(container);
  // `mount` returns the component's exported bindings; props are reactive in Svelte 5.
  const instance = mount(Component, {
    target: container,
    props: (props ?? {}) as Props,
  }) as Record<string, unknown>;
  mounted.push({ instance, container });
  return {
    container,
    component: instance,
    q: within(container),
    unmount: () => {
      void unmount(instance);
      container.remove();
    },
  };
}

/** Unmount everything mounted since the last cleanup (called from afterEach). */
export function cleanup(): void {
  for (const { instance, container } of mounted.splice(0)) {
    try {
      void unmount(instance);
    } catch {
      /* already removed */
    }
    container.remove();
  }
}
