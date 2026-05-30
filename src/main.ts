import type { NoteType, SuggestionDraft, Weight } from './types';
import {
  addChoice,
  canSend,
  clearDilemma,
  closeForm,
  closeSuggest,
  cycleTheme,
  emptyDilemma,
  getState,
  initLang,
  openAddForm,
  openEditForm,
  openSuggest,
  removeChoice,
  renameChoice,
  setDirection,
  setDilemmaTitle,
  setFormChoice,
  setFormText,
  setFormType,
  setFormWeight,
  setLang,
  setLastSaved,
  setSortKey,
  setState,
  setSuggestField,
  submitForm,
  subscribe,
  subscribePersist,
  toggleGroup,
  toggleSort,
} from './state';
import { renderApp } from './render';
import { installUnloadFlush, isLang, load, scheduleSave } from './persistence';
import { detectLang, t } from './i18n';
import { buildMailto } from './mailto';
import { CONTACT_EMAIL } from './config';

const root = document.getElementById('app');
if (!root) throw new Error('Missing #app root element');

// ---- Suggest-modal focus management (open → focus first field; close → restore) ----
// The full re-render replaces nodes, so focus is restored by selector against the
// fresh DOM rather than a stale element reference.
let suggestWasOpen = false;

function reconcileSuggest(): void {
  const open = getState().suggest.open;
  if (open && !suggestWasOpen) {
    root!.querySelector<HTMLElement>('[data-field="suggest-name"]')?.focus();
  } else if (!open && suggestWasOpen) {
    root!.querySelector<HTMLElement>('[data-action="open-suggest"]')?.focus();
  }
  suggestWasOpen = open;
}

// Wire channels before touching state so the first change renders + saves.
subscribe((state) => {
  renderApp(root, state);
  reconcileSuggest();
});
subscribePersist((state) => scheduleSave(state, setLastSaved));
installUnloadFlush(getState, setLastSaved);

// Restore prior work (with its saved language), or start from the empty default
// with a browser-detected language (FR-002/FR-004).
const restored = load();
const navLang = detectLang(navigator.language);
if (restored) {
  const storedLang = (restored.view as unknown as Record<string, unknown>).lang;
  const lang = isLang(storedLang) ? storedLang : navLang;
  setState({
    ...emptyDilemma(),
    dilemma: restored.dilemma,
    view: { ...restored.view, lang },
  });
} else {
  initLang(navLang); // first visit: detected language, no premature save
}

// Always render once on boot (subscribe only fires on subsequent updates).
renderApp(root, getState());
reconcileSuggest();

// ---- Event delegation ----

function actionEl(target: EventTarget | null): HTMLElement | null {
  return (target as HTMLElement | null)?.closest('[data-action]') ?? null;
}

function choiceIdOf(target: EventTarget | null): string | undefined {
  return (target as HTMLElement | null)?.closest<HTMLElement>('[data-choice-id]')?.dataset
    .choiceId;
}

function noteIdOf(target: EventTarget | null): string | undefined {
  return (target as HTMLElement | null)?.closest<HTMLElement>('[data-note-id]')?.dataset.noteId;
}

function fireSuggestMailto(): void {
  const draft = getState().suggest.draft;
  if (!canSend(draft)) return;
  // Hand off via a transient anchor rather than assigning window.location, so the
  // page itself never navigates (and it stays test-friendly).
  const a = document.createElement('a');
  a.href = buildMailto(draft, CONTACT_EMAIL);
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
  a.remove();
  closeSuggest();
}

root.addEventListener('click', (e) => {
  const el = actionEl(e.target);
  if (!el) return;
  const action = el.dataset.action;

  switch (action) {
    case 'add-choice':
      addChoice();
      break;
    case 'remove-choice': {
      const id = choiceIdOf(e.target);
      if (id) removeChoice(id);
      break;
    }
    case 'edit-note': {
      const cid = choiceIdOf(e.target);
      const nid = noteIdOf(e.target);
      if (cid && nid) openEditForm(cid, nid);
      break;
    }
    case 'open-add-form': {
      const first = getState().dilemma.choices[0];
      if (first) openAddForm(first.id);
      break;
    }
    case 'toggle-group':
      toggleGroup();
      break;
    case 'toggle-sort':
      toggleSort();
      break;
    case 'set-sortkey':
      if (el.dataset.key) setSortKey(el.dataset.key as 'weight' | 'type');
      break;
    case 'set-direction':
      if (el.dataset.dir) setDirection(el.dataset.dir as 'asc' | 'desc');
      break;
    case 'cycle-theme':
      cycleTheme();
      break;
    case 'set-lang':
      if (el.dataset.lang) setLang(el.dataset.lang as 'en' | 'uk');
      break;
    case 'open-suggest':
      openSuggest();
      break;
    case 'close-suggest':
      closeSuggest();
      break;
    case 'suggest-backdrop':
      // Close only when the click lands on the overlay itself, not its contents.
      if (e.target === el) closeSuggest();
      break;
    case 'clear':
      if (window.confirm(t(getState().view.lang, 'confirm.clear'))) clearDilemma();
      break;
    case 'form-type':
      if (el.dataset.type) setFormType(el.dataset.type as NoteType);
      break;
    case 'form-weight':
      if (el.dataset.weight) setFormWeight(Number(el.dataset.weight) as Weight);
      break;
    case 'form-cancel':
      closeForm();
      break;
    default:
      break;
  }
});

root.addEventListener('input', (e) => {
  const el = e.target as HTMLElement;
  switch (el.dataset.action) {
    case 'title':
      setDilemmaTitle((el as HTMLInputElement).value);
      break;
    case 'rename-choice': {
      const id = choiceIdOf(e.target);
      if (id) renameChoice(id, (el as HTMLInputElement).value);
      break;
    }
    case 'form-text':
      setFormText((el as HTMLTextAreaElement).value);
      break;
    case 'suggest-field': {
      const field = el.dataset.suggestField as keyof SuggestionDraft | undefined;
      if (field) setSuggestField(field, (el as HTMLInputElement | HTMLTextAreaElement).value);
      break;
    }
    default:
      break;
  }
});

root.addEventListener('change', (e) => {
  const el = e.target as HTMLElement;
  if (el.dataset.action === 'form-choice') {
    setFormChoice((el as HTMLSelectElement).value);
  }
});

root.addEventListener('submit', (e) => {
  e.preventDefault();
  const target = e.target as HTMLElement;
  if (target.closest('[data-action="suggest-form"]')) {
    fireSuggestMailto();
    return;
  }
  // The unified add/edit note form.
  submitForm();
});

root.addEventListener('keydown', (e) => {
  // Esc closes the suggest modal first (it sits above the note form), then the form.
  if (e.key === 'Escape') {
    if (getState().suggest.open) {
      closeSuggest();
      return;
    }
    if (getState().editing) {
      closeForm();
      return;
    }
  }

  // Focus trap within the open suggest modal (FR-008).
  if (e.key === 'Tab' && getState().suggest.open) {
    const modal = root!.querySelector<HTMLElement>('.modal');
    if (modal) {
      const focusables = Array.from(
        modal.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      );
      if (focusables.length) {
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        const active = document.activeElement;
        if (e.shiftKey && active === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && active === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }
    return;
  }

  // Keyboard activation of a note (role=button) to edit it.
  if (e.key === 'Enter' || e.key === ' ') {
    const el = actionEl(e.target);
    if (el?.dataset.action === 'edit-note') {
      e.preventDefault();
      const cid = choiceIdOf(e.target);
      const nid = noteIdOf(e.target);
      if (cid && nid) openEditForm(cid, nid);
    }
  }
});
