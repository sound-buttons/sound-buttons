# Audio Playback

## Purpose

The core interaction of Sound Buttons is playing short audio clips. This capability manages a
sequential playback queue (at most one clip plays at a time), per-button and global volume, stopping
all playback, a shuffle feature that enqueues a randomized selection of buttons, and the analytics /
click-counter side effects that fire when a clip finishes.

Implemented in `src/app/services/audio.service.ts`, with UI in
`src/app/audio-control/audio-control.component.ts` and playback triggered from
`src/app/sound-buttons/sound-buttons.component.ts` and `src/app/introduction/introduction.component.ts`.

## Requirements

### Requirement: Sequential single-clip playback queue

The system SHALL maintain a FIFO queue of sounds and play at most one clip at a time. Adding a button
SHALL enqueue it without auto-starting playback; the caller SHALL start playback when nothing is
currently playing or paused.

#### Scenario: Adding a button to the queue
- **GIVEN** a button is activated
- **WHEN** `AudioService.add(button)` is called
- **THEN** the system SHALL clone the button, construct `new Audio(baseRoute + filename + SASToken)`, assign a monotonically increasing `index`, and push it onto the queue
- **AND** SHALL NOT begin playback automatically

#### Scenario: Click-to-play flow
- **GIVEN** the user clicks a sound button
- **WHEN** `buttonClick` runs `add(btn)`
- **THEN** the system SHALL call `play()` only if it is neither paused nor already playing

#### Scenario: Advancing to the next clip on end
- **GIVEN** a clip finishes (its `ended` event fires)
- **WHEN** the one-time `ended` listener runs
- **THEN** the system SHALL remove that clip from the queue by `index`
- **AND** SHALL play the new head of the queue, or set the playing state to false if the queue is empty

### Requirement: Per-button and global volume

The system SHALL combine a global `nowVolume` with each button's `volume` so that effective volume is
`Math.min(1, button.volume * nowVolume)`. The audio-control slider SHALL adjust `nowVolume` in the
range 0–1 (step 0.01), defaulting the control to 0.5 on init, and SHALL coerce a slider value of 0 to
0.0001.

#### Scenario: Effective clip volume
- **GIVEN** a button with a configured `volume`
- **WHEN** it is added to the queue
- **THEN** the audio element volume SHALL be set to `Math.min(1, button.volume * nowVolume)`

#### Scenario: Adjusting global volume
- **GIVEN** the audio-control volume slider (min 0, max 1, step 0.01)
- **WHEN** the user moves it
- **THEN** `nowVolume` SHALL update, and a value of 0 SHALL be coerced to 0.0001

#### Scenario: Volume is not persisted
- **GIVEN** the user changed the volume during a session
- **WHEN** the page is reloaded
- **THEN** the volume SHALL reset (no persistence) — the control initializes to 0.5

### Requirement: Stop all playback

The system SHALL provide a stop action that pauses and removes every queued clip, clears the queue,
and resets the paused/playing state.

#### Scenario: Stopping all sounds
- **GIVEN** one or more clips are queued or playing
- **WHEN** `stop()` is called
- **THEN** the system SHALL pause and remove all clips, empty the queue, and reset the paused and playing flags

### Requirement: Shuffle playback

The system SHALL offer a shuffle action (shown only when the queue is empty) that enqueues a randomized
selection of the character's buttons, excluding groups whose name contains "大叫", "悲鳴", or "自肥".

#### Scenario: Shuffling buttons
- **GIVEN** the queue is empty and a config with button groups is loaded
- **WHEN** the user triggers shuffle
- **THEN** the system SHALL collect buttons excluding groups named with "大叫", "悲鳴", or "自肥", randomly shuffle them, and enqueue them for sequential playback

#### Scenario: Shuffle availability
- **GIVEN** the audio queue is not empty
- **WHEN** the audio-control renders
- **THEN** the shuffle control SHALL be hidden

### Requirement: Playback side effects (counter and analytics)

When a clip finishes, the system SHALL increment the click counter and emit analytics events.

#### Scenario: Counting a finished clip
- **GIVEN** a clip reaches its `ended` event
- **WHEN** the listener runs
- **THEN** the system SHALL call `ClickService.StepClicks()` and emit `gtag` events `sound_play` and `sound_play_count`

### Requirement: Synchronous queue state predicates

The system SHALL expose synchronous predicate accessors describing queue state (`isEmpty`, `canPlay`,
`canPause`, `isPaused`, `isPlaying`, `getQueuedButtons`) used by the UI to enable/disable controls.

#### Scenario: Querying queue state
- **GIVEN** the audio-control UI needs to render control states
- **WHEN** it reads predicates such as `isEmpty()` or `getQueuedButtons()`
- **THEN** the system SHALL return the current state synchronously (no observable subscription required)
