import test from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import { createOnboardingService } from '../onboarding/service.js';
import { CAREERS } from '../onboarding/catalog.js';
import { careerMatches, skillMatch } from '../onboarding/matching.js';
import { memoryStudentRepository } from '../testing/memory-student-repository.js';
import { memoryAuthRepository } from '../testing/memory-auth-repository.js';
import { createStudentService } from '../internships/service.js';
import { createHttpServer } from '../server.js';

const education = {
  degree: 'Bachelor’s',
  major: 'Computer Science',
  graduation: '2028-05',
  school: '',
};
async function toSkills(flow, role = 'software') {
  await flow.step({ step: 1, answers: { situation: 'College Student' } });
  await flow.step({ step: 2, answers: education });
  await flow.step({ step: 3, answers: { role } });
}
async function finish(flow, skills = []) {
  await flow.step({
    step: 4,
    answers: { existingSkills: skills, skillLevels: { Python: 'Beginner' } },
  });
  await flow.step({ step: 5, answers: { experienceKinds: ['None Yet'], name: 'Alex' } });
  return flow.complete();
}
test('all careers have defined categories, core skills and eight usable milestones', () => {
  assert.equal(CAREERS.length, 10); // Retain eight existing careers and add Cloud and IT.
  for (const career of CAREERS) {
    assert.equal(career.milestones.length, 8);
    assert.equal(new Set(career.milestones.map((task) => task.id)).size, 8);
    assert.ok(
      career.skills.every((skill) => Object.values(career.categories).flat().includes(skill)),
    );
    assert.ok(career.milestones.every((task) => task.resource.url.startsWith('https://')));
  }
});
test('onboarding resumes incomplete drafts and preserves earlier steps on backward navigation', async () => {
  const repo = memoryStudentRepository(),
    flow = createOnboardingService(repo);
  await assert.rejects(flow.step({ step: 1, answers: {} }));
  await flow.step({ step: 1, answers: { situation: 'College Student' } });
  await flow.draft({
    step: 2,
    stage: 'goal',
    answers: { major: 'Biology', school: 'My school', degree: '', graduation: '' },
  });
  const resumed = await createOnboardingService(repo).state();
  assert.equal(resumed.step, 2);
  assert.equal(resumed.answers.major, 'Biology');
  await assert.rejects(flow.step({ step: 2, answers: { ...education, graduation: '2028-13' } }));
  assert.equal((await flow.state()).answers.school, 'My school');
  await flow.navigate({ step: 1 });
  assert.equal((await flow.state()).answers.situation, 'College Student');
  await flow.step({ step: 1, answers: { situation: 'College Student' } });
  assert.equal((await flow.state()).answers.major, 'Biology');
  await assert.rejects(flow.navigate({ step: 5 }));
  await assert.rejects(flow.complete());
});
test('college requires education, while exploring does not require a degree or graduation', async () => {
  const flow = createOnboardingService(memoryStudentRepository());
  await flow.step({ step: 1, answers: { situation: 'Just Exploring' } });
  await flow.step({ step: 2, answers: {} });
  await flow.step({ step: 3, answers: { role: 'ux' } });
  await finish(flow);
  const saved = await flow.state();
  assert.equal(saved.completed, true);
});
test('the finder is deterministic, bounded, explained and resumable', async () => {
  const flow = createOnboardingService(memoryStudentRepository());
  await flow.step({ step: 1, answers: { situation: 'Just Exploring' } });
  await flow.step({ step: 2, answers: {} });
  await flow.finder({ stage: 'start' });
  await flow.finder({
    stage: 'interests',
    answers: {
      interests: ['Sports'],
      preferences: ['technology', 'problem-solving'],
      environment: 'desk',
    },
  });
  await assert.rejects(flow.finder({ stage: 'quiz', answers: { quiz: { technology: 3 } } }));
  await flow.finder({
    stage: 'quiz',
    answers: {
      quiz: {
        technology: 3,
        'problem-solving': 3,
        people: 0,
        numbers: 0,
        creativity: 0,
        leadership: 0,
      },
    },
  });
  const result = await flow.state();
  assert.equal(result.stage, 'matches');
  assert.equal(result.matches[0].score, 100);
  assert.ok(result.matches[0].reasons.length >= 3);
  assert.deepEqual(result.matches, careerMatches(result.answers, CAREERS));
  assert.ok(result.matches.every((item) => item.score >= 0 && item.score <= 100));
  await flow.step({ step: 3, answers: { role: 'software' } });
  assert.equal((await flow.state()).step, 4);
});
test('skill match counts unique core skills without certifying proficiency', () => {
  const match = skillMatch(['Python', 'Python', 'JavaScript', 'Git', 'SQL', 'Docker'], CAREERS[0]);
  assert.equal(match.percent, 50);
  assert.equal(match.have.length, 4);
  assert.equal(match.gaps.length, 4);
});
test('none yet is exclusive; optional levels and empty skills are supported', async () => {
  const flow = createOnboardingService(memoryStudentRepository());
  await toSkills(flow);
  await assert.rejects(flow.step({ step: 4, answers: { existingSkills: ['Unknown'] } }));
  await flow.step({
    step: 4,
    answers: { existingSkills: ['Python'], skillLevels: { Python: 'Beginner' } },
  });
  await assert.rejects(
    flow.step({ step: 5, answers: { experienceKinds: ['None Yet', 'Internship'] } }),
  );
  await assert.rejects(flow.step({ step: 5, answers: { experienceKinds: [] } }));
  await flow.step({ step: 5, answers: { experienceKinds: ['None Yet'] } });
  const saved = await flow.complete();
  assert.equal(saved.completed, true);
  assert.equal(saved.answers.skillLevels.Python, 'Beginner');
  await assert.rejects(flow.navigate({ step: 1 }), { status: 409 });
});
test('new roadmaps populate the dashboard; changing careers keeps evidence and skills', async () => {
  const repo = memoryStudentRepository(),
    flow = createOnboardingService(repo),
    service = createStudentService(repo);
  await toSkills(flow);
  await finish(flow, ['Python', 'Git']);
  let state = await service.state();
  assert.equal(state.onboardingCompleted, true);
  assert.equal(state.tasks.length, 8);
  assert.equal(state.skillMatch.percent, 25);
  assert.equal(state.next.title, 'Programming Fundamentals');
  await service.updateTask('milestone-one', {
    role: 'software',
    status: 'done',
    evidence: 'Completed my first Python practice exercise.',
  });
  state = await service.state();
  await service.saveProfile({ ...state.profile, role: 'ux' });
  state = await service.state();
  assert.equal(state.completedCount, 0);
  assert.ok(state.profile.existingSkills.includes('Python'));
  await assert.rejects(
    service.updateTask('milestone-one', {
      role: 'software',
      status: 'done',
      evidence: 'Stale profile save must be rejected.',
    }),
    { status: 409 },
  );
  await service.saveProfile({ ...state.profile, role: 'software' });
  assert.equal((await service.state()).completedCount, 1);
});
test('catalog edits drive requirements and roadmaps without frontend changes', async () => {
  const careers = structuredClone(CAREERS);
  careers[0].skills = ['Python'];
  careers[0].milestones[0].title = 'Edited milestone';
  const repo = memoryStudentRepository(),
    provider = async () => careers,
    flow = createOnboardingService(repo, provider);
  await toSkills(flow);
  await finish(flow, ['Python']);
  const state = await createStudentService(repo, provider).state();
  assert.equal(state.skillMatch.percent, 100);
  assert.equal(state.next.title, 'Edited milestone');
});
test('existing profiles are treated as complete without losing their old progress', async () => {
  const flow = createOnboardingService(
    memoryStudentRepository({
      profile: { name: 'Alex' },
      progress: { frontend: { resume: { status: 'done' } } },
      applications: [],
    }),
  );
  assert.equal((await flow.state()).completed, true);
});
test('authenticated HTTP onboarding survives logout and login; account drafts stay private', async (context) => {
  const server = createHttpServer({ auth: memoryAuthRepository() });
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  context.after(() => new Promise((resolve) => server.close(resolve)));
  const base = `http://127.0.0.1:${server.address().port}`;
  let cookie;
  const call = async (path, method = 'GET', body) => {
    const response = await fetch(base + path, {
      method,
      headers: { 'Content-Type': 'application/json', ...(cookie ? { Cookie: cookie } : {}) },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });
    return { response, data: await response.json() };
  };
  let result = await call('/api/student/onboarding');
  assert.equal(result.response.status, 401);
  result = await call('/api/auth/register', 'POST', {
    email: 'onboard@example.test',
    password: 'Long sample onboarding password 123',
  });
  cookie = result.response.headers.get('set-cookie').split(';')[0];
  await call('/api/student/onboarding/step', 'PUT', {
    step: 1,
    answers: { situation: 'College Student' },
  });
  await call('/api/student/onboarding/draft', 'PUT', {
    step: 2,
    stage: 'goal',
    answers: { major: 'Computer Science' },
  });
  await call('/api/auth/logout', 'POST', {});
  result = await call('/api/auth/login', 'POST', {
    email: 'onboard@example.test',
    password: 'Long sample onboarding password 123',
  });
  cookie = result.response.headers.get('set-cookie').split(';')[0];
  result = await call('/api/student/onboarding');
  assert.equal(result.data.step, 2);
  assert.equal(result.data.answers.major, 'Computer Science');
  for (const path of [
    '/onboarding',
    '/onboarding.js',
    '/onboarding.css',
    '/modules/onboarding-views.js',
    '/modules/onboarding-fields.js',
  ])
    assert.equal((await fetch(base + path)).status, 200);
});

test('malformed drafts are rejected atomically instead of breaking resumed forms', async () => {
  const repo = memoryStudentRepository(),
    flow = createOnboardingService(repo);
  await flow.step({ step: 1, answers: { situation: 'College Student' } });
  await assert.rejects(
    flow.draft({ step: 2, stage: 'goal', answers: { major: ['Computer Science'] } }),
    { status: 400 },
  );
  await flow.step({ step: 2, answers: education });
  await flow.finder({ stage: 'start' });
  await assert.rejects(
    flow.draft({ step: 3, stage: 'interests', answers: { interests: 'Sports' } }),
    { status: 400 },
  );
  const state = await flow.state();
  assert.equal(state.stage, 'interests');
  assert.deepEqual(state.drafts ?? {}, {});
});
test('malformed profile skills and experience produce validation errors and preserve the saved profile', async () => {
  const repo = memoryStudentRepository(),
    flow = createOnboardingService(repo),
    service = createStudentService(repo);
  await toSkills(flow);
  await finish(flow, ['Python']);
  const initial = await service.state();
  for (const changes of [
    { existingSkills: null, skillLevels: { Python: 'Beginner' } },
    { experienceKinds: 123 },
    { skillLevels: ['Beginner'] },
    { skillLevels: null },
  ]) {
    await assert.rejects(service.saveProfile({ ...initial.profile, ...changes }), { status: 400 });
    assert.deepEqual((await service.state()).profile, initial.profile);
  }
  await flow.state();
});
