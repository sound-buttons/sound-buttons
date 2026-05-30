# Content Routing and SEO

## Purpose

This capability defines the application's route map, how route and query parameters select content,
how a deep link to a specific button opens that button's modal, and how SEO / Open Graph meta tags are
set for the homepage and character pages.

Implemented in `src/app/app-routing.module.ts`, `src/app/container/container.component.ts`,
`src/app/services/seo.service.ts`, and `src/app/home-page/home-page.component.ts`.

## Requirements

### Requirement: Route map

The system SHALL define routes for the homepage, character board, upload page, and a button deep link.

#### Scenario: Defined routes
- **GIVEN** the routing module is configured
- **WHEN** the application resolves a URL
- **THEN** `''` SHALL map to the homepage, `:name` to the character board, `:name/upload` to the upload page, and `:name/:id` to the character board (deep link to a button)

#### Scenario: No wildcard route
- **GIVEN** a URL matching none of the defined routes
- **WHEN** routing resolves
- **THEN** no explicit 404/wildcard route or redirect SHALL be applied (none is defined)

### Requirement: Route parameter handling

The system SHALL apply the `:name` route parameter as the active character (defaulting to `template`
when absent) and SHALL treat a `:id` segment of `upload` as the upload page rather than a button id.

#### Scenario: Selecting the active character
- **GIVEN** a `:name` route parameter
- **WHEN** the container reads route params
- **THEN** it SHALL set `configService.name = name ?? 'template'`

#### Scenario: Excluding the upload segment from button lookup
- **GIVEN** the second segment equals `upload`
- **WHEN** the container processes params
- **THEN** it SHALL NOT treat `upload` as a `buttonGuid`

### Requirement: Deep link button modal

When a button id (or its derived `.webm` filename) is present in the URL, the system SHALL open that
button's modal once the config has loaded, and SHALL clean the URL when the modal hides.

#### Scenario: Opening a button modal from a deep link
- **GIVEN** a `buttonGuid` is present and no modal is currently open
- **WHEN** `OnConfigChanged` fires with a loaded config
- **THEN** the system SHALL locate the button by `id` or by derived `.webm` filename and open it via `showButton`, also setting meta tags and emitting a `gtag` `sound_play` event for the button

#### Scenario: Cleaning the URL on modal hide
- **GIVEN** the button modal is open
- **WHEN** it is hidden
- **THEN** the system SHALL clear the guid and rewrite the URL, removing the `filename` query param while merging remaining params

#### Scenario: Button not found
- **GIVEN** a `buttonGuid` that matches no button
- **WHEN** the lookup runs
- **THEN** the system SHALL not open a modal (guarded by `if (!button) return`)

#### Scenario: Modal content composition
- **GIVEN** a button modal is being shown via `showButton`
- **WHEN** the modal content is built
- **THEN** it SHALL contain an `<audio controls>` whose source is `baseRoute + filename + SASToken` with type `mime.getType(filename) ?? 'audio/webm'`
- **AND** when the button has a `source.videoId`, SHALL also append a sandboxed YouTube `<iframe>` (sandbox `allow-scripts allow-same-origin allow-presentation`, `credentialless`) built from the embed link

### Requirement: Homepage SEO meta tags

On the homepage the system SHALL set the site title, canonical URL (origin), and a default Open Graph
image.

#### Scenario: Homepage meta
- **GIVEN** the homepage initializes
- **WHEN** `ngOnInit` runs
- **THEN** the system SHALL set the title to the Sound Buttons homepage title, the URL to the origin, and the image to `{origin}/assets/img/preview/open-graph.png`

### Requirement: Character and button SEO meta tags

On a character page the system SHALL set meta tags reflecting the character, and when a specific button
is open, reflecting that button.

#### Scenario: Character page meta without a selected button
- **GIVEN** a character config is loaded and no button is selected
- **WHEN** `setMeta()` runs
- **THEN** the title SHALL be `"{fullName} | Sound Buttons - ..."`, the URL `{origin}/{name}`, and the image `{origin}/assets/img/preview/{name}.png`

#### Scenario: Character page meta with a selected button
- **GIVEN** a button is open via deep link
- **WHEN** `setMeta(button)` runs
- **THEN** the title SHALL be `"{button.text||filename} | {fullName} | Sound Buttons - ..."` and the URL `{origin}/{name}/{button.id}`

### Requirement: SEO service tag management

The system SHALL provide a service that sets the document title and Open Graph / Twitter / canonical
tags.

#### Scenario: Setting SEO tags
- **GIVEN** a page needs metadata
- **WHEN** the SEO service methods are called
- **THEN** `setTitle` SHALL set `<title>`, `og:title`, and `og:site_name`; `setDescription` SHALL set `description` and `og:description`; `setUrl` SHALL set `og:url` and the canonical link; and `setImage` SHALL set `og:image` and `twitter:image`
