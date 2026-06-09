# Data Model: Review & Compact Existing Specs

**Feature**: 019-compact-specs | **Date**: 2026-06-09

This feature has no runtime data model. The "entities" are the documentation artifacts being
compacted and their classification. This file is the **operational map** for the work.

## Entities

- **SpecFolder** — `specs/NNN-name/`. Fields: `number`, `name`, `tier` (FREEZE | CONDENSE),
  `protectedAnchors` (IDs/patterns that MUST survive), `keep` (files retained/condensed),
  `remove` (files deleted). Directory path is immutable (FR-001, in place).
- **Anchor** — a cited decision unit (`R*`, `O*`, `C*`, `B*`, `D*`, `L*`, `S*`, `T*`, `P*`,
  `H*`, `M*`, named pattern, governance amendment). Must remain discoverable (FR-007 / SC-002).
- **StatusBanner** — the one-line blockquote marking a folder's tier (R5 / FR-006).

## Tier classification (all 17 folders)

Ties break toward CONDENSE. Governance/anchor presence forces CONDENSE regardless of size.

| Spec | Tier | Why | Protected anchors / notes |
|------|------|-----|---------------------------|
| 001-sift-mvp | CONDENSE | Foundational; the pure-core **parity contract** | scoring/view/persistence/state-store contracts; data-model |
| 002-post-mvp-improvements | CONDENSE | i18n + suggest-feature + footer; real surface | i18n/suggestion/migration contracts |
| 003-github-pages-hosting | CONDENSE | Live deploy + base-path still in effect | base-path & deploy-workflow contracts |
| 004-phase2-ui-rebuild | CONDENSE | **Major** Svelte/Tailwind/Bits UI rebuild | store/components/theming/motion contracts; mobile matrix |
| 005-ui-copy-refinements | **FREEZE** | Copy-only tweaks, fully in `CLAUDE.md`, no anchors | — |
| 006-mobile-responsive-ui | CONDENSE | Responsive hardening; matrix may be referenced | responsive contract |
| 007-remove-point | CONDENSE | ✕ remove control + Clear-preserves-theme | remove-point / clear-preferences contracts |
| 008-group-by-dimension | CONDENSE | **`groupKey` defensive-default precedent** (cited by 018) | groupKey precedent; arrange-grouping; addpoint-order |
| 009-group-ordering | CONDENSE | **`arrange()` ordering law** + regression tests | group-ordering contract (ordering law) |
| 010-save-status-indicator | CONDENSE | save-status state machine (hidden→editing→saved) | save-status contract |
| 011-suggest-form-css | **FREEZE** | Button-width CSS only, fully in `CLAUDE.md`, no anchors | — |
| 012-review-remediation | CONDENSE | **"012 pattern"** (inline no-portal Dialog) + FOUC fix (cited by 014/016) | dialog-ui & theme contracts; `resolveTheme()` |
| 013-fix-bits-ui-peerdep | CONDENSE (light) | Tiny hotfix **but** carries Build-gate **governance** (v2.1.0) | Build-gate rationale (also in constitution) |
| 014-fix-dialog-positioning | CONDENSE (light) | **"014 placement CSS"** cited by 016 | dialog-positioning contract |
| 015-six-choices | CONDENSE | 4→6 cap + **constitution re-scope v2.2.0** (governance) | `MAX_CHOICES`; `:has()` layout; choice-layout contract |
| 016-confirm-remove-choice | CONDENSE | Shared `ConfirmDialog`; recent, referenced | remove-confirmation contract; B1–B6/D1–D4 |
| 018-sort-color-scores | CONDENSE (conservative) | **Active feature** — trim only, keep working detail | O1–O6/C1–C4/T1–T3/P1–P2/S1–S3; `rankByTotal` |

**Summary**: 2 FREEZE (005, 011) · 15 CONDENSE (of which 013/014 light, 018 conservative).

## File-treatment rule (per tier)

**FREEZE** → keep `spec.md` (replaced by stub, R4); **remove** everything else
(`plan.md`, `research.md`, `tasks.md`, `data-model.md`, `quickstart.md`, `contracts/`,
`checklists/`).

**CONDENSE** → 
- `spec.md`: keep, condensed; absorb any anchor definitions from removed files; add status banner.
- `research.md`: keep only the decisions still cited (`R*`); trim to Decision/Rationale lines.
- `data-model.md`: keep if it defines a cited field/entity; else fold the key fact into `spec.md` and remove.
- `contracts/*`: keep files that define cited laws (e.g. 009 ordering, 012 dialog, 014 placement); trim prose; remove uncited ones.
- `plan.md`: keep a short condensed plan only where it holds unique architecture rationale (004); else remove.
- `tasks.md`, `checklists/`, `quickstart.md`: **remove** (process scaffolding / done manual sweeps).

## Invariants

1. Every row's `protectedAnchors` is present somewhere discoverable post-compaction (FR-007).
2. Every in-scope `spec.md` carries exactly one StatusBanner (FR-006).
3. No folder is deleted or renamed; the 017 gap is left as-is (FR-001 / edge case).
4. Diff confined to `specs/**` (+ SPECKIT pointer in `CLAUDE.md`); zero `src`/`tests`/build changes (FR-005).
