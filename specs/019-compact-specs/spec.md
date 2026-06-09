# Feature Specification: Review & Compact Existing Specs (and Other Artifacts)

**Feature Branch**: `019-compact-specs`

**Created**: 2026-06-09

**Status**: Draft

**Input**: User description: "review and compacting existing specs (and other artifacts)"

## Scope

The `specs/` tree holds **17 completed feature folders** (001–016, 018; 017 was specced but
never shipped) totalling roughly **15,000 lines** of markdown across `spec.md`, `plan.md`,
`research.md`, `tasks.md`, `data-model.md`, `quickstart.md`, `contracts/*`, and
`checklists/*` (this ~15,000 is the **pre-019 baseline** — these 17 folders only, excluding this
feature's own `specs/019-*` artifacts; see SC-001). Every one of these features has **already
merged and shipped** (PRs #1–#19),
and `CLAUDE.md` already carries a dense one-paragraph summary of each. The full artifact set
is therefore largely **historical record**: valuable for the *why* behind past decisions, but
heavy to load, redundant against `CLAUDE.md`, and cluttered with process scaffolding (task
checklists, TDD red-first notes, status placeholders) that no longer informs future work.

This feature **reviews and compacts** that record. It applies a **tiered treatment** decided
by each spec's lasting significance:

- **Archive & freeze** the tiny / insignificant specs — narrow hotfixes and CSS-only tweaks
  that are fully captured by their `CLAUDE.md` summary — down to a single minimal stub,
  removing their process artifacts.
- **Condense in place** the substantial / sensible specs — the ones whose decisions, research
  IDs, and contract laws are still referenced by `CLAUDE.md` and by later features — applying
  three techniques together: **cut context cost** (trim boilerplate and process scaffolding),
  **improve readability** (clear, scannable summaries), and **remove redundancy** (one source
  of truth per fact; don't repeat what `CLAUDE.md` already states).

Scope covers **all** spec folders, **including the active 018**. Folders are condensed **in
place** — the `specs/NNN-*/` structure is preserved (directory names and numbers unchanged),
not consolidated into a single history document and not relocated.

This is a **documentation-only** change. It touches **no application source, tests, build,
runtime behaviour, UI, or persisted state**. The single hard invariant: **no decision context
that is cross-referenced elsewhere may be lost** (see FR-007 / Edge Cases).

## Clarifications

### Session 2026-06-09

- Q: What is the primary goal of compacting? → A: **Tiered.** Archive & freeze the most tiny /
  insignificant specs; for everything more important and sensible, apply all three techniques
  together — cut context cost, improve readability, and remove redundancy.
- Q: Which specs are in scope? → A: **All** spec folders, **including the active 018**.
- Q: How should compacting be done to each spec? → A: **Condense in place** — keep the
  per-spec directory structure; do not collapse into one file or a single history doc.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - An agent loads a past feature's context cheaply (Priority: P1)

An agent (or a person) working on a new feature needs to understand a prior decision — e.g.
"why was `@internationalized/date` restored?", "what is the 014 dialog placement CSS?", "what
does the 008 `groupKey` defensive-default precedent say?". They open the relevant `specs/NNN-*/`
folder and find a compact, readable record that answers the question quickly, without wading
through task lists, red-first test notes, or text duplicated from `CLAUDE.md`.

**Why this priority**: This is the core value — the spec tree exists to inform future work, and
its cost-to-load is what compaction reduces. Delivers value even if only the heavyweight specs
are condensed.

**Independent Test**: Pick three facts that `CLAUDE.md` cross-references into specs (e.g. the
013 peer-dep rationale, the 012 inline-Dialog pattern, the 009 `arrange()` ordering law). Open
each referenced spec folder post-compaction and confirm the fact is present, correct, and found
in under ~30 seconds of reading.

**Acceptance Scenarios**:

1. **Given** a heavyweight spec folder, **When** it is condensed in place, **Then** its
   directory still exists under the same `specs/NNN-name/` path and its preserved files read as
   coherent, self-contained summaries with no broken internal references.
2. **Given** a fact stated in both `CLAUDE.md` and a spec, **When** compaction removes
   redundancy, **Then** the fact survives in at least one canonical place and the spec does not
   restate `CLAUDE.md` verbatim.

---

### User Story 2 - Insignificant hotfix specs are frozen to stubs (Priority: P2)

A maintainer browsing `specs/` sees that narrow, fully-superseded specs (one-line CSS fixes,
peer-dep hotfixes) no longer carry a full artifact set. Each is reduced to a single short,
clearly-labelled archived stub that records what it did and points at its `CLAUDE.md` summary
and merged PR, with process artifacts removed.

**Why this priority**: Removes the most clutter for the least risk — these specs hold little
reusable decision context. Independent of US1.

**Independent Test**: Identify the tiny/insignificant specs by the classification criteria
(FR-002). Confirm each is reduced to a single archived stub and its process artifacts
(`tasks.md`, `checklists/`, etc.) are removed, while its existence and outcome remain
discoverable.

**Acceptance Scenarios**:

1. **Given** a spec classified as tiny/insignificant, **When** it is archived & frozen, **Then**
   only a single concise stub file remains in its folder, marked as archived, naming its outcome
   and merged PR.
2. **Given** an archived stub, **When** a reader needs more detail, **Then** the stub points to
   the authoritative remaining source (the `CLAUDE.md` summary and/or git history).

---

### User Story 3 - The compaction is reviewable and reversible (Priority: P3)

A reviewer can see exactly what was removed versus rewritten, in one self-contained change, and
trust that nothing load-bearing was dropped — because the original content remains recoverable
from git history.

**Why this priority**: Confidence and auditability. Lower priority because it constrains *how*
the work lands rather than the compaction itself.

**Independent Test**: Review the diff as a single documentation change; confirm it touches only
`specs/**` (plus any index/`CLAUDE.md` updates) and that pre-compaction content is recoverable
via git.

**Acceptance Scenarios**:

1. **Given** the completed compaction, **When** the diff is reviewed, **Then** it modifies only
   documentation under `specs/**` (and, if needed, `CLAUDE.md`), with zero changes to `src/**`,
   `tests/**`, build config, or `package.json`.
2. **Given** a need to recover original detail, **When** a reviewer inspects git history, **Then**
   the full pre-compaction artifact for any spec is retrievable.

---

### Edge Cases

- **Cross-referenced anchors**: `CLAUDE.md` and later specs cite specific IDs — research
  decisions (e.g. `R1–R7`), contract laws (e.g. `O1–O6`, `C1–C4`, `B1–B6`), data-model fields,
  and named patterns ("012 pattern", "014 placement CSS", "008 `groupKey` precedent"). If
  compaction removes a file that defines a cross-referenced anchor, the reference breaks. The
  anchor's *meaning* MUST be preserved somewhere it can still be found.
- **Active feature 018**: 018 is the current `CLAUDE.md` "Active feature". Compacting it must not
  remove detail that in-flight or imminent work still depends on; it should be condensed
  conservatively, not frozen as archived.
- **Borderline classification**: a spec that is small in line count but holds a reusable
  decision (e.g. a governance/constitution amendment) is **not** "insignificant" and should be
  condensed, not frozen to a stub.
- **The 017 gap**: 017 was specced but never shipped (no `specs/017-*` folder exists). Compaction
  must not invent or renumber to fill the gap; numbering stays as-is.
- **Constitution & governance notes**: amendments to the project constitution recorded inside
  specs (e.g. the 013 Build gate, 015 re-scope) are decision context and MUST be preserved.
- **External links**: links to PRs, issues, or external docs in kept files must remain valid.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The compaction MUST cover **all** spec folders under `specs/` (001–016, 018),
  including the currently-active **018**, with each folder treated **in place** (same path,
  number, and name).
- **FR-002**: Each spec MUST be classified into one of two tiers by **lasting significance**
  (not line count alone): *tiny/insignificant* (narrow hotfix or cosmetic change fully captured
  by its `CLAUDE.md` summary, holding no reusable decision context) → **archive & freeze**; vs
  *substantial/sensible* (decisions, research IDs, or contract laws referenced by `CLAUDE.md` or
  later features) → **condense in place**.
- **FR-003**: For **archive & freeze** specs, the folder MUST be reduced to a single concise,
  clearly-labelled archived stub that records what the feature did and its outcome (merged PR),
  and points to the authoritative remaining source; process artifacts (`tasks.md`,
  `checklists/`, and similar scaffolding) MUST be removed.
- **FR-004**: For **condense in place** specs, the retained files MUST apply all three
  techniques together — **cut context cost** (remove process scaffolding, status placeholders,
  TDD red-first ceremony, and redundant prose), **improve readability** (clear, scannable
  summaries of intent, decisions, and outcomes), and **remove redundancy** (no fact duplicated
  across multiple artifacts or restated verbatim from `CLAUDE.md`).
- **FR-005**: Compaction MUST NOT change any application source, tests, build configuration,
  dependency manifest, runtime behaviour, UI, or persisted state — the diff is confined to
  documentation under `specs/**` (and, if required, the `CLAUDE.md` index).
- **FR-006**: A clear, consistent convention MUST mark which specs are *archived/frozen* versus
  *condensed*, so the tier of any folder is obvious at a glance.
- **FR-007**: **No cross-referenced decision context may be lost.** Every anchor cited from
  `CLAUDE.md` or another spec (research IDs, contract-law IDs, named patterns, data-model
  fields, governance/constitution amendments) MUST remain discoverable after compaction — either
  preserved in the condensed spec or, for archived specs, in the canonical source the stub points
  to.
- **FR-008**: Internal and external references in retained files MUST remain valid — no dangling
  links to deleted files, PRs, or anchors.
- **FR-009**: Pre-compaction content MUST remain recoverable from git history (compaction edits
  tracked files in place rather than erasing history).
- **FR-010**: If the `CLAUDE.md` index references a spec artifact that compaction removes or
  renames, `CLAUDE.md` MUST be updated so its references stay accurate.

### Key Entities

- **Spec folder** (`specs/NNN-name/`): the unit of compaction. Has a number, a name, a tier
  classification, and a set of artifact files. Preserved in place.
- **Artifact file**: `spec.md`, `plan.md`, `research.md`, `tasks.md`, `data-model.md`,
  `quickstart.md`, `contracts/*`, `checklists/*`. Each is kept-and-condensed, or removed,
  per tier.
- **Cross-referenced anchor**: a named, citable decision unit (research ID, contract-law ID,
  data-model field, named pattern, governance amendment) referenced from `CLAUDE.md` or another
  spec. Must survive compaction.
- **`CLAUDE.md` index**: the canonical compact per-feature summary already in the repo root; the
  redundancy baseline that condensed specs must not duplicate, and which must stay accurate.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Total line count across the **17 pre-existing spec folders** (`specs/001-*` …
  `specs/018-*`, i.e. all of `specs/**` **excluding** this `specs/019-compact-specs/`
  meta-folder) is reduced by a substantial margin (target: **≥ 50%** versus the pre-compaction
  baseline of ~15,000 lines), while every spec folder still exists. The 019 meta-folder's own
  artifacts are excluded from the denominator so the target is not muddied by this feature's own
  documentation.
- **SC-002**: **100%** of cross-referenced anchors cited in `CLAUDE.md` and across specs remain
  discoverable post-compaction (zero broken references), verified by an inventory check.
- **SC-003**: Every tiny/insignificant spec is reduced to a single archived stub; every
  substantial spec retains coherent, self-contained condensed files — **0** folders left in a
  mixed/half-done state.
- **SC-004**: A reader can locate any of a sampled set of past decisions in **under ~30 seconds**
  per the US1 independent test.
- **SC-005**: The change set touches **only** documentation (`specs/**` and at most `CLAUDE.md`)
  — **0** changes to source, tests, build, or dependencies, and the application build/tests are
  unaffected.

## Assumptions

- `CLAUDE.md` is the canonical compact index of shipped features and is trusted as the
  redundancy baseline; condensed specs defer to it rather than restating it.
- All in-scope features have shipped and merged, so their specs are historical record rather than
  live working documents — except **018**, which is treated conservatively as still active.
- Git history is intact and is an acceptable home for full pre-compaction detail, so archiving to
  a stub does not destroy recoverable information.
- "In place" means the `specs/NNN-name/` directory layout is retained; consolidation into a
  single repo-level history document is explicitly **out of scope** (per clarification).
- Classification of borderline specs favours **condense over freeze** when reusable decision
  context exists, to protect FR-007.

## Out of Scope

- Consolidating specs into a single history/decisions document, or relocating/renumbering folders.
- Any change to application source, tests, build, dependencies, runtime behaviour, UI, or
  persisted state.
- Editing the project constitution or speckit templates/configuration.
- Deleting git history or otherwise making pre-compaction content unrecoverable.
- Compacting non-spec documentation (e.g. `README.md`) beyond the `CLAUDE.md` index updates
  required by FR-010.
