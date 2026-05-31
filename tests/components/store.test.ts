// Runes-store invariants (contracts/store.md). Mirrors the behavioral guarantees the
// old imperative store held; the pure-logic suites (tests/unit/*) remain the source of
// truth for scoring/arrangement/persistence.

import { beforeEach, describe, expect, test } from 'vitest';
import {
  addChoice,
  addNote,
  clearDilemma,
  closeForm,
  cycleTheme,
  emptyDilemma,
  getState,
  initLang,
  openAddForm,
  openEditForm,
  removeChoice,
  removeNote,
  renameChoice,
  setDilemmaTitle,
  setDirection,
  setFormText,
  setFormType,
  setGroupKey,
  setLang,
  setLastSaved,
  setSortKey,
  setState,
  setTheme,
  submitForm,
  subscribePersist,
  toggleGroup,
  toggleSort,
  updateNote,
} from '../../src/store.svelte';

beforeEach(() => {
  setState(emptyDilemma());
});

describe('choice count invariants (2..4)', () => {
  test('addChoice stops at MAX_CHOICES (4)', () => {
    expect(getState().dilemma.choices).toHaveLength(2);
    addChoice();
    addChoice();
    expect(getState().dilemma.choices).toHaveLength(4);
    addChoice(); // no-op at max
    expect(getState().dilemma.choices).toHaveLength(4);
  });

  test('removeChoice stops at MIN_CHOICES (2)', () => {
    const firstId = getState().dilemma.choices[0].id;
    removeChoice(firstId); // no-op at min
    expect(getState().dilemma.choices).toHaveLength(2);
  });

  test('removeChoice clears the form if it targeted the removed choice', () => {
    addChoice(); // 3 choices
    const thirdId = getState().dilemma.choices[2].id;
    openAddForm(thirdId);
    expect(getState().editing?.choiceId).toBe(thirdId);
    removeChoice(thirdId);
    expect(getState().editing).toBeNull();
    expect(getState().draft).toBeNull();
  });
});

describe('note weight normalization', () => {
  test('neutral note carries null weight; advantage defaults to 3', () => {
    const cid = getState().dilemma.choices[0].id;
    addNote(cid, { text: 'a', type: 'advantage', weight: null });
    addNote(cid, { text: 'n', type: 'neutral', weight: 3 });
    const notes = getState().dilemma.choices[0].notes;
    expect(notes.find((n) => n.type === 'advantage')?.weight).toBe(3);
    expect(notes.find((n) => n.type === 'neutral')?.weight).toBeNull();
  });
});

describe('submitForm open/close semantics', () => {
  test('new note keeps the form open and clears text (keeps type/weight)', () => {
    const cid = getState().dilemma.choices[0].id;
    openAddForm(cid);
    setFormType('disadvantage');
    setFormText('downside');
    submitForm();
    expect(getState().dilemma.choices[0].notes).toHaveLength(1);
    // form stays open for the next note, text cleared, type preserved
    expect(getState().editing?.kind).toBe('new');
    expect(getState().draft?.text).toBe('');
    expect(getState().draft?.type).toBe('disadvantage');
  });

  test('editing an existing note closes the form', () => {
    const cid = getState().dilemma.choices[0].id;
    addNote(cid, { text: 'orig', type: 'advantage', weight: 2 });
    const nid = getState().dilemma.choices[0].notes[0].id;
    openEditForm(cid, nid);
    setFormText('edited');
    submitForm();
    expect(getState().dilemma.choices[0].notes[0].text).toBe('edited');
    expect(getState().editing).toBeNull();
    expect(getState().draft).toBeNull();
  });

  test('whitespace-only text is rejected', () => {
    const cid = getState().dilemma.choices[0].id;
    openAddForm(cid);
    setFormText('   ');
    submitForm();
    expect(getState().dilemma.choices[0].notes).toHaveLength(0);
  });
});

describe('clearDilemma preserves language', () => {
  test('language survives a clear; board resets', () => {
    setLang('uk');
    const cid = getState().dilemma.choices[0].id;
    addNote(cid, { text: 'x', type: 'advantage', weight: 1 });
    clearDilemma();
    expect(getState().view.lang).toBe('uk');
    expect(getState().dilemma.choices[0].notes).toHaveLength(0);
    expect(getState().dilemma.title).toBe('');
  });
});

describe('clearDilemma preserves theme and language (US2, FR-016/017/018)', () => {
  test('theme and language survive a clear; board resets', () => {
    setTheme('dark');
    setLang('uk');
    const cid = getState().dilemma.choices[0].id;
    addNote(cid, { text: 'x', type: 'advantage', weight: 1 });
    clearDilemma();
    expect(getState().view.theme).toBe('dark');
    expect(getState().view.lang).toBe('uk');
    expect(getState().dilemma.choices[0].notes).toHaveLength(0);
    expect(getState().dilemma.title).toBe('');
  });
});

describe('removeNote closes an open edit form for the removed note (FR-011)', () => {
  test('removing the currently-edited note resets editing/draft', () => {
    const cid = getState().dilemma.choices[0].id;
    addNote(cid, { text: 'x', type: 'advantage', weight: 1 });
    const nid = getState().dilemma.choices[0].notes[0].id;
    openEditForm(cid, nid);
    expect(getState().editing).not.toBeNull();
    removeNote(cid, nid);
    expect(getState().editing).toBeNull();
    expect(getState().draft).toBeNull();
    expect(getState().dilemma.choices[0].notes).toHaveLength(0);
  });

  test('removing a non-edited note leaves an open edit form untouched', () => {
    const cid = getState().dilemma.choices[0].id;
    addNote(cid, { text: 'a', type: 'advantage', weight: 1 });
    addNote(cid, { text: 'b', type: 'advantage', weight: 1 });
    const [n1, n2] = getState().dilemma.choices[0].notes;
    openEditForm(cid, n1.id);
    removeNote(cid, n2.id);
    expect(getState().editing).not.toBeNull();
    expect(getState().dilemma.choices[0].notes.map((n) => n.id)).toEqual([n1.id]);
  });
});

describe('save status (010)', () => {
  const cid = () => getState().dilemma.choices[0].id;

  test('fresh state is hidden', () => {
    expect(getState().status).toBe('hidden');
  });

  test('each of the 8 content mutations sets status to editing', () => {
    const contentMutations: Array<() => void> = [
      () => setDilemmaTitle('q'),
      () => addChoice(),
      () => renameChoice(cid(), 'A'),
      () => {
        addChoice();
        removeChoice(getState().dilemma.choices[2].id);
      },
      () => addNote(cid(), { text: 'x', type: 'advantage', weight: 1 }),
      () => {
        addNote(cid(), { text: 'x', type: 'advantage', weight: 1 });
        const nid = getState().dilemma.choices[0].notes[0].id;
        updateNote(cid(), nid, { text: 'y', type: 'advantage', weight: 2 });
      },
      () => {
        addNote(cid(), { text: 'x', type: 'advantage', weight: 1 });
        const nid = getState().dilemma.choices[0].notes[0].id;
        removeNote(cid(), nid);
      },
      () => {
        openAddForm(cid());
        setFormText('z');
        submitForm();
      },
    ];
    for (const mutate of contentMutations) {
      setState(emptyDilemma());
      expect(getState().status).toBe('hidden');
      mutate();
      expect(getState().status).toBe('editing');
    }
  });

  test('setLastSaved flips editing → saved and records lastSavedAt', () => {
    setDilemmaTitle('q');
    expect(getState().status).toBe('editing');
    setLastSaved(123);
    expect(getState().status).toBe('saved');
    expect(getState().lastSavedAt).toBe(123);
  });

  test('setLastSaved does not invent a "saved" while hidden (guard, FR-006/008)', () => {
    expect(getState().status).toBe('hidden');
    setLastSaved(123);
    expect(getState().status).toBe('hidden');
    expect(getState().lastSavedAt).toBe(123);
  });

  test('setLastSaved leaves an already-saved status as saved', () => {
    setDilemmaTitle('q');
    setLastSaved(1);
    expect(getState().status).toBe('saved');
    setLastSaved(2);
    expect(getState().status).toBe('saved');
  });

  test('preference & transient-form mutations never change status (FR-006)', () => {
    const noops: Array<() => void> = [
      () => setLang('uk'),
      () => setTheme('dark'),
      () => cycleTheme(),
      () => toggleGroup(),
      () => toggleSort(),
      () => setSortKey('type'),
      () => setDirection('asc'),
      () => setGroupKey('weight'),
      () => openAddForm(cid()),
      () => {
        openAddForm(cid());
        setFormType('neutral');
      },
      () => {
        openAddForm(cid());
        setFormText('draft');
      },
      () => {
        openAddForm(cid());
        closeForm();
      },
    ];
    const bases: Array<[string, () => void]> = [
      ['hidden', () => {}],
      ['editing', () => setDilemmaTitle('q')],
      [
        'saved',
        () => {
          setDilemmaTitle('q');
          setLastSaved(1);
        },
      ],
    ];
    for (const [expected, setup] of bases) {
      for (const noop of noops) {
        setState(emptyDilemma());
        setup();
        expect(getState().status).toBe(expected);
        noop();
        expect(getState().status).toBe(expected);
      }
    }
  });

  test('clearDilemma resets status to hidden (FR-009)', () => {
    setDilemmaTitle('q');
    setLastSaved(1);
    expect(getState().status).toBe('saved');
    clearDilemma();
    expect(getState().status).toBe('hidden');
  });
});

describe('render-only mutations do not notify the persistence channel', () => {
  test('initLang and setLastSaved are silent; a real mutation fires', () => {
    let saves = 0;
    const off = subscribePersist(() => (saves += 1));
    initLang('uk');
    setLastSaved(123);
    expect(saves).toBe(0);
    addChoice();
    expect(saves).toBe(1);
    closeForm(); // another mutation
    expect(saves).toBe(2);
    off();
  });
});
