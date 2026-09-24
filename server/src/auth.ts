/**
 * Password hashing (scrypt) and signed session tokens (HMAC-SHA256).
 * Uses only node:crypto — no third-party auth libraries.
 */
import { createHmac, randomBytes, scrypt as scryptCb, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';

const scrypt = promisify(scryptCb) as (pw: string, salt: Buffer, len: number) => Promise<Buffer>;

let SECRET = randomBytes(48).toString('base64url');

/**
 * Choose the token-signing secret: AUTH_SECRET if set, otherwise a random
 * secret created once and kept in the database, so sign-ins survive restarts
 * without any manual setup.
 */
export async function initAuthSecret(db: { query: (sql: string, params?: unknown[]) => Promise<Record<string, unknown>[]> }, persistent: boolean) {
  const env = process.env.AUTH_SECRET;
  if (env && env.length >= 32) {
    SECRET = env;
    return 'env';
  }
  if (!persistent) {
    console.warn('[auth] No AUTH_SECRET and an in-memory database: sign-ins reset on restart.');
    return 'temporary';
  }
  await db.query('CREATE TABLE IF NOT EXISTS app_settings (key TEXT PRIMARY KEY, value TEXT NOT NULL)');
  await db.query('INSERT INTO app_settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO NOTHING', ['auth_secret', randomBytes(48).toString('base64url')]);
  const rows = await db.query('SELECT value FROM app_settings WHERE key = $1', ['auth_secret']);
  SECRET = String(rows[0].value);
  return 'database';
}

const TOKEN_TTL_MS = 1000 * 60 * 60 * 24 * 60; // 60 days — teachers work offline for long stretches

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const key = await scrypt(password, salt, 64);
  return `scrypt$${salt.toString('base64')}$${key.toString('base64')}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [algo, saltB64, keyB64] = stored.split('$');
  if (algo !== 'scrypt' || !saltB64 || !keyB64) return false;
  const expected = Buffer.from(keyB64, 'base64');
  const actual = await scrypt(password, Buffer.from(saltB64, 'base64'), expected.length);
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

function sign(payload: string): string {
  return createHmac('sha256', SECRET).update(payload).digest('base64url');
}

export function issueToken(teacherId: string): { token: string; expiresAt: number } {
  const expiresAt = Date.now() + TOKEN_TTL_MS;
  const payload = Buffer.from(JSON.stringify({ sub: teacherId, exp: expiresAt })).toString('base64url');
  return { token: `${payload}.${sign(payload)}`, expiresAt };
}

export function verifyToken(token: string | undefined): string | null {
  if (!token) return null;
  const [payload, sig] = token.split('.');
  if (!payload || !sig) return null;
  const expected = sign(payload);
  if (expected.length !== sig.length || !timingSafeEqual(Buffer.from(expected), Buffer.from(sig))) return null;
  try {
    const { sub, exp } = JSON.parse(Buffer.from(payload, 'base64url').toString());
    if (typeof sub !== 'string' || typeof exp !== 'number' || exp < Date.now()) return null;
    return sub;
  } catch {
    return null;
  }
}

/** Tiny in-memory limiter for login/signup attempts. */
const attempts = new Map<string, { count: number; resetAt: number }>();
export function rateLimited(key: string, max = 10, windowMs = 15 * 60 * 1000): boolean {
  const now = Date.now();
  const entry = attempts.get(key);
  if (!entry || entry.resetAt < now) {
    attempts.set(key, { count: 1, resetAt: now + windowMs });
    return false;
  }
  entry.count++;
  return entry.count > max;
}
