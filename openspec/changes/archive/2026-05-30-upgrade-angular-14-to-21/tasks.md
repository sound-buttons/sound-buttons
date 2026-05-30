## 1. Pre-work under Angular 14 (shrink later diffs, unblock the upgrade)

- [x] 1.1 Add `@angular/cdk@^14` as a direct dependency (align its version with Angular 14) and run `npm install`.
- [x] 1.2 Implement an in-repo right-click context-menu trigger on Angular CDK Overlay: a directive/host that listens for `contextmenu`, calls `preventDefault()`, opens a flexible-connected overlay positioned at the cursor, and hosts `ContextMenuComponent` with its target button set as context.
- [x] 1.3 Refactor `ContextMenuComponent` to own its `@menu` fade animation (host `@menu` binding + `@menu.done` listener) and a `close()` that disposes the hosting overlay; remove its dependency on the `@ctrl/ngx-rightclick` `MenuComponent` base and `ContextMenuService`. Keep `context-menu.component.html` markup, labels, `d-none` conditional hiding, dividers, and `ShareService` wiring unchanged.
- [x] 1.4 Add overlay dismissal on outside-click and Escape (backdrop/keydown), disposing the overlay.
- [x] 1.5 Rewire all five consumer sites to the new trigger: `app.module.ts` (drop `ContextMenuModule`), `sound-buttons.component.*`, `audio-control.component.*`, `introduction.component.*`.
- [x] 1.6 Remove `@ctrl/ngx-rightclick` from `package.json` and delete every import of it; confirm none remain.
- [x] 1.7 Update `context-menu.component.spec.ts` to drive the new CDK trigger/overlay while preserving the existing behavioural assertions (open on right-click with context, fade animation `@menu.done` delegation, close after every action, outside-click/Escape dismissal, conditional YouTube visibility, download flow, social-share actions).
- [x] 1.8 Fix the ESM-only `mime` import sites for `mime@4` style (`import mime from 'mime'`) in `container.component.ts` and `upload.component.ts` (bump `mime` to 4 if it compiles under the current toolchain; otherwise defer the version bump to the step where TS allows it but keep the import shape correct).
- [x] 1.9 Apply RxJS-7-ready usage adjustments (e.g. `throwError(() => err)`, array-form `combineLatest`, single-object `subscribe`, no deprecated operator aliases) so the code is forward-compatible.
- [x] 1.10 Confirm whether an `e2e/` Protractor suite exists; if so, plan to remove it (it is not part of the deploy gate) since Protractor support is dropped in Angular 19.
- [x] 1.11 Gate: `npm run lint`, `CHROME_BIN=<chromium> npm run test:ci`, and `npm run build` all pass on Angular 14 with the new context menu and no `@ctrl/ngx-rightclick`.

> Coupled-library policy (applies to every `ng update` step below): in addition to `@angular/core`,
> `@angular/cli`, and `@angular/cdk`, align the framework-coupled libraries to a version compatible with
> the Angular major being installed so `npm install`/lint/`test:ci`/build stay green at each step — run
> `ng update` for `ngx-bootstrap`, `@angular-eslint/schematics` (which also bumps `@typescript-eslint/*`),
> and `@ngx-translate/core`+`@ngx-translate/http-loader`, and bump `ngx-toastr` to its Angular-compatible
> version (raising `rxjs` to `~7.8` at the step where `ngx-toastr` requires `rxjs ≥ 7.8.2`). Do not defer
> these to the end. The library-specific manual breakages are called out at the step that introduces them.

## 2. Angular 14 → 15

- [x] 2.1 Run `ng update @angular/core@15 @angular/cli@15 @angular/cdk@15`; also align `ngx-bootstrap`, `@angular-eslint/schematics`, `ngx-toastr`, and `@ngx-translate/*` to their Angular-15-compatible versions (per the coupled-library policy); review and accept schematics.
- [x] 2.2 Apply manual items: replace any `~` (tilde) Sass imports with plain module imports; ensure `<iframe>` security attributes precede `src`/`srcdoc`; check any keyframe names referenced from TS/JS strings.
- [x] 2.3 If form disabled-state behaviour regresses, apply `ReactiveFormsModule.withConfig({ callSetDisabledState: 'whenDisabledForLegacyCode' })`.
- [x] 2.4 Gate: lint + `test:ci` + build pass.

## 3. Angular 15 → 16

- [x] 3.1 Run `ng update @angular/core@16 @angular/cli@16 @angular/cdk@16`; bump `zone.js` to `~0.13`; align the coupled libraries to their Angular-16-compatible versions (per the coupled-library policy).
- [x] 3.2 Apply manual items: update any `XhrFactory` / `TransferState` import paths; update the page-view tracking subscription typing now that `RouterEvent` is no longer part of the `Event` union (preserve observable behaviour — no `privacy-and-analytics` requirement change); remove any `entryComponents` usage.
- [x] 3.3 Gate: lint + `test:ci` + build pass.

## 4. Angular 16 → 17

- [x] 4.1 Run `ng update @angular/core@17 @angular/cli@17 @angular/cdk@17`; move to TypeScript `>=5.2 <5.3`; bump `zone.js` to `~0.14`; align the coupled libraries to their Angular-17-compatible versions (per the coupled-library policy).
- [x] 4.2 Apply manual items: ensure zone.js imports use `import 'zone.js';` / `import 'zone.js/testing';` (no deep `zone.js/dist/*` paths); move any removed Router class options to `RouterModule.forRoot`/`provideRouter`; review `REMOVE_STYLES_ON_COMPONENT_DESTROY` default and `NgSwitch` strict-equality impact.
- [x] 4.3 Staged CI Node bump: Angular 17 drops Node 16, so raise the pinned Node version in `.github/workflows/test.yml` and `.github/workflows/deploy-gh-page.yml` from `16.20.2` to a Node 18 LTS (`18.13.x`+) so the test gate stays green for this and subsequent steps; align `@types/node` to the new major and regenerate `package-lock.json`.
- [x] 4.4 Gate: lint + `test:ci` + build pass.

## 5. Angular 17 → 18

- [x] 5.1 Run `ng update @angular/core@18 @angular/cli@18 @angular/cdk@18`; move to TypeScript `>=5.4 <5.5`; align the coupled libraries to their Angular-18-compatible versions (per the coupled-library policy).
- [x] 5.2 ngx-bootstrap v18 breaking change: remove the four `.forRoot()` calls (`ButtonsModule`, `ModalModule`, `CollapseModule`, `TypeaheadModule`) from `app.module.ts` and adopt the standalone import style that v18 requires.
- [x] 5.3 Apply testing-API changes: replace `async` with `waitForAsync`; adjust specs affected by the new `ComponentFixture.whenStable`/`autoDetect`+`OnPush` semantics so they remain deterministic and green.
- [x] 5.4 Handle the `HttpClientModule` deprecation note (keep `HttpClientModule` working; optionally switch to `provideHttpClient()` only if low-risk) and the `AnimationDriver.matchesElement` removal if referenced.
- [x] 5.5 Gate: lint + `test:ci` + build pass.

## 6. Angular 18 → 19

- [x] 6.1 Run `ng update @angular/core@19 @angular/cli@19 @angular/cdk@19`; bump `zone.js` to `~0.15`; let the schematic backfill `standalone: false` on NgModule-declared components; align the coupled libraries to their Angular-19-compatible versions (per the coupled-library policy).
- [x] 6.2 Apply manual items: replace `browserTarget` with `buildTarget` in `angular.json` (if not auto-applied); remove the `e2e/` Protractor suite (support dropped); adjust any `effect()` timing in specs.
- [x] 6.3 When `ngx-toastr` is bumped to its `rxjs ≥ 7.8.2`-requiring version, raise `rxjs` to `~7.8`; align `@ngx-translate/core` + `http-loader`.
- [x] 6.4 Gate: lint + `test:ci` + build pass.

## 7. Angular 19 → 20

- [x] 7.1 Run `ng update @angular/core@20 @angular/cli@20 @angular/cdk@20`; move to TypeScript `>=5.8 <5.9`; align the coupled libraries to their Angular-20-compatible versions (per the coupled-library policy).
- [x] 7.2 Staged CI Node bump: Angular 20 requires Node ≥ 20.19, so raise the pinned Node version in `.github/workflows/test.yml` and `.github/workflows/deploy-gh-page.yml` to `20.19.x` (or `22.12.x`); align `@types/node` to the new major and regenerate `package-lock.json`.
- [x] 7.3 Apply testing-API changes: replace any `TestBed.get`→`TestBed.inject` and `flushEffects()`→`tick()`; confirm no specs rely on `ng-reflect-*` attributes (they should already read `debugElement.properties`); if any remain, add `provideNgReflectAttributes()` as a temporary fallback or migrate the assertion.
- [x] 7.4 Apply compiler changes: review templates for `in`/`void` operator usage and parenthesised nullish access; ensure uncaught listener/`AsyncPipe` errors don't destabilise tests.
- [x] 7.5 Gate: lint + `test:ci` + build pass.

## 8. Angular 20 → 21

- [x] 8.1 Run `ng update @angular/core@21 @angular/cli@21 @angular/cdk@21`; move to TypeScript `>=5.9 <6.0`; align the coupled libraries to their Angular-21-compatible versions, including `ngx-bootstrap@^21.2` (per the coupled-library policy).
- [x] 8.2 Confirm the schematic added `provideZoneChangeDetection()` to `AppModule.providers` (add it manually if not) and that `zone.js` remains in the polyfills — the app stays Zone-based, not zoneless.
- [x] 8.3 Handle ngx-bootstrap v21.2 signal inputs (`prop` → `prop()`) wherever ngx-bootstrap component inputs are read in templates/TS.
- [x] 8.4 Resolve any host-binding type errors surfaced by the now-default `typeCheckHostBindings` (with `strictTemplates: true`); use `"typeCheckHostBindings": false` only as a documented last resort.
- [x] 8.5 Apply remaining removals/migrations: `ApplicationConfig` import moved to `@angular/core`; `Router.lastSuccessfulNavigation` is now a signal; remove any `moduleId`/`interpolation`/`NgModuleFactory` usage.
- [x] 8.6 Gate: lint + `test:ci` + build pass.

## 9. ngx-bootstrap v21.2 zoneless-first compatibility verification (highest-risk integration)

- [x] 9.1 With `ngx-bootstrap@^21.2` installed (from step 8) and the four `.forRoot()` calls already removed (step 5), confirm `app.module.ts` uses the standalone import style and no `.forRoot()` remains.
- [x] 9.2 Verify modal (dialog), collapse, typeahead, and toast behaviour render and update correctly under `provideZoneChangeDetection()` despite ngx-bootstrap v21.2 being zoneless-first; add targeted change-detection nudges only if a regression is observed.
- [x] 9.3 Gate: lint + `test:ci` + build pass.

## 10. CI/CD and toolchain finalisation

- [x] 10.1 Confirm the pinned Node version in `.github/workflows/test.yml` and `.github/workflows/deploy-gh-page.yml` is on the Angular-21 range (`20.19.x`/`22.12.x`/`24.x`) after the staged bumps in steps 4 and 7, and that `@types/node` matches the CI Node major.
- [x] 10.2 Align the remaining dev tooling to the final toolchain: `@angular-eslint/*` + `@typescript-eslint/*` (confirm they were carried by each `ng update` step and are Angular-21-compatible), `@types/jasmine`→6 with `jasmine-core`@5, and `@vendure/ngx-translate-extract`→a version requiring `@angular/compiler >= 20`/TS ≥ 5.8 so `npm run i18n:extract` still works; regenerate `package-lock.json`.
- [x] 10.3 Update `AGENTS.md` / `TESTING.md` references to the Angular and Node versions if they state specific versions.
- [x] 10.4 Confirm `test.yml` (pull_request + reusable) and the `deploy-gh-page.yml` `needs: test` gate still pass end-to-end with the new Node version.

## 11. Verification

- [x] 11.1 Full suite green: `npm run lint`, `npm run test:ci` (coverage gate met, assertions/thresholds not weakened), and `npm run build` all pass on Angular 21.
- [x] 11.2 Confirm `package.json` contains no `@ctrl/ngx-rightclick` and the toolchain matches the `frontend-platform` spec (Angular 21, Node ≥ 20.19, TS ≥ 5.9, zone.js ~0.15, `:browser` builder, Karma+Jasmine).
- [x] 11.3 agent-browser smoke test of the running production-config app: homepage renders, navigate to a character board, play a sound button, and open the right-click context menu (copy link, conditional YouTube items, download, social share) — no console errors and behaviour matches pre-upgrade.
- [x] 11.4 Verify the deploy workflow produces the same `dist/sound-buttons` output structure (`index.html`/`404.html`, `.nojekyll`, `CNAME`).
