import { careers } from './roadmaps.js';

export const DEFAULT_PROFILE = Object.freeze({
  name: '',
  major: '',
  education: 'Undergraduate student',
  skills: '',
  experience: '',
  interests: '',
  career: 'Software Engineer',
});
export const APPLICATION_STATUSES = Object.freeze([
  'Applied',
  'Interviewing',
  'Offer',
  'Rejected',
  'Withdrawn',
]);
const EDUCATION_LEVELS = new Set([
  'Undergraduate student',
  'High school student',
  'Graduate student',
  'Graduate / career changer',
]);

export class InputError extends Error {
  constructor(message, status = 400) {
    super(message);
    this.name = 'InputError';
    this.status = status;
  }
}

export function validateText(value, field, maxLength, required = false) {
  if (typeof value !== 'string') throw new InputError(`${field} must be text.`);
  const trimmed = value.trim();
  if (required && !trimmed) throw new InputError(`${field} is required.`);
  if (trimmed.length > maxLength) {
    throw new InputError(`${field} must be ${maxLength} characters or fewer.`);
  }
  return trimmed;
}

export function validateProfile(input) {
  const profile = {};
  for (const key of Object.keys(DEFAULT_PROFILE)) {
    const limit = ['experience', 'interests'].includes(key) ? 2000 : 300;
    profile[key] = validateText(
      input[key] ?? '',
      key,
      limit,
      ['name', 'major', 'career'].includes(key),
    );
  }
  // Only explicitly supported career keys are valid; inherited properties are not careers.
  if (!Object.hasOwn(careers, profile.career)) {
    throw new InputError('Choose a supported career.');
  }
  if (!EDUCATION_LEVELS.has(profile.education)) {
    throw new InputError('Choose a supported education level.');
  }
  return profile;
}

export function validateApplication(input) {
  return {
    company: validateText(input.company, 'Company', 120, true),
    role: validateText(input.role, 'Role', 120, true),
  };
}

export function validateStatus(status) {
  if (!APPLICATION_STATUSES.includes(status)) {
    throw new InputError('Choose a valid application status.');
  }
  return status;
}

export function validateChecklist(input, plan) {
  const categories = {
    skills: plan.skills,
    projects: plan.projectTasks,
    experience: plan.experience,
    interviews: plan.interviews,
  };
  if (
    !Object.hasOwn(categories, input.category) ||
    !Number.isInteger(input.index) ||
    input.index < 0 ||
    input.index >= categories[input.category].length ||
    typeof input.done !== 'boolean'
  ) {
    throw new InputError('Invalid checklist update.');
  }
  return input;
}
