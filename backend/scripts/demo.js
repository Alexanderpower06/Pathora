import { createHttpServer } from '../server.js';
import { memoryAuthRepository } from '../testing/memory-auth-repository.js';

const port = Number(process.env.PORT || 4173);
if (!Number.isInteger(port) || port < 1 || port > 65535)
  throw new Error('PORT must be 1 to 65535.');
const server = createHttpServer({ auth: memoryAuthRepository({ demo: true }) });
server.listen(port, '127.0.0.1', () =>
  console.log(
    `Pathora DEMO at http://127.0.0.1:${port}. Data is temporary and resets when this process stops.`,
  ),
);
for (const signal of ['SIGINT', 'SIGTERM']) process.once(signal, () => server.close());
