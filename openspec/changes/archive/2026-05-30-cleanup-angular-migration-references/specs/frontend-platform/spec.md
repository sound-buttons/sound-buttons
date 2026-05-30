## MODIFIED Requirements

### Requirement: No framework-coupled dependency blocks the Angular target

The application SHALL NOT retain any framework-coupled library that is unmaintained AND lacks a release
compatible with the targeted Angular major (i.e. a dependency that would block adopting that major).
Specifically, the right-click context menu SHALL NOT depend on `@ctrl/ngx-rightclick` — which is
npm-deprecated, GitHub-archived, and was never published for Angular 15+; it SHALL be implemented in-repo
on Angular CDK Overlay (`@angular/cdk`). Libraries that are archived but still publish releases compatible
with the targeted Angular major (e.g. `ngx-toastr`) MAY be retained, provided they are kept on a
compatible version.

#### Scenario: Deprecated context-menu library removed
- **WHEN** `package.json` and the source imports are inspected
- **THEN** `@ctrl/ngx-rightclick` SHALL NOT appear as a dependency and SHALL NOT be imported anywhere, and the context menu SHALL be built on `@angular/cdk` overlay primitives

#### Scenario: Retained libraries are on Angular-compatible versions
- **WHEN** dependencies are installed against the targeted Angular major
- **THEN** every retained framework-coupled library (e.g. `ngx-bootstrap`, `ngx-toastr`, `@ngx-translate/core`) SHALL be on a version that satisfies the Angular major's peer requirements, with no unmet framework peer dependency

### Requirement: Build pipeline and test runner preserved

The application SHALL build with the webpack-based `@angular-devkit/build-angular:browser` builder, and
its unit/integration suite SHALL run on Karma + Jasmine. Adopting the esbuild `application` builder or
the Vitest runner is out of scope for this capability.

#### Scenario: Production build uses the browser builder
- **WHEN** `npm run build` runs
- **THEN** it SHALL build via the `:browser` (webpack) builder and emit the existing deployable `dist/sound-buttons` output structure

#### Scenario: Tests still run on Karma + Jasmine
- **WHEN** `npm run test:ci` runs
- **THEN** the suite SHALL execute on the Karma + Jasmine runner configured by `automated-test-harness`

### Requirement: Incremental, behaviour-preserving upgrade

When the Angular framework is upgraded, it SHALL be upgraded one major version at a time, and the upgrade
SHALL NOT change observable application behaviour. After each major-version step, the lint, headless test
(`test:ci`), and production build SHALL all pass before the next step proceeds.

#### Scenario: Each major-version step is verified
- **WHEN** a single major-version framework update has been applied
- **THEN** `npm run lint`, `npm run test:ci` (with its coverage gate), and `npm run build` SHALL all pass before the next major version is attempted

#### Scenario: Observable behaviour is unchanged after an upgrade
- **WHEN** a framework upgrade is complete
- **THEN** the `automated-test-harness` suite — which pins the application's observable behaviour — SHALL pass without weakening its assertions or coverage thresholds
