import test from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import { createHttpServer } from '../server.js';
import { memoryAuthRepository } from '../testing/memory-auth-repository.js';
import { createAuthService } from '../auth/service.js';

const password = 'A sample account passphrase 123';
async function fixture(context) {
  const repository = memoryAuthRepository({ demo: true });
  const server = createHttpServer({ auth: repository });
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  context.after(() => new Promise((resolve) => server.close(resolve)));
  const origin = `http://127.0.0.1:${server.address().port}`;
  async function request(path, method = 'GET', data, cookie = '') {
    const response = await fetch(origin + path, {
      method,
      headers: { Cookie: cookie, ...(data ? { 'Content-Type': 'application/json' } : {}) },
      body: data ? JSON.stringify(data) : undefined,
    });
    return {
      status: response.status,
      data: await response.json(),
      cookie: response.headers.get('set-cookie'),
    };
  }
  return { request, repository, origin };
}
test('accounts use password hashes, normalized emails, private cookies, and revocable sessions', async (context) => {
  const { request, repository } = await fixture(context);
  assert.equal((await request('/api/student/state')).status, 401);
  assert.equal((await request('/api/state')).status, 404);
  const registered = await request('/api/auth/register', 'POST', {
    email: 'Student@Example.test',
    password,
  });
  assert.equal(registered.status, 201);
  assert.equal(registered.data.user.email, 'student@example.test');
  assert.ok(!JSON.stringify(registered.data).includes('password'));
  assert.match(registered.cookie, /HttpOnly; SameSite=Strict; Max-Age=86400/);
  const cookie = registered.cookie.split(';')[0];
  const stored = await repository.findUser('student@example.test');
  assert.notEqual(stored.passwordHash, password);
  assert.match(stored.passwordHash, /^scrypt\$/);
  assert.equal((await request('/api/student/state', 'GET', undefined, cookie)).status, 200);
  assert.equal(
    (await request('/api/auth/login', 'POST', { email: stored.email, password: 'wrong password' }))
      .status,
    401,
  );
  const login = await request('/api/auth/login', 'POST', { email: stored.email, password }, cookie);
  assert.equal(login.status, 200);
  const newCookie = login.cookie.split(';')[0];
  assert.notEqual(newCookie, cookie);
  assert.equal((await request('/api/student/state', 'GET', undefined, cookie)).status, 401);
  assert.equal((await request('/api/auth/logout', 'POST', {}, newCookie)).status, 200);
  assert.equal((await request('/api/student/state', 'GET', undefined, newCookie)).status, 401);
  assert.deepEqual((await request('/api/auth/me')).data, { user: null });
});
test('different accounts cannot read or overwrite another student’s profile and applications', async (context) => {
  const { request, origin } = await fixture(context);
  const cookies = [];
  for (const email of ['one@example.test', 'two@example.test']) {
    const created = await request('/api/auth/register', 'POST', { email, password });
    cookies.push(created.cookie.split(';')[0]);
  }
  const profile = {
    name: 'One',
    major: 'CS',
    graduation: '2028-05',
    weeklyHours: 5,
    targetDate: '2027-02-01',
    role: 'frontend',
    interests: [],
    existingSkills: [],
  };
  await request('/api/student/profile', 'PUT', profile, cookies[0]);
  const added = await request(
    '/api/student/applications',
    'POST',
    { company: 'Private example', title: 'Intern', role: 'frontend', status: 'Saved' },
    cookies[0],
  );
  const second = await request('/api/student/state', 'GET', undefined, cookies[1]);
  assert.equal(second.data.profile, null);
  assert.deepEqual(second.data.applications, []);
  const firstUser = (await request('/api/auth/me', 'GET', undefined, cookies[0])).data.user;
  const staleSave = await fetch(origin + '/api/student/profile', {
    method: 'PUT',
    headers: {
      Cookie: cookies[1],
      'Content-Type': 'application/json',
      'X-Pathora-Account': firstUser.id,
    },
    body: JSON.stringify(profile),
  });
  assert.equal(staleSave.status, 409);
  assert.equal(
    (await request('/api/student/state', 'GET', undefined, cookies[1])).data.profile,
    null,
  );
  assert.equal(
    (
      await request(
        '/api/student/applications/' + added.data.applications[0].id,
        'DELETE',
        undefined,
        cookies[1],
      )
    ).status,
    404,
  );
  assert.equal(
    (await request('/api/student/state', 'GET', undefined, cookies[0])).data.applications.length,
    1,
  );
});
test('expired sessions and forged cookies cannot access saved state', async () => {
  let clock = new Date('2026-10-01T12:00:00Z');
  const service = createAuthService(memoryAuthRepository(), { now: () => clock });
  const registered = await service.authenticate({ email: 'expiry@example.test', password }, true);
  const request = { headers: { cookie: 'pathora_session=' + registered.token } };
  assert.ok(await service.user(request));
  clock = new Date('2026-10-02T12:00:01Z');
  assert.equal(await service.user(request), undefined);
  assert.equal(await service.user({ headers: { cookie: 'pathora_session=forged' } }), undefined);
});
test('validation, duplicate accounts, cross-origin requests, and throttling are enforced', async (context) => {
  const { request, origin } = await fixture(context);
  assert.equal(
    (await request('/api/auth/register', 'POST', { email: 'bad', password })).status,
    400,
  );
  assert.equal(
    (
      await request('/api/auth/register', 'POST', {
        email: 'valid@example.test',
        password: 'short',
      })
    ).status,
    400,
  );
  assert.equal(
    (await request('/api/auth/register', 'POST', { email: 'valid@example.test', password })).status,
    201,
  );
  assert.equal(
    (await request('/api/auth/register', 'POST', { email: 'VALID@example.test', password })).status,
    409,
  );
  const crossOrigin = await fetch(origin + '/api/auth/logout', {
    method: 'POST',
    headers: { Origin: 'https://example.com', 'Content-Type': 'application/json' },
    body: '{}',
  });
  assert.equal(crossOrigin.status, 403);
  for (let i = 4; i < 20; i++)
    await request('/api/auth/register', 'POST', { email: 'bad', password });
  assert.equal(
    (await request('/api/auth/login', 'POST', { email: 'valid@example.test', password })).status,
    429,
  );
});
