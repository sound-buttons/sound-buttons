# Sharing

## Purpose

Sharing lets users copy a deep link to a specific button, copy or open the button's original YouTube
source, and share the button to social networks (𝕏/Twitter, Mastodon, Facebook). These actions are
invoked from the right-click context menu and back its share/copy items.

Implemented in `src/app/services/share.service.ts`. The site origin is injected from the environment
(`env.origin`).
## Requirements
### Requirement: Copy button deep link

The system SHALL copy a button's deep link `${origin}${location.pathname}/${button.id}` to the
clipboard and confirm with a success toast.

#### Scenario: Copying a button link
- **GIVEN** a button with an `id`
- **WHEN** `copyLink(button)` is called
- **THEN** the system SHALL write `${origin}${location.pathname}/${button.id}` to the clipboard via `navigator.clipboard.writeText`
- **AND** SHALL show `toastSuccess('已複製至剪貼簿', '', 2000)`

### Requirement: YouTube source link generation and copy

The system SHALL generate a YouTube link `https://youtu.be/${videoId}?t=${Math.floor(start)}` for
buttons that have a source, returning `undefined` when no source exists, and SHALL copy that link to
the clipboard on request.

#### Scenario: Generating a YouTube link
- **GIVEN** a button with `source.videoId` and `source.start`
- **WHEN** `generateYoutubeLink(button)` is called
- **THEN** it SHALL return `https://youtu.be/${videoId}?t=${Math.floor(start)}`

#### Scenario: No source
- **GIVEN** a button without a `source`
- **WHEN** `generateYoutubeLink(button)` is called
- **THEN** it SHALL return `undefined`

#### Scenario: Copying the YouTube link
- **GIVEN** a button with a YouTube source
- **WHEN** `copyYoutubeLink(button)` is called
- **THEN** the system SHALL copy the generated link to the clipboard and show `toastSuccess('已複製至剪貼簿', '', 2000)`

### Requirement: Social share deep-link encoding

For social shares the system SHALL build the deep link as
`${origin}${location.pathname}/${encodeURI(button.id)}` (note: `copyLink` uses the **raw** `button.id`,
whereas social shares apply `encodeURI` to the id). The full URL SHALL then be passed through
`encodeURIComponent` when embedded in the share intent.

#### Scenario: Encoding difference between copy and share
- **GIVEN** a button whose `id` contains non-ASCII or special characters
- **WHEN** `copyLink` versus a social share method builds the deep link
- **THEN** `copyLink` SHALL use the raw `button.id`, while social shares SHALL use `encodeURI(button.id)` and then `encodeURIComponent` the whole URL

### Requirement: Share to Mastodon and 𝕏 (Twitter)

For Mastodon and 𝕏 the system SHALL open a share intent in a new window whose text is
`encodeURIComponent('#sound_buttons #' + config?.fullName ?? name)` + `'%0A'` + the encoded deep link.
Because `+` binds tighter than `??`, the expression evaluates as
`('#sound_buttons #' + config?.fullName) ?? name`, so when `config.fullName` is missing the text becomes
literally `#sound_buttons #undefined` rather than falling back to the character name. This current
behaviour SHALL be preserved (not "fixed").

#### Scenario: Share to Mastodon
- **GIVEN** a button and a loaded config with `fullName`
- **WHEN** `shareToMastodon(button)` is called
- **THEN** the system SHALL `window.open('https://toot.kytta.dev/?text=...')` with the encoded `#sound_buttons #<fullName>` text, `%0A`, and the encoded deep link

#### Scenario: Share to 𝕏 (Twitter)
- **GIVEN** a button and a loaded config with `fullName`
- **WHEN** `shareToTwitter(button)` is called
- **THEN** the system SHALL `window.open('https://twitter.com/intent/tweet?text=...')` with the encoded `#sound_buttons #<fullName>` text, `%0A`, and the encoded deep link

#### Scenario: Missing full name
- **GIVEN** `config?.fullName` is undefined
- **WHEN** a Mastodon or 𝕏 share is built
- **THEN** the share text SHALL be `#sound_buttons #undefined` (current `+`/`??` precedence behaviour)

### Requirement: Share to Facebook

For Facebook the system SHALL open `https://www.facebook.com/sharer/sharer.php?u=<encoded url>&hashtag=%23sound_buttons`.
Unlike Mastodon/𝕏, the Facebook share SHALL NOT include the `#sound_buttons #<fullName>` text — only
the encoded URL and the fixed `hashtag` parameter.

#### Scenario: Share to Facebook
- **GIVEN** a button
- **WHEN** `shareToFacebook(button)` is called
- **THEN** the system SHALL open `https://www.facebook.com/sharer/sharer.php?u=<encodeURIComponent(url)>&hashtag=%23sound_buttons` with no share-text parameter

