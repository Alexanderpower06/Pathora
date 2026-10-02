import EmbeddedPostgres from 'embedded-postgres';
import { createServer } from 'node:net';
import { once } from 'node:events';

export async function availablePort() {
  const socket = createServer();
  socket.listen(0, '127.0.0.1');
  await once(socket, 'listening');
  const { port } = socket.address();
  await new Promise((resolve, reject) =>
    socket.close((error) => (error ? reject(error) : resolve())),
  );
  return port;
}

export async function startLocalPostgres({ databaseDir, password, port, persistent }) {
  const cluster = new EmbeddedPostgres({
    databaseDir,
    password,
    port,
    persistent,
    user: 'postgres',
    authMethod: 'scram-sha-256',
    initdbFlags: ['--locale=C', '--encoding=UTF8'],
    postgresFlags: ['-c', 'listen_addresses=127.0.0.1', '-c', 'unix_socket_directories='],
    onLog: (message) => {
      if (message.includes('FATAL:') || message.includes('PANIC:')) console.error(message);
    },
    onError: (error) => console.error('Local PostgreSQL:', error),
  });
  await cluster.initialise();
  await cluster.start();
  const admin = cluster.getPgClient('postgres', '127.0.0.1');
  try {
    await admin.connect();
    const existing = await admin.query('SELECT 1 FROM pg_database WHERE datname=$1', ['pathora']);
    if (!existing.rowCount) await admin.query('CREATE DATABASE pathora');
  } catch (error) {
    await cluster.stop();
    throw error;
  } finally {
    await admin.end();
  }
  const url = new URL(`postgresql://127.0.0.1:${port}/pathora`);
  url.username = 'postgres';
  url.password = password;
  return { connectionString: url.href, stop: () => cluster.stop() };
}
