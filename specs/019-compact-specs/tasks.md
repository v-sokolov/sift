# Tasks: Review & Compact Existing Specs

**Feature**: 019-compact-specs | **Input**: design docs in `specs/019-compact-specs/`
**Prerequisites**: plan.md, spec.md, research.md (R1–R8), data-model.md (tier table),
contracts/compaction.md (laws T/A/F/C/S/B), quickstart.md

**Nature**: documentation-only. No code, no tests (`vitest`/`vite build` untouched — FR-005).
"Verification" = grep/git/line-count + a human readability pass, per `quickstart.md`.

**Tier map** (from `data-model.md`): **FREEZE** = 005, 011 · **CONDENSE** = 001, 002, 003, 004,
006, 007, 008, 009, 010, 012, 013(light), 014(light), 015, 016, 018(conservative).
**FR-002 (classify by significance) is satisfied at design time** — the classification *is* this
tier table in `data-model.md`; no runtime task re-derives it. The condense/freeze tasks below
only *consume* it. (finding G1)

**Hard invariant**: FR-007 / law A2 — **zero** cross-referenced anchors lost. The anchor
inventory (T002) MUST exist before any file is removed or rewritten.

---

## Phase 1: Setup

- [X] T001 Capture the pre-compaction baseline and write it to `specs/019-compact-specs/baseline.md`. **Denominator = the 17 pre-existing folders only, excluding this `specs/019-compact-specs/` meta-folder** (so the ≥50% target isn't skewed by this feature's own artifacts — finding C1): total line count (`find specs -name '*.md' -not -path 'specs/019-compact-specs/*' | xargs wc -l | tail -1`), per-folder line counts, and folder count (`ls -d specs/0*/ | grep -v 019-compact-specs | wc -l` → 17). This is the SC-001 reference (~15,000 lines) and the SC-003 folder-count guard.

---

## Phase 2: Foundational (BLOCKING — must complete before Phase 3/4)

**Purpose**: Make FR-007 mechanically checkable. Nothing may be deleted or rewritten until the
anchor inventory exists (law A1).

- [X] T002 Build the anchor inventory in `specs/019-compact-specs/anchor-inventory.md`: for every folder, list each cited anchor and where it currently lives. Sources to sweep: `CLAUDE.md` (ID families `R*`,`O*`,`C*`,`B*`,`D*`,`L*`,`S*`,`T*`,`P*`,`H*`,`M*`,`A*` and named patterns) and each spec's own `contracts/`/`research.md`. Seed from `data-model.md` "protected anchors" column; confirm by grep (`grep -rnoE '\b[A-Z][0-9]+' specs/<n>-*/`). Record the named patterns explicitly: "012 pattern" (inline no-portal Dialog), "014 placement CSS", "008 `groupKey` precedent", "009 `arrange()` ordering law", plus governance (013 Build gate v2.1.0, 015 re-scope v2.2.0). This file is the checklist T013 verifies against.

**Checkpoint**: anchor inventory complete → condensation and freezing may begin (independent of each other).

---

## Phase 3: User Story 1 — Cheap-to-load past context (Priority: P1) 🎯 MVP

**Goal**: Condense the 15 substantial folders in place — strip scaffolding, trim prose, remove
redundancy vs `CLAUDE.md` — while preserving every anchor (laws C1–C4, S1, A2).

**Independent test**: Sample 3 cross-referenced facts (008 `groupKey`, 012 pattern, 009 ordering
law); open the condensed folder and confirm each is found correct in <30s (SC-004).

**Per-folder condense recipe** (apply to each task below): remove `tasks.md`, `checklists/`,
`quickstart.md` (C1); drop status placeholders, TDD red-first ceremony, and any "Prior features"
recap or fact restated verbatim from `CLAUDE.md` (C2); keep `research.md`/`data-model.md`/
`contracts/*` only where they define a cited anchor, folding other key facts into `spec.md` and
removing the file (C3); add the banner `> **Status: Shipped — condensed 2026-06-09**` directly
under the `# ` title (S1); leave the folder coherent and self-contained (C4). All [P] — distinct
folders, distinct files.

- [X] T003 [P] [US1] Condense `specs/001-sift-mvp/` — keep condensed `spec.md` + the four core contracts (scoring/view/persistence/state-store) as the **parity contract**; preserve `data-model.md` entities; apply recipe.
- [X] T004 [P] [US1] Condense `specs/002-post-mvp-improvements/` — preserve i18n / suggestion / persistence-migration contract anchors; apply recipe.
- [X] T005 [P] [US1] Condense `specs/003-github-pages-hosting/` — preserve base-path & deploy-workflow contracts (live deploy still in effect); apply recipe.
- [X] T006 [P] [US1] Condense `specs/004-phase2-ui-rebuild/` — preserve store/components/theming/motion contracts + mobile-responsive matrix (major architecture rationale); keep a short condensed `plan.md`; apply recipe.
- [X] T007 [P] [US1] Condense `specs/006-mobile-responsive-ui/` — preserve responsive contract; apply recipe.
- [X] T008 [P] [US1] Condense `specs/007-remove-point/` — preserve remove-point & clear-preferences contracts; apply recipe.
- [X] T009 [P] [US1] Condense `specs/008-group-by-dimension/` — **preserve the `groupKey` defensive-default precedent** (cited by 018) + arrange-grouping / addpoint-order contracts; apply recipe.
- [X] T010 [P] [US1] Condense `specs/009-group-ordering/` — **preserve the `arrange()` ordering law** (group-ordering contract); apply recipe.
- [X] T011 [P] [US1] Condense `specs/010-save-status-indicator/` — preserve save-status state-machine contract; apply recipe.
- [X] T012 [P] [US1] Condense `specs/012-review-remediation/` — **preserve the "012 pattern"** (inline no-portal Dialog) + theme/`resolveTheme()` FOUC anchors (cited by 014/016); apply recipe.
- [X] T013 [P] [US1] Condense `specs/013-fix-bits-ui-peerdep/` (light) — **preserve the Build-gate governance note** (v2.1.0); small folder, mostly drop `checklists/` + trim `spec.md`; apply recipe.
- [X] T014 [P] [US1] Condense `specs/014-fix-dialog-positioning/` (light) — **preserve the "placement CSS"** (dialog-positioning contract, cited by 016); apply recipe.
- [X] T015 [P] [US1] Condense `specs/015-six-choices/` — **preserve the v2.2.0 re-scope governance** + `MAX_CHOICES` / `:has()` layout (choice-layout contract); apply recipe.
- [X] T016 [P] [US1] Condense `specs/016-confirm-remove-choice/` — preserve remove-confirmation contract (B1–B6/D1–D4); apply recipe.
- [X] T017 [P] [US1] Condense `specs/018-sort-color-scores/` **conservatively** (still recent) — trim scaffolding only; keep O1–O6/C1–C4/T1–T3/P1–P2/S1–S3 + `rankByTotal`; apply recipe (lighter touch, C4).

**Checkpoint**: all 15 condensed folders are coherent, banner-tagged, and scaffolding-free.

---

## Phase 4: User Story 2 — Insignificant specs frozen to stubs (Priority: P2)

**Goal**: Reduce the two cosmetic folders to a single archived stub each (laws F1–F3, S1).

**Independent test**: `ls` each frozen folder → only `spec.md`; the stub names the outcome, PR,
and a pointer to `CLAUDE.md` + git history (SC-003 / US2).

**Stub recipe**: replace the folder's `spec.md` with a stub = banner
`> **Status: Archived (frozen 2026-06-09)**`, 2–4 sentences of what shipped + outcome, the merged
PR number, and a pointer to its `CLAUDE.md` summary + git history (F2); delete every other file
and the `checklists/`/`contracts/` dirs (F1, F3). Confirm against T002 that the folder holds no
inventory anchor before deleting (it should not — both are cosmetic). [P] — distinct folders.

- [X] T018 [P] [US2] Freeze `specs/005-ui-copy-refinements/` to a single archived `spec.md` stub (merged PR #6); delete all other files/dirs per stub recipe.
- [X] T019 [P] [US2] Freeze `specs/011-suggest-form-css/` to a single archived `spec.md` stub (merged PR #12); delete all other files/dirs per stub recipe.

**Checkpoint**: 005 and 011 are single banner-tagged stubs.

---

## Phase 5: User Story 3 — Reviewable & reversible + Polish (Priority: P3)

**Goal**: Prove the change set is safe, complete, and fenced (laws A2/A3, B1–B4, S2; SC-001..005).
Run after Phase 3 + Phase 4.

- [X] T020 [US3] **Anchor survival check (SC-002 / A2)** — for every entry in `specs/019-compact-specs/anchor-inventory.md`, grep the post-compaction tree and confirm a hit in a retained file (see `quickstart.md` examples). Expect **0 missing**. Record pass/fail per anchor; if any missing, restore it into the relevant condensed `spec.md` before proceeding.
- [X] T021 [US3] **Governance check (A3)** — confirm 013 Build-gate and 015 re-scope notes survive in their condensed specs and still exist in `.specify/memory/constitution.md`.
- [X] T022 [P] [US3] **Banner check (FR-006 / S1–S2)** — `grep -rL 'Status: \(Archived\|Shipped' specs/0*/spec.md` returns none; only the two banner strings are used.
- [X] T023 [P] [US3] **Scaffolding check (C1)** — `find specs -name tasks.md` and `find specs -type d -name checklists` return none; `find specs -name quickstart.md` returns only `019`'s.
- [X] T024 [P] [US3] **Boundary / reversibility check (B1–B4, FR-009)** — `git diff --stat main...019-compact-specs` paths ⊆ `specs/**` + `CLAUDE.md`; **zero** changes to `src/**`/`tests/**`/`package.json`/build config; folder count still 17 (017 gap intact); no `.bak`/duplicate files; spot-check `git show` recovers an original.
- [X] T025 [P] [US3] **No dangling links (FR-008 / FR-010 / B2)** — scan retained files for links to removed files/anchors; confirm `CLAUDE.md` references resolve (pointer already updated to 019; 018 demoted to "Just shipped, PR #19").
- [X] T026 [US3] **Size check (SC-001)** — same denominator as T001 (exclude 019): `find specs -name '*.md' -not -path 'specs/019-compact-specs/*' | xargs wc -l | tail -1` ≤ ~7,500 (≥50% below the T001 baseline). If short of target, identify the heaviest remaining folders and trim further.
- [X] T027 [US3] **Readability pass (SC-004, human)** — run the US1 independent test: pick 3 cross-referenced facts, time the lookup (<30s each). This is a human judgement, not a script (per quickstart honesty note).
- [X] T028 [US3] Remove the scratch `specs/019-compact-specs/baseline.md` (and fold its final numbers into the PR description) so the feature folder itself stays lean; keep `anchor-inventory.md` as the audit record.

---

## Dependencies & Execution Order

- **Phase 1 (T001)** → **Phase 2 (T002, blocking)** → then Phase 3 and Phase 4 in parallel → **Phase 5** (verification, after both).
- **T002 blocks everything destructive** (T003–T019): no deletion/rewrite before the anchor inventory exists.
- **Phase 3 (US1)** and **Phase 4 (US2)** are mutually independent — different folders.
- **Phase 5 (US3)** depends on Phase 3 + Phase 4 complete.
- Within Phase 5, T020/T021 (content survival) gate T026/T028 (final trim/cleanup).

## Parallel Opportunities

- **Phase 3**: T003–T017 are all `[P]` — 15 folders, distinct files, can run concurrently after T002.
- **Phase 4**: T018, T019 `[P]` — concurrent with each other and with Phase 3.
- **Phase 5**: T022, T023, T024, T025 `[P]` — independent read-only checks.

```
Example concurrent batch after T002:
  T003 … T017 (condense, 15×) ‖ T018, T019 (freeze, 2×)
Then:
  T020 → T021 → (T022 ‖ T023 ‖ T024 ‖ T025) → T026 → T027 → T028
```

## Implementation Strategy

- **MVP = User Story 1 (Phase 3)**: condensing the 15 substantial folders delivers the bulk of
  the size/readability win and is independently shippable. Freezing (US2) and the verification
  sweep (US3) are additive.
- **Incremental**: each `[P]` folder task is a self-contained increment; a partial run still
  leaves every touched folder coherent and banner-tagged (no half-done folder — SC-003).
- **Safety first**: T002 before any destructive edit; T020/T021 before final cleanup. FR-007 is
  non-negotiable — if an anchor can't be preserved in-place, keep the file rather than lose it
  (ties break toward CONDENSE per law T2).

## Notes

- Tests intentionally omitted: this feature changes no executable behaviour (FR-005); the
  constitution's TDD/Build gates are inapplicable (research R8). `yarn test`/`yarn build` stay
  green as an unaffected no-op and are covered by the boundary check T024.
- Total: **28 tasks** — Setup 1, Foundational 1, US1 15, US2 2, US3 9.
