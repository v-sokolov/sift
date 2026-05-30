# Contract: Theming (`src/styles/app.css`, `src/theme.ts`, `index.html`)

Full dark/light theming with no wrong-theme flash. Maps to FR-005..FR-009, SC-005, SC-006.

## Tokens

- Define palette + semantic tokens in a Tailwind v4 **`@theme`** block in `app.css`
  (migrated from the existing `src/styles/tokens.css`).
- Two themes (light, dark). Both MUST meet **WCAG AA**: normal-text contrast ratio ≥ 4.5:1;
  interactive/focus indicators clearly visible. Token values are the single source of truth.

## Resolution & switching

- `ViewPrefs.theme ∈ {system, light, dark}` (existing field).
- `system` resolves the active palette from `prefers-color-scheme`; if there is no signal,
  default to **light** (edge case).
- Active theme applied to `<html>` via a `data-theme`/`.dark` attribute that flips the CSS
  custom properties.
- Toggle control (in `Toolbar`) calls `cycleTheme()`/`setTheme()`; choice persists via the
  existing `view`→`sift.v1` path (no new storage key).
- A `system` user MUST follow live OS changes: `theme.ts` subscribes to
  `matchMedia('(prefers-color-scheme: dark)')` and re-resolves.

## No-flash pre-paint (FR-009)

- An inline `<script>` in `index.html`, executed **before** the app mounts, reads
  `localStorage['sift.v1']` → `view.theme` (fallback `system` → `prefers-color-scheme` →
  light) and sets the `<html>` attribute synchronously. No first-paint in the wrong theme.

## Acceptance (`tests/components/theme.test.ts`)

- OS dark + no stored choice ⇒ dark applied on load.
- Toggle switches light↔dark and the choice persists across a reload.
- Stored `light`/`dark` overrides the OS preference.
- Pre-paint snippet sets the `<html>` attribute from stored value before mount (no flash).
- Both themes' key tokens meet AA contrast (assert documented ratios / token values).
