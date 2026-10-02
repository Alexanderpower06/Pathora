import { InputError } from '../validation.js';
import { readJsonBody, sendJson } from '../http/json.js';
import { COOKIE_NAME, SESSION_SECONDS } from './service.js';

export function authRoutes(service, { secureCookies = false } = {}) {
  const attempts = new Map();
  function throttle(request) {
    const now = Date.now();
    for (const [key, entry] of attempts) if (entry.until <= now) attempts.delete(key);
    const key = request.socket.remoteAddress;
    const entry = attempts.get(key) ?? { count: 0, until: now + 15 * 60 * 1000 };
    attempts.set(key, entry);
    if (++entry.count > 20)
      throw new InputError('Too many attempts. Try again in 15 minutes.', 429);
  }
  function cookie(token, maxAge) {
    return `${COOKIE_NAME}=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${maxAge}${secureCookies ? '; Secure' : ''}`;
  }
  return async (request, response, path) => {
    if (!path.startsWith('/api/auth/')) return false;
    if (path === '/api/auth/me' && request.method === 'GET') {
      sendJson(response, 200, { user: (await service.user(request)) ?? null });
    } else if (
      ['/api/auth/register', '/api/auth/login'].includes(path) &&
      request.method === 'POST'
    ) {
      throttle(request);
      const registering = path.endsWith('/register');
      const result = await service.authenticate(await readJsonBody(request), registering);
      await service.logout(request);
      response.setHeader('Set-Cookie', cookie(result.token, SESSION_SECONDS));
      sendJson(response, registering ? 201 : 200, { user: result.user });
    } else if (path === '/api/auth/logout' && request.method === 'POST') {
      await readJsonBody(request);
      await service.logout(request);
      response.setHeader('Set-Cookie', cookie('', 0));
      sendJson(response, 200, { ok: true });
    } else sendJson(response, 404, { error: 'Endpoint not found.' });
    return true;
  };
}
