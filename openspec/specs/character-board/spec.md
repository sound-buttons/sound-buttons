# Character Board

## Purpose

A character board is the per-character page that combines an introduction panel (image, social links,
intro text, optional self-introduction sample button) with the searchable sound-button grid and the
audio control bar. This capability covers the board layout and the introduction panel; the button grid
and playback are covered by their own capabilities.

Implemented in `src/app/container/container.component.html`,
`src/app/introduction/introduction.component.ts` / `.html`, and
`src/app/scroll-to-top-button/scroll-to-top-button.component.ts`.

## Requirements

### Requirement: Board layout

The system SHALL render the introduction panel and the sound-button grid (when groups exist) only when
a config is loaded, but SHALL render the audio control bar and scroll-to-top button regardless of
whether a config is loaded (they sit outside the `*ngIf="config"` block).

#### Scenario: Rendering a loaded board
- **GIVEN** a character config is loaded
- **WHEN** the container renders
- **THEN** it SHALL show `<app-introduction>` with the config's images, intro, links, and intro button, and `<app-sound-buttons>` when `config.buttonGroups` exists

#### Scenario: Controls render without config
- **GIVEN** no config is available
- **WHEN** the container renders
- **THEN** the introduction panel and button grid SHALL be hidden (`*ngIf="config"`), while `<app-audio-control>` and `<app-scroll-to-top-button>` SHALL still render

### Requirement: Introduction panel

The introduction panel SHALL show the character image, conditional social links, the intro text as
HTML, and an optional sample button.

#### Scenario: Rendering social links
- **GIVEN** a config `link` object with some social URLs
- **WHEN** the introduction renders
- **THEN** it SHALL show icons only for the provided platforms (youtube, twitch, twitter, facebook, discord, instagram, other)

#### Scenario: Rendering intro text
- **GIVEN** an `intro` string (already language-resolved)
- **WHEN** the introduction renders
- **THEN** it SHALL render the intro via `[innerHTML]`

#### Scenario: Sample button hidden in live update
- **GIVEN** the board is in live-update mode (`liveUpdate === '1'`)
- **WHEN** the introduction renders
- **THEN** the sample button SHALL be hidden

### Requirement: Introduction interactions

The introduction SHALL play its sample button on click, allow reloading the config, and toggle an
expanded state with smooth scroll.

#### Scenario: Playing the sample button
- **GIVEN** the intro sample button exists
- **WHEN** the user clicks it
- **THEN** the system SHALL call `audioService.add(btn)` and play if not paused and not already playing

#### Scenario: Toggling expansion
- **GIVEN** the introduction icon
- **WHEN** the user clicks it
- **THEN** the system SHALL toggle `expanded`, and when expanding SHALL smooth-scroll to the top

### Requirement: Scroll-to-top button

The system SHALL provide a scroll-to-top button that becomes visible after the page is scrolled past
300px and smooth-scrolls to the top when clicked.

#### Scenario: Visibility threshold
- **GIVEN** the page is scrolled
- **WHEN** `window.scrollY` exceeds 300px
- **THEN** the scroll-to-top button SHALL be visible

#### Scenario: Scrolling to top
- **GIVEN** the button is visible
- **WHEN** the user clicks it
- **THEN** the system SHALL smooth-scroll the page to the top
