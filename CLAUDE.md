<!-- SPECKIT START -->
## Active feature: Sift Post-MVP Improvements (`002-post-mvp-improvements`)

For technologies, project structure, shell commands, and other context, read the
current implementation plan and its design artifacts:

- Plan: `specs/002-post-mvp-improvements/plan.md`
- Spec: `specs/002-post-mvp-improvements/spec.md`
- Research / decisions: `specs/002-post-mvp-improvements/research.md`
- Data model: `specs/002-post-mvp-improvements/data-model.md`
- Contracts: `specs/002-post-mvp-improvements/contracts/` (i18n, suggestion, persistence-migration, render-regions)
- Quickstart: `specs/002-post-mvp-improvements/quickstart.md`

MVP baseline lives under `specs/001-sift-mvp/` (frozen functional requirements).

**Stack**: TypeScript 5.x (strict) + Vite 5, **no framework, no runtime deps**.
Vitest + jsdom for tests. Fully client-side; `localStorage` only (`sift.v1`); no backend.
Pure logic in `src/scoring.ts`, `src/view.ts`, `src/i18n/`, `src/mailto.ts`; tiny store
in `src/state.ts`; debounced persistence (400ms) in `src/persistence.ts`; region renders
in `src/render/*`. Improvements add UA/EN i18n (pure `t(lang,key)`), a native `<dialog>`
"Suggest a feature" flow that composes a `mailto:` (no network), an author footer, and a
public README. Domain term for a compared candidate is **Choice**.
<!-- SPECKIT END -->
