# Research: Review & Compact Existing Specs

**Feature**: 019-compact-specs | **Date**: 2026-06-09

All three spec clarifications were resolved up front (tier strategy, scope incl. 018,
condense-in-place). Remaining unknowns are *how* to classify and *how* to condense safely.

## R1 — Tier classification: significance, not size

**Decision**: Classify each spec by **lasting decision value**, not line count. A spec is
**FREEZE** (archive→stub) only if it is a narrow cosmetic/copy or hotfix change that holds **no
reusable decision context, no cross-referenced anchor, and no governance amendment**, and is
fully captured by its `CLAUDE.md` summary. Everything else is **CONDENSE in place**. Ties break
toward **CONDENSE** (FR-007 protection).

**Rationale**: Size correlates poorly with value — 013 is tiny (213 lines) but carries a
constitution amendment (Build gate); 010 is large but introduces a real state machine. The risk
being managed is *losing referenced context*, which is orthogonal to length.

**Alternatives**: Size-threshold cutoff (rejected — would freeze 013's governance note and
014's referenced placement-CSS); freeze-everything-shipped (rejected — violates FR-007 for
anchored specs).

## R2 — Anchor inventory before any deletion

**Decision**: Build a per-spec **anchor inventory** as the first task, by sweeping `CLAUDE.md`
and all specs for cited ID families and named patterns, *before* removing or rewriting anything.
The inventory is the checklist SC-002 verifies against.

**Anchor families found** (cited in `CLAUDE.md`): research IDs `R1–R9`; contract-law IDs
`O1–O6`, `C1–C4`, `B1–B6`, `D1–D4`, `L1–L6`, `S1–S3`, `T1–T3`, `P1–P2`, `H2/H3`; manual-sweep IDs
`M1–M6`, `T011/T017`; acceptance IDs `A1–A2`; and **named patterns** — "012 pattern" (inline
no-portal Dialog), "014 placement CSS", "008 `groupKey` precedent / defensive-default", "009
`arrange()` ordering law". Governance anchors: 013 Build gate (v2.1.0), 015 re-scope (v2.2.0) —
both **also** recorded in `.specify/memory/constitution.md`, so they survive independently.

**Rationale**: FR-007 is the one hard invariant; making the inventory an explicit artifact turns
"don't lose context" into a mechanically checkable list.

**Alternatives**: Rely on reviewer eyeballing (rejected — not verifiable for SC-002).

## R3 — What "condense" removes vs keeps

**Decision**: For CONDENSE specs, **keep** `spec.md` (condensed) as the durable record and keep
`research.md` / `data-model.md` / `contracts/*` **only where they define cited anchors**, merged
and trimmed. **Remove** pure process scaffolding: `tasks.md` (17 files), `checklists/` (18
dirs), TDD red-first ceremony, status placeholders, "Prior features" recaps that duplicate
`CLAUDE.md`, and `quickstart.md` for shipped features (manual sweeps already done). Anchor
definitions that lived in a removed file migrate into the condensed `spec.md`.

**Rationale**: `tasks.md` + checklists are execution logs for already-merged work — the highest
clutter, lowest future value. Recaps duplicate the canonical `CLAUDE.md` index (FR-004).

**Alternatives**: Keep all files but trim each (rejected — leaves 35 low-value files); delete
research/contracts wholesale (rejected — would drop anchor definitions, violating FR-007).

## R4 — Stub format for FREEZE specs

**Decision**: A frozen spec collapses to a **single `spec.md`** bearing a `> **Status:
Archived**` banner, 2–4 sentences of what shipped + outcome, the merged PR number, and a pointer
to its `CLAUDE.md` summary and git history for full detail. All other files/dirs removed.

**Rationale**: Discoverability (US2) with minimal bytes; git history (R6) holds the rest.

## R5 — Archived/condensed marker convention (FR-006)

**Decision**: First line under the title of every in-scope `spec.md` gets a blockquote banner:
`> **Status: Archived (frozen 2026-06-09)**` for FREEZE, or
`> **Status: Shipped — condensed 2026-06-09**` for CONDENSE. Tier is then obvious at a glance
and greppable.

**Rationale**: One consistent, machine-greppable convention satisfies FR-006 without a new index
file.

## R6 — Reversibility via git, not copies (FR-009)

**Decision**: Edit/delete files in place on the feature branch; **do not** keep `.bak` copies or
an `archive/` of originals. Full pre-compaction content is recoverable via `git show`/history.

**Rationale**: Copies would defeat the size goal (SC-001) and duplicate what version control
already provides.

## R7 — Keep `CLAUDE.md` references accurate (FR-010)

**Decision**: `CLAUDE.md` is the canonical index and the redundancy baseline — it is **not**
itself compacted here. Only update it if a removed/renamed artifact breaks one of its references
(none expected, since it cites anchors not file paths). The `<!-- SPECKIT -->` block pointer is
updated to this plan per the plan workflow.

**Rationale**: Scope discipline — compaction targets `specs/**`; `CLAUDE.md` stays the trusted
summary it already is.

## R8 — Documentation-only, no code gates

**Decision**: This feature touches no `src/**`, `tests/**`, build, or deps (FR-005). The
constitution's TDD/Build/a11y gates are **not applicable** (nothing to type-check, test, or
build differently); the binding constraints are Principle III (Deliberate Simplicity — less is
more) and the spec-driven workflow. Verification is by the SC checks (line-count delta, anchor
inventory, untouched-source diff), not `vitest`/`vite build`.

**Rationale**: Gates exist to protect runtime correctness; a docs-only change has none to
protect. Asserting them anyway (e.g. running the suite) is fine as a no-op sanity check but is
not a gate this work can fail.
