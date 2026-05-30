# Testing & Behaviour-Preservation Harness

This project carries an automated test harness whose purpose is **behaviour
preservation**. Each test pins the
*current* observable behaviour of the application (including a few known latent
quirks, which are called out in comments) so that any change in behaviour
is caught by a failing test.

## Running the tests

```bash
# Local interactive run (Chrome)
npm test

# Headless run with coverage + thresholds (CI parity).
# On Chromium-only hosts (e.g. Fedora Kinoite) point CHROME_BIN at chromium:
CHROME_BIN=$(which chromium-browser) npm run test:ci
```

- Headless execution uses the `ChromeHeadlessNoSandbox` launcher in
  `karma.conf.js` (base `ChromeHeadless` + `--no-sandbox --disable-gpu`). Karma
  resolves the browser binary from `CHROME_BIN`, so Google Chrome is not
  required.
- `npm run test:ci` enforces coverage thresholds: a **70%** global floor
  (statements/branches/functions/lines) plus stricter per-file floors for the
  behaviour-critical units (`context-menu`, `share.service`, `audio.service`,
  `config.service`, `upload.component`). The run fails if any threshold is unmet.

## Continuous integration gate

- `.github/workflows/test.yml` runs the headless suite on every `pull_request`
  to `master` and is exposed as a reusable workflow (`workflow_call`).
- `.github/workflows/deploy-gh-page.yml` calls that reusable workflow as a
  `test` job and gates the build/deploy job with `needs: test`, so deployment is
  blocked unless the suite passes. This covers **both** deploy triggers
  (`push: master` and `repository_dispatch: update_config`).
- Both workflows pin Node `20.19.0` (an Angular-21-verified version).

## Coverage snapshot

| Metric | Coverage |
| ------ | -------- |
| Statements | ~95% |
| Branches | ~80% |
| Functions | ~95% |
| Lines | ~95% |

(209 specs.) See `coverage/sound-buttons/` after a run for the full report.

## Spec → test traceability

Every OpenSpec capability under `openspec/specs/<capability>/spec.md` is mapped
below to the spec file(s) that cover its requirements. `describe`/`it` strings
mirror the OpenSpec `### Requirement:` / `#### Scenario:` names.

### audio-playback

| Requirement | Covering test(s) |
| ----------- | ---------------- |
| Sequential single-clip playback queue | `services/audio.service.spec.ts` |
| Per-button and global volume | `services/audio.service.spec.ts`, `audio-control/audio-control.component.spec.ts` |
| Stop all playback | `services/audio.service.spec.ts`, `audio-control/audio-control.component.spec.ts` |
| Shuffle playback | `audio-control/audio-control.component.spec.ts` |
| Playback side effects (counter and analytics) | `services/audio.service.spec.ts` |
| Synchronous queue state predicates | `services/audio.service.spec.ts`, `sound-buttons/sound-buttons.component.spec.ts` |

### audio-submission

| Requirement | Covering test(s) |
| ----------- | ---------------- |
| Submission form and required fields | `upload/upload.component.spec.ts` |
| Exactly one audio source | `upload/upload.component.spec.ts` |
| YouTube link and clip validation | `upload/upload.component.spec.ts` |
| Clip timing constraints | `upload/upload.component.spec.ts` |
| Uploaded file handling | `upload/upload.component.spec.ts` |
| Multipart submission and status polling | `upload/upload.component.spec.ts` |
| Submission result feedback | `upload/upload.component.spec.ts` |
| Post-submit redirect to live preview | `upload/upload.component.spec.ts` |
| Backend warm-up | `upload/upload.component.spec.ts` |

### character-board

| Requirement | Covering test(s) |
| ----------- | ---------------- |
| Board layout | `introduction/introduction.component.spec.ts` |
| Introduction panel | `introduction/introduction.component.spec.ts` |
| Introduction interactions | `introduction/introduction.component.spec.ts` |
| Scroll-to-top button | `scroll-to-top-button/scroll-to-top-button.component.spec.ts` |

### click-counter

| Requirement | Covering test(s) |
| ----------- | ---------------- |
| Reading the click count | `services/click.service.spec.ts` |
| Incrementing the click count | `services/click.service.spec.ts`, `services/audio.service.spec.ts` |
| Displaying the count | `footer/footer.component.spec.ts` |
| Not gated by privacy control | `services/audio.service.spec.ts`, `services/click.service.spec.ts` |

### configuration-loading

| Requirement | Covering test(s) |
| ----------- | ---------------- |
| Homepage overview configuration loading | `services/config.service.spec.ts` |
| Per-character full configuration loading | `services/config.service.spec.ts` |
| Domain model re-instantiation | `services/config.service.spec.ts`, `sound-buttons/Buttons.spec.ts`, `sound-buttons/ButtonGroup.spec.ts` |
| Live-update source switching | `services/config.service.spec.ts`, `header/header.component.spec.ts` |
| Active character name management | `services/config.service.spec.ts` |
| Multilingual and theme field resolution during load | `services/config.service.spec.ts` |

### content-routing-and-seo

| Requirement | Covering test(s) |
| ----------- | ---------------- |
| Route map | `app-routing.module.spec.ts` |
| Route parameter handling | `app-routing.module.spec.ts`, `container/container.component.spec.ts` |
| Deep link button modal | `container/container.component.spec.ts` |
| Homepage SEO meta tags | `home-page/home-page.component.spec.ts`, `services/seo.service.spec.ts` |
| Character and button SEO meta tags | `container/container.component.spec.ts`, `services/seo.service.spec.ts` |
| SEO service tag management | `services/seo.service.spec.ts` |

### homepage-overview

| Requirement | Covering test(s) |
| ----------- | ---------------- |
| Character card grid | `home-page/home-page.component.spec.ts` |
| Hover theming | `home-page/home-page.component.spec.ts` |
| Contribute card | `home-page/home-page.component.spec.ts` |
| Cycling character image | `chara-image/chara-image.component.spec.ts` |
| Homepage initialization | `home-page/home-page.component.spec.ts` |

### internationalization

| Requirement | Covering test(s) |
| ----------- | ---------------- |
| Browser language detection | `services/language.service.spec.ts` |
| Translation initialization | `app.component.spec.ts` |
| Multilingual object resolution | `services/language.service.spec.ts`, `services/config.service.spec.ts` |
| No in-app language switching | `services/language.service.spec.ts` |

### notifications-and-dialogs

| Requirement | Covering test(s) |
| ----------- | ---------------- |
| Toast notifications | `services/dialog.service.spec.ts`, `notifications-config.spec.ts` |
| Modal dialog channel | `services/dialog.service.spec.ts`, `dialog/dialog.component.spec.ts` |
| Modal rendering with HTML content | `dialog/dialog.component.spec.ts` |

### privacy-and-analytics

| Requirement | Covering test(s) |
| ----------- | ---------------- |
| Global Privacy Control opt-out | `analytics.bootstrap.spec.ts` |
| Non-production analytics stub | `analytics.bootstrap.spec.ts` |
| Production analytics loading | `analytics.bootstrap.spec.ts` |
| Analytics events | `app.component.spec.ts`, `container/container.component.spec.ts`, `services/audio.service.spec.ts` |

### right-click-context-menu

| Requirement | Covering test(s) |
| ----------- | ---------------- |
| Context menu trigger and context binding | `sound-buttons/context-menu/context-menu.component.spec.ts`, `sound-buttons/sound-buttons.component.spec.ts` |
| Menu open/close animation | `sound-buttons/context-menu/context-menu.component.spec.ts` |
| Closing behaviour after actions | `sound-buttons/context-menu/context-menu.component.spec.ts` |
| Always-available menu items | `sound-buttons/context-menu/context-menu.component.spec.ts` |
| Audio file download | `sound-buttons/context-menu/context-menu.component.spec.ts` |
| YouTube source items (conditional visibility) | `sound-buttons/context-menu/context-menu.component.spec.ts` |
| Social share items | `sound-buttons/context-menu/context-menu.component.spec.ts` |
| Menu DOM structure and class-based hiding | `sound-buttons/context-menu/context-menu.component.spec.ts` |

### sharing

| Requirement | Covering test(s) |
| ----------- | ---------------- |
| Copy button deep link | `services/share.service.spec.ts` |
| YouTube source link generation and copy | `services/share.service.spec.ts` |
| Social share deep-link encoding | `services/share.service.spec.ts` |
| Share to Mastodon and 𝕏 (Twitter) | `services/share.service.spec.ts`, `sound-buttons/context-menu/context-menu.component.spec.ts` |
| Share to Facebook | `services/share.service.spec.ts`, `sound-buttons/context-menu/context-menu.component.spec.ts` |

### sound-button-grid

| Requirement | Covering test(s) |
| ----------- | ---------------- |
| Grouped button rendering | `sound-buttons/sound-buttons.component.spec.ts` |
| Per-button grid column span | `sound-buttons/sound-buttons.component.spec.ts` |
| Text search/filter on button labels | `pipe/button-filter.pipe.spec.ts`, `sound-buttons/sound-buttons.component.spec.ts`, `header/header.component.spec.ts` |
| Table-of-contents navigation | `sound-buttons/sound-buttons.component.spec.ts` |
| Search state synced with URL | `services/display.service.spec.ts` |

### theming

| Requirement | Covering test(s) |
| ----------- | ---------------- |
| Color model and defaults | `services/color.service.spec.ts` |
| Applying theme colors as CSS variables | `services/color.service.spec.ts` |
| Resetting to the default theme | `services/color.service.spec.ts` |

## Shared test utilities

- `src/testing/fixtures.ts` — factory builders for the domain models
  (`makeButton`, `makeButtonGroupInstance`, `makeBriefConfig`, `makeFullConfig`,
  `makeColor`, `makeSource`, …).
- `src/testing/fakes.ts` — `FakeAudio` + `installFakeAudio`, `installGtagSpy`,
  `spyClipboard`, `spyWindowOpen`.
- `src/testing/angular.ts` — `translateTestingImports`, `makeDialogServiceSpy`.

## Known latent behaviours pinned by the harness

These are pre-existing quirks captured as current behaviour (not "fixed", to
avoid silently changing the live site):

- **`ConfigService.getConfig` intro resolution** mutates `source.intro` but
  returns the shallow-copied `target`, so the resolved multilingual string never
  reaches the returned config (the object is returned instead). This is
  externally observable (the returned config exposes the object), so it is pinned
  in `services/config.service.spec.ts`.
- **`download()` / `AudioService.play()`** ignore their returned promises, so a
  failed `fetch`/`play` has no error-handling or recovery path. The specs pin the
  *observable* consequence (the success toast + menu close fire up front and the
  queue state is unchanged) without depending on zone.js unhandled-rejection
  semantics, which differ across Angular versions.
