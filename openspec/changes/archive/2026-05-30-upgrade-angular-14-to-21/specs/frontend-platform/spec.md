## ADDED Requirements

### Requirement: Supported Angular version and toolchain matrix

The application SHALL target the latest stable Angular major version (Angular 21) and SHALL build and
run on a toolchain compatible with it: Node.js ≥ 20.19 (or ≥ 22.12, or ≥ 24), TypeScript ≥ 5.9 and
< 6.0, and zone.js ~0.15. Dependency versions in `package.json` SHALL satisfy the chosen Angular
major's declared peer requirements.

#### Scenario: Toolchain satisfies the Angular major
- **WHEN** dependencies are installed and the app is built
- **THEN** the installed `@angular/*`, `typescript`, and `zone.js` versions SHALL satisfy Angular 21's peer requirements and the build SHALL succeed

#### Scenario: Unsupported Node is rejected
- **WHEN** the project is built or tested on a Node version below the Angular major's minimum (e.g. Node 16)
- **THEN** the Angular CLI SHALL report an unsupported-engine error rather than silently producing an unsupported build

### Requirement: Zone-based change detection retained

Because the targeted Angular major defaults to zoneless change detection, the application SHALL
explicitly opt into Zone-based change detection by providing `provideZoneChangeDetection()` for the
`AppModule` bootstrap — supplied via the `applicationProviders` option of `bootstrapModule()` in
`main.ts`, the placement Angular's NgModule bootstrap API requires (it rejects
`provideZoneChangeDetection()` in `AppModule.providers`) — and SHALL keep `zone.js` loaded as a
polyfill. Migrating to zoneless change detection is out of scope for this capability.

#### Scenario: Change detection runs under ZoneJS
- **WHEN** the application bootstraps
- **THEN** `provideZoneChangeDetection()` SHALL be supplied to the `AppModule` bootstrap via `bootstrapModule()`'s `applicationProviders` and `zone.js` SHALL be present in the polyfills, so view updates triggered by async work (events, HTTP, timers, RxJS) are detected without manual `markForCheck()` calls

### Requirement: No framework-coupled dependency blocks the Angular target

The application SHALL NOT retain any framework-coupled library that is unmaintained AND lacks a release
compatible with the targeted Angular major (i.e. a dependency that blocks the upgrade). Specifically, the
right-click context menu SHALL NOT depend on `@ctrl/ngx-rightclick` — which is npm-deprecated,
GitHub-archived, and was never published for Angular 15+; it SHALL be implemented in-repo on Angular CDK
Overlay (`@angular/cdk`). Libraries that are archived but still publish releases compatible with the
targeted Angular major (e.g. `ngx-toastr`) MAY be retained, provided they are kept on a compatible
version.

#### Scenario: Deprecated context-menu library removed
- **WHEN** `package.json` and the source imports are inspected
- **THEN** `@ctrl/ngx-rightclick` SHALL NOT appear as a dependency and SHALL NOT be imported anywhere, and the context menu SHALL be built on `@angular/cdk` overlay primitives

#### Scenario: Retained libraries are on Angular-compatible versions
- **WHEN** dependencies are installed against the targeted Angular major
- **THEN** every retained framework-coupled library (e.g. `ngx-bootstrap`, `ngx-toastr`, `@ngx-translate/core`) SHALL be on a version that satisfies the Angular major's peer requirements, with no unmet framework peer dependency

### Requirement: Build pipeline and test runner preserved

The upgrade SHALL preserve the existing build and test infrastructure: the production build SHALL
continue to use the webpack-based `@angular-devkit/build-angular:browser` builder, and the unit/
integration suite SHALL continue to run on Karma + Jasmine. Migrating to the esbuild `application`
builder or to Vitest is out of scope.

#### Scenario: Production build uses the browser builder
- **WHEN** `npm run build` runs
- **THEN** it SHALL build via the `:browser` (webpack) builder and emit the same deployable `dist/sound-buttons` output structure as before the upgrade

#### Scenario: Tests still run on Karma + Jasmine
- **WHEN** `npm run test:ci` runs
- **THEN** the suite SHALL execute on the Karma + Jasmine runner configured by `automated-test-harness`

### Requirement: Incremental, behaviour-preserving upgrade

The framework SHALL be upgraded one major version at a time (14→15→16→17→18→19→20→21), and the upgrade
SHALL NOT change observable application behaviour. After each major-version step, the lint, headless
test (`test:ci`), and production build SHALL all pass before the next step proceeds.

#### Scenario: Each major-version step is verified
- **WHEN** a single `ng update` major-version step has been applied
- **THEN** `npm run lint`, `npm run test:ci` (with its coverage gate), and `npm run build` SHALL all pass before the next major version is attempted

#### Scenario: Observable behaviour is unchanged after the full upgrade
- **WHEN** the upgrade to Angular 21 is complete
- **THEN** the `automated-test-harness` suite — which pins the application's pre-upgrade behaviour — SHALL pass without weakening its assertions or coverage thresholds
