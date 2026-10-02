import { ROLES, RESOURCES } from './catalog.js';

function task(id, title, category, hours, why, deliverable, resource, dependencies = []) {
  return { id, title, category, hours, why, deliverable, resource, dependencies };
}
export function buildTasks(profile, careers = {}) {
  if (careers[profile.role]) return careers[profile.role].milestones;
  const shared = [
    task(
      'compare-postings',
      'Compare three internship postings',
      'Direction',
      1,
      'Employer requirements differ. Use actual postings to check this starter plan.',
      'Save three relevant links and note requirements, preferences, eligibility, location, and deadlines.',
      RESOURCES.jobs,
    ),
    task(
      'resume',
      'Draft your internship résumé',
      'Applications',
      1,
      'A class project, campus job, club, or volunteer role can demonstrate useful experience.',
      'Write a one-page résumé with education, skills, and two specific examples of your work.',
      RESOURCES.resume,
    ),
    task(
      'review',
      'Get a résumé review',
      'Feedback',
      0.5,
      'Feedback helps you spot unclear examples and missing information.',
      'Ask your campus career center or a trusted reviewer for feedback and record one improvement.',
      RESOURCES.resume,
      ['resume'],
    ),
    task(
      'apply',
      'Submit one suitable internship application',
      'Applications',
      1,
      'You can apply while continuing to learn. Check the posting’s actual eligibility requirements.',
      'Tailor your résumé, submit a suitable application, and add it to your tracker.',
      RESOURCES.jobs,
      ['resume', 'compare-postings'],
    ),
    task(
      'conversation',
      'Have one career conversation',
      'Feedback',
      0.5,
      'A mentor, alumnus, professor, or career adviser can help you test your assumptions.',
      'Ask about internship work and record one useful insight or next action.',
      RESOURCES.explore,
    ),
  ];
  if (profile.role === 'undecided')
    return [
      task(
        'explore',
        'Try a small exercise in two directions',
        'Direction',
        1,
        'You do not need to choose a career forever. Test what feels interesting before committing.',
        'Compare two role descriptions, try a short exercise in each, and record what you enjoyed.',
        RESOURCES.explore,
      ),
      ...shared.filter((item) => item.id !== 'apply'),
    ];
  const role = ROLES[profile.role];
  const hasFoundation = role.skills.some((skill) => profile.existingSkills.includes(skill));
  const fundamentals = task(
    'foundation',
    hasFoundation ? 'Demonstrate a skill you already have' : role.fundamentals,
    'Skills',
    1,
    hasFoundation
      ? 'Build on your reported experience. A concrete example is more useful than a checked skill.'
      : 'A short exercise exposes a useful gap without delaying all other preparation.',
    role.practice,
    role.source,
  );
  const project = [
    task(
      'project-outline',
      `Scope ${role.project.toLowerCase()}`,
      'Project',
      0.5,
      'A small, finished project is easier to explain than a large unfinished one.',
      `${role.deliverable} Write a short scope and choose a class project to adapt, if you have one.`,
      role.source,
    ),
    task(
      'project-build',
      'Build the first working project slice',
      'Project',
      1,
      'Make one small feature or analysis work before adding extras.',
      'Implement one small part of your project scope and record what is still missing.',
      role.source,
      ['project-outline'],
    ),
    task(
      'project-finish',
      'Finish the core project scope',
      'Project',
      1,
      'Complete the small scope before polishing or adding more features.',
      role.deliverable,
      role.source,
      ['project-build'],
    ),
    task(
      'project-check',
      'Test your work and explain the tradeoffs',
      'Project',
      1,
      'Employers need to understand your decisions, not just see a screenshot.',
      'Check correctness, get feedback, and write what you changed and one limitation.',
      role.source,
      ['project-finish'],
    ),
    task(
      'project-publish',
      'Publish a portfolio case study',
      'Project',
      1,
      'A link and a clear explanation make your work easier to discuss.',
      'Publish your work with a README or case study covering the problem, your contribution, and results.',
      role.source,
      ['project-check'],
    ),
  ];
  return [
    shared[0],
    shared[1],
    fundamentals,
    shared[2],
    shared[3],
    project[0],
    shared[4],
    ...project.slice(1),
    task(
      'interview',
      'Practice explaining your work',
      'Interviews',
      1,
      'Practice can happen alongside applications and project work.',
      'Record a two-minute project explanation and prepare one teamwork example. Note one improvement.',
      role.source,
    ),
  ];
}
