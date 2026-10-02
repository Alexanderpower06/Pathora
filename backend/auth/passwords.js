import { randomBytes, scrypt, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';

const derive = promisify(scrypt);
const options = { N: 131072, r: 8, p: 1, maxmem: 192 * 1024 * 1024 };
const dummy = `scrypt$${'00'.repeat(16)}$${'00'.repeat(64)}`;
export async function hashPassword(password) {
  const salt = randomBytes(16).toString('hex');
  const hash = await derive(password, salt, 64, options);
  return `scrypt$${salt}$${hash.toString('hex')}`;
}
export async function verifyPassword(password, encoded = dummy) {
  const [, salt, hash] = encoded.split('$');
  const derived = await derive(password, salt, 64, options);
  return timingSafeEqual(derived, Buffer.from(hash, 'hex'));
}
