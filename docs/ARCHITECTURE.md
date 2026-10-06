# Architecture and safe evolution

## Current implementation

Plain browser modules render reusable elements with textContent; user reflections do not become HTML. The native Node HTTP server has explicit routes and a static-file allowlist. Authenticated student routes resolve the repository from the session's user ID and reject a conflicting account header.

PostgreSQL stores users and sessions relationally. pathora_user_students references the user with ON DELETE CASCADE and stores a bounded JSONB student document. pathora_career_catalog holds editable structured curricula. Updates lock the student's row in a transaction; validation failures roll back. Isolated test/demo repositories implement the same update interface.

This increment adds document.pathboard with saved career IDs and per-career reflection/experiment records. Missing fields default safely for existing accounts. It does not destructively migrate or replace saved user data. The student state API returns only the current account's board. productEvents are private server-generated events, not a client-controlled event ingestion endpoint.

Modules:

- backend/exploration/catalog.js: reviewed career summaries and authored experiments.
- backend/exploration/service.js: bounded validation, reflection requirements, and mutations.
- backend/internships/service.js: transactional integration with existing student data.
- frontend/modules/explore.js: exploration cards.
- frontend/modules/career-detail.js: work, experiments, sources, and Path choice.
- frontend/modules/pathboard.js: comparison and reflection forms.

## Target relational model

Normalize when the need for cross-user reporting, independently versioned curricula, or richer evidence relationships justifies the migration. Do not claim the following tables already exist.

Career → CareerSource → Source
Career → CareerSkill → Skill
Career → CareerExperiment
Path → PathStage → Milestone → MilestonePrerequisite
Milestone → MilestoneSkill → Skill
User → UserCareer (saved option, reflection)
User → UserExperiment → CareerExperiment
User → UserPath → Path (versioned curriculum)
UserPath → MilestoneProgress → Milestone
User → Evidence → EvidenceSkill → Skill
Evidence → MilestoneEvidence → MilestoneProgress
UserPath → WeeklyAction → MilestoneProgress
User → Application
User → PathHistory → UserPath

Requirements: unique user/career and user/experiment identities; foreign keys; validated enum statuses; no prerequisite cycles; immutable completed-Path versions; evidence reusable across Paths; user ID constraints on reads and writes; deletion cascading through user-owned records. A Path change closes a history interval and creates the next UserPath. It never deletes evidence or previously completed work.

Migration steps: define versioned source schemas, back up the database, write an idempotent migration mapping legacy role/task IDs, verify counts and account ownership, compare API outputs, then switch repository implementations. Keep a rollback path. Do not bulk replace existing catalog data on startup.

## Explicit limits

The current catalog and UI are a starter alpha, not validated professional curricula. Comparison focus statements and exercises are editorial choices, not quantitative fit scores. Skills are self-reported, and task evidence is not independently assessed. There is no production email provider, account deletion flow, durable analytics warehouse, or public hosting configuration. PostgreSQL data persists; the explicitly labeled demo is temporary.
