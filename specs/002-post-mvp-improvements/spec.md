# Feature Specification: Sift Post-MVP Improvements

**Feature Branch**: `002-post-mvp-improvements`

**Created**: 2026-05-30

**Status**: Draft

**Input**: User description: "docs/superpowers/specs/2026-05-30-sift-improvements-design.md — a batch of mixed post-MVP improvements: UA/EN localization, author footer links, a Suggest-a-feature flow, a folder-structure cleanup, and a public README."

## Clarifications

### Session 2026-05-30

- Q: Author identity for footer/README/mailto? → A: Display name **Vitalii Sokolov**;
  GitHub `https://github.com/v-sokolov`; LinkedIn
  `https://www.linkedin.com/in/vitalii-sokolov/`; maintainer email
  `vetalsokolov4@gmail.com` used **only** as the `mailto:` target — never displayed on the
  site or in the README.
- Q: With the email hidden, what is the no-mail-client fallback for the suggestion flow? →
  A: A quiet link to the author's **LinkedIn** profile (never the email).

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Use Sift in Ukrainian or English (Priority: P1)

A Ukrainian- or Russian-speaking visitor opens Sift for the first time and sees the
interface in Ukrainian; an English speaker (or anyone else) sees it in English. Either
person can flip the language at any time with a small header toggle, and Sift remembers
that choice on their next visit.

**Why this priority**: Localization touches every screen and every other improvement in
this batch (footer text, the suggestion modal, the language toggle itself all depend on
it). It delivers the broadest reach and is the foundation the other user-facing copy
plugs into, so it must land first.

**Independent Test**: With no stored preference, set the browser language to Ukrainian and
load the app — all visible copy is Ukrainian; set it to English (or any non-UA/RU value)
and reload — all copy is English. Use the header toggle to switch languages and confirm
every label updates live; reload and confirm the chosen language persists.

**Acceptance Scenarios**:

1. **Given** a first-time visitor with a browser language starting `uk` or `ru` and no
   stored preference, **When** they open Sift, **Then** the entire interface is shown in
   Ukrainian.
2. **Given** a first-time visitor with any other browser language and no stored
   preference, **When** they open Sift, **Then** the entire interface is shown in English.
3. **Given** the app open in one language, **When** the visitor uses the header language
   toggle, **Then** all visible copy switches to the other language immediately without a
   page reload and without losing their current board.
4. **Given** a visitor who has chosen a language, **When** they reload or revisit later,
   **Then** Sift opens in their chosen language regardless of browser language.
5. **Given** a copy key that has no Ukrainian translation, **When** the interface renders
   in Ukrainian, **Then** the English text is shown for that key rather than a blank or a
   raw key name.

---

### User Story 2 - Suggest a feature (Priority: P2)

A user who enjoys Sift wants to propose an improvement. They click a quiet "Suggest a
feature" link in the header, fill in their name and a description (optionally a contact
email and profile links), and click Send. Their own email client opens with a message to
the maintainer already composed from what they entered, ready for them to review and send.

**Why this priority**: It is the only new interactive capability for end users and creates
a feedback channel, but the product is fully usable without it — so it ranks below
localization.

**Independent Test**: Open the suggestion link, confirm the Send action is disabled until
both name and description are filled, click Send with valid input, and confirm the email
client opens with a message addressed to the maintainer whose subject and body reflect the
entered fields. Confirm the modal is fully keyboard-operable and closes on Esc.

**Acceptance Scenarios**:

1. **Given** the app is open, **When** the user activates the "Suggest a feature" link,
   **Then** a modal dialog opens with focus moved into it and the rest of the page inert.
2. **Given** the suggestion modal is open, **When** either name or description is empty,
   **Then** the Send action is unavailable; **When** both are non-empty, **Then** Send
   becomes available.
3. **Given** a completed form, **When** the user clicks Send, **Then** the user's email
   client opens with a new message addressed to the maintainer, with a subject and a body
   pre-filled from the entered fields, and the app transmits nothing itself.
4. **Given** the suggestion modal is open, **When** the user presses Esc or activates the
   close control, **Then** the modal closes and focus returns to the link that opened it.
5. **Given** the interface is in Ukrainian or English, **When** the modal is shown, **Then**
   all of its labels and placeholders appear in the active language.

---

### User Story 3 - Find the author from the app (Priority: P3)

A curious user reads the quiet footer line and follows a link to learn who made Sift,
reaching the author's GitHub profile or LinkedIn.

**Why this priority**: Attribution and discoverability are nice-to-have polish; they add no
core decision-weighing value, so they rank below the interactive suggestion flow.

**Independent Test**: Load the app in both light and dark themes, locate the footer
sentence, and confirm the author name links to the GitHub profile and a second quiet link
goes to LinkedIn — both readable (meeting contrast) and unobtrusive in either theme, and
localized.

**Acceptance Scenarios**:

1. **Given** the app is open, **When** the user reads the footer, **Then** the author's
   name is a link to the author's GitHub profile and a second quiet link points to the
   author's LinkedIn.
2. **Given** either light or dark theme, **When** the footer is shown, **Then** the links
   meet AA contrast and remain visually calm and unobtrusive.
3. **Given** the interface language is Ukrainian or English, **When** the footer is shown,
   **Then** its sentence appears in the active language.

---

### User Story 4 - Understand the project from its README (Priority: P4)

Someone who finds the public repository reads a short, friendly README and quickly grasps
what Sift is, sees it in action, and learns how to run it locally.

**Why this priority**: It serves repository visitors rather than app users and has no
effect on the running product, so it is the lowest priority in the batch.

**Independent Test**: Open the README and confirm it contains, in order, a one-line pitch,
a screenshot of the comparison screen, a short feature list, the tech stack, local-run
instructions, the license, and author links — and that the run instructions actually work
on a clean checkout.

**Acceptance Scenarios**:

1. **Given** the repository, **When** a visitor opens the README, **Then** they see a
   title with a one-line pitch and a screenshot of the comparison screen.
2. **Given** the README, **When** a visitor reads it, **Then** they find a concise feature
   list, the tech stack, local-run instructions, the license (MIT), and author links.
3. **Given** a clean checkout, **When** a visitor follows the local-run instructions,
   **Then** the app starts successfully.

---

### Edge Cases

- **No stored language + unrecognized browser language** → defaults to English.
- **Stored language present** → always wins over browser-language detection.
- **Missing translation key** → falls back to the English string (never blank, never a raw
  key).
- **Suggestion form with only whitespace** in name or description → treated as empty; Send
  stays unavailable.
- **No email client configured / mailto unsupported** → a quiet LinkedIn-profile link gives
  an alternate way to reach the maintainer; the email address is never shown.
- **Very long description** → encoded safely into the email body without breaking the
  composed message.
- **Language switched while the suggestion modal is open** → modal copy updates to the new
  language without losing entered data.
- **Refactor regressions** → the existing automated test suite must stay green; any
  behavior change is a defect, not an accepted outcome.

## Requirements *(mandatory)*

### Functional Requirements

**Localization (US1)**

- **FR-001**: The system MUST present all user-facing copy in either Ukrainian or English,
  selected by a single active-language setting.
- **FR-002**: On first visit with no stored preference, the system MUST default to
  Ukrainian when the browser's primary language begins with `uk` or `ru`, and to English
  otherwise.
- **FR-003**: The system MUST provide a header control to switch between Ukrainian and
  English, applying the change immediately to all visible copy without a page reload.
- **FR-004**: The system MUST persist the chosen language on the user's device and apply it
  on subsequent visits, overriding browser-language detection.
- **FR-005**: When a copy key is missing in the active language, the system MUST display the
  English value for that key.
- **FR-006**: Switching language MUST NOT alter or clear the user's current board (question,
  choices, notes, scores) or view settings.

**Suggest a feature (US2)**

- **FR-007**: The system MUST present a quiet, non-prominent "Suggest a feature" entry point
  in the header.
- **FR-008**: Activating that entry point MUST open an accessible modal dialog that traps
  focus, closes on Esc, and returns focus to the trigger on close.
- **FR-009**: The suggestion form MUST offer fields for name (required), description
  (required), contact email (optional), GitHub link (optional), and LinkedIn link
  (optional).
- **FR-010**: The system MUST keep the Send action unavailable until both name and
  description contain non-whitespace content.
- **FR-011**: On Send, the system MUST open the user's email client with a new message
  addressed to the maintainer, with a subject and a body pre-filled from the entered
  fields. The app itself MUST NOT transmit the submission over the network or store it.
- **FR-012**: The system MUST provide a quiet fallback link to the author's LinkedIn profile
  so users without a configured email client can still reach the maintainer. The
  maintainer's email address MUST NOT be displayed anywhere in the interface; it is used
  only as the (hidden) `mailto:` target.
- **FR-013**: All suggestion-form labels and placeholders MUST be localized per the active
  language.

**Author footer (US3)**

- **FR-014**: The footer sentence MUST link the author's name to the author's GitHub profile
  and MUST include a second quiet link to the author's LinkedIn.
- **FR-015**: Footer links MUST remain visually calm and unobtrusive and MUST meet AA
  contrast in both light and dark themes.
- **FR-016**: The footer sentence MUST be localized per the active language.

**Public README (US4)**

- **FR-017**: The repository MUST include a concise README containing, in order: a one-line
  pitch, a screenshot of the comparison screen, a short feature list, the tech stack,
  local-run instructions, the license (MIT), and author links.
- **FR-018**: The README's local-run instructions MUST be accurate against a clean checkout.

**Structure cleanup (cross-cutting)**

- **FR-019**: The codebase cleanup MUST NOT change any observable user behavior; all
  existing automated tests MUST continue to pass after it.
- **FR-020**: The cleanup MUST be limited to clear, low-risk clarity improvements (coherent
  layout, dead-code removal, consistent naming, test colocation) and MUST skip any change
  that is risky or not a clear win.

### Key Entities *(include if feature involves data)*

- **Language preference**: the active interface language (`Ukrainian` or `English`), stored
  on the user's device; absence means "not yet chosen" and triggers browser-based
  detection.
- **Message catalog**: the set of `key → text` mappings for each supported language;
  English is the complete reference set and the fallback for missing keys.
- **Feature suggestion**: a user-submitted proposal consisting of name, description, and
  optional contact email, GitHub link, and LinkedIn link; composed into a pre-filled email
  opened in the user's own mail client, and never transmitted or stored by the app.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of user-facing strings render in the active language with no raw keys or
  blanks visible in either Ukrainian or English.
- **SC-002**: A first-time visitor with a Ukrainian/Russian browser language sees Ukrainian,
  and any other visitor sees English, on initial load with no manual action.
- **SC-003**: Switching language updates the entire interface in under 1 second and the
  choice survives a reload.
- **SC-004**: A user can open the suggestion link, complete the form, and have their email
  client open with the submitted content pre-composed in under 1 minute.
- **SC-005**: The suggestion modal is fully operable by keyboard alone (open, complete,
  submit, close) and closes on Esc with focus restored to the trigger.
- **SC-006**: Footer and all themed text meet AA contrast in both light and dark themes.
- **SC-007**: A newcomer following the README's local-run instructions on a clean checkout
  gets the app running on the first attempt.
- **SC-008**: The full automated test suite passes after the structure cleanup with no
  change in user-facing behavior.

## Assumptions

- The work builds on the **existing plain-TS MVP codebase** (no UI framework, no runtime
  dependencies), keeping the project compliant with Constitution Principle III. The design
  doc's reference to a Svelte 5 + Tailwind + Bits UI stack is superseded: all improvements
  are implemented in plain TypeScript with the MVP's existing accessible render patterns.
  The MVP's frozen functional requirements remain in force; these improvements are additive.
- Localization scope is exactly two languages (Ukrainian, English) with English as the
  default and fallback; no pluralization, date/number formatting, async message loading, or
  route-based locales are in scope.
- The suggestion flow is delivered via a `mailto:` hand-off: clicking Send opens the user's
  own email client with a pre-composed message. The app makes **no network call** and stores
  nothing, so the flow stays fully client-side and consistent with Constitution Principle II
  (Client-Side & Private). Delivery ultimately depends on the user sending the email from
  their client.
- Author identity is fixed: display name **Vitalii Sokolov**, GitHub
  `https://github.com/v-sokolov`, LinkedIn `https://www.linkedin.com/in/vitalii-sokolov/`.
  The maintainer email `vetalsokolov4@gmail.com` is used **only** as the `mailto:` target and
  MUST NOT appear in the visible UI or the README. The repository URL is the only remaining
  placeholder, filled at implementation time.
- Exact Ukrainian translations for each key are drafted during implementation; the spec
  fixes which surfaces must be translated, not the wording.
- The package manager is yarn and the license is MIT.
- The structure cleanup is optional ("if needed & safe"): it proceeds only where it is a
  clear, low-risk improvement and is verified by the existing test suite.
