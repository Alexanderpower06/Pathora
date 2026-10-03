import { access, readFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';

// initdb is only for a new cluster. Existing accounts must survive dev-server restarts.
export async function initializePostgresDirectory(cluster, directory) {
  let version;
  try {
    version = (await readFile(join(directory, 'PG_VERSION'), 'utf8')).trim();
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }
  if (version !== undefined) {
    if (version !== '18')
      throw new Error(
        `This project uses PostgreSQL 18, but the saved database uses ${version}. Use a matching PostgreSQL server or migrate it. The saved files were preserved.`,
      );
    try {
      await access(join(directory, 'global', 'pg_control'));
      await access(join(directory, 'postgresql.conf'));
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
      throw new Error(
        'The saved PostgreSQL directory is incomplete. Restore it from a backup before starting. The saved files were preserved.',
        { cause: error },
      );
    }
    return;
  }
  let files;
  try {
    files = await readdir(directory);
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
    files = [];
  }
  if (files.length)
    throw new Error(
      'The PostgreSQL directory contains files but is not an initialized database. Restore it from a backup or use a separate empty data directory. The saved files were preserved.',
    );
  await cluster.initialise();
}
