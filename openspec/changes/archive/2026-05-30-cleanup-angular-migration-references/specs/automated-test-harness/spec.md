## MODIFIED Requirements

### Requirement: Behavioral traceability to OpenSpec requirements

Every requirement across all OpenSpec capability specs (`openspec/specs/<capability>/spec.md`) SHALL be
covered by at least one unit or integration test, and the suite SHALL maintain an auditable mapping from
each OpenSpec requirement to the test(s) that cover it. Tests SHALL assert documented behavior derived
from the specs' GIVEN/WHEN/THEN scenarios, not merely that a unit can be instantiated.

#### Scenario: Each capability requirement has a covering test
- **WHEN** the test suite is audited against the OpenSpec specs
- **THEN** every `### Requirement:` across all OpenSpec capabilities SHALL map to at least one test asserting its behavior

#### Scenario: Behaviour-critical capabilities are exhaustively covered
- **WHEN** the `right-click-context-menu` and `sharing` capabilities are reviewed
- **THEN** each menu item, conditional-visibility rule, share/copy/download action, and URL/encoding format documented in their specs SHALL have a corresponding asserting test

#### Scenario: Stubs are replaced by behavioral tests
- **WHEN** a previously creation-only `*.spec.ts` stub is reviewed
- **THEN** it SHALL contain assertions about behavior (inputs, outputs, side effects, rendered DOM) rather than only a `toBeTruthy()` creation check

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
- **THEN** it SHALL use a pinned Node version that satisfies the current Angular major's engine requirement (Node ≥ 20.19 for Angular 21)
