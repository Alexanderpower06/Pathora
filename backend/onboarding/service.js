import { draftKey, sanitizeDraft } from './drafts.js';
import { InputError } from '../validation.js';
import {
  defaultCareers,
  SITUATIONS,
  DEGREES,
  EXPERIENCES,
  LEVELS,
  PREFERENCES,
} from './catalog.js';
import { COMMON_INTERESTS, publicCatalog } from '../internships/catalog.js';
import { validateStep, validateFinder } from './validation.js';
import { careerMatches, skillMatch } from './matching.js';

export function onboardingStatus(document) {
  return (
    document.onboarding ?? {
      completed: Boolean(document.profile),
      step: 1,
      highestStep: 1,
      stage: 'goal',
      answers: {},
    }
  );
}
export function createOnboardingService(repository, getCareers = defaultCareers) {
  async function present(document) {
    const onboarding = onboardingStatus(document);
    const answers = { ...onboarding.answers, ...onboarding.drafts?.[draftKey(onboarding)] };
    const careers = await getCareers();
    const career = careers.find((item) => item.id === onboarding.answers.role);
    return {
      ...onboarding,
      answers,
      demo: Boolean(document.demo),
      catalog: {
        careers,
        situations: SITUATIONS,
        degrees: DEGREES,
        experiences: EXPERIENCES,
        levels: LEVELS,
        preferences: PREFERENCES,
        interests: COMMON_INTERESTS,
        majors: publicCatalog().majorOptions.flatMap((group) => group.majors),
      },
      matches: onboarding.stage === 'matches' ? careerMatches(onboarding.answers, careers) : [],
      summary: career
        ? { career, skills: skillMatch(onboarding.answers.existingSkills ?? [], career) }
        : null,
    };
  }
  async function change(action) {
    return present(
      await repository.update((document) => {
        document.onboarding ??= onboardingStatus(document);
        if (document.onboarding.completed)
          throw new InputError('Your setup is complete. Edit your profile instead.', 409);
        action(document.onboarding, document);
      }),
    );
  }
  return {
    state: async () => present(await repository.read()),
    async draft(input) {
      return change((flow) => {
        if (input.step !== flow.step || input.stage !== flow.stage || flow.step > 5)
          throw new InputError('The step changed. Reload before saving.', 409);
        flow.drafts ??= {};
        flow.drafts[draftKey(flow)] = sanitizeDraft(flow.step, input.answers);
      });
    },
    async step(input) {
      const careers = await getCareers();
      return change((flow) => {
        if (input.step !== flow.step || flow.step > 5)
          throw new InputError('This step changed. Reload before saving.', 409);
        const answers = validateStep(flow.step, input.answers, flow.answers, careers);
        if (flow.drafts) delete flow.drafts[draftKey(flow)];
        Object.assign(flow.answers, answers);
        flow.step += 1;
        flow.highestStep = Math.max(flow.highestStep, flow.step);
        if (input.step === 3) flow.stage = 'goal';
      });
    },
    async navigate(input) {
      return change((flow) => {
        if (
          !Number.isInteger(input.step) ||
          input.step < 1 ||
          input.step > Math.min(5, flow.highestStep)
        )
          throw new InputError('Complete the earlier steps first.');
        flow.step = input.step;
        if (flow.step === 3) flow.stage = 'goal';
      });
    },
    async finder(input) {
      return change((flow) => {
        if (flow.step !== 3) throw new InputError('Open the career goal step first.', 409);
        if (input.stage === 'start') flow.stage = 'interests';
        else if (input.stage === 'back')
          flow.stage =
            input.target === 'interests' ? 'interests' : input.target === 'quiz' ? 'quiz' : 'goal';
        else if (input.stage === flow.stage && ['interests', 'quiz'].includes(input.stage)) {
          if (flow.drafts) delete flow.drafts[draftKey(flow)];
          Object.assign(flow.answers, validateFinder(input.stage, input.answers));
          flow.stage = input.stage === 'interests' ? 'quiz' : 'matches';
        } else throw new InputError('Reload the current career finder step.', 409);
      });
    },
    async complete() {
      const careers = await getCareers();
      return change((flow, document) => {
        if (flow.step !== 6) throw new InputError('Complete all five steps first.');
        for (let step = 1; step <= 5; step++)
          validateStep(step, flow.answers, flow.answers, careers);
        const target = new Date();
        target.setDate(target.getDate() + 56);
        document.profile = {
          ...flow.answers,
          name: flow.answers.name || 'there',
          timeZone: flow.answers.timeZone ?? 'America/New_York',
          weeklyHours: 5,
          targetDate: target.toISOString().slice(0, 10),
          interests: flow.answers.interests ?? [],
          additionalInterests: [],
          additionalSkills: [],
          courses: '',
          experience: flow.answers.experienceKinds.filter((kind) => kind !== 'None Yet').join(', '),
        };
        flow.completed = true;
        flow.completedAt = new Date().toISOString();
      });
    },
  };
}
