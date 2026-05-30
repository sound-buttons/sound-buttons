## MODIFIED Requirements

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
