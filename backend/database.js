import pg from 'pg';
import { CAREERS } from './onboarding/catalog.js';
import { createAuthRepository } from './auth/repository.js';
import { initializeStudentRepository } from './internships/repository.js';
import { readFile } from 'node:fs/promises';
import { careers, emptyProgress, summarize } from './roadmaps.js';
import { DEFAULT_PROFILE } from './validation.js';

export async function openDatabase({
  connectionString = process.env.DATABASE_URL,
  schema = 'public',
} = {}) {
  if (!connectionString)
    throw new Error('Set DATABASE_URL in .env, or run npm run dev for local PostgreSQL.');
  if (!/^[a-z][a-z0-9_]{0,62}$/.test(schema)) throw new Error('Invalid database schema.');
  const pool = new pg.Pool({
    connectionString,
    connectionTimeoutMillis: 5000,
    max: 10,
    options: `-c search_path=${schema} -c statement_timeout=10000 -c lock_timeout=5000`,
  });
  let students;
  let closing;
  pool.on('error', (error) => console.error('PostgreSQL connection error:', error.message));
  try {
    const migrations = await readFile(new URL('./schema.sql', import.meta.url), 'utf8');
    // Schema names are validated identifiers, and values use parameterized queries.
    await pool.query(`CREATE SCHEMA IF NOT EXISTS "${schema}"`);
    await pool.query(migrations);
    await pool.query(
      'INSERT INTO pathora_settings (id, profile) VALUES (1, $1) ON CONFLICT (id) DO NOTHING',
      [DEFAULT_PROFILE],
    );
    students = await initializeStudentRepository(pool);
    for (const career of CAREERS)
      await pool.query(
        'INSERT INTO pathora_career_catalog (id,data) VALUES ($1,$2) ON CONFLICT (id) DO NOTHING',
        [career.id, career],
      );
  } catch (error) {
    await pool.end();
    throw error;
  }

  async function state(client = pool, profile) {
    profile ??= (await client.query('SELECT profile FROM pathora_settings WHERE id=1')).rows[0]
      .profile;
    const row = (
      await client.query('SELECT data FROM pathora_progress WHERE career=$1', [profile.career])
    ).rows[0];
    const progress = row?.data ?? emptyProgress();
    return { profile, progress, ...summarize(profile, progress) };
  }
  async function transaction(action) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      // Lock the profile row so concurrent profile and progress edits use the same career.
      const { rows } = await client.query(
        'SELECT profile FROM pathora_settings WHERE id=1 FOR UPDATE',
      );
      const result = await action(client, rows[0].profile);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK').catch(() => {});
      throw error;
    } finally {
      client.release();
    }
  }
  return {
    auth: createAuthRepository(pool),
    careerCatalog: async () =>
      (await pool.query('SELECT data FROM pathora_career_catalog ORDER BY id')).rows.map(
        (row) => row.data,
      ),
    students,
    getState: () => transaction((client, profile) => state(client, profile)),
    saveProfile: (profile) =>
      transaction(async (client) => {
        await client.query('UPDATE pathora_settings SET profile=$1 WHERE id=1', [profile]);
        return state(client, profile);
      }),
    updateProgress: (action) =>
      transaction(async (client, profile) => {
        const current = await state(client, profile);
        action(current.progress, careers[profile.career]);
        await client.query(
          `INSERT INTO pathora_progress (career, data) VALUES ($1, $2)
        ON CONFLICT (career) DO UPDATE SET data=EXCLUDED.data`,
          [profile.career, current.progress],
        );
        return state(client, profile);
      }),
    close: () => (closing ??= pool.end()),
  };
}
