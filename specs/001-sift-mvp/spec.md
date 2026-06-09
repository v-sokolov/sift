# Feature Specification: Sift MVP

> **Status: Shipped — condensed 2026-06-09**

## What shipped & why

Sift is a minimalist, fully client-side web app for thinking through an everyday
decision by laying **2–4 choices** side by side, capturing what's good and bad about
each (with a simple sense of how much each point matters), and showing a quiet running
score per choice. It optimizes for **clarity over comprehensiveness, calm over feature
density, and reflection over automation** — the score is a gentle aid, never a verdict.

001 is the frozen MVP and the **parity contract** for everything after it: the pure
core (`scoring.ts`, `view.ts`, `persistence.ts`, types, ids) plus its unit tests are
reused verbatim by the Phase-2 Svelte rebuild (004). The behavioural laws those modules
must satisfy live in `data-model.md` and `contracts/*` and are the authoritative
reference — this spec is the prose summary.

The MVP delivered four capabilities:

- **Weigh a decision, see a quiet score (P1).** State one question (the dilemma title),
  add 2–4 choices, attach typed notes — advantage / disadvantage / neutral — where
  advantage/disadvantage carry a weight of 1–3 (shown as ●/●●/●●● dots) and neutral
  carries none. Per choice the app shows live, signed totals: a for-total (Σ advantage
  weights), an against-total (Σ disadvantage weights), and a score = for − against.
  Neutral notes never affect any number. The single highest-scoring choice gets a
  gentle, non-triumphant highlight; ties all highlight equally with no tiebreaker; an
  all-zero board highlights nobody. Scores are **derived live, never stored**.
- **Keep work without an account (P2).** The dilemma and view settings auto-save to
  `localStorage` (single key `sift.v1`, debounced ~400ms + flush on unload) and restore
  on reload, with no account/login/network. A quiet "Saved" indicator confirms storage.
  **Clear** is the only "start over" action: after confirmation it wipes everything
  (question, choices, notes, view mode/key/direction, theme) back to the empty default
  (blank title, two starter choices, defaults restored).
- **Organize notes (P3).** A single unified on-demand form creates and edits notes
  (target choice, type, weight, text); choosing neutral greys out (not hides) the weight
  control. **Group** and **Sort** are mutually exclusive view toggles applied to all
  choices at once and persisted: Group shows fixed sections Advantages → Disadvantages →
  Neutral (weighted notes ordered by weight in the chosen direction); Sort flattens to
  one list ordered by key (weight/type) + direction; ties fall back to creation order.
  Default view is creation order, and the secondary config row hides unless Group or
  Sort is active.
- **Read it comfortably and accessibly (P3).** Light and dark themes (default follows
  `prefers-color-scheme`, manual override persists), both legible. **Weight is never
  conveyed by colour alone** — a dot count always accompanies it. The note form is
  keyboard-operable and closes on Esc. Empty states are calm placeholders ("What are you
  deciding?", placeholder choice names, "No notes yet") rather than blank/collapsed
  regions. English-only; a single quiet author footer sentence.

## Key constraints & decisions

- **Choice count** bounded 2–4: removing is blocked at 2, adding blocked at 5th (the
  4-choice max is communicated); a live `N / 4` count is shown. (Later raised to 6 in
  feature 015.)
- **Architecture (MVP, framework-free):** TypeScript 5.x strict + Vite 5, no UI
  framework and **no runtime dependencies**; data never leaves the device (no backend,
  account, sync, telemetry). Scoring and note-arrangement are isolated **pure functions**
  (trivially unit-testable). State flows through a single `AppState` + tiny pub/sub
  store; persistence is a debounced `localStorage` write under a **versioned envelope**
  (`{ schemaVersion: 1, dilemma, view }`) that loads **defensively** — missing,
  unparseable, or invalid payloads fall back to the empty default rather than throwing.
  IDs come from `crypto.randomUUID()` wrapped in `ids.ts` to keep the pure modules
  deterministic. Choices render as side-by-side columns at ≥720px and stack vertically
  below (pure-CSS breakpoint, no JS). Tests run on Vitest + jsdom.
- **Accepted limitations / non-goals (this version):** single active dilemma only;
  the "more notes pushes the score more extreme" property is accepted and mitigated by
  quiet presentation, not normalization; a single fixed scoring formula (for − against).
  Explicit non-goals: accounts, collaboration, AI recommendations, custom scoring
  formulas, >4 choices, PDF/CSV export, multi-dilemma history, charts/analytics.
  Deferred: shareable read-only link, "decision made" marker, gut-check prompt, soft
  status labels, balance-bar visualization, manual drag-to-reorder.

## Success criteria

- A first-time user, without explanation, can create a dilemma, add 2–4 choices, and add
  weighted advantages/disadvantages and neutral notes via the single unified form.
- A user can correctly interpret a choice's score and for/against totals on first view
  (displayed score matches a hand calculation of for-total − against-total), and can
  identify the leading choice side-by-side without instructions.
- After reload, 100% of question, choices, notes, weights, and view settings restore intact.
- Weight is perceivable from its dot count alone (no reliance on colour).
- The core loop is completable in a single sitting of a few minutes with no setup,
  account, or network, and reads as calmer than a spreadsheet — guidance, not a verdict.

## Shipped as

Committed directly as the initial Spec Kit feature (commit `cf2f1c1`, "Sift MVP Spec Kit
artifacts and agent context"); the MVP UI was first realized in the Phase-2 rebuild
(`#5`). No standalone MVP PR.
