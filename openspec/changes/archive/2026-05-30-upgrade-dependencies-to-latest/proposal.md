## Why

Several direct dependencies and all CI tooling have drifted behind their latest releases — some
by multiple major versions (`eslint` 8 → 10, `prettier` 2 → 3, `@ngx-translate/*` 15 → 17,
`mime` 3 → 4, `random` 4 → 5, `jasmine` 5 → 6, `ts-node` 8 → 10) — while the GitHub Actions and
pinned Node version are likewise stale. Staying current keeps the project on supported, patched
toolchains, removes deprecated transitive packages, and is cheapest to do now while the app is
pre-release with a 209-spec behaviour-preservation harness to catch regressions.

## What Changes

- Upgrade every outdated `package.json` dependency to the latest version that still satisfies
  Angular 21's peer requirements, keeping the app on Angular 21 (already latest) and **not**
  jumping framework-locked packages past what Angular 21 allows (rxjs stays `~7.8`, Angular stays
  `21.2.x`).
- **BREAKING (tooling)** Migrate ESLint 8 → 10, which removes legacy `.eslintrc.json` support:
  convert the config to flat config (`eslint.config.js`) using the `typescript-eslint` and
  `angular-eslint` v21 flat-config meta packages (added as devDeps), preserving the current rule set.
  Bump `eslint-config-prettier` 8 → 10.
- **BREAKING (formatting)** Upgrade `prettier` 2 → 3 and `pretty-quick` 3 → 4; reformat the
  codebase to Prettier 3 defaults (touches many files, behaviour-neutral).
- **BREAKING (API)** Upgrade `@ngx-translate/core` 15 → 17 and `@ngx-translate/http-loader` 8 → 17;
  migrate the `TranslateHttpLoader` wiring in `AppModule` to the new v17 loader API while preserving
  identical runtime translation behaviour. (The test `TranslateModule` helper stays loader-less.)
- **BREAKING (ESM)** Upgrade `mime` 3 → 4 (now ESM-only and self-typed): switch the namespace import
  to a default import, drop the now-redundant `@types/mime`, and remove `mime` from
  `allowedCommonJsDependencies`.
- Upgrade `random` 4 → 5, `ngx-toastr` 19 → 20, `zone.js` 0.15 → 0.16, `ts-node` 8 → 10,
  `tocbot` → 4.36, `@types/node`
  20 → 24, `@angular-eslint/*` → 21.4, and remaining patch/minor bumps; revisit
  `allowedCommonJsDependencies` for packages that are no longer CommonJS (`mime`, `tocbot`, possibly
  `seedrandom`). Hold `typescript` at `~5.9.3` (latest `5.9.x`): Angular 21's
  `@angular-devkit/build-angular` peers `typescript@">=5.9 <6.0"`, so TypeScript 6.0 is rejected by
  `npm ci`/CI despite compiling at runtime.
- Refresh the test tooling to the latest the Karma runner can actually run: bump
  `karma-jasmine-html-reporter` → 2.2, and bump `jasmine-core`/`@types/jasmine` toward 6 **only if**
  the Karma adapter (`karma-jasmine` 5.1, the latest, which pins `jasmine-core ^4.1.0`) adopts them
  with the 209 specs still green — otherwise hold them aligned with the adapter's bundled Jasmine
  runtime and document the constraint.
- Bump CI Node from `20.19.0` to the latest LTS (Node 24) and update all GitHub Actions to their
  latest major (`actions/checkout` v6, `actions/setup-node` v6, `actions/upload-artifact` v7,
  `cloudflare/wrangler-action` v4, `github/codeql-action` v4, `JamesIves/github-pages-deploy-action`
  v4.8) via the `update-github-actions-version` workflow.
- Refresh stale version pins in documentation and OpenSpec specs (e.g. the `frontend-platform`
  toolchain matrix that currently caps TypeScript at `< 6.0` and zone.js at `~0.15`).

This change is **behaviour-preserving**: no user-facing functionality changes. The full lint +
209-spec test suite + production build must stay green at every step.

## Capabilities

### New Capabilities

(none)

### Modified Capabilities

- `frontend-platform`: the "Supported Angular version and toolchain matrix" requirement is updated
  to reflect the upgraded toolchain — zone.js `~0.15 || ~0.16` (was `~0.15`) — staying within
  Angular 21's declared peer ranges. TypeScript stays `>= 5.9 < 6.0` (Angular 21's
  `build-angular` peer cap blocks TypeScript 6.0).

## Impact

- **Dependencies**: most of `package.json` (`dependencies` + `devDependencies`); removal of
  `@types/mime`; addition of the `typescript-eslint` and `angular-eslint` flat-config meta packages.
- **Build/lint config**: new `eslint.config.js` (replaces `.eslintrc.json`); `angular.json`
  `allowedCommonJsDependencies`; Prettier 3 reformat across `src/**`.
- **Source**: `mime` and (if its API changed) `random` import sites; `@ngx-translate` loader wiring
  in `src/app/app.module.ts` and `src/testing/angular.ts`.
- **CI/CD**: `.github/workflows/{test,deploy-gh-page,deploy-cloudflare-worker,codeql}.yml` action and
  Node versions.
- **Docs/specs**: `AGENTS.md`, `TESTING.md`, and the `frontend-platform` capability spec version pins.
- **No backward-compatibility / migration shims needed** — the project is pre-release with 0 users.
