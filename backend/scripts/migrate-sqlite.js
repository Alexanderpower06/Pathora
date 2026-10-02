import { access } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import pg from 'pg';
import { openDatabase } from '../database.js';
import {
  DEFAULT_PROFILE,
  validateProfile,
  validateChecklist,
  validateApplication,
  validateStatus,
} from '../validation.js';
import { careers } from '../roadmaps.js';

export async function migrateSqlite(connectionString, sourcePath, { schema = 'public' } = {}) {
  try {
    await access(sourcePath);
  } catch (error) {
    if (error.code === 'ENOENT') return false;
    throw error;
  }
  const database = await openDatabase({ connectionString, schema });
  await database.close();
  const client = new pg.Client({
    connectionString,
    options: `-c search_path=${schema} -c statement_timeout=10000 -c lock_timeout=5000`,
  });
  let sqlite;
  try {
    await client.connect();
    await client.query('BEGIN');
    const { rows } = await client.query(
      'SELECT profile FROM pathora_settings WHERE id=1 FOR UPDATE',
    );
    const marker = await client.query('SELECT 1 FROM pathora_migrations WHERE name=$1', [
      'sqlite-import',
    ]);
    if (marker.rowCount) {
      await client.query('COMMIT');
      return false;
    }
    const progress = await client.query('SELECT 1 FROM pathora_progress LIMIT 1');
    if (rows[0].profile.name || rows[0].profile.major || progress.rowCount) {
      await client.query('COMMIT');
      console.log(
        'SQLite import skipped: PostgreSQL already contains saved data. Original SQLite file retained.',
      );
      return false;
    }
    const { DatabaseSync } = await import('node:sqlite');
    sqlite = new DatabaseSync(sourcePath, { readOnly: true });
    const rawProfile = JSON.parse(
      sqlite.prepare('SELECT profile FROM settings WHERE id=1').get().profile,
    );
    const isDefault = Object.keys(DEFAULT_PROFILE).every(
      (key) => rawProfile[key] === DEFAULT_PROFILE[key],
    );
    const profile = isDefault ? DEFAULT_PROFILE : validateProfile(rawProfile);
    const oldProgress = sqlite.prepare('SELECT career, data FROM progress').all();
    for (const row of oldProgress) {
      if (!Object.hasOwn(careers, row.career))
        throw new Error('Unsupported career in SQLite import.');
      const data = JSON.parse(row.data);
      for (const category of ['skills', 'projects', 'experience', 'interviews']) {
        if (!Array.isArray(data[category])) throw new Error('Invalid SQLite checklist.');
        for (const index of data[category])
          validateChecklist({ category, index, done: true }, careers[row.career]);
      }
      if (!Array.isArray(data.applications)) throw new Error('Invalid SQLite applications.');
      for (const application of data.applications) {
        validateApplication(application);
        validateStatus(application.status);
        if (typeof application.id !== 'string' || !/^[a-zA-Z0-9-]+$/.test(application.id))
          throw new Error('Invalid application ID.');
      }
      await client.query('INSERT INTO pathora_progress (career, data) VALUES ($1, $2)', [
        row.career,
        data,
      ]);
    }
    await client.query('UPDATE pathora_settings SET profile=$1 WHERE id=1', [profile]);
    await client.query('INSERT INTO pathora_migrations (name) VALUES ($1)', ['sqlite-import']);
    await client.query('COMMIT');
    console.log('Existing SQLite data imported into PostgreSQL. Original SQLite file retained.');
    return true;
  } catch (error) {
    await client.query('ROLLBACK').catch(() => {});
    throw error;
  } finally {
    sqlite?.close();
    await client.end();
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const sourcePath =
    process.argv[2] || fileURLToPath(new URL('../../data/pathora.sqlite', import.meta.url));
  await migrateSqlite(process.env.DATABASE_URL, sourcePath);
}
