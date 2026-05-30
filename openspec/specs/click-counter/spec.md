# Click Counter

## Purpose

The site shows a global "total clicks" count in the footer, backed by an external view-counter
service. The counter is read once at startup and incremented each time a sound finishes playing. Unlike
analytics, the click counter is not gated by Global Privacy Control.

Implemented in `src/app/services/click.service.ts`, incremented from
`src/app/services/audio.service.ts`, and displayed in `src/app/footer/footer.component.ts` / `.html`.

## Requirements

### Requirement: Reading the click count

The system SHALL fetch the current count from `https://view-counter.sound-buttons.click` at service
initialization and broadcast it.

#### Scenario: Initial count load
- **GIVEN** the click service is constructed
- **WHEN** `GetClicks()` runs (called from the constructor)
- **THEN** the system SHALL HTTP GET the view-counter endpoint and emit the numeric result via `UpdateClicks`

### Requirement: Incrementing the click count

The system SHALL increment the counter via an HTTP POST when a sound finishes playing, and broadcast
the new value.

#### Scenario: Counting on playback end
- **GIVEN** a clip reaches its `ended` event
- **WHEN** `StepClicks()` is called
- **THEN** the system SHALL HTTP POST to the view-counter endpoint and emit the updated count via `UpdateClicks`

### Requirement: Displaying the count

The footer SHALL display the total click count, updating live as the count changes, with a placeholder
before the first value arrives.

#### Scenario: Footer display
- **GIVEN** the footer is rendered
- **WHEN** `UpdateClicks` emits a value
- **THEN** the footer SHALL show `Total {{clicks}} Clicks`, starting from the placeholder `?????` until the first value is received

### Requirement: Not gated by privacy control

The click counter SHALL operate regardless of the Global Privacy Control signal (only GA and Clarity
are gated).

#### Scenario: Counter runs under GPC
- **GIVEN** `navigator.globalPrivacyControl` is true
- **WHEN** sounds are played and the page loads
- **THEN** the click counter SHALL still read and increment the count
