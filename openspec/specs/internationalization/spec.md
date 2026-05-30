# Internationalization

## Purpose

The application supports Traditional Chinese (`zh`, default) and Japanese (`ja`). Language is selected
automatically from the browser; there is no in-app language switcher. Multilingual content fields in
configuration (button text, group name, intro) are objects keyed by language and resolved at runtime.

Implemented in `src/app/services/language.service.ts`, with ngx-translate configured in
`src/app/app.module.ts` and `src/app/app.component.ts`. Translation files live in
`src/assets/i18n/zh.json` and `ja.json`.

## Requirements

### Requirement: Browser language detection

The system SHALL derive the active language from the browser's language, using only the first
two-letter subtag and defaulting to `zh` when none is available.

#### Scenario: Mapping browser locale to a supported language
- **GIVEN** `navigator.language` is `zh-TW` or `ja-JP`
- **WHEN** `LanguageService.BrowserLanguage` is computed
- **THEN** it SHALL be `zh` or `ja` respectively (first subtag only)

#### Scenario: Defaulting when no language is available
- **GIVEN** no usable browser language
- **WHEN** `BrowserLanguage` is computed
- **THEN** it SHALL default to `zh`

### Requirement: Translation initialization

The system SHALL configure ngx-translate with an HTTP loader for `/assets/i18n/*.json`, a default
language of `zh`, and SHALL switch to the detected browser language, falling back to `zh` on error.

#### Scenario: Applying the browser language
- **GIVEN** the application starts
- **WHEN** `AppComponent` initializes translation
- **THEN** it SHALL `setDefaultLang('zh')` then `use(BrowserLanguage)`

#### Scenario: Unsupported language fallback
- **GIVEN** the browser language is not supported
- **WHEN** `use()` errors
- **THEN** the system SHALL warn and fall back to `use('zh')`

### Requirement: Multilingual object resolution

The system SHALL resolve a multilingual field object to the string whose key matches the browser
language, falling back to the first key's value when no key matches.

#### Scenario: Resolving a matching language
- **GIVEN** a field object `{ zh: "中文字", ja: "日文字" }` and browser language `ja`
- **WHEN** `GetTextFromObject(obj)` runs
- **THEN** it SHALL return `"日文字"`

#### Scenario: Falling back to the first key
- **GIVEN** a field object whose keys do not include the browser language
- **WHEN** `GetTextFromObject(obj)` runs
- **THEN** it SHALL return the first key's value

### Requirement: No in-app language switching

The system SHALL determine language solely from the browser at load time, without a UI switcher or
localStorage/query-param override.

#### Scenario: Language fixed at load
- **GIVEN** the application is running
- **WHEN** the user looks for a language toggle
- **THEN** none SHALL exist; the language remains as detected at load
