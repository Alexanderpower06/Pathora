import { InputError } from '../validation.js';
// Drafts preserve incomplete inputs; only validateStep can advance or create a profile.
const keys = {
  1: ['situation'],
  2: ['degree', 'major', 'school', 'graduation'],
  3: ['role', 'interests', 'preferences', 'environment', 'quiz'],
  4: ['existingSkills', 'skillLevels'],
  5: ['experienceKinds', 'name'],
};
export const draftKey = (flow) => `${flow.step}-${flow.step === 3 ? flow.stage : 'step'}`;
export function sanitizeDraft(step, answers) {
  if (!answers || typeof answers !== 'object' || Array.isArray(answers))
    throw new InputError('Enter step answers.');
  const draft = {};
  for (const key of keys[step] ?? []) {
    const value = answers[key];
    if (value === undefined) continue;
    if (['quiz', 'skillLevels'].includes(key)) {
      if (
        !value ||
        typeof value !== 'object' ||
        Array.isArray(value) ||
        Object.keys(value).length > 200
      )
        throw new InputError('Too many draft values.');
      draft[key] = Object.fromEntries(
        Object.entries(value).filter(
          ([name, item]) =>
            name.length <= 80 &&
            (key === 'quiz'
              ? Number.isInteger(item) && item >= 0 && item <= 3
              : ['', 'Beginner', 'Intermediate', 'Advanced'].includes(item)),
        ),
      );
    } else if (Array.isArray(value)) {
      if (value.length > 200 || value.some((item) => typeof item !== 'string' || item.length > 150))
        throw new InputError('Invalid draft selections.');
      draft[key] = [...new Set(value)];
    } else {
      if (typeof value !== 'string' || value.length > 150)
        throw new InputError('Keep answers under 150 characters.');
      draft[key] = value;
    }
  }
  return draft;
}
