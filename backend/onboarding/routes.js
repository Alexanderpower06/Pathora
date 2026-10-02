import { readJsonBody, sendJson } from '../http/json.js';
export async function onboardingRoutes(service, request, response, path) {
  if (!path.startsWith('/api/student/onboarding')) return false;
  let result;
  if (path === '/api/student/onboarding' && request.method === 'GET')
    result = await service.state();
  else if (request.method === 'PUT' && path === '/api/student/onboarding/draft')
    result = await service.draft(await readJsonBody(request));
  else if (request.method === 'PUT' && path === '/api/student/onboarding/step')
    result = await service.step(await readJsonBody(request));
  else if (request.method === 'PATCH' && path === '/api/student/onboarding')
    result = await service.navigate(await readJsonBody(request));
  else if (request.method === 'PUT' && path === '/api/student/onboarding/finder')
    result = await service.finder(await readJsonBody(request));
  else if (request.method === 'POST' && path === '/api/student/onboarding/complete') {
    await readJsonBody(request);
    result = await service.complete();
  } else {
    sendJson(response, 404, { error: 'Endpoint not found.' });
    return true;
  }
  sendJson(response, 200, result);
  return true;
}
