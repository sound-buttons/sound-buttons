## MODIFIED Requirements

### Requirement: CI test gate blocks unverified deployment

A continuous-integration workflow SHALL run the headless coverage suite on `pull_request` and on `push` to
`master`, and deployment SHALL NOT proceed when the test suite fails or coverage is below the enforced
threshold. The deploy gate SHALL be implemented with a mechanism that genuinely blocks deployment (e.g. a
test job within the deploy workflow referenced by `needs:`, a shared reusable workflow, or a
`workflow_run`-gated deploy) — a separate workflow alone does not gate deployment. The gate SHALL apply to
every trigger that can cause a GitHub Pages deployment, including both `push: master` and
`repository_dispatch: update_config`. The CI test job SHALL check out the `src/assets/configs` submodule,
install dependencies with a pinned Node version compatible with the project's current Angular major
(Node ≥ 20.19 for Angular 21), and run the suite on a headless browser with `--no-sandbox`.

#### Scenario: Pull request runs the gate
- **WHEN** a pull request targeting `master` is opened or updated
- **THEN** CI SHALL run the headless coverage test suite and report a pass/fail status on the PR

#### Scenario: Failing tests block deployment
- **WHEN** the test suite fails or coverage is below threshold on a push to `master`
- **THEN** the GitHub Pages deployment SHALL NOT proceed

#### Scenario: Config-update deploy is also gated
- **WHEN** a `repository_dispatch: update_config` event would trigger a GitHub Pages deployment and the test suite is failing
- **THEN** the deployment SHALL NOT proceed

#### Scenario: Passing tests allow deployment
- **WHEN** the test suite passes and coverage meets the threshold on a push to `master`
- **THEN** the deployment workflow SHALL be permitted to proceed

#### Scenario: CI Node version matches the current Angular major
- **WHEN** the CI test job installs dependencies and runs the suite
- **THEN** it SHALL use a pinned Node version that satisfies the current Angular major's engine requirement (Node ≥ 20.19 for Angular 21), not the previously pinned Angular-14-era Node 16.20.2
