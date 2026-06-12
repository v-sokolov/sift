// Fixed author/maintainer identity. Single source of truth for footer, README,
// and the Suggest-a-feature mailto target.
//
// NOTE: CONTACT_EMAIL is used ONLY to build the `mailto:` href for the suggestion
// form. It MUST NOT be rendered as visible text anywhere in the UI (see
// contracts/suggestion.md, invariant I-S2).

export const AUTHOR_NAME = 'Vitalii Sokolov';
export const GITHUB_URL = 'https://github.com/v-sokolov';
export const LINKEDIN_URL = 'https://www.linkedin.com/in/vitalii-sokolov/';
export const CONTACT_EMAIL = 'vetalsokolov4@gmail.com';

// The book that inspired Sift's "less, but better" ethos. Rendered as the
// header inspiration link (and in the README).
export const ESSENTIALISM_URL = 'https://www.goodreads.com/book/show/54644719-essentialism';

// 020 (FR-011 superseded): the score summary band is HIDDEN, not removed — the card
// footers carry the scores. Flip to true to reinstate the band; its component, styles,
// i18n and tests are retained and still exercised at the component level.
export const SHOW_SUMMARY = false;
