import { createHash, randomBytes, randomUUID } from 'node:crypto';
import { InputError, validateText } from '../validation.js';
import { hashPassword, verifyPassword } from './passwords.js';

export const SESSION_SECONDS = 24 * 60 * 60;
export const COOKIE_NAME = 'pathora_session';
const digest = (token) => createHash('sha256').update(token).digest('hex');
function credentials(input, registering) {
  const email = validateText(input.email, 'Email', 254, true).toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    throw new InputError('Enter a valid email address.');
  const password = input.password;
  if (
    typeof password !== 'string' ||
    password.length > 128 ||
    password.length < (registering ? 15 : 1)
  )
    throw new InputError(
      registering ? 'Use a password with 15 to 128 characters.' : 'Enter your password.',
    );
  return { email, password };
}
export function sessionToken(request) {
  const entry = request.headers.cookie
    ?.split(';')
    .map((value) => value.trim())
    .find((value) => value.startsWith(COOKIE_NAME + '='));
  const token = entry?.slice(COOKIE_NAME.length + 1);
  return token && /^[a-f0-9]{64}$/.test(token) ? token : null;
}
export function createAuthService(repository, { now = () => new Date() } = {}) {
  let hashing = 0;
  async function limitedHash(operation) {
    if (hashing >= 2) throw new InputError('Sign-in is busy. Please try again shortly.', 429);
    hashing++;
    try {
      return await operation();
    } finally {
      hashing--;
    }
  }
  return {
    async authenticate(input, registering) {
      const { email, password } = credentials(input, registering);
      let user;
      if (registering) {
        user = {
          id: randomUUID(),
          email,
          passwordHash: await limitedHash(() => hashPassword(password)),
        };
        if (!(await repository.createUser(user)))
          throw new InputError('Unable to create this account. Try signing in instead.', 409);
      } else {
        user = await repository.findUser(email);
        const valid = await limitedHash(() => verifyPassword(password, user?.passwordHash));
        if (!user || !valid) throw new InputError('Email or password is incorrect.', 401);
      }
      const token = randomBytes(32).toString('hex');
      await repository.saveSession({
        hash: digest(token),
        userId: user.id,
        expiresAt: new Date(now().getTime() + SESSION_SECONDS * 1000),
      });
      return { token, user: { id: user.id, email: user.email } };
    },
    async user(request) {
      const token = sessionToken(request);
      return token ? repository.session(digest(token), now()) : undefined;
    },
    async logout(request) {
      const token = sessionToken(request);
      if (token) await repository.revoke(digest(token));
    },
  };
}
