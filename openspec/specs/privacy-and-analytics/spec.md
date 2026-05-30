# Privacy and Analytics

## Purpose

The application integrates Google Analytics and Microsoft Clarity for usage analytics and emits
page-view and sound-play events. It respects the Global Privacy Control (GPC) signal by disabling all
analytics, and disables real analytics in non-production builds. This capability covers that gating and
the analytics events.

Implemented in `src/app/app.module.ts` (constructor) and `src/app/app.component.ts`, with
sound-play events emitted from `src/app/services/audio.service.ts`.

## Requirements

### Requirement: Global Privacy Control opt-out

When the browser reports `navigator.globalPrivacyControl` as true, the system SHALL disable analytics
entirely: replace `gtag` with a no-op, skip loading the GA and Clarity scripts, and log a notice.

#### Scenario: GPC enabled
- **GIVEN** `navigator.globalPrivacyControl` is `true`
- **WHEN** the app module constructor runs
- **THEN** the system SHALL set `window.gtag` to a no-op, log that GA and Clarity are deactivated, and return early without injecting analytics scripts

### Requirement: Non-production analytics stub

In non-production builds the system SHALL install a debug stub for `gtag` and SHALL NOT load real
analytics.

#### Scenario: Development build
- **GIVEN** `env.production` is false (and GPC is not set)
- **WHEN** the app module constructor runs
- **THEN** the system SHALL install a `gtag` that `console.debug`s its arguments and return early

### Requirement: Production analytics loading

In production builds without GPC, the system SHALL inject the Google Analytics and Microsoft Clarity
scripts using the configured tracking ids.

#### Scenario: Loading GA and Clarity
- **GIVEN** a production build and GPC not set
- **WHEN** the app module constructor runs
- **THEN** the system SHALL inject the GA script for `env.google.GA_TRACKING_ID` and initialize the dataLayer, and inject the Clarity script for `env.CLARITY_TRACKING_ID`

### Requirement: Analytics events

The system SHALL emit a page-view event on navigation and sound-play events when a clip finishes or
when a button modal is opened from a deep link.

#### Scenario: Page-view tracking
- **GIVEN** the user navigates between routes
- **WHEN** the router emits events de-duplicated by URL via `distinctUntilChanged` (the subscription does NOT filter specifically for `NavigationEnd`; each emitted event is cast to `RouterEvent`)
- **THEN** the system SHALL emit `gtag('event','page_view',{ page_path: url })`

#### Scenario: Sound-play tracking on playback end
- **GIVEN** a clip finishes playing
- **WHEN** its `ended` handler runs
- **THEN** the system SHALL emit `gtag` `sound_play` and `sound_play_count` events

#### Scenario: Sound-play tracking on deep-link modal open
- **GIVEN** a button modal is opened from a deep link
- **WHEN** `showButton` runs in the container
- **THEN** the system SHALL emit `gtag('event','sound_play',{ page, button, name })`
