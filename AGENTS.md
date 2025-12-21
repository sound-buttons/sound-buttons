# Sound Buttons - AI Agent Instructions

## Project Overview

Sound Buttons is a web application that provides sound button functionality for VTuber fans. The project features an online audio submission system that automatically clips YouTube audio and generates buttons. It uses a data separation architecture where content updates can be made by simply modifying JSON configuration files.

**Live Site**: <https://sound-buttons.click>

## Technology Stack

- **Frontend**: Angular 14 with TypeScript
- **UI Framework**: Bootstrap 5, ngx-bootstrap
- **Styling**: SCSS
- **Backend**: Azure Functions (separate repository)
- **Storage**: Azure Blob Storage
- **Hosting**: GitHub Pages, Cloudflare Workers
- **License**: AGPLv3

## Project Structure

```text
sound-buttons/
├── src/
│   ├── app/                          # Angular application
│   │   ├── services/                 # Angular services
│   │   │   ├── audio.service.ts      # Audio playback queue management
│   │   │   ├── config.service.ts     # Configuration loading and management
│   │   │   ├── color.service.ts      # Theme color management
│   │   │   ├── language.service.ts   # i18n language handling
│   │   │   ├── dialog.service.ts     # Modal and toast notifications
│   │   │   ├── share.service.ts      # URL sharing functionality
│   │   │   └── click.service.ts      # Click counter integration
│   │   ├── sound-buttons/            # Sound button components
│   │   │   ├── Buttons.ts            # Button interface and class
│   │   │   ├── ButtonGroup.ts        # Button group interface
│   │   │   └── context-menu/         # Right-click context menu
│   │   ├── upload/                   # Audio upload component
│   │   ├── container/                # Main container component
│   │   ├── header/                   # Header component
│   │   ├── footer/                   # Footer component
│   │   ├── introduction/             # Introduction section
│   │   ├── audio-control/            # Audio playback controls
│   │   ├── pipe/                     # Angular pipes
│   │   ├── app.module.ts             # Root module
│   │   ├── app-routing.module.ts     # Routing configuration
│   │   └── app.component.ts          # Root component
│   ├── assets/
│   │   ├── configs/                  # JSON configuration files (git submodule)
│   │   ├── i18n/                     # Translation files (zh.json, ja.json)
│   │   ├── img/                      # Images and icons
│   │   └── style/                    # Global SCSS styles
│   ├── environments/                 # Environment configurations
│   └── index.html                    # Main HTML entry point
├── worker/                           # Cloudflare Worker scripts
├── e2e/                              # End-to-end tests (Protractor)
├── .github/
│   └── workflows/                    # GitHub Actions CI/CD
├── angular.json                      # Angular CLI configuration
├── package.json                      # npm dependencies
├── tsconfig.json                     # TypeScript configuration
└── .eslintrc.json                    # ESLint configuration
```

## Build and Development Commands

### Prerequisites

- Node.js (compatible with Angular 14)
- npm
- Git (for submodules)

### Initial Setup

```bash
# Clone with submodules
git clone --recurse-submodules <repo-url>

# Or initialize submodules after clone
git submodule update --init --recursive

# Install dependencies
npm install
```

### Development

```bash
# Start development server (http://localhost:4200)
npm start

# Start with SSL
npm run start_ssl
```

### Build

```bash
# Production build (includes environment config generation)
npm run build
```

### Testing

```bash
# Run unit tests
npm test

# Run e2e tests
npm run e2e
```

### Linting

```bash
# Run ESLint
npm run lint
```

### i18n

```bash
# Extract translation strings
npm run i18n:extract
```

## Coding Conventions

### TypeScript/Angular

- Use Angular CLI schematics for generating components, services, etc.
- Component selector prefix: `app-` (kebab-case for elements)
- Directive selector prefix: `app` (camelCase for attributes)
- Use SCSS for component styles
- Follow Angular style guide and ESLint rules defined in `.eslintrc.json`

### File Naming

- Components: `*.component.ts`, `*.component.html`, `*.component.scss`
- Services: `*.service.ts`
- Pipes: `*.pipe.ts`
- Interfaces: Use `I` prefix (e.g., `IButton`, `IConfig`, `IButtonGroup`)
- Classes: PascalCase (e.g., `Button`, `ButtonGroup`)

### Code Style

- ESLint with Prettier integration
- TypeScript strict mode enabled
- Use `readonly` for immutable properties
- Prefer observables and RxJS operators for async operations
- Use dependency injection for services

### Comments and Documentation

- Write all code comments in **English**
- Use JSDoc style for public APIs

## Key Interfaces

### IButton (src/app/sound-buttons/Buttons.ts)

```typescript
interface IButton {
  id: string;
  filename: string;
  text: string | never;
  baseRoute: string;
  volume: number;
  source?: ISource;
  SASToken?: string;
  index?: number;
}
```

### IConfig (src/app/services/config.service.ts)

```typescript
interface IConfig {
  name: string | never;
  fullName: string;
  imgSrc: string | string[];
  fullConfigURL: string;
  liveUpdateURL: string;
  color?: IColor;
}
```

## Configuration Files

### JSON Configuration Structure

Button configurations are stored in `src/assets/configs/` as a git submodule. Each character has a JSON file containing:

- Character metadata (name, image, links)
- Button groups with categorized buttons
- Each button includes: id, filename, text (multi-language), volume, source (YouTube reference)

### Environment Variables

Production environment variables are set during build via `write-production-config.ts`:

- `GA_TRACKING_ID`: Google Analytics ID
- `ORIGIN`: Site origin URL
- `API`: Backend API endpoint
- `VERSION`: Git commit SHA
- `CLARITY_TRACKING_ID`: Microsoft Clarity ID

## CI/CD Workflows

### GitHub Actions

- **deploy-gh-page.yml**: Builds and deploys to GitHub Pages on push to master
- **deploy-cloudflare-worker.yml**: Deploys Cloudflare Worker on push to master
- **codeql.yml**: Security scanning

### Deployment Process

1. Push to `master` branch triggers build
2. Submodule `src/assets/configs` is checked out to `minify` branch
3. Angular production build runs
4. Built artifacts deployed to `gh-pages` branch
5. GitHub Pages serves from `gh-pages`

## Related Repositories

| Repository | Purpose |
| ---------- | ------- |
| [sound-buttons](https://github.com/sound-buttons/sound-buttons) | Frontend (this repo) |
| [sound-buttons_configs](https://github.com/sound-buttons/sound-buttons_configs) | JSON configuration data |
| [sound-buttons_upload-backend](https://github.com/sound-buttons/sound-buttons_upload-backend) | Azure Functions backend |
| [worker-click-counter](https://github.com/sound-buttons/worker-click-counter) | Cloudflare Worker for click counting |

## Important Notes

1. **Submodule Management**: The `src/assets/configs` directory is a git submodule. Always run `git submodule update --init` after cloning.

2. **Environment File**: `src/environments/environment.prod.ts` is gitignored and generated during build.

3. **Multi-language Support**: The app supports zh-tw (Traditional Chinese) and ja (Japanese). Translation files are in `src/assets/i18n/`.

4. **Audio Queue**: The `AudioService` manages a queue of audio files for sequential playback.

5. **Live Update Feature**: Configurations can be dynamically reloaded without page refresh via `?liveUpdate=1` query parameter.

6. **Privacy**: The app respects Global Privacy Control (GPC) and disables analytics when detected.
