import { updatePathboard } from '../exploration/service.js';
import { defaultCareers, careerMap } from '../onboarding/catalog.js';
import { randomUUID } from 'node:crypto';
import { InputError } from '../validation.js';
import { validateStudent, validateTaskUpdate, validateStudentApplication } from './validation.js';
import { recommendRoles } from './matching.js';
import { buildStudentState } from './planner.js';
import { buildTasks } from './tasks.js';

function recordAppliedStep(document, application) {
  if (!['Applied', 'Interviewing', 'Offer', 'Rejected'].includes(application.status)) return;
  document.progress[application.role] ??= {};
  if (document.progress[application.role].apply?.status === 'done') return;
  document.progress[application.role].apply = {
    status: 'done',
    evidence: `Recorded a ${application.status.toLowerCase()} opportunity: ${application.title} at ${application.company}. This is self-reported.`,
    link: application.link,
    updatedAt: new Date().toISOString(),
  };
}

export function createStudentService(repository, getCareers = defaultCareers) {
  const loadCareers = async () => careerMap(await getCareers());
  const state = async (document) => buildStudentState(document, new Date(), await loadCareers());
  async function mutate(change) {
    return state(await repository.update(change));
  }
  return {
    async state() {
      return state(await repository.read());
    },
    async savePathboard(input) {
      return mutate((document) => updatePathboard(document, input));
    },
    matches(input) {
      return recommendRoles(validateStudent(input));
    },
    async saveProfile(input) {
      const profile = validateStudent(input, await loadCareers());
      return mutate((document) => {
        document.profile = profile;
      });
    },
    async updateTask(id, input) {
      const record = validateTaskUpdate(input);
      const careers = await loadCareers();
      return mutate((document) => {
        if (!document.profile) throw new InputError('Create your student profile first.', 409);
        const role = document.profile.role;
        if (input.role !== role)
          throw new InputError('Your direction changed. Reload the task before saving.', 409);
        if (!buildTasks(document.profile, careers).some((task) => task.id === id))
          throw new InputError('Task not found.', 404);
        document.progress[role] ??= {};
        document.progress[role][id] = { ...record, updatedAt: new Date().toISOString() };
      });
    },
    async addApplication(input) {
      const application = validateStudentApplication(input, await loadCareers());
      return mutate((document) => {
        if (!document.profile) throw new InputError('Create your student profile first.', 409);
        if (document.applications.length >= 500)
          throw new InputError('Application limit reached. Remove old entries first.');
        recordAppliedStep(document, application);
        document.applications.push({
          ...application,
          id: randomUUID(),
          createdAt: new Date().toISOString(),
        });
      });
    },
    async updateApplication(id, input) {
      const application = validateStudentApplication(input, await loadCareers());
      return mutate((document) => {
        const current = document.applications.find((item) => item.id === id);
        if (!current) throw new InputError('Application not found.', 404);
        Object.assign(current, application);
        recordAppliedStep(document, application);
      });
    },
    async removeApplication(id) {
      return mutate((document) => {
        if (!document.applications.some((item) => item.id === id))
          throw new InputError('Application not found.', 404);
        document.applications = document.applications.filter((item) => item.id !== id);
      });
    },
  };
}
