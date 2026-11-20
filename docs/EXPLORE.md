# Explore upgrade — October 20, 2026

## Problem and implementation boundary

A student needs to understand the work and act on a practical preparation sequence, not choose from a directory of titles. This increment implements Priority 1 and reuses the existing accounts, PostgreSQL repository, task dialog, Build roadmap, Pathboard, and visual system. It adds useful comparisons, starting-point explanations, and college guidance from Priority 2. Priority 3 is not implemented.

## What works

- Ten structured technology profiles: software, security, analytics, data science, cloud, DevOps, systems, network, database, and QA. The old analytics and cloud IDs remain stable; analytics and data science are now distinct, as are cloud and DevOps.
- Search by title, candidate search titles, skills, tools, or preparation milestones. Filters intersect and do not restrict choices by major or predict career fit. Filter classifications and search-title examples are editorial navigation aids.
- Interest shortcuts, removable filter chips, a saved-only view, and compact cards keep browsing manageable. Save toggles in place without leaving Explore. Select two or three cards to save a comparison in Pathboard; compared careers are also saved without changing the active Path.
- A dedicated career view with keyboard-accessible Overview, Your path, Skills & fit, Try this career, and Sources tabs and sticky Save / Choose controls. Seven flexible stages explain understanding the role, foundations, role-specific technologies, projects, experience, application preparation, and applying while improving.
- Eight specific practice milestones per profile, with why, tasks, prerequisite guidance, resources, evidence, and a next action. SQL practice has actual query tasks. Application preparation does not require finishing every technical milestone.
- Explore lives inside the signed-in workspace. /explore redirects visitors to /login?next=explore and signed-in users to /workspace#explore. Successful sign-in with that destination opens Explore; users with incomplete onboarding finish setup first. The welcome page has no public Explore link and /api/careers is not exposed.
- Existing saved careers, experiments, reflections, and evidence remain intact. New careers use the existing catalog initializer and account document. Selecting a Path changes the active role and retains prior per-role progress. Build task IDs are unchanged. Existing edited curriculum rows are not overwritten.
- Selected-Path milestones open the existing task dialog from Explore. In-progress can be saved without evidence; completion still requires a description. Practice instructions and resources are also shown in Build. The displayed one-hour budget is a first practice session, not a claim that a topic or project can be mastered in an hour.
- A two-/three-career comparison can be selected and saved in Pathboard. Notes remain the student's reflections per career. Removing a saved option does not erase its notes.
- Exact-name profile-skill comparisons are explicitly self-reported. No proficiency is inferred from a percentage or a completion click.
- Software specialization changes focus guidance. It does not silently replace the saved Build curriculum. The software project is a backend example. Full specialization-specific curricula remain future work.
- Career detail hashes resume that detail after reload. Search/filter state lasts while navigating within the workspace; it is not yet saved across sessions.

## Research and content maintenance

Sources were reviewed October 20, 2026. O*NET provides occupational tasks and context. BLS OOH provides education, May 2025 US median wages, and 2025–2035 projections. Source URLs, scope, period, review status, and next-review date accompany the structured data. Occupation boundaries stay visible: network architect data is experienced-occupation context; it is not entry-level network engineer pay. No salary is supplied for analytics, cloud, or DevOps because a comparable title-specific figure was not verified. No current employer-posting feed or sample analysis is connected.

Preparation milestones, experiments, entry-title search examples, and prioritization are authored guidance. They are not advertised as validated hiring requirements. Student/educator validation of these curricula is still needed.

Edit backend/exploration/profiles.js for descriptions and source metadata, curricula.js for practice tasks/projects/prerequisites, and resources.js for learning links. The page is schema-driven; content edits do not require frontend layout changes. base-catalog.js retains the original seed descriptions and experiment records; catalog.js combines the content. Run npm run careers:review and npm run check. Do not advance a review date without re-reading the relevant source. Review-due states appear after the stored due date. Recheck links before publishing. Resource pages may change after review.

New career IDs are inserted by the existing PostgreSQL initializer on restart. Existing edited catalog records are preserved. Changing an existing curriculum definition for active users needs a reviewed versioned migration; the Explore reference guide does not silently rewrite completed task semantics.

## Feedback and instrumentation

Authenticated users can submit a bounded source-content report. It is stored with needs-review status inside their account document, not emailed or automatically corrected. A production staff moderation/review interface and support process do not exist yet. Administrators should access reports only through an authorized, privacy-aware review workflow.

Search/view/resource/milestone events contain only an event name, career ID when relevant, and timestamp. Search query text is not recorded. Existing career_saved and experiment events remain. Events are bounded to 500 per account and repeated identical view events are deduplicated briefly. These are diagnostic events, not a production analytics dashboard or a complete retention measurement system.

## Still requires evidence / later work

Live hiring signals; multiple researched entry routes per specialization; automated occupation-data feeds; verified skill evidence; advanced comparative transitions; persistent specialization-specific curricula; production content-review tooling; and additional career fields. No AI was introduced.

## Verification and deployment

Unit/HTTP tests cover all ten content schemas, stable IDs, resources, search/filter intersections, comparison validation, sign-in redirects and private career access, bounded feedback, and progress preservation across new Paths. The browser suite includes signed-in search/filter/detail/reload/mobile and existing account/Pathboard regressions. Run it in CI where Chromium is supported. Manually check visitor redirects and signed-in flows, mobile overflow, focus, task dialog, save, and selection.

Restart npm run dev after pulling so the backend loads the new static-file routes and seeds. The local demo is disposable and uses a separate memory repository. Keep actual student data in PostgreSQL.
