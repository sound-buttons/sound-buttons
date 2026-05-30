## MODIFIED Requirements

### Requirement: Context menu trigger and context binding

The system SHALL open the context menu when a sound button (or other trigger source) is right-clicked,
passing the right-clicked button as the menu context. The trigger SHALL be provided by an in-repo
Angular CDK Overlay-based mechanism: right-clicking a bound element SHALL suppress the native browser
context menu, open an overlay-hosted `ContextMenuComponent` positioned at the cursor, and set that
component's target button. The same trigger mechanism SHALL be reusable by every source that binds the
menu.

#### Scenario: Right-clicking a sound button
- **GIVEN** a rendered sound button bound to the context-menu trigger with its button as the menu context
- **WHEN** the user right-clicks the button
- **THEN** the system SHALL prevent the native context menu and open `ContextMenuComponent` with `this.button` set to that button

#### Scenario: Trigger component reference
- **GIVEN** the sound-buttons component wires the context-menu trigger to render `ContextMenuComponent`
- **WHEN** a bound element is right-clicked
- **THEN** the system SHALL render `ContextMenuComponent` as the menu shown on right-click

#### Scenario: Other context-menu trigger sources
- **GIVEN** a queued button chip in the audio control bar (`audio-control.component.html`) or the introduction sample button, both bound to the same context-menu trigger with their button as context
- **WHEN** the user right-clicks them
- **THEN** the system SHALL open the same `ContextMenuComponent` with that button as context

### Requirement: Closing behaviour after actions

The system SHALL close the open context menu after every menu action, and SHALL also close it on
outside-click and on Escape. Closing SHALL be performed by the in-repo overlay close mechanism, which
disposes the overlay that hosts the menu.

#### Scenario: Action closes the menu
- **GIVEN** the context menu is open
- **WHEN** the user selects any menu item action
- **THEN** the system SHALL invoke `close()` (which disposes the hosting overlay) after performing the action

#### Scenario: Dismissal without an action
- **GIVEN** the context menu is open
- **WHEN** the user clicks outside the menu or presses Escape
- **THEN** the system SHALL close the menu by disposing the hosting overlay
