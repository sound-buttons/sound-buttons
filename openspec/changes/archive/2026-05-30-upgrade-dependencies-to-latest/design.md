## Context

`package.json`, the GitHub Actions workflows, and the pinned CI Node version have drifted behind
their latest releases. The app is on Angular 21 (already the latest major), pre-release with 0
users, and protected by a 209-spec Karma + Jasmine behaviour-preservation harness plus a strict
production build. That harness makes an aggressive dependency refresh low-risk: any behavioural
regression surfaces as a failing spec or a broken build.

Verified peer/engine constraints (npm `peerDependencies`/`engines`, queried during proposal):

- `@angular/* 21.2.x` accepts `rxjs ^6.5.3 || ^7.4.0`, `zone.js ~0.15.0 || ~0.16.0`, and
  (via `@angular/compiler-cli`) `typescript >=5.9 <6.1`.
- `typescript-eslint 8.60` accepts `eslint ^8.57 || ^9 || ^10` and `typescript >=4.8.4 <6.1.0`.
- `@angular-eslint/builder 21.4` accepts `eslint ^8.57 || ^9 || ^10`.
- `ngx-toastr 20` requires `@angular ^21` + `rxjs ^7.8.2`; `@ngx-translate/* 17` require `@angular >=16`.
- `mime 4` is ESM-only and self-typed; `random 5` ships dual ESM/CJS.
- `@angular/cli 21` engines: `node ^20.19.0 || ^22.12.0 || >=24.0.0`; latest LTS is Node 24.

## Goals / Non-Goals

**Goals:**

- Bring every dependency to the latest version permitted by Angular 21's peer ranges and the rest of
  the toolchain.
- Modernise CI: latest GitHub Actions majors and the latest Node LTS.
- Keep the change strictly behaviour-preserving — lint + 209 specs + production build green.
- Remove now-redundant packages/config (`@types/mime`, stale `allowedCommonJsDependencies` entries,
  `.eslintrc.json`).
- Keep documentation and OpenSpec specs' version pins accurate.

**Non-Goals:**

- Upgrading the Angular major beyond 21, or adopting rxjs 8 (outside Angular 21's peer range).
- Migrating to zoneless change detection, standalone bootstrap, or ESLint stylistic rule changes.
- Any new feature, refactor, or behavioural change.

## Decisions

### 1. Pin policy: latest-within-Angular-21

Bump to the newest version that satisfies Angular 21's peers; do **not** chase majors that Angular 21
forbids. Concretely: `rxjs` stays `~7.8` (bump `.0`→`.2`), `@angular/*` stay `21.2.x`. *Alternative
(bump rxjs 8 / Angular 22): rejected* — breaks peer ranges and exceeds the "stay on latest Angular
major, which is 21" scope.

### 2. TypeScript 5.9 → 6.0

Angular's compiler-cli (`<6.1`), typescript-eslint (`<6.1.0`), `ts-node`, and the translate-extract
tool all accept TS 6.0, so adopt it — but **pin within Angular's cap** as `~6.0.x`
(equivalently `>=6.0.0 <6.1.0`), never `^6.0.x`, because `^6.0` would allow a future `6.1`/`6.2`
that Angular 21 forbids and that would break `npm install`/build. *Alternative (stay on 5.9):
rejected* — 6.0 is in range and is the genuine latest; the build/lint/test gate validates it. Update
the `frontend-platform` spec's `< 6.0` cap to `< 6.1`.

### 3. zone.js 0.15 → 0.16

Angular 21 peers explicitly allow `~0.16.0`. Adopt `~0.16.x` and update the `frontend-platform`
toolchain-matrix spec (`~0.15` → `~0.15 || ~0.16`). Zone-based change detection is unchanged.

### 4. ESLint flat-config migration (8 → 10)

ESLint 9+ removes `.eslintrc.*`. Add the `typescript-eslint` (^8.60) and `angular-eslint` (^21.4)
**flat-config meta packages** as devDeps — the project currently only has the split
`@typescript-eslint/*` and `@angular-eslint/*` packages, which do not expose the flat-config
`config()`/preset entry points the new file imports. Replace `.eslintrc.json` with
`eslint.config.js` built from `typescript-eslint`'s `config()` helper and `angular-eslint`'s flat
presets (`tseslint.configs.recommended`, `angular.configs.tsRecommended`, the template processor, and
the template-recommended preset), then append `eslint-config-prettier`. Preserve the existing rule
set verbatim: `@angular-eslint/component-selector` (`app`, kebab-case, element),
`directive-selector` (`app`, camelCase, attribute), and the four disabled rules
(`no-empty-lifecycle-method`, `prefer-standalone`, `prefer-inject`). `angular-eslint` v21's builder
auto-detects flat config, so `angular.json`'s `lint` target needs no change beyond confirming it
points at the new file. Delete `.eslintrc.json`. *Alternative (`@eslint/eslintrc` FlatCompat shim):
rejected* — a native flat config is cleaner and is the supported long-term path. *Alternative (stay
on ESLint 8): rejected* — 8.x is end-of-life.

### 5. Prettier 2 → 3

Prettier 3 changes some defaults (e.g. trailing-comma `all`). Bump `prettier` + `pretty-quick` (4,
which requires Prettier 3) + `eslint-config-prettier` (10), then run a one-time format pass over
`src/**`. The reformat is behaviour-neutral; `eslint-config-prettier` 10 keeps ESLint and Prettier
from fighting. Keep the existing `.prettierrc`/config as-is unless a setting is removed in v3.

### 6. mime 3 → 4 (ESM-only, self-typed)

`mime 4` is ESM-only and bundles its own types. Change `import * as mime from 'mime'` to
`import mime from 'mime'` (default export) in `container.component.ts`, `context-menu.component.ts`,
and the two spec files; `mime.getType(...)` is unchanged. Remove `@types/mime` from
`devDependencies` and remove `mime` from `angular.json` `allowedCommonJsDependencies` (it is no
longer CommonJS). *Alternative (pin mime at 3): rejected* — 4 is the latest and the import change is
trivial.

### 7. random 4 → 5

`random 5` is dual ESM/CJS. Adopt `^5`, then verify the default-import API used in
`audio-control.component.ts` (`import random from 'random'`) still exposes the methods the component
calls; adjust the import/call sites if v5 renamed them. The audio-control RNG behaviour is pinned by
specs, so any drift is caught. Re-evaluate the `seedrandom` entry in `allowedCommonJsDependencies`
(transitively pulled by `random`) and drop it if no longer bundled as CommonJS.

### 8. @ngx-translate 15 → 17

v16+ reworked the HTTP loader (it now ships `provideTranslateHttpLoader`). Update the
`HttpLoaderFactory`/`TranslateHttpLoader` construction in `src/app/app.module.ts` to the v17 loader
API, keeping `./assets/i18n/<lang>.json` prefix/suffix and identical runtime translation behaviour.
**Leave `src/testing/angular.ts` loader-less** — that helper deliberately calls
`TranslateModule.forRoot()` with no loader so `instant`/`get` echo the key for deterministic tests;
only confirm `forRoot()` still compiles under v17, do **not** add an HTTP loader there. The
`TranslateService` call sites elsewhere are API-stable. Validated by the existing translate specs.

### 9. Jasmine: constrained by the Karma adapter

`karma-jasmine` 5.1 is the latest adapter, yet it depends on `jasmine-core ^4.1.0` and resolves a
**nested `jasmine-core` 4.x** from its own package context, so the Karma *runtime* is Jasmine 4
regardless of the project's top-level `jasmine-core` (currently `^5.13`). Bumping the top-level
`jasmine-core`/`@types/jasmine` to 6 therefore does **not** change the runtime and risks a
typings-vs-runtime mismatch. Decision: bump `karma-jasmine-html-reporter` to 2.2 (safe), and bump
`jasmine-core`/`@types/jasmine` toward 6 **only if** the 209 specs stay green under the actual Karma
runtime; otherwise hold them at the version that matches the adapter's runtime and record the
karma-jasmine constraint. The 209 specs are the acceptance gate either way. *Alternative (force
Jasmine 6 runtime): not available* — no newer Karma Jasmine adapter exists at the time of writing.

### 10. CI: Node 24 LTS + latest Action majors

Pin CI Node to Node 24 (latest LTS, within Angular 21 engines) and bump `@types/node` to `^24`.
Update workflows via the `update-github-actions-version` skill: `actions/checkout` v4 → v6,
`actions/setup-node` v4 → v6, `actions/upload-artifact` v4 → v7, `cloudflare/wrangler-action` v3 → v4,
`github/codeql-action` v2/v3 → v3, `JamesIves/github-pages-deploy-action` v4 → v4.8. Refresh the Node
version comments to match.

### 11. Documentation & spec version pins

Sweep `AGENTS.md`/`TESTING.md` for now-stale pins (Node `20.19`, any TS/zone.js mention) and update
the `frontend-platform` toolchain-matrix requirement. Leave version-agnostic statements untouched.

## Risks / Trade-offs

- **ESLint flat-config migration changes which lint errors fire** → Run `npm run lint` after the
  migration and fix only genuine new findings; keep the rule set identical so no new *stylistic*
  rules are introduced.
- **Prettier 3 reformat produces a large, noisy diff** → Do it as a single isolated commit/step so
  the formatting churn is separable from logic changes; rely on the test suite to prove neutrality.
- **TypeScript 6.0 or Jasmine 6 surfaces new type/test errors** → Gate on `npm run build` and the
  209-spec run; if a blocker appears, fall back to the latest 5.9.x / 5.x respectively and record it
  as an Open Question rather than shipping red.
- **`@ngx-translate` 17 loader API mismatch** → Covered by translate specs; verify i18n still loads
  `zh`/`ja` at runtime via the agent-browser smoke test.
- **mime 4 / random 5 ESM interop** → The Angular esbuild/webpack pipeline handles ESM; the
  `allowedCommonJsDependencies` cleanup prevents stale CJS warnings. Build + specs confirm.
- **CI Node 24 / new Action majors change runner behaviour** → CI runs the same `npm ci` + lint +
  test:ci + build; a green pipeline on a branch is the acceptance signal.

## Migration Plan

No runtime data migration (pre-release, 0 users). Roll out as one OpenSpec change implemented in
dependency-cluster steps (each followed by lint + 209 specs + build), then a CI step, then the
docs/spec refresh, then an agent-browser smoke test. Rollback = revert the change commit; no
persisted state is affected.

## Open Questions

- If TypeScript 6.0 or Jasmine 6 proves incompatible with a pinned tool at apply time, do we hold
  that single package at its latest compatible minor? (Default: yes — keep the suite green and note
  the exception in tasks.)
