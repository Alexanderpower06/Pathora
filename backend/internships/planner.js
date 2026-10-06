import { EXPLORATION_CAREERS } from '../exploration/catalog.js';
import { pathboardState } from '../exploration/service.js';
import { onboardingStatus } from '../onboarding/service.js';
import { skillMatch } from '../onboarding/matching.js';
import { publicCatalog, ROLES } from './catalog.js';
import { recommendRoles } from './matching.js';
import { buildTasks } from './tasks.js';
import { scheduleWeek } from './schedule.js';

export function buildStudentState(document, now = new Date(), careers = {}) {
  const profile = document.profile;
  const catalog = publicCatalog();
  const roles = { ...ROLES, ...careers };
  catalog.roles.push(...Object.values(careers));
  catalog.skills = [
    ...new Set([
      ...catalog.skills,
      ...Object.values(careers).flatMap((career) => Object.values(career.categories).flat()),
    ]),
  ];
  const onboardingCompleted = onboardingStatus(document).completed;
  if (!profile)
    return {
      demo: Boolean(document.demo),
      profile: null,
      onboardingCompleted,
      catalog,
      explorationCareers: EXPLORATION_CAREERS,
      pathboard: pathboardState(document),
      recommendations: [],
      tasks: [],
      applications: [],
    };
  const records = document.progress[profile.role] ?? {};
  const tasks = buildTasks(profile, careers).map((task) => ({
    ...task,
    ...(records[task.id] ?? { status: 'todo', evidence: '', link: '' }),
  }));
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat('en', {
      timeZone: profile.timeZone ?? 'America/New_York',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    })
      .formatToParts(now)
      .map((part) => [part.type, part.value]),
  );
  const today = `${parts.year}-${parts.month}-${parts.day}`;
  const daysLeft = Math.ceil(
    (new Date(profile.targetDate + 'T00:00:00Z') - new Date(today + 'T00:00:00Z')) / 86400000,
  );
  const { weekly, plannedHours } = scheduleWeek(tasks, profile.weeklyHours, daysLeft <= 14);
  const done = tasks.filter((task) => task.status === 'done');
  const applications = document.applications;
  const warnings = [];
  if (daysLeft < 0)
    warnings.push('Your application target has passed. Update it and check current openings.');
  else if (daysLeft <= 14)
    warnings.push(
      'Your target is within two weeks. Prioritize suitable applications and resume feedback; you can keep learning alongside them.',
    );
  if (profile.role === 'undecided')
    warnings.push(
      'Your plan starts with exploration. Choose a direction when you have enough information to try it.',
    );
  const outstandingHours = tasks
    .filter((task) => task.status !== 'done')
    .reduce((sum, task) => sum + task.hours, 0);
  return {
    demo: Boolean(document.demo),
    profile,
    onboardingCompleted,
    explorationCareers: EXPLORATION_CAREERS,
    pathboard: pathboardState(document),
    skillMatch: roles[profile.role]
      ? skillMatch(profile.existingSkills, roles[profile.role])
      : null,
    catalog,
    recommendations: careers[profile.role]
      ? Object.values(careers).map((career) => ({
          ...career,
          reasons: ['Explore this predefined career. Your major does not restrict your choice.'],
        }))
      : recommendRoles(profile),
    selectedRole: roles[profile.role] ?? null,
    tasks,
    weekly,
    next: tasks.find((task) => task.id === weekly[0]) ?? null,
    plannedHours,
    completion: Math.round((done.length / tasks.length) * 100),
    completedCount: done.length,
    evidence: done.map((task) => ({
      id: task.id,
      title: task.title,
      evidence: task.evidence,
      link: task.link,
    })),
    recognizedExperience: [
      profile.courses && `Coursework: ${profile.courses}`,
      profile.experience && `Experience: ${profile.experience}`,
      profile.existingSkills.length && `Reported skills: ${profile.existingSkills.join(', ')}`,
      profile.additionalSkills?.length &&
        `Other reported skills: ${profile.additionalSkills.join(', ')}`,
      profile.additionalInterests?.length &&
        `Other interests: ${profile.additionalInterests.join(', ')}`,
    ].filter(Boolean),
    gaps:
      profile.role === 'undecided'
        ? []
        : roles[profile.role].skills.filter((skill) => !profile.existingSkills.includes(skill)),
    applications,
    reminders: applications.filter(
      (item) =>
        !['Rejected', 'Withdrawn', 'Offer'].includes(item.status) &&
        ((item.status === 'Saved' && item.deadline && item.deadline <= today) ||
          (item.followUp && item.followUp <= today)),
    ),
    warnings,
    estimatedWeeks: Math.ceil(outstandingHours / profile.weeklyHours),
  };
}
export function emptyStudentDocument() {
  return { profile: null, progress: {}, applications: [] };
}
