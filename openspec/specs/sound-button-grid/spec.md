# Sound Button Grid

## Purpose

On a character board the approved buttons are displayed as a searchable grid of grouped buttons.
This capability covers rendering button groups, the responsive grid column sizing, the table-of-
contents/group navigation, and the text search/filter that hides non-matching buttons. Each button
also carries the right-click context-menu trigger (see the right-click-context-menu capability) and
activates audio playback on click (see the audio-playback capability).

Implemented in `src/app/sound-buttons/sound-buttons.component.ts` / `.html`,
`src/app/pipe/button-filter.pipe.ts`, and the search input in `src/app/header/header.component.ts`
backed by `src/app/services/display.service.ts`.

## Requirements

### Requirement: Grouped button rendering

The system SHALL render the buttons of a character's `buttonGroups`, each group shown as a card whose
heading uses the group name, with buttons rendered in **reversed** order (`buttons.slice().reverse()`).
Each button SHALL be wired to activate audio playback on click and to open the context menu on
right-click. A group card SHALL be hidden when its (filtered) `buttons.length === 0`.

#### Scenario: Rendering button groups
- **GIVEN** a config with one or more `buttonGroups`
- **WHEN** the sound-buttons component renders
- **THEN** it SHALL display each non-empty group as a card, rendering buttons in reversed order, binding click to `buttonClick($event, btn)` and right-click to the context menu with `[menuContext]="btn"`

#### Scenario: Hiding empty group cards
- **GIVEN** a group whose buttons are all filtered out
- **WHEN** the grid renders
- **THEN** that group's card SHALL be hidden (`*ngIf="buttonGroup.buttons.length !== 0"`)

### Requirement: Per-button grid column span

The system SHALL size each button's grid column span independently from that button's own label length
via `gridColumnLen(btn.text)`: replacing non-single-byte characters with `xx`, computing
`ceil(len/2) + 5`, and clamping the result between 10 and 50.

#### Scenario: Computing a button's span
- **GIVEN** a button with a given label
- **WHEN** `gridColumnLen(btn.text)` is computed
- **THEN** the result SHALL be `ceil(adjustedLength/2) + 5`, clamped to the range [10, 50], and applied as `grid-column: auto/span <n>`

### Requirement: Text search/filter on button labels

The system SHALL filter displayed buttons by a search term using a case-sensitive substring match
against each button's `text` field. An empty term SHALL keep all buttons.

#### Scenario: Filtering by substring
- **GIVEN** a search term is entered
- **WHEN** the `button-filter` pipe runs
- **THEN** the system SHALL keep only buttons whose `text` contains the term as a case-sensitive substring (via `indexOf`)

#### Scenario: Empty search term
- **GIVEN** the search term is empty
- **WHEN** the pipe runs
- **THEN** all buttons SHALL be kept

#### Scenario: Empty group objects retained by pipe but hidden in DOM
- **GIVEN** a filter that empties some groups
- **WHEN** the `button-filter` pipe runs
- **THEN** the pipe SHALL retain the group objects (not remove them), while the template SHALL hide group cards whose filtered button list is empty

#### Scenario: No-results message
- **GIVEN** the active filter matches no buttons across all groups (`isFilteredEmpty()`)
- **WHEN** the grid renders
- **THEN** the system SHALL show a warning alert with the translated text "沒有符合條件的按鈕"

### Requirement: Table-of-contents navigation

The system SHALL build a table of contents over the group headings using `tocbot`, initialized after
view init and refreshed whenever the filter text or config changes. The TOC SHALL target `#toc`, read
`h2` headings within `app-sound-buttons`, use non-smooth scroll, a heading offset of 63, and a base
path of the current pathname + search.

#### Scenario: Initializing the TOC
- **GIVEN** the sound-buttons view has initialized
- **WHEN** `ngAfterViewInit` runs
- **THEN** the system SHALL call `tocbot.init` with `tocSelector: '#toc'`, `contentSelector: 'app-sound-buttons'`, `headingSelector: 'h2'`, `scrollSmooth: false`, and `headingsOffset: 63`

#### Scenario: Refreshing the TOC on changes
- **GIVEN** the filter text changes or the config changes
- **WHEN** `OnConfigChanged` fires (display or config service)
- **THEN** the system SHALL refresh the TOC via `tocbot.refresh` (deferred with `setTimeout(..., 0)`)

### Requirement: Search state synced with URL

The system SHALL synchronize the search term with the `filter` query parameter so a filtered view is
shareable and survives navigation, emitting `OnConfigChanged` when the term changes.

#### Scenario: Updating the filter
- **GIVEN** the user types in the header search box (typeahead over all button texts)
- **WHEN** `DisplayService.setFilterText(term)` is called with a changed value
- **THEN** the system SHALL navigate merging `queryParams: { filter: term || null }` and emit `OnConfigChanged`

#### Scenario: Initializing filter from URL
- **GIVEN** the URL carries a `filter` query parameter
- **WHEN** the display service observes `queryParams`
- **THEN** it SHALL apply that value as the current filter text

#### Scenario: Search hidden on upload page
- **GIVEN** the current path ends with `upload`
- **WHEN** the header renders
- **THEN** the search/filter input SHALL be hidden
