# Audio Submission

## Purpose

Users can contribute new sound buttons by submitting a clip through an upload form. A contribution
provides Chinese/Japanese names, a target group, and exactly one audio source — a YouTube share link,
a YouTube/Twitch clip URL, or a directly uploaded audio file — which the backend processes
asynchronously. This capability covers the form, its validation rules, client-side file handling, the
multipart submission, status polling, and the post-submit redirect to the live-update preview.

Implemented in `src/app/upload/upload.component.ts` / `.html`.

## Requirements

### Requirement: Submission form and required fields

The system SHALL present a reactive form whose submit button is disabled while the form is invalid.
`nameZH` and `group` SHALL be required.

#### Scenario: Submit disabled when invalid
- **GIVEN** the form has validation errors
- **WHEN** the upload form renders
- **THEN** the submit button SHALL be disabled (`[disabled]="form.invalid"`)

#### Scenario: Required name and group
- **GIVEN** the user leaves `nameZH` or `group` empty
- **WHEN** validation runs on blur
- **THEN** those controls SHALL be invalid (`Validators.required`)

### Requirement: Exactly one audio source

The system SHALL require that exactly one of the three sources — `videoId` (YouTube share link),
`clip` (YouTube/Twitch clip URL), or `file` (uploaded file) — is provided. Zero or more than one SHALL
make the form invalid.

#### Scenario: Exactly one source provided
- **GIVEN** precisely one of `videoId`, `clip`, or `file` is filled
- **WHEN** the source validators run
- **THEN** the count check (`!== 1`) SHALL pass for all three controls

#### Scenario: No source provided
- **GIVEN** none of `videoId`, `clip`, or `file` is filled
- **WHEN** the user attempts to submit
- **THEN** the form SHALL be invalid and a toastError for `'請填入必填欄位'` SHALL be shown

#### Scenario: Multiple sources provided
- **GIVEN** two or more of `videoId`, `clip`, or `file` are filled
- **WHEN** validation runs
- **THEN** the source controls SHALL be invalid and the "請只選擇一種" hint SHALL be highlighted

### Requirement: YouTube link and clip validation

The system SHALL validate that a provided `videoId` matches the YouTube link pattern yielding an
11-character id, and that a provided `clip` matches the YouTube-clip or Twitch-clip URL pattern.

#### Scenario: Valid YouTube share link
- **GIVEN** a `videoId` input containing a valid YouTube URL or id
- **WHEN** the validator runs
- **THEN** it SHALL extract an 11-character video id and be valid

#### Scenario: Invalid YouTube link
- **GIVEN** a `videoId` input that does not match the pattern
- **WHEN** `OnYoutubeLinkChange` resolves an empty id
- **THEN** the system SHALL clear the embed and show a toastError `'Invalid Link: ' + value`

#### Scenario: Valid clip URL
- **GIVEN** a `clip` input matching the YouTube-clip or Twitch-clip regex
- **WHEN** the validator runs
- **THEN** it SHALL be valid

### Requirement: Clip timing constraints

For YouTube-sourced clips the system SHALL reject a negative `start`, SHALL require `end > start`, and
SHALL limit clip length to at most 180 seconds.

#### Scenario: Negative start
- **GIVEN** the `videoId` field is dirty and `start < 0`
- **WHEN** the `start` validator runs
- **THEN** it SHALL be invalid (`{ start: true }`)

#### Scenario: End not after start or clip too long
- **GIVEN** the `videoId` field is dirty and either `start >= end` or `end - start > 180`
- **WHEN** the `end` validator runs
- **THEN** it SHALL be invalid (`{ end: true }`)

### Requirement: Uploaded file handling

The system SHALL accept audio (or video) files up to 30,000,000 bytes, reject others with a toast, and
read the file's duration client-side to patch the `end` value.

#### Scenario: Oversized file
- **GIVEN** a selected file larger than 30,000,000 bytes
- **WHEN** `OnFileUpload` runs
- **THEN** the system SHALL clear the file and show a toastError using key `'音檔上限'` with value `'30MB'`

#### Scenario: Wrong file type
- **GIVEN** a selected file whose MIME type does not start with `audio` or `video`
- **WHEN** `OnFileUpload` runs
- **THEN** the system SHALL clear the file and show a toastError for `'僅限上傳音訊檔案'`

#### Scenario: Reading duration to patch end
- **GIVEN** a valid audio file is selected
- **WHEN** the file is decoded via `AudioContext.decodeAudioData`
- **THEN** the system SHALL set `duration` to the decoded buffer duration and set `end = ceil(start + duration)`

### Requirement: Multipart submission and status polling

On submit the system SHALL POST a `multipart/form-data` payload to `${api}/sound-buttons` and then
poll the returned status URI until the operation completes or times out. No SAS token, captcha, or
anti-spam token is sent.

#### Scenario: Posting the contribution
- **GIVEN** a valid form
- **WHEN** `OnSubmit` runs
- **THEN** the system SHALL build `FormData` with fields `nameZH`, `nameJP` (or `'[useSTT]'` when STT is checked), `group`, `videoId`, `clip`, the file, `directory` (= active character name), `volume` = `'1'`, `start`, `end`, and `toastId`, and POST it to `${api}/sound-buttons`

#### Scenario: Pending feedback and polling
- **GIVEN** the POST returns a `statusQueryGetUri`
- **WHEN** submission is in progress
- **THEN** the system SHALL show a pending toast and poll the status URI on `timer(10000, 20000)` taking up to 30 attempts, skipping while status is `202`

#### Scenario: Missing polling URI
- **GIVEN** the response lacks `statusQueryGetUri`
- **WHEN** `OnSubmit` processes the response
- **THEN** the system SHALL clear pending, show toastError `'上傳失敗，伺服器未回應輪詢 URI'`, and throw

### Requirement: Submission result feedback

The system SHALL report success or failure via toasts based on the polled result and HTTP error
status.

#### Scenario: Successful processing
- **GIVEN** the polled status body has a truthy `output`
- **WHEN** polling resolves
- **THEN** the system SHALL show toastSuccess `'{name} 上傳成功'` and call `configService.reloadConfig()`

#### Scenario: Error responses by status
- **GIVEN** the POST or poll fails with an HTTP error
- **WHEN** the error handler runs
- **THEN** the system SHALL show: `'上傳失敗，欄位錯誤'` for 400; `'上傳回應超時'` for 0/408; `'上傳失敗，伺服器錯誤'` for 500; and a toastWarning `'上傳回應異常'` otherwise

### Requirement: Post-submit redirect to live preview

Immediately after dispatching the submission the system SHALL reset the form and redirect to the
character board with `liveUpdate=1` so the contributor can preview pending content.

#### Scenario: Redirecting after submit
- **GIVEN** the submission has been dispatched
- **WHEN** `OnSubmit` finishes its synchronous work
- **THEN** the system SHALL reset the form and `router.navigate(['/', config.name], { queryParams: { liveUpdate: '1' }, queryParamsHandling: 'merge' })`

### Requirement: Backend warm-up

The system SHALL issue a warm-up request on init to mitigate serverless cold starts.

#### Scenario: Warming up the backend
- **GIVEN** the upload component initializes
- **WHEN** `ngOnInit` runs
- **THEN** the system SHALL GET `${api}/healthz`
