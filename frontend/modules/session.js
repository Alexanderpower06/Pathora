export async function authRequest(path, data) {
  let response;
  try {
    response = await fetch('/api/auth/' + path, {
      method: data ? 'POST' : 'GET',
      headers: data ? { 'Content-Type': 'application/json' } : {},
      body: data ? JSON.stringify(data) : undefined,
    });
  } catch {
    throw new Error('Cannot reach Pathora. Check that the server is running.');
  }
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || 'Please try again.');
  return result;
}
export async function requireSession() {
  const { user } = await authRequest('me');
  if (!user) {
    window.location.replace(
      '/login' + (window.location.search.includes('start=1') ? '?start=1' : ''),
    );
    return null;
  }
  return user;
}
