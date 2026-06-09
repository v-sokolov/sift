# Contract: Spec Compaction

**Feature**: 019-compact-specs | **Date**: 2026-06-09

Laws governing the compaction. These are the testable rules `/speckit-tasks` and review check.

## Tier laws (T)

- **T1** — Every in-scope folder is classified FREEZE or CONDENSE per `data-model.md`; no third
  state and no folder left unclassified.
- **T2** — Ties and borderline cases resolve to CONDENSE. A folder with any cited anchor or
  governance amendment MUST be CONDENSE, never FREEZE.
- **T3** — Classification is by lasting decision value, independent of line count.

## Anchor-preservation laws (A) — the hard invariant (FR-007 / SC-002)

- **A1** — Before any file is removed or rewritten, the anchor inventory exists and lists, per
  folder, every cited ID family and named pattern.
- **A2** — For every anchor in the inventory, after compaction the anchor's meaning is present
  and correct in a retained, discoverable location (its condensed spec, a retained contract, or
  — for FREEZE — the source the stub points to). **Zero** anchors lost.
- **A3** — Governance amendments recorded in specs (013 Build gate, 015 re-scope) remain stated
  in their condensed spec (and continue to exist in `constitution.md`).

## FREEZE laws (F)

- **F1** — A frozen folder retains exactly one file: a `spec.md` stub.
- **F2** — The stub contains: status banner (S1), a 2–4 sentence summary of what shipped, the
  merged PR number, and a pointer to the `CLAUDE.md` summary + git history.
- **F3** — All other files and the `checklists/`/`contracts/` dirs are removed from a frozen
  folder.

## CONDENSE laws (C)

- **C1** — `tasks.md`, `checklists/`, and `quickstart.md` are removed (process scaffolding /
  completed manual sweeps).
- **C2** — Retained files drop: status placeholders, TDD red-first ceremony, "Prior features"
  recaps duplicating `CLAUDE.md`, and any fact restated verbatim from `CLAUDE.md`.
- **C3** — `research.md`/`data-model.md`/`contracts/*` are retained only where they define a
  cited anchor; otherwise their key fact folds into `spec.md` and the file is removed.
- **C4** — The condensed `spec.md` remains coherent and self-contained (readable without the
  removed files); 018 is condensed conservatively (trim, not strip).

## Status-banner laws (S) — FR-006

- **S1** — Every in-scope `spec.md` has, immediately under its `# ` title, exactly one banner:
  `> **Status: Archived (frozen 2026-06-09)**` (FREEZE) or
  `> **Status: Shipped — condensed 2026-06-09**` (CONDENSE).
- **S2** — The banner is greppable; the two strings are the only two variants used.

## Boundary laws (B) — FR-005 / FR-008 / FR-009

- **B1** — The change set modifies only `specs/**` and the `<!-- SPECKIT -->` block in
  `CLAUDE.md`. Zero changes to `src/**`, `tests/**`, `package.json`, or build config.
- **B2** — No retained file contains a dangling link to a removed file, PR, or anchor.
- **B3** — No `.bak`/duplicate-of-original is introduced; pre-compaction content lives only in
  git history.
- **B4** — No folder is added, deleted, or renamed; the 017 numbering gap is untouched.

## Verification

| Law set | How verified |
|---------|--------------|
| T1–T3 | Each folder maps to a tier in `data-model.md`; spot-check borderline (013/014). |
| A1–A3 | Inventory file diffed against post-compaction grep for each anchor → 0 missing. |
| F1–F3 | `ls` each frozen folder = single `spec.md` with banner + PR + pointer. |
| C1–C4 | Grep confirms no `tasks.md`/`checklists/`/`quickstart.md` in condensed folders; read for coherence. |
| S1–S2 | `grep -rL "Status: \(Archived\|Shipped"` over in-scope `spec.md` returns none. |
| B1–B4 | `git diff --stat` paths ⊆ `specs/**` + `CLAUDE.md`; folder count unchanged. |
