# Pathora internship MVP

Pathora helps students and career explorers choose a direction and take a manageable next step. It uses predefined career data and explicit rules, with no AI calls or generated recommendations.

The public welcome page lives at `/`. Sign-up and sign-in continue to `/onboarding`: unfinished accounts resume their saved step, while completed accounts go directly to `/workspace`. Existing profiles remain complete and retain their previous plans.

## What a student can do

1. Choose a current situation, then enter education appropriate to that situation. College students provide degree, field of study, and graduation month; school and preferred name are optional. People exploring or changing careers can start without a degree.
2. Search eight careers or take a short career finder. Everyday interests use the same 15 suggestions for every major. Work preferences, six 0–3 ratings, and environment preferences produce explained scores: two career affinities each contribute up to 5 points, plus 2 for environment, divided by 12. Hobbies provide context; they do not prove career suitability. Scores are not a validated assessment or hiring prediction.
3. Choose career-specific skills and optional self-reported levels. Skill match counts selected core requirements divided by the career’s defined requirements. Four of eight selected core skills means 50%, regardless of confidence level. Extra skills remain saved but do not inflate this comparison.
4. Select experience, including **None Yet** as an ordinary exclusive option. Each step and incomplete input draft saves to the account; Back, refresh, and sign-out preserve answers. Check the save status before closing the browser.
5. See the goal, skill comparison, eight starter milestones, and recommended first step before entering the dashboard. The initial plan budgets five hours per week and sets an application target eight weeks away; both are editable in Profile.
6. Record practice and evidence, review My Skills and gaps, and track opportunities, deadlines and follow-ups. Applied opportunities document the applying step. Entries are manual; no applications or emails are sent.
7. Edit situation, education, career, skills, levels, and experience in Profile. **Change career goal** updates requirements and roadmap while keeping skills, previous career progress, and application records. Switching back restores that career’s evidence. Previous frontend/backend/data internship plans are preserved.

## Start with saved PostgreSQL storage

Requires Node.js 24 or newer.

```sh
npm install
npm run dev
```

Open http://127.0.0.1:4175. The development command starts a real local PostgreSQL server on port 55432. Data persists in `data/postgres`; credentials are generated in the ignored `data/` directory. Ctrl+C stops the app and database. Set `PORT` or `PG_DEV_PORT` to change ports. Run this from a normal terminal: restricted environments may prevent PostgreSQL shared-memory access.

For an existing PostgreSQL database, copy `.env.example` to `.env`, configure `DATABASE_URL`, and run `npm start`. The database user needs permission to create tables. Keep credentials out of Git. The runtime dependency is `pg`; embedded PostgreSQL is a development convenience.

## Try the temporary demo

```sh
npm run demo
```

Open http://127.0.0.1:4173. This uses the same HTTP routes, validation, planner, and frontend with a serialized in-memory test repository. The page clearly labels it as a demo. Accounts, sessions, profiles, tasks, and applications survive page refreshes but reset when the demo process restarts. It never reads or changes the PostgreSQL database. Use fictional data in demonstrations.

Opening HTML directly or using a static-only server does not run the API.

## Module layout

- `frontend/onboarding.html`, `onboarding.js`, `onboarding.css`, and focused view/field modules: five-step setup, quiz, validation, autosave, and payoff
- `backend/onboarding/`: career seed data, draft sanitization, step validation, deterministic scoring, service, and routes
- `frontend/auth.html`, `auth.js`, and `auth.css`: sign-in and account creation
- `backend/auth/`: password hashing, sessions, authentication routes, and PostgreSQL account storage
- `frontend/app.js`: application state, navigation, and module composition
- `frontend/modules/`: API client, DOM helpers, profile form, dashboard, direction comparison, roadmap, task evidence, and application tracking
- `backend/internships/`: curated catalog, matching, tasks, planner, validation, service, routes, and PostgreSQL repository
- `backend/http/`: JSON parsing and compatibility routes for the earlier career-dashboard API
- `backend/database.js` and `backend/schema.sql`: connection pool and additive database setup
- `backend/testing/`: isolated in-memory repository for tests and the labeled demo
- `backend/tests/`: domain and HTTP integration tests
- `backend/postgres.test.js`: PostgreSQL persistence, concurrent writes, and rollback tests
- `e2e/`: browser acceptance scenario
- `.github/`: continuous checks and dependency-update configuration

Each account stores its own document in `pathora_user_students`, keyed by user ID. Accounts and hashed sessions are stored in `pathora_users` and `pathora_sessions`. The previous single workspace in `pathora_student` is preserved but is not assigned automatically to a new account. The old shared career API is disabled in normal servers (only mounted explicitly in legacy regression tests). Existing career profiles and checklists remain in their original tables; they are not silently converted into different internship tasks. The legacy SQLite importer remains available with `npm run migrate:sqlite` and retains its source file. It imports legacy data only into an empty legacy destination.

## Coding practices

The supplied practices document guides this implementation: keep features small (KISS/YAGNI), reuse shared helpers (DRY), separate responsibilities, use clear names, and comment on decisions rather than obvious statements. JavaScript modules perform focused jobs; no application framework or class hierarchy is needed for this MVP.

Server-side validation rejects unsupported roles, unsafe link schemes, invalid dates, invalid budgets, and insufficient completion notes. User content is rendered as text. SQL values use parameters. PostgreSQL updates lock the account’s student row and commit or roll back together. Frontend saves are queued, failed saves leave forms open with readable errors, and stale task saves from another direction return a conflict.

Prettier formats the code and ESLint checks recommended rules, undefined/unused variables, strict equality, and variable declarations. Exact dependency versions and a lockfile support reproducible installs. Dependabot configuration proposes updates; it does not automatically merge them.

## Verify

```sh
npm run check
npm run test:postgres
npx playwright install chromium
npm run test:e2e
```

- `check`: formatting, lint, syntax, planner/validation/service tests, and HTTP integration tests using the in-memory repository
- `test:postgres`: real PostgreSQL integration tests, including retained legacy regressions. It uses an isolated temporary cluster, or `TEST_DATABASE_URL` with isolated temporary schemas. Use a dedicated test database with schema-creation privileges.
- `test:e2e`: the student browser journey against a disposable demo on port 4180; it does not touch saved data. The test includes onboarding, role choice, evidence validation, application tracking, reload, and a narrow viewport.

The GitHub workflow runs these checks with a PostgreSQL service. It becomes active after the files are pushed. A passing local domain/HTTP check does not establish that the PostgreSQL suite or browser runner has passed. Review changes and their tests before merging.

## Scope and known limits

This is a **local MVP with separate accounts**, not a publicly deployed service. The HTTP server binds to localhost and rejects non-local hosts. Public deployment still needs HTTPS with Secure cookies, verified email and password recovery, privacy/deletion controls, deployment configuration, durable abuse protection, and operational monitoring.

The eight new careers and retained three technology internship directions are curated starter guidance, not live vacancies, employer eligibility checks, or a psychometric test. Major supplies context and never excludes careers. Roadmap milestones describe focused practice sessions, not complete courses or credentials. Regulated careers require checking local education, licensing, and agency requirements. Coursework and experience are reported context, not verified credentials.

Effort estimates cover only the small starter tasks, not complete professional mastery. A blocked task can be documented and discussed with a campus adviser; the app does not supply a human mentor. Feedback is recorded for the student to act on, not automatically interpreted by AI. No wages, job-market forecasts, or hiring probabilities are invented.

Content sources: [MDN frontend curriculum](https://developer.mozilla.org/en-US/curriculum/core/), [MDN server-side introduction](https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Server-side/First_steps/Introduction), [PostgreSQL SQL tutorial](https://www.postgresql.org/docs/current/tutorial-sql.html), [CareerOneStop résumé guide](https://www.careeronestop.org/JobSearch/Resumes/ResumeGuide/introduction.aspx), [My Next Move](https://www.mynextmove.org/), and [CareerOneStop job-search tools](https://cloudfront.careeronestop.org/GetMyFuture/Toolkit/toolkit.aspx). Starter content was reviewed on 2026-10-01. Resource links should be rechecked when updating the catalog; employer requirements must be checked against individual postings.

## Accounts and sessions

Register with an email and a password of 15–128 characters, confirm it, and create your profile. Sign out from the workspace; sign back in to resume your own plan. Another account starts with an empty profile and cannot access your applications. Email ownership is not verified in this MVP; avoid real personal data in demonstrations. There is no password-reset flow yet.

Passwords use salted scrypt (N=131072, r=8, p=1) and are never returned to the frontend. Sessions use random 256-bit tokens, store only SHA-256 token hashes, expire after 24 hours, and are revoked on sign-out. Successful sign-in replaces the current browser session. Cookies are HttpOnly and SameSite=Strict; Secure is intentionally omitted for this localhost HTTP preview. Auth endpoints accept JSON, reject cross-origin requests, and limit attempts per IP to 20 per 15 minutes. The limiter is process-local and resets on server restart.

Security references: [OWASP password storage](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html) and [OWASP session management](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html).

## Editable career data

On startup, missing starter careers are inserted into `pathora_career_catalog(id, data JSONB)` with `ON CONFLICT DO NOTHING`. Existing database edits are preserved. The authenticated APIs read this table for career choices, categories, required core skills, finder affinities/environment, and roadmap milestones; UI code does not contain a career list.

Update a record through a database administration tool using parameterized SQL. Keep IDs stable, ensure every core skill appears in its categories, and keep milestone IDs unique and stable. Each record has `id`, `name`, `description`, `categories`, `skills`, two `affinities`, `environment`, `source`, `stretch`, and `milestones`. This MVP has no catalog administration UI. `backend/onboarding/catalog.js` defines the initial seed schema and content. Core skills and milestones should be reviewed with campus advisers before public release.

Account documents contain an `onboarding` object with `completed`, `step`, `highestStep`, `stage`, validated `answers`, and incomplete `drafts`. Only validated steps advance the flow, and completion revalidates all five steps atomically before creating the profile. Drafts never count as skills or completion. Previously completed profiles are recognized without a destructive migration.
