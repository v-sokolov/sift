# Research & Decisions: Save-Status Indicator & Header/Footer Polish

Phase 0 output. Resolves the design questions raised by the spec against the current code
(`src/store.svelte.ts`, `src/persistence.ts`, `src/main.ts`, `src/components/{Toolbar,Header,Footer}.svelte`,
`src/i18n/*`). No NEEDS CLARIFICATION markers remained after `/speckit-clarify`.

## R1 — Debounce duration: 400ms → 2000ms

- **Decision**: Change `DEBOUNCE_MS` in `src/persistence.ts` from `400` to `2000`. No other timing
  logic changes; `scheduleSave`/`flushSave` already coalesce and flush-on-exit.
- **Rationale**: FR-004 states a 2-second settle. It is a single named constant already used by both
  the debounce and the existing persistence test, so the change is localized and self-documenting.
- **Alternatives considered**: A separate "status debounce" distinct from the "save debounce" —
  rejected as redundant complexity; the indicator should turn "Saved" exactly when the write happens,
  so one timer is both simpler and more honest.

## R2 — Status model: a runtime `SaveStatus` on `AppState`

- **Decision**: Add `type SaveStatus = 'hidden' | 'editing' | 'saved'` and a `status: SaveStatus`
  field on `AppState`, initialized to `'hidden'` in `emptyDilemma()`. The Toolbar derives its display
  from `status` (not from `lastSavedAt`).
- **Rationale**: Three display states map exactly to the three spec states (hidden default / unsaved
  content pending / stored). A single enum field is the smallest typed representation and is trivially
  testable. It sits alongside the existing session-only fields (`lastSavedAt`, `editing`, `draft`,
  `suggest`).
- **Alternatives considered**:
  - *Derive purely from `lastSavedAt` + a boolean `dirty`* — two booleans encode the same three
    states less legibly and invite illegal combinations; a single enum is clearer.
  - *Keep using `lastSavedAt` only* — cannot express "hidden" vs "saved" vs "editing" (today it only
    distinguishes "" vs "Saved"), and cannot exclude preference-only changes. Rejected.

## R3 — Content vs. preference: where the `'editing'` transition lives

- **Decision**: Mark `status = 'editing'` **explicitly inside the eight content mutations**:
  `setDilemmaTitle`, `addChoice`, `renameChoice`, `removeChoice`, `addNote`, `updateNote`,
  `removeNote`, and the content-committing branch of `submitForm`. A tiny helper (e.g.
  `markEditing(d)`) keeps it DRY. View-preference mutations (`setLang`, `setTheme`, `cycleTheme`,
  `toggleGroup`, `toggleSort`, `setSortKey`, `setDirection`, `setGroupKey`) and transient form
  mutations (`openAddForm`, `openEditForm`, `closeForm`, `setFormType/Weight/Text/Choice`) do **not**
  touch `status`.
- **Rationale**: Today *every* mutation calls `notifySave()`, so the persistence channel cannot
  distinguish content from preferences (confirmed in `store.svelte.ts`). Marking at the content
  mutations is explicit, typed, and matches FR-003/FR-006 precisely. Form-draft changes (typing in
  the add form before submit) are not yet content and correctly do not flip the indicator; only the
  commit (`submitForm`/`addNote`/`updateNote`) does.
- **Alternatives considered**:
  - *Tag content vs. view at the `notifySave`/subscription layer* — would require threading a "kind"
    through every mutation or maintaining a parallel list, less explicit and easy to get out of sync.
  - *Diff dilemma content to detect real changes* — over-engineering; the spec explicitly treats
    type-then-undo as a change (edge case) and forbids value-level diffing.

## R4 — The `'saved'` transition is guarded, and `status` is not persisted

- **Decision**: `setLastSaved(ts)` (the save-completion callback wired in `main.ts`) sets
  `status = 'saved'` **only if** `status === 'editing'`. If `status === 'hidden'` (no content edit
  yet), a save that completes because a *preference* changed leaves `status` hidden. `status` is a
  runtime field: it is **not** added to `PersistedV1` and is **not** read by `load()`, so a returning
  user starts `'hidden'` until their first edit this session.
- **Rationale**: View-pref changes still schedule a save (R6 of behaviour: preferences must persist,
  FR-007); without the guard, that save's completion would flip an empty board to "Saved" (violating
  FR-006/FR-008). The guard makes "Saved" mean "a content edit you made was stored." Keeping `status`
  out of persistence honours FR-013 (no schema/version change) and FR-008 (hidden on fresh session).
- **Alternatives considered**: *Stop scheduling saves on preference changes* — would regress the
  existing, desirable behaviour that theme/lang/sort persist; rejected. The guard is cheaper and
  preserves persistence.
- **Known accepted nuance**: the debounce timer is global, so a preference change made during the
  2s window reschedules the pending content save (delays "Saved" slightly). This matches the spec
  edge case ("a preference change during the settle window does not cancel the pending save") and is
  acceptable; it never *cancels* a save and never loses data (exit-flush remains).

## R5 — Header layout: favicon + wordmark on the left, Suggest button on the right

- **Decision**: In `Header.svelte`, render the existing `public/favicon.svg` as an `<img>` (or inline
  use) immediately left of `<h1 class="header__wordmark">Sift</h1>`, marked `aria-hidden="true"` /
  `alt=""` (decorative). Move the existing `data-action="open-suggest"` button out of `header__bar`
  and into the brand row; lay that row out with `display:flex; justify-content:space-between` so the
  brand group sits at the start and the button at the end. The tagline remains beneath the wordmark
  in the left group. The button keeps `onclick={openSuggest}` — behaviour unchanged, rendered once.
- **Rationale**: FR-015/FR-016. The favicon is self-contained art (dark rounded tile with light dots)
  that reads on both themes, so no theme-specific asset is needed. Decorative marking avoids a
  screen reader announcing "Sift" twice (the wordmark text already conveys it). Reusing the existing
  button element (just relocating it) guarantees no duplicate and no behaviour drift.
- **Alternatives considered**: A new SVG/logo asset (unnecessary — reuse favicon); CSS
  `background-image` on the heading (loses the simple decorative `<img>` and complicates sizing).

## R6 — Footer copy: remove the author, keep the book

- **Decision**: Edit only the i18n catalogs. EN: `footer.inspiredPre` "Inspired by Greg McKeown's " →
  "Inspired by the " (keep `footer.inspiredBook` = "Essentialism", `footer.inspiredPost` = " book.").
  UK: `footer.inspiredPost` " Ґреґа Мак-Кеоуна." → "." (keep `footer.inspiredPre` "Натхненна
  книжкою ", `footer.inspiredBook` "Essentialism"). `Footer.svelte` markup and the book link are
  unchanged.
- **Rationale**: FR-014. The footer renders three i18n fragments around the book link; the author
  name lives in `inspiredPre` (EN) and `inspiredPost` (UK), so removing it is a copy-only change that
  preserves the link and styling. Resulting strings read naturally: EN "Inspired by the *Essentialism*
  book."; UK "Натхненна книжкою *Essentialism*."
- **Alternatives considered**: Restructuring the three-fragment pattern into one token — unnecessary
  churn; the fragment pattern already supports the change.

## R7 — Accessibility of the indicator

- **Decision**: Keep the status text inside the existing `aria-live="polite"` span (FR-011). The
  colored dot is a separate inline element marked `aria-hidden="true"` with `.status-dot` +
  `.status-dot--editing` (yellow) / `.status-dot--saved` (green) modifiers driven by theme tokens.
  When `status==='hidden'`, render neither dot nor text. Green/yellow chosen from the existing
  palette must meet WCAG AA contrast in light and dark (Principle V).
- **Rationale**: FR-010 forbids color-only meaning; the visible label carries it, the dot is
  supplementary. The polite live region already exists for "Saved" and avoids interrupting the user.
- **Alternatives considered**: `role="status"` on a wrapper (equivalent to `aria-live="polite"`; keep
  the existing span to minimize change). Announcing the dot color via `aria-label` — rejected
  (redundant with the text, and color names aren't meaningful to assistive tech).

## Testing strategy (Principle IV, test-first)

- **Store unit tests** (`tests/components/store.test.ts`): initial `status==='hidden'`; each content
  mutation → `'editing'`; each preference mutation leaves `status` unchanged; `setLastSaved` flips
  `'editing'→'saved'` but leaves `'hidden'` as `'hidden'`; `clearDilemma()` → `'hidden'`.
- **Persistence unit test** (`tests/unit/persistence.test.ts`): `DEBOUNCE_MS === 2000`; with fake
  timers, N rapid `scheduleSave` calls within the window produce exactly one write (SC-006).
- **Component tests** (via `tests/svelte.ts`): Toolbar shows nothing when hidden, "Editing" + yellow
  dot after a content edit, "Saved" + green dot after the timer/`setLastSaved`; footer text contains
  no author name in either language; header renders the decorative favicon and exactly one Suggest
  button positioned in the brand row.

All tests are authored to fail first against current code (no `status` field, 400ms, author name
present, button in old location), then pass after implementation.

## R8 — Post-implementation verification (2026-05-31)

- Implemented exactly as designed. Notable simplification: the `'editing'` transition is set in the
  existing `touch(d)` helper rather than a new `markEditing` — `touch()` is called on the success
  path of all eight content mutations and nowhere else, so it is the single correct point (guard
  no-ops return before `touch`, so they never flip the indicator). Behaviour matches the contract.
- `status` is a runtime field only; `serialize()`/`PersistedV1` were not touched (FR-013 holds).
- Header: dead `.header__tools` CSS (and its mobile rule) removed when the Suggest button moved into
  the new `.header__brandmain` row; the `.header__titlebox` full-width mobile rule was preserved.
- Added an amber `--status-editing` token per palette (green `--status-saved` reuses `--advantage`).
- **Tests**: baseline 116 → **130 passing** (+14: store status transitions ×7-in-1, persistence 2s
  ×2, toolbar indicator ×3, footer ×1, header ×2). `yarn check` (svelte-check): **0 errors**.
- **Not done headlessly**: T029 on-device `yarn dev` pass (visual dot colors in light/dark,
  screen-reader announcement) — left for manual verification.
