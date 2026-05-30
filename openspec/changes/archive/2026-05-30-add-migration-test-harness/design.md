## Context

We are about to migrate the app from Angular 14 to Angular 21 — a multi-major jump that changes the
build pipeline, RxJS, zone handling, and several third-party libraries (notably the abandoned
`@ctrl/ngx-rightclick` powering the context menu). The behavior of the current app is now captured in
14 OpenSpec capability specs, but the running code is effectively **untested**:

- `karma.conf.js` runs only a full, non-headless `Chrome`, with **no coverage thresholds** and coverage
  not even in the active `reporters` list.
- All 20 `*.spec.ts` files are Angular-CLI stubs (~22 `it` blocks, all `toBeTruthy()`/title smoke
  checks); `share.service`, `click.service`, and `scroll-to-top-button` have **no spec at all**.
- No CI workflow runs `ng test`. The three workflows (`deploy-gh-page.yml`, `deploy-cloudflare-worker.yml`,
  `codeql.yml`) build/deploy/scan but never execute unit tests, and none pin a Node version.

Constraints: tests run against `src/environments/environment.ts` (not the generated
`environment.prod.ts`), so no production-config generation is required. The runner must use a headless
Chromium/Chrome with `--no-sandbox`. The `src/assets/configs` submodule supplies JSON consumed by some
specs and is served as a karma asset.

**Verified local environment (immutable OS):** On the maintainer's Fedora Kinoite (rpm-ostree) system,
Google Chrome cannot be installed, but `chromium-browser` (Chromium 148) is present at
`/usr/bin/chromium-browser`. A live run confirmed that Karma's `ChromeHeadless` launcher does NOT hardcode
Chrome — it resolves the binary from the `CHROME_BIN` environment variable. So
`CHROME_BIN=/usr/bin/chromium-browser npm run test:ci` with the `ChromeHeadlessNoSandbox` launcher
(`base: 'ChromeHeadless'` + `--no-sandbox`) launches and connects the existing Chromium headlessly with no
Chrome install. This is the supported path for Kinoite/immutable distros; CI on `ubuntu-latest` uses its
preinstalled Chrome with the same `--no-sandbox` flag.

**Baseline-compile caveat (must fix first in the apply phase):** the current tree does not compile under
`ng test` as-is — a smoke run surfaced two pre-existing TypeScript errors unrelated to the browser:
(1) `audio.service.ts` references the `gtag` global with no ambient declaration (`Cannot find name 'gtag'`),
and (2) `seo.service.spec.ts` imports `SeoService` while the class is exported as `SEOService`. These cause
`Executed 0 of 0` (the bundle fails to build). Task 1.5's "green baseline" therefore includes declaring the
`gtag` global (e.g. an ambient `.d.ts`) and correcting the `SEOService` import before any new tests are
written.

## Goals / Non-Goals

**Goals:**
- A reproducible, headless test command identical locally and in CI.
- An enforced coverage floor (≥70% statements/lines/functions/branches) that fails the run on regression.
- Real unit + integration tests whose assertions are derived from the 14 OpenSpec specs' GIVEN/WHEN/THEN
  scenarios, so a green suite means the documented behavior holds.
- Exhaustive coverage of `right-click-context-menu` and `sharing` (the highest-risk, to-be-rewritten code).
- A CI gate that runs the suite on `pull_request` and `push` and blocks deployment on failure or coverage
  regression.
- A lightweight traceability map from OpenSpec requirements → covering test(s).

**Non-Goals:**
- Changing any user-facing behavior of the 14 capabilities (this is a non-behavioral, infra-only change).
- Introducing a new test framework (Jest/Vitest/Playwright/Cypress) — that compounds migration risk and
  is explicitly deferred.
- E2E/Protractor work (Protractor is deprecated; replacing it belongs to the migration, not this harness).
- Reaching 100% coverage or testing trivial modules (`app.module.ts`, generated env files).

## Decisions

**D1 — Stay on Karma + Jasmine (don't switch to Jest now).**
Rationale: The existing wiring (`@angular-devkit/build-angular:karma`, `src/test.ts`, `tsconfig.spec.json`)
already works with Angular 14. Swapping runners mid-harness would entangle the safety net with the very
migration it is meant to verify. We want the harness *stable before* the migration; runner modernization
(e.g. to web-test-runner/Jest) can be a later, separately-verified step. Alternative considered: Jest via
`jest-preset-angular` — rejected for now (adds risk, changes module resolution, no behavioral benefit).

**D2 — Add a `ChromeHeadlessNoSandbox` custom launcher; keep interactive `Chrome` as the local default.**
Rationale: CI and sandboxes need `--no-sandbox --headless --disable-gpu`; developers keep the watch-mode
`Chrome` experience. The CI script selects the headless launcher explicitly. We honor `CHROME_BIN` so
environments with only Chromium can run the suite. Alternative: globally replace `Chrome` with headless —
rejected to preserve local debugging ergonomics.

**D3 — Enforce coverage via `coverageReporter.check.global` at 70%, plus minimums on critical files.**
Rationale: A threshold that fails the build is what turns "we have tests" into "we cannot regress". 70%
matches the stated target and is realistic for a UI app where some glue (analytics script injection,
module bootstrap) is hard to unit-test. Because a single global number is gameable for a
behavior-preservation harness, we ALSO set `coverageReporter.check.each` minimums (or per-glob overrides)
for the migration-critical files (`context-menu`, `share.service`, `audio.service`, `config.service`,
`upload.component`) so they are driven well above the floor by real behavior tests, and we treat the
spec→test traceability checklist (D6) as the primary completeness signal rather than the line number.
Thresholds SHOULD be ratcheted upward once the baseline is green. Alternative: global-only thresholds —
rejected as too easy to satisfy with low-value tests.

**D4 — Gate deployment with a mechanically real CI dependency (not cross-workflow `needs:`).**
Rationale: `codeql.yml` already shows the PR-trigger pattern; we add a `pull_request` test run to gate PRs
before merge. The deploy gate is the subtle part: GitHub Actions `needs:` only links jobs **within one
workflow**, so a separate `test.yml` cannot block `deploy-gh-page.yml`. The deploy gate MUST therefore be
one of: (a) a `test` job added inside `deploy-gh-page.yml` that `build`/deploy `needs:`; (b) a reusable
workflow (`workflow_call`) invoked by both PR and deploy; or (c) a `workflow_run`-triggered deploy that
fires only on a successful test run. The gate MUST also cover the existing `repository_dispatch:
update_config` deploy trigger, not just `push: master`. The test job uses `actions/setup-node` pinned to a
conservative Angular-14-verified version (**target `16.20.x`**, validated by running `npm ci` + `npm run
build` + `npm run test:ci` before adoption), checks out the `src/assets/configs` submodule the same way
deploy does, and runs the headless coverage suite with `--no-sandbox`. Alternative: standalone `test.yml`
with deploy `needs:` it — rejected because cross-workflow `needs:` is not supported and would silently fail
to gate.

**D5 — Test taxonomy: unit tests for services/pipes/models; TestBed integration tests for components.**
Rationale: Services (`audio`, `config`, `share`, `click`, `color`, `language`, `seo`, `display`, `dialog`)
and pipes/models are pure-ish logic → fast unit tests with `HttpClientTestingModule`, spies, and fake
clipboard/`window.open`/`fetch`. Components (`sound-buttons`, `context-menu`, `upload`, `container`,
`introduction`, `home-page`, `audio-control`, `header`, `footer`, `chara-image`, `scroll-to-top-button`)
get TestBed specs asserting rendered DOM, conditional visibility (e.g. `d-none` on missing `videoId`),
event wiring, and emitted analytics — i.e. the actual scenarios from the specs.

**D6 — Traceability via a spec→test index.**
Rationale: The proposal requires that *every OpenSpec requirement* be covered, not merely a line-coverage
number. We maintain a simple mapping (a checklist in `tasks.md`, optionally a `TESTING.md`/table) keyed by
`capability › requirement` → spec file(s), and mirror OpenSpec scenario names in Jasmine `describe/it`
strings so the link is auditable. Alternative: tagging frameworks — rejected as overkill.

## Risks / Trade-offs

- **[Headless flakiness / timers]** Audio `ended` events, `setTimeout`-based TOC refresh, and the upload
  long-poll (`timer(10000,20000)`) can make tests slow or flaky → Mitigation: use `fakeAsync`/`tick`,
  jasmine clock, and fake `HTMLAudioElement`/`fetch`; never rely on real network or real audio.
- **[Coverage gate too strict at first]** Enforcing 70% before tests are written would make the suite red
  immediately → Mitigation: land the threshold and the tests together (threshold flips on only once the
  suite clears it), or ratchet up if needed; the gate must be green by the end of this change.
- **[Hard-to-test glue lowers coverage]** GA/Clarity `<script>` injection and `app.module` bootstrap drag
  global coverage down → Mitigation: extract/guard testable units, assert the GPC no-op path, and accept
  that bootstrap modules are excluded from meaningful coverage.
- **[Browser binary mismatch in CI vs local]** Local Fedora has only `chromium-browser`; `ubuntu-latest`
  has Chrome → Mitigation: respect `CHROME_BIN` and use the `--no-sandbox` launcher so both work.
- **[Submodule availability in CI]** Tests served assets include `src/assets`; a missing configs submodule
  could break asset serving → Mitigation: check out the submodule in `test.yml` exactly as deploy does, or
  stub config HTTP with `HttpClientTestingModule` so tests don't depend on real files.
- **[Spec drift]** Tests could encode behavior that contradicts the OpenSpec specs → Mitigation: derive
  every assertion from a named scenario and keep the spec→test index current.
- **[Media `play()` promise rejection]** `audio.service` ignores the promise from `HTMLAudioElement.play()`
  and sets `_playing = true` before playback is confirmed; a migration could change media timing and
  surface a queue stall → Mitigation: add a preservation test that documents the *current* behavior on a
  rejected `play()` (queue does not auto-recover), so any change is caught — or explicitly scope it out.
- **[Non-deterministic shuffle]** Shuffle uses randomness → Mitigation: spy/stub the RNG (`random.int`) or
  assert only set membership and the 大叫/悲鳴/自肥 exclusion, never an exact order.

## Migration Plan

1. Land tooling first: `ChromeHeadlessNoSandbox` launcher + `coverage` reporter (no enforced threshold yet)
   so the suite can run headlessly in CI and locally.
2. Write unit tests bottom-up (models → pipes → services), then component integration tests, capability by
   capability, mirroring OpenSpec scenarios; prioritize `right-click-context-menu` and `sharing`.
3. Once the suite covers all 14 capabilities and clears 70%, enable `coverageReporter.check.global` at 70%.
4. Add `test.yml` (PR + push) and gate deployment on it.
5. Verify green CI; record the spec→test traceability map.

Rollback: tests and the CI gate are additive; reverting the workflow/threshold restores the prior
(test-free) pipeline without affecting runtime code.

## Open Questions

- Confirm the pinned Node version: the conservative target is **`16.20.x`** (safest for Angular 14 + the
  repo's older tooling: Angular CLI 14, `ts-node` 8, `@types/node` 12); adopt only after verifying
  `npm ci` + `npm run build` + `npm run test:ci` pass on it across test and deploy workflows.
- Whether to also gate `deploy-cloudflare-worker.yml`, or only the GitHub Pages deploy.
- Whether tests should stub all config HTTP (preferred for hermeticity) or load the real `assets/configs`
  submodule for a few integration tests.
- Whether the migration harness should preserve-test the rejected-`play()` queue-stall behavior or
  explicitly scope it out as a pre-existing bug.
