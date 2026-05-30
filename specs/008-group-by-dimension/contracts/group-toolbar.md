# Contract: Group toolbar control + section labels

**Units**: `src/components/Toolbar.svelte` (control), `src/components/ChoiceCard.svelte` (section
headings), `src/store.svelte.ts` (`setGroupKey`), `src/i18n/{en,uk}.ts` (labels).

## Store

```ts
export function setGroupKey(key: GroupKey): void; // sets view.groupKey via update(); persists
```

- Same shape as `setSortKey`/`setDirection`. Does not touch notes or other view fields.
- `emptyDilemma().view.groupKey === 'type'`.

## Toolbar (grouped config row)

- When `mode === 'grouped'`, the config row renders a `.seg` group (role=group,
  `aria-label = t(lang,'toolbar.groupKeyAria')`) with two buttons:
  - `data-action="set-groupkey" data-key="type"`, label `t(lang,'toolbar.type')`,
    `aria-pressed={view.groupKey === 'type'}`, `onclick={() => setGroupKey('type')}`.
  - `data-action="set-groupkey" data-key="weight"`, label `t(lang,'toolbar.weight')`,
    `aria-pressed={view.groupKey === 'weight'}`, `onclick={() => setGroupKey('weight')}`.
- The **Asc/Desc** segment renders **only** when `mode === 'sorted'` (it must NOT appear in grouped
  mode — FR-005).
- The **sort-key** Type/Weight segment continues to render only when `mode === 'sorted'`
  (Sort mode unchanged — FR-012).
- A row label `t(lang,'toolbar.groupBy')` precedes the grouped segment (mirrors `toolbar.by`).
- Accessibility: reuses the existing `.seg` button styling → focus-visible, ≥44px target,
  keyboard-operable (FR-017).

## ChoiceCard (section headings)

- Extend the label lookup so a section renders the correct heading text for its `label`:
  - `NoteType` → existing `group.advantage` / `group.disadvantage` / `group.neutral`.
  - `Weight` (number) → `t(lang, 'group.weight', { n: String(label) })`.
  - `'weightless'` → `t(lang, 'group.weightless')`.
- The existing empty-section guard is preserved: a labelled section with no notes renders nothing.

## i18n keys (EN authoritative, UK mirror — parity test must stay green)

| Key                   | EN              | UK (illustrative)   |
|-----------------------|-----------------|---------------------|
| `toolbar.groupBy`     | `Group by:`     | `Групувати за:`     |
| `toolbar.groupKeyAria`| `Group by`      | `Групувати за`      |
| `group.weight`        | `Weight {n}`    | `Вага {n}`          |
| `group.weightless`    | `Neutral`       | `Нейтральні`        |

`toolbar.type` / `toolbar.weight` are reused for the segment buttons (no new keys needed for those).

## Test assertions (`tests/components/`)

1. Group on → a `[data-action="set-groupkey"]` segment exists; **no** `[data-action="set-direction"]`
   element is present.
2. Activating `data-key="weight"` re-sections the visible notes (weight headings appear); activating
   `data-key="type"` restores type headings.
3. Sort on (group off) → `[data-action="set-direction"]` **is** present and
   `[data-action="set-sortkey"]` is present (Sort unchanged).
4. The grouped segment buttons expose localized text and correct `aria-pressed`.
5. i18n: every new key resolves non-blank in both `en` and `uk` (covered by existing parity/no-blank
   unit tests once keys are added).
