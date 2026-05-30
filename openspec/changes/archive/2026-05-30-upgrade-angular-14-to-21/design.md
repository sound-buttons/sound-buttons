## Context

Sound Buttons is an Angular 14 NgModule application (13 components, one already standalone). It is
years past Angular 14's end-of-life and depends on `@ctrl/ngx-rightclick@4`, which is npm-deprecated
and GitHub-archived (read-only since 2023-05) and was never published for Angular 15+. That library is
imported in five files (`app.module.ts`, `context-menu.component.ts`, `sound-buttons.component.ts`,
`audio-control.component.ts`, `introduction.component.ts`) and is therefore a hard blocker: Angular
cannot be updated past 14 while it remains.

A behaviour-preservation test harness already exists (`automated-test-harness`, Karma + Jasmine,
headless, ≥70% coverage gate, deploy-gating CI). This upgrade leans on that harness as the regression
safety net: the suite must stay green at every major-version step.

Current toolchain: Node pinned to 16.20.2 in CI, TypeScript ^4.8, zone.js ~0.11, RxJS ~6.6, webpack
`@angular-devkit/build-angular:browser` builder. Reference research:
`tmp/ANGULAR-UPGRADE-14-to-21.md` (per-version breaking-change inventory cross-checked against this
codebase).

## Goals / Non-Goals

**Goals:**
- Reach Angular 21 (latest) on a fully supported toolchain (Node ≥ 20.19, TS ≥ 5.9, zone.js ~0.15).
- Remove the abandoned `@ctrl/ngx-rightclick` dependency by re-implementing the right-click menu on
  Angular CDK Overlay with **behaviour parity** (verified by the harness).
- Preserve all observable application behaviour; the test suite passes at each step.
- Keep the test-gated GitHub Pages deployment working, with an Angular-21-compatible CI Node version.

**Non-Goals:**
- Migrating the build to the esbuild `application` builder (stays on webpack `:browser`).
- Migrating the test runner to Vitest (stays on Karma + Jasmine).
- Opportunistic refactors to standalone components, the new control-flow syntax (`@if`/`@for`), or
  signals beyond what `ng update` applies automatically (e.g. the `standalone: false` backfill).
- Server-side rendering, the esbuild/Vite dev server, or backend (Azure Functions) changes.

## Decisions

### Decision 1: Re-implement the context menu on Angular CDK Overlay (do this FIRST, on Angular 14)
The abandoned library is the gating dependency, so it is removed **before** touching Angular. The
replacement uses `@angular/cdk/overlay` (already transitively present via ngx-bootstrap, and added as a
direct dependency) to open a connected overlay at the cursor position on `contextmenu`, render the
existing Bootstrap dropdown markup, fade it with the existing 250ms opacity animation, and close it on
outside-click / action / Escape.

- **Why CDK over alternatives**: CDK Overlay is first-party, version-aligned with Angular through every
  step of the upgrade, well-tested, and gives full control over markup so the existing
  `context-menu.component.html` (and its `d-none` conditional hiding, divider structure, item labels,
  and `ShareService` wiring) is reused almost verbatim. Alternatives considered: (a) a third-party
  maintained context-menu package — rejected, swaps one external coupling for another and changes
  markup/behaviour; (b) forking and republishing `@ctrl/ngx-rightclick` — rejected, ongoing
  maintenance burden for a CDK-overlay wrapper we can own in ~150 lines.
- **Behaviour parity contract**: right-click opens the menu with the clicked button as context; the
  same items, conditional YouTube visibility, download flow (immediate toast + later anchor click), and
  social-share actions remain; every action closes the menu; the fade animation is preserved. This is
  exactly what the modified `right-click-context-menu` spec requires.

### Decision 2: Upgrade one major at a time with `ng update`, gating each step on the harness
Angular only supports sequential major upgrades. Each step runs
`ng update @angular/core@<n> @angular/cli@<n>` (plus aligned packages), then `npm run lint`,
`npm run test:ci`, and `npm run build` must all pass before proceeding. This keeps each diff small and
attributable and lets the harness localise any regression to a single major.

### Decision 3: Retain ZoneJS via `provideZoneChangeDetection()`
Angular 21 defaults to zoneless. Rather than take on a zoneless migration (high risk for a
ChangeDetectionStrategy.Default app using ngx-bootstrap, ngx-toastr, and RxJS subscriptions), the app
explicitly opts back into Zone-based change detection by adding `provideZoneChangeDetection()` to
`AppModule.providers` and keeping `zone.js` in `polyfills`. The `ng update` v21 migration applies this
automatically; the design ratifies it as the intended end state. Zoneless is left for a future change.

### Decision 4: Keep webpack `:browser` builder and Karma + Jasmine
Both remain supported in Angular 21. Migrating builders or test runners is orthogonal risk that would
muddy regression attribution during the upgrade and is explicitly deferred (see Non-Goals).

### Decision 5: Low-risk pre-work under Angular 14 before any `ng update`
Mechanical, framework-agnostic changes are landed first to shrink later diffs: fix the two
`import * as mime` sites to `mime` 4's default import, and apply RxJS 7-compatible operator/usage
adjustments. These compile under 14 and reduce churn during the version steps.

### Decision 6: Align framework-coupled libraries at the step where they require it
- `ngx-bootstrap` 9 → 21.2: remove `ButtonsModule/ModalModule/CollapseModule/TypeaheadModule.forRoot()`
  (v18 removed `.forRoot()`), adopt standalone imports, and handle v21.2 signal inputs
  (`prop` → `prop()`). Validate its zoneless-first build against our ZoneJS retention.
- `ngx-toastr` 15 → 20 (OnPush/zoneless-friendly; requires rxjs ≥ 7.8.2).
- `@ngx-translate/core` + `http-loader` 14 → 17 (backward compatible; `TranslateModule` retained).
- Test typings: `@types/jasmine` → 6 with `jasmine-core` 5; `@types/node` aligned to the CI Node major.

## Risks / Trade-offs

- **Context-menu behaviour drift after the library swap** → Re-use the existing template/markup and
  `ShareService` wiring unchanged; rely on the (rewritten, behaviour-focused) context-menu specs and
  their spec files in the harness to assert open/close, conditional visibility, every action, and the
  fade animation before the Angular bump begins.
- **ngx-bootstrap 21.2 is zoneless-first; we keep ZoneJS** → Treat as the highest-risk integration;
  verify modals/collapse/typeahead and toasts render and update with `provideZoneChangeDetection()` at
  the ngx-bootstrap upgrade step; the harness component specs cover the affected components.
- **Per-version testing-API breakage** (v18 `whenStable`/`async`→`waitForAsync`; v19 `effect()`/error
  rethrow; v20 `ng-reflect-*` removed, `TestBed.get`/`flushEffects` removed; v20+ uncaught listener
  errors rethrow) → Our specs already avoid `ng-reflect-*` (they read `debugElement.properties`) and
  pre-catch async rejections; remaining adjustments are applied at the step that introduces them, with
  `provideNgReflectAttributes()` available as a temporary fallback if needed.
- **`RouterEvent` no longer in the `Event` union (v16)** affects the page-view tracking subscription's
  typing → Update the cast/type-guard; observable behaviour (page_view per de-duplicated URL) is
  preserved, so `privacy-and-analytics` requirements do not change.
- **Protractor e2e removed in v19** → The `e2e/` Protractor setup is not part of the gating suite;
  if present it is removed or left non-blocking (e2e is out of scope for the deploy gate).
- **v21 host-binding type checking on by default** with `strictTemplates: true` → Fix any surfaced
  host-binding type errors; `"typeCheckHostBindings": false` is the documented escape hatch if a fix is
  non-trivial.
- **CI Node bump** from 16.20.2 → Angular-21 range may interact with `npm ci`/lockfile → Regenerate the
  lockfile as part of the toolchain bump and confirm `test.yml` + the deploy build both pass.

## Migration Plan

1. **Pre-work (Angular 14):** add `@angular/cdk` as a direct dependency; re-implement the context menu
   on CDK Overlay and delete `@ctrl/ngx-rightclick`; fix `mime` imports; apply RxJS-7-ready usage
   changes. Gate: lint + `test:ci` + build green on 14.
2. **Sequential `ng update` 14→15→16→17→18→19→20→21.** At each major: run the schematic, align the
   coupled libraries due at that step, fix manual items flagged in the research doc, then gate on
   lint + `test:ci` + build before continuing.
3. **Finalise platform:** TypeScript ≥ 5.9, zone.js ~0.15, `provideZoneChangeDetection()` confirmed in
   `AppModule`, host-binding type errors resolved.
4. **CI:** bump pinned Node in `test.yml` and `deploy-gh-page.yml` to the Angular-21 range; regenerate
   the lockfile; confirm the test gate and GitHub Pages deploy succeed.
5. **Verify:** full harness green, coverage gate met, `npm run build` succeeds, and an agent-browser
   smoke test of the running production-config app (homepage, character board, play a button,
   right-click menu) shows no regressions.

**Rollback:** the work lands on a branch; each major-version step is a discrete commit, so any failing
step can be reverted to the last green major without abandoning earlier progress.

## Open Questions

- Does `ngx-bootstrap` 21.2's zoneless-first build fully cooperate with `provideZoneChangeDetection()`,
  or are targeted `markForCheck()`/`ApplicationRef.tick()` nudges needed for modal/typeahead updates?
  (Resolve empirically at the ngx-bootstrap upgrade step.)
- Is any `e2e/` Protractor suite still present and worth migrating (to Playwright/Cypress), or simply
  removed given it is not part of the deploy gate? (Confirm during pre-work.)
