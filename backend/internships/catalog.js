import { MAJOR_OPTIONS } from './major-catalog.js';

export const REVIEWED_ON = '2026-10-01';
export const COMMON_INTERESTS = [
  'Fitness',
  'Sports',
  'Reading and writing',
  'Music',
  'Art and design',
  'Technology',
  'Gaming',
  'Travel',
  'Cooking',
  'Nature and the outdoors',
  'Volunteering',
  'Learning new things',
  'Helping others',
  'Meeting new people',
  'Organizing events',
];
export const COMMON_SKILLS = [
  'Critical thinking',
  'Time management',
  'Teamwork',
  'Digital literacy',
  'Communication',
  'Problem solving',
  'Organization',
  'Adaptability',
  'Leadership',
  'Creativity',
  'Active listening',
  'Research',
  'Decision making',
  'Attention to detail',
  'Presentation skills',
];
// Older profile selections remain valid and editable; new profiles see the common lists.
export const INTERESTS = [
  ...new Set([...COMMON_INTERESTS, ...MAJOR_OPTIONS.flatMap((group) => group.interests)]),
];
export const SKILLS = [
  ...new Set([...COMMON_SKILLS, ...MAJOR_OPTIONS.flatMap((group) => group.skills)]),
];
export const ROLES = {
  frontend: {
    id: 'frontend',
    name: 'Frontend developer intern',
    description: 'Build accessible interfaces and make websites useful on different devices.',
    interest: 'Building websites',
    skills: ['HTML and CSS', 'JavaScript', 'Git'],
    fundamentals: 'Build a small accessible web page',
    practice:
      'Use semantic HTML, responsive CSS, and one JavaScript interaction. Test it with a keyboard.',
    project: 'A campus event finder',
    deliverable:
      'A responsive event finder with filtering, an empty state, and keyboard-accessible controls.',
    source: {
      title: 'MDN frontend curriculum',
      url: 'https://developer.mozilla.org/en-US/curriculum/core/',
    },
    stretch:
      'Framework experience may be useful; check each posting before adding it to your plan.',
  },
  backend: {
    id: 'backend',
    name: 'Backend developer intern',
    description: 'Build APIs, store data, and make services behave reliably.',
    interest: 'Solving technical problems',
    skills: ['Python', 'SQL', 'Git'],
    fundamentals: 'Build and test a small API',
    practice:
      'Use a language you know to build one API endpoint. Validate input and test a successful and an invalid request.',
    project: 'A campus club directory API',
    deliverable:
      'An API with create and read operations, a database, input validation, and automated tests.',
    source: {
      title: 'MDN server-side introduction',
      url: 'https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Server-side/First_steps/Introduction',
    },
    stretch:
      'Cloud tools and frameworks depend on the employer; fundamentals come first in this starter plan.',
  },
  data: {
    id: 'data',
    name: 'Data analyst intern',
    description: 'Clean data, investigate questions, and communicate useful findings.',
    interest: 'Working with data',
    skills: ['SQL', 'Spreadsheets', 'Python'],
    fundamentals: 'Answer a question with a small dataset',
    practice:
      'Clean a dataset, check missing values, and answer one question with a spreadsheet or SQL query.',
    project: 'A campus or community data case study',
    deliverable:
      'A reproducible analysis with three findings, clear charts, and a discussion of limitations.',
    source: {
      title: 'PostgreSQL SQL tutorial',
      url: 'https://www.postgresql.org/docs/current/tutorial-sql.html',
    },
    stretch: 'Dashboard tools vary by employer. Compare actual postings before choosing one.',
  },
};
export const RESOURCES = {
  resume: {
    title: 'CareerOneStop resume guide',
    url: 'https://www.careeronestop.org/JobSearch/Resumes/ResumeGuide/introduction.aspx',
  },
  explore: { title: 'My Next Move career exploration', url: 'https://www.mynextmove.org/' },
  jobs: {
    title: 'CareerOneStop job-search tools',
    url: 'https://cloudfront.careeronestop.org/GetMyFuture/Toolkit/toolkit.aspx',
  },
};
export const GENERAL_SOURCES = Object.values(RESOURCES);
export function publicCatalog() {
  return {
    roles: Object.values(ROLES),
    interests: INTERESTS,
    skills: SKILLS,
    majorOptions: MAJOR_OPTIONS,
    commonInterests: COMMON_INTERESTS,
    commonSkills: COMMON_SKILLS,
    sources: GENERAL_SOURCES,
    reviewedOn: REVIEWED_ON,
  };
}
