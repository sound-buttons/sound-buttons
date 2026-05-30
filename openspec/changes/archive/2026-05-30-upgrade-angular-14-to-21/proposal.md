## Why

The application is pinned to Angular 14, which is years past end-of-life: it no longer receives
security patches, blocks adoption of current tooling (Node 20+/TS 5.x), and forces continued reliance
on the **abandoned `@ctrl/ngx-rightclick` library** (npm-deprecated and GitHub-archived since 2023,
never published for Angular 15+), which is a hard blocker to any framework update. Upgrading to the
latest Angular (21) restores a supported, secure, maintainable platform. The behaviour-preservation
test harness (`automated-test-harness`) is now in place, so the upgrade can be performed with a safety
net that catches regressions.

## What Changes

- **Replace the abandoned `@ctrl/ngx-rightclick` context-menu library** with an in-repo right-click
  menu built on Angular CDK Overlay (`@angular/cdk` is already a dependency), preserving the exact
  observable menu behaviour. **BREAKING** at the implementation/spec level (the library-specific
  trigger directive, `menuPackage.context` binding, and `ContextMenuService.closeAll()` API are
  removed), but not for end users.
- **Upgrade Angular 14 → 21 one major at a time** (14→15→16→17→18→19→20→21) using `ng update`, plus the
  required toolchain bumps: Node ≥ 20.19 (CI was pinned to 16.20.2), TypeScript 4.8 → ≥ 5.9, and
  zone.js 0.11 → 0.15.
- **Retain Zone-based change detection explicitly.** Angular 21 makes zoneless the default; the app
  keeps ZoneJS by adding `provideZoneChangeDetection()` to `AppModule` providers. **BREAKING** if not
  added (no change detection).
- **Upgrade framework-coupled third-party packages** in lockstep: `ngx-bootstrap` 9 → 21.2 (remove the
  four `.forRoot()` calls; handle signal inputs), `ngx-toastr` 15 → 20, `rxjs` 6.6 → 7.8,
  `@ngx-translate/*` 14 → 17, and the ESM-only `mime` 3 → 4 import-style fix.
- **Bump the CI gate's pinned Node version** in `test.yml` / `deploy-gh-page.yml` from 16.20.2 to an
  Angular-21-compatible version, keeping the existing test-gated deployment intact.
- **Keep the existing webpack (`:browser`) build and Karma+Jasmine test runner.** Migrating to the
  esbuild `application` builder and to Vitest are explicit non-goals of this change.

## Capabilities

### New Capabilities
- `frontend-platform`: Defines the supported Angular major version and toolchain matrix
  (Node/TypeScript/zone.js), the explicit retention of Zone-based change detection, the build-pipeline
  and test-runner decisions, the prohibition on abandoned framework-coupled dependencies (the
  CDK-based context-menu replacement), and the incremental, behaviour-preserving upgrade discipline.

### Modified Capabilities
- `right-click-context-menu`: The three requirements that are coupled to the `@ctrl/ngx-rightclick`
  implementation — context-menu **trigger and context binding**, menu **open/close animation**, and
  **closing behaviour after actions** — are rewritten to describe the same observable behaviour on the
  new Angular CDK Overlay implementation (removing the library-specific directives/services). The
  menu-item, download, YouTube, social-share, and DOM-structure requirements are unchanged.
- `automated-test-harness`: The CI test-gate requirement is modified so the suite installs dependencies
  with a pinned Node version compatible with the **current** Angular major (≥ 20.19) instead of the
  Angular-14-verified 16.20.2.

## Impact

- **Dependencies**: `@angular/*`, `@angular/cli`, `@angular-devkit/build-angular`, `typescript`,
  `zone.js`, `rxjs`, `ngx-bootstrap`, `ngx-toastr`, `@ngx-translate/core`+`http-loader`, `mime`,
  `@types/jasmine`, `jasmine-core`, `@types/node`; **removed**: `@ctrl/ngx-rightclick`.
- **Code**: `app.module.ts` (providers, `.forRoot()` removal, `provideZoneChangeDetection()`); the
  context-menu component + its 5 consumer files (`sound-buttons`, `audio-control`, `introduction`);
  `mime` imports in `container.component.ts` and `upload.component.ts`; RxJS operator usages; zone.js
  import paths; any `ng update` schematic-applied template/DI changes.
- **CI/CD**: `.github/workflows/test.yml` and `deploy-gh-page.yml` Node version; the test gate and
  GitHub Pages deploy flow are otherwise preserved.
- **Tests**: `context-menu.component.spec.ts` (rewired to the new trigger/overlay), and any specs
  affected by per-version testing-API changes (`whenStable`, removed `ng-reflect-*`, error rethrow).
- **Out of scope**: esbuild `application` builder, Vitest, standalone-component/control-flow/signals
  refactors beyond what `ng update` applies automatically, and the separate Azure Functions backend.
