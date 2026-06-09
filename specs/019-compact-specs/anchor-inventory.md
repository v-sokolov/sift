# Anchor Inventory (T002) — the FR-007 audit record

**Built**: 2026-06-09, **before** any deletion/rewrite (law A1). Lists every **cross-referenced**
decision anchor — those cited in `CLAUDE.md` or by a sibling spec — that MUST remain discoverable
after compaction (law A2). T020 greps the post-compaction tree against this list (expect 0
missing).

**Out of scope (not anchors)**: internal task IDs `T001…T0nn` (removed with `tasks.md`), and
ID families used only *within* a single spec and never cited elsewhere. Compaction may drop
those freely; only the rows below are protected.

## Named patterns & governance (cited in CLAUDE.md)

| Anchor | Meaning | Lives in (must survive) |
|---|---|---|
| **"008 `groupKey` precedent"** | additive persisted field with defensive `false`/default-on-load, no `schemaVersion` bump | `specs/008-group-by-dimension/` (data-model + spec) |
| **"009 `arrange()` ordering law"** | locked Group-mode ordering w/ regression tests | `specs/009-group-ordering/contracts/group-ordering.md` |
| **"012 pattern"** | Bits UI `Dialog` rendered inline / no Portal | `specs/012-review-remediation/contracts/dialog-ui.md` |
| **`resolveTheme()` / FOUC fix** | pre-paint theme resolution, one `[data-theme=dark]` palette | `specs/012-review-remediation/` (theme contract) |
| **"014 placement CSS" / "014 precedent"** | `.modal` fixed/inset-0/margin-auto/z-101 over z-100 backdrop | `specs/014-fix-dialog-positioning/contracts/dialog-positioning.md` |
| **Build gate (gov, v2.1.0)** | `yarn build` on clean install MUST pass before done | `specs/013-fix-bits-ui-peerdep/` **+** `constitution.md` |
| **`MAX_CHOICES` / 4→6 re-scope (gov, v2.2.0)** | cap raised 4→6; `:has()` wrap | `specs/015-six-choices/` **+** `constitution.md` |
| **`ConfirmDialog` / Clear migration** | shared confirm dialog; `window.confirm` removed | `specs/016-confirm-remove-choice/` |
| **`rankByTotal` / `orderedChoices()`** | 018 persisted view pref + pure sort helper | `specs/018-sort-color-scores/` |
| **"parity contract"** | pure core reused verbatim by phase-2 rebuild | `specs/001-sift-mvp/contracts/*` (scoring/view/persistence/state-store) |

## Contract-law / research ID families (cited in CLAUDE.md per feature)

Keep the **defining file** (or fold the law text into the condensed `spec.md`) for each:

| Folder | Protected ID families (as cited in CLAUDE.md) | Defining file to retain/fold |
|---|---|---|
| 001 | scoring/view/persistence/state-store contract laws (parity) | `contracts/*` + `data-model.md` |
| 002 | i18n, suggestion, persistence-migration contract laws | `contracts/{i18n,suggestion,persistence-migration}.md` |
| 003 | base-path, deploy-workflow | `contracts/{base-path,deploy-workflow}.md` |
| 004 | store/components/theming/motion contracts; mobile matrix; R1–R9 | `contracts/*` + `mobile-responsive-matrix.md` (+ short plan) |
| 006 | responsive contract | `contracts/responsive.md` |
| 007 | remove-point, clear-preferences contracts; T1–T2 | `contracts/{remove-point,clear-preferences}.md` |
| 008 | `groupKey` precedent; arrange-grouping; addpoint-order; T1–T3 | `contracts/*` + data-model |
| 009 | ordering law (group-ordering) | `contracts/group-ordering.md` |
| 010 | save-status state machine | `contracts/{save-status,ui-presentation}.md` |
| 012 | "012 pattern"; dialog-ui; theme; H2/H3 | `contracts/{dialog-ui,theme}.md` |
| 013 | Build-gate governance rationale | condensed `spec.md` (+ constitution) |
| 014 | placement CSS; dialog-positioning; A1–A3/H1–H3 | `contracts/dialog-positioning.md` |
| 015 | `MAX_CHOICES`; `:has()` layout; B1–B5, L1–L6, S1–S3; v2.2.0 | `contracts/choice-layout.md` + condensed spec |
| 016 | B1–B6, D1–D4, S1–S3, R1–R3, H2/H3; `ConfirmDialog` | `contracts/remove-confirmation.md` |
| 018 | O1–O6, C1–C4, T1–T3, P1–P2, S1–S3, M1–M5, A1–A2; `rankByTotal` | `contracts/sort-color-scores.md` + data-model |

## Verification rule (for T020)

For each row above, after compaction at least one **retained** file in that folder (or, for
governance, `constitution.md`) must contain the anchor's name/ID and its definition. FREEZE
folders (005, 011) appear in **no** row → safe to reduce to a stub.
