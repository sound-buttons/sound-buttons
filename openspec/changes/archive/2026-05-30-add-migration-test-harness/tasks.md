## 1. Test tooling & headless execution

- [x] 1.1 Add a `ChromeHeadlessNoSandbox` custom launcher in `karma.conf.js` (base `ChromeHeadless`, flags `--no-sandbox`, `--disable-gpu`, `--headless`); keep `browsers: ['Chrome']` as the local default.
- [x] 1.2 Ensure Karma honors `process.env.CHROME_BIN` so Chromium-only environments can run the suite.
- [x] 1.3 Add `coverage` to the active `reporters` list and keep `html` + `text-summary` coverage reports; confirm the coverage dir `./coverage/sound-buttons`.
- [x] 1.4 Add an `npm` script `test:ci` = `ng test --watch=false --code-coverage --browsers=ChromeHeadlessNoSandbox` (do not change the default `test` script).
- [x] 1.5 Establish a green baseline before writing real tests: fix the pre-existing compile breakages that currently make `ng test` build nothing — declare the `gtag` global (ambient `.d.ts`) for `audio.service.ts` and correct the `SeoService`→`SEOService` import in `seo.service.spec.ts` — then verify the suite runs headlessly to completion locally (`CHROME_BIN=$(which chromium-browser) npm run test:ci`) with the current stubs.

## 2. Shared test utilities & fixtures

- [x] 2.1 Create a test helpers module: factory builders for `IButton`/`Button`, `IButtonGroup`/`ButtonGroup`, `IConfig`/`IFullConfig`, `IColor`, `ISource` (valid + edge-case variants).
- [x] 2.2 Add reusable fakes/spies: `navigator.clipboard.writeText`, `window.open`, global `fetch`, a fake `HTMLAudioElement` (controllable `play`/`pause`/`ended`), and a `gtag` spy.
- [x] 2.3 Add a `TranslateModule` test setup (static loader or `TranslateTestingModule`) and a `HttpClientTestingModule` setup helper.
- [x] 2.4 Add a `DialogService` test double (spies on `toastSuccess/Error/Warning/Pending`, `disablePending`, `showModal`).

## 3. Models & pipes (unit) — configuration-loading, sound-button-grid

- [x] 3.1 `Buttons.spec.ts`: `Button` defaults (text=filename, baseRoute=`assets/sound/`, volume=1, SASToken=''), and base-route handling. (configuration-loading)
- [x] 3.2 `ButtonGroup.spec.ts`: group base-route propagation with trailing `/` to child buttons whose baseRoute is empty/default. (configuration-loading)
- [x] 3.3 `button-filter.pipe.spec.ts` (replace stub): case-sensitive substring match on `text`, empty-term keeps all, group objects retained even when emptied. (sound-button-grid)
- [x] 3.4 `app-routing.module.spec.ts` (NEW): assert the route map (`''`→Home, `:name`→Container, `:name/upload`→Upload, `:name/:id`→Container) and that no wildcard/redirect route is defined. (content-routing-and-seo)

## 4. Services (unit)

- [x] 4.1 `config.service.spec.ts` (replace stub): `getBriefConfig` GET to `assets/configs/main.json` with `Cache-Control: max-age=0`; the alternate `getBriefConfig(url)` overload fetches the supplied URL; `getConfig` URL resolution; `undefined` on unresolved name; `Button`/`ButtonGroup`/`introButton` re-instantiation; multilingual `intro` resolution; `color` applied; `isLiveUpdate` selects `liveUpdateURL`, reflects the `liveUpdate` query-param presence, and reloads on toggle; `name` setter reload; reset/no-config path and `reloadConfig` throws `No config received.`. (configuration-loading)
- [x] 4.2 `audio.service.spec.ts` (replace stub): `add` builds Audio from `baseRoute+filename+SASToken`, clones button, monotonic index, effective volume `min(1, volume*nowVolume)`, no auto-start; `ended` removes by index, plays next or stops, fires `StepClicks` + `sound_play`/`sound_play_count`; `stop` clears queue/state; predicate getters; shuffle excludes 大叫/悲鳴/自肥 (stub `random.int` and assert set membership/exclusions, never exact order); preservation test for a rejected `HTMLAudioElement.play()` documenting current behavior (no auto-recovery). Use fake audio + jasmine clock. (audio-playback, click-counter, privacy-and-analytics)
- [x] 4.3 `share.service.spec.ts` (NEW): `copyLink` raw-id URL + clipboard + toast; `generateYoutubeLink` (`youtu.be/<id>?t=floor(start)`, `undefined` when no source); `copyYoutubeLink`; Mastodon/𝕏 text (`#sound_buttons #<fullName>`, `%0A`, encoded url) including the `+`/`??` precedence producing `#undefined` when no fullName; `encodeURI(button.id)` for social vs raw for copyLink; Facebook URL has no share-text. Spy `window.open`/clipboard. (sharing, right-click-context-menu)
- [x] 4.4 `click.service.spec.ts` (NEW): `GetClicks` GET to `https://view-counter.sound-buttons.click` emits via `UpdateClicks`; `StepClicks` POST emits updated count; constructor triggers initial read. Use `HttpClientTestingModule`. (click-counter)
- [x] 4.5 `color.service.spec.ts` (replace stub): default color; `color` setter writes `--bs-primary`/`--bs-secondary` on `documentElement`; `resetColor`. (theming)
- [x] 4.6 `language.service.spec.ts` (replace stub): `BrowserLanguage` first-subtag mapping (`zh-TW`→zh, `ja-JP`→ja, default zh); `GetTextFromObject` match + first-key fallback; assert there is NO in-app language-switching API (language is derived once from the browser). (internationalization)
- [x] 4.7 `seo.service.spec.ts` (replace stub): `setTitle`/`setDescription`/`setUrl`/`setImage` set the correct `<title>`, OG/Twitter/canonical tags. (content-routing-and-seo)
- [x] 4.8 `display.service.spec.ts` (replace stub): `setFilterText` no-op on unchanged, navigates merging `filter` query param (null when empty), emits `OnConfigChanged`; init from `queryParams`. (sound-button-grid)
- [x] 4.9 `dialog.service.spec.ts` (replace stub): pending returns id & `disablePending` clears when `>0`; success/error/warning timeout handling; `showModal`/`onHideModal` emitters. (notifications-and-dialogs)
- [x] 4.10 Verify the default `ToastrModule.forRoot` configuration (position/timeout/options) wired in `app.module` matches the documented notification defaults. (notifications-and-dialogs)

## 5. Migration-critical components (integration) — exhaustive

- [x] 5.1 `context-menu.component.spec.ts` (replace stub): context bound from `menuPackage.context`; always-present 複製按鈕網址 + 下載; YouTube divider/複製 Youtube 網址/在 Youtube 上觀看 hidden via `d-none` when no `source.videoId`, shown otherwise; each action delegates to the right `ShareService`/open method and calls `close()` (`closeAll`); `download` dispatches `fetch(baseRoute+filename+SASToken)`, shows `已開始下載` toast + closes immediately (before fetch resolves), builds Blob with `mime.getType(filename) ?? response.type`, clicks anchor with `download=filename`; Bootstrap markup classes (`dropdown-menu show`, `dropdown-item`, `dropdown-divider`); fade animation trigger present. (right-click-context-menu, sharing)
- [x] 5.2 Verify the menu trigger wiring is covered from each host: sound-button grid, audio-control queued chips, and introduction sample button (`[contextMenuTrigger]="menu"` + `[menuContext]`). (right-click-context-menu)

## 6. Components (integration)

- [x] 6.1 `sound-buttons.component.spec.ts` (replace stub): renders groups as cards, buttons reversed, empty group cards hidden, no-results alert `沒有符合條件的按鈕`; `gridColumnLen` clamps [10,50]; click → `audioService.add` + conditional `play`; right-click wiring; TOC init/refresh via tocbot (spy). (sound-button-grid, audio-playback)
- [x] 6.2 `upload.component.spec.ts` (replace stub): required `nameZH`/`group`; exactly-one-source rule (0/2+ invalid); YouTube/clip regex; start/end constraints (negative start, end>start, ≤180s); file size (>30MB) & type rejection with toasts; duration→`patchEnd`; `FormData` assembly incl. `directory`/`volume`/`toastId`/`[useSTT]` AND assert NO forbidden fields (e.g. SAS token / captcha) are present; POST to `${api}/sound-buttons`; missing poll URI error; the `output: false` backend failure path surfaces an error toast and does NOT reset/redirect; status-based error toasts (400/0/408/500/default); success → reloadConfig; post-submit reset + redirect with `liveUpdate=1`; `healthz` warm-up. Use `fakeAsync` for polling. (audio-submission)
- [x] 6.3 `container.component.spec.ts` (replace stub): renders only when `config`; audio-control & scroll-to-top render regardless; `name` param default `template`; `upload` excluded from button guid; deep-link modal open by id/`.webm` filename + `setMeta` + `sound_play`; modal content audio (`mime ?? audio/webm`) + sandboxed iframe when videoId; URL cleanup on hide. (content-routing-and-seo, privacy-and-analytics)
- [x] 6.4 `home-page.component.spec.ts` (replace stub): renders a card per brief config with routerLink `['/', name]`, image, fullName; color background block when `color`; hover applies/reverts theme; fixed contribute card link; init loads `configs$`, resets config, sets SEO, clears filter. (homepage-overview)
- [x] 6.5 `chara-image.component.spec.ts` (replace stub): string vs array handling (`.png` stripped); `<picture>` avif/webp/png sources; multi-image cycling every 4000ms with `.back` class (jasmine clock). (homepage-overview)
- [x] 6.6 `introduction.component.spec.ts` (replace stub): conditional social-link icons; intro via `[innerHTML]`; sample button hidden under `liveUpdate=1`; sample-button click → add+play; expand toggle scroll; reloadConfig. (character-board)
- [x] 6.7 `scroll-to-top-button.component.spec.ts` (NEW): visible only when `window.scrollY > 300`; click smooth-scrolls to top; `@Input() bottom`. (character-board)
- [x] 6.8 `audio-control.component.spec.ts` (replace stub): volume slider (default 0.5, min0/max1/step0.01, 0→0.0001) updates `nowVolume`; pause/play/stop controls reflect predicates; queued-button chips render with context-menu triggers; shuffle shown only when `isEmpty()` and excludes 大叫/悲鳴/自肥. (audio-playback)
- [x] 6.9 `header.component.spec.ts` (replace stub): typeahead over all button texts; `setFilterText` on change/enter/select; clear resets; filter hidden on `upload` path; `setLiveUpdate` navigation; nav links 投稿/待審核預覧/回正式版 visibility. (sound-button-grid, configuration-loading)
- [x] 6.10 `footer.component.spec.ts` (replace stub): subscribes `UpdateClicks` and renders `Total {{clicks}} Clicks` (placeholder `?????`); badge warning toast; AGPL modal emit; version link slice/upper. (click-counter)
- [x] 6.11 `dialog.component.spec.ts` (replace stub): `showModal` opens modal, message rendered via `bypassSecurityTrustHtml` into `[innerHTML]`; `onHidden` emits `onHideModal`. (notifications-and-dialogs)
- [x] 6.12 `app.component.spec.ts` (extend stub): translate `setDefaultLang('zh')` + `use(BrowserLanguage)` with `zh` fallback on error; router events de-duped by url emit `gtag('page_view')` (no NavigationEnd filter). (internationalization, privacy-and-analytics)

## 7. Privacy & analytics (unit/integration) — privacy-and-analytics

- [x] 7.1 Test the GPC path: when `navigator.globalPrivacyControl` is true, `gtag` becomes a no-op and neither GA nor Clarity scripts are injected (assert no script tags added / spy injection helper).
- [x] 7.2 Test the non-production stub path (`environment.production=false`) installs a debug `gtag` and skips real analytics; assert click-counter still operates regardless of GPC. Refactor the analytics bootstrap into a testable unit if needed to avoid testing `app.module` constructor directly.
- [x] 7.3 Test the production analytics-loading path (`environment.production=true`, GPC absent): GA and Microsoft Clarity scripts are injected using the configured `GA_TRACKING_ID`/`CLARITY_TRACKING_ID`, and `gtag` is the real implementation. Drive via the extracted bootstrap unit with injected env/document/navigator/window. (privacy-and-analytics)

## 8. Coverage enforcement

- [x] 8.1 Once the suite covers all 14 capabilities, add `coverageReporter.check.global` thresholds at 70% (statements, lines, functions, branches) in `karma.conf.js`.
- [x] 8.1a Add per-file/glob minimums via `coverageReporter.check.each` (or `overrides`) for the migration-critical files (`context-menu`, `share.service`, `audio.service`, `config.service`, `upload.component`) set well above the global floor so the 70% number cannot be satisfied by low-value tests.
- [x] 8.2 Run `npm run test:ci` and confirm the suite passes with coverage ≥70%; raise weak areas (esp. migration-critical files well above the floor) until green.
- [x] 8.3 Confirm a deliberate sub-threshold run fails (sanity-check the gate actually blocks).

## 9. CI test gate

- [x] 9.1 Add a reusable test job (`workflow_call`) or a `.github/workflows/test.yml` triggered on `pull_request` and `push: master`: `ubuntu-latest`, `actions/checkout@v4` with submodules (or `git submodule update --init` like deploy), `actions/setup-node` pinned to a conservative Angular-14-verified version (**target Node `16.20.x`**), `npm ci`, then `npm run test:ci` (Chrome preinstalled on the runner; `--no-sandbox`).
- [x] 9.2 Gate deployment on tests with a **mechanically real** dependency (cross-workflow `needs:` is NOT supported): either move the test job into `deploy-gh-page.yml` so the build/deploy job uses `needs: test`, OR call a shared reusable workflow from both PR and deploy, OR trigger deploy via `workflow_run` only on a successful test run. The gate MUST cover BOTH deploy triggers (`push: master` and `repository_dispatch: update_config`).
- [x] 9.3 Pin the same Node `16.20.x` in `deploy-gh-page.yml` (add `actions/setup-node`) for consistency between test and deploy; verify `npm ci` + `npm run build` succeed on that version before adopting it.

## 10. Traceability & verification

- [x] 10.1 Produce a spec→test traceability map (table or `TESTING.md`) linking each OpenSpec `### Requirement:` across all 14 capabilities to its covering test(s); mirror scenario names in `describe/it` strings.
- [x] 10.2 Audit that every requirement is covered; fill any gaps with additional tests.
- [x] 10.3 Run `npm run lint` and `npm run test:ci` clean; verify CI is green on a test PR and that the deploy gate behaves as specified.
- [x] 10.4 Validate the change with `openspec validate --change add-migration-test-harness --strict`.
