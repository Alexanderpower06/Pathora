import { emptyStudentDocument } from '../internships/planner.js';
import { createStudentRepository } from '../internships/repository.js';

export function createAuthRepository(pool) {
  return {
    async createUser(user) {
      const client = await pool.connect();
      try {
        await client.query('BEGIN');
        await client.query(
          'INSERT INTO pathora_users (id, email, password_hash) VALUES ($1, $2, $3)',
          [user.id, user.email, user.passwordHash],
        );
        await client.query('INSERT INTO pathora_user_students (user_id, data) VALUES ($1, $2)', [
          user.id,
          emptyStudentDocument(),
        ]);
        await client.query('COMMIT');
        return true;
      } catch (error) {
        await client.query('ROLLBACK').catch(() => {});
        if (error.code === '23505') return false;
        throw error;
      } finally {
        client.release();
      }
    },
    async findUser(email) {
      const { rows } = await pool.query(
        'SELECT id, email, password_hash AS "passwordHash" FROM pathora_users WHERE email=$1',
        [email],
      );
      return rows[0];
    },
    async saveSession(session) {
      await pool.query('DELETE FROM pathora_sessions WHERE expires_at <= CURRENT_TIMESTAMP');
      await pool.query(
        'INSERT INTO pathora_sessions (token_hash, user_id, expires_at) VALUES ($1, $2, $3)',
        [session.hash, session.userId, session.expiresAt],
      );
    },
    async session(hash, now) {
      const { rows } = await pool.query(
        'SELECT u.id, u.email FROM pathora_sessions s JOIN pathora_users u ON u.id=s.user_id WHERE s.token_hash=$1 AND s.expires_at>$2',
        [hash, now],
      );
      return rows[0];
    },
    async revoke(hash) {
      await pool.query('DELETE FROM pathora_sessions WHERE token_hash=$1', [hash]);
    },
    students: (id) => createStudentRepository(pool, id),
  };
}
