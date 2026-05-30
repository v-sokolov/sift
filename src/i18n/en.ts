// English catalog — the authoritative reference set. Every key that exists in any
// language MUST exist here (catalog-parity test). Keys are dotted by region.

export const en: Record<string, string> = {
  // Header
  'header.titlePlaceholder': 'What are you deciding?',
  'header.titleAria': "The decision you're weighing",
  'header.langAria': 'Language',
  'header.tagline':
    'A quiet way to weigh a decision. Compare a few options by their pros and cons, and let a gentle score help you think — it never decides for you.',

  // Toolbar
  'toolbar.addChoice': '＋ Add choice',
  'toolbar.maxChoices': 'Maximum 4 choices',
  'toolbar.group': 'Group',
  'toolbar.sort': 'Sort',
  'toolbar.saved': 'Saved',
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
  'group.advantage': 'Advantages',
  'group.disadvantage': 'Disadvantages',
  'group.neutral': 'Neutral',

  // Note
  'note.empty': '(empty point)',
  'note.emptyShort': '(empty)',
  'note.weightLabel': ', weight {n}',
  'note.editAria': 'Edit {type}{weight}: {text}',
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

  // Clear confirmation
  'confirm.clear': "Clear this dilemma? This can't be undone.",

  // Footer (US3)
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
