# Data Model: Scroll, Focus, Collapsible Header & Scrollbar Gutter

## Runtime State Changes

### Header Description Expanded State

**Location**: Component-local `$state` in `src/components/Header.svelte`

```typescript
let descOpen = $state(false);
```

- **Scope**: Component-local only. Not exported. Not in `AppState`. Not in the `expanded` record from `store.svelte.ts`.
- **Persistence**: None. Ephemeral — resets to `false` on every page load.
- **Precedent**: Same pattern as `editingTitle` / `prevTitle` in `ChoiceCard.svelte` (020).

### No Store Changes

The `AppState` interface, `ViewPrefs` interface, and the `expanded` ephemeral record in `store.svelte.ts` are **unchanged**. No `schemaVersion` bump. No `sift.v1` payload change.

---

## New i18n Keys

Two new keys in both `src/i18n/en.ts` and `src/i18n/uk.ts`:

| Key | EN | UK |
|-----|----|----|
| `header.taglineToggleShow` | `"Show description"` | `"Показати опис"` |
| `header.taglineToggleHide` | `"Hide description"` | `"Сховати опис"` |

Used as the `aria-label` of the toggle button in `Header.svelte`, switching based on `descOpen`.

The existing `header.tagline` key is **unchanged**.

---

## No New Runtime Dependencies

All four enhancements use:
- Native browser `scrollIntoView` API
- Native browser `HTMLElement.focus()`
- Existing Svelte 5 `$state`, `$effect`, `tick()`
- Existing `slide` transition from `svelte/transition`
- CSS `scrollbar-gutter` property
- Existing Bits UI (no new primitives beyond what 020 already uses)

---

## New Shared Module

**`src/actions.ts`** — extracts the `autofocus` Svelte action currently duplicated across components:

```typescript
export function autofocus(node: HTMLElement): void {
  node.focus();
  if (node instanceof HTMLInputElement || node instanceof HTMLTextAreaElement) {
    node.select();
  }
}
```

Imported by `ChoiceCard.svelte` (replaces inline definition) and `AddEditForm.svelte` (new usage).
