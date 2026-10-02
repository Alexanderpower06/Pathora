export function createApi(onState, accountId = () => null) {
  let queue = Promise.resolve();
  async function request(path, method = 'GET', data) {
    let response;
    try {
      response = await fetch('/api/student/' + path, {
        method,
        headers: {
          ...(data ? { 'Content-Type': 'application/json' } : {}),
          ...(accountId() ? { 'X-Pathora-Account': accountId() } : {}),
        },
        body: data ? JSON.stringify(data) : undefined,
      });
    } catch {
      throw new Error('Cannot reach Pathora. Check that the backend is running and try again.');
    }
    let result;
    try {
      result = await response.json();
    } catch {
      throw new Error('This preview is missing the backend. Run npm run dev, then open port 4175.');
    }
    if (!response.ok) {
      if (response.status === 401) window.location.assign('/login');
      throw new Error(result.error || 'Your change could not be saved. Please try again.');
    }
    return result;
  }
  return {
    load: () => request('state'),
    save(path, method, data) {
      const operation = queue.then(async () => {
        const state = await request(path, method, data);
        onState(state);
        return state;
      });
      queue = operation.catch(() => {});
      return operation;
    },
  };
}
