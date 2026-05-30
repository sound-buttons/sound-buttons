## 1. Spec requirement deltas (applied at archive time)

- [x] 1.1 `frontend-platform`: confirm the delta MODIFIES "No framework-coupled dependency blocks the Angular target" (drop "blocks the upgrade" → "would block adopting that major"), "Build pipeline and test runner preserved" (drop "The upgrade SHALL preserve" / "as before the upgrade"), and "Incremental, behaviour-preserving upgrade" (drop the literal `14→…→21`, `ng update`, and "upgrade to Angular 21 is complete" framing; keep the incremental + behaviour-preserving + lint/test/build obligations).
- [x] 1.2 `automated-test-harness`: confirm the delta MODIFIES "Behavioral traceability to OpenSpec requirements" (rename scenario "Migration-critical capabilities are exhaustively covered" → "Behaviour-critical capabilities are exhaustively covered", and replace the hardcoded "14 OpenSpec capability specs" / "all 14 capabilities" with "all OpenSpec capability specs" / "all OpenSpec capabilities") and "CI test gate blocks unverified deployment" (drop "not the previously pinned Angular-14-era Node 16.20.2", keep Node ≥ 20.19).
- [x] 1.3 `right-click-context-menu`: confirm the delta MODIFIES "Context menu trigger and context binding" (drop the "(replacing the abandoned `@ctrl/ngx-rightclick` trigger directive)" parenthetical and "previously bound" → "binds") and "Closing behaviour after actions" (drop the "(replacing `ContextMenuService.closeAll()`)" parenthetical).
- [x] 1.4 `sharing`: confirm the delta MODIFIES "Share to Mastodon and 𝕏 (Twitter)" (drop "during migration").

## 2. Non-requirement spec prose (direct main-spec edits)

- [x] 2.1 `openspec/specs/frontend-platform/spec.md`: replace the `Purpose` placeholder ("TBD - created by archiving change upgrade-angular-14-to-21. Update Purpose after archive.") with an accurate purpose describing the supported Angular major + toolchain, Zone-based change detection, the webpack `:browser` builder + Karma/Jasmine runner, and the framework-coupled-dependency / behaviour-preserving-upgrade discipline.
- [x] 2.2 `openspec/specs/automated-test-harness/spec.md`: in `Purpose`, change "pins the application's current behavior before the Angular 14 → 21 migration" → "pins the application's current observable behaviour to guard against regressions".
- [x] 2.3 `openspec/specs/right-click-context-menu/spec.md`: in `Purpose`, drop "because its implementation currently depends on the abandoned `@ctrl/ngx-rightclick` library and must be re-implemented behaviour-compatibly during the framework migration"; restate as the menu being implemented in-repo on Angular CDK Overlay.

## 3. Contributor documentation

- [x] 3.1 `TESTING.md`: de-migration the title/intro ("behaviour preservation for the Angular 14 → 21 migration", "introduced during the migration"), the "migration-critical units" phrase (→ "behaviour-critical units"), and "during the migration" in the known-latent-behaviours section — reframing the harness as ongoing regression protection.
- [x] 3.2 `AGENTS.md`: change "migration-critical units" → "behaviour-critical units" and "documents the behaviour-preservation harness (built for the Angular 14 → 21 migration)" → a version-neutral description.

## 4. Source and config comments

- [x] 4.1 `karma.conf.js`: reword the coverage-threshold comment ("regression introduced during the Angular 14 -> 21 migration is caught", "migration-critical") to version-neutral wording ("behaviour-critical").
- [x] 4.2 `.github/workflows/test.yml`: reword the Node-version comment "Conservative Angular-14-verified Node version." to reflect the current Angular 21 / Node ≥ 20.19 requirement.
- [x] 4.3 `src/app/services/config.service.spec.ts`: change the comment "Known latent bug being pinned for the migration:" → "Known latent bug pinned by the harness:".
- [x] 4.4 `src/app/services/audio.service.spec.ts`: change "Captured so a migration that changes media timing is caught." → "Captured so a change that alters media timing is caught."

## 5. Verification

- [x] 5.1 `openspec validate cleanup-angular-migration-references --strict` passes.
- [x] 5.2 Re-grep the repo **with hidden paths included** (`rg --hidden`, excluding `openspec/changes/archive/**`, `node_modules/**`, `dist/**`, `.angular/**`, `tmp/**`, `package-lock.json`, `.git/**`) for `migrat`, `14 ?(→|->|to) ?21`, `pre-upgrade`, `post-upgrade`, `the upgrade`, `ng update`, `@ctrl/ngx-rightclick`, `Angular-14`, `previously pinned`, `before the upgrade`; confirm only the archived change and legitimate version-agnostic scope statements (generic "Migrating to …") remain. (Note: `.github/workflows/test.yml` is a hidden path — `--hidden` is required to catch it.)
- [x] 5.3 `npm run lint`, `CHROME_BIN=$(which chromium-browser) npm run test:ci` (209 specs + coverage gate), and `npm run build` all green with no new warnings and unchanged bundle output.
- [x] 5.4 After applying the direct Purpose edits (group 2) and archiving this change, confirm the merged `openspec/specs/**` validate `--strict` and that the four affected specs read as Angular 21 steady state. (The archive merge applies the requirement deltas; the Purpose edits must already be committed, as the merge does not touch the `Purpose` section.)
