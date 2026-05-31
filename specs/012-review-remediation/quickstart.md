# Quickstart / Verification: Codebase-Health Remediation

Feature: `012-review-remediation` · Date: 2026-05-31

Verification matrix. **A** = automated (vitest / svelte-check / shell); **M** = manual on-device
(jsdom can't paint, lay out, or run the inline pre-paint script meaningfully).

## Automated

| # | Type | Check | Maps to |
|---|---|---|---|
| A1 | A | `resolveTheme` truth table (dark→dark, light→light, system+prefersDark→dark, system+!prefersDark→light) — **written red first** | FR-006, theme C-1 |
| A2 | A | Suggest dialog: opens (`role="dialog"`, `aria-modal="true"`), focus → name field | FR-004, dialog C-3 |
| A3 | A | Esc closes dialog and returns focus to `[data-action="open-suggest"]` | FR-004 |
| A4 | A | Backdrop/outside click closes; clicking dialog body does not | FR-004 |
| A5 | A | Tab focus trapped (wraps last→first) | FR-004 |
| A6 | A | Send disabled until name+description non-whitespace; valid submit fires one `mailto:` and closes | FR-004 (regression) |
| A7 | A | Cancel/Send both carry `btn--half`, order Cancel→Send (011 regression) | FR-004 |
| A8 | A | `addNote`/`updateNote` unit tests stay green; note add/edit via UI unchanged | FR-010 |
| A9 | A | No test references `suggest.status` | FR-011 |
| A10 | A | `grep -c '@media (prefers-color-scheme: dark)' src/styles/app.css` → `0`; one dark-palette block | FR-008, SC-003 |
| A11 | A | `package.json` has no `@internationalized/date`; `bits-ui` imported in `SuggestDialog.svelte` | FR-001/002/003, SC-001 |
| A12 | A | `yarn check` → 0 type errors; `yarn test` → full suite green | gate (Principle IV) |
| A13 | A | `git ls-files .specify/memory/constitution.md` lists it; `git check-ignore .specify/extensions.yml` still ignored | FR-009, SC-005 |

## Manual (on device — `yarn dev` / built preview)

| # | Type | Check | Maps to |
|---|---|---|---|
| M1 | M | Save **Dark**, set OS to **Light**, hard-reload → first frame is dark, **no light flash** | SC-002 |
| M2 | M | Save **Light**, set OS to **Dark**, hard-reload → first frame is light, no dark flash | SC-002 |
| M3 | M | Clear `sift.v1`, reload → follows OS preference, no flash | FR-007 |
| M4 | M | Corrupt `sift.v1` to invalid JSON, reload → no error, falls back to OS pref | FR-007 |
| M5 | M | With theme = **system**, flip OS light↔dark while app open → theme updates live | theme C-4 |
| M6 | M | Open suggest dialog: focus lands in name field; Tab cycles within; Esc closes & focus returns; backdrop closes; background does not scroll | FR-004 |
| M7 | M | Runtime theme toggle (existing control) still cycles system→light→dark as before | FR-006 |
| M8 | M | A pre-existing saved board (from before this change) loads unchanged | FR-014 |

## Honesty / scope checks

| # | Check | Maps to |
|---|---|---|
| H1 | `CLAUDE.md` + constitution rationale describe Bits UI as actually used by the dialog (no false "already in use" wording) | FR-005 |
| H2 | `theme.ts` header comment describes implemented behavior (no stale "US2 extends…" promise) | FR-012 |
| H3 | CSS spec-tag comments (`(006)/(007)/(008)`, `M#/FR-###`) removed; substantive why-comments kept | FR-013 |
| H4 | Out-of-scope items untouched: store snapshot pattern, folder layout, hand-rolled i18n, `data-*` attrs, shipped specs | FR-015 |
