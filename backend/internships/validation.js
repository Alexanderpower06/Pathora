import { SITUATIONS, DEGREES, EXPERIENCES, LEVELS } from '../onboarding/catalog.js';
import { one, many } from '../onboarding/validation.js';
import { InputError, validateText } from '../validation.js';
import { INTERESTS, SKILLS, ROLES } from './catalog.js';

export const APPLICATION_STATUSES = [
  'Saved',
  'Applied',
  'Interviewing',
  'Offer',
  'Rejected',
  'Withdrawn',
];
function list(value, allowed, label) {
  if (
    !Array.isArray(value) ||
    value.length > allowed.length ||
    value.some((item) => !allowed.includes(item))
  )
    throw new InputError(`Choose valid ${label}.`);
  return [...new Set(value)];
}
function additionalList(value = [], label) {
  if (!Array.isArray(value) || value.length > 5)
    throw new InputError(`Add up to 5 other ${label}.`);
  return [...new Set(value.map((item) => validateText(item, label, 80, true)))];
}
export function validateDate(value, label, required = false) {
  const text = validateText(value ?? '', label, 10, required);
  if (!text && !required) return '';
  const date = new Date(text + 'T00:00:00Z');
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(text) ||
    Number.isNaN(date.getTime()) ||
    date.toISOString().slice(0, 10) !== text
  )
    throw new InputError(`${label} must be a valid date.`);
  return text;
}
export function validateUrl(value) {
  const text = validateText(value ?? '', 'Link', 1000);
  if (!text) return '';
  let url;
  try {
    url = new URL(text);
  } catch {
    throw new InputError('Use a complete http or https link.');
  }
  if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password)
    throw new InputError('Use an http or https link without credentials.');
  return url.href;
}
function validateTimeZone(value) {
  const zone = validateText(value ?? 'America/New_York', 'Time zone', 80, true);
  try {
    new Intl.DateTimeFormat('en', { timeZone: zone });
  } catch {
    throw new InputError('Choose a valid time zone.');
  }
  return zone;
}

export function validateStudent(input, careers = {}) {
  const roles = { ...ROLES, ...careers };
  const skills = [
    ...new Set([
      ...SKILLS,
      ...Object.values(careers).flatMap((career) => Object.values(career.categories).flat()),
    ]),
  ];
  const student =
    !input.situation || ['College Student', 'High School Student'].includes(input.situation);
  const graduation = validateText(input.graduation ?? '', 'Graduation month', 7, student);
  if (graduation && !/^20\d{2}-(0[1-9]|1[0-2])$/.test(graduation))
    throw new InputError('Choose a graduation month.');
  if (!Number.isInteger(input.weeklyHours) || input.weeklyHours < 1 || input.weeklyHours > 20)
    throw new InputError('Choose 1 to 20 hours per week.');
  const role = validateText(input.role, 'Role', 30, true);
  if (role !== 'undecided' && !Object.hasOwn(roles, role))
    throw new InputError('Choose a supported internship direction.');
  if (input.experienceKinds?.includes('None Yet') && input.experienceKinds.length > 1)
    throw new InputError('Choose None Yet by itself.');
  return {
    situation: input.situation
      ? one(input.situation, SITUATIONS, 'a current situation')
      : 'College Student',
    degree: input.degree ? one(input.degree, DEGREES, 'a degree level') : '',
    school: validateText(input.school ?? '', 'School', 150),
    experienceKinds: many(input.experienceKinds ?? [], EXPERIENCES, 'experience'),
    skillLevels: Object.fromEntries(
      Object.entries(input.skillLevels ?? {})
        .filter(([skill]) => input.existingSkills.includes(skill))
        .map(([skill, level]) => [skill, one(level, LEVELS, 'a skill level')]),
    ),
    timeZone: validateTimeZone(input.timeZone),
    name: validateText(input.name, 'Name', 80, true),
    major: validateText(
      input.major ?? '',
      'Major',
      150,
      !input.situation || input.situation === 'College Student',
    ),
    graduation,
    weeklyHours: input.weeklyHours,
    targetDate: validateDate(input.targetDate, 'Application target', true),
    role,
    interests: list(input.interests, INTERESTS, 'interests'),
    existingSkills: list(input.existingSkills, skills, 'skills'),
    additionalInterests: additionalList(input.additionalInterests, 'interests'),
    additionalSkills: additionalList(input.additionalSkills, 'skills'),
    courses: validateText(input.courses ?? '', 'Courses', 1500),
    experience: validateText(input.experience ?? '', 'Experience', 2000),
  };
}
export function validateTaskUpdate(input) {
  if (!['todo', 'done', 'blocked'].includes(input.status))
    throw new InputError('Choose a valid task status.');
  const evidence = validateText(input.evidence ?? '', 'Evidence or blocker', 1500);
  if (input.status !== 'todo' && evidence.length < 10)
    throw new InputError('Describe what you did or where you are stuck in at least 10 characters.');
  return { status: input.status, evidence, link: validateUrl(input.link) };
}
export function validateStudentApplication(input, careers = {}) {
  const roles = { ...ROLES, ...careers };
  if (!APPLICATION_STATUSES.includes(input.status))
    throw new InputError('Choose a valid application status.');
  const role = validateText(input.role, 'Role', 30, true);
  if (!Object.hasOwn(roles, role))
    throw new InputError('Choose an internship direction for this application.');
  return {
    company: validateText(input.company, 'Company', 120, true),
    title: validateText(input.title, 'Position', 150, true),
    role,
    status: input.status,
    link: validateUrl(input.link),
    deadline: validateDate(input.deadline, 'Deadline'),
    followUp: validateDate(input.followUp, 'Follow-up'),
    notes: validateText(input.notes ?? '', 'Feedback or next action', 1500),
  };
}
