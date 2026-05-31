# Contract: Pre-Paint Theme Resolution

Feature: `012-review-remediation` · Covers FR-006, FR-007, FR-008, FR-012 · See [research.md](../research.md) R3

## C-1 — `resolveTheme` (pure, test-first)

```ts
// theme.ts
export function resolveTheme(theme: Theme, prefersDark: boolean): 'light' | 'dark';
```

Truth table (the unit-test contract, written red first):

| `theme` | `prefersDark` | result |
|---|---|---|
| `'dark'` | (any) | `'dark'` |
| `'light'` | (any) | `'light'` |
| `'system'` | `true` | `'dark'` |
| `'system'` | `false` | `'light'` |

## C-2 — Attribute is ALWAYS explicit

After resolution, `document.documentElement` carries `data-theme="light"` or `data-theme="dark"` —
**never** the absence of the attribute. `applyTheme(theme)` computes `resolveTheme(theme,
matchMedia('(prefers-color-scheme: dark)').matches)` and sets the attribute (no `removeAttribute`).

## C-3 — Pre-paint, before first paint (FOUC fix)

An inline `<script>` in `index.html` `<head>` sets the resolved attribute before the module bundle
loads / before first paint. It reads `localStorage['sift.v1']`, parses JSON, takes `.view.theme`,
and resolves as in C-1. It MUST be wrapped so any failure (missing key, malformed JSON, no
`matchMedia`) falls back to a sane default (`light`) and never throws (FR-007).

**Acceptance**: with `{"view":{"theme":"dark"}}` saved and OS = light, the first painted frame is
dark (no light flash). Symmetric for `light` under a dark OS. With no/invalid stored theme, follow
the OS preference. (Verified manually — jsdom does not paint.)

## C-4 — Live OS change while `theme === 'system'`

`theme.ts` registers a `matchMedia('(prefers-color-scheme: dark)')` `change` listener; while the
stored theme is `'system'`, an OS light/dark flip updates `data-theme` live. (This is the listener
the old `theme.ts` comment promised but never implemented.)

## C-5 — CSS single-source dark palette (FR-008)

`src/styles/app.css` defines the dark custom-property set **once**, under `:root[data-theme="dark"]`.
The `@media (prefers-color-scheme: dark)` block is **deleted** (made dead by C-2's always-explicit
attribute). Light defaults stay on `:root`.

**Acceptance**: a search of `app.css` finds `0` `@media (prefers-color-scheme: dark)` blocks and
exactly one dark-palette definition (SC-003).

## C-6 — Comment honesty (FR-012)

The `theme.ts` header comment is rewritten to describe the implemented behavior (explicit
pre-paint resolution in `index.html` + `matchMedia` listener here), replacing the stale
"US2 extends this…" promise.
