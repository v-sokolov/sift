<!-- SPECKIT START -->
## Active feature: Sift MVP (`001-sift-mvp`)

For technologies, project structure, shell commands, and other context, read the
current implementation plan and its design artifacts:

- Plan: `specs/001-sift-mvp/plan.md`
- Spec: `specs/001-sift-mvp/spec.md`
- Research / decisions: `specs/001-sift-mvp/research.md`
- Data model: `specs/001-sift-mvp/data-model.md`
- Contracts: `specs/001-sift-mvp/contracts/` (state-store, scoring, view, persistence)
- Quickstart: `specs/001-sift-mvp/quickstart.md`

**Stack**: TypeScript 5.x (strict) + Vite 5, no framework, no runtime deps.
Vitest + jsdom for tests. Fully client-side; `localStorage` only; no backend.
Pure logic in `src/scoring.ts` & `src/view.ts`; tiny store in `src/state.ts`;
debounced persistence (`sift.v1`, 400ms) in `src/persistence.ts`; region renders
in `src/render/*`. Domain term for a compared candidate is **Choice**.
<!-- SPECKIT END -->
