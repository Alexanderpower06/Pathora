import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { randomBytes } from 'node:crypto';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { availablePort, startLocalPostgres } from './local-postgres.js';

let cluster;
let directory;
try {
  let connectionString = process.env.TEST_DATABASE_URL;
  if (!connectionString) {
    directory = await mkdtemp(join(tmpdir(), 'pathora-postgres-test-'));
    cluster = await startLocalPostgres({
      databaseDir: join(directory, 'database'),
      password: randomBytes(24).toString('hex'),
      port: await availablePort(),
      persistent: false,
    });
    connectionString = cluster.connectionString;
  }
  const child = spawn(
    process.execPath,
    ['--test', 'backend/server.test.js', 'backend/postgres.test.js'],
    {
      stdio: 'inherit',
      env: { ...process.env, TEST_DATABASE_URL: connectionString },
    },
  );
  const [code] = await once(child, 'exit');
  process.exitCode = code ?? 1;
} finally {
  await cluster?.stop();
  if (directory) await rm(directory, { recursive: true, force: true });
}
