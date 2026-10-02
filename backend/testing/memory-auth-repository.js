import { memoryStudentRepository } from './memory-student-repository.js';
import { emptyStudentDocument } from '../internships/planner.js';

export function memoryAuthRepository({ demo = false } = {}) {
  const users = new Map();
  const documents = new Map();
  const sessions = new Map();
  return {
    async createUser(user) {
      if (users.has(user.email)) return false;
      users.set(user.email, structuredClone(user));
      documents.set(user.id, memoryStudentRepository({ ...emptyStudentDocument(), demo }));
      return true;
    },
    async findUser(email) {
      return structuredClone(users.get(email));
    },
    async saveSession(session) {
      for (const [hash, saved] of sessions)
        if (saved.expiresAt <= new Date()) sessions.delete(hash);
      sessions.set(session.hash, session);
    },
    async session(hash, now) {
      const session = sessions.get(hash);
      if (!session || session.expiresAt <= now) return undefined;
      const user = [...users.values()].find((user) => user.id === session.userId);
      return user && { id: user.id, email: user.email };
    },
    async revoke(hash) {
      sessions.delete(hash);
    },
    students: (id) => documents.get(id),
  };
}
