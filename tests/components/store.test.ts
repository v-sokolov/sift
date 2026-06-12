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
  isExpanded,
  openAddForm,
  openEditForm,
  removeChoice,
  removeNote,
  renameChoice,
  setDilemmaTitle,
  setDirection,
  setExpanded,
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
  toggleRank,
  toggleSort,
  updateNote,
} from '../../src/store.svelte';

beforeEach(() => {
  setState(emptyDilemma());
});

describe('choice count invariants (2..6)', () => {
  test('addChoice grows to 5 and 6, then stops at MAX_CHOICES', () => {
    expect(getState().dilemma.choices).toHaveLength(2);
    addChoice();
    addChoice();
    expect(getState().dilemma.choices).toHaveLength(4);
    addChoice(); // 5th now allowed (015, FR-001)
    expect(getState().dilemma.choices).toHaveLength(5);
    addChoice(); // 6th allowed
    expect(getState().dilemma.choices).toHaveLength(6);
    addChoice(); // no-op at max (FR-002)
    expect(getState().dilemma.choices).toHaveLength(6);
  });

  test('removeChoice from a full 6-board re-enables adding (FR-002)', () => {
    for (let i = 0; i < 4; i += 1) addChoice();
    expect(getState().dilemma.choices).toHaveLength(6);
    removeChoice(getState().dilemma.choices[5].id);
    expect(getState().dilemma.choices).toHaveLength(5);
    addChoice();
    expect(getState().dilemma.choices).toHaveLength(6);
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

  test('removeChoice clears the form if it targeted a removed 6th choice (015, FR-003)', () => {
    for (let i = 0; i < 4; i += 1) addChoice();
    const sixthId = getState().dilemma.choices[5].id;
    openAddForm(sixthId);
    expect(getState().editing?.choiceId).toBe(sixthId);
    removeChoice(sixthId);
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

// 018 (US1) — toggleRank is a preference mutation: it flips the flag and persists, but
// (like toggleGroup/setSortKey) it must NOT touch() — no updatedAt bump, no save-status flip.
describe('toggleRank (018)', () => {
  test('T1: flips view.rankByTotal', () => {
    expect(getState().view.rankByTotal).toBe(false);
    toggleRank();
    expect(getState().view.rankByTotal).toBe(true);
    toggleRank();
    expect(getState().view.rankByTotal).toBe(false);
  });

  test('T2: fires the persist channel', () => {
    let saves = 0;
    const off = subscribePersist(() => (saves += 1));
    toggleRank();
    expect(saves).toBe(1);
    off();
  });

  test('T3: does not touch save-status or updatedAt', () => {
    expect(getState().status).toBe('hidden');
    const before = getState().dilemma.updatedAt;
    toggleRank();
    expect(getState().status).toBe('hidden');
    expect(getState().dilemma.updatedAt).toBe(before);
  });
});

// 020 — ephemeral per-Choice expand state (contracts E1–E6). Runtime-only, OUTSIDE
// AppState: it must never persist, never touch() and reset with the board.
describe('020 — expand state (E1–E6)', () => {
  test('E1: every choice starts collapsed (absent key ⇒ false)', () => {
    const [a, b] = getState().dilemma.choices;
    expect(isExpanded(a.id)).toBe(false);
    expect(isExpanded(b.id)).toBe(false);
  });

  test('E2: setExpanded never notifies the persistence channel', () => {
    let saves = 0;
    const off = subscribePersist(() => (saves += 1));
    const cid = getState().dilemma.choices[0].id;
    setExpanded(cid, true);
    setExpanded(cid, false);
    expect(saves).toBe(0);
    off();
  });

  test('E3: setExpanded leaves AppState deep-equal (no updatedAt bump, no status flip)', () => {
    const cid = getState().dilemma.choices[0].id;
    const before = JSON.parse(JSON.stringify(getState()));
    setExpanded(cid, true);
    expect(isExpanded(cid)).toBe(true);
    expect(JSON.parse(JSON.stringify(getState()))).toEqual(before);
  });

  test('E4: addNote/updateNote/removeNote auto-expand exactly the mutated choice', () => {
    const [a, b] = getState().dilemma.choices;
    addNote(a.id, { text: 'p', type: 'advantage', weight: 2 });
    expect(isExpanded(a.id)).toBe(true);
    expect(isExpanded(b.id)).toBe(false);

    setExpanded(a.id, false);
    const nid = getState().dilemma.choices[0].notes[0].id;
    updateNote(a.id, nid, { text: 'p2', type: 'advantage', weight: 1 });
    expect(isExpanded(a.id)).toBe(true);

    setExpanded(a.id, false);
    removeNote(a.id, nid);
    expect(isExpanded(a.id)).toBe(true);
    expect(isExpanded(b.id)).toBe(false);
  });

  test('E5: failure paths expand nothing', () => {
    const cid = getState().dilemma.choices[0].id;
    addNote('no-such-choice', { text: 'x', type: 'advantage', weight: 1 });
    expect(isExpanded('no-such-choice')).toBe(false);
    addNote(cid, { text: '   ', type: 'advantage', weight: 1 });
    expect(isExpanded(cid)).toBe(false);
    updateNote(cid, 'no-such-note', { text: 'x', type: 'advantage', weight: 1 });
    expect(isExpanded(cid)).toBe(false);
    removeNote(cid, 'no-such-note');
    expect(isExpanded(cid)).toBe(false);
  });

  test('E6: removeChoice drops the entry; clearDilemma resets all', () => {
    addChoice();
    const third = getState().dilemma.choices[2].id;
    setExpanded(third, true);
    removeChoice(third);
    expect(isExpanded(third)).toBe(false);
    const cid = getState().dilemma.choices[0].id;
    setExpanded(cid, true);
    clearDilemma();
    expect(isExpanded(cid)).toBe(false);
  });
});
