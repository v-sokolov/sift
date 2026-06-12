<!--
Sync Impact Report
- Version change: 2.1.0 → 2.2.0 (latest)
- Bump rationale (2.2.0): MINOR — scope re-scope per feature 015-six-choices. The
  scope-discipline constraint "a single active dilemma with 2–4 choices" widens to
  "2–6 choices", and Principle IV's invariant example updates to match ("e.g. 2–6
  choices"). This exercises the documented "out of scope until explicitly re-scoped"
  path (015 spec/plan are the explicit re-scope); no principle is added, removed, or
  redefined. Note: the same scope line's "English only" wording remains stale vs the
  shipped EN/UA i18n (002) — deliberately untouched here to keep the amendment minimal;
  candidate for a future PATCH. Templates: no change required (Constitution Check reads
  dynamically).
- Prior — Version change: 2.0.0 → 2.1.0
- Bump rationale (2.1.0): MINOR — materially expanded guidance. Added a "Build gate" to
  Development Workflow & Quality Gates: the production build (`yarn build`) MUST succeed,
  verified against a clean dependency install, before work is done. Motivated by 013 — a
  `bits-ui` peer dependency removed in 012 passed `tsc` + `vitest` but broke `vite build` on
  CI's clean install. No principle added/removed/redefined; the type-check + test gate is
  unchanged, this adds a parallel build gate. Templates: no change required (Constitution
  Check reads dynamically).
- Prior — Version change: 1.0.0 → 2.0.0
- Bump rationale (2.0.0): MAJOR — Principle III is redefined. The hard "no UI framework and no
  runtime dependencies" ban is replaced with a "minimal, justified dependencies" rule that
  permits a UI framework and headless component libraries for the phase-2 UI rebuild
  (004-phase2-ui-rebuild). This is a backward-incompatible principle redefinition per the
  governance semver policy. Principles I, II, IV, V are unchanged in intent.
- Principles (current):
  1. Calm Over Features (unchanged)
  2. Client-Side & Private (unchanged — now the explicit hard boundary for dependencies)
  3. Deliberate Simplicity (RENAMED from "Simplicity & Clean Structure"; rule relaxed:
     framework + minimal justified runtime deps allowed)
  4. Pure Core, Test-First (NON-NEGOTIABLE) (unchanged)
  5. Accessibility by Default (unchanged)
- Modified sections:
  - Core Principle III rewritten (see above).
  - "Technology & Architecture Constraints" — dependency bullet rewritten to permit a
    framework + justified runtime deps bounded by Principle II; presentation-structure
    wording made framework-neutral.
- Added sections: none. Removed sections: none.
- Templates reviewed:
  ✅ .specify/templates/plan-template.md — Constitution Check reads the constitution
     dynamically; no hardcoded principle list to update.
  ✅ .specify/templates/spec-template.md — no structural change required.
  ✅ .specify/templates/tasks-template.md — "framework" references are generic
     placeholders, not principle-driven; no change required.
- Follow-up TODOs:
  ✅ CLAUDE.md stack line updated to reflect the phase-2 framework allowance.
  ⚠ specs/001-sift-mvp/plan.md / 002 / 003 "Constitution Check" sections were evaluated
     against v1.0.0; they remain valid (those features are framework-free). No re-eval needed
     unless reopened.
  ⚠ .specify/memory/ is git-ignored (solo-project choice); this file is not versioned
     unless that path is un-ignored.
-->

# Sift Constitution

## Core Principles

### I. Calm Over Features

Sift optimizes for clarity over comprehensiveness, calm over feature density, and
reflection over automation. The score is a gentle aid, never a verdict — the UI MUST
stay quiet and understated and MUST NOT push the user toward number-chasing or declare
a "winner." Every new feature MUST justify itself against this restraint; when in doubt,
leave it out. Additions that increase cognitive load without clear reflective value MUST
be rejected or deferred.

**Rationale**: The product's entire value is a calm, trustworthy aid for everyday
decisions. Feature creep would erode the one thing that distinguishes it from a spreadsheet.

### II. Client-Side & Private

Sift MUST remain fully client-side: no backend, no account, no network calls, no
telemetry, and no third-party runtime services. All user data MUST live only on the
user's own device and MUST never leave it. The app MUST function offline and load from
static hosting. Any feature requiring a server, sign-in, or data egress is out of scope
and MUST be re-evaluated against this principle before consideration.

**Rationale**: Privacy and zero-friction use are core promises; a person should be able
to weigh a private decision without trusting anyone else with it.

### III. Deliberate Simplicity

The codebase MUST stay simple, legible, and small. Dependencies — including a UI framework
and headless component libraries — are permitted, but each runtime dependency MUST be
justified by a material gain in UI quality, accessibility, or maintainability that
hand-rolling would not achieve as well, and MUST be compatible with Principle II (no
dependency may add a backend, network call, telemetry, or any data egress). Prefer the
smallest dependency that does the job; prefer headless/unstyled primitives whose markup we
own over heavy all-in-one kits; avoid component models that copy large vendor source into
the repository when an installed package serves. A framework runtime is acceptable;
framework sprawl and gratuitous dependencies are not — bundle size and cognitive load MUST
stay modest. Code MUST be organized into small, single-purpose units with a clear,
predictable structure that keeps pure logic, state, persistence, and presentation separate.
Clean-code practices (clear names, small functions, no dead code) are expected.
Overengineering is prohibited — YAGNI applies; abstractions and dependencies MUST be
introduced only when a concrete, present need justifies them.

**Rationale**: The MVP proved a zero-dependency build, but phase-2's themed, animated, fully
accessible UI is materially easier to build correctly and maintain on a small reactive
framework plus accessible headless primitives. Simplicity is the goal; "zero dependencies"
was a means toward it, not the goal itself — so the rule now targets minimal, justified
dependencies and a strict separation of concerns rather than an absolute ban.

### IV. Pure Core, Test-First (NON-NEGOTIABLE)

Domain logic — scoring and note arrangement — MUST be implemented as pure, side-effect-free
functions. State mutations MUST be typed and MUST enforce the data invariants (e.g.
2–6 choices, neutral notes carry no weight). Test-Driven Development is mandatory:
tests are written first and MUST fail before implementation, following red-green-refactor.
Pure logic and persistence MUST have unit tests; behavior changes MUST be accompanied by
tests. Code MUST NOT merge with failing tests or type errors.

**Rationale**: The only real logic lives in scoring/arrangement; keeping it pure and
test-first makes correctness cheap to guarantee and refactoring safe.

### V. Accessibility by Default

Information MUST never be conveyed by color alone — weight MUST always be shown by an
explicit dot count in addition to color. All interactive controls (including the note
form) MUST be fully keyboard-operable, and the form MUST close on Esc. Text and
indicators MUST meet WCAG AA contrast in both light and dark themes. Empty states MUST be
calm and legible rather than blank or collapsed.

**Rationale**: A reflective tool should be usable by everyone and in any lighting; access
is a baseline, not an enhancement.

## Technology & Architecture Constraints

- Language/build: TypeScript (strict) + Vite; output is a static single-page app.
- A UI framework and runtime dependencies are permitted under Principle III: each MUST be
  minimal, justified, and consistent with Principle II (no backend, no network, no telemetry,
  no data egress). Headless/ownable component primitives are preferred over heavy pre-styled
  kits; copy-source-into-repo component models are avoided in favor of installed packages.
  Dev dependencies (test runner, types, build tooling) kept to the minimum needed.
- Persistence is browser `localStorage` only, behind versioned key(s), with defensive
  loading (invalid/old data falls back to a valid default — never crashes).
- Architecture: one source-of-truth application state with a small, typed store; all
  mutations go through typed functions; pure functions isolate scoring and arrangement;
  presentation is organized as small, single-purpose units (components or render functions)
  with a strict separation between state and presentation.
- Scope discipline: a single active dilemma with 2–6 choices; English only. Anything
  beyond (multi-dilemma, sharing, accounts, AI, export) is out of scope until explicitly
  re-scoped, consistent with Principles I and II.

## Development Workflow & Quality Gates

- Spec-Driven flow: changes of any size flow through specify → plan → tasks → implement;
  `/speckit-analyze` is used to cross-check artifacts before implementation.
- TDD gate (Principle IV): tests precede implementation and MUST pass; the type-check
  (`tsc`) and test suite (`vitest`) MUST be green before work is considered done.
- Build gate: the production build (`yarn build` → `svelte-check` + `vite build`) MUST
  succeed before work is considered done. A green type-check and test suite do NOT by
  themselves prove the app builds or deploys — an unsatisfied transitive/peer dependency,
  a bundler resolution error, or a build-only failure can pass `tsc` + `vitest` yet break
  the build (e.g. 013: a `bits-ui` peer dependency removed as "unused" passed both gates but
  broke `vite build`). The build MUST be verified against a **clean dependency install** (as
  CI does), since a stale `node_modules` can mask a missing declared dependency.
- Commits are made in small, logical increments with clear messages.
- Every plan's "Constitution Check" MUST be evaluated against these principles; violations
  MUST be justified in the plan's Complexity Tracking or the design MUST be simplified.

## Governance

This constitution supersedes other practices for the Sift project. Amendments MUST be made
by editing this file, accompanied by a version bump and a one-line rationale in the commit
message. Versioning follows semantic versioning: **MAJOR** for backward-incompatible
governance or principle removals/redefinitions, **MINOR** for a new principle or materially
expanded guidance, **PATCH** for clarifications and wording. Compliance is reviewed at plan
time (the plan's Constitution Check) and during `/speckit-analyze`; constitution conflicts
are treated as blocking and are resolved by adjusting the spec, plan, or tasks — not by
diluting a principle.

**Version**: 2.2.0 | **Ratified**: 2026-05-30 | **Last Amended**: 2026-06-03
