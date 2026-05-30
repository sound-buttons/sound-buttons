# Sound Buttons — AI Agent Instructions

## Project Overview

Sound Buttons is a VTuber soundboard web application. It lets fans play short
audio clips ("sound buttons") for their favorite streamers and submit new clips
through an online upload flow that accepts YouTube videos, YouTube/Twitch clip
URLs, or direct audio/video file uploads, generating buttons automatically.

- **Live site**: <https://sound-buttons.click>
- **License**: AGPL-3.0-or-later (see `LICENSE`)
- **Architecture highlight — data separation**: All button content lives in JSON
  configuration files under `src/assets/configs` (a git submodule). Adding or
  updating characters and buttons usually requires only JSON edits, no code
  changes.

## Tech Stack

- **Framework**: Angular 21 (`@angular/*` `^21.2.0`) with TypeScript `^5.9.0`
- **UI**: Bootstrap 5 (`bootstrap` `^5.3.8`), `ngx-bootstrap` `^21.2`,
  `bootstrap-icons`, `ngx-toastr` for toasts, a CDK Overlay based directive for the
  right-click context menu, `tocbot` for table-of-contents
- **i18n**: `@ngx-translate/core` + `@ngx-translate/http-loader`
- **Styling**: SCSS (component styles and global `src/styles.scss`); a Bootswatch
  theme lives in `src/assets/style/`
- **Reactive**: RxJS `~7.8`
- **Build/test tooling**: Angular CLI 21, ESLint + Prettier, Karma + Jasmine,
  `ts-node` (for the env config script), `wrangler` (Cloudflare Worker)
- **Backend (separate repos)**: Azure Functions API; audio stored in Azure Blob
  Storage. Hosting: GitHub Pages + Cloudflare Workers.

## Repository Structure

```text
src/
  app/
    analytics.bootstrap.ts        # Third-party analytics bootstrap (GPC-gated)
    app.module.ts                 # Root module; calls bootstrapAnalytics in ctor
    app-routing.module.ts         # Routes: '', ':name', ':name/upload', ':name/:id'
    environment.token.ts          # EnvironmentToken InjectionToken (avoids import cycle)
    services/                     # audio, click, color, config, dialog,
                                  #   display, language, seo, share
    sound-buttons/                # Buttons.ts, ButtonGroup.ts, component,
                                  #   context-menu/
    header/ footer/ container/ home-page/ upload/ dialog/
    introduction/ audio-control/ chara-image/ scroll-to-top-button/
    pipe/                         # button-filter.pipe.ts
  testing/                        # Shared spec helpers: angular.ts, fakes.ts, fixtures.ts
  assets/
    configs/                      # git SUBMODULE: per-character JSON configs (+ main.json)
    i18n/                         # zh.json, ja.json
    img/ style/ sound/
  environments/                   # environment.ts (dev), environment.prod.ts (generated)
  index.html  main.ts  styles.scss  staticwebapp.config.json
worker/worker.js                  # Cloudflare Worker (caching/edge logic)
write-production-config.ts        # Generates environment.prod.ts from env vars at build
openspec/                         # OpenSpec specs + change proposals (see below)
.github/workflows/                # test.yml, deploy-gh-page.yml,
                                  #   deploy-cloudflare-worker.yml, codeql.yml
karma.conf.js  angular.json  .eslintrc.json  TESTING.md  README.md
```

## Build / Dev / Test / Lint Commands

| Command | Purpose |
| ------- | ------- |
| `npm start` | Dev server (`ng serve`, http://localhost:4200) |
| `npm run start_ssl` | Dev server over SSL |
| `npm run build` | Runs `npm run config` then `ng build --configuration production` |
| `npm run config` | Generates `src/environments/environment.prod.ts` via `write-production-config.ts` (ts-node) |
| `npm test` | Interactive unit tests (`ng test`, Chrome) |
| `npm run test:ci` | Headless single run with coverage + thresholds (`ChromeHeadlessNoSandbox`) |
| `npm run lint` | ESLint (`ng lint`) |
| `npm run i18n:extract` | Extract translation strings into `src/assets/i18n/ja.json` |
| `npm run worker_deploy` | Deploy the Cloudflare Worker via wrangler |

### First-time setup

```bash
git submodule update --init --recursive   # REQUIRED: src/assets/configs is a submodule
npm install
```

The configs submodule (`https://github.com/sound-buttons/sound-buttons_configs.git`)
tracks the `minify` branch; CI checks it out to `minify` before building/testing.
When editing character/button content under `src/assets/configs`, also read that
submodule's own `src/assets/configs/AGENTS.md` — it has config-specific JSON
schema and content conventions.

`ng serve` uses `proxy.conf.mjs` (wired via `angular.json`) to proxy `/api` and
`/runtime` to a local Azure Functions host at `http://localhost:7071` and rewrite
callback URLs — relevant when working on `UploadComponent` or backend integration.

## Coding Conventions

- **In-code comments and documentation should be written in English.** This is a
  forward-looking convention: existing Traditional Chinese comments in some files
  are legacy and do not need translation unless you are already editing them for
  clarity.
- **ESLint + Prettier**: extends `eslint:recommended`,
  `@angular-eslint/recommended`, `@typescript-eslint/recommended`, and
  `prettier`. Run `npm run lint` before finishing.
- **Selectors**: component selector prefix `app` (kebab-case element), directive
  prefix `app` (camelCase attribute).
- **Styles**: SCSS per component.
- **Interfaces** are prefixed with `I` (e.g. `IButton`, `IButtonGroup`,
  `IConfig`, `IFullConfig`, `ISource`, `ILink`, `IColor`). **Classes** use
  PascalCase (e.g. `Button`, `ButtonGroup`).
- Prefer Angular CLI schematics for generating components/services.
- Use dependency injection and RxJS observables for async work.

## Key Domain Interfaces

`src/app/sound-buttons/Buttons.ts`:

```typescript
interface IButton {
  id: string;
  filename: string;
  text: string | never;     // may be a multi-language object, resolved via LanguageService
  baseRoute: string;
  volume: number;
  source?: ISource;         // { videoId, start, end }
  SASToken?: string;
  index?: number;
}
```

`src/app/sound-buttons/ButtonGroup.ts`: `IButtonGroup { name, baseRoute, buttons }`.

`src/app/services/config.service.ts`:

```typescript
interface IConfig {
  name: string | never;
  fullName: string;
  imgSrc: string | string[];
  fullConfigURL: string;
  liveUpdateURL: string;
  color?: IColor;
}
interface IFullConfig extends IConfig {
  buttonGroups?: IButtonGroup[];
  link?: ILink;             // youtube/twitch/twitter/facebook/instagram/discord/other
  intro: string | never;
  introButton?: IButton;
}
```

`ConfigService` loads `assets/configs/main.json` (brief list), then the selected
character's full config. It supports a **live-update** mode (`liveUpdateURL`)
toggled via the `isLiveUpdate` flag (e.g. `?liveUpdate=1`) without a page reload.

## Internationalization

- Languages: `zh` (Traditional Chinese, default) and `ja` (Japanese).
- Translation files: `src/assets/i18n/zh.json`, `ja.json`.
- `defaultLanguage: 'zh'` configured in `AppModule`.
- Multi-language text in configs is resolved via
  `LanguageService.GetTextFromObject`.

## Environment Configuration (generated file)

- `src/environments/environment.prod.ts` is **gitignored** and **generated at
  build time** by `write-production-config.ts` from environment variables:
  `GA_TRACKING_ID`, `ORIGIN`, `API`, `VERSION`, `CLARITY_TRACKING_ID`,
  `CLOUDFLARE_RUM_TOKEN`.
- The environment object is provided through DI via `EnvironmentToken`
  (`src/app/environment.token.ts`), which lives in its own module to avoid an
  import cycle with `app.module`.

## Analytics & Privacy (important gotcha)

`src/app/analytics.bootstrap.ts` exports `bootstrapAnalytics(env, win, doc, nav)`,
invoked from the `AppModule` constructor. Behavior:

- **Global Privacy Control (GPC) enabled** (`navigator.globalPrivacyControl`):
  installs a no-op `gtag` and injects **nothing**.
- **Non-production**: installs a debug `gtag` and injects nothing.
- **Production only**: injects Cloudflare RUM (when `CLOUDFLARE_RUM_TOKEN` is
  set), then Google Analytics and Microsoft Clarity using the configured IDs.

The function takes injectable `window`/`document`/`navigator`/`env` doubles so it
can be unit-tested in isolation. A static GPC signal is also served at
`src/.well-known/gpc.json`.

## Testing

- **Stack**: Karma + Jasmine. Specs are colocated as `*.spec.ts`.
- **Shared helpers** in `src/testing/`:
  - `angular.ts` — `translateTestingImports()`, `makeDialogServiceSpy()`, etc.
  - `fakes.ts` — hermetic doubles for browser globals/media (e.g. `FakeAudio`).
  - `fixtures.ts` — pure factory builders for domain models
    (`makeButton`, `makeButtonGroupInstance`, `makeBriefConfig`,
    `makeFullConfig`, `makeColor`, …).
- **Headless / CI**: `npm run test:ci` runs once with coverage using the
  `ChromeHeadlessNoSandbox` launcher (base `ChromeHeadless` + `--no-sandbox
  --disable-gpu`). Karma resolves the browser binary from `CHROME_BIN`, so a
  Chromium-only host works:
  `CHROME_BIN=$(which chromium-browser) npm run test:ci`.
- **Coverage gate** (`karma.conf.js`): **70%** global floor for
  statements/branches/functions/lines, plus stricter per-file overrides for
  behaviour-critical units (`context-menu.component`, `share.service`,
  `audio.service`, `config.service`, `upload.component`). The run fails if a
  threshold is unmet.
- `TESTING.md` documents the behaviour-preservation harness and spec → test
  traceability.

## CI/CD

- **`.github/workflows/test.yml`** — headless suite with coverage. Runs on
  `pull_request` to `master` and is exposed as a reusable workflow
  (`workflow_call`). Initializes the configs submodule to `minify`, uses Node
  `20.19.0`, `npm ci`, then `npm run test:ci`.
- **`.github/workflows/deploy-gh-page.yml`** — triggered by `push: master` and
  `repository_dispatch: update_config`. Calls `test.yml` as a `test` job and
  gates the build with `needs: test`. Builds with secrets injected as env vars,
  then deploys `dist/sound-buttons` to the `gh-pages` branch (adds `.nojekyll`,
  `CNAME`, copies `index.html` → `404.html`).
- **`.github/workflows/deploy-cloudflare-worker.yml`** — deploys `worker/worker.js`.
- **`.github/workflows/codeql.yml`** — security scanning.

## OpenSpec Workflow (project convention)

This project uses **OpenSpec** (`openspec/`, schema `spec-driven`) for
spec-driven development:

- `openspec/specs/` holds the current capability specifications (e.g.
  `audio-playback`, `audio-submission`, `character-board`, `click-counter`,
  `configuration-loading`, `content-routing-and-seo`, `homepage-overview`,
  `internationalization`, `notifications-and-dialogs`, `privacy-and-analytics`,
  `right-click-context-menu`, `sharing`, `sound-button-grid`, `theming`,
  `automated-test-harness`).
- `openspec/changes/` holds active proposals; applied changes are moved to
  `openspec/changes/archive/`.
- When making non-trivial behavioral changes, prefer creating/updating an
  OpenSpec change proposal (proposal/design/tasks/spec deltas) and keep the
  specs in `openspec/specs/` in sync with the implementation.

## Related Repositories

| Repository | Purpose |
| ---------- | ------- |
| `sound-buttons/sound-buttons` | Frontend (this repo) |
| `sound-buttons/sound-buttons_configs` | JSON configuration data (submodule, `minify` branch) |
| `sound-buttons/sound-buttons_upload-backend` | Azure Functions backend |
| `sound-buttons/worker-click-counter` | Cloudflare Worker for click counting |

## Gotchas Checklist

- Initialize submodules (`git submodule update --init --recursive`) or
  `src/assets/configs` (and `main.json`) will be missing. That submodule has its
  own `AGENTS.md` with config-specific rules.
- Never commit `src/environments/environment.prod.ts`; it is generated.
- Analytics is disabled under GPC and in non-production — verify the right code
  path when touching `analytics.bootstrap.ts`.
- For headless tests on Chromium-only hosts, set `CHROME_BIN`.
- Keep all in-code comments and documentation in **English**.
- Run `npm run lint` and `npm run test:ci` before considering a change complete;
  do not lower the coverage thresholds.
