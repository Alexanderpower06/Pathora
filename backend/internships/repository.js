import { emptyStudentDocument } from './planner.js';

export function createStudentRepository(pool, userId = null) {
  const table = userId ? 'pathora_user_students' : 'pathora_student';
  const key = userId ? 'user_id' : 'id';
  const id = userId ?? 1;
  return {
    async read() {
      const { rows } = await pool.query(`SELECT data FROM ${table} WHERE ${key}=$1`, [id]);
      return rows[0].data;
    },
    async update(change) {
      const client = await pool.connect();
      try {
        await client.query('BEGIN');
        const { rows } = await client.query(
          `SELECT data FROM ${table} WHERE ${key}=$1 FOR UPDATE`,
          [id],
        );
        const document = rows[0].data;
        change(document);
        await client.query(`UPDATE ${table} SET data=$1 WHERE ${key}=$2`, [document, id]);
        await client.query('COMMIT');
        return document;
      } catch (error) {
        await client.query('ROLLBACK').catch(() => {});
        throw error;
      } finally {
        client.release();
      }
    },
  };
}
export async function initializeStudentRepository(pool) {
  await pool.query(
    'INSERT INTO pathora_student (id, data) VALUES (1, $1) ON CONFLICT (id) DO NOTHING',
    [emptyStudentDocument()],
  );
  return createStudentRepository(pool);
}
