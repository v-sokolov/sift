# Feature Specification: Save-Status Indicator & Header/Footer Polish

> **Scope**: Two related work streams shipped together on this branch — (1) the **save-status
> indicator** (the core change: FR-001–013, User Stories 1–3), and (2) a small **header/footer
> presentation pass** (FR-014 footer copy, FR-015 favicon, FR-016 "Suggest a feature" placement),
> each presentation-only and independent of the indicator logic.

**Feature Branch**: `010-save-status-indicator`

**Created**: 2026-05-31

**Status**: Draft

**Input**: User description: "I want improve the \"Status saved\" feature. The debounce time should be 2s. Except Saved we need to add some elegantly named status means \"Unsaved changes\" and show it if we edit smth related to Dillemma, Choices or Points (not Language, not Theme). Both statuses should have a colored dot left to the text - green for Saved, yellow for Unsaved. And probably we need to think about the default state - first opening or after-clear behaviour."

## Clarifications

### Session 2026-05-31

- Q: On first open (no edits yet) and immediately after Clear, what should the indicator show?
  → A: **Hidden until first edit.** No dot or text appears until the person makes their first
  content change. After Clear the indicator resets to hidden.
- Q: What should the not-yet-saved status be called (the "elegant name")?
  → A: **"Editing"** — calm, non-alarming, reads as a transient mode rather than a warning. Paired
  with **"Saved"**.
- Q: Besides Language and Theme, should the other view controls (Sort, Group, Mode, Direction) also
  be excluded from flipping the status to the unsaved state?
  → A: **Exclude all view preferences.** Only Dilemma title, Choices, and Points content flips the
  status to "Editing". Sort, Group, Mode, Direction, Language, and Theme never do (they continue to
  persist silently).
- Q: Should the footer's inspiration credit keep naming the author (Greg McKeown)?
  → A: **No — remove the author's name in all localizations**, keeping the *Essentialism* book
  reference. This is a small footer copy change bundled onto this branch; it is **independent of**
  the save-status indicator. (See FR-014 / SC-007.)
- Q: Should the brand favicon be added beside the "Sift" wordmark, and how should it be exposed to
  assistive technology?
  → A: **Yes — place the existing brand mark to the left of the "Sift" title**, treated as
  **decorative** (hidden from assistive technology) since the adjacent "Sift" text already conveys
  the brand. Another small, presentation-only change bundled onto this branch, **independent of**
  the save-status indicator. (See FR-015 / SC-008.)
- Q: Where should the "Suggest a feature" button sit?
  → A: **Move it into the brand row, to the right of the favicon + "Sift" title**, with the row using
  a space-between layout (brand on the left, button pushed to the far right). Presentation-only header
  layout change bundled onto this branch, **independent of** the save-status indicator. (See FR-016 /
  SC-009.)
- Q: How should this branch be framed, given it bundles the indicator plus three header/footer tweaks?
  → A: **Reframe as a UI-polish pass** — retitle to "Save-Status Indicator & Header/Footer Polish" and
  plan it as two work streams (the indicator; the header/footer presentation) on one branch/PR. No
  file or branch rename.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - See whether my work is saved (Priority: P1)

A person weighing a decision edits their dilemma — its title, the choices, or the points within a
choice. They want quiet, trustworthy reassurance about whether those edits have been stored yet, so
they can close the tab or walk away without worrying that work was lost. The moment they change
content, the indicator reads **"Editing"** with a yellow dot; a short, settled moment later (once
the change is safely stored) it reads **"Saved"** with a green dot.

**Why this priority**: This is the core of the feature — the trustworthy save signal. Without the
two-state indicator the person has no way to know whether their latest keystroke is safe. Everything
else (the exact debounce timing, the default-state polish) refines this central behaviour.

**Independent Test**: Open the app, type into the dilemma title or add/edit a point, and confirm the
indicator immediately shows the "Editing" state (yellow dot); wait the settle period and confirm it
changes to "Saved" (green dot). Reload the page and confirm the content persisted.

**Acceptance Scenarios**:

1. **Given** a fresh dilemma with no edits, **When** the person edits the dilemma title, adds or
   renames a choice, or adds/edits/removes a point, **Then** the indicator shows the **"Editing"**
   status with a **yellow** dot.
2. **Given** the indicator is showing "Editing" after a content change, **When** no further content
   change happens for the settle period (2 seconds), **Then** the change is stored and the indicator
   changes to **"Saved"** with a **green** dot.
3. **Given** the indicator is showing "Saved", **When** the person makes another content change,
   **Then** it returns to **"Editing"** (yellow) and the settle countdown restarts.
4. **Given** the person makes several rapid content changes within the settle period, **When** the
   changes stop, **Then** only one store happens (changes are coalesced) and the indicator settles
   on "Saved" once.
5. **Given** the indicator shows "Saved", **When** the person reloads the page, **Then** the edited
   content is present (it was stored).

---

### User Story 2 - Preference changes don't masquerade as unsaved work (Priority: P2)

The same person switches the interface Language, toggles the Theme (light/dark), or changes how
points are sorted/grouped. These are personal view preferences, not edits to the decision itself, so
they should **not** make the indicator claim there is unsaved decision work. The indicator must only
react to changes in the decision's content.

**Why this priority**: Without this, every theme toggle or sort change would flash "Editing",
training the person to ignore the indicator and eroding the trust the feature exists to build. It is
second only to the core signal itself.

**Independent Test**: With the indicator in a known resting state, change the Theme, then the
Language, then the Sort/Group controls, and confirm the indicator does **not** switch to "Editing"
for any of them; then change content and confirm it does.

**Acceptance Scenarios**:

1. **Given** the indicator is in any resting state, **When** the person toggles the Theme, **Then**
   the indicator does not change to "Editing".
2. **Given** the indicator is in any resting state, **When** the person changes the Language,
   **Then** the indicator does not change to "Editing".
3. **Given** the indicator is in any resting state, **When** the person changes Sort, Group, Mode,
   or Direction, **Then** the indicator does not change to "Editing".
4. **Given** any of the above preference changes were made, **When** the person reloads the page,
   **Then** their preference choices are still remembered (preferences persist silently).

---

### User Story 3 - A clean, unobtrusive default at first open and after Clear (Priority: P3)

When the person first opens the app (nothing edited yet) or right after they Clear the dilemma, the
indicator shows nothing at all — no dot, no text. There is no edited work to reassure them about, so
a status badge would be noise. The indicator appears only once they make their first content change.

**Why this priority**: A calm default keeps the interface uncluttered and avoids making
ambiguous claims ("Saved" about an empty canvas, or "Editing" before anything was touched). It is a
polish layer on top of the core signal.

**Independent Test**: Load the app with no stored data and confirm no status indicator is visible;
make a content change and confirm it appears; Clear the dilemma and confirm the indicator disappears
again until the next content change.

**Acceptance Scenarios**:

1. **Given** the app is opened with no prior edits in this session, **When** the view first renders,
   **Then** no status dot or text is shown.
2. **Given** the indicator is showing "Saved" or "Editing", **When** the person performs Clear,
   **Then** the indicator returns to hidden (no dot, no text).
3. **Given** the dilemma has just been cleared and the indicator is hidden, **When** the person
   makes a new content change, **Then** the indicator reappears in the "Editing" state.

---

### Edge Cases

- **Rapid edits across the settle window**: Continuous typing keeps the indicator at "Editing"; the
  countdown restarts on each change, so "Saved" only appears after editing pauses for the full
  settle period.
- **Leaving the page mid-edit**: If the person navigates away or closes the tab while "Editing" is
  showing, the pending change is still stored (the store is flushed on exit) so nothing is lost,
  even though they may not see the final "Saved" state.
- **Content change that results in no net difference** (e.g., typing then deleting back to the
  original): treated as a content change — it shows "Editing" then "Saved"; the feature does not
  attempt value-level diffing.
- **Preference change while "Editing" is pending**: A theme/language/sort change made during the
  settle window does not cancel or alter the pending content save, and does not by itself change the
  status text.
- **Clear while a content save is pending**: Clear resets to the hidden default; the cleared state
  is what persists.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST present a save-status indicator with exactly two visible states —
  **"Saved"** and **"Editing"** — plus a hidden (no-indicator) state.
- **FR-002**: Each visible state MUST display a colored dot to the left of its text label: **green**
  for "Saved" and **yellow** for "Editing".
- **FR-003**: The indicator MUST switch to the **"Editing"** (yellow) state immediately when the
  person changes Dilemma content — specifically the dilemma title, any choice (add, rename, remove),
  or any point/note (add, edit, remove).
- **FR-004**: After a content change, when no further content change occurs for a settle period of
  **2 seconds**, the system MUST store the content and switch the indicator to the **"Saved"**
  (green) state.
- **FR-005**: Multiple content changes occurring within the settle period MUST be coalesced into a
  single store, with the indicator settling on "Saved" once after edits pause.
- **FR-006**: Changes to view preferences — **Language, Theme, Sort, Group, Mode, Direction** — MUST
  NOT switch the indicator to "Editing" and MUST NOT, on their own, change the displayed status.
- **FR-007**: View preference changes MUST continue to be persisted (remembered across reloads), as
  today — silently, without affecting the indicator.
- **FR-008**: On first render of a session with no content edits yet, the indicator MUST be hidden
  (no dot, no text).
- **FR-009**: Performing **Clear** MUST return the indicator to the hidden state; it MUST reappear in
  the "Editing" state on the next content change.
- **FR-010**: The status MUST be conveyed by its text label, not by color alone; the colored dot is
  a supplementary cue (so the meaning is available without relying on color perception).
- **FR-011**: The indicator's state changes MUST be announced to assistive technology politely (not
  interrupting), consistent with the existing live-region behaviour.
- **FR-012**: Both status labels MUST be available in every supported interface language (English and
  Ukrainian), consistent with the rest of the interface.
- **FR-013**: This feature MUST NOT change the scoring formula, the point data model, the available
  grouping/sorting controls, or the saved-state storage format/version.
- **FR-014** *(bundled copy change, independent of the save-status indicator)*: The footer's
  inspiration credit MUST NOT name the author "Greg McKeown" in any supported language; it MUST
  retain the reference to the *Essentialism* book. The change applies to every localization
  (English and Ukrainian).
- **FR-015** *(bundled presentation change, independent of the save-status indicator)*: The brand
  mark (the existing app favicon) MUST be displayed immediately to the left of the "Sift" wordmark in
  the header. It MUST be presented as decorative (not announced by assistive technology), since the
  adjacent "Sift" text already conveys the brand, and MUST NOT alter the existing tagline, title
  input, or other header controls.
- **FR-016** *(bundled presentation change, independent of the save-status indicator)*: The "Suggest
  a feature" button MUST be positioned in the brand row to the right of the favicon + "Sift" title,
  with that row laid out so the brand sits at the start and the button at the end (space-between).
  The button's behaviour (opening the suggestion dialog) MUST be unchanged; only its placement
  changes. Its previous location beside the dilemma-title input MUST no longer also render it
  (no duplicate button).

### Key Entities *(include if feature involves data)*

- **Save status**: the current display state of the indicator — one of *hidden*, *Editing*
  (unsaved content change pending), or *Saved* (latest content change stored). It is derived from
  (a) whether any content change has occurred this session, and (b) whether the most recent content
  change has been stored.
- **Content change**: a modification to the decision itself — the dilemma title, a choice, or a
  point. Distinct from a **preference change** (Language, Theme, Sort, Group, Mode, Direction),
  which does not affect the save status.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of content changes (dilemma title, choice, or point edits) cause the indicator to
  show "Editing" with a yellow dot within one render frame of the change.
- **SC-002**: After editing stops, the indicator shows "Saved" with a green dot once the 2-second
  settle period has elapsed, in 100% of cases.
- **SC-003**: 0% of preference changes (Language, Theme, Sort, Group, Mode, Direction) cause the
  indicator to show "Editing".
- **SC-004**: On first open with no edits, and immediately after Clear, the indicator is not visible
  100% of the time.
- **SC-005**: The status meaning is identifiable without color (text label present) and is announced
  to assistive technology — verifiable with color vision simulation and a screen-reader/live-region
  check.
- **SC-006**: A burst of N rapid content edits within 2 seconds results in exactly one stored write,
  not N writes.
- **SC-007**: In every supported language, the footer no longer contains the author's name
  "Greg McKeown" (nor its localized form, e.g. "Ґреґа Мак-Кеоуна"), while the *Essentialism* book
  reference is still present — verifiable by inspecting the rendered footer in each language.
- **SC-008**: The brand mark renders to the left of the "Sift" wordmark in the header, is not
  announced as a separate element by assistive technology, and the wordmark + tagline + title input
  remain otherwise unchanged — verifiable by visual inspection and a screen-reader/markup check.
- **SC-009**: The "Suggest a feature" button renders in the brand row at the far right (brand at the
  left, button at the right via space-between), appears exactly once, and still opens the suggestion
  dialog — verifiable by visual inspection and activating the button.

## Assumptions

- The improvement builds on the existing single-dilemma, client-side, `localStorage`-backed model;
  the storage key and schema version are unchanged (FR-013).
- "Saved" means the latest content change has been written to local storage on this device; there is
  no server or cross-device sync (consistent with the app's client-side-only design).
- The 2-second settle period replaces the current shorter debounce; all content edits are debounced
  uniformly (there is no separate "save immediately" trigger besides page-exit flush).
- The on-exit flush behaviour (storing a pending change when the tab closes or is hidden) is retained
  so no work is lost even if the person leaves while "Editing" is showing.
- "Editing" was chosen as the elegant label for the unsaved-changes state (it reads as a calm,
  transient mode); "Saved" is retained for the stored state.
- The indicator continues to live in the existing toolbar status area; no new screen or major layout
  change is introduced.
- Green and yellow are the dot colors; their exact shades follow the existing theme palette and meet
  the app's contrast expectations in both light and dark themes.
- The footer copy change (FR-014) removes only the author reference; the precise remaining wording is
  left to implementation but must read naturally in each language (e.g. EN "Inspired by the
  *Essentialism* book." / UK "Натхненна книжкою *Essentialism*.") and must keep the existing book
  link/styling intact. It carries no logic, data, or persistence implications.
- The brand mark (FR-015) reuses the existing favicon art (`public/favicon.svg` — a self-contained
  rounded tile that reads on both light and dark themes); no new asset is created. Its exact size
  (visually balanced against the 1.5rem wordmark) and spacing are left to implementation. It carries
  no logic, data, or persistence implications.
- For the header layout (FR-015 + FR-016), the left group is the favicon + "Sift" wordmark; the
  existing tagline remains associated with the brand (beneath the wordmark) and the button aligns to
  the brand row. Exact vertical alignment, button styling, and responsive wrapping at narrow widths
  are left to implementation, consistent with the existing responsive header behaviour.
