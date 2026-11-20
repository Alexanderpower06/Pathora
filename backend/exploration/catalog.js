import { BASE_CAREERS } from './base-catalog.js';
import { PROFILES, ADDITIONAL, REVIEWED_ON, profileSources } from './profiles.js';
import { buildPreparation, PROJECTS } from './curricula.js';

export const EXPLORATION_CAREERS = [...BASE_CAREERS, ...ADDITIONAL].map((base) => {
  const profile = PROFILES[base.id];
  const career = {
    ...base,
    ...profile,
    reviewedOn: REVIEWED_ON,
    name:
      base.id === 'data-analyst'
        ? 'Data Analytics'
        : base.id === 'cloud'
          ? 'Cloud Engineering'
          : base.id === 'systems'
            ? 'IT / Systems Administration'
            : base.name,
    experienceLevels: [
      'Student / internship preparation',
      ...(['cybersecurity', 'network'].includes(base.id)
        ? ['Related experience often expected in referenced occupation']
        : []),
    ],
    educationFilter: profile.education.toLowerCase().includes('bachelor')
      ? 'Degree typically listed in occupation source'
      : 'Employer-specific; check posting',
    environmentFilter:
      profile.field === 'Data'
        ? 'Analysis and stakeholder communication'
        : profile.field === 'Software'
          ? 'Development and product teams'
          : profile.field === 'Security'
            ? 'Security investigation and coordination'
            : 'Infrastructure and technical support',
    sources: [
      ...(profile.onetCode ? [] : (base.sources ?? [])).map((source) => ({
        ...source,
        reviewedOn: REVIEWED_ON,
        status: 'reviewed',
        period: 'Occupational profile; accessed on review date',
      })),
      ...profileSources(profile),
    ],
    methodology:
      'Occupational descriptions and education use the linked O*NET and BLS sources. Preparation stages, starter tools, projects, and potential search titles are Pathora curriculum choices, not findings from a job-posting sample. Career choice remains yours.',
    hiringSignals: {
      status: 'Not available',
      detail:
        'No live employer-posting analysis is connected. These are researched preparation themes. Check each posting for required versus preferred qualifications, eligibility, location, and application dates.',
    },
    certifications:
      profile.certifications ??
      'No certification is required by this starter curriculum. A specific employer or specialization may ask for one.',
    review: {
      status: 'reviewed',
      reviewedOn: REVIEWED_ON,
      dueOn: '2027-01-20',
      curriculumStatus: 'Authored starter guidance; student and educator validation pending',
    },
  };
  career.milestones = buildPreparation(career);
  career.project = {
    title: PROJECTS[career.id][0],
    description: PROJECTS[career.id][1],
    features: PROJECTS[career.id][2],
    difficulty: 'Starter-to-intermediate; reduce scope if the prerequisites are new.',
    prerequisites: career.milestones.slice(0, 5).map((milestone) => milestone.title),
    skills: career.skills,
    evidence: career.milestones[5].evidence,
    presentation:
      'Explain the problem, your contribution, how to run or reproduce it, what you checked, and one limitation. Keep private data and credentials out of the artifact.',
  };
  career.experiment = {
    ...career.experiment,
    prerequisites:
      'Start with the relevant introductory resource. Reduce the task if the tools are new.',
    tools: career.technologies,
    resources: career.milestones[0].resources,
  };
  return career;
});
export const explorationCareer = (id) => EXPLORATION_CAREERS.find((career) => career.id === id);
export function reviewStatus(career, now = new Date()) {
  return now.toISOString().slice(0, 10) > career.review.dueOn ? 'Review due' : 'Sources reviewed';
}
