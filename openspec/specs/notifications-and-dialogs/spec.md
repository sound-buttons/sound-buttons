# Notifications and Dialogs

## Purpose

The application provides user feedback through toast notifications (ngx-toastr) and a shared modal
dialog (ngx-bootstrap). A central service exposes pending/success/error/warning toasts and a modal
event channel; a dialog host component renders modal content (including raw HTML).

Implemented in `src/app/services/dialog.service.ts` and `src/app/dialog/dialog.component.ts` / `.html`,
configured in `src/app/app.module.ts`.

## Requirements

### Requirement: Toast notifications

The system SHALL provide pending, success, error, and warning toasts via ngx-toastr, with pending
toasts returning a dismissible id. Toasts SHALL be positioned bottom-center and, by module default,
not time out unless a timeout is given.

#### Scenario: Pending toast lifecycle
- **GIVEN** a long-running action begins
- **WHEN** `toastPending(message, title?)` is called
- **THEN** the system SHALL show an info toast and return a `toastId`
- **AND** `disablePending(toastId)` SHALL clear that toast when `toastId > 0`

#### Scenario: Success and error toasts
- **GIVEN** an action completes
- **WHEN** `toastSuccess(...)` or `toastError(...)` is called
- **THEN** the system SHALL show the corresponding toast, honoring an optional timeout

#### Scenario: Warning toast with timeout
- **GIVEN** a transient warning
- **WHEN** `toastWarning(message, title?, timeout?)` is called
- **THEN** the system SHALL show a warning toast, applying `timeOut` with `disableTimeOut: false` when a timeout is provided

#### Scenario: Default toast configuration
- **GIVEN** the toastr module configuration
- **WHEN** any toast is shown
- **THEN** it SHALL use `positionClass: 'toast-bottom-center'` and `disableTimeOut: true` unless overridden

### Requirement: Modal dialog channel

The system SHALL expose a `showModal` event carrying `{ title, message }` and an `onHideModal` event,
allowing any component to request a modal.

#### Scenario: Requesting a modal
- **GIVEN** a component needs to show a modal
- **WHEN** it emits `showModal.emit({ title, message })`
- **THEN** the dialog host SHALL open a modal with that title and message

### Requirement: Modal rendering with HTML content

The dialog host SHALL render the modal message as HTML (bypassing sanitization) and emit `onHideModal`
when the modal hides.

#### Scenario: Rendering HTML message
- **GIVEN** a modal request with an HTML message
- **WHEN** the dialog host shows it
- **THEN** it SHALL render the message via `bypassSecurityTrustHtml` into the modal body (`[innerHTML]`)

#### Scenario: Hiding the modal
- **GIVEN** a modal is open
- **WHEN** it is hidden
- **THEN** the host SHALL emit `onHideModal`
