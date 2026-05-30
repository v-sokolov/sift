import type { NoteType, Weight } from './types';
import {
  addChoice,
  clearDilemma,
  closeForm,
  cycleTheme,
  emptyDilemma,
  getState,
  openAddForm,
  openEditForm,
  removeChoice,
  renameChoice,
  setDirection,
  setDilemmaTitle,
  setFormChoice,
  setFormText,
  setFormType,
  setFormWeight,
  setLastSaved,
  setSortKey,
  setState,
  submitForm,
  subscribe,
  subscribePersist,
  toggleGroup,
  toggleSort,
} from './state';
import { renderApp } from './render';
import { installUnloadFlush, load, scheduleSave } from './persistence';

const root = document.getElementById('app');
if (!root) throw new Error('Missing #app root element');

// Wire channels before touching state so the first change renders + saves.
subscribe((state) => renderApp(root, state));
subscribePersist((state) => scheduleSave(state, setLastSaved));
installUnloadFlush(getState, setLastSaved);

// Restore prior work, or start from the empty default state.
const restored = load();
if (restored) {
  setState({
    ...emptyDilemma(),
    dilemma: restored.dilemma,
    view: restored.view,
  });
}

// Always render once on boot (subscribe only fires on subsequent updates).
renderApp(root, getState());

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
    case 'clear':
      if (window.confirm("Clear this dilemma? This can't be undone.")) clearDilemma();
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
  const el = actionEl(e.target);
  if (el?.dataset.action === 'form' || (e.target as HTMLElement).matches('form')) {
    e.preventDefault();
    submitForm();
  }
});

root.addEventListener('keydown', (e) => {
  // Esc closes the form (FR-032).
  if (e.key === 'Escape' && getState().editing) {
    closeForm();
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
