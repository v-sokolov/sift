# Contract: Clear Preserves Preferences (US2)

A single-line behavior change in the store, guarded by a regression test. This is the only
intentional behavior change in the feature.

## Store — `src/store.svelte.ts`

Current (`clearDilemma` preserves only language):

```ts
/** Erase board/view/theme to default but PRESERVE the language choice. */
export function clearDilemma(): void {
  const lang = current.view.lang;
  const fresh = emptyDilemma();
  fresh.view.lang = lang;
  setState(fresh);
}
```

Target (also preserve theme):

```ts
/** Erase board/view to default but PRESERVE the language AND theme choices. */
export function clearDilemma(): void {
  const { lang, theme } = current.view;
  const fresh = emptyDilemma();
  fresh.view.lang = lang;
  fresh.view.theme = theme;
  setState(fresh);
}
```

| Aspect | Contract | Requirement |
|---|---|---|
| Theme | After clear, `view.theme` equals the pre-clear value (not `emptyDilemma()`'s default). | FR-016 |
| Language | After clear, `view.lang` equals the pre-clear value (already true; retained). | FR-017 |
| Content | Clear still empties title, choices' notes, and resets view mode/sort to defaults. | FR-018 |
| Persistence | `setState` drives the existing save path, so preserved prefs survive reload. | FR-018, SC-007 |
| Confirmation | The pre-existing "Clear" confirmation behavior is unchanged. | (Assumptions) |

> Note: update the doc-comment so it no longer says theme is reset to default.

## Tests (jsdom) — TDD, write first

`tests/components/store.test.ts` — extend the existing
`describe('clearDilemma preserves language', …)` or add a sibling:

```ts
test('clearDilemma preserves theme and language', () => {
  setTheme('dark');
  setLang('uk');
  const cid = getState().dilemma.choices[0].id;
  addNote(cid, { text: 'x', type: 'advantage', weight: 1 });
  clearDilemma();
  expect(getState().view.theme).toBe('dark');   // NEW assertion (fails before the change)
  expect(getState().view.lang).toBe('uk');       // existing guarantee
  expect(getState().dilemma.choices[0].notes).toHaveLength(0);
  expect(getState().dilemma.title).toBe('');
});
```

The existing `clearDilemma preserves language` test continues to pass unchanged (FR-015).

## No other surface

No i18n, no CSS, no component change for US2 — Clear's button/label/confirmation are untouched.
