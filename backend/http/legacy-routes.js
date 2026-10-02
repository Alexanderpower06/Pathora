// Preserve old API access while the internship MVP uses its own separate data document.
import { randomUUID } from 'node:crypto';
import {
  InputError,
  validateProfile,
  validateApplication,
  validateStatus,
  validateChecklist,
} from '../validation.js';
import { sendJson, readJsonBody } from './json.js';
export function legacyRoutes(database) {
  const { getState, updateProgress } = database;
  return async (request, response, path) => {
    if (!getState) return false;
    if (path === '/api/state' && request.method === 'GET') {
      sendJson(response, 200, await getState());
      return true;
    }
    if (path === '/api/profile' && request.method === 'PUT') {
      const profile = validateProfile(await readJsonBody(request));
      const state = await database.saveProfile(profile);
      sendJson(response, 200, state);
      return true;
    }
    if (path === '/api/progress' && request.method === 'PATCH') {
      const input = await readJsonBody(request);
      const state = await updateProgress((progress, plan) => {
        validateChecklist(input, plan);
        progress[input.category] = progress[input.category].filter(
          (index) => index !== input.index,
        );
        if (input.done) progress[input.category].push(input.index);
      });
      sendJson(response, 200, state);
      return true;
    }
    if (path === '/api/applications' && request.method === 'POST') {
      const input = validateApplication(await readJsonBody(request));
      const state = await updateProgress((progress) => {
        progress.applications.push({
          ...input,
          id: randomUUID(),
          status: 'Applied',
          createdAt: new Date().toISOString(),
        });
      });
      sendJson(response, 201, state);
      return true;
    }
    const applicationMatch = path.match(/^\/api\/applications\/([a-zA-Z0-9-]+)$/);
    if (applicationMatch && ['PATCH', 'DELETE'].includes(request.method)) {
      const input = await readJsonBody(request);
      const status = request.method === 'PATCH' ? validateStatus(input.status) : undefined;
      const state = await updateProgress((progress) => {
        const application = progress.applications.find((item) => item.id === applicationMatch[1]);
        if (!application) throw new InputError('Application not found.', 404);
        if (request.method === 'DELETE') {
          progress.applications = progress.applications.filter(
            (item) => item.id !== application.id,
          );
        } else {
          application.status = status;
        }
      });
      sendJson(response, 200, state);
      return true;
    }
    return false;
  };
}
