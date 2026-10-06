# Pathora product contract

First audience: college Computer Science students who are uncertain about their direction or overwhelmed about what to prioritize. The problem is fragmented advice, not a shortage of information.

Promise: choose where you are going, understand what comes next, and record meaningful progress. Human decides → Pathora organizes → human acts → Pathora tracks → human learns.

Core journey: Explore → Try → Choose → Build → Prove → Progress → Next Move. No generative AI is required. Career choice belongs to the student; preferences must never automatically assign a career.

## This implementation increment

Explore shows five technology directions in a fixed order: Software Engineering, Cybersecurity, Data Analytics / Data Science, Cloud / DevOps, and IT / Systems. Occupational summaries reference O*NET, carry review dates, and distinguish sourced facts from Pathora curriculum. The Cloud and Data families explicitly explain that the referenced occupation is not identical to every job title. Salary, education, and outlook are linked to sources instead of guessed or copied without context.

A private Pathboard saves careers without changing the active Path. Students can compare typical work, focus, environment, starter skills, and tools. Each direction has a small local experiment and saved reflections. Experiment completion requires a description of work, five experience reflections, and a Yes / Maybe / No follow-up. This is self-reported learning, not skill certification. Removing a career from the board preserves the reflection.

Choosing a Path uses the existing profile and predefined curriculum. Previous per-career milestones, evidence, applications, and skills remain intact. The two added Cloud and IT curricula have prerequisite chains for their practice and project work. Existing curricula and edited PostgreSQL catalog rows are retained rather than rewritten automatically.

The dashboard uses Next Move and Pathora Progress terminology. It explains the scheduler and the exact equal-weight milestone completion calculation. Self-reported skills never become completed milestones automatically.

Server-side career_saved, experiment_started, and experiment_completed events are recorded atomically with the action. Events contain a name, career ID, and time, not reflection text. They remain local to the account document and are bounded to the latest 500 entries. This is initial instrumentation, not a production analytics or retention reporting system.

## Next increments, in order

1. Interview 15–25 CS students using RESEARCH.md. Do not claim these interviews happened.
2. Review all five curricula with students and career educators; replace the older generic milestone rationale with specific prerequisites and deliverables through a versioned catalog migration.
3. Introduce the four career-clarity choices in onboarding. Uncertain students should reach Explore without having to select a career first. Existing onboarding currently retains its original finder.
4. Develop explicit milestone and skill states, linking evidence to demonstrated skills and retaining historical definitions. Evidence should not become verified merely because a student supplies it.
5. Add a Repath preview explaining which evidence is relevant to the new Path. Current switching preserves earlier records but does not yet calculate transferable milestone credit.
6. Make a weekly action connect to a milestone, then test custom weekly actions before adding more task-management features.
7. Finish production authentication: verification, reset, deletion, privacy terms, HTTPS/cookies, backups, and hosting. Existing server remains localhost-only; it is not ready for a public deployment.
8. Alpha with 5–10 students, fix observed blockers, then a closed beta with 25–50 students. Broader rollout depends on demonstrated usefulness.

## Product decision filter

For a significant change, record the specific problem, observed evidence, frequency, current workaround, Pathora advantage, affected core-loop step, complexity, and success measure. If the evidence is missing, treat it as a hypothesis to test rather than a reason to expand scope.

Future / requires user evidence: AI coaching, personality assessments, broad career expansion, job boards, social feeds, gamification, employer and university portals, complex resume tools, advanced analytics, and notifications. The retained application tracker supports existing users; it is not the expansion priority.

## Measurement

North Star: Weekly Path Progressors — distinct users completing at least one meaningful Path action in a defined week. An experiment is a learning action, not automatically a milestone in the chosen Path. Avoid counting duplicate completion events, page views, or checkbox toggles as progress. Define the reporting timezone and qualifying event list before implementing a production aggregation.

Measure onboarding completion, first Path selected, first Next Move started/completed, experiment completion, evidence added, return usage, and 7-/30-day retention. These are questions to measure, not invented benchmarks.
