# Feature Specification: GitHub Pages Hosting

**Feature Branch**: `003-github-pages-hosting`

**Created**: 2026-05-30

**Status**: Draft

**Input**: User description: "docs/superpowers/specs/2026-05-30-github-pages-hosting-spec.md — Publish Sift on GitHub Pages at `https://<user>.github.io/<repo>/` over HTTPS. On every push to `main`, build the static app and serve it. Custom domain out of scope; no backend, no third-party runtime deps."

## Clarifications

### Session 2026-05-30

- Q: Should every merge/push to `main` deploy unconditionally, or should deploys be gated (tag-only or manual approval)? → A: Continuous deploy — every push/merge to `main` auto-publishes (no tag and no approval gate); manual re-trigger remains available as an escape hatch. A PR merge into `main` is a push to `main` and therefore deploys. US3's one-time enablement is a setup precondition, not a per-deploy step.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Anyone can open the live app over HTTPS (Priority: P1)

A first-time visitor opens the project's public web address in a browser and the
Sift app loads completely and securely — no broken assets, no install, no account.

**Why this priority**: Public reachability is the entire point of hosting. Without a
working live URL, nothing else this feature adds has value. This is the minimum
shippable increment: a real person can use Sift on the internet.

**Independent Test**: Visit the published address in a fresh browser; confirm the
comparison screen renders, the page loads over HTTPS, and the browser console shows
no failed asset (404) requests.

**Acceptance Scenarios**:

1. **Given** the app has been published, **When** a visitor opens the public web
   address, **Then** the Sift comparison screen loads fully and the connection is
   served over HTTPS.
2. **Given** the app is served from a project sub-path (not the domain root), **When**
   the page and its assets load, **Then** every script, style, and asset resolves
   correctly with zero 404 errors in the console.
3. **Given** a visitor on the live site, **When** they create a dilemma and reload the
   page, **Then** their board persists (local-only storage continues to work).
4. **Given** a visitor on the live site, **When** they use "Suggest a feature" and
   Send, **Then** their mail client opens pre-filled (no network call is made by the
   app).

---

### User Story 2 - Publishing happens automatically on push to main (Priority: P2)

The maintainer merges or pushes a change to the `main` branch and, without any manual
upload step, the latest version of the app becomes the live site a short time later.

**Why this priority**: Automated publishing keeps the live site honest (it always
reflects `main`) and removes a manual, error-prone deploy step. It depends on US1's
target existing but adds the repeatable delivery pipeline.

**Independent Test**: Push a trivial visible change to `main`; confirm an automated
build-and-publish run starts, completes successfully, and the change appears at the
live address without any manual file copying.

**Acceptance Scenarios**:

1. **Given** a commit is pushed to `main`, **When** the automated pipeline runs,
   **Then** it builds the static app and publishes it, reporting the live URL on
   success.
2. **Given** the maintainer wants to republish without a code change, **When** they
   trigger the pipeline manually, **Then** it runs and republishes the current `main`.
3. **Given** two pushes land close together, **When** the pipeline runs, **Then** only
   the latest is published (an in-progress older run does not overwrite a newer one).
4. **Given** the build step fails, **When** the pipeline runs, **Then** publishing does
   not occur and the failure is visible to the maintainer.

---

### User Story 3 - One-time hosting enablement (Priority: P3)

The maintainer performs a single hosting-enablement step so the automated pipeline is
permitted to publish, after which no further manual configuration is needed.

**Why this priority**: This is a one-off setup precondition. It is real work but
happens once and is not part of the repeatable runtime flow, so it ranks last.

**Independent Test**: Follow the documented enablement step once; confirm that a
subsequent push to `main` results in a successfully published live site.

**Acceptance Scenarios**:

1. **Given** hosting has never been enabled, **When** the maintainer follows the
   documented one-time enablement step, **Then** the pipeline gains permission to
   publish the site.
2. **Given** enablement is complete, **When** later pushes occur, **Then** no further
   manual setup is required for publishing to succeed.

---

### Edge Cases

- **Sub-path asset resolution**: The app is served under a project sub-path rather than
  a domain root; asset links built for the domain root would 404. The published build
  must reference assets relative to the sub-path.
- **Local development unchanged**: The change that fixes sub-path serving must not break
  the normal local run/preview, which serves from the root.
- **Concurrent publishes**: Overlapping pipeline runs must not race; the newest push
  wins and older in-flight runs are superseded.
- **Build failure**: A failing build must block publishing rather than push a broken or
  partial site live.
- **Static-host routing**: The app is a single page with no client-side router, so
  deep-link/refresh 404 handling is not required; this is confirmed, not assumed.
- **Reserved-prefix files**: If the build ever emits files or folders whose names begin
  with an underscore, the static host could skip them; the publish must keep all build
  output intact.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The application MUST be reachable at a stable public web address.
- **FR-002**: The published site MUST be served over HTTPS.
- **FR-003**: The site MUST be published as static files only, with no backend service
  and no third-party runtime dependency introduced by hosting.
- **FR-004**: When the published app is served from a project sub-path, all of its
  assets MUST resolve correctly (zero 404s) from that sub-path.
- **FR-005**: The local development and preview experience MUST remain unchanged
  (served from the root) after the sub-path fix is applied.
- **FR-006**: Every push to the `main` branch — including a pull-request merge into
  `main` — MUST automatically and unconditionally build and publish the current state
  of the app. There is no tag requirement and no manual approval gate on the publish.
- **FR-007**: The maintainer MUST be able to trigger a publish manually without a code
  change.
- **FR-008**: Overlapping publish runs MUST be serialized so that the most recent push
  is the one that ends up live (older in-progress runs are superseded).
- **FR-009**: A failed build MUST prevent publishing (no broken or partial site goes
  live).
- **FR-010**: On a successful publish, the live URL MUST be reported by the pipeline.
- **FR-011**: All existing app behavior MUST continue to work on the live site:
  local-only persistence survives reload, and the "Suggest a feature" flow opens the
  mail client with no network call.
- **FR-012**: Enabling hosting MUST require at most a single one-time manual setup step;
  thereafter publishing MUST be automatic.
- **FR-013**: The entire publish output MUST be served intact (no build artifacts
  silently dropped by the host).

### Key Entities

- **Published site**: The static build of the app made available at the public address;
  attributes: public URL, HTTPS, served from a project sub-path.
- **Publish pipeline run**: An automated build-and-publish execution; attributes:
  trigger (push to `main` or manual), outcome (success/failure), reported live URL,
  supersede-on-concurrency behavior.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A visitor can open the public address and reach a fully loaded, usable app
  with zero asset 404s, 100% of the time after a successful publish.
- **SC-002**: 100% of pages are served over HTTPS (no insecure/mixed-content delivery).
- **SC-003**: A push to `main` results in the change being live within 5 minutes,
  with no manual file-copy step.
- **SC-004**: After the one-time enablement, 100% of successful pushes to `main` publish
  automatically with no additional manual configuration.
- **SC-005**: A build failure results in 0 broken publishes (the previously live site
  remains, or nothing is published).
- **SC-006**: Core app behavior is preserved on the live site: created boards persist
  across reload and the suggest-a-feature mail hand-off works, in 100% of checks.

## Assumptions

- The repository is hosted on GitHub and is public (a public repo is required for the
  intended free Pages hosting). The Sift repo is already public.
- The published address is the GitHub Pages project-page form
  `https://<user>.github.io/<repo>/` — concretely `https://v-sokolov.github.io/sift/`
  based on the existing repository. A custom domain is explicitly out of scope.
- Because it is a project page (not a user/organization root page), the app is served
  from the `/sift/` sub-path; the build must account for that prefix while keeping local
  serving at root.
- The existing `build` step already produces a working static bundle that can be
  previewed locally; hosting consumes that output without changing app logic.
- HTTPS is provided automatically by the host for the default `*.github.io` address.
- No SPA fallback/redirect handling is needed (single page, no router).
- This feature adds delivery/hosting only; it introduces no new user-facing app features
  and no runtime network calls, consistent with the project's client-side/private
  principle.

## Dependencies

- Requires the existing static build output to be correct and previewable.
- Requires a one-time hosting-source configuration in the repository's settings to allow
  automated publishing.
- Depends on the hosting platform's automated build-and-publish capability and its
  default HTTPS for the platform-provided address.
