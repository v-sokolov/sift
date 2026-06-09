# Quickstart: Verifying the Spec Compaction

**Feature**: 019-compact-specs | **Date**: 2026-06-09

How to confirm the compaction satisfies its success criteria. All checks are doc/grep/git based
— there is no app behaviour to exercise.

## Baseline (capture before starting)

```sh
# SC-001 baseline: lines in the 17 PRE-EXISTING folders only (exclude this 019 meta-folder),
# so the ≥50% target is not skewed by this feature's own artifacts (~15,000 expected).
find specs -name '*.md' -not -path 'specs/019-compact-specs/*' | xargs wc -l | tail -1
# Folder count (must be unchanged after — 17 pre-existing folders, excluding 019)
ls -d specs/0*/ | grep -v '019-compact-specs' | wc -l
```

## A1 — Anchor inventory exists first (FR-007)

The first work product is the inventory (per `data-model.md` "protected anchors" column),
written before any deletion. Confirm it lists every cited ID family and named pattern per folder.

## SC-001 — Size reduced ≥ 50%

```sh
# Same denominator as the baseline — 17 pre-existing folders, excluding 019:
find specs -name '*.md' -not -path 'specs/019-compact-specs/*' | xargs wc -l | tail -1  # expect ≤ ~7,500
```

## SC-002 / A2 — Zero anchors lost (the hard check)

For each anchor in the inventory, confirm it still resolves:

```sh
# Examples — each MUST return a hit in a retained file:
grep -rn 'groupKey'        specs/008-group-by-dimension/   # 008 precedent
grep -rn 'O1\|O6\|rankByTotal' specs/018-sort-color-scores/  # 018 order law + field
grep -rln 'placement'      specs/014-fix-dialog-positioning/ # 014 placement CSS
grep -rln 'Build gate\|build'   specs/013-fix-bits-ui-peerdep/ # 013 governance
grep -rn  'arrange'        specs/009-group-ordering/        # 009 ordering law
```

Governance also independently survives in `.specify/memory/constitution.md` (Build gate v2.1.0,
re-scope v2.2.0).

## SC-003 / F1–F3 — Frozen folders are single stubs

```sh
ls specs/005-ui-copy-refinements/ specs/011-suggest-form-css/   # each: spec.md only
grep -l 'Status: Archived' specs/005-*/spec.md specs/011-*/spec.md
```

## SC-003 / C1 — Condensed folders shed scaffolding

```sh
find specs -name tasks.md            # expect none
find specs -type d -name checklists  # expect none
find specs -name quickstart.md       # expect only THIS feature's (019)
```

## FR-006 / S1 — Every in-scope spec is banner-tagged

```sh
# Should list NO in-scope spec.md missing a banner:
grep -rL 'Status: \(Archived\|Shipped' specs/0*/spec.md
```

## SC-005 / B1 — Source untouched

```sh
git diff --stat main...019-compact-specs -- src tests package.json vite.config.* svelte.config.*
# expect: empty (no changes outside specs/** and CLAUDE.md)
```

Optional sanity no-op: `yarn test` and `yarn build` still pass unchanged (nothing here touches
them — confirms B1 didn't accidentally break anything).

## Honesty note (Principle V / spec discipline)

Readability (SC-004, "find a decision in <30s") is a **human judgement** — verify by the US1
independent test (sample 3 cross-referenced facts, time the lookup), not by a script.
