# Configuration Loading

## Purpose

Sound Buttons separates content from code: every character (Vtuber) board is driven by JSON
configuration rather than hard-coded markup. This capability loads the homepage overview list and
per-character full configurations over HTTP, re-instantiates plain JSON into domain classes so that
class behaviour (default values, base-route propagation) is available, resolves multilingual and
themed fields, and supports a live-update mode that swaps the configuration source URL for previewing
not-yet-approved content.

Implemented primarily in `src/app/services/config.service.ts`, with model classes in
`src/app/sound-buttons/Buttons.ts` and `src/app/sound-buttons/ButtonGroup.ts`.

## Requirements

### Requirement: Homepage overview configuration loading

The system SHALL load the homepage overview list from `assets/configs/main.json` as an array of
`IConfig` objects via `HttpClient.get`, requesting `Cache-Control: max-age=0` so the browser
revalidates the file.

#### Scenario: Loading the overview list
- **GIVEN** the application is started and the homepage is shown
- **WHEN** `getBriefConfig()` is called with no argument
- **THEN** the system SHALL issue an HTTP GET to `assets/configs/main.json` with header `Cache-Control: max-age=0`
- **AND** SHALL return the response parsed as an `IConfig[]` array

#### Scenario: Loading an alternate overview URL
- **GIVEN** a caller passes an explicit URL to `getBriefConfig(url)`
- **WHEN** the request is made
- **THEN** the system SHALL fetch from the supplied URL instead of the default `assets/configs/main.json`

### Requirement: Per-character full configuration loading

The system SHALL resolve the full configuration URL for a named character and load it as an
`IFullConfig`. When no matching character or URL can be resolved, the system SHALL return `undefined`
rather than throwing from `getConfig`.

#### Scenario: Loading a character full config
- **GIVEN** the overview list contains a config whose `name` matches the requested name
- **WHEN** `getConfig(name)` is called
- **THEN** the system SHALL HTTP GET the resolved full-config URL with `Cache-Control: max-age=0`
- **AND** SHALL return the processed `IFullConfig`

#### Scenario: Unresolvable character name
- **GIVEN** no overview config matches the requested name (resolved URL is empty)
- **WHEN** `getConfig(name)` is called
- **THEN** the system SHALL return `undefined`

#### Scenario: reloadConfig with no config received
- **GIVEN** the current name resolves to no config
- **WHEN** `reloadConfig()` runs its `switchMap` and the inner config is `undefined`
- **THEN** the system SHALL raise `Error('No config received.')`

### Requirement: Domain model re-instantiation

Because JSON deserialization yields plain objects without class methods or defaults, the system SHALL
re-instantiate each button as a `Button` and each group as a `ButtonGroup` while processing a full
config, and SHALL likewise rebuild the optional `introButton`.

#### Scenario: Rebuilding buttons and groups
- **GIVEN** a full config containing `buttonGroups` with plain button objects
- **WHEN** `getConfig` maps the response
- **THEN** each button SHALL be replaced by `new Button(...)` and each group by `new ButtonGroup(...)`
- **AND** the `introButton`, when present, SHALL be rebuilt as `new Button(...)`

#### Scenario: Button default values
- **GIVEN** a button object missing `text`, `baseRoute`, or `volume`
- **WHEN** it is constructed as a `Button`
- **THEN** `text` SHALL default to `filename`, `baseRoute` SHALL default to `assets/sound/`, `volume` SHALL default to `1`, and `SASToken` SHALL default to an empty string

#### Scenario: Group base-route propagation
- **GIVEN** a `ButtonGroup` with a `baseRoute` and child buttons whose `baseRoute` is empty or the default
- **WHEN** the group is constructed
- **THEN** the group base route (defaulting to `assets/sound/`) SHALL propagate to those child buttons with a trailing `/`

### Requirement: Live-update source switching

The system SHALL expose an `isLiveUpdate` flag. When enabled, the system SHALL fetch a character's
`liveUpdateURL` in place of its `fullConfigURL`, so unapproved submissions can be previewed. Toggling
the flag to a new value SHALL trigger `reloadConfig()`.

#### Scenario: Enabling live update via query parameter
- **GIVEN** the route contains the `liveUpdate` query-parameter key (any or no value)
- **WHEN** the container reads `queryParamMap`
- **THEN** it SHALL set `configService.isLiveUpdate = true` (presence check via `has`)

#### Scenario: Source URL selection under live update
- **GIVEN** `isLiveUpdate` is `true`
- **WHEN** `getFullConfigUrl()` resolves the URL for the active character
- **THEN** the system SHALL select `liveUpdateURL`; otherwise it SHALL select `fullConfigURL`

#### Scenario: Toggling reloads content
- **GIVEN** `isLiveUpdate` currently differs from the new value
- **WHEN** the setter assigns the new value
- **THEN** the system SHALL update the flag and call `reloadConfig()`; if the value is unchanged it SHALL be a no-op

### Requirement: Active character name management

The system SHALL track the active character `name`; setting a new name SHALL trigger `reloadConfig()`,
and a config reload SHALL emit the processed config through the `OnConfigChanged` event or call
`resetConfig()` when no config is produced.

#### Scenario: Setting the active name
- **GIVEN** the container resolves the `:name` route parameter
- **WHEN** `configService.name` is assigned (defaulting to `template` when the param is missing)
- **THEN** the system SHALL reload the configuration for that name

#### Scenario: Emitting configuration changes
- **GIVEN** `reloadConfig` produces a processed config
- **WHEN** the observable resolves
- **THEN** the system SHALL emit it via `OnConfigChanged`; when it produces nothing it SHALL call `resetConfig()`

### Requirement: Multilingual and theme field resolution during load

While processing a full config the system SHALL resolve a non-string `intro` to the browser language
via `LanguageService.GetTextFromObject`, and SHALL apply any `color` field to the theme via
`ColorService`.

#### Scenario: Resolving multilingual intro
- **GIVEN** a config whose `intro` is an object such as `{ zh: "...", ja: "..." }`
- **WHEN** `getConfig` processes it
- **THEN** the resolved string for the current browser language SHALL be assigned to `intro`

#### Scenario: Applying configuration color
- **GIVEN** a config carrying a `color` field
- **WHEN** `getConfig` processes it
- **THEN** the system SHALL assign `colorService.color = source.color`
