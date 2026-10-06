import { InputError, validateText } from '../validation.js';
import { explorationCareer } from './catalog.js';

export const REFLECTION_FIELDS = {
  interests: 'What interests me?',
  concerns: 'What concerns me?',
  heard: 'What have I heard?',
  verify: 'What do I want to verify?',
  enjoyed: 'What did I enjoy?',
  disliked: 'What did I dislike?',
  difficult: 'What was difficult?',
  improve: 'What would I want to become better at?',
  professional: 'Would I want to do similar work professionally?',
};
export function pathboardState(document) {
  return structuredClone(document.pathboard ?? { saved: [], entries: {} });
}
function event(document, name, careerId) {
  document.productEvents ??= [];
  document.productEvents.push({ name, careerId, at: new Date().toISOString() });
  document.productEvents = document.productEvents.slice(-500);
}
export function updatePathboard(document, input) {
  if (!input || typeof input !== 'object' || Array.isArray(input))
    throw new InputError('Invalid Pathboard change.');
  const career = explorationCareer(input.careerId);
  if (!career) throw new InputError('Choose a supported exploration career.');
  const board = (document.pathboard ??= { saved: [], entries: {} });
  if (input.action === 'save') {
    if (!board.saved.includes(career.id)) {
      board.saved.push(career.id);
      event(document, 'career_saved', career.id);
    }
    return;
  }
  if (input.action === 'unsave') {
    board.saved = board.saved.filter((id) => id !== career.id);
    return; // Reflections remain available when the career is added again.
  }
  if (!['reflect', 'start-experiment', 'complete-experiment'].includes(input.action))
    throw new InputError('Unsupported Pathboard action.');
  const entry = board.entries[career.id] ?? {
    reflection: {},
    experiment: { status: 'not-started' },
  };
  if (input.action === 'start-experiment') {
    if (entry.experiment.status !== 'completed' && entry.experiment.status !== 'in-progress') {
      entry.experiment = { status: 'in-progress', startedAt: new Date().toISOString() };
      event(document, 'experiment_started', career.id);
    }
  } else {
    const reflection = {};
    if (
      !input.reflection ||
      typeof input.reflection !== 'object' ||
      Array.isArray(input.reflection)
    )
      throw new InputError('Reflection must be an object.');
    for (const [key, label] of Object.entries(REFLECTION_FIELDS))
      reflection[key] = validateText(input.reflection[key] ?? '', label, 1000);
    if (!['Yes', 'Maybe', 'No', ''].includes(input.reflection.exploreFurther ?? ''))
      throw new InputError('Choose Yes, Maybe, or No.');
    reflection.exploreFurther = input.reflection.exploreFurther ?? '';
    if (input.action === 'complete-experiment') {
      const evidence = validateText(input.evidence ?? '', 'Experiment evidence', 2000, true);
      if (evidence.length < 10)
        throw new InputError('Describe your experiment in at least 10 characters.');
      for (const key of ['enjoyed', 'disliked', 'difficult', 'improve', 'professional']) {
        if (!reflection[key])
          throw new InputError(`${REFLECTION_FIELDS[key]} is required to finish the experiment.`);
      }
      if (!reflection.exploreFurther)
        throw new InputError('Choose whether you would explore this further.');
      const completed = entry.experiment.status === 'completed';
      entry.experiment = {
        ...entry.experiment,
        status: 'completed',
        evidence,
        completedAt: new Date().toISOString(),
      };
      if (!completed) event(document, 'experiment_completed', career.id);
    }
    entry.reflection = reflection;
  }
  entry.updatedAt = new Date().toISOString();
  board.entries[career.id] = entry;
  if (!board.saved.includes(career.id)) board.saved.push(career.id);
}
