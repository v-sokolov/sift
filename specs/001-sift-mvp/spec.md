# Feature Specification: Sift MVP

**Feature Branch**: `001-sift-mvp`

**Created**: 2026-05-30

**Status**: Draft

**Input**: User description: "Build Sift, a minimalist fully client-side web app for comparing 2–4 everyday decision choices through structured reflection. Source design doc: docs/superpowers/specs/2026-05-30-sift-mvp-design.md — use it as the authoritative source for scope, data model, UX, scoring, accessibility, and success criteria."

## Overview

Sift helps a person think through an everyday decision by laying 2–4 choices side
by side, capturing what's good and bad about each (with a simple sense of how much
each point matters), and showing a quiet running score. It optimizes for **clarity
over comprehensiveness, calm over feature density, and reflection over automation**.
The score is a gentle aid, never a verdict.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Weigh a decision and see a quiet score (Priority: P1)

A person facing a choice opens Sift, names the question they're deciding, lists
2–4 choices, and for each choice jots down advantages, disadvantages, and neutral
observations — marking how much each point matters. As they type, each choice
shows an understated running score so they can compare choices at a glance without
the tool declaring a winner.

**Why this priority**: This is the core value of the product. Without it there is
no reason to use Sift. It is the smallest slice that delivers a usable decision aid.

**Independent Test**: Open the app, enter a question, add three choices, add a few
weighted advantages and disadvantages plus a neutral note to each, and confirm the
per-choice score and the for/against totals update live and correctly, with the
leading choice gently highlighted.

**Acceptance Scenarios**:

1. **Given** an empty app, **When** the user types a question into the title, **Then** the question is shown as the persistent header.
2. **Given** a dilemma with two choices, **When** the user adds a third choice, **Then** a third choice appears and the choice count reads 3 / 4.
3. **Given** a choice, **When** the user adds an advantage with weight ●●● (3) and a disadvantage with weight ● (1), **Then** that choice's score reads +2 and its for/against totals read 3 / 1.
4. **Given** a choice, **When** the user adds a neutral note, **Then** the neutral note is shown but the score and for/against totals are unchanged.
5. **Given** several choices with notes, **When** one choice has the single highest score, **Then** that choice receives a gentle, non-triumphant highlight; **and** if multiple choices tie for the highest score, all tied choices receive the same highlight with no tiebreaker.
6. **Given** an existing note, **When** the user edits its text, type, or weight, **Then** the change is reflected immediately and the score recomputes.

---

### User Story 2 - Keep my work without an account (Priority: P2)

A person returns to a decision later, or accidentally reloads the page, and finds
their dilemma exactly as they left it — without ever creating an account, logging
in, or sending data anywhere. When they're ready to start fresh, they can clear
everything back to a clean slate.

**Why this priority**: Losing work on reload would make the tool untrustworthy for
real reflection, which often happens over more than one sitting. It is essential
for a usable product but depends on P1 existing first.

**Independent Test**: Create a dilemma with choices and notes, reload the browser
tab, and confirm everything is restored. Then use Clear, confirm the prompt, and
verify the app returns to its empty default state.

**Acceptance Scenarios**:

1. **Given** a dilemma with choices and notes, **When** the user reloads the page, **Then** the title, choices, notes, weights, and chosen view settings are all restored.
2. **Given** an active dilemma, **When** the user chooses Clear and confirms, **Then** all data resets to the empty default state — a blank question, two empty starter choices, view settings back to default, and theme back to system.
3. **Given** an active dilemma, **When** the user chooses Clear and cancels at the confirmation, **Then** nothing changes.
4. **Given** the app is used, **When** the user makes a change, **Then** a quiet "Saved" indicator reflects that the work has been stored.

---

### User Story 3 - Organize notes to make sense of them (Priority: P3)

As notes accumulate, a person wants to view them in a tidier arrangement — grouped
by kind (advantages, then disadvantages, then neutral) or sorted by how much each
point matters — without permanently reordering anything. The chosen arrangement
applies to all choices at once and is remembered.

**Why this priority**: It improves comprehension once there are many notes, but the
product is already usable in default creation-order view without it.

**Independent Test**: With several mixed notes per choice, toggle Group on and
confirm notes appear in Advantages → Disadvantages → Neutral sections in the chosen
direction; toggle Sort on and confirm Group turns off and notes flatten into a
single list ordered by the chosen key and direction.

**Acceptance Scenarios**:

1. **Given** notes in mixed order, **When** the user turns on Group, **Then** each choice's notes display in fixed sections Advantages → Disadvantages → Neutral, and within Advantages/Disadvantages they order by weight in the chosen direction.
2. **Given** Group is on, **When** the user turns on Sort, **Then** Group turns off automatically (the two are mutually exclusive) and notes display as one flat list.
3. **Given** Sort is on with key = Type, **When** direction is Ascending, **Then** notes order advantage → disadvantage → neutral; **and** when direction is Descending, the order reverses.
4. **Given** any view mode is chosen, **When** the user reloads the page, **Then** the same mode, key, and direction are restored.
5. **Given** the default view, **When** no Group or Sort is active, **Then** notes display in creation order and the secondary configuration row is hidden.

---

### User Story 4 - Read it comfortably and accessibly (Priority: P3)

A person using the app in a bright or dark environment, or relying on more than
color to read information, can comfortably perceive every choice, note, weight, and
score. Weight is never communicated by color alone, the interface stays calm rather
than busy, and empty states feel welcoming rather than broken.

**Why this priority**: It broadens who can use the product and reinforces the calm
intent, but the core reflection loop functions without it.

**Independent Test**: Switch between light and dark themes and confirm legibility;
verify weight is shown by a dot count in addition to color; navigate the note form
by keyboard and close it with Esc; view a brand-new dilemma and confirm calm empty
placeholders rather than blank or collapsed areas.

**Acceptance Scenarios**:

1. **Given** any weighted note, **When** it is displayed, **Then** its weight is conveyed by a dot count (● / ●● / ●●●) in addition to color.
2. **Given** either light or dark theme, **When** content is displayed, **Then** text and indicators remain legible with sufficient contrast.
3. **Given** the note form is open, **When** the user presses Esc, **Then** the form closes; **and** the form's controls are reachable and operable by keyboard.
4. **Given** a brand-new or just-cleared dilemma, **When** it is displayed, **Then** the question shows a ghost placeholder ("What are you deciding?"), two starter choices show placeholder names, and each choice shows a calm "No notes yet" rather than a collapsed card.

### Edge Cases

- **Minimum choices**: With only 2 choices, removing a choice is disabled (the minimum is 2).
- **Maximum choices**: At 4 / 4, Add choice is disabled and explains the maximum is 4.
- **Neutral weight**: Choosing type = neutral disables the weight control (it greys out rather than disappearing, so layout stays stable); neutral notes carry no weight.
- **All-zero state**: A dilemma with no scoring notes shows every score as 0 with no leader highlight.
- **Ties for the lead**: Multiple choices sharing the top score are all highlighted equally; there is no tiebreaker.
- **Starting over**: In v1, Clear is the only way to start over — it wipes all data (question, choices, notes, view settings, theme) back to the default state after a confirmation. There is no separate "new dilemma" action; multi-dilemma management is deferred.
- **Sort by type ties**: When two notes share the same type (or same weight under weight-sort), they fall back to creation order.
- **Rapid edits**: Frequent edits are saved without the user taking an explicit save action.

## Requirements *(mandatory)*

### Functional Requirements

**Dilemma & choices**

- **FR-001**: The app MUST let the user state a single question (the dilemma title) shown as a persistent header, with a ghost placeholder when empty.
- **FR-002**: The app MUST support exactly one active dilemma at a time.
- **FR-003**: The app MUST let the user have between 2 and 4 choices, adding, renaming, and removing them freely.
- **FR-004**: The app MUST prevent removing a choice when only 2 remain, and MUST prevent adding a 5th choice, communicating the 4-choice maximum.
- **FR-005**: The app MUST display a live count of choices in the form N / 4.
- **FR-006**: The app MUST allow editing of any choice title and any note at any time, with no forced sequence or wizard.

**Notes & weights**

- **FR-007**: The app MUST let the user attach notes to a choice, each note having a type of advantage, disadvantage, or neutral.
- **FR-008**: The app MUST let advantage and disadvantage notes carry a weight of 1, 2, or 3; neutral notes MUST carry no weight.
- **FR-009**: The app MUST provide a single unified on-demand form that handles both creating a new note and editing an existing one, including choosing the target choice, type, weight, and text.
- **FR-010**: The note form MUST remain open after adding a note so several notes can be captured in succession, and MUST close on Cancel or Esc.
- **FR-011**: When type = neutral is chosen, the form MUST disable (grey out, not hide) the weight control.
- **FR-012**: Each note MUST display its type sign (+ / − / ~), its color, and — for weighted notes — its weight as a dot count.

**Scoring & summary**

- **FR-013**: The app MUST compute, per choice, a for-total (sum of advantage weights), an against-total (sum of disadvantage weights), and a score equal to for-total minus against-total.
- **FR-014**: Neutral notes MUST never affect any total or score.
- **FR-015**: Scores MUST be derived live from the current notes (never stored) and update immediately on any change.
- **FR-016**: The app MUST always display a quiet, understated, numeric summary per choice (score plus for/against totals), using signed values (+N, −N, 0).
- **FR-017**: The app MUST give the single highest-scoring choice a gentle, non-triumphant highlight; when multiple choices tie for highest, all tied choices MUST receive the same highlight with no tiebreaker.

**Views**

- **FR-018**: The app MUST default to showing notes in creation order, ungrouped and unsorted.
- **FR-019**: The app MUST offer Group and Sort view modes as mutually exclusive toggles, so the active view is always exactly one of Default, Grouped, or Sorted.
- **FR-020**: Grouped view MUST present fixed sections in the order Advantages → Disadvantages → Neutral, ordering weighted notes within a section by weight in the chosen direction, with neutral notes keeping creation order.
- **FR-021**: Sorted view MUST present a single flat list ordered by a chosen key (weight or type) and direction (ascending or descending), falling back to creation order on ties.
- **FR-022**: The chosen view mode, sort key, and direction MUST apply to all choices at once.
- **FR-023**: The secondary configuration controls MUST be visible only when Group or Sort is active.

**Persistence & lifecycle**

- **FR-024**: The app MUST automatically save the dilemma and the view settings locally on the user's device, with no account, login, or network connection required.
- **FR-025**: The app MUST restore the saved dilemma and view settings when the app is reopened or the page is reloaded.
- **FR-026**: The app MUST show a quiet indicator reflecting that work has been saved.
- **FR-027**: The app MUST provide a Clear action that erases all current data — the question, all choices, all notes, the view mode/key/direction, and the theme — resetting everything to the empty default state, asking for confirmation first.
- **FR-028**: In v1, Clear (FR-027) is the only way to start over; there is no separate "new dilemma" action. (Managing multiple dilemmas is deferred — see Assumptions.)
- **FR-029**: The empty default state MUST present a placeholder question and two empty starter choices with placeholder names, each choice showing a calm "No notes yet" and a score of 0.

**Presentation & accessibility**

- **FR-030**: The app MUST offer light and dark themes, with content legible in both.
- **FR-031**: The app MUST never communicate weight by color alone; a dot count MUST always accompany it.
- **FR-032**: The note form MUST be operable by keyboard and closable with Esc.
- **FR-033**: The app MUST present calm empty states rather than blank or collapsed regions.
- **FR-034**: The app MUST display a single quiet author footer sentence.
- **FR-035**: The app MUST present its interface in English.

### Key Entities *(include if feature involves data)*

- **Dilemma**: The single decision under consideration — a question/title plus its choices, with creation and last-updated timestamps.
- **Choice**: One candidate being weighed — a title plus its collection of notes. A dilemma has 2–4 choices.
- **Note**: A single point about a choice — its text, a type (advantage / disadvantage / neutral), and a weight (1–3 for advantage/disadvantage; none for neutral).
- **View Settings**: The user's chosen way of arranging notes — a mode (default / grouped / sorted), a sort key (weight / type), and a direction (ascending / descending), applied to all choices and remembered across sessions.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A first-time user, without any explanation, can create a dilemma and add 2–4 choices.
- **SC-002**: A first-time user can add weighted advantages and disadvantages and neutral notes using the single unified form.
- **SC-003**: A user can correctly interpret a choice's score and its for/against totals on first viewing (the displayed score matches a hand calculation of for-total minus against-total).
- **SC-004**: A user can compare 2–4 choices side by side and identify the leading choice without reading instructions.
- **SC-005**: After reloading the page, 100% of the user's question, choices, notes, weights, and view settings are restored intact.
- **SC-006**: Weight is perceivable without relying on color, verified by reading every weight from its dot count alone.
- **SC-007**: The core loop (state a question, add choices, add notes, read the score) is completable in a single sitting of a few minutes with no setup, account, or network.
- **SC-008**: Users describe the result as calmer than a spreadsheet and as guidance rather than a definitive verdict.

## Assumptions

- The product is intentionally for a **single dilemma at a time**; multi-dilemma history is out of scope for this version.
- All data lives **only on the user's own device**; there is no backend, no account, no sync, and no sharing in this version (a shareable link is explicitly deferred).
- The known property that "more notes pushes the score more extreme" is **accepted for this version** and mitigated by quiet presentation rather than by normalization or caps.
- A **single scoring formula** (for-total minus against-total) ships in this version; selectable scoring formulas are deferred.
- The interface is **English only**; deeper localization is out of scope.
- The following are **deferred to a later version** and out of scope here: shareable read-only link, marking a decision as made, gut-check prompt, soft status labels, balance-bar/visualization, manual drag-to-reorder, and selectable scoring formulas.
- The following are **explicit non-goals** (unchanged from the original product requirements): accounts, collaboration/shared sessions, AI recommendations, custom scoring formulas, more than 4 choices, PDF/CSV export, multi-dilemma history, and charts/advanced analytics.
- Where this specification differs from the original product requirements document, **this specification (derived from the approved design doc) wins**.
