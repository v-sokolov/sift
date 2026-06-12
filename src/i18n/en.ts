// English catalog — the authoritative reference set. Every key that exists in any
// language MUST exist here (catalog-parity test). Keys are dotted by region.

export const en: Record<string, string> = {
  // Header
  'header.titlePlaceholder': 'What are you deciding?',
  'header.titleAria': "The decision you're weighing",
  'header.langAria': 'Language',
  'header.tagline':
    'A quiet way to weigh a decision. Compare a few options by their pros and cons, and let a gentle score help you think - it never decides for you. Private by design: your data is stored only in this browser, with no server backup.',

  // Toolbar
  'toolbar.addChoice': '＋ Add choice',
  'toolbar.maxChoices': 'Maximum {n} choices',
  'toolbar.manyChoices':
    'Many choices can make a dilemma harder to weigh - fewer often brings more clarity.',
  'toolbar.group': 'Group',
  'toolbar.sort': 'Sort',
  'toolbar.rank': 'Rank by score',
  'toolbar.scopeChoices': 'Choices',
  'toolbar.scopePoints': 'Points',
  'toolbar.saved': 'Saved',
  'toolbar.editing': 'Editing',
  'toolbar.themeTitle': 'Theme',
  'toolbar.clear': 'Clear',
  'toolbar.direction': 'Direction:',
  'toolbar.directionAria': 'Direction',
  'toolbar.asc': 'Asc',
  'toolbar.desc': 'Desc',
  'toolbar.by': 'By:',
  'toolbar.sortKeyAria': 'Sort key',
  'toolbar.weight': 'Weight',
  'toolbar.type': 'Type',
  'toolbar.groupBy': 'Group by:',
  'toolbar.groupKeyAria': 'Group by',
  'theme.system': '◐ Auto',
  'theme.light': '☀ Light',
  'theme.dark': '☾ Dark',

  // Choice
  'choice.placeholder': 'Choice {n}',
  'choice.empty': 'No points yet',
  'choice.nameAria': 'Choice name',
  'choice.remove': 'Remove choice',
  'choice.removeDisabled': 'At least 2 choices',
  'choice.removeAria': 'Remove choice',
  'choice.toggleAria': 'Show or hide points',
  'choice.scoreLabel': 'Score',
  'choice.rename': 'Rename',
  'choice.removeLabel': 'Remove',
  'group.advantage': 'Advantages',
  'group.disadvantage': 'Disadvantages',
  'group.neutral': 'Neutral',
  'group.weight': 'Weight {n}',
  'group.weightless': 'Neutral',

  // Note
  'note.empty': '(empty point)',
  'note.emptyShort': '(empty)',
  'note.weightLabel': ', weight {n}',
  'note.editAria': 'Edit {type}{weight}: {text}',
  'note.removeAria': 'Remove point',
  'noteType.advantage': 'advantage',
  'noteType.disadvantage': 'disadvantage',
  'noteType.neutral': 'neutral',

  // Summary
  'summary.totals': 'for {for} · against {against}',
  'summary.aria': 'Summary scores',
  'summary.formula':
    "Each advantage adds its weight (1–3), each disadvantage subtracts it; neutral points don't count.",

  // Add/edit form
  'form.addNote': '＋ Add point',
  'form.choice': 'Choice',
  'form.noteTypeAria': 'Point type',
  'form.weightAria': 'Weight',
  'form.weightN': 'Weight {n}',
  'form.textPlaceholder': "What's the point?",
  'form.textAria': 'Point text',
  'form.cancel': 'Cancel',
  'form.save': 'Save',
  'form.add': 'Add',
  'form.typeAdvantage': '＋ advantage',
  'form.typeDisadvantage': '− disadvantage',
  'form.typeNeutral': '~ neutral',

  // Destructive-action confirmations (Clear since 002; choice removal + shared dialog since 016)
  'confirm.clear': "Clear this dilemma? This can't be undone.",
  'confirm.removeChoice': 'Remove "{name}" and all its points? This can\'t be undone.',
  'confirm.cancel': 'Cancel',
  'confirm.removeAction': 'Remove',
  'confirm.clearAction': 'Clear',

  // Footer (US3)
  'footer.inspiredPre': 'Inspired by the ',
  'footer.inspiredBook': 'Essentialism',
  'footer.inspiredPost': ' book.',
  'footer.madeBy': 'Made by {name}.',
  'footer.github': 'GitHub',
  'footer.linkedin': 'LinkedIn',

  // Suggest a feature (US2)
  'suggest.open': 'Suggest a feature',
  'suggest.title': 'Suggest a feature',
  'suggest.intro': 'Have an idea? Tell me about it.',
  'suggest.name': 'Name',
  'suggest.namePlaceholder': 'Your name',
  'suggest.description': 'Description',
  'suggest.descriptionPlaceholder': 'What would make Sift better?',
  'suggest.email': 'Contact email (optional)',
  'suggest.emailPlaceholder': 'you@example.com',
  'suggest.github': 'GitHub (optional)',
  'suggest.linkedin': 'LinkedIn (optional)',
  'suggest.send': 'Send',
  'suggest.close': 'Close',
  'suggest.cancel': 'Cancel',
  'suggest.fallback': 'No email app? Reach me on {link}.',
  'suggest.fallbackLink': 'LinkedIn',
};
