# Feature Specification: Group Ordering — Confirm & Document

> **Status: Shipped — condensed 2026-06-09**

Merged in PR #10.

## What shipped

Group mode's point ordering was already correct as of 008, but undocumented and unprotected.
009 **pins that ordering into an explicit contract + fail-first regression tests** so it cannot
silently regress. **No production code change** — the 008 `arrange()` was already intact (verified
green; +8 tests, suite 108 → 116, `tsc`/`svelte-check` strict clean).

The locked ordering (pure `arrange(choice, prefs)` in `src/view.ts`):

- **By Type** — sections in fixed order **Advantages → Disadvantages → Neutral**. Advantages and
  Disadvantages run heaviest weight first (3 → 2 → 1), ties keep creation order; Neutral keeps
  creation order. `direction` is ignored.
- **By Weight** — one section per present weight, descending **3 → 2 → 1 → weightless(0)** (the
  neutral/null-weight bucket — the "0" in the user's "3 > 2 > 1 > 0"); each section holds all points
  of that weight with types mixed, in creation order.

Cross-cutting: every point lands in exactly one section (none dropped/duplicated); `arrange` is
pure (no mutation), deterministic, and stable across re-renders/reloads.

The full ordering law lives in [`contracts/group-ordering.md`](./contracts/group-ordering.md).

## Why

The ordering is the user-visible contract for Group mode: points must read "most important first"
and never reshuffle between renders. The user chose **confirm & document** over a behaviour change,
so the goal is regression protection, not new behaviour.

## Key decisions

- **Empty-section skip (FR-006) is split by dimension — intentional, documented, not "fixed":**
  in **Weight** mode `arrange()` itself omits weights with no points; in **Type** mode `arrange()`
  returns all three sections (incl. an empty Neutral) and the **renderer** (`ChoiceCard.svelte`)
  skips zero-note sections at display time. FR-006 is therefore a *rendered-output* guarantee.
  Normalising `arrange` to drop empty Type sections too was rejected — a no-user-effect production
  change that violates the "no code change" scope.
- **Example-based tests, not property-based** — the contract is a small, fixed law; example cases
  are clearer and sufficient (YAGNI).
- **No data-model, scoring, dependency, or saved-state/version change.** `Section.label` is
  `NoteType | Weight | 'weightless' | null` (already widened in 008); `ViewPrefs.groupKey`
  (`'type' | 'weight'`) selects the dimension; `direction` stays a Sort-mode concern.

## Acceptance (locked behaviour)

- By Type: sections Advantages → Disadvantages → Neutral; Adv/Disadv ordered 3 → 2 → 1 (ties =
  creation order); Neutral in creation order.
- By Weight: sections 3 → 2 → 1 → weightless(0); empty weights omitted; types mixed within a
  section in creation order.
- All-neutral choice → Type shows only Neutral; Weight shows only the weightless(0) section.
- Re-render/reload never reshuffles points sharing an ordering key.
- Switching Type ↔ Weight re-sections the same points with none lost, duplicated, or modified.
- Automated tests assert every rule and fail on any violation (`tests/unit/view.test.ts`;
  Type-side empty-section render guard in `tests/components/group-ordering.test.ts`).
