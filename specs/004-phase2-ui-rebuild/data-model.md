# Data Model: Phase-2 UI Rebuild

This feature introduces **no new domain data** and **no storage schema change**. The model
below restates the existing shapes (defined in `src/types.ts`, frozen per research R1) to
show what the runes store must preserve, and highlights the one preference — **theme** —
this feature surfaces in the UI. The persisted schema (`PersistedV1`, `schemaVersion: 1`,
key `sift.v1`) is **unchanged**, which is what guarantees SC-003 (saved boards load intact).

## Entities (unchanged — reused verbatim)

### Dilemma
- `id: string`, `title: string` (`''` → ghost placeholder), `createdAt/updatedAt: number`
- `choices: Choice[]` — length **invariant 2..4** (`MIN_CHOICES`/`MAX_CHOICES`).

### Choice (domain term for a compared candidate)
- `id: string`, `title: string` (`''` → ghost placeholder), `notes: Note[]`.

### Note
- `id: string`, `text: string`, `type: 'advantage' | 'disadvantage' | 'neutral'`,
  `weight: 1 | 2 | 3 | null`.
- **Invariant**: `weight === null` **iff** `type === 'neutral'` (neutral carries no weight).

### ViewPrefs
- `mode: 'default' | 'grouped' | 'sorted'`, `sortKey: 'weight' | 'type'`,
  `direction: 'asc' | 'desc'`, `lang: 'en' | 'uk'`, and **`theme: 'system' | 'light' | 'dark'`**.

### Transient (never persisted)
- `editing: EditTarget | null`, `draft: NoteDraft | null` (add/edit form),
  `suggest: SuggestState` (suggest-a-feature modal), `lastSavedAt: number | null`.

### Persisted slice
- `PersistedV1 = { schemaVersion: 1; dilemma: Dilemma; view: ViewPrefs }` — **unchanged**.

## The one UI-surfaced datum: Theme preference

| Aspect | Detail |
|--------|--------|
| Field | `ViewPrefs.theme` — **already exists**; not new schema |
| Values | `system` (follow OS), `light`, `dark` |
| Default | `system` → resolves via `prefers-color-scheme`; if no signal, **light** (edge case) |
| Persistence | part of `view` in `sift.v1` (already persisted today) |
| Pre-paint | inline snippet reads `sift.v1.view.theme` before mount (R5, FR-009) |
| Runtime | `theme.ts` applies to `<html>`, listens to `matchMedia` for `system` users |
| Mutations | existing `setTheme(theme)` / `cycleTheme()` (preserved by the runes store) |

## Derived values (computed at render, never stored)

- **`choiceScore` / `forTotal` / `againstTotal`** — pure (`scoring.ts`), surfaced via
  `$derived` in components (FR-002: derived recompute must not steal input focus).
- **`leaders(choices)`** — ids sharing the top score; empty when all scores are 0
  (no false "winner" — Principle I).
- **`arrange(choice, prefs)`** — pure section/ordering for the current view mode
  (`view.ts`); drives the `animate:flip` reorder (R7).

## Store invariants the runes store MUST preserve

1. Choices count stays within 2..4 (`addChoice` no-ops at 4; `removeChoice` no-ops at 2).
2. `neutral ⇒ weight null`; non-neutral defaults missing weight to `3`.
3. Submitting a **new** note keeps the form open (clears text, keeps choice/type/weight);
   submitting an **edit** closes the form.
4. `clearDilemma` resets board/view/theme but **preserves `lang`**.
5. Boot language application and "Saved" timestamp updates are **render-only** (no save loop).
6. Persistence fires on content/view mutations, debounced 400ms, flush on unload/hidden.
