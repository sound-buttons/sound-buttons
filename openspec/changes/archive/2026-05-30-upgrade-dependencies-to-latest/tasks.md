## 0. Baseline

- [x] 0.1 Confirm a clean working tree and a green baseline: `npm ci`, `npm run lint`, `CHROME_BIN=$(which chromium-browser) npm run test:ci` (209 specs), `npm run build` (0 warnings). Record bundle size for comparison.

## 1. Framework-locked & low-risk bumps (Angular 21 peer range)

- [x] 1.1 Bump `rxjs` `~7.8.0` → `~7.8.2`, `zone.js` `~0.15.1` → `~0.16.2`, `tslib` and `@angular/*`/`@angular/cdk`/`@angular-devkit/build-angular`/`@angular/cli` to their latest 21.2.x patch, `tocbot` `4.22.0` → `^4.36.8`, `bootstrap`/`bootstrap-icons` to latest patch, and `@angular-eslint/*` → `^21.4.0`.
- [x] 1.2 Bump `@types/node` `^20.19.0` → `^24` and `@vendure/ngx-translate-extract`/`@types/gtag.js` to latest.
- [x] 1.3 `npm install`, then gate: lint + `test:ci` (209) + build all green.
- [x] 1.4 After the `tocbot` bump, re-run `npm run build`; `tocbot@4.36` ships ESM (`type: module`), so if no CommonJS warning is emitted for it, remove `tocbot` from `angular.json` `allowedCommonJsDependencies`.

## 2. TypeScript 6.0

- [x] 2.1 Bump `typescript` `^5.9.3` → `~6.0.3` (pinned `< 6.1` to stay inside Angular 21's peer cap — do not use `^6`) and `ts-node` `~8.3.0` → `^10.9.2`.
- [x] 2.2 `npm install`; run `npm run config` (ts-node) + build + lint + `test:ci`. If TS 6.0 or ts-node 10 break a tool, fall back to the latest 5.9.x / compatible ts-node and note it (per design Open Question). Gate green.
  - Note (design Open Question fallback INVOKED): TypeScript 6.0 is **not supported by Angular 21.2** — `@angular-devkit/build-angular@21.2.13` peers `typescript@">=5.9 <6.0"`. TS 6.0.3 compiled/tested green at runtime, but `npm install`/`npm ci` reject it (ERESOLVE), which would break CI. Per the design's documented fallback, TypeScript is held at the latest 5.9.x (`~5.9.3`). `ts-node` IS still upgraded `~8.3.0` → `^10.9.2` (latest); under ts-node 10 + TS 5.9 the existing `config` script and `tsconfig.json` need no changes.

## 3. mime 4 (ESM-only, self-typed)

- [x] 3.1 Bump `mime` `^3.0.0` → `^4.1.0`; remove `@types/mime` from `devDependencies`.
- [x] 3.2 Change `import * as mime from 'mime'` → `import mime from 'mime'` in `src/app/container/container.component.ts`, `src/app/sound-buttons/context-menu/context-menu.component.ts`, `src/app/container/container.component.spec.ts`, and `src/app/sound-buttons/context-menu/context-menu.component.spec.ts` (keep `mime.getType(...)` calls).
- [x] 3.3 Remove `mime` from `angular.json` `allowedCommonJsDependencies`.
- [x] 3.4 `npm install`; gate: lint + `test:ci` (assert the mime-type specs still pass) + build green with no CommonJS warning for `mime`.

## 4. random 5

- [x] 4.1 Bump `random` `^4.1.0` → `^5.4.1`; `npm install`.
- [x] 4.2 Verify the `random` API used in `src/app/audio-control/audio-control.component.ts` (and its spec) still resolves under v5; adjust the import/call sites if v5 renamed the default export or methods. Re-evaluate and remove the `seedrandom` entry from `angular.json` `allowedCommonJsDependencies` if it is no longer a bundled CommonJS dep.
- [x] 4.3 Gate: lint + `test:ci` (audio-control RNG specs pass) + build green.

## 5. ngx-translate 17 & ngx-toastr 20

- [x] 5.1 Bump `@ngx-translate/core` `^15.0.0` → `^17.0.0`, `@ngx-translate/http-loader` `^8.0.0` → `^17.0.0`, and `ngx-toastr` `^19.0.0` → `^20.0.5`.
- [x] 5.2 Update the `TranslateHttpLoader` wiring in `src/app/app.module.ts` (`HttpLoaderFactory` / `TranslateModule.forRoot`) to the v17 loader API (`provideTranslateHttpLoader` or the v17 constructor), preserving the `./assets/i18n/<lang>.json` prefix/suffix. Leave `src/testing/angular.ts` **loader-less** (it intentionally uses `TranslateModule.forRoot()` with no loader so keys echo); only confirm it still compiles under v17 — do not add an HTTP loader there.
- [x] 5.3 `npm install`; gate: lint + `test:ci` (translate + toastr specs pass) + build green.

## 6. Test framework (Karma-constrained)

- [x] 6.1 Bump `karma-jasmine-html-reporter` `^2.1.0` → `^2.2.0`.
- [x] 6.2 Investigate the Karma Jasmine runtime: `karma-jasmine` 5.1 (the latest adapter) depends on `jasmine-core ^4.1.0` and resolves a nested `jasmine-core` 4.x, so the test runtime is Jasmine 4 regardless of the top-level package. Attempt bumping `jasmine-core` `^5.13.0` → `^6.2.0` and `@types/jasmine` `^5.1.15` → `^6.0.0`; run `test:ci`. If the 209 specs stay green, keep the bump; if the typings/runtime mismatch breaks specs, hold `jasmine-core`/`@types/jasmine` at the version aligned with the adapter's runtime and document the karma-jasmine constraint (no newer Jasmine-6 Karma adapter exists).
- [x] 6.3 Gate: 209 specs green.
  - Note: `jasmine-core` `^6.2.0` + `@types/jasmine` `^6.0.0` bumped and 209 specs stay green. The **runtime** is still Jasmine 4.6.1 — `karma-jasmine` 5.1 (latest adapter) pins a nested `jasmine-core@^4.1.0`; the top-level `jasmine-core` only supplies build-time typings alongside `@types/jasmine`. No Jasmine-6 Karma adapter exists, so the runtime constraint is expected and documented.

## 7. ESLint 10 flat config + Prettier 3

- [x] 7.1 Add devDeps `typescript-eslint@^8.60.0` and `angular-eslint@^21.4.0` (the flat-config meta packages — the split `@typescript-eslint/*`/`@angular-eslint/*` packages stay). Bump `eslint` `^8.57.1` → `^10.4.1`, `eslint-config-prettier` `^8.10.2` → `^10.1.8`, `prettier` `^2.8.8` → `^3.8.3`, `pretty-quick` `^3.3.1` → `^4.2.2`. (`@typescript-eslint/*` are already at the latest `^8.60.0`.)
- [x] 7.2 Replace `.eslintrc.json` with `eslint.config.js` flat config built from the `typescript-eslint` + `angular-eslint` v21 meta-package flat presets, preserving the exact current rule set (component-selector `app`/kebab-case/element, directive-selector `app`/camelCase/attribute, disabled `no-empty-lifecycle-method`/`prefer-standalone`/`prefer-inject`, `prettier` last) and the `*.ts` vs `*.html` overrides and ignore patterns. Delete `.eslintrc.json`; confirm `angular.json`'s `lint` target resolves the flat config.
- [x] 7.3 Run a one-time Prettier 3 format pass (`npx prettier --write "src/**/*.{ts,html,scss,json}"`) as an isolated step; review that the diff is formatting-only.
- [x] 7.4 `npm install`; gate: `npm run lint` clean (fix only genuine new findings, no new stylistic rules) + `test:ci` (209) + build green.

## 8. CI/CD: Node 24 LTS + GitHub Actions

- [x] 8.1 Bump CI Node `20.19.0` → Node 24 LTS in `.github/workflows/test.yml` and `deploy-gh-page.yml`; update the Node-version comments to match.
- [x] 8.2 Use the `update-github-actions-version` workflow to bump all actions to latest major across `test.yml`, `deploy-gh-page.yml`, `deploy-cloudflare-worker.yml`, `codeql.yml` (`actions/checkout` v6, `actions/setup-node` v6, `actions/upload-artifact` v7, `cloudflare/wrangler-action` v4, `github/codeql-action` v3, `JamesIves/github-pages-deploy-action` v4.8).
  - Note: actions bumped to latest majors — `actions/checkout` v6, `actions/setup-node` v6, `actions/upload-artifact` v7, `cloudflare/wrangler-action` v4 (verified the `apiToken` input is still present in v4's action.yml, so the worker auth wiring is unchanged), `github/codeql-action` v2 → **v4** (latest major is v4.36.x, not v3), `JamesIves/github-pages-deploy-action` left at v4 (already the latest major). Node CI pin 20.19.0 → 24.16.0 (latest Node 24 LTS).

## 9. Documentation & spec pins

- [x] 9.1 Apply the `frontend-platform` delta (TypeScript `< 6.0` → `< 6.1`, zone.js `~0.15` → `~0.15 || ~0.16`) — realised at archive time via the merged main spec.
- [x] 9.2 Sweep `AGENTS.md` and `TESTING.md` for now-stale version pins (Node `20.19`, TS/zone.js mentions) and update the meaningful ones to match the upgraded toolchain; leave version-agnostic statements untouched.

## 10. Verification

- [x] 10.1 `nvm use 24.15.0` then `openspec validate upgrade-dependencies-to-latest --strict` passes.
- [x] 10.2 Final full gate on the upgraded toolchain: `npm ci`, `npm run lint`, `CHROME_BIN=$(which chromium-browser) npm run test:ci` (209 specs, coverage gate), `npm run build` (no new warnings; bundle comparable to baseline).
- [x] 10.3 `npm outdated` shows no remaining upgradeable direct dependency except those deliberately held back (rxjs/Angular pinned to 21 range, plus any documented exception from tasks 2/6).
- [x] 10.4 agent-browser smoke test on `ng serve`: homepage renders (header + character cards), a character board loads, i18n strings resolve, and a button plays — confirming behaviour preserved.
  - Note: `npm outdated` shows only `typescript` (5.9.3→6.0.3, held: Angular 21 `build-angular` peer caps `<6.0`) and `@types/node` (24.x→25.x, held: 24.x matches the Node 24 LTS runtime; 25.x tracks the non-LTS Node 25 line). Both are deliberate holds. Final gate: lint clean, build 0 warnings (217.10 kB transfer), 209/209 specs, coverage 95.08%. agent-browser smoke test passed (homepage cards, `/aruma` board, i18n strings, button fetched `blob.sound-buttons.click/.../謎之音效.webm`).
- [ ] 10.5 After archiving, confirm the merged `openspec/specs/**` validate `--strict` and the `frontend-platform` toolchain matrix reads the upgraded pins.
