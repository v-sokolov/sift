# Research: Codebase-Health Remediation

Feature: `012-review-remediation` · Date: 2026-05-31 · Source: `REVIEW.md` (commit `9dedf17`)

This feature has no unknown technologies — it acts on the existing stack. "Research" here is a
set of design decisions for *how* to satisfy each remediation requirement with the smallest,
test-guarded change.

## R1 — Adopt Bits UI's `Dialog` in `SuggestDialog` (FR-003/FR-004)

**Decision**: Rebuild `SuggestDialog.svelte` on `bits-ui`'s `Dialog` primitive
(`Dialog.Root` / `Dialog.Overlay` / `Dialog.Content` / `Dialog.Title` / `Dialog.Close`),
**rendered inline (no `Dialog.Portal`)**, with `open` controlled by the store:
`<Dialog.Root open={s.suggest.open} onOpenChange={(v) => (v ? openSuggest() : closeSuggest())}>`.
Delete the hand-rolled focus-trap / Esc / backdrop / scroll-lock in `App.svelte:42-61` and the
backdrop handler + `modalEl` focus/scroll `$effect`s in `SuggestDialog.svelte`.

**Rationale**: Verified in `node_modules/bits-ui@2.18.1` that `Dialog.Content` composes
`EscapeLayer` (Esc-to-close), `DismissibleLayer` (backdrop/outside-click dismiss), `FocusScope`
(focus trap + focus-restore to the previously-focused element on close), and `ScrollLock`
(background scroll-lock). These are precisely the four hand-rolled behaviors today. Adopting the
primitive is the Principle III "material gain in accessibility/maintainability that hand-rolling
would not achieve as well" that the v2.0.0 constitution bump was written for — it makes the
declared dependency real and the docs true-by-use.

- **Inline (no Portal)** keeps the dialog DOM inside the app subtree, so component tests that
  query the rendered container still find it (Portal would move it to `document.body`, forcing a
  larger test rewrite for no user benefit). `Dialog.Portal` is optional; `Content` renders in
  place without it.
- **Controlled open from the store** keeps the store the single source of truth (the trigger
  lives in `Header.svelte` as `[data-action="open-suggest"]`, outside the dialog's component
  subtree, so `Dialog.Trigger` is not used; controlled `open` + `onOpenChange` is the supported
  pattern for an external trigger).
- **Class/markup preservation**: pass `class="modal-overlay"` to `Dialog.Overlay` and
  `class="modal"` to `Dialog.Content`, and forward the existing `data-region="suggest"` /
  `data-action` / `aria-labelledby="suggest-title"` so styling and the stable test/markup hooks
  are preserved. `Dialog.Content` already emits `role="dialog"` + `aria-modal="true"`, so those
  hand-set attributes are dropped (now provided by the primitive).
- **Focus into the name field on open**: use `Dialog.Content`'s `onOpenAutoFocus` to focus
  `[data-field="suggest-name"]` (replacing the mount `$effect`); **focus-return** to the trigger
  on close is handled by `FocusScope` automatically (it restores to the element focused before
  open — the Suggest trigger), so the `App.svelte:21-27` focus-return effect is removed.

**Alternatives considered**:
- *Remove both deps, keep hand-rolled dialog* (REVIEW.md's leaning): smaller diff, but leaves the
  v2.0.0 constitution rationale and CLAUDE.md asserting a library that isn't used — the user chose
  adoption to make the docs true-by-use. Rejected per Clarification.
- *Use `Dialog.Portal`*: moves content to `document.body`; needs broader test-query rewrite and
  gives no user-visible benefit here. Rejected.
- *`Dialog.Trigger` in `Header`*: would require wrapping the trigger and the content in one
  `Dialog.Root` spanning two components; larger refactor. Controlled-open is simpler. Rejected.

## R2 — Esc precedence after dialog adoption (FR-004)

**Decision**: Keep the `App.svelte` `svelte:window` `onkeydown` handler **only** for the
note-form Esc branch (`if (getState().editing) closeForm()`). Remove the suggest-Esc branch and
the entire Tab focus-trap block — Bits UI's `EscapeLayer`/`FocusScope` own those while the dialog
is open.

**Rationale**: The dialog is modal and traps focus while open, so its own Esc layer fires; the
window handler's remaining form branch is only reachable when the dialog is closed. No precedence
conflict remains. This shrinks `App.svelte` and removes the manual DOM querying.

## R3 — Pre-paint theme resolution + collapse duplicated dark palette (FR-006/FR-007/FR-008)

**Decision**: Resolve the theme to an explicit `light`/`dark` attribute **before first paint**,
and make that the *only* mechanism — so the `@media (prefers-color-scheme: dark)` CSS block
(`app.css:50-72`) is deleted and only `:root` (light) + `:root[data-theme="dark"]` remain.

Three coordinated changes:
1. **Inline pre-paint snippet** in `index.html` `<head>` (runs before the module bundle): read
   `localStorage['sift.v1']`, `JSON.parse`, take `.view.theme`; if `'dark'` → set
   `data-theme="dark"`; if `'light'` → `"light"`; otherwise (`'system'`, missing, or malformed —
   wrapped in `try/catch`) resolve via `matchMedia('(prefers-color-scheme: dark)')` to an
   explicit `light`/`dark`. Always sets an explicit attribute; never throws.
2. **`theme.ts`** gains a pure, testable `resolveTheme(theme, prefersDark): 'light' | 'dark'` and
   reworks `applyTheme` to set an explicit `light`/`dark` attribute (never `removeAttribute`), and
   installs a `matchMedia('(prefers-color-scheme: dark)')` `change` listener so that while the
   stored theme is `'system'` an OS flip updates the attribute live (the listener the stale
   comment promised).
3. **CSS**: delete the `@media (prefers-color-scheme: dark)` block; keep the single
   `:root[data-theme="dark"]` block. Because the attribute is now *always* explicit, the media
   query is dead weight and its removal kills the verbatim duplication (FR-008).

**Rationale**: Setting the attribute pre-paint eliminates the FOUC (the CSS dark branch keys off
`[data-theme="dark"]`, which now exists at first paint). Always-explicit resolution is exactly
what lets the media-query branch be deleted, resolving #4 and #5 in one stroke (REVIEW.md's
suggested approach). The pure `resolveTheme` is the unit-testable seam (Principle IV); the small
logic duplication between the inline snippet and `theme.ts` is the unavoidable, well-understood
cost of pre-paint (the snippet cannot import a module before paint) and is kept minimal.

**Alternatives considered**:
- *Keep `removeAttribute` for `system` + keep media query*: cannot delete the duplicated block,
  fails FR-008, and a `system` user with a dark OS who reloads still risks a flash window before
  the listener attaches. Rejected.
- *Move all theme logic into the inline script*: would bloat `index.html` and bypass the tested
  module. Rejected — keep the snippet minimal, logic in `theme.ts`.

## R4 — De-duplicate the note-commit path; keep `addNote`/`updateNote` reachable (FR-010)

**Decision**: Have `submitForm` **delegate** to `addNote(...)` / `updateNote(...)` for the note
mutation, retaining only the form-lifecycle bits in `submitForm` (new → reset draft preserving
type/weight and keep the form open; edit → close the form). This removes the verbatim duplication
of the note-push/assign body and makes `addNote`/`updateNote` reachable from the UI (transitively
via `submitForm`), so they are no longer dead code surviving only through their own tests.

**Rationale**: REVIEW.md #2 offers exactly this (delegate) as the preferred fix over deletion;
it keeps the tested functions live and DRYs the logic. The cost is two `update()` snapshots per
submit (one in the delegate, one for lifecycle) — harmless given the data size and the debounced
single write, and the snapshot pattern itself is explicitly out of scope (#6).

**Alternatives considered**:
- *Delete `addNote`/`updateNote` + their tests*: also valid (REVIEW.md's fallback) but discards
  working tested functions and coverage. Rejected in favor of delegation.
- *Extract pure helpers used by all three but keep `addNote`/`updateNote` UI-unreachable*: DRYs
  the body but leaves them dead (only tests call them), failing FR-010's "reachable from the UI."
  Rejected.

## R5 — Remove `SuggestStatus` write-only scaffolding (FR-011)

**Decision**: Delete `type SuggestStatus = 'idle'` (`types.ts:67`), remove `status` from
`SuggestState` (`types.ts:80`), and drop the two `status: 'idle'` initializers (`emptySuggest`
`store.svelte.ts:37`, `openSuggest` `:321`). Remove any test asserting `suggest.status`.

**Rationale**: One-member union, written but never read; the mailto hand-off is synchronous so no
state can exist (REVIEW.md #3, YAGNI). `SuggestState` is transient (never persisted), so removal
has zero persistence/migration impact. Note: this is distinct from `SaveStatus` (010), which *is*
read and stays untouched.

## R6 — Commit the constitution while keeping the rest of `.specify/` ignored (FR-009)

**Decision**: Replace the blanket `.specify/` line in `.gitignore` with the narrowing pattern,
then track only the one file:

```gitignore
.specify/*
!.specify/memory/
.specify/memory/*
!.specify/memory/constitution.md
```

Then `git add .specify/memory/constitution.md`. Verify `git status --ignored` still shows
`.specify/extensions.yml`, `.specify/feature.json`, `.specify/scripts/`, `.specify/templates/`
ignored, and that no other `.specify/` file becomes tracked.

**Rationale**: Git cannot re-include a file under a blanket-ignored directory; the parent dirs
must be un-ignored step-by-step (REVIEW.md Lever 3 supplies this exact pattern). Resolves the
constitution's own "not versioned" Sync Impact warning and lets the 80 specs' "Constitution
Check" references resolve to a readable file.

## R7 — Honest docs + comment trims (FR-005/FR-012/FR-013)

**Decision**:
- **`theme.ts` comment** (`:1-3`): rewrite to describe what the code actually does (explicit
  pre-paint resolution in `index.html` + `matchMedia` listener here), since after R3 the promised
  code exists.
- **CSS spec-tag comments**: remove the `(006)`/`(007)`/`(008)` and `M3/FR-010`, `M4/FR-001`-style
  spec-history tags scattered in `app.css`; keep substantive *why*-comments. (Grep for `(00` and
  `FR-` / `M[0-9]` tags during implementation.)
- **`CLAUDE.md` + constitution rationale**: after R1, Bits UI is genuinely used by the dialog —
  update any wording that implied it was *already* in use so the description matches reality
  (now true-by-use); the v2.0.0 rationale text stays valid (it permitted the framework + headless
  libs, which the dialog now exercises).

**Rationale**: REVIEW.md Tier 3 names exactly these two comment cases as the only trims worth
making and is emphatic that the rest of the comments stay. Doc-honesty (Lever 3) is satisfied by
making the claim true rather than deleting it.

## R8 — Test strategy (Principle IV, test-first)

**Decision**:
- **New observable contract → test-first**: extract `resolveTheme(theme, prefersDark)` as a pure
  function and write its unit test first (red), covering `dark`→dark, `light`→light,
  `system`+prefersDark→dark, `system`+!prefersDark→light. This is the testable core of the FOUC
  fix (the inline `index.html` snippet and the matchMedia listener are verified manually in the
  quickstart, since jsdom does not paint).
- **Behavior-preserving changes → existing tests are the regression gate**: the suggest-dialog
  behavior tests (`tests/components/suggest.test.ts`) must stay green after the Bits UI adoption.
  Because the DOM structure changes (bits-ui markup), update the *queries/assertions* to the new
  structure while asserting the same observable behavior: dialog appears with `role="dialog"` +
  `aria-modal`, focus moves to the name field on open, Esc closes + returns focus to the trigger,
  backdrop/outside dismiss closes, Tab is trapped, scroll-locked. The 011 `btn--half` markup test
  and the mailto-handoff test stay.
- **Removals → delete the dead tests**: drop assertions on `suggest.status`; keep `addNote`/
  `updateNote` unit tests (now exercising live, reachable functions).
- **Whole gate**: `yarn check` (svelte-check, 0 errors) + `yarn test` (vitest) green before done.

**Rationale**: Matches the project's established discipline — pure logic gets a failing test
first; framework-owned behavior is asserted at the observable level and guarded by the existing
suite; DOM-structure churn from the library is absorbed in the test queries, not by abandoning
the behavioral contract.

## Out of scope (REVIEW.md says leave alone) — recorded so tasks don't drift

- The store snapshot/immutable-producer pattern (#6) — not touched beyond the R4 delegation.
- Flat folder layout, hand-rolled i18n, `data-*` test attributes, shipped specs (001–011),
  and the bulk of in-code comments — unchanged.
- The Tier-4 ceremony-scaling process levers (Levers 1 & 2) — guidance for future specs, not work
  in this feature.
