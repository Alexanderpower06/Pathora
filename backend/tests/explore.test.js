import test from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import { EXPLORATION_CAREERS, reviewStatus } from '../exploration/catalog.js';
import { CAREERS } from '../onboarding/catalog.js';
import { filterCareers } from '../../frontend/modules/explore-search.js';
import { createStudentService } from '../internships/service.js';
import { memoryStudentRepository } from '../testing/memory-student-repository.js';
import { createHttpServer } from '../server.js';
import { memoryAuthRepository } from '../testing/memory-auth-repository.js';

test('all ten profiles have sourced, scoped metadata and actionable preparation with stable Build IDs', () => {
  assert.equal(EXPLORATION_CAREERS.length, 10);
  assert.equal(new Set(EXPLORATION_CAREERS.map((career) => career.id)).size, 10);
  for (const career of EXPLORATION_CAREERS) {
    const build = CAREERS.find((item) => item.id === career.id);
    assert.ok(build);
    assert.equal(career.milestones.length, 8);
    assert.deepEqual(
      career.milestones.map((item) => item.id),
      build.milestones.map((item) => item.id),
    );
    assert.ok(career.sources.length);
    for (const source of career.sources) {
      assert.equal(new URL(source.url).protocol, 'https:');
      assert.ok(source.period);
      assert.ok(source.reviewedOn);
      assert.equal(source.status, 'reviewed');
    }
    for (const milestone of career.milestones) {
      assert.ok(milestone.why);
      assert.ok(milestone.tasks.length >= 3);
      assert.ok(milestone.evidence);
      assert.ok(milestone.prerequisiteNote);
      assert.ok(milestone.resources[0].url);
      assert.ok(milestone.next);
    }
    assert.equal(career.milestones.at(-1).prerequisites.length, 0);
    if (career.pay) {
      assert.ok(career.payOccupation);
      assert.ok(career.sources.some((source) => source.period.includes('2025')));
    }
    assert.equal(reviewStatus(career, new Date('2027-02-01')), 'Review due');
  }
  assert.equal(EXPLORATION_CAREERS.find((career) => career.id === 'data-analyst').pay, undefined);
  assert.equal(EXPLORATION_CAREERS.find((career) => career.id === 'cloud').pay, undefined);
});
test('search and intersecting filters use career titles, entry search titles, skills, and practice milestones', () => {
  assert.ok(filterCareers(EXPLORATION_CAREERS, 'SQL').some((career) => career.id === 'software'));
  assert.deepEqual(
    filterCareers(EXPLORATION_CAREERS, 'junior software').map((career) => career.id),
    ['software', 'qa'],
  );
  assert.deepEqual(
    filterCareers(EXPLORATION_CAREERS, '', { field: 'Security', activity: 'Investigation' }).map(
      (career) => career.id,
    ),
    ['cybersecurity'],
  );
  assert.equal(
    filterCareers(EXPLORATION_CAREERS, '', { field: 'Data', activity: 'Deployment' }).length,
    0,
  );
  assert.equal(filterCareers(EXPLORATION_CAREERS, 'no-such-career').length, 0);
});
test('saved comparisons are bounded, validated atomically, and do not change the active Path', async () => {
  const repo = memoryStudentRepository();
  const service = createStudentService(repo);
  await service.savePathboard({
    careerId: 'software',
    action: 'compare',
    careerIds: ['software', 'cybersecurity', 'data-analyst'],
  });
  const before = await repo.read();
  assert.deepEqual((await service.state()).pathboard.saved, [
    'software',
    'cybersecurity',
    'data-analyst',
  ]);
  assert.deepEqual((await service.state()).pathboard.comparison, [
    'software',
    'cybersecurity',
    'data-analyst',
  ]);
  for (const careerIds of [
    ['software'],
    ['software', 'software'],
    ['software', 'unknown'],
    ['software', 'cybersecurity', 'cloud', 'systems'],
  ])
    await assert.rejects(
      service.savePathboard({ careerId: 'software', action: 'compare', careerIds }),
      { name: 'InputError' },
    );
  assert.deepEqual(await repo.read(), before);
  assert.equal(before.profile, null);
});
test('content reports are bounded and events exclude search strings and reflection text', async () => {
  const repo = memoryStudentRepository();
  const service = createStudentService(repo);
  await service.exploreEvent({ action: 'search', query: 'private text' });
  await service.exploreEvent({ action: 'search', query: 'private text' });
  await service.exploreEvent({
    careerId: 'software',
    action: 'report',
    message: 'The learning link needs review.',
  });
  const before = await repo.read();
  assert.equal(before.productEvents.length, 2);
  assert.ok(!JSON.stringify(before.productEvents).includes('private text'));
  assert.equal(before.contentFeedback[0].status, 'needs-review');
  await assert.rejects(
    service.exploreEvent({ careerId: 'software', action: 'report', message: 'x'.repeat(1001) }),
    { name: 'InputError' },
  );
  assert.deepEqual(await repo.read(), before);
});
test('Explore requires sign-in and sends authenticated users into their workspace', async (context) => {
  const server = createHttpServer({ auth: memoryAuthRepository() });
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  context.after(() => new Promise((resolve) => server.close(resolve)));
  const base = `http://127.0.0.1:${server.address().port}`;
  const guest = await fetch(base + '/explore', { redirect: 'manual' });
  assert.equal(guest.status, 302);
  assert.equal(guest.headers.get('location'), '/login?next=explore');
  assert.equal((await fetch(base + '/api/careers')).status, 404);
  assert.equal((await fetch(base + '/explore-guest.js')).status, 404);
  const home = await (await fetch(base + '/')).text();
  assert.ok(!home.includes('href="/explore"'));
  const registration = await fetch(base + '/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'explore-access@example.test',
      password: 'Disposable test passphrase 123',
    }),
  });
  const cookie = registration.headers.get('set-cookie').split(';')[0];
  const signedIn = await fetch(base + '/explore', {
    redirect: 'manual',
    headers: { Cookie: cookie },
  });
  assert.equal(signedIn.status, 302);
  assert.equal(signedIn.headers.get('location'), '/workspace#explore');
  assert.equal((await fetch(base + '/api/student/state')).status, 401);
  assert.equal(
    (await (await fetch(base + '/api/student/state', { headers: { Cookie: cookie } })).json())
      .explorationCareers.length,
    10,
  );
  for (const path of [
    '/modules/career-preview.js',
    '/modules/career-path.js',
    '/modules/explore-actions.js',
    '/modules/explore-search.js',
  ])
    assert.equal((await fetch(base + path)).status, 200);
});

test('new Paths retain prior evidence; in-progress needs no completion proof and does not increase completion', async () => {
  const repo = memoryStudentRepository();
  const service = createStudentService(repo);
  const profile = {
    name: 'Student',
    major: 'CS',
    graduation: '2028-05',
    weeklyHours: 5,
    targetDate: '2027-02-01',
    role: 'software',
    interests: [],
    existingSkills: ['Python'],
    courses: '',
    experience: '',
  };
  await service.saveProfile(profile);
  await service.updateTask('milestone-one', {
    role: 'software',
    status: 'done',
    evidence: 'Built and tested a small Python program.',
    link: '',
  });
  await service.saveProfile({ ...profile, role: 'qa' });
  const working = await service.updateTask('milestone-one', {
    role: 'qa',
    status: 'in-progress',
    evidence: '',
    link: '',
  });
  assert.equal(working.completedCount, 0);
  assert.equal(working.tasks[0].status, 'in-progress');
  await assert.rejects(
    service.updateTask('milestone-one', { role: 'qa', status: 'done', evidence: '', link: '' }),
    { name: 'InputError' },
  );
  const restored = await service.saveProfile(profile);
  assert.equal(restored.completedCount, 1);
  assert.equal(restored.tasks[0].evidence, 'Built and tested a small Python program.');
});
