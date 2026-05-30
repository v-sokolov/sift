<!-- SPECKIT START -->
## Active feature: GitHub Pages Hosting (`003-github-pages-hosting`)

For technologies, project structure, shell commands, and other context, read the
current implementation plan and its design artifacts:

- Plan: `specs/003-github-pages-hosting/plan.md`
- Spec: `specs/003-github-pages-hosting/spec.md`
- Research / decisions: `specs/003-github-pages-hosting/research.md`
- Data model: `specs/003-github-pages-hosting/data-model.md`
- Contracts: `specs/003-github-pages-hosting/contracts/` (deploy-workflow, base-path)
- Quickstart: `specs/003-github-pages-hosting/quickstart.md`

Prior features: `specs/001-sift-mvp/` (frozen MVP), `specs/002-post-mvp-improvements/`
(UA/EN i18n, suggest-a-feature, footer, README).

**Stack**: TypeScript 5.x (strict) + Vite 5, **no framework, no runtime deps**.
Vitest + jsdom for tests. Fully client-side; `localStorage` only (`sift.v1`); no backend.
Pure logic in `src/scoring.ts`, `src/view.ts`, `src/i18n/`, `src/mailto.ts`; tiny store
in `src/state.ts`; debounced persistence (400ms) in `src/persistence.ts`; region renders
in `src/render/*`. Improvements add UA/EN i18n (pure `t(lang,key)`), a native `<dialog>`
"Suggest a feature" flow that composes a `mailto:` (no network), an author footer, and a
public README. Domain term for a compared candidate is **Choice**.
<!-- SPECKIT END -->
