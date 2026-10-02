import { emptyStudentDocument } from '../internships/planner.js';

// Used only by isolated tests and the explicitly labeled demo server.
export function memoryStudentRepository(initial = emptyStudentDocument()) {
  let document = structuredClone(initial);
  let queue = Promise.resolve();
  return {
    async read() {
      await queue;
      return structuredClone(document);
    },
    update(change) {
      const operation = queue.then(() => {
        const draft = structuredClone(document);
        change(draft);
        document = draft;
        return structuredClone(document);
      });
      queue = operation.catch(() => {});
      return operation;
    },
  };
}
