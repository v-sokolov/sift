// Ukrainian catalog. Mirrors every key in en.ts (parity test enforces completeness).

export const uk: Record<string, string> = {
  // Header
  'header.titlePlaceholder': 'Що ви вирішуєте?',
  'header.titleAria': 'Рішення, яке ви зважуєте',
  'header.langAria': 'Мова',
  'header.tagline':
    'Тихий спосіб зважити рішення. Порівняйте кілька варіантів за перевагами й недоліками, а делікатна оцінка допоможе подумати — вона ніколи не вирішує за вас.',

  // Toolbar
  'toolbar.addChoice': '＋ Додати варіант',
  'toolbar.maxChoices': 'Максимум 4 варіанти',
  'toolbar.group': 'Групувати',
  'toolbar.sort': 'Сортувати',
  'toolbar.saved': 'Збережено',
  'toolbar.themeTitle': 'Тема',
  'toolbar.clear': 'Очистити',
  'toolbar.direction': 'Напрям:',
  'toolbar.directionAria': 'Напрям',
  'toolbar.asc': 'Зрост.',
  'toolbar.desc': 'Спад.',
  'toolbar.by': 'За:',
  'toolbar.sortKeyAria': 'Ключ сортування',
  'toolbar.weight': 'Вагою',
  'toolbar.type': 'Типом',
  'theme.system': '◐ Авто',
  'theme.light': '☀ Світла',
  'theme.dark': '☾ Темна',

  // Choice
  'choice.placeholder': 'Варіант {n}',
  'choice.empty': 'Поки немає пунктів',
  'choice.nameAria': 'Назва варіанту',
  'choice.remove': 'Видалити варіант',
  'choice.removeDisabled': 'Щонайменше 2 варіанти',
  'choice.removeAria': 'Видалити варіант',
  'group.advantage': 'Переваги',
  'group.disadvantage': 'Недоліки',
  'group.neutral': 'Нейтральні',

  // Note
  'note.empty': '(порожній пункт)',
  'note.emptyShort': '(порожньо)',
  'note.weightLabel': ', вага {n}',
  'note.editAria': 'Редагувати {type}{weight}: {text}',
  'note.removeAria': 'Видалити пункт',
  'noteType.advantage': 'перевага',
  'noteType.disadvantage': 'недолік',
  'noteType.neutral': 'нейтральне',

  // Summary
  'summary.totals': 'за {for} · проти {against}',
  'summary.aria': 'Підсумкові бали',
  'summary.formula':
    'Кожна перевага додає свою вагу (1–3), кожен недолік її віднімає; нейтральні пункти не враховуються.',

  // Add/edit form
  'form.addNote': '＋ Додати пункт',
  'form.choice': 'Варіант',
  'form.noteTypeAria': 'Тип пункту',
  'form.weightAria': 'Вага',
  'form.weightN': 'Вага {n}',
  'form.textPlaceholder': 'У чому суть?',
  'form.textAria': 'Текст пункту',
  'form.cancel': 'Скасувати',
  'form.save': 'Зберегти',
  'form.add': 'Додати',
  'form.typeAdvantage': '＋ перевага',
  'form.typeDisadvantage': '− недолік',
  'form.typeNeutral': '~ нейтральне',

  // Clear confirmation
  'confirm.clear': 'Очистити це рішення? Це не можна скасувати.',

  // Footer (US3)
  'footer.madeBy': 'Створив {name}.',
  'footer.github': 'GitHub',
  'footer.linkedin': 'LinkedIn',

  // Suggest a feature (US2)
  'suggest.open': 'Запропонувати функцію',
  'suggest.title': 'Запропонувати функцію',
  'suggest.intro': 'Маєте ідею? Розкажіть мені.',
  'suggest.name': 'Ім’я',
  'suggest.namePlaceholder': 'Ваше ім’я',
  'suggest.description': 'Опис',
  'suggest.descriptionPlaceholder': 'Що зробило б Sift кращим?',
  'suggest.email': 'Контактний email (необов’язково)',
  'suggest.emailPlaceholder': 'you@example.com',
  'suggest.github': 'GitHub (необов’язково)',
  'suggest.linkedin': 'LinkedIn (необов’язково)',
  'suggest.send': 'Надіслати',
  'suggest.close': 'Закрити',
  'suggest.cancel': 'Скасувати',
  'suggest.fallback': 'Немає поштового застосунку? Напишіть мені в {link}.',
  'suggest.fallbackLink': 'LinkedIn',
};
