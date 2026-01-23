# Sound Buttons Configs - AI Agent Instructions

## Repository Overview

This repository (`sound-buttons_configs`) contains JSON configuration data for the Sound Buttons web application. It is used as a **git submodule** in the main [sound-buttons](https://github.com/sound-buttons/sound-buttons) frontend repository at path `src/assets/configs/`.

The repository manages character profiles and sound button data for VTubers. Each character has their own JSON configuration file containing metadata and categorized sound buttons.

## Repository Structure

```text
sound-buttons_configs/
├── main.json                    # Master index of all characters
├── template.json                # Reference template for new characters
├── {character}.json             # Individual character configurations
├── scripts/
│   └── sort-by-button-count.zsh # Utility script to sort characters
├── .github/
│   └── workflows/
│       └── build.yml            # CI: minify JSON and trigger main repo
├── LICENSE                      # AGPLv3
└── README.md
```

## Key Files

### main.json

The master index file containing an array of all available characters. Each entry includes:

```json
{
  "name": "characterId",
  "fullName": "Display Name",
  "fullConfigURL": "assets/configs/{character}.json",
  "liveUpdateURL": "https://blob.sound-buttons.click/sound-buttons/{character}/{character}.json",
  "imgSrc": ["https://.../{character}.png"],
  "color": {
    "primary": "#HEX",
    "secondary": "#HEX"
  }
}
```

### Character Configuration Files ({character}.json)

Each character has a dedicated JSON file with the following structure:

```json
{
  "name": "characterId",
  "fullName": "Display Name",
  "fullConfigURL": "assets/configs/{character}.json",
  "imgSrc": ["image URLs"],
  "intro": "Character introduction text",
  "color": {
    "primary": "#HEX",
    "secondary": "#HEX"
  },
  "link": {
    "youtube": "URL",
    "twitch": "URL",
    "twitter": "URL",
    "facebook": "URL",
    "instagram": "URL",
    "discord": "URL",
    "other": "URL"
  },
  "introButton": { /* optional intro button */ },
  "buttonGroups": [
    {
      "name": {
        "zh-tw": "Group Name (Chinese)",
        "ja": "Group Name (Japanese)"
      },
      "baseRoute": "https://blob.sound-buttons.click/sound-buttons/{character}/",
      "buttons": [
        {
          "id": "uuid",
          "filename": "audio.webm",
          "text": {
            "zh-tw": "Button Text (Chinese)",
            "ja": "Button Text (Japanese)"
          },
          "baseRoute": null,
          "volume": 1,
          "source": {
            "videoId": "YouTubeVideoId",
            "start": 0,
            "end": 10
          }
        }
      ]
    }
  ]
}
```

### template.json

A reference template file showing the complete structure for creating new character configurations. Use this as a starting point when adding new characters.

## Data Schema

### Button Object

| Field | Type | Required | Description |
| ----- | ---- | -------- | ----------- |
| `id` | string (UUID) | Yes | Unique identifier for the button |
| `filename` | string | Yes | Audio filename (typically .webm format) |
| `text` | object/string | Yes | Display text (multi-language object or string) |
| `baseRoute` | string/null | No | Override base URL for audio file |
| `volume` | number | Yes | Playback volume multiplier (default: 1) |
| `source` | object | No | YouTube source reference |
| `SASToken` | string | No | Azure Blob Storage SAS token |

### Source Object

| Field | Type | Description |
| ----- | ---- | ----------- |
| `videoId` | string | YouTube video ID |
| `start` | number | Start timestamp in seconds |
| `end` | number | End timestamp in seconds |

### Multi-language Text

Text fields support multi-language using an object with language codes:

```json
{
  "zh-tw": "正體中文文字",
  "ja": "日本語テキスト"
}
```

Supported languages: `zh-tw` (Traditional Chinese), `ja` (Japanese)

## CI/CD Workflow

### build.yml

The GitHub Actions workflow performs:

1. **JSON Syntax Check**: Validates all JSON files
2. **Mirror to minify branch**: Copies content to `minify` branch
3. **Minification**: Uses MinifyAllCli to compress JSON files
4. **Auto Commit**: Commits minified files
5. **Dispatch Event**: Triggers the main `sound-buttons` repository to rebuild

The main frontend repository checks out this submodule's `minify` branch during production builds to use minified JSON files.

## Adding New Characters

1. Copy `template.json` to `{newCharacter}.json`
2. Update all fields with character-specific data
3. Add character entry to `main.json` array
4. Audio files should be uploaded to Azure Blob Storage at:
   `https://blob.sound-buttons.click/sound-buttons/{character}/`

## Adding New Buttons

1. Open the character's JSON file
2. Find the appropriate `buttonGroup` or create a new one
3. Add a new button object with:
   - Generate a new UUID for `id`
   - Set `filename` to the audio file name
   - Provide `text` in both `zh-tw` and `ja` (Japanese can be empty string if not available)
   - Set `volume` (usually 1)
   - Add `source` with YouTube reference if applicable

## Utility Scripts

### sort-by-button-count.zsh

Zsh script to sort characters in `main.json` by their total button count (descending order).

**Requirements**: `jq`, `sponge` (from moreutils)

**Usage**:

```bash
cd scripts
./sort-by-button-count.zsh
```

## Important Notes

1. **Audio Format**: Audio files are typically in `.webm` format for web compatibility.

2. **UUID Generation**: Each button must have a unique UUID. Generate using standard UUID v4 format.

3. **baseRoute Priority**: If a button has `baseRoute: null`, it inherits from the parent `buttonGroup.baseRoute`.

4. **Azure Blob Storage**: Audio files are stored in Azure Blob Storage. The base URL pattern is:
   - `https://blob.sound-buttons.click/sound-buttons/{character}/`
   - Legacy: `https://soundbuttons.blob.core.windows.net/sound-buttons/{character}/`

5. **Minification**: The `minify` branch contains compressed JSON. The `master` branch maintains human-readable formatting.

## License

This repository is licensed under [AGPLv3](./LICENSE).
