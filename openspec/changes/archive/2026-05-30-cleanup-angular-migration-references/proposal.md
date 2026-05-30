## Why

The Angular 14 → 21 upgrade is finished and archived (change `upgrade-angular-14-to-21`), but the
codebase, the contributor docs, and several OpenSpec specs still read as if that one-time migration
is in progress. References like "during the migration", "before the upgrade", "pre-upgrade behaviour",
"replacing the abandoned `@ctrl/ngx-rightclick`", "migration-critical units", the step-by-step
`14→15→…→21` upgrade requirement, and a `TBD` spec Purpose are now stale and confusing. The
steady-state documentation should describe an Angular 21 application, keeping migration history only
where it belongs — in the archived change.

## What Changes

- Reframe the migration-process wording in four capability specs to describe the current Angular 21
  steady state, without weakening any behavioural requirement:
  - `frontend-platform`: generalize the incremental-upgrade requirement to be version-agnostic
    (drop the literal `14→15→…→21` / `ng update` / "upgrade to Angular 21 is complete" framing);
    restate the build-pipeline/test-runner requirement as current infrastructure rather than
    something "the upgrade SHALL preserve"; drop "blocks the upgrade" phrasing.
  - `automated-test-harness`: rename the "Migration-critical capabilities" scenario to
    "Behaviour-critical capabilities"; drop "not the previously pinned Angular-14-era Node 16.20.2"
    from the CI Node scenario (keep the Node ≥ 20.19 requirement); and replace the stale hardcoded
    "14 OpenSpec capability specs" / "all 14 capabilities" count with version- and count-agnostic
    wording (there are now 16 capabilities; the count would only drift again).
  - `right-click-context-menu`: state the CDK Overlay trigger/close mechanism positively, dropping the
    "(replacing the abandoned `@ctrl/ngx-rightclick` …)" / "(replacing `ContextMenuService.closeAll()`)"
    migration parentheticals.
  - `sharing`: drop "during migration" from the preserved-`#undefined` behaviour requirement.
- Fix non-requirement spec prose (direct main-spec edits): write a real Purpose for `frontend-platform`
  (currently the `TBD` archive placeholder) and remove migration framing from the `automated-test-harness`
  and `right-click-context-menu` Purposes.
- Clean migration wording from contributor docs and source comments: `AGENTS.md`, `TESTING.md`,
  `karma.conf.js`, `.github/workflows/test.yml`, and two test comments
  (`config.service.spec.ts`, `audio.service.spec.ts`).
- No production code, dependency, build-output, or test-behaviour changes — this is documentation and
  spec-text only. The 209-spec suite, lint, and build SHALL remain green and unchanged.

## Capabilities

### New Capabilities

<!-- None. -->

### Modified Capabilities

- `frontend-platform`: generalize the incremental-upgrade requirement and de-migration the
  build-pipeline and dependency-policy requirement wording (no behavioural change).
- `automated-test-harness`: de-migration the traceability scenario name and the CI Node-version
  scenario wording, and replace the stale hardcoded "14 capability specs" count with count-agnostic
  wording (no behavioural change).
- `right-click-context-menu`: de-migration the trigger and closing-behaviour requirement wording
  (no behavioural change).
- `sharing`: de-migration the Mastodon/𝕏 share requirement wording (no behavioural change).

## Impact

- **Specs**: `openspec/specs/frontend-platform`, `automated-test-harness`, `right-click-context-menu`,
  `sharing` (requirement wording via deltas; Purpose prose via direct edits).
- **Docs**: `AGENTS.md`, `TESTING.md`.
- **Source/config comments**: `karma.conf.js`, `.github/workflows/test.yml`,
  `src/app/services/config.service.spec.ts`, `src/app/services/audio.service.spec.ts`.
- **No impact** on runtime code, dependencies, CI behaviour, coverage thresholds, or the deployable
  `dist/sound-buttons` output.

## Out of Scope

- Any genuine future-scope exclusions that merely use the word "migrating" generically (e.g. "Migrating
  to zoneless change detection is out of scope", "Migrating to the esbuild `application` builder") —
  these are version-agnostic scope statements, not 14→21 migration framing, and stay as-is.
