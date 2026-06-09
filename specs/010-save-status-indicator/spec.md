# Save-Status Indicator & Header/Footer Polish

> **Status: Shipped — condensed 2026-06-09**

Branch `010-save-status-indicator` · merged PR #11. Two presentation-only work streams on one
branch: (1) the **save-status indicator** (the core change), and (2) a small **header/footer
polish** pass, each independent of the indicator logic.

## What shipped

### 1. Save-status indicator (core)

Replaced the old single, always-"Saved" hint with a three-state indicator in the existing toolbar
status slot:

- **hidden** — default; nothing rendered (no dot, no text). The resting state on a fresh open and
  immediately after Clear.
- **"Editing"** (yellow dot) — shown the instant Dilemma/Choice/Point **content** changes.
- **"Saved"** (green dot) — shown once the change is stored.

The state machine (authoritative copy in `contracts/save-status.md`):

```
            content mutation              save completes (guarded)
   hidden ───────────────────▶ editing ──────────────────────────▶ saved
     ▲                                                                │
     │  preference / transient changes never move the state          │
     └──────────────────────── clearDilemma() ◀──────────────────────┘
```

Mechanics: a runtime-only `status: SaveStatus` (`'hidden' | 'editing' | 'saved'`) on `AppState`,
init `'hidden'` in `emptyDilemma()`. The eight **content** mutations (`setDilemmaTitle`,
`addChoice`, `renameChoice`, `removeChoice`, `addNote`, `updateNote`, `removeNote`, `submitForm`
commit) flip it to `'editing'` via the existing `touch()` helper. `setLastSaved` flips
`'editing' → 'saved'` **only when currently `'editing'`** (the guard) so a preference-triggered
save never claims "Saved" over an empty board. `clearDilemma()` → `'hidden'`. The debounce
lengthened **400ms → 2000ms** (`DEBOUNCE_MS`, FR-004); N rapid edits coalesce to one write
(SC-006); exit-flush is retained so nothing is lost mid-edit. `status` is **never persisted** —
no `PersistedV1`/schema change (FR-013), so a returning user starts `'hidden'`.

**Why:** a trustworthy, calm save signal. Only *content* drives it — all view preferences
(Language, Theme, Sort, Group, Mode, Direction) and transient form-draft edits persist silently
and never flip it (FR-006/FR-007), so the indicator stays meaningful rather than flashing on every
theme toggle. The text label carries the meaning; the dot is a supplementary cue (FR-010,
Principle V) announced via the existing `aria-live="polite"` region (FR-011). Green/yellow follow
theme tokens and meet WCAG AA in both themes.

### 2. Header/footer polish (presentation-only, independent of the indicator)

- **FR-014 — Footer copy:** dropped the "Greg McKeown" author credit in both languages, keeping the
  *Essentialism* book reference and link. i18n-only: EN "Inspired by the *Essentialism* book.";
  UK "Натхненна книжкою *Essentialism*." `Footer.svelte` markup unchanged.
- **FR-015 — Favicon:** the existing `public/favicon.svg` renders immediately left of the "Sift"
  wordmark, marked **decorative** (`alt=""` / `aria-hidden`) so the brand isn't double-announced.
- **FR-016 — Suggest button placement:** "Suggest a feature" moved into the brand row, right of the
  wordmark, via a space-between layout. Behaviour unchanged; renders exactly once (no duplicate).

## Key decisions

- **Single enum field** over two booleans — three display states map exactly to three values; no
  illegal combinations.
- **Mark `'editing'` inside the content mutations** (via `touch()`), not at the persistence layer —
  the save channel can't distinguish content from preferences, and guard no-ops return before
  `touch()` so they never flip the indicator.
- **Guarded `'saved'` transition + non-persisted `status`** — preferences still schedule saves
  (FR-007), but the guard keeps their completion from falsely showing "Saved", and runtime-only
  `status` honours FR-008 (hidden on fresh session) and FR-013 (no schema bump).
- **No new dependencies** — one typed field, one helper change, one constant, ~3 i18n keys, and
  markup/CSS/i18n tweaks. Pure scoring/arrangement untouched.

## Outcome

Shipped as designed; the `'editing'` transition rides the existing `touch()` helper rather than a
new `markEditing`. Added an amber `--status-editing` token (green `--status-saved` reuses
`--advantage`); removed dead `.header__tools` CSS when the Suggest button moved. Tests 116 → 130
passing; `yarn check` 0 errors. On-device visual pass (dot colors in light/dark, screen-reader
announcement) was left for manual verification.

## Contracts

- `contracts/save-status.md` — save-status state machine + store/persistence API (authoritative).
- `contracts/ui-presentation.md` — indicator render, header layout, footer copy.
