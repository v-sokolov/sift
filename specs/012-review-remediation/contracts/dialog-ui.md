# Contract: Suggest Dialog on Bits UI (markup + behavior)

Feature: `012-review-remediation` · Covers FR-003, FR-004, FR-005 · See [research.md](../research.md) R1/R2

The rebuilt `SuggestDialog.svelte` uses `bits-ui`'s `Dialog` primitive (inline, no Portal),
controlled by the store. It MUST honor the following so styling and tests survive and behavior is
preserved.

## C-1 — Open is controlled by the store

`Dialog.Root` is rendered with `open={s.suggest.open}` and
`onOpenChange={(v) => (v ? openSuggest() : closeSuggest())}`. The dialog is shown iff
`suggest.open` is true. The external trigger (`[data-action="open-suggest"]` in `Header`) still
calls `openSuggest()`.

## C-2 — Preserved markup hooks (classes + data-*)

| Element | Class | Other attrs (preserved) |
|---|---|---|
| Backdrop (`Dialog.Overlay`) | `modal-overlay` | `data-action="suggest-backdrop"` |
| Dialog (`Dialog.Content`) | `modal` | `data-region="suggest"`, `aria-labelledby="suggest-title"` |
| Title (`Dialog.Title`) | `modal__title` | `id="suggest-title"` |
| Close (`Dialog.Close`) | `modal__close` | `data-action="close-suggest"`, `aria-label` (localized) |

`role="dialog"` and `aria-modal="true"` are now emitted by `Dialog.Content` (no longer
hand-set). The form, fields (`data-field="suggest-*"`, `data-action="suggest-field"`), the two
action buttons with `btn--half` (011, Cancel→Send order), the LinkedIn fallback footnote
(`.modal__fallback`, left-aligned), and the no-maintainer-email invariant (I-S2) are all
unchanged.

## C-3 — Behavior (now provided by Bits UI, asserted at the observable level)

| Behavior | Source | Acceptance |
|---|---|---|
| Opens on trigger | store `openSuggest` | `.modal` present, `role="dialog"`, `aria-modal="true"` |
| Focus into dialog on open | `Dialog.Content onOpenAutoFocus` → name field | `document.activeElement` is `[data-field="suggest-name"]` |
| Esc closes | `EscapeLayer` | dialog gone after Escape |
| Focus returns to trigger on close | `FocusScope` restore | `activeElement` is `[data-action="open-suggest"]` after close |
| Backdrop / outside click closes | `DismissibleLayer` | clicking overlay closes; clicking dialog body does not |
| Tab focus trapped | `FocusScope` | Tab from last focusable wraps to first; focus never leaves dialog |
| Background scroll locked | `ScrollLock` | scroll locked while open, restored on close |
| Send disabled until valid | store `canSend` | Send disabled until name AND description non-whitespace |
| Submit fires mailto + closes | existing `send()` handoff | one `mailto:` with entered values, then dialog closes |

## C-4 — What is deleted (must not regress)

- `App.svelte`: the suggest-Esc branch, the Tab focus-trap block, and the focus-return `$effect`
  are removed (now owned by Bits UI). The **note-form** Esc branch (`closeForm` when `editing`)
  stays.
- `SuggestDialog.svelte`: the hand-rolled `backdrop()` handler, the focus `$effect`, and the
  scroll-lock `$effect` are removed.

## C-5 — Dependency truth (FR-001/FR-005)

After this change, `bits-ui` is imported by `SuggestDialog.svelte` (so it is no longer
declared-but-unused), and `@internationalized/date` is removed from `package.json`. Committed docs
(`CLAUDE.md`, constitution rationale) describe Bits UI as genuinely used by the dialog.

## Test observability note

Component tests run on jsdom without a layout engine; behavior above is exercised via DOM events
and `document.activeElement`/element-presence assertions (Bits UI's layers operate on real DOM
events, which jsdom supports). Because the dialog renders **inline (no Portal)**, the existing
container-scoped queries continue to work; queries that previously targeted hand-rolled structure
are updated to the Bits UI structure while asserting the same observable behavior.

**jsdom feasibility**: the event-driven rows (open, focus-on-open, Esc-close + focus-return,
backdrop/outside-close, disabled-Send, mailto handoff) are jsdom-drivable and stay automated. The
**Tab focus-trap** and **background scroll-lock** rows depend on Bits UI's `FocusScope`/`ScrollLock`,
which may need visibility/layout jsdom doesn't provide; if they cannot be driven in jsdom, those
two assertions are verified manually. The behavioral *contract* is unchanged — only the
verification venue (automated vs. manual) may shift for those two rows.
