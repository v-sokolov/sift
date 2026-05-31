# Phase 0 Research: Group Ordering — Confirm & Document

No NEEDS CLARIFICATION markers remained after the spec's in-session clarification. The research
below records what was verified against the shipped code and resolves the one subtlety that
affects test placement.

## R1 — Does the shipped behaviour already match the requested ordering?

**Decision**: Yes. `src/view.ts` `arrange()` already implements the requested ordering exactly.

**Evidence** (verified by reading `src/view.ts` on branch `main`, post-008 commit `9dedf17`):

- **Type** (`groupKey === 'type'`): returns sections `advantage`, `disadvantage`, `neutral` in
  fixed order. Advantages and Disadvantages are `stableSort`ed by weight **descending** (heaviest
  first); Neutral keeps creation order. `direction` is ignored.
- **Weight** (`groupKey === 'weight'`): iterates `[3, 2, 1]`, pushing a section per present weight
  (empties skipped in `arrange` itself), then a trailing `'weightless'` section for `weight === null`
  notes. Members keep creation order with types mixed.

Worked example, points `[a1(adv,1), d3(dis,3), nu(neu,null), a3(adv,3), d1(dis,1)]`:
- Type → `[a3,a1]` (Adv) · `[d3,d1]` (Disadv) · `[nu]` (Neutral)
- Weight → `3:[d3,a3]` · `1:[a1,d1]` · `weightless:[nu]`

**Rationale**: Confirms the feature's scope is to **lock** this behaviour, not change it (FR-010).

**Alternatives considered**: Treating the request as a behaviour change — rejected after the user
chose "Confirm & document" in the spec clarification.

## R2 — Where is the "no empty sections" rule (FR-006) enforced?

**Decision**: Split by dimension, and this split is intentional — document it, do not "fix" it.

- **Weight** mode: `arrange()` itself omits empty weight sections (it only pushes a section when
  `inWeight.length` / `weightless.length` is non-zero).
- **Type** mode: `arrange()` **always returns all three** type sections, including empty ones
  (e.g. an empty `neutral` section when a choice has no neutral points). The **renderer**
  (`src/components/ChoiceCard.svelte`) skips any section with zero notes at display time.

**Rationale**: This matches the 008 contract note ("Empty sections may be returned; the renderer
skips any labelled section with zero notes"). FR-006 ("MUST NOT be rendered") is therefore a
**rendered-output** guarantee, satisfied jointly by `arrange` (weight) and the renderer (type).

**Alternatives considered**: Normalising `arrange` to omit empty type sections too — rejected:
it is a production behaviour change with no user-visible effect (renderer already skips), violating
the "minimal/no code change" scope (FR-010). Tests must assert FR-006 at the layer that actually
enforces it per dimension.

**Test implication**:
- Weight-mode empty omission → assert directly on `arrange()` output (a weight with no points
  produces no section).
- Type-mode empty omission → assert the renderer hides a zero-note type section (ChoiceCard test
  via `tests/svelte.ts`), OR document that `arrange` intentionally returns the empty section and the
  rendered guarantee is covered by existing component behaviour. Prefer a lightweight ChoiceCard
  assertion only if not already covered.

## R3 — What regression coverage already exists vs. what to add?

**Decision**: Reuse the existing `tests/unit/view.test.ts` grouped describes; add targeted cases to
close gaps.

**Already covered (008)**: Type fixed section order; Type weighted-heaviest-first + neutral
creation order; Type ignores direction; Weight present-weights-desc + weightless; Weight full
3→2→1 with a weight-2 section (types mixed, creation order); all-neutral → single weightless.

**Gaps to add for 009 (fail-first, then confirm green)**:
1. **Type, full 3→2→1 within a section**: the current Type fixture (`mixed`) only has weights 3 and
   1 in each kind. Add a fixture with weight-3, -2, -1 advantages **and** disadvantages and assert
   each section orders `3 → 2 → 1`.
2. **Determinism/stability across re-render**: call `arrange()` twice on the same input and assert
   identical labels + member id sequences (FR-007), and assert input array identity/order unchanged
   (purity, FR-008's "no mutation" sibling).
3. **No-neutral choice under Type**: assert the rendered output has no Neutral section (renderer
   guard, FR-006) — only if not already implied by existing ChoiceCard tests.

**Rationale**: Closes the explicit FR-002 ("3 → 2 → 1") and FR-007 (stability) coverage while
reusing the established fixture/style.

**Alternatives considered**: A property-based test over random point sets — rejected as
over-engineering (YAGNI, Principle III) for a fixed, small contract; example-based cases are
clearer and sufficient.

## R4 — Verification outcome (implementation)

**Result**: Contract verified **green with zero production code change** (FR-010 confirmed).

- Added 6 cases to `tests/unit/view.test.ts` (`describe('arrange — group ordering locked (009)')`)
  covering FR-001…FR-008, and 2 cases to `tests/components/group-ordering.test.ts` covering the
  Type-side empty-section render guard (FR-006, research R2).
- Full suite: **116 passed** (was 108; +8). `svelte-check`/`tsc` strict: **0 errors**.
- No edits to `src/view.ts` or `src/components/ChoiceCard.svelte` were required — the 008 ordering
  was intact, so the T010 regression-fix contingency was a no-op.
