import test from 'node:test';
import assert from 'node:assert/strict';
import { createStudentService } from '../internships/service.js';
import { memoryStudentRepository } from '../testing/memory-student-repository.js';
import { memoryAuthRepository } from '../testing/memory-auth-repository.js';
import { createHttpServer } from '../server.js';
import { once } from 'node:events';

const reflection = {
  enjoyed: 'Finding a workable design',
  disliked: 'Repetitive setup',
  difficult: 'Debugging the state',
  improve: 'Writing useful tests',
  professional: 'Maybe, I want another experiment',
  exploreFurther: 'Maybe',
};
test('Pathboard completion requires evidence and reflection, and survives removal and readding', async () => {
  const repository = memoryStudentRepository();
  const service = createStudentService(repository);
  assert.equal((await service.state()).explorationCareers.length, 5);
  const input = {
    careerId: 'software',
    action: 'complete-experiment',
    reflection,
    evidence: 'Built and tested a small study planner.',
  };
  await service.savePathboard({ careerId: 'software', action: 'save' });
  await service.savePathboard({ careerId: 'software', action: 'save' });
  assert.deepEqual((await service.state()).pathboard.saved, ['software']);
  const before = await repository.read();
  await assert.rejects(service.savePathboard({ ...input, reflection: {} }), /required/);
  assert.deepEqual(await repository.read(), before);
  await service.savePathboard(input);
  await service.savePathboard(input);
  assert.equal(
    (await repository.read()).productEvents.filter((event) => event.name === 'experiment_completed')
      .length,
    1,
  );
  await service.savePathboard({ careerId: 'software', action: 'unsave' });
  await service.savePathboard({ careerId: 'software', action: 'save' });
  assert.equal(
    (await service.state()).pathboard.entries.software.experiment.evidence,
    input.evidence,
  );
  assert.deepEqual((await repository.read()).progress, {});
});
test('Pathboard rejects unknown careers, malformed values, and oversized notes atomically', async () => {
  const repository = memoryStudentRepository();
  const service = createStudentService(repository);
  for (const input of [
    null,
    [],
    { careerId: 'constructor', action: 'save' },
    { careerId: 'software', action: 'reflect', reflection: [] },
    { careerId: 'software', action: 'reflect', reflection: { enjoyed: 'x'.repeat(1001) } },
    { careerId: 'software', action: 'reflect', reflection: { exploreFurther: 'Definitely' } },
  ]) {
    await assert.rejects(service.savePathboard(input), { name: 'InputError' });
    assert.deepEqual((await service.state()).pathboard.saved, []);
  }
});
test('Pathboard HTTP state survives a new session and stays private between accounts', async (context) => {
  const server = createHttpServer({ auth: memoryAuthRepository() });
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  context.after(() => new Promise((resolve) => server.close(resolve)));
  const origin = `http://127.0.0.1:${server.address().port}`;
  const password = 'Private sample passphrase 123';
  async function auth(action, email) {
    const result = await fetch(`${origin}/api/auth/${action}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    assert.equal(result.ok, true);
    return result.headers.get('set-cookie').split(';')[0];
  }
  const first = await auth('register', 'first@example.test');
  const second = await auth('register', 'second@example.test');
  const saved = await fetch(`${origin}/api/student/pathboard`, {
    method: 'PATCH',
    headers: { Cookie: first, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      careerId: 'cloud',
      action: 'complete-experiment',
      reflection,
      evidence: 'Wrote a local startup and recovery runbook.',
    }),
  });
  assert.equal(saved.status, 200);
  const resumed = await auth('login', 'first@example.test');
  const state = async (cookie) =>
    (await fetch(`${origin}/api/student/state`, { headers: { Cookie: cookie } })).json();
  assert.equal((await state(resumed)).pathboard.entries.cloud.experiment.status, 'completed');
  assert.deepEqual((await state(second)).pathboard.saved, []);
  assert.equal(
    (
      await fetch(`${origin}/api/student/pathboard`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: '{}',
      })
    ).status,
    401,
  );
  for (const file of ['explore', 'pathboard', 'career-detail'])
    assert.equal((await fetch(`${origin}/modules/${file}.js`)).status, 200);
});
