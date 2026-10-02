import { InputError, validateText } from '../validation.js';
import { SITUATIONS, DEGREES, EXPERIENCES, LEVELS, PREFERENCES } from './catalog.js';
import { COMMON_INTERESTS, SKILLS } from '../internships/catalog.js';
export function one(value, allowed, label) {
  if (!allowed.includes(value)) throw new InputError(`Choose ${label}.`);
  return value;
}
export function many(value, allowed, label, required = false) {
  if (
    !Array.isArray(value) ||
    value.length > allowed.length ||
    value.some((item) => !allowed.includes(item)) ||
    (required && !value.length)
  )
    throw new InputError(`Choose valid ${label}.`);
  return [...new Set(value)];
}
export function validateStep(step, input, saved, careers) {
  if (!input || typeof input !== 'object' || Array.isArray(input))
    throw new InputError('Enter answers for this step.');
  if (step === 1) return { situation: one(input.situation, SITUATIONS, 'your current situation') };
  if (step === 2) {
    const student = ['College Student', 'High School Student'].includes(saved.situation);
    const college = saved.situation === 'College Student';
    const graduation = validateText(input.graduation ?? '', 'Graduation month', 7, student);
    if (graduation && !/^20\d{2}-(0[1-9]|1[0-2])$/.test(graduation))
      throw new InputError('Choose a valid graduation month.');
    return {
      degree: college
        ? one(input.degree, DEGREES, 'a degree level')
        : input.degree
          ? one(input.degree, DEGREES, 'a degree level')
          : '',
      major: validateText(input.major ?? '', 'Field of study', 150, college),
      school: validateText(input.school ?? '', 'School', 150),
      graduation,
    };
  }
  if (step === 3)
    return {
      role: one(
        input.role,
        careers.map((career) => career.id),
        'a career goal',
      ),
    };
  if (step === 4) {
    const allowed = [
      ...new Set([
        ...SKILLS,
        ...careers.flatMap((career) => Object.values(career.categories).flat()),
      ]),
    ];
    const existingSkills = many(input.existingSkills, allowed, 'skills');
    const skillLevels = {};
    for (const skill of existingSkills)
      if (input.skillLevels?.[skill])
        skillLevels[skill] = one(input.skillLevels[skill], LEVELS, 'a skill level');
    return { existingSkills, skillLevels };
  }
  const experienceKinds = many(input.experienceKinds, EXPERIENCES, 'experience options', true);
  if (experienceKinds.includes('None Yet') && experienceKinds.length > 1)
    throw new InputError('Choose None Yet by itself, or select your experience.');
  const timeZone = validateText(input.timeZone ?? 'America/New_York', 'Time zone', 80, true);
  try {
    new Intl.DateTimeFormat('en', { timeZone });
  } catch {
    throw new InputError('Choose a valid time zone.');
  }
  return { experienceKinds, name: validateText(input.name ?? '', 'Preferred name', 80), timeZone };
}
export function validateFinder(stage, input) {
  if (!input || typeof input !== 'object') throw new InputError('Choose your preferences.');
  if (stage === 'interests')
    return {
      interests: many(input.interests, COMMON_INTERESTS, 'interests'),
      preferences: many(input.preferences, PREFERENCES, 'work interests', true),
      environment: one(input.environment, ['desk', 'field', 'mixed', 'any'], 'a work environment'),
    };
  const quiz = {};
  for (const preference of PREFERENCES) {
    const value = input.quiz?.[preference];
    if (!Number.isInteger(value) || value < 0 || value > 3)
      throw new InputError('Answer every career finder question.');
    quiz[preference] = value;
  }
  return { quiz };
}
