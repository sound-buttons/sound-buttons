# Theming

## Purpose

Each character may define a theme color pair (primary/secondary) that overrides Bootstrap CSS
variables so the board and homepage cards adopt the character's colors. This capability covers
applying, defaulting, and resetting those colors.

Implemented in `src/app/services/color.service.ts`, driven by the `color` field of a config and used
by configuration loading and the homepage hover behaviour.

## Requirements

### Requirement: Color model and defaults

The system SHALL represent a theme as an `IColor` of `{ primary, secondary }` and SHALL provide a
default of `{ primary: '#000000', secondary: '#a1a1a1' }`.

#### Scenario: Default color
- **GIVEN** no config color is applied
- **WHEN** the theme is at its default
- **THEN** `defaultColor` SHALL be `{ primary: '#000000', secondary: '#a1a1a1' }`

### Requirement: Applying theme colors as CSS variables

When a color is set, the system SHALL write each color key to a Bootstrap CSS variable
(`--bs-<key>`) on the document root element.

#### Scenario: Setting a theme color
- **GIVEN** an `IColor` with `primary` and `secondary`
- **WHEN** `ColorService.color` is assigned
- **THEN** the system SHALL set `--bs-primary` and `--bs-secondary` on `document.documentElement`

### Requirement: Resetting to the default theme

The system SHALL reset the theme to the default color on demand.

#### Scenario: Resetting the theme
- **GIVEN** a custom color was applied
- **WHEN** `resetColor()` is called
- **THEN** the system SHALL set `color = defaultColor`
