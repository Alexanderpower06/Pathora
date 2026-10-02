import test from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import { createHttpServer } from '../server.js';
import { memoryAuthRepository } from '../testing/memory-auth-repository.js';

const profile = {
  name: 'Alex',
  major: 'CS',
  graduation: '2028-05',
  weeklyHours: 5,
  targetDate: '2027-02-01',
  role: 'frontend',
  interests: ['Building websites'],
  existingSkills: ['JavaScript'],
  courses: '',
  experience: '',
};
async function fixture(context) {
  const server = createHttpServer({ auth: memoryAuthRepository() });
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  context.after(() => new Promise((resolve) => server.close(resolve)));
  const origin = `http://127.0.0.1:${server.address().port}`;
  const registration = await fetch(origin + '/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'api@example.test', password: 'API sample passphrase 123' }),
  });
  const cookie = registration.headers.get('set-cookie').split(';')[0];
  async function api(path, method = 'GET', data) {
    const response = await fetch(origin + '/api/student/' + path, {
      method,
      headers: { Cookie: cookie, ...(data ? { 'Content-Type': 'application/json' } : {}) },
      body: data ? JSON.stringify(data) : undefined,
    });
    return { status: response.status, data: await response.json() };
  }
  return { origin, api, cookie };
}
test('student API completes onboarding, evidence, and application flow; modules are served safely', async (context) => {
  const { origin, api } = await fixture(context);
  assert.equal((await api('state')).data.profile, null);
  assert.equal((await api('profile', 'PUT', profile)).status, 200);
  assert.equal(
    (
      await api('tasks/resume', 'PATCH', {
        role: 'frontend',
        status: 'done',
        evidence: 'Drafted one page with my coursework',
        link: '',
      })
    ).data.completedCount,
    1,
  );
  const added = await api('applications', 'POST', {
    company: 'Example',
    title: 'Frontend intern',
    role: 'frontend',
    status: 'Applied',
    followUp: '2026-01-01',
    notes: 'Ask for résumé feedback',
  });
  assert.equal(added.status, 201);
  assert.equal(added.data.reminders.length, 1);
  const application = added.data.applications[0];
  assert.equal(
    (await api('applications/' + application.id, 'PUT', { ...application, status: 'Interviewing' }))
      .data.applications[0].status,
    'Interviewing',
  );
  assert.equal((await api('applications/' + application.id, 'DELETE')).data.applications.length, 0);
  for (const path of [
    '/',
    '/workspace',
    '/welcome.css',
    '/app.js',
    '/style.css',
    '/modules/profile.js',
    '/modules/task-dialog.js',
  ])
    assert.equal((await fetch(origin + path)).status, 200);
  const welcome = await (await fetch(origin + '/')).text();
  assert.ok(welcome.includes('href="/signup?start=1"'));
  assert.ok(!welcome.includes('id="profile-dialog"'));
  assert.ok((await (await fetch(origin + '/workspace')).text()).includes('id="profile-dialog"'));
  assert.equal((await fetch(origin + '/backend/server.js')).status, 404);
  assert.equal((await fetch(origin + '/modules/../backend/database.js')).status, 404);
  assert.equal(
    (await fetch(origin + '/api/student/state', { headers: { Origin: 'https://example.com' } }))
      .status,
    403,
  );
});
test('API rejects bad bodies and failed changes preserve saved state', async (context) => {
  const { api, origin, cookie } = await fixture(context);
  await api('profile', 'PUT', profile);
  assert.equal((await api('profile', 'PUT', { ...profile, role: 'constructor' })).status, 400);
  assert.equal((await api('state')).data.profile.role, 'frontend');
  assert.equal(
    (await api('tasks/resume', 'PATCH', { role: 'frontend', status: 'done', evidence: '' })).status,
    400,
  );
  assert.equal((await api('state')).data.completedCount, 0);
  assert.equal(
    (
      await api('applications', 'POST', {
        company: 'Example',
        title: 'Intern',
        role: ['frontend'],
        status: 'Saved',
      })
    ).status,
    400,
  );
  assert.deepEqual((await api('state')).data.applications, []);
  assert.equal(
    (
      await fetch(origin + '/api/student/profile', {
        method: 'PUT',
        headers: { Cookie: cookie },
        body: '{}',
      })
    ).status,
    400,
  );
  const bad = await fetch(origin + '/api/student/profile', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Cookie: cookie },
    body: 'no json',
  });
  assert.equal(bad.status, 400);
});
