# Right-Click Context Menu

## Purpose

Every sound button (and the introduction sample button) exposes a right-click (context) menu that
lets users copy the button's share URL, download the audio file, jump to or copy the original YouTube
source, and share the button to social networks. This capability captures the **exact current
behaviour** of that menu because its implementation currently depends on the abandoned
`@ctrl/ngx-rightclick` library and must be re-implemented behaviour-compatibly during the framework
migration.

Implemented in `src/app/sound-buttons/context-menu/context-menu.component.ts` and
`context-menu.component.html`, wired through `sound-buttons.component.html`, and backed by
`src/app/services/share.service.ts`.

## Requirements

### Requirement: Context menu trigger and context binding

The system SHALL open the context menu when a sound button is right-clicked, passing the right-clicked
button as the menu context. `ContextMenuComponent` SHALL read its target button from
`menuPackage.context`.

#### Scenario: Right-clicking a sound button
- **GIVEN** a rendered sound button bound with `[contextMenuTrigger]="menu"` and `[menuContext]="btn"`
- **WHEN** the user right-clicks the button
- **THEN** the system SHALL open `ContextMenuComponent` with `this.button` set to that button (`menuPackage.context`)

#### Scenario: Trigger component reference
- **GIVEN** the sound-buttons component exposes `menu = ContextMenuComponent`
- **WHEN** the template wires `[contextMenuTrigger]="menu"`
- **THEN** the system SHALL use `ContextMenuComponent` as the menu rendered on right-click

#### Scenario: Other context-menu trigger sources
- **GIVEN** a queued button chip in the audio control bar (`audio-control.component.html`) or the introduction sample button, both bound with `[contextMenuTrigger]="menu"` and `[menuContext]="button"`
- **WHEN** the user right-clicks them
- **THEN** the system SHALL open the same `ContextMenuComponent` with that button as context

### Requirement: Menu open/close animation

The menu SHALL fade in and out using an Angular animation `trigger('menu')` that animates opacity
between `0` and `1` over 250ms, bound through `@HostBinding('@menu')` with an `@menu.done` host
listener.

#### Scenario: Menu fade-in
- **GIVEN** the context menu is opened
- **WHEN** it enters the DOM
- **THEN** it SHALL animate opacity from `0` to `1` over 250ms

#### Scenario: Menu fade-out completion
- **GIVEN** the context menu is closing
- **WHEN** the `@menu.done` animation event fires
- **THEN** the registered host listener SHALL handle the animation completion

### Requirement: Closing behaviour after actions

The system SHALL close all open context menus via `ContextMenuService.closeAll()` after every menu
action.

#### Scenario: Action closes the menu
- **GIVEN** the context menu is open
- **WHEN** the user selects any menu item action
- **THEN** the system SHALL invoke `close()` (which calls `contextMenuService.closeAll()`) after performing the action

### Requirement: Always-available menu items

The menu SHALL always present "複製按鈕網址" (copy button link) and "下載" (download), each label
rendered through the `translate` pipe.

#### Scenario: Copy button link
- **GIVEN** the context menu is open for a button
- **WHEN** the user selects "複製按鈕網址"
- **THEN** the system SHALL call `shareService.copyLink(button)` and then close the menu

#### Scenario: Download menu item present
- **GIVEN** the context menu is open for any button
- **WHEN** the menu renders
- **THEN** it SHALL display the translated "下載" item unconditionally

### Requirement: Audio file download

The download action SHALL start fetching the audio file from `baseRoute + filename + SASToken`, and
**immediately** (before the fetch resolves) show a success toast "已開始下載" for 2000ms and close the
menu. When the fetch resolves, the system SHALL wrap the response in a `Blob` whose MIME type is
`mime.getType(filename) ?? response.type`, create a temporary `<a download=filename>` pointing at an
object URL, and programmatically click it to start the download. There is no error handling on the
fetch chain.

#### Scenario: Downloading a button's audio
- **GIVEN** the context menu is open for a button
- **WHEN** the user selects "下載"
- **THEN** the system SHALL dispatch `fetch(baseRoute + filename + SASToken)`
- **AND** SHALL immediately show `toastSuccess('已開始下載', '', 2000)` and close the menu (without waiting for the fetch)
- **AND** when the fetch resolves SHALL build a `Blob` with type `mime.getType(filename) ?? response.type`, create an anchor with `download = filename` and `href` set to the object URL, and click it

#### Scenario: No download error handling
- **GIVEN** the fetch for the audio file fails
- **WHEN** the promise rejects
- **THEN** the system SHALL NOT handle the error (the success toast has already been shown and the menu already closed)

### Requirement: YouTube source items (conditional visibility)

The menu SHALL show YouTube-related items only when the button has a source video. When
`button.source?.videoId` is falsy, the divider preceding the YouTube items, "複製 Youtube 網址", and
"在 Youtube 上觀看" SHALL all be hidden.

#### Scenario: Button with a YouTube source
- **GIVEN** the button has a truthy `source.videoId`
- **WHEN** the context menu renders
- **THEN** it SHALL show the divider, "複製 Youtube 網址", and "在 Youtube 上觀看"

#### Scenario: Button without a YouTube source
- **GIVEN** the button's `source.videoId` is falsy
- **WHEN** the context menu renders
- **THEN** the YouTube divider, "複製 Youtube 網址", and "在 Youtube 上觀看" SHALL be hidden

#### Scenario: Copy YouTube link
- **GIVEN** the button has a YouTube source
- **WHEN** the user selects "複製 Youtube 網址"
- **THEN** the system SHALL call `shareService.copyYoutubeLink(button)` and close the menu

#### Scenario: Watch on YouTube
- **GIVEN** the button has a YouTube source
- **WHEN** the user selects "在 Youtube 上觀看"
- **THEN** the system SHALL open the generated YouTube link (`https://youtu.be/<videoId>?t=<floor(start)>`) and close the menu

### Requirement: Social share items

After a divider the menu SHALL always present share actions to 𝕏 (Twitter), Mastodon, and Facebook,
each delegating to the corresponding `ShareService` method and then closing the menu.

#### Scenario: Share to 𝕏 (Twitter)
- **GIVEN** the context menu is open for a button
- **WHEN** the user selects the 𝕏 share item
- **THEN** the system SHALL call `shareService.shareToTwitter(button)` and close the menu

#### Scenario: Share to Mastodon
- **GIVEN** the context menu is open for a button
- **WHEN** the user selects the Mastodon share item
- **THEN** the system SHALL call `shareService.shareToMastodon(button)` and close the menu

#### Scenario: Share to Facebook
- **GIVEN** the context menu is open for a button
- **WHEN** the user selects the Facebook share item
- **THEN** the system SHALL call `shareService.shareToFacebook(button)` and close the menu

### Requirement: Menu DOM structure and class-based hiding

The menu SHALL render using Bootstrap dropdown markup: a root `dropdown-menu show` container, items as
`dropdown-item`, and separators as `dropdown-divider`. Conditional items SHALL be hidden via the
`d-none` class (toggled by `[class.d-none]` on `!button.source?.videoId`) rather than removed from the
DOM.

#### Scenario: Bootstrap dropdown markup
- **GIVEN** the context menu is open
- **WHEN** it renders
- **THEN** the root SHALL carry `dropdown-menu show`, action rows SHALL be `dropdown-item`, and dividers SHALL be `dropdown-divider`

#### Scenario: Hiding YouTube items via d-none
- **GIVEN** the button has no `source.videoId`
- **WHEN** the menu renders
- **THEN** the YouTube divider and items SHALL receive the `d-none` class (hidden, not removed)
