import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { initializePostgresDirectory } from '../scripts/postgres-directory.js';
async function fixture(context) {
  const root = await mkdtemp(join(tmpdir(), 'pathora-directory-test-'));
  context.after(() => rm(root, { recursive: true, force: true }));
  let initialized = 0;
  return {
    root,
    cluster: {
      initialise: async () => {
        initialized++;
      },
    },
    count: () => initialized,
  };
}
test('new and empty PostgreSQL directories initialize once', async (context) => {
  const { root, cluster, count } = await fixture(context);
  await initializePostgresDirectory(cluster, join(root, 'new'));
  const empty = join(root, 'empty');
  await mkdir(empty);
  await initializePostgresDirectory(cluster, empty);
  assert.equal(count(), 2);
});
test('existing PostgreSQL 18 data is reused without running initdb', async (context) => {
  const { root, cluster, count } = await fixture(context);
  await mkdir(join(root, 'global'));
  await writeFile(join(root, 'PG_VERSION'), '18\n');
  await writeFile(join(root, 'global', 'pg_control'), 'saved control');
  await writeFile(join(root, 'postgresql.conf'), 'saved configuration');
  await initializePostgresDirectory(cluster, root);
  await initializePostgresDirectory(cluster, root);
  assert.equal(count(), 0);
  assert.equal(await readFile(join(root, 'global', 'pg_control'), 'utf8'), 'saved control');
});
test('incomplete and incompatible saved directories are preserved', async (context) => {
  const { root, cluster, count } = await fixture(context);
  const saved = join(root, 'important');
  await writeFile(saved, 'keep this file');
  await assert.rejects(initializePostgresDirectory(cluster, root), /saved files were preserved/);
  await writeFile(join(root, 'PG_VERSION'), '17\n');
  await assert.rejects(initializePostgresDirectory(cluster, root), /saved database uses 17/);
  await writeFile(join(root, 'PG_VERSION'), '18\n');
  await assert.rejects(initializePostgresDirectory(cluster, root), /incomplete/);
  assert.equal(count(), 0);
  assert.equal(await readFile(saved, 'utf8'), 'keep this file');
});
