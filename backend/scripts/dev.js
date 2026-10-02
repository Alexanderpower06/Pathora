import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { randomBytes } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { once } from 'node:events';
import { startLocalPostgres } from './local-postgres.js';
import { createPathoraServer } from '../server.js';
import { migrateSqlite } from './migrate-sqlite.js';

const dataDir = new URL('../../data/', import.meta.url);
await mkdir(dataDir, { recursive: true });
const passwordFile = new URL('postgres-password', dataDir);
let password;
try {
  password = await readFile(passwordFile, 'utf8');
} catch (error) {
  if (error.code !== 'ENOENT') throw error;
  password = randomBytes(24).toString('hex');
  await writeFile(passwordFile, password, { mode: 0o600, flag: 'wx' });
}
const port = Number(process.env.PORT || 4175);
const databasePort = Number(process.env.PG_DEV_PORT || 55432);
for (const value of [port, databasePort]) {
  if (!Number.isInteger(value) || value < 1 || value > 65535)
    throw new Error('Ports must be integers from 1 to 65535.');
}
const cluster = await startLocalPostgres({
  databaseDir: fileURLToPath(new URL('postgres', dataDir)),
  password,
  port: databasePort,
  persistent: true,
});
let server;
try {
  await migrateSqlite(cluster.connectionString, fileURLToPath(new URL('pathora.sqlite', dataDir)));
  server = await createPathoraServer({ connectionString: cluster.connectionString });
  server.listen(port, '127.0.0.1');
  await once(server, 'listening');
  console.log(`Pathora running at http://127.0.0.1:${port} (PostgreSQL on port ${databasePort})`);
} catch (error) {
  if (server) {
    await new Promise((resolve) => server.close(resolve));
    await server.databaseClosed;
  }
  await cluster.stop();
  throw error;
}
let stopping = false;
async function shutdown() {
  if (stopping) return;
  stopping = true;
  await new Promise((resolve) => server.close(resolve));
  await server.databaseClosed;
  await cluster.stop();
}
for (const signal of ['SIGINT', 'SIGTERM']) process.once(signal, shutdown);
