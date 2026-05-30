# Contract: Components & Headless-Primitive Mapping (`src/components/`)

The component tree that replaces `src/render/*`, and the mapping of each Sift UI need to a
headless primitive. This is the spec's "components to evaluate" deliverable: a shortlist with
the preferred primitive, **not** a locked vendor lock-in — each is reached through a thin
`components/ui/*` wrapper so the app depends on a Sift-local surface.

## Component tree

```text
App.svelte
├── Header.svelte            # dilemma title (bind:value), ghost placeholder
├── Toolbar.svelte           # row order (left→right): lang toggle, theme toggle, Clear,
│                            #   Saved indicator, spacer, Group/Sort toggles, Add-choice
│                            #   (the live `n / MAX` count is shown inside the Add-choice
│                            #   control, not as a separate element); Arrange config row
│                            #   (sortKey/direction) shows when grouped/sorted
├── ChoiceCard.svelte  (×2..4)
│   ├── (choice title, bind:value)
│   ├── Summary.svelte       # for/against/score ($derived), leader highlight (dot+color)
│   ├── NoteRow.svelte (×n)  # text + type + weight dots; edit/remove; animate:flip on reorder
│   └── AddEditForm.svelte   # unified add/edit; bind:value text; type/weight controls
├── Footer.svelte            # author + GitHub/LinkedIn; "Suggest a feature" trigger
└── SuggestDialog.svelte     # Dialog over mailto (no network)
```

## Need → primitive mapping (preference: Melt UI > Bits UI > shadcn-svelte reference-only)

| Sift need | Wrapper | Primitive | Keyboard / ARIA contract |
|-----------|---------|-----------|--------------------------|
| Choice selector (form target) | `ui/Select.svelte` | Select | Arrow keys move option; Enter selects; Esc closes; labelled; `aria-expanded`. |
| Clear confirmation | `ui/Dialog.svelte` | AlertDialog | Focus trapped; Esc cancels; Enter on confirm; returns focus to trigger. |
| Suggest-a-feature | `SuggestDialog` (uses `ui/Dialog`) | Dialog | Focus trap; Esc closes; Send disabled until `canSend`; composes `mailto:` only. |
| Arrange config | `ui/Popover.svelte` | Popover | Esc closes; focus returns to trigger; `aria-controls`. |
| Type / Weight / Sort | `ui/ToggleGroup.svelte` | Toggle Group | Arrow keys move selection; roving tabindex; single-select semantics. |
| Note text / fields | `ui/Field.svelte` | input/Textarea | Labelled; `bind:value`; Enter submits where applicable. |

## Behavioral contract (maps to FR / SC)

- **No focus loss (FR-002/SC-002)**: all editable fields use `bind:value`; derived values
  (`$derived` score) update without remounting inputs. Component tests type multiple
  characters and assert focus + caret survive.
- **Keyboard operability (FR-010/FR-011/SC-004)**: every interactive element reachable by
  Tab in logical order with a visible focus ring (Tailwind `focus-visible`).
- **Esc-to-dismiss (FR-012)**: form, dialog, and popover all close on Esc and restore focus.
- **Arrow nav (FR-013)**: Select and Toggle Group move selection with arrows; Enter submits
  the form.
- **Weight not by color alone (Principle V)**: weight renders as an explicit dot count *and*
  color; `NoteRow`/`Summary` tests assert the dot count is present without relying on color.
- **Leader highlight (Principle I)**: `Summary` highlights only true top-score leaders;
  all-zero board shows no leader.
- **Parity (FR-001/SC-001)**: the create→choices→notes→group/sort→score→clear journey and
  the suggest→mailto journey behave identically to the current app.

## Acceptance

- `tests/components/*` cover each journey above; `tests/unit/*` (pure core) stay green.
- Removing the mouse (keyboard-only) completes a full comparison (a11y test).
