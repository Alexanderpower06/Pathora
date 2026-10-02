import test from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import pg from 'pg';
import { once } from 'node:events';
import { createPathoraServer } from './server.js';

test('profiles, progress, and applications persist and remain separate by career', async () => {
  const options = databaseOptions();
  let server = await createPathoraServer({ ...options, allowLegacy: true });
  async function start() {
    server.listen(0, '127.0.0.1');
    await once(server, 'listening');
    return 'http://127.0.0.1:' + server.address().port;
  }
  let origin = await start();
  async function api(path, method = 'GET', data) {
    const response = await fetch(origin + path, {
      method,
      headers: data ? { 'Content-Type': 'application/json' } : {},
      body: data ? JSON.stringify(data) : undefined,
    });
    return { status: response.status, data: await response.json() };
  }
  const profile = {
    name: 'Alex',
    major: 'Computer Science',
    education: 'Undergraduate student',
    skills: 'JavaScript',
    experience: 'Team project',
    interests: 'Education tools',
    career: 'Software Engineer',
  };
  try {
    assert.equal((await api('/api/state')).data.readiness, 0);
    assert.equal((await api('/api/profile', 'PUT', { ...profile, name: ' ' })).status, 400);
    assert.equal((await api('/api/profile', 'PUT', { ...profile, career: 'Unknown' })).status, 400);
    const saved = await api('/api/profile', 'PUT', profile);
    assert.equal(saved.status, 200);
    assert.equal(saved.data.completed, 1);
    assert.equal(
      (await api('/api/progress', 'PATCH', { category: 'skills', index: 99, done: true })).status,
      400,
    );
    for (let index = 0; index < 4; index++)
      assert.equal(
        (await api('/api/progress', 'PATCH', { category: 'skills', index, done: true })).status,
        200,
      );
    let current = (await api('/api/state')).data;
    assert.equal(current.categories.skills, 100);
    assert.equal(current.readiness, 25);
    assert.equal(current.next.section, 'Projects');
    await api('/api/progress', 'PATCH', { category: 'skills', index: 0, done: true });
    assert.equal((await api('/api/state')).data.progress.skills.length, 4);
    const applied = await api('/api/applications', 'POST', {
      company: 'Example',
      role: 'Junior Engineer',
    });
    assert.equal(applied.status, 201);
    const id = applied.data.progress.applications[0].id;
    assert.equal(
      (await api('/api/applications/' + id, 'PATCH', { status: 'Interviewing' })).data.progress
        .applications[0].status,
      'Interviewing',
    );
    assert.equal(
      (await api('/api/applications/' + id, 'PATCH', { status: 'Invalid' })).status,
      400,
    );
    await api('/api/profile', 'PUT', { ...profile, career: 'Data Analyst' });
    assert.equal((await api('/api/state')).data.readiness, 0);
    assert.equal((await api('/api/state')).data.progress.applications.length, 0);
    await api('/api/profile', 'PUT', profile);
    assert.equal((await api('/api/state')).data.readiness, 25);
    await new Promise((resolve) => server.close(resolve));
    await server.databaseClosed;
    server = await createPathoraServer({ ...options, allowLegacy: true });
    origin = await start();
    current = (await api('/api/state')).data;
    assert.equal(current.profile.name, 'Alex');
    assert.equal(current.categories.skills, 100);
    assert.equal(current.progress.applications[0].status, 'Interviewing');
    assert.equal(
      (await api('/api/applications/' + id, 'DELETE', {})).data.progress.applications.length,
      0,
    );
    assert.equal((await api('/api/applications/' + id, 'DELETE', {})).status, 404);
    assert.equal((await fetch(origin + '/backend/server.js')).status, 404);
    assert.equal(
      (await fetch(origin + '/api/state', { headers: { Origin: 'https://example.com' } })).status,
      403,
    );
    assert.equal((await fetch(origin + '/api/profile', { method: 'PUT', body: '{}' })).status, 400);
    const invalid = await fetch(origin + '/api/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: 'not json',
    });
    assert.equal(invalid.status, 400);
    assert.equal((await fetch(origin + '/')).status, 200);
  } finally {
    await new Promise((resolve) => server.close(resolve));
    await server.databaseClosed;
    await dropTestSchema(options);
  }
});

async function fixture(context) {
  const options = databaseOptions();
  const server = await createPathoraServer({ ...options, allowLegacy: true });
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  const origin = 'http://127.0.0.1:' + server.address().port;
  context.after(async () => {
    await new Promise((resolve) => server.close(resolve));
    await server.databaseClosed;
    await dropTestSchema(options);
  });
  async function api(path, method = 'GET', data) {
    const response = await fetch(origin + path, {
      method,
      headers: data ? { 'Content-Type': 'application/json' } : {},
      body: data ? JSON.stringify(data) : undefined,
    });
    return { status: response.status, data: await response.json() };
  }
  return { server, origin, api };
}

test('inherited career keys are rejected without corrupting the saved profile', async (context) => {
  const { api } = await fixture(context);
  const profile = {
    name: 'Review',
    major: 'CS',
    education: 'Undergraduate student',
    skills: '',
    experience: '',
    interests: '',
    career: 'Software Engineer',
  };
  await api('/api/profile', 'PUT', profile);
  for (const career of ['constructor', '__proto__', 'toString', 'hasOwnProperty']) {
    assert.equal((await api('/api/profile', 'PUT', { ...profile, career })).status, 400);
    const current = await api('/api/state');
    assert.equal(current.status, 200);
    assert.equal(current.data.profile.career, 'Software Engineer');
  }
});

for (const method of ['PATCH', 'DELETE']) {
  test(`${method} application preserves checklist changes saved while its body is pending`, async (context) => {
    const { request } = await import('node:http');
    const { server, origin, api } = await fixture(context);
    const added = await api('/api/applications', 'POST', { company: 'Example', role: 'Engineer' });
    const id = added.data.progress.applications[0].id;
    const payload = JSON.stringify(method === 'PATCH' ? { status: 'Interviewing' } : {});
    const received = once(server, 'request');
    const pending = request(origin + '/api/applications/' + id, {
      method,
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(payload) },
    });
    context.after(() => pending.destroy());
    const responseReceived = once(pending, 'response');
    pending.flushHeaders();
    await received;
    await api('/api/progress', 'PATCH', { category: 'skills', index: 0, done: true });
    pending.end(payload);
    const [response] = await responseReceived;
    response.resume();
    await once(response, 'end');
    assert.equal(response.statusCode, 200);
    const current = (await api('/api/state')).data;
    assert.deepEqual(current.progress.skills, [0]);
    assert.equal(current.progress.applications.length, method === 'PATCH' ? 1 : 0);
    if (method === 'PATCH') assert.equal(current.progress.applications[0].status, 'Interviewing');
  });
}

test('invalid application updates leave saved data intact', async (context) => {
  const { api } = await fixture(context);
  const added = await api('/api/applications', 'POST', { company: 'Example', role: 'Engineer' });
  const id = added.data.progress.applications[0].id;
  assert.equal((await api('/api/applications/' + id, 'PATCH', { status: 'Invented' })).status, 400);
  assert.equal((await api('/api/state')).data.progress.applications[0].status, 'Applied');
  assert.equal(
    (await api('/api/progress', 'PATCH', { category: 'constructor', index: 0, done: true })).status,
    400,
  );
});

function databaseOptions() {
  if (!process.env.TEST_DATABASE_URL)
    throw new Error('Run tests with npm test or set TEST_DATABASE_URL.');
  return {
    connectionString: process.env.TEST_DATABASE_URL,
    schema: 'pathora_test_' + randomUUID().replaceAll('-', ''),
  };
}
async function dropTestSchema({ connectionString, schema }) {
  const pool = new pg.Pool({ connectionString });
  try {
    await pool.query(`DROP SCHEMA "${schema}" CASCADE`);
  } finally {
    await pool.end();
  }
}

test('concurrent PostgreSQL writes preserve every checklist and application update', async (context) => {
  const { api } = await fixture(context);
  const results = await Promise.all([
    ...[0, 1, 2, 3].map((index) =>
      api('/api/progress', 'PATCH', { category: 'skills', index, done: true }),
    ),
    ...['One', 'Two', 'Three'].map((company) =>
      api('/api/applications', 'POST', { company, role: 'Engineer' }),
    ),
  ]);
  assert.ok(results.every((result) => result.status === 200 || result.status === 201));
  const current = (await api('/api/state')).data;
  assert.deepEqual(current.progress.skills.toSorted(), [0, 1, 2, 3]);
  assert.deepEqual(current.progress.applications.map((item) => item.company).toSorted(), [
    'One',
    'Three',
    'Two',
  ]);
});

test('SQLite import preserves saved data, runs once, and leaves the source file intact', async (context) => {
  const { mkdtemp, rm, access } = await import('node:fs/promises');
  const { tmpdir } = await import('node:os');
  const { join } = await import('node:path');
  const { DatabaseSync } = await import('node:sqlite');
  const { migrateSqlite } = await import('./scripts/migrate-sqlite.js');
  const { openDatabase } = await import('./database.js');
  const directory = await mkdtemp(join(tmpdir(), 'pathora-import-test-'));
  const sourcePath = join(directory, 'legacy.sqlite');
  const options = databaseOptions();
  context.after(async () => {
    await dropTestSchema(options);
    await rm(directory, { recursive: true, force: true });
  });
  const sqlite = new DatabaseSync(sourcePath);
  const profile = {
    name: 'Alex',
    major: 'Computer Science',
    education: 'Undergraduate student',
    skills: 'JavaScript',
    experience: '',
    interests: '',
    career: 'Software Engineer',
  };
  const progress = {
    skills: [0, 1],
    projects: [0],
    experience: [],
    interviews: [],
    applications: [
      {
        id: randomUUID(),
        company: 'Example',
        role: 'Engineer',
        status: 'Applied',
        createdAt: new Date().toISOString(),
      },
    ],
  };
  try {
    sqlite.exec(
      'CREATE TABLE settings (id INTEGER PRIMARY KEY, profile TEXT); CREATE TABLE progress (career TEXT PRIMARY KEY, data TEXT)',
    );
    sqlite.prepare('INSERT INTO settings VALUES (1, ?)').run(JSON.stringify(profile));
    sqlite
      .prepare('INSERT INTO progress VALUES (?, ?)')
      .run(profile.career, JSON.stringify(progress));
  } finally {
    sqlite.close();
  }
  assert.equal(await migrateSqlite(options.connectionString, sourcePath, options), true);
  let database = await openDatabase(options);
  try {
    const saved = await database.getState();
    assert.deepEqual(saved.profile, profile);
    assert.deepEqual(saved.progress, progress);
    await database.updateProgress((data) => data.skills.push(2));
  } finally {
    await database.close();
  }
  assert.equal(await migrateSqlite(options.connectionString, sourcePath, options), false);
  database = await openDatabase(options);
  try {
    assert.deepEqual((await database.getState()).progress.skills, [0, 1, 2]);
  } finally {
    await database.close();
  }
  await access(sourcePath);
});
