import { readJsonBody, sendJson } from '../http/json.js';

export function studentRoutes(service) {
  return async (request, response, path) => {
    if (!path.startsWith('/api/student')) return false;
    const method = request.method;
    let result;
    let status = 200;
    if (path === '/api/student/state' && method === 'GET') result = await service.state();
    else if (path === '/api/student/pathboard' && method === 'PATCH')
      result = await service.savePathboard(await readJsonBody(request));
    else if (path === '/api/student/matches' && method === 'POST')
      result = service.matches(await readJsonBody(request));
    else if (path === '/api/student/profile' && method === 'PUT')
      result = await service.saveProfile(await readJsonBody(request));
    else if (path === '/api/student/applications' && method === 'POST') {
      result = await service.addApplication(await readJsonBody(request));
      status = 201;
    } else {
      const task = path.match(/^\/api\/student\/tasks\/([a-z-]+)$/);
      const application = path.match(/^\/api\/student\/applications\/([a-f0-9-]+)$/);
      if (task && method === 'PATCH')
        result = await service.updateTask(task[1], await readJsonBody(request));
      else if (application && method === 'PUT')
        result = await service.updateApplication(application[1], await readJsonBody(request));
      else if (application && method === 'DELETE')
        result = await service.removeApplication(application[1]);
      else {
        sendJson(response, 404, { error: 'Endpoint not found.' });
        return true;
      }
    }
    sendJson(response, status, result);
    return true;
  };
}
