## Why

The project is about to undergo a high-risk framework migration (Angular 14 → 21) that touches build
tooling, third-party libraries, and core runtime APIs. We have just captured the application's current
behavior as 14 OpenSpec capability specs (72 requirements / 142 scenarios), but there is **no automated
safety net** that proves the running code still matches those specs: the existing `*.spec.ts` files are
largely Angular-CLI stubs, coverage is unenforced, tests run only in a non-headless `Chrome`, and CI
never executes them. Without a reliable, behavior-traceable test harness, the migration cannot be
verified objectively. This change builds that harness first, so every migration step can be checked
against a green, spec-backed baseline.

## What Changes

- Make the test suite **reproducible and headless**: add a `ChromeHeadlessNoSandbox` Karma launcher and
  CI-friendly execution (`--watch=false --code-coverage`), so the same command runs locally and in CI.
- **Enforce a coverage floor of 70%** (statements, lines, functions, branches) via Karma
  `coverageReporter.check`, failing the run when coverage regresses below threshold.
- Author **real unit and integration tests** that cover the behavior documented in all 14 OpenSpec
  capability specs — replacing creation-only stubs with assertions derived from the BDD scenarios
  (GIVEN/WHEN/THEN). Unit tests for services/pipes; TestBed integration tests for components, with
  special, exhaustive coverage of the `right-click-context-menu` and `sharing` behavior that will be
  re-implemented during migration.
- Add tests for currently **untested units** (e.g. `share.service`, `click.service`, `color.service`,
  `chara-image`, `scroll-to-top-button`) so each capability has a corresponding test owner.
- Add a **CI test gate**: a GitHub Actions job that installs dependencies, checks out the configs
  submodule, runs the headless coverage suite on `push` and `pull_request`, and **blocks deployment**
  unless tests and the coverage threshold pass.
- Establish a **traceability convention** linking each OpenSpec requirement to the test(s) that cover
  it, so coverage of the spec (not just lines of code) is auditable before and after migration.

This change is **non-behavioral** for end users — it adds tests, test tooling, and CI; it does not
change the 14 documented capabilities. It is the infrastructure harness that makes the migration
reliable.

## Capabilities

### New Capabilities
- `automated-test-harness`: Defines the project's automated-testing contract — reproducible headless
  execution, an enforced minimum coverage threshold, the requirement that every OpenSpec behavioral
  requirement be covered by at least one unit or integration test, the unit/integration test split, and
  a CI gate that runs the suite and blocks deployment on failure or coverage regression.

### Modified Capabilities
<!-- None. This change adds a testing harness and CI gate; it does not alter the requirements of the
     14 existing behavioral capabilities (configuration-loading, content-routing-and-seo,
     homepage-overview, character-board, sound-button-grid, audio-playback, right-click-context-menu,
     audio-submission, sharing, internationalization, theming, notifications-and-dialogs,
     privacy-and-analytics, click-counter). Those specs are the test targets, not modified behavior. -->

## Impact

- **Test tooling**: `karma.conf.js` (add `ChromeHeadlessNoSandbox` launcher + `coverageReporter.check`
  thresholds); `package.json` (add a CI test script, e.g. `test:ci`); no new heavyweight test
  frameworks — stay on the existing Karma + Jasmine stack to avoid compounding migration risk.
- **Test sources**: new and rewritten `src/**/*.spec.ts` across services, pipes, and components.
- **CI/CD**: GitHub Actions changes under `.github/workflows/`. A `pull_request` test run gates PRs, and
  the GitHub Pages deploy must be gated by tests. Note: cross-workflow `needs:` does **not** exist in
  GitHub Actions, so the deploy gate MUST be mechanically real — implemented by moving the test job into
  `deploy-gh-page.yml` with `build`/deploy `needs: test`, or via a reusable workflow, or a `workflow_run`
  trigger that only deploys after tests pass. The gate MUST also cover the existing
  `repository_dispatch: update_config` deploy trigger, not only `push`. Requires `ChromeHeadless`
  (preinstalled on `ubuntu-latest`) with `--no-sandbox`, and submodule checkout for `src/assets/configs`.
  Node is pinned to a conservative, Angular-14-verified version (target `16.20.x`) across test and deploy.
- **No production runtime impact**: tests use `src/environments/environment.ts` (not the generated
  `environment.prod.ts`), so no production config generation is needed to run them.
- **Dependencies**: existing `karma`, `karma-coverage`, `karma-chrome-launcher`, `jasmine-core`,
  `@types/jasmine` already present; no new runtime dependencies expected.
