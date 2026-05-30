## ADDED Requirements

### Requirement: Reproducible headless test execution

The project SHALL provide a single, reproducible command that runs the entire unit/integration test suite
headlessly and non-interactively, usable identically by developers and by CI. The Karma configuration
SHALL define a `ChromeHeadlessNoSandbox` launcher (Chrome/Chromium with `--no-sandbox`, `--headless`, and
`--disable-gpu`) and SHALL honor the `CHROME_BIN` environment variable so environments providing only
Chromium can run the suite.

#### Scenario: Running the suite headlessly
- **WHEN** the CI test command (e.g. `ng test --watch=false --code-coverage --browsers=ChromeHeadlessNoSandbox`) is executed
- **THEN** the suite SHALL run once to completion without a watch loop, without opening an interactive browser window, and exit non-zero if any test fails

#### Scenario: Chromium-only environment
- **WHEN** the suite runs in an environment where `CHROME_BIN` points to a Chromium binary
- **THEN** the headless launcher SHALL use that binary with `--no-sandbox` and complete the run

#### Scenario: Local interactive default preserved
- **WHEN** a developer runs the default `npm test` (`ng test`)
- **THEN** the existing interactive watch-mode behavior SHALL remain available (the headless launcher is additive, not a replacement)

### Requirement: Enforced minimum coverage threshold

The Karma coverage reporter SHALL be active during CI runs and SHALL enforce a global minimum coverage of
at least 70% for statements, lines, functions, and branches. A run whose coverage falls below the
threshold SHALL fail.

#### Scenario: Coverage below threshold fails the run
- **WHEN** the suite runs with coverage enforcement and any of statements/lines/functions/branches is below 70%
- **THEN** the test run SHALL exit with a non-zero status and report the failing metric

#### Scenario: Coverage at or above threshold passes
- **WHEN** the suite runs and all enforced metrics are at or above 70%
- **THEN** the run SHALL pass and emit a coverage summary report

### Requirement: Behavioral traceability to OpenSpec requirements

Every requirement in the 14 OpenSpec capability specs (`openspec/specs/<capability>/spec.md`) SHALL be
covered by at least one unit or integration test, and the suite SHALL maintain an auditable mapping from
each OpenSpec requirement to the test(s) that cover it. Tests SHALL assert documented behavior derived
from the specs' GIVEN/WHEN/THEN scenarios, not merely that a unit can be instantiated.

#### Scenario: Each capability requirement has a covering test
- **WHEN** the test suite is audited against the OpenSpec specs
- **THEN** every `### Requirement:` across all 14 capabilities SHALL map to at least one test asserting its behavior

#### Scenario: Migration-critical capabilities are exhaustively covered
- **WHEN** the `right-click-context-menu` and `sharing` capabilities are reviewed
- **THEN** each menu item, conditional-visibility rule, share/copy/download action, and URL/encoding format documented in their specs SHALL have a corresponding asserting test

#### Scenario: Stubs are replaced by behavioral tests
- **WHEN** a previously creation-only `*.spec.ts` stub is reviewed
- **THEN** it SHALL contain assertions about behavior (inputs, outputs, side effects, rendered DOM) rather than only a `toBeTruthy()` creation check

### Requirement: Unit and integration test coverage

The suite SHALL include unit tests for services, pipes, and model classes (using `HttpClientTestingModule`
and spies/fakes for clipboard, `window.open`, `fetch`, and audio), and integration tests for components
using Angular `TestBed` that assert rendered DOM, conditional visibility, event wiring, and emitted
analytics. Asynchronous behavior (audio `ended`, debounced/`setTimeout` work, upload long-polling) SHALL be
tested deterministically without real network, real audio, or real timers.

#### Scenario: Service unit test isolates collaborators
- **WHEN** a service that performs HTTP, clipboard, or navigation work is unit-tested
- **THEN** its external collaborators SHALL be mocked/faked (e.g. `HttpClientTestingModule`, spies on `navigator.clipboard`/`window.open`/`fetch`) so the test is hermetic

#### Scenario: Component integration test asserts rendered behavior
- **WHEN** a component is tested via `TestBed`
- **THEN** the test SHALL assert observable behavior such as rendered elements, `d-none`/conditional rendering, click/right-click wiring, or emitted events — not only component creation

#### Scenario: Deterministic async testing
- **WHEN** code paths use audio events, `setTimeout`, or RxJS timers
- **THEN** the tests SHALL drive them deterministically (e.g. `fakeAsync`/`tick`, jasmine clock, fake audio/`fetch`) rather than waiting on wall-clock time or the network

### Requirement: CI test gate blocks unverified deployment

A continuous-integration workflow SHALL run the headless coverage suite on `pull_request` and on `push` to
`master`, and deployment SHALL NOT proceed when the test suite fails or coverage is below the enforced
threshold. The deploy gate SHALL be implemented with a mechanism that genuinely blocks deployment (e.g. a
test job within the deploy workflow referenced by `needs:`, a shared reusable workflow, or a
`workflow_run`-gated deploy) — a separate workflow alone does not gate deployment. The gate SHALL apply to
every trigger that can cause a GitHub Pages deployment, including both `push: master` and
`repository_dispatch: update_config`. The CI test job SHALL check out the `src/assets/configs` submodule,
install dependencies with a pinned, Angular-14-verified Node version, and run the suite on a headless
browser with `--no-sandbox`.

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
