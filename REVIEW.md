# Sift — Repository Review

> **Date:** 2026-05-31 · **Branch:** `main` · **Commit:** `9dedf17`
> **Scope:** whole repo — `src/`, `tests/`, `specs/`, config, constitution.
> **Lens:** clean code, YAGNI, DRY, SOLID, architecture, overengineering, comments,
> folder structure, documentation footprint.

## Overall

This is genuinely well-built. The pure core is cleanly separated from state and
presentation, the data invariants are typed and enforced in one place, persistence is
defensive, i18n is hand-rolled with parity tests, and the test discipline is real.

| Metric | Value |
| --- | --- |
| App code (`.ts` + `.svelte`, excl. CSS) | ~1,796 lines |
| CSS | 796 lines |
| Test code | ~1,499 lines (109 tests, 34 describes) |
| Test-to-code ratio | ~0.83 : 1 |
| Committed Markdown | 82 files, ~8,516 lines (**80 under `specs/`**) |
| Docs-to-code ratio | ~4.7 : 1 (all in `specs/`) |
| `TODO`/`FIXME`/`HACK` in `src/` | 0 |
| Runtime deps declared / actually imported | 3 / 1 |

> Scratch/tooling dirs (`docs/`, `.superpowers/`, `.remember/`, `.specify/`) are gitignored,
> so brainstorm HTML and server scratch never reach history — good hygiene, keep it. (Markdown
> figures are git-tracked counts as of the date above.)

The notes below are **polish on an already-disciplined codebase**, not rescue work.
They're tiered by whether they're worth acting on.

---

## Tier 1 — Worth fixing

### 1. Two of three runtime dependencies are never imported (one justified a constitution major-bump)

`package.json` declares three runtime deps. Only `svelte` is used.

- **`bits-ui`** — not imported anywhere in `src/`. This is the notable one: Constitution
  **v2.0.0 was a MAJOR bump** whose entire rationale (`.specify/memory/constitution.md:1-8`)
  was relaxing Principle III to permit "a UI framework **and headless component
  libraries**," and CLAUDE.md records research R9 picking Bits UI "over Melt UI." But the
  only dialog in the app — `src/components/SuggestDialog.svelte` — hand-rolls its own
  `role="dialog"`, and the focus trap / Tab cycling / Esc / scroll-lock / backdrop are all
  hand-written in `src/App.svelte:29-62` and the dialog itself. The app reimplements
  precisely what `bits-ui`'s `Dialog` provides, while shipping `bits-ui` unused.
- **`@internationalized/date`** — not imported anywhere; Sift has no date UI. Almost
  certainly a stray hoist from a `bits-ui` calendar exploration.

**Suggestion:** Either delete both deps (`yarn remove bits-ui @internationalized/date`) —
the hand-rolled dialog is small and works — **or** actually adopt `bits-ui`'s Dialog in
`SuggestDialog` and delete the manual trap in `App.svelte`. Pick one; right now the project
carries the dependency cost *and* the hand-rolled code. Given Principle I/III ("smallest
dependency that does the job," YAGNI), lean toward **removing both**. Whichever you choose,
the constitution rationale and CLAUDE.md should stop asserting Bits UI is in use.

### 2. `addNote` / `updateNote` are dead in the UI and duplicate `submitForm`

`src/store.svelte.ts:154` (`addNote`) and `:168` (`updateNote`) are imported by no
component — the UI commits notes exclusively through `submitForm` (`:246`). They survive
only via their own unit tests. Worse, `submitForm`'s two branches re-implement their bodies
verbatim (same `c.notes.push({ id: newId(), text: draft.text.trim(), type, weight:
normalizeWeight(...) })`, same edit assignment).

**Suggestion (DRY + dead code):** have `submitForm` delegate — call `addNote(...)` /
`updateNote(...)` and keep only the form-lifecycle bits (clear-and-stay-open vs close) in
`submitForm`. That makes the two functions live again and removes the duplication. If you'd
rather not, delete `addNote`/`updateNote` and their tests outright.

### 3. `SuggestStatus` / `status` is write-only scaffolding (YAGNI)

`src/types.ts:59-61` defines `SuggestStatus = 'idle'` — a one-member union — and
`SuggestState.status` is set to `'idle'` in two places (`src/store.svelte.ts:37`, `:309`)
but **never read**. The comment even concedes "the mailto hand-off has no async network
states." It's a placeholder for states that can't exist (mailto is synchronous).

**Suggestion:** drop `SuggestStatus` and the `status` field. If async ever arrives, add it then.

### 4. Theme FOUC + a stale comment promising code that doesn't exist

`src/theme.ts:2-3` says: *"US2 extends this with a matchMedia listener + a pre-paint snippet
in index.html."* Neither exists — `index.html` is bare, and theme is applied only after
mount via `$effect` in `src/App.svelte:15-17`. Consequence: a user who explicitly chose
**Dark** while their OS is Light gets a flash of light on every load (the CSS dark branch
keys off `prefers-color-scheme` or the `data-theme` attribute, and the attribute isn't set
until Svelte mounts — `src/styles/app.css:46-85`). For a product whose first principle is
"calm," a theme flash is exactly the wrong first impression.

**Suggestion:** add the pre-paint inline script the comment already promises — read
`localStorage['sift.v1']`, set `document.documentElement.dataset.theme` before first paint.
It also lets you fix #5 below in the same stroke.

### 5. Dark palette is duplicated verbatim in CSS (DRY)

`src/styles/app.css:46-64` (`@media (prefers-color-scheme: dark)`) and `:68-85`
(`:root[data-theme="dark"]`) are the same 14 custom-property lines twice.

**Suggestion that also resolves #4:** if the pre-paint script *always* resolves `system` →
an explicit `light`/`dark` attribute, the media-query branch becomes unnecessary and you
keep **one** `[data-theme="dark"]` block. One indirection kills both the duplication and the
flash.

---

## Tier 2 — Architecture observations (considered trade-offs)

### 6. Immutable clone-on-every-keystroke vs. runes' in-place reactivity

`src/store.svelte.ts:93-99`: every mutation does `$state.snapshot(current)` (deep clone of
the whole `AppState`), runs a producer, then reassigns `current`. Every `oninput` keystroke
(`setFormText`) therefore deep-clones the entire dilemma. For this data size it's
*completely fine* performance-wise — this is **not** a speed flag. The point is conceptual:
this is a Redux-style immutable-producer pattern layered on Svelte 5 runes, whose entire
selling point is fine-grained *in-place* deep reactivity. And it's applied inconsistently —
`setLastSaved` and `initLang` (`:89`, `:296`) mutate `current` in place and rely on runes,
proving the snapshot machinery is optional.

This is clearly a deliberate carry-over: the store preserves the pre-Svelte `state.ts`
mutation API as a tested parity contract (per CLAUDE.md). That was the right call *during*
the 004 migration. But now that the framework-free constraint is gone, the `update(producer)`
+ snapshot indirection is arguably the one bit of vestigial complexity left. Worth revisiting
when you next touch the store — not urgent. (The snapshot does give transactional
all-or-nothing mutation, but no producer here can throw mid-way, so that safety isn't buying
anything.)

### 7. SOLID / structure is otherwise sound

Single-responsibility holds well: `scoring`, `view` (arrangement), `persistence`, `mailto`,
`theme`, `ids` are each one job and pure where they claim to be. The `arrange()` function
(`src/view.ts:36-85`) is a clean pure dispatcher. `ids.ts` as a single seam for
`crypto.randomUUID()` is exactly the right amount of indirection for testability — not
over-abstracted. No god-objects, no premature interfaces.

---

## Tier 3 — Comments, structure, nits

- **Comments in code: keep them — this is not a problem to reduce.** They're nearly all
  *why*-comments citing the governing FR/principle (e.g. `src/store.svelte.ts:184-186`),
  which is the good kind; they earn their place. The only trims worth making are the **stale
  `theme.ts` comment** (#4) and the **CSS spec-tags** (`M4/FR-001 (006)`, `(007)`, `(008)`
  scattered through `src/styles/app.css`) — those couple the stylesheet to spec history and
  read as noise to anyone without the specs open. Do **not** strip the rest; comment density
  here is a feature, not bloat.
- **Folder structure is right for the size.** Flat `src/` for core + `components/` +
  `i18n/` + `styles/`, and `tests/` split into `unit/` and `components/`, is clean and
  predictable. Don't preemptively introduce a `core/` or `lib/` grouping — YAGNI cuts both
  ways; current layout is legible at 14 files.
- **Test-only attributes in prod markup.** `data-action` / `data-field` / `data-region` are
  everywhere as test selectors. Acceptable and common, but it is a lot of test-coupling
  shipping to users; if you ever want them gone, `data-testid` stripped at build time is the
  usual move. Low priority.

---

## Tier 4 — Documentation & process footprint

Committed Markdown is **82 files / ~8,516 lines**, and **80 of those live under `specs/`** (8
features × ~10 Spec-Kit artifacts: spec, plan, tasks, research, data-model, contracts,
quickstart, checklist). Root carries only `CLAUDE.md` + `README.md`. The scratch/tooling dirs
(`docs/`, `.superpowers/`, `.remember/`, `.specify/`) are gitignored — that hygiene is good
and should stay. Against ~1,796 lines of app code that's still **~4.7 : 1 docs-to-code**,
concentrated entirely in `specs/`.

### Verdict: don't delete it — manage it differently

Three reasons **not** to reduce by deletion:

1. It's Markdown — **zero bundle / build / runtime cost**. Dead weight in docs is nearly
   free; dead weight in code is not.
2. This repo lives under `self-education/` and its explicit purpose is *practicing*
   Spec-Driven Development. The specs **are the deliverable** of that practice — deleting
   them deletes the thing being learned and demonstrated.
3. As a portfolio artifact, an end-to-end disciplined process has real value.

So "make the repo smaller" is the wrong goal. The actual wins are the three levers below.

### Lever 1 — Scale ceremony to change size (the biggest win, going forward)

This is where the bloat actually is. Feature 008 — relabel a toggle and reorder two
components — generated **10 artifacts**. For that change, `spec + tasks` was plenty. Match the
artifact set to the change:

| Change size | Artifacts worth writing |
| --- | --- |
| Trivial (copy/relabel/reorder — 005, 008) | short spec + tasks |
| Small feature (007 remove-point) | spec + plan + tasks (+ 1 contract if a real invariant exists) |
| Substantial (001 MVP, 004 rebuild) | full package — justified |

Spec Kit lets you skip artifacts; you don't have to run the whole pipeline every time.

### Lever 2 — Cut intra-feature repetition

The repetition that reads as bloat is mostly *within* a feature folder: spec / plan /
data-model / contracts / quickstart often restate the same decisions in different words. For
small features, fold `data-model` + `contracts` into the spec, and skip `quickstart` /
`checklist` unless the feature genuinely needs an acceptance matrix. This shrinks the next
feature's footprint without touching the shipped ones.

### Lever 3 — Keep the committed docs honest (governance)

Volume isn't the risk; **drift is**. A committed doc that asserts something false is worse
than no doc, because it erodes trust in all of them.

- **Commit the constitution (recommended).** It is gitignored under `.specify/` while 80
  committed specs cite it ("Constitution Check", "v2.0.0") — a reader can't see what those
  references mean. Unignore **only** that one file; leave the rest of `.specify/` ignored as
  regenerable tooling. Git can't re-include a file under a blanket-ignored directory, so the
  pattern is:

  ```gitignore
  .specify/*
  !.specify/memory/
  .specify/memory/*
  !.specify/memory/constitution.md
  ```

  This also resolves the Sync Impact Report's own "not versioned" warning. Going forward,
  amend = version bump + one-line rationale in the commit (already the governance rule — it
  would then have somewhere to live).
- **The live drift vector is `CLAUDE.md`** (committed), which still describes Bits UI as the
  stack while the code never imports it (#1). Keep the specs; just keep the committed docs
  truthful when reality diverges.

### Bottom line

No — not worth deleting what's there. The win isn't a smaller repo; it's **generating less
next time** (match artifacts to change size), **less intra-feature repetition**, and
**keeping the committed docs honest**. "Reduce" should mean *lighter ceremony forward +
truthful docs*, not `rm -rf` the record of how you built it.

---

## Suggested order of operations

1. **Decide `bits-ui` in-or-out (#1)** — this gates the dialog and theme work.
2. **#4 + #5 together** — pre-paint script resolves the FOUC and lets you collapse the
   duplicated dark palette to one block.
3. **#2 + #3** — small, isolated cleanups (dead code / vestigial type).
4. **Commit the constitution** (Tier 4, Lever 3) — apply the `.gitignore` pattern there to
   unignore `.specify/memory/constitution.md` only, then stage and commit it.
5. **Adopt the ceremony-scaling table** (Tier 4, Lever 1) for the *next* feature; leave
   shipped specs as-is.
6. **#6** — revisit the store's snapshot pattern next time it's touched; not urgent.

## What NOT to change

- The pure-core / store / presentation separation — it's the codebase's main strength.
- The flat folder layout — appropriate for the size; adding `core/`/`lib/` now is premature.
- The hand-rolled i18n — zero-dependency, parity-tested, and correct.
- **Comments in code** — keep them (Tier 3); only the two stale/noisy cases get trimmed.
- The **gitignored scratch/tooling** (`docs/`, `.superpowers/`, `.remember/`, and the
  regenerable parts of `.specify/`) — keep ignored.
- The **shipped specs (001–007)** — keep them as the learning record; just don't let the
  committed docs assert falsehoods about the code (#1, Lever 3).
