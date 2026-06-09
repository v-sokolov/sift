# Feature Specification: Fix CI Build — Restore Bits UI Peer Dependency

> **Status: Shipped — condensed 2026-06-09**

A hotfix for the clean-install `vite build` regression introduced by 012. When 012 adopted
Bits UI's `Dialog`, it dropped `@internationalized/date` from `package.json` as "unused" — true
only while Bits UI was declared but not imported. Once `Dialog` is actually imported, the bundler
pulls in Bits UI's date-time internals, which require `@internationalized/date`. It is a declared
`peerDependency` of `bits-ui` (`^3.8.1`) and must be provided by this project. The break was masked
locally because a stale `node_modules` still held the package; CI's clean install did not, so the
production build failed to resolve the import. 013 restores `@internationalized/date` as a runtime
dependency (a manifest-only fix — no source, behavior, UI, or persisted-state change) and corrects
the 012 docs that called it "unused". Incidental cleanup: removed two unused, unreferenced favicon
variants (`public/favicon-a-balance.svg`, `public/favicon-bc2-dots-s.svg`). Merged PR #15.

## Governance (Build gate, Constitution v2.1.0)

Because this break slipped through the existing quality gate — which mandated `tsc` + `vitest` but
not a production build — 013 amended the constitution to add a **Build gate**: `yarn build` MUST
succeed, verified against a clean dependency install, before work is considered done. This made the
rule that would have caught 012 part of the project's governance (MINOR bump 2.0.0 → 2.1.0, with a
Sync Impact Report entry). The same rationale is recorded in `constitution.md`.
