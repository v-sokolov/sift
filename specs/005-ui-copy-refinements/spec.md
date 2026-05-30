# Feature Specification: UI Copy Refinements — Header Intro, Score Formula, "Point" Relabel

**Feature Branch**: `005-ui-copy-refinements`

**Created**: 2026-05-30

**Status**: Draft

**Input**: User description: "Header intro + score-formula caption + 'note'→'point' relabel for Sift (EN + UA). Three changes, copy/markup/CSS only — no behavior change. (1) A brand name + tagline above the dilemma input, explaining what Sift is. (2) A single muted caption below the per-choice score band explaining how the score is computed. (3) Relabel the umbrella noun shown in the UI from 'note' to 'point' (EN) / 'нотатка'→'пункт' (UA), keeping the advantage/disadvantage/neutral type words and the 'Choice'/«Варіант» term unchanged."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Understand what Sift is on arrival (Priority: P1)

A first-time visitor lands on Sift and immediately sees the product name and a short,
calm tagline above the decision input, telling them what the tool is for and reassuring
them that it never decides for them. They can read this intro in their own language and it
switches when they change the language.

**Why this priority**: First impression and orientation. Without it, a new visitor sees only
an empty input and must guess the tool's purpose. This is the highest-leverage clarity win
and is independently shippable.

**Independent Test**: Load the app with no prior data; confirm a heading reading the brand
name and a tagline appear above the decision input, the tagline reads the localized copy,
and switching language updates the tagline text while the brand name stays the same.

**Acceptance Scenarios**:

1. **Given** a fresh visit in English, **When** the app loads, **Then** the brand name and the
   English tagline appear above the decision input.
2. **Given** the app is showing English, **When** the user switches to Ukrainian, **Then** the
   tagline changes to the Ukrainian copy and the brand name is unchanged.
3. **Given** either language, **When** the intro renders, **Then** its text meets WCAG AA
   contrast against the background in both light and dark themes.

---

### User Story 2 - Understand how the score is calculated (Priority: P2)

A user comparing choices sees the per-choice scores and wants to know what the number means.
A single short caption directly below the score band explains, in the active language, that
each advantage adds its weight, each disadvantage subtracts it, and neutral points don't count.

**Why this priority**: Builds trust in the score by making it transparent ("a gentle nudge,
never a verdict"). Valuable but secondary to first-load orientation; independently shippable.

**Independent Test**: With at least one choice scored, confirm exactly one caption appears
below the score cells (not inside any score cell), reads the localized formula copy, and
updates on language switch.

**Acceptance Scenarios**:

1. **Given** the score band is visible, **When** it renders, **Then** a single full-width
   caption appears below the score cells explaining the calculation.
2. **Given** the caption is showing English, **When** the user switches to Ukrainian, **Then**
   the caption text changes to the Ukrainian copy.
3. **Given** either theme, **When** the caption renders, **Then** its text meets WCAG AA
   contrast against the background.

---

### User Story 3 - Consistent, plain umbrella term for entries (Priority: P3)

A user adding items to a choice sees them referred to by a single, plain umbrella word —
"point" in English, «пункт» in Ukrainian — instead of "note"/«нотатка», across the add
button, empty states, and accessibility labels. The specific type words
(advantage/disadvantage/neutral) and the "Choice"/«Варіант» term are unchanged.

**Why this priority**: A wording-consistency polish that pairs with the existing "What's the
point?" placeholder. Lowest user-visible impact of the three; independently shippable.

**Independent Test**: Inspect the add-entry button, the empty-choice message, the empty-entry
display text, and the entry-type / entry-text accessibility labels; confirm each uses
"point"/«пункт» (correctly declined in Ukrainian), while type words and «Варіант» are unchanged.

**Acceptance Scenarios**:

1. **Given** English, **When** viewing the add-entry control, **Then** it reads "add point".
2. **Given** Ukrainian, **When** viewing the same control, **Then** it reads «додати пункт» and
   the empty-state and label strings use the correct «пункт» declensions.
3. **Given** either language, **When** viewing entry-type labels, **Then** the
   advantage/disadvantage/neutral words and the "Choice"/«Варіант» term are unchanged.

---

### Edge Cases

- When there are zero choices, the header intro still shows; the score caption only appears
  when the score band is present.
- Language switching must update the intro tagline, the score caption, and all relabeled
  strings without requiring a reload.
- The intro and caption are static text (no inputs), so they must not affect focus behavior in
  the decision-title input or anywhere else.
- Relabeling changes displayed wording only; it must not change stored data, the underlying
  entry concept, or the scoring outcome.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The app MUST display the brand name and a localized tagline above the decision
  input, on every load including the empty/first-visit state.
- **FR-002**: The brand name MUST be identical in all languages and MUST NOT be translated.
- **FR-003**: The tagline MUST be available in both English and Ukrainian and MUST update when
  the active language changes.
- **FR-004**: The app MUST display exactly one caption, below the per-choice score band,
  explaining that each advantage adds its weight, each disadvantage subtracts it, and neutral
  entries don't count.
- **FR-005**: The score caption MUST be available in both English and Ukrainian and MUST update
  when the active language changes.
- **FR-006**: The score caption MUST be visually distinct from the per-choice score cells (it is
  a separate full-width element, not one of the score cells).
- **FR-007**: The umbrella term shown for entries MUST read "point" in English and «пункт»
  (correctly declined per context) in Ukrainian across the add-entry control, empty-choice
  message, empty-entry display text, and the entry-type and entry-text accessibility labels. The
  existing entry-text input placeholder ("What's the point?" / «У чому суть?») is deliberately
  left unchanged.
- **FR-008**: The entry-type words (advantage, disadvantage, neutral) and the "Choice"/«Варіант»
  term MUST remain unchanged.
- **FR-009**: All user-facing text introduced or changed MUST be provided in both language
  catalogs, preserving full English/Ukrainian parity.
- **FR-010**: The changes MUST be presentation-only: no change to scoring, stored data, the
  entry concept, the number of dependencies, or any network/backend behavior (none exists).
- **FR-011**: New and changed text MUST meet WCAG AA contrast in both light and dark themes.
- **FR-012**: Adding the intro and caption MUST NOT introduce focus loss or change focus
  behavior in any input.

### Key Entities

- **Brand intro**: The product name plus a one-sentence tagline shown above the decision input;
  localized tagline, non-translated name.
- **Score caption**: A single localized sentence explaining the score calculation, shown below
  the score band.
- **Entry (umbrella term)**: The concept covering advantage/disadvantage/neutral items within a
  choice; its displayed umbrella label changes from "note"/«нотатка» to "point"/«пункт» while
  the concept, type words, and data are unchanged.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of app loads (including the empty first-visit state) show the brand name and
  localized tagline above the decision input.
- **SC-002**: In both languages, switching language updates the tagline and the score caption
  text with no page reload, in a single interaction.
- **SC-003**: Exactly one score-explanation caption is present below the score band, and it is
  not counted among the per-choice score cells.
- **SC-004**: 100% of the relabeled strings show "point"/«пункт» while the
  advantage/disadvantage/neutral type words and "Choice"/«Варіант» remain unchanged.
- **SC-005**: Both language catalogs remain at full key parity with no blank or
  untranslated/raw-key values.
- **SC-006**: All introduced/changed text meets WCAG AA contrast (≥ 4.5:1 for body text) in both
  light and dark themes.
- **SC-007**: The full automated test suite and the type-check pass with the changes applied.

## Assumptions

- The brand name shown in the intro is "Sift" and is never localized.
- The exact tagline and caption copy for both languages is supplied by the maintainer and used
  verbatim (English and Ukrainian provided in the feature input).
- The Ukrainian umbrella term is «пункт» (masculine inanimate), declined per context; the
  existing "What's the point?" / «У чому суть?» placeholder is kept and pairs with it.
- Existing internationalization, theming, and the per-choice scoring/score-band remain in place
  and are reused; only copy, markup, and styling change.
- "Point type" / "Point text" are the labels for the entry-type selector and the entry-text
  field accessibility names, respectively.
