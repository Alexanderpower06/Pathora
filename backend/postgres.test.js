import test from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import pg from 'pg';
import { openDatabase } from './database.js';
import { createStudentService } from './internships/service.js';

const profile = {
  name: 'Alex',
  major: 'CS',
  graduation: '2028-05',
  weeklyHours: 5,
  targetDate: '2027-02-01',
  role: 'frontend',
  interests: ['Building websites'],
  existingSkills: ['JavaScript'],
  courses: 'A class project',
  experience: 'Campus job',
};
async function fixture(context) {
  const options = {
    connectionString: process.env.TEST_DATABASE_URL,
    schema: 'pathora_test_' + randomUUID().replaceAll('-', ''),
  };
  const database = await openDatabase(options);
  context.after(async () => {
    await database.close();
    const pool = new pg.Pool({ connectionString: options.connectionString });
    try {
      await pool.query(`DROP SCHEMA "${options.schema}" CASCADE`);
    } finally {
      await pool.end();
    }
  });
  return { database, options, service: createStudentService(database.students) };
}
test('PostgreSQL preserves the internship profile, evidence, and applications across reconnection', async (context) => {
  const { database, options, service } = await fixture(context);
  await service.saveProfile(profile);
  await service.updateTask('resume', {
    role: 'frontend',
    status: 'done',
    evidence: 'Created a résumé describing my group project',
    link: '',
  });
  await service.addApplication({
    company: 'Example',
    title: 'Frontend intern',
    role: 'frontend',
    status: 'Applied',
    notes: 'Ask for feedback',
  });
  await database.close();
  const reopened = await openDatabase(options);
  try {
    const state = await createStudentService(reopened.students).state();
    assert.equal(state.profile.name, 'Alex');
    assert.equal(state.completedCount, 2);
    assert.equal(state.applications[0].company, 'Example');
  } finally {
    await reopened.close();
  }
});
test('PostgreSQL row locks preserve concurrent student saves and rollback failed changes', async (context) => {
  const { service } = await fixture(context);
  await service.saveProfile(profile);
  await Promise.all([
    service.updateTask('resume', {
      role: 'frontend',
      status: 'done',
      evidence: 'Wrote a one page résumé with two examples',
      link: '',
    }),
    service.updateTask('compare-postings', {
      role: 'frontend',
      status: 'done',
      evidence: 'Compared three postings and their deadlines',
      link: '',
    }),
    service.addApplication({
      company: 'One',
      title: 'Intern',
      role: 'frontend',
      status: 'Saved',
      notes: '',
    }),
    service.addApplication({
      company: 'Two',
      title: 'Intern',
      role: 'backend',
      status: 'Saved',
      notes: '',
    }),
  ]);
  await assert.rejects(
    service.updateTask('invalid', {
      role: 'frontend',
      status: 'done',
      evidence: 'A task that does not exist',
      link: '',
    }),
    { status: 404 },
  );
  const saved = await service.state();
  assert.equal(saved.completedCount, 2);
  assert.equal(saved.applications.length, 2);
});

test('PostgreSQL accounts, sessions, and private student documents persist independently', async (context) => {
  const { database, options } = await fixture(context);
  const one = { id: randomUUID(), email: 'one@example.test', passwordHash: 'test hash' };
  const two = { id: randomUUID(), email: 'two@example.test', passwordHash: 'test hash' };
  assert.equal(await database.auth.createUser(one), true);
  assert.equal(await database.auth.createUser(two), true);
  assert.equal(await database.auth.createUser({ ...one, id: randomUUID() }), false);
  await createStudentService(database.auth.students(one.id)).saveProfile(profile);
  await database.auth.saveSession({
    hash: 'test-session-hash',
    userId: one.id,
    expiresAt: new Date(Date.now() + 60000),
  });
  await database.close();
  const reopened = await openDatabase(options);
  try {
    assert.equal((await reopened.auth.findUser(one.email)).id, one.id);
    assert.equal((await reopened.auth.session('test-session-hash', new Date())).id, one.id);
    assert.equal(
      (await createStudentService(reopened.auth.students(one.id)).state()).profile.name,
      'Alex',
    );
    assert.equal(
      (await createStudentService(reopened.auth.students(two.id)).state()).profile,
      null,
    );
    await reopened.auth.revoke('test-session-hash');
    assert.equal(await reopened.auth.session('test-session-hash', new Date()), undefined);
  } finally {
    await reopened.close();
  }
});

test('PostgreSQL retains onboarding drafts and editable career catalog across restart', async (context) => {
  const { database, options } = await fixture(context);
  const { createOnboardingService } = await import('./onboarding/service.js');
  const user = { id: randomUUID(), email: 'onboarding@example.test', passwordHash: 'test hash' };
  await database.auth.createUser(user);
  const flow = createOnboardingService(database.auth.students(user.id), database.careerCatalog);
  await flow.step({ step: 1, answers: { situation: 'College Student' } });
  await flow.draft({
    step: 2,
    stage: 'goal',
    answers: { major: 'Computer Science', school: 'Saved college' },
  });
  const pool = new pg.Pool({
    connectionString: options.connectionString,
    options: `-c search_path=${options.schema}`,
  });
  try {
    await pool.query(
      "UPDATE pathora_career_catalog SET data=jsonb_set(data,'{milestones,0,title}',to_jsonb($1::text)) WHERE id=$2",
      ['Custom first milestone', 'software'],
    );
  } finally {
    await pool.end();
  }
  await database.close();
  const reopened = await openDatabase(options);
  try {
    const restored = await createOnboardingService(
      reopened.auth.students(user.id),
      reopened.careerCatalog,
    ).state();
    assert.equal(restored.step, 2);
    assert.equal(restored.answers.school, 'Saved college');
    assert.equal(
      restored.catalog.careers.find((career) => career.id === 'software').milestones[0].title,
      'Custom first milestone',
    );
  } finally {
    await reopened.close();
  }
});
