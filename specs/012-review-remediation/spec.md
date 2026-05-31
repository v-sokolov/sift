# Feature Specification: Codebase-Health Remediation (Repo Review Follow-up)

**Feature Branch**: `012-review-remediation`

**Created**: 2026-05-31

**Status**: Draft

**Input**: User description: "`REVIEW.md`" — act on the repository review's actionable
findings (Tier 1 fixes + governance/documentation-honesty levers).

## Scope

A focused remediation pass driven by the repository review (`REVIEW.md`, dated 2026-05-31,
commit `9dedf17`). The review is explicit that this is **polish on an already-disciplined
codebase, not rescue work**, and that some items are deliberately **out of scope**. This
feature acts only on the items the review marks as worth doing:

**In scope** (review Tier 1 + Tier 4 Lever 3 + the Tier 3 trims the review names):

- Resolve the unused runtime dependencies (review #1): **adopt** `bits-ui`'s `Dialog` in the
  suggest dialog (making the declared dep real) and **remove** `@internationalized/date`.
- Eliminate dead, duplicated note-commit code — `addNote` / `updateNote` vs. `submitForm` (#2).
- Remove write-only scaffolding — the one-member `SuggestStatus` union + unread `status` field (#3).
- Eliminate the theme flash-of-unstyled-content (FOUC) with a pre-paint resolution (#4).
- Collapse the duplicated dark-palette CSS to a single block (#5).
- Keep committed docs honest — make `CLAUDE.md` and the constitution rationale stop asserting
  Bits UI is in use; commit the constitution so the 80 specs that cite it can be read (Lever 3).
- Trim the two comments the review names as stale/noise — the `theme.ts` comment promising
  code that doesn't exist, and the CSS spec-tag comments (`M4/FR-001 (006)`, `(007)`, `(008)`).

**Explicitly out of scope** (the review says leave these alone):

- The store's snapshot/immutable-producer pattern (#6) — "revisit when next touched, not urgent."
- The flat folder layout, the hand-rolled i18n, the test-only `data-*` attributes, and the
  bulk of in-code comments — the review says keep these.
- The shipped specs (001–011) — kept as the learning record; not rewritten.
- The Tier 4 process levers about ceremony-scaling (Levers 1 & 2) — those are guidance for how
  *future* features are specced, not code or docs to change in this feature.

## Clarifications

### Session 2026-05-31

- Q: For finding #1, should `bits-ui` be removed (delete both unused deps, keep the small
  hand-rolled dialog) or adopted (rewrite `SuggestDialog` on Bits UI's `Dialog`, delete the
  manual focus-trap)? → A: **Adopt** Bits UI's `Dialog` in `SuggestDialog` (replacing the
  hand-rolled focus-trap / Esc / backdrop / scroll-lock), making the already-declared `bits-ui`
  dependency real and the constitution/CLAUDE.md rationale true-by-use; **remove**
  `@internationalized/date` (it supports nothing). The dialog's user-facing behavior is
  preserved exactly.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - No theme flash on load (Priority: P1)

A returning visitor who has explicitly chosen the **Dark** theme while their operating system
is set to Light opens the app. The page renders in their chosen theme immediately, with no
flash of the light palette before the app settles.

**Why this priority**: This is the only user-*visible* item in the review. For a product whose
first principle is "calm," a theme flash on every load is exactly the wrong first impression.
It delivers value on its own and can ship independently.

**Independent Test**: With `Dark` saved and the OS in Light mode, load the app and confirm the
first painted frame is dark (no light flash). Repeat with `Light` saved under a Dark OS.

**Acceptance Scenarios**:

1. **Given** a saved theme preference of Dark and an OS preference of Light, **When** the app
   is loaded, **Then** the very first rendered frame uses the dark palette (no light flash).
2. **Given** a saved theme preference of Light and an OS preference of Dark, **When** the app
   is loaded, **Then** the first rendered frame uses the light palette (no dark flash).
3. **Given** no saved theme preference, **When** the app is loaded, **Then** it follows the OS
   preference with no flash.
4. **Given** the app is open, **When** the user switches theme via the existing control, **Then**
   the theme changes exactly as it does today (no behavior regression).

---

### User Story 2 - An honest dependency surface and honest docs (Priority: P1)

A contributor (or the maintainer, or a portfolio reviewer) reads `package.json`, `CLAUDE.md`,
and the constitution to understand the stack. What the docs assert matches what the code
actually does: no dependency is declared but unused, and no committed document claims a library
is in use when it is not.

**Why this priority**: The review calls drift "the live risk" — a committed doc that asserts
something false is worse than no doc because it erodes trust in all of them. `CLAUDE.md` and the
v2.0.0 constitution rationale currently describe Bits UI as the stack while the code never
imports it. Resolving this is foundational to the project's credibility as an SDD learning
artifact.

**Independent Test**: After the change, every runtime dependency declared in `package.json` is
imported somewhere in `src/`, and a text search of committed docs finds no claim that Bits UI is
in active use that contradicts the code.

**Acceptance Scenarios**:

1. **Given** the dependency-resolution decision (see Clarifications), **When** the work is done,
   **Then** every declared runtime dependency in `package.json` is actually imported by `src/`.
2. **Given** the resolved state, **When** a reader consults `CLAUDE.md` and the constitution
   rationale, **Then** the description of the UI stack matches the code (no false Bits-UI claim).
3. **Given** the suggest dialog, **When** it is opened and used, **Then** it behaves exactly as
   today — accessible dialog semantics, focus moves in on open and returns to the trigger on
   close, Esc and backdrop close it, Tab is trapped, scroll is locked — regardless of which
   dependency decision is taken.

---

### User Story 3 - The committed constitution is readable in the repo (Priority: P2)

A reader browsing the repository on GitHub follows one of the 80 specs' "Constitution Check"
references and can open the constitution itself — it is committed, versioned, and discoverable,
instead of living only in gitignored tooling.

**Why this priority**: Eighty committed specs cite a document a reader cannot see; the
constitution's own Sync Impact Report even warns it is "not versioned." Committing just that one
file (while keeping the rest of `.specify/` ignored as regenerable tooling) closes the gap. It
is independent of the code changes.

**Independent Test**: On a fresh clone, `.specify/memory/constitution.md` is present and tracked,
while the rest of `.specify/` remains ignored.

**Acceptance Scenarios**:

1. **Given** the repository, **When** it is cloned fresh, **Then** `constitution.md` is tracked
   and present and the remainder of `.specify/` is still gitignored.
2. **Given** the constitution is committed, **When** a future amendment is made, **Then** there
   is a tracked file in which the version bump and rationale can live.

---

### User Story 4 - A leaner, dead-code-free core (Priority: P3)

A contributor reading the store and types finds no functions or types that exist only to be
tested — every exported note-commit path is reached by the UI, and there is no placeholder type
modeling states that cannot occur.

**Why this priority**: `addNote` / `updateNote` are imported by no component and duplicate
`submitForm` verbatim; `SuggestStatus` is a one-member union whose `status` field is written but
never read. These are isolated internal cleanups with no user-visible effect — lowest priority,
safe to do last.

**Independent Test**: A search shows the note-commit logic exists in one place (no verbatim
duplication), and `SuggestStatus` / the unread `status` field are gone, with the full test suite
still green.

**Acceptance Scenarios**:

1. **Given** the store, **When** a note is added or edited through the UI, **Then** it works
   exactly as today, with the commit logic living in a single, non-duplicated place.
2. **Given** the types and store, **When** searched, **Then** there is no one-member status union
   and no write-only `status` field.
3. **Given** all of the above changes, **When** the test suite runs, **Then** it passes with no
   loss of coverage of the note add/edit behavior.

---

### Edge Cases

- A user mid-edit when the app loads must never see their unsaved draft behavior change — none of
  these are user-data changes; persisted state (`sift.v1`, schema version 1) is untouched.
- Removing a dependency must not break the build or any import elsewhere; if `bits-ui` is instead
  adopted, the dialog's accessibility behavior must be preserved exactly (no regression in the
  existing focus-trap / Esc / backdrop / scroll-lock tests).
- The pre-paint theme resolution must handle a missing or malformed `sift.v1` entry gracefully
  (fall back to OS preference; never throw before paint).
- Committing the constitution must not accidentally un-ignore other regenerable `.specify/` files.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Every runtime dependency declared in `package.json` MUST be imported by `src/`
  after this feature; there MUST be no declared-but-unused runtime dependency.
- **FR-002**: The `@internationalized/date` dependency, which is imported nowhere and supports no
  feature (the app has no date UI), MUST be removed.
- **FR-003**: The `bits-ui` dependency MUST be adopted by the suggest dialog — `SuggestDialog`
  MUST be built on Bits UI's `Dialog` primitive, and the hand-rolled focus-trap / Esc / backdrop /
  scroll-lock handling (currently in `App.svelte` and the dialog) MUST be replaced by the
  primitive's equivalents. `bits-ui` MUST end up actually imported (no longer declared-but-unused).
- **FR-004**: The suggest dialog's user-facing behavior MUST remain unchanged regardless of the
  FR-003 decision: dialog role/aria semantics, focus-in on open, focus-return on close, Esc to
  close, backdrop-click to close, Tab focus-trap, and background scroll-lock all preserved.
- **FR-005**: Committed documentation (`CLAUDE.md` and the constitution rationale) MUST match the
  code after FR-003 — since Bits UI becomes actually used by the dialog, the docs' Bits-UI claims
  become true-by-use rather than drift; any wording implying it was already in use MUST be
  corrected to reflect that the dialog now genuinely uses it.
- **FR-006**: On load, the app MUST apply the user's resolved theme (saved preference, else OS
  preference) **before first paint**, eliminating the theme flash; switching theme at runtime MUST
  continue to work as today.
- **FR-007**: The pre-paint theme resolution MUST degrade gracefully on missing/malformed stored
  state, falling back to the OS preference without error.
- **FR-008**: The dark-palette custom properties MUST be defined in a single place; the current
  verbatim duplication between the `prefers-color-scheme: dark` media block and the
  `[data-theme="dark"]` block MUST be eliminated.
- **FR-009**: The constitution file MUST be committed and tracked in the repository while the
  remainder of `.specify/` remains gitignored as regenerable tooling.
- **FR-010**: Note add/edit MUST continue to work through the UI, with the commit logic residing
  in a single place (no verbatim duplication between `submitForm` and `addNote`/`updateNote`);
  any note-commit functions that remain exported MUST be reachable from the UI rather than
  surviving solely through their own tests.
- **FR-011**: The one-member `SuggestStatus` union and the write-only `status` field MUST be
  removed (no behavior depends on them).
- **FR-012**: The stale `theme.ts` comment promising a `matchMedia` listener + pre-paint snippet
  "in index.html" MUST be made truthful (updated to describe what the code actually does once
  FR-006 lands) rather than left describing nonexistent code.
- **FR-013**: The CSS spec-tag comments that couple the stylesheet to spec history
  (e.g., `M4/FR-001 (006)`, `(007)`, `(008)`) MUST be removed; substantive *why*-comments
  elsewhere MUST be kept (only the named stale/noise comments are trimmed).
- **FR-014**: Persisted user state MUST be untouched — the `sift.v1` localStorage schema (version
  1) and its contents MUST remain backward-compatible; this feature introduces no migration.
- **FR-015**: The change set MUST NOT alter the items the review marks "do not change": the store
  snapshot pattern, the flat folder layout, the hand-rolled i18n, the `data-*` test attributes,
  the shipped specs, and the bulk of in-code comments.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: The count of declared-but-unimported runtime dependencies is **0** (down from 2).
- **SC-002**: On load with a saved theme that conflicts with the OS preference, the first painted
  frame matches the saved theme in **100%** of loads (no observable flash).
- **SC-003**: The dark-palette custom-property set is defined **once** (0 verbatim duplicate
  blocks, down from 2).
- **SC-004**: The full existing test suite passes with **no net loss** of tests covering the
  suggest-dialog behavior and the note add/edit behavior.
- **SC-005**: A fresh clone contains the tracked constitution file, and a search of committed docs
  returns **0** statements that Bits UI is in active use contradicting the code.
- **SC-006**: There is **0** verbatim duplication of the note-commit body across `submitForm` and
  the note-commit functions, and **0** one-member status unions remain.

## Assumptions

- The "users" of most of these stories are contributors / the maintainer / portfolio reviewers;
  only User Story 1 (theme FOUC) affects an end user directly. This matches the review's framing.
- "Before first paint" is interpreted as: the resolved theme attribute is set on the document root
  prior to the browser's first paint of app content, by the minimal mechanism the existing
  `theme.ts` comment already promised.
- Removing `@internationalized/date` is unconditional (it supports nothing). The `bits-ui`
  decision (FR-003) is settled in Clarifications: adopt its `Dialog` in the suggest dialog.
- The constitution is committed by narrowing `.gitignore` to un-ignore exactly that one file, per
  the pattern the review supplies; no other `.specify/` content becomes tracked.
- Test-first discipline (Constitution Principle IV) applies: behavior-preserving changes are
  guarded by the existing tests as a regression gate, and any genuinely new observable contract
  (e.g., pre-paint theme attribute) gets a failing test first where it is observable.
- No new runtime dependency is introduced by this feature — adopting Bits UI's `Dialog` uses the
  already-declared `bits-ui` dependency; the net dependency change is a removal
  (`@internationalized/date`).
