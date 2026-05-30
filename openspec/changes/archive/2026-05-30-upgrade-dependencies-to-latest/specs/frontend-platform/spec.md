## MODIFIED Requirements

### Requirement: Supported Angular version and toolchain matrix

The application SHALL target the latest stable Angular major version (Angular 21) and SHALL build and
run on a toolchain compatible with it: Node.js ≥ 20.19 (or ≥ 22.12, or ≥ 24), TypeScript ≥ 5.9 and
< 6.0, and zone.js ~0.15 or ~0.16. Dependency versions in `package.json` SHALL satisfy the chosen
Angular major's declared peer requirements.

#### Scenario: Toolchain satisfies the Angular major
- **WHEN** dependencies are installed and the app is built
- **THEN** the installed `@angular/*`, `typescript`, and `zone.js` versions SHALL satisfy Angular 21's peer requirements and the build SHALL succeed

#### Scenario: Unsupported Node is rejected
- **WHEN** the project is built or tested on a Node version below the Angular major's minimum (e.g. Node 16)
- **THEN** the Angular CLI SHALL report an unsupported-engine error rather than silently producing an unsupported build
