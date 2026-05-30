## Context

The `upgrade-angular-14-to-21` change is complete and archived; the app now runs on Angular 21 with a
green 209-spec behaviour-preservation harness. The migration was authored as in-progress work, so its
artifacts left migration-process language scattered across the steady-state specs, the contributor
docs (`AGENTS.md`, `TESTING.md`), and a few source/config comments. Archiving the migration change also
created `openspec/specs/frontend-platform/spec.md` with a placeholder `Purpose` ("TBD … Update Purpose
after archive"). This change is pure documentation/spec-text cleanup: no runtime behaviour, dependency,
or test-assertion changes.

## Goals / Non-Goals

**Goals:**
- Make the four affected capability specs read as current-state Angular 21 requirements, with zero
  change to the actual normative behaviour each requirement encodes.
- Replace the `frontend-platform` `TBD` Purpose with an accurate one and de-migration the other two
  spec Purposes.
- Remove migration framing from `AGENTS.md`, `TESTING.md`, `karma.conf.js`, the CI Node comment, and
  two test comments.
- Keep lint, `test:ci` (209 specs + coverage gate), and `build` green and byte-for-byte equivalent in
  output.

**Non-Goals:**
- No production code, template, style, dependency, builder, or CI-trigger changes.
- Not removing generic, version-agnostic scope statements that merely contain the word "migrating"
  (e.g. zoneless / esbuild-builder exclusions).

## Decisions

### Decision 1: Modify requirements in place rather than REMOVE + ADD
Every requirement that carries migration framing is edited under `## MODIFIED Requirements` keeping its
**exact existing header text**, so the archive merge updates it in place and never orphans a renamed
requirement. The migration-specific phrasing lives in requirement bodies and scenario names/bodies, not
in the headers (except scenario titles, which MODIFIED reproduces wholesale), so in-place modification
is sufficient and lowest-risk. Alternative considered: REMOVE the `Incremental, behaviour-preserving
upgrade` requirement entirely — rejected because its non-version-specific intent (framework upgrades
must be incremental and behaviour-preserving, gated by lint/test/build) is still valuable ongoing
guidance; generalizing it preserves that value while dropping the `14→…→21` specifics.

### Decision 2: Handle non-requirement prose (Purpose) as direct main-spec edits, not deltas
OpenSpec delta files model only `### Requirement:` blocks; a spec's `## Purpose` section is not a
requirement and cannot be expressed as a delta. The archive tool itself defers Purpose authoring to a
human ("Update Purpose after archive"). Therefore the three Purpose fixes are tasks that edit
`openspec/specs/<cap>/spec.md` directly. These edits touch a different section than the requirement
deltas, so they coexist with — and survive — this change's own future archive merge.

### Decision 3: Keep the de-migration edits behaviour-neutral and verifiable
Each spec edit only removes migration-process wording or replaces it with an equivalent steady-state
phrasing; no SHALL/MUST clause, threshold, label, encoding, or scenario outcome changes. Verification is
twofold: `openspec validate --strict` must pass for the change and for all merged specs, and the full
gate (`lint`, `test:ci`, `build`) must stay green — proving the prose changes did not perturb behaviour.

### Decision 4: Replace the stale hardcoded "14 capability specs" count with count-agnostic wording
While de-migration-ing the `automated-test-harness` traceability requirement (already being MODIFIED for
the scenario rename), the hardcoded "14 OpenSpec capability specs" / "all 14 capabilities" is corrected to
"all OpenSpec capability specs" / "all OpenSpec capabilities". There are now 16 capabilities, so the
literal count is already stale and would drift again on every future capability. This is not Angular-version
framing, but it is stale documentation and a stale coverage obligation that under-counts the specs;
generalizing both restores accuracy and removes a magic number, without weakening the audit intent
(every requirement, every capability, maps to a test).

## Risks / Trade-offs

- **MODIFIED requirement loses detail if not reproduced fully** → Each MODIFIED block is copied verbatim
  from the current main spec and only the migration phrases are altered; `openspec validate --strict`
  guards header-match and scenario structure.
- **Generalizing the upgrade requirement could be read as weakening it** → The generalized wording keeps
  the same obligations (incremental, behaviour-preserving, lint/test/build gate) and merely removes the
  literal version sequence; it references `automated-test-harness` for the behavioural pin, so coverage
  is unchanged.
- **Direct Purpose edits diverge from the delta-driven flow** → Acceptable and intended by OpenSpec for
  the non-requirement Purpose section; clearly scoped as tasks so the apply phase performs them.

## Open Questions

- None.
