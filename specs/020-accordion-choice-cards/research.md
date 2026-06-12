# Research: Accordion Choice Cards (020)

All Technical Context unknowns resolved. Decisions below reference the spec's FRs and
the clarifications of 2026-06-12 (summary band kept as-is; collapsed by default,
ephemeral, auto-expand on Points-list update).

## R1 — Accordion mechanism: one Bits UI `Accordion` per card (clarified 2026-06-12)

**Decision** *(rev. 2026-06-12, header redesign)*: Each card hosts its own
**`Accordion.Root type="single"`** (installed `bits-ui@2.18.1`; `value: string`
bindable, default `""`) containing exactly one **`Accordion.Item value={choice.id}`**.
Controlled wiring to the store (R2): `value={isExpanded(choice.id) ? choice.id : ''}` +
`onValueChange={(v) => setExpanded(choice.id, v === choice.id)}` — re-clicking the open
trigger yields `""` (collapse), so the chevron is a true toggle. The header row is
**the Choice name as read-only text + chevron `Accordion.Trigger` at the far right**
(`.choice__name`, ghost "Choice N" placeholder when untitled); `Accordion.Header`
wraps only the Trigger (a real `<button>` with vendor-managed
`aria-expanded`/`data-state`; this bits-ui version emits no `aria-controls`, so the
trigger↔content id link is wired by hand). The whole header row also toggles via
pointer (R10). The ✎ edit and ✕ remove controls live in the **body actions row**
(R9/H-contracts), not the header. The body (group labels + `.notes` + empty hint +
actions row) renders inside **`Accordion.Content`**, animated with Svelte's `slide`
via the `forceMount` + `child` snippet pattern, reduced-motion-gated (R5).

**Rationale**: User decision at clarification (2026-06-12), aligned with the 012
precedent of adopting Bits UI primitives where they own an interaction pattern. A
**per-card** Root (rather than one board-wide `Accordion type="multiple"`) keeps cards
fully independent (FR-002), adds no extra DOM between the `.choices` grid, the 015
`:has()` wrap, and the 018 `.choice-cell` flip wrapper (the Root/Item divs live entirely
*inside* `.choice`), and keeps the store's per-Choice boolean record as the single state
model — no derived `string[]` bridging. No new dependency — `Accordion` ships in the
already-installed package, so the 013 clean-install concern does not apply (B4 still
asserts no `package.json` change).

**Alternatives considered**: Bits UI `Collapsible` per card (functionally equivalent —
superseded by clarification preferring the Accordion compound structure with its
explicit `Header` part); one board-wide `Accordion.Root type="multiple"` (rejected —
its Root/Item elements must interleave with the 015/018 grid and flip wrappers, and a
derived `string[]` value duplicates the store record for no gain; its exclusivity
feature is unwanted); board-wide `type="single"` (rejected — only-one-open contradicts
FR-002); plain native chevron `<button>` + `{#if}` (the plan's original choice —
minimal but rejected at clarification in favour of library-maintained ARIA wiring,
consistent with 012); `<details>/<summary>` (rejected — interactive content inside
`<summary>` is an a11y antipattern); CSS-only `grid-template-rows: 0fr/1fr` (rejected —
hidden content stays in the DOM and needs `inert` management).

## R2 — Collapse state lives in `store.svelte.ts` as an ephemeral rune OUTSIDE `AppState`

**Decision**: A module-level `$state` record `expanded: Record<string, boolean>` in
`store.svelte.ts` (absent key = collapsed, satisfying FR-012's collapsed-by-default with
zero initialization), exposed via `isExpanded(choiceId)` / `setExpanded(choiceId, open)`.
Each card's `Accordion.Root` is controlled: `value={isExpanded(id) ? id : ''}` +
`onValueChange={(v) => setExpanded(id, v === id)}` (R1). The content mutations `addNote`,
`updateNote`, `removeNote` set `expanded[choiceId] = true` (FR-010). `setExpanded` does
**not** go through `update()` — it never fires the persistence channel, never calls
`touch()`, never moves `updatedAt`/save-status (FR-006). `removeChoice` and
`clearDilemma` drop stale entries.

**Rationale**: FR-010 (auto-expand on Points-list update) needs the expand to happen
where the mutations happen — the store. Component-local state would force a deep
`$effect` watch on `choice.notes` (edits change content, not length — fragile) and
couldn't be unit-tested at the store level. Keeping the record **outside** `AppState`
keeps the types honest: `serialize()` already persists only `{dilemma, view}`, so
SC-004 (byte-identical storage) holds structurally, like `status` (010 precedent for
runtime-only display state). No `ViewPrefs` field, no defensive-load change, no
schemaVersion concern — lighter than even the 008 `groupKey` additive path because
nothing is persisted at all.

**Alternatives considered**: per-component `$state` + `$effect` on notes (rejected —
fragile deep watching, untestable contract); persisted `ViewPrefs` field (rejected by
clarification — ephemeral); `SvelteSet` from `svelte/reactivity` (rejected — a plain
record under the existing `$state` proxy is one less import and reads identically).

## R3 — Footer score reuses the pure core; `signed()`/`sign()` extracted to `view.ts`

**Decision**: The footer renders `signed(choiceScore(choice))` with class
`choice__score--{sign(...)}`. The `signed()` and `sign()` helpers currently private to
`Summary.svelte` move to `view.ts` as exported pure functions (`signed`,
`scoreSign`); `Summary.svelte` imports them instead of redefining.

**Rationale**: ChoiceCard and Summary must agree 100% on value and sign colour
(SC-003); two private copies would be the exact drift this success criterion guards
against. `view.ts` is the established home for pure presentation helpers
(`orderedChoices`, 018) and gets them under unit test (Principle IV).

**Alternatives considered**: duplicate locally in ChoiceCard (rejected — SC-003 drift
risk); new `format.ts` module (rejected — YAGNI, two functions).

## R4 — Footer styling: sign-coloured text on a quiet separator, aligned with `.sum__score--*`

**Decision**: New `.choice__foot` zone pinned to the card bottom with `margin-top: auto`
(the card is already a flex column), separated by a hairline `border-top: 1px solid
var(--border)`. The score text gets `.choice__score` (tabular-nums, same weight scale as
`.sum__score`) plus `.choice__score--positive/negative/neutral` reusing the **same
tokens** `--advantage`/`--disadvantage`/`--neutral` as 018's `.sum__score--*` — zero new
custom properties, AA already tuned in both themes.

**Rationale**: "Keep the colour styles aligned" (spec input, FR-004) means same palette,
same sign semantics, both themes. *(Revised post-implementation, user request
2026-06-12)*: the footer now ALSO mirrors the band's `.sum--*` cell treatment — soft
`color-mix` sign tint + sign-coloured 2px top border (`.choice__foot--*`), bled to the
card edges with negative margins so it reads as the card's own base. The original
text-only choice was judged too quiet once seen in situ. The **leader** highlight
remains band-only (no per-card winner framing, Principle I). `margin-top: auto` also
solves the equal-height-row case: in a mixed collapsed/expanded row (015
`grid-auto-rows: 1fr`), the collapsed card's footer pins to the card bottom so footers
in a row stay aligned.

**Alternatives considered**: full `.sum--*` tint + top-border treatment on the footer
(rejected — duplicates the band's louder treatment on six cards, Principle I);
replacing the summary band (rejected by clarification).

## R5 — Animation & jsdom: `slide` transition, reduced-motion-gated via the Summary pattern

**Decision**: `transition:slide={{ duration: flipMs }}` on the `Accordion.Content`
element via the `forceMount` + `child` snippet pattern (the documented Bits UI route
for Svelte transitions, R1), with the same `prefersReduced` matchMedia guard
Summary.svelte uses (0ms under reduced motion, FR-009; jsdom has no `matchMedia`,
guard short-circuits). Component tests assert state via `aria-expanded`/`data-state`
and content presence; assertions that depend on outro removal await the transition
window (the 018 `getAnimations` stub in `tests/setup.ts` already keeps jsdom from
throwing).

**Rationale**: Identical to the shipped 018 reorder-animation approach — one pattern
for motion gating across the codebase. `slide` is the natural fold for an accordion.

**Alternatives considered**: no animation (rejected — jarring for a fold interaction;
gated animation is the established norm here); CSS-only height animation (rejected,
see R1).

## R6 — Layout interplay with 015/018: no grid changes

**Decision**: No change to `.choices` grid rules, the 5–6 `:has()` wrap, the
`.choice-cell` flip wrapper, or the `.summary` mirror. Collapsed-by-default means the
common initial view is a row of short uniform cards (SC-002). In mixed states, 015's
`grid-auto-rows: 1fr` stretches a collapsed card to its row height — accepted; the
footer pins to the bottom (R4) so the card reads as intentionally compact. The <720px
single-column stack keeps content-hugging behaviour (collapsed = header + footer).

**Rationale**: B-boundary discipline — 015's layout contracts stay bit-identical for
expanded boards; this feature only changes what's inside a card. Geometry is
manual-verified (jsdom has no layout engine — 014/016 precedent).

**Alternatives considered**: dropping `grid-auto-rows: 1fr` so collapsed cards shrink
independently (rejected — breaks 015's equal-tile reading and the band's column
adjacency for expanded boards).

## R7 — i18n: constant accessible name, state via `aria-expanded`

**Decision**: New keys `choice.toggleAria` (EN "Show or hide points" / UA "Показати або
приховати пункти") as the chevron button's constant `aria-label`, plus
`choice.scoreLabel` (EN "Score" / UA "Бали") as visually-hidden text (or `aria-label`)
labelling the footer value. The chevron glyph (▸/▾) flips with state but the accessible
name stays constant — ARIA best practice is to convey open/closed through
`aria-expanded`, not by renaming the control.

**Rationale**: Matches the app's full EN/UA coverage; constant-name + `aria-expanded`
is the canonical disclosure pattern and avoids double-announcing state.

**Alternatives considered**: swapping label text "Expand"/"Collapse" (rejected —
redundant with `aria-expanded`, noisier for screen readers).

## R8 — Test plan (TDD red-first, Principle IV)

**Decision**:
- `tests/unit/view.test.ts` — extracted `signed`/`scoreSign` pure helpers (table of
  positive/negative/zero, the U+2212 minus).
- `tests/components/store.test.ts` (extend) — `setExpanded` sets per-id with
  collapsed default; `addNote`/`updateNote`/`removeNote` auto-expand exactly the touched
  Choice (E-contracts); `setExpanded` never fires the persistence channel and never
  changes `status`/`updatedAt` (deep-equal before/after, the 016 H2 pattern);
  `removeChoice`/`clearDilemma` drop state.
- New `tests/components/accordion.test.ts` (DOM-driven) — default collapsed render
  (body absent, header + footer present); per-card toggle independence; `aria-expanded`/
  `aria-controls` wiring; footer shows `signed(choiceScore)` with the right
  `choice__score--*` class and matches the Summary cell for the same Choice (SC-003);
  serialized payload byte-identical across toggles (SC-004). *(Rev. 2: A1/A4 rewritten
  for the read-only header; H1–H5 added — see R9/R10 and contracts.)*
- Manual sweep (no layout engine in jsdom): M1 reduced-motion fold, M2 mixed
  collapsed/expanded rows on 5–6-Choice wrapped boards, M3 AA contrast of footer in both
  themes, M4 keyboard-only walkthrough, M5 all-collapsed 6-Choice no-scroll check
  (SC-002).

**Rationale**: Mirrors the 018 split — pure logic and DOM behaviour under vitest/jsdom,
geometry/contrast/motion manual.

## R9 — Title-edit state: component-local, Esc-before-blur, live rename preserved (rev. 2)

**Decision**: A component-local `let editingTitle = $state(false)` in
`ChoiceCard.svelte` — NOT a store record. Entering edit (the body's "✎ Rename" button)
snapshots the current title (`prevTitle`) and swaps the header's `.choice__name` text
for the existing autofocused `<input>`; the input keeps today's **live
`renameChoice`-as-you-type** semantics (store mutation reused verbatim, `touch()` and
persistence unchanged). **Commit** (Enter or blur) merely exits edit mode — the store
already holds the value. **Cancel** (Esc) runs in the input's own `keydown` handler,
which fires BEFORE the blur it causes: it restores `renameChoice(id, prevTitle)`, sets
`editingTitle = false`, and stops propagation (so the App-level Esc handler doesn't
also close the points form); the subsequent blur sees `editingTitle === false` and
no-ops — this is the contract-A1-flagged Esc-before-blur ordering (H2). Focus returns
to the Rename button after commit or cancel (element ref).

**Rationale**: Unlike the expand record (R2), no module outside the card ever needs to
know a title is being edited — `addNote` has no FR-010-style obligation here — so a
store API would be speculative (Principle III, YAGNI). Reusing the live-rename mutation
keeps every existing store/rename test valid and makes "commit" a pure UI-state exit
with no new mutation surface.

**Alternatives considered**: store-level `editingTitleId` (rejected — no cross-module
consumer); commit-on-Enter-only with a draft local value (rejected — diverges from the
app's everywhere-live editing model and adds a second source of truth for the title);
a dialog editor (rejected at clarification, Q1 option C).

## R10 — Whole-header toggle: pointer convenience on top of the chevron button (rev. 2)

**Decision**: The `.choice__head` row gets a `click` handler that calls
`setExpanded(choice.id, !isExpanded(choice.id))` — guarded to do nothing when (a)
`editingTitle` is true (FR-007/FR-013) or (b) the click originated inside an
interactive element (`event.target.closest('button, input, a')` — prevents
double-toggling when the chevron itself is clicked, and keeps future header controls
safe). `cursor: pointer` on the head (reverted while editing). The chevron
`Accordion.Trigger` remains the ONLY element exposed to assistive tech as the toggle
(`aria-expanded`); the head div gets no role and no tabindex — keyboard users toggle
via the chevron button, so there is no redundant tab stop and no nested-interactive
ARIA violation.

**Rationale**: This is the standard disclosure-widget layering (WAI-ARIA accordion
pattern: one button controls the panel; enlarging the pointer target is presentation).
Making the head itself a `<button>` would nest the Trigger inside it — invalid HTML
and a worse screen-reader experience.

**Alternatives considered**: wrapping the whole head in the Trigger (rejected — the
title text would be announced as the button's name, and the Rename-input swap would
live inside a button); `role="button"` + tabindex on the head (rejected — duplicate
tab stop announcing the same state twice).
