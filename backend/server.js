import { createOnboardingService } from './onboarding/service.js';
import { onboardingRoutes } from './onboarding/routes.js';
import { createServer } from 'node:http';
import { readFileSync } from 'node:fs';
import { dirname, resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { openDatabase } from './database.js';
import { sendJson } from './http/json.js';
import { createStudentService } from './internships/service.js';
import { studentRoutes } from './internships/routes.js';
import { InputError } from './validation.js';
import { legacyRoutes } from './http/legacy-routes.js';
import { createAuthService } from './auth/service.js';
import { authRoutes } from './auth/routes.js';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const LOCAL_HOSTS = new Set(['127.0.0.1', 'localhost', '[::1]']);
const PUBLIC_FILES = Object.freeze({
  '/': 'index.html',
  '/onboarding': 'onboarding.html',
  '/onboarding.css': 'onboarding.css',
  '/onboarding.js': 'onboarding.js',
  '/modules/onboarding-views.js': 'modules/onboarding-views.js',
  '/modules/onboarding-fields.js': 'modules/onboarding-fields.js',
  '/index.html': 'index.html',
  '/workspace': 'workspace.html',
  '/workspace.html': 'workspace.html',
  '/welcome.css': 'welcome.css',
  '/login': 'auth.html',
  '/signup': 'auth.html',
  '/auth.css': 'auth.css',
  '/auth.js': 'auth.js',
  '/modules/session.js': 'modules/session.js',
  '/style.css': 'style.css',
  '/app.js': 'app.js',
  '/modules/api.js': 'modules/api.js',
  '/modules/dom.js': 'modules/dom.js',
  '/modules/profile.js': 'modules/profile.js',
  '/modules/skills.js': 'modules/skills.js',
  '/modules/onboarding.js': 'modules/onboarding.js',
  '/modules/dashboard.js': 'modules/dashboard.js',
  '/modules/explore.js': 'modules/explore.js',
  '/modules/pathboard.js': 'modules/pathboard.js',
  '/modules/career-detail.js': 'modules/career-detail.js',
  '/modules/direction.js': 'modules/direction.js',
  '/modules/roadmap.js': 'modules/roadmap.js',
  '/modules/applications.js': 'modules/applications.js',
  '/modules/task-dialog.js': 'modules/task-dialog.js',
});
const CONTENT_TYPES = Object.freeze({
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'text/javascript',
});

function requestUrl(request) {
  let origin;
  try {
    origin = new URL('http://' + request.headers.host);
  } catch {
    throw new InputError('Invalid request host.');
  }
  if (!LOCAL_HOSTS.has(origin.hostname)) {
    throw new InputError('This personal app accepts local connections only.', 403);
  }
  if (request.headers.origin && request.headers.origin !== origin.origin) {
    throw new InputError('Cross-origin requests are not allowed.', 403);
  }
  return new URL(request.url, origin);
}

export async function createPathoraServer(options = {}) {
  const database = await openDatabase(options);
  const server = createHttpServer(database, options);
  server.on('close', () => {
    server.databaseClosed = database.close();
  });
  return server;
}

export function createHttpServer(database, { allowLegacy = false } = {}) {
  const handleLegacy = allowLegacy ? legacyRoutes(database) : null;
  const auth = createAuthService(database.auth);
  const handleAuth = authRoutes(auth);

  const server = createServer(async (request, response) => {
    response.setHeader('X-Content-Type-Options', 'nosniff');
    response.setHeader('Referrer-Policy', 'same-origin');
    response.setHeader('X-Frame-Options', 'DENY');
    response.setHeader(
      'Content-Security-Policy',
      "default-src 'self'; style-src 'self' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data:; connect-src 'self'; frame-ancestors 'none'",
    );
    try {
      const path = requestUrl(request).pathname;
      if (await handleAuth(request, response, path)) return;
      if (path.startsWith('/api/student/')) {
        const user = await auth.user(request);
        if (!user) throw new InputError('Sign in to open your workspace.', 401);
        if (
          request.headers['x-pathora-account'] &&
          request.headers['x-pathora-account'] !== user.id
        )
          throw new InputError('Your signed-in account changed. Reload before saving.', 409);
        const repository = database.auth.students(user.id);
        if (
          await onboardingRoutes(
            createOnboardingService(repository, database.careerCatalog),
            request,
            response,
            path,
          )
        )
          return;
        const handleStudents = studentRoutes(
          createStudentService(repository, database.careerCatalog),
        );
        if (await handleStudents(request, response, path)) return;
      }
      if (handleLegacy && (await handleLegacy(request, response, path))) return;
      if (path.startsWith('/api/')) {
        sendJson(response, 404, { error: 'Endpoint not found.' });
        return;
      }
      if (!['GET', 'HEAD'].includes(request.method)) {
        sendJson(response, 405, { error: 'Method not allowed.' });
        return;
      }
      if (!Object.hasOwn(PUBLIC_FILES, path)) {
        sendJson(response, 404, { error: 'Page not found.' });
        return;
      }
      const file = PUBLIC_FILES[path];
      const extension = file.slice(file.lastIndexOf('.'));
      const content =
        request.method === 'HEAD' ? undefined : readFileSync(join(ROOT, 'frontend', file));
      response.writeHead(200, {
        'Content-Type': CONTENT_TYPES[extension] + '; charset=utf-8',
        'Cache-Control': 'no-cache',
      });
      response.end(content);
    } catch (error) {
      if (error instanceof InputError) sendJson(response, error.status, { error: error.message });
      else {
        console.error('Pathora request failed:', error.name, error.code ?? 'unexpected');
        sendJson(response, 500, { error: 'Unable to save your changes. Please try again.' });
      }
    }
  });
  return server;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const port = Number(process.env.PORT || 4175);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error('PORT must be an integer from 1 to 65535.');
  }
  const server = await createPathoraServer();
  server.listen(port, '127.0.0.1', () =>
    console.log(`Pathora running at http://127.0.0.1:${port}`),
  );
  for (const signal of ['SIGINT', 'SIGTERM']) {
    process.once(signal, () => server.close());
  }
}
