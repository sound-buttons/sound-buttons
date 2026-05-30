# Homepage Overview

## Purpose

The homepage presents an overview of all available characters (Vtubers) as a grid of cards loaded
from the brief configuration list. Each card links to a character board, themes the page on hover, and
shows a cycling character image. A fixed "contribute" card links to the configs repository discussions.

Implemented in `src/app/home-page/home-page.component.ts` / `.html` and
`src/app/chara-image/chara-image.component.ts` / `.html`.

## Requirements

### Requirement: Character card grid

The system SHALL render one card per brief config, each linking to that character's board and showing
the character image and full name.

#### Scenario: Rendering character cards
- **GIVEN** the brief config list has loaded
- **WHEN** the homepage renders
- **THEN** it SHALL render a card per config with `routerLink` `['/', config.name]`, an `<app-chara-image [imgs]="config.imgSrc">`, and `config.fullName` as a heading

#### Scenario: Color background block
- **GIVEN** a config has a `color`
- **WHEN** its card renders
- **THEN** a background block SHALL be shown colored by `config.color['secondary']`

### Requirement: Hover theming

The system SHALL apply a config's theme color while hovering its card and revert to the default color
on leave.

#### Scenario: Hovering a card
- **GIVEN** a config card with a `color`
- **WHEN** the pointer enters the card
- **THEN** the system SHALL apply `config.color` as the active theme

#### Scenario: Leaving a card
- **GIVEN** the pointer was over a card
- **WHEN** it leaves
- **THEN** the system SHALL revert the theme to `colorService.defaultColor`

### Requirement: Contribute card

The system SHALL display a fixed "？？？" card linking to the configs repository discussions.

#### Scenario: Contribute card link
- **GIVEN** the homepage renders
- **WHEN** the user views the card grid
- **THEN** a gray (`#777`) "？？？" card SHALL link to `https://github.com/sound-buttons/sound-buttons_configs/discussions/2` with `target=_blank` and `rel=noopener`

### Requirement: Cycling character image

The system SHALL render character images as a `<picture>` with avif/webp/png sources, and when
multiple images are provided, cycle the displayed image every 4000ms.

#### Scenario: Single image
- **GIVEN** `imgSrc` is a string
- **WHEN** the chara-image component initializes
- **THEN** it SHALL render that single image (with the `.png` extension stripped before building sources)

#### Scenario: Multiple images cycling
- **GIVEN** `imgSrc` is an array of paths
- **WHEN** the component runs
- **THEN** it SHALL cycle the active image every 4000ms, marking non-active images with the `.back` class

### Requirement: Homepage initialization

On init the system SHALL load the brief config list, reset to the default theme, set homepage SEO
meta, and clear any active filter text.

#### Scenario: Initializing the homepage
- **GIVEN** the homepage component initializes
- **WHEN** `ngOnInit` runs
- **THEN** it SHALL assign `configs$ = getBriefConfig()`, call `resetConfig()`, set the homepage SEO title/url/image, and clear the filter text
