import { randomUUID } from 'node:crypto';
import { Hono, type Context } from 'hono';
import { cors } from 'hono/cors';
import { z } from 'zod';
import {
  COLLECTIONS,
  REFERENCES,
  SCHEMAS,
  type Bootstrap,
  type Collection,
  type SyncOp,
  type SyncResult,
  type TeacherProfile,
} from '../../shared/records';
import { hashPassword, issueToken, rateLimited, verifyPassword, verifyToken } from './auth';
import type { Db } from './db';

type Env = { Variables: { teacherId: string } };

interface TeacherRow {
  id: string;
  email: string;
  name: string;
  password_hash: string;
  profile: Record<string, unknown> | string;
}

const profileOf = (row: TeacherRow): TeacherProfile => {
  const p = (typeof row.profile === 'string' ? JSON.parse(row.profile) : row.profile) as Partial<TeacherProfile>;
  return { ...p, id: row.id, email: row.email, name: row.name };
};

const signupSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().toLowerCase().email().max(160),
  password: z.string().min(8).max(200),
  school: z.string().trim().max(160).optional(),
  district: z.string().trim().max(120).optional(),
});
const loginSchema = z.object({ email: z.string().trim().toLowerCase().email(), password: z.string().min(1).max(200) });
const profileSchema = z.object({
  name: z.string().trim().min(2).max(80).optional(),
  school: z.string().trim().max(160).optional(),
  district: z.string().trim().max(120).optional(),
  activeClassId: z.string().max(80).optional(),
  onboarded: z.boolean().optional(),
});
const syncSchema = z.object({
  ops: z
    .array(
      z.union([
        z.object({ op: z.literal('put'), collection: z.enum(COLLECTIONS), id: z.string().min(1).max(80), data: z.unknown() }),
        z.object({ op: z.literal('delete'), collection: z.enum(COLLECTIONS), id: z.string().min(1).max(80), updatedAt: z.number() }),
      ]),
    )
    .max(500),
});

function clientIp(c: Context) {
  return c.req.header('x-forwarded-for')?.split(',')[0]?.trim() || c.req.header('x-real-ip') || 'local';
}

export function createApp(db: Db) {
  const app = new Hono<Env>();

  // Android app (capacitor/https://localhost) and the website both call the API. Auth is by bearer token, not cookies.
  app.use('/api/*', cors({ origin: (o) => o || '*', allowHeaders: ['Authorization', 'Content-Type'], allowMethods: ['GET', 'POST', 'PATCH', 'OPTIONS'], maxAge: 86400 }));

  app.get('/api/health', async (c) => {
    await db.query('SELECT 1');
    return c.json({ ok: true, db: db.kind, time: Date.now() });
  });

  // ─── Auth ──────────────────────────────────────────────────
  app.post('/api/auth/signup', async (c) => {
    if (rateLimited(`signup:${clientIp(c)}`, 20)) return c.json({ error: 'Too many attempts. Please wait a few minutes.' }, 429);
    const parsed = signupSchema.safeParse(await c.req.json().catch(() => null));
    if (!parsed.success) return c.json({ error: 'Please check your name, email and a password of at least 8 characters.' }, 400);
    const { name, email, password, school, district } = parsed.data;
    const existing = await db.query('SELECT id FROM teachers WHERE email = $1', [email]);
    if (existing.length) return c.json({ error: 'An account with this email already exists. Try signing in.' }, 409);
    const id = randomUUID();
    await db.query('INSERT INTO teachers (id, email, name, password_hash, profile, created_at) VALUES ($1,$2,$3,$4,$5,$6)', [
      id,
      email,
      name,
      await hashPassword(password),
      JSON.stringify({ school, district, onboarded: false }),
      Date.now(),
    ]);
    const { token, expiresAt } = issueToken(id);
    return c.json({ token, expiresAt, teacher: { id, email, name, school, district, onboarded: false } satisfies TeacherProfile }, 201);
  });

  app.post('/api/auth/login', async (c) => {
    const parsed = loginSchema.safeParse(await c.req.json().catch(() => null));
    if (!parsed.success) return c.json({ error: 'Enter your email and password.' }, 400);
    if (rateLimited(`login:${clientIp(c)}:${parsed.data.email}`, 10)) return c.json({ error: 'Too many attempts. Please wait 15 minutes.' }, 429);
    const [row] = await db.query<TeacherRow>('SELECT * FROM teachers WHERE email = $1', [parsed.data.email]);
    if (!row || !(await verifyPassword(parsed.data.password, row.password_hash))) return c.json({ error: 'Email or password is incorrect.' }, 401);
    const { token, expiresAt } = issueToken(row.id);
    return c.json({ token, expiresAt, teacher: profileOf(row) });
  });

  // ─── Authenticated routes ─────────────────────────────────
  app.use('/api/*', async (c, next) => {
    if (c.req.path.startsWith('/api/auth/') || c.req.path === '/api/health') return next();
    const teacherId = verifyToken(c.req.header('Authorization')?.replace(/^Bearer\s+/i, ''));
    if (!teacherId) return c.json({ error: 'Please sign in again.' }, 401);
    const [row] = await db.query('SELECT id FROM teachers WHERE id = $1', [teacherId]);
    if (!row) return c.json({ error: 'Account not found.' }, 401);
    c.set('teacherId', teacherId);
    return next();
  });

  app.get('/api/me', async (c) => {
    const [row] = await db.query<TeacherRow>('SELECT * FROM teachers WHERE id = $1', [c.get('teacherId')]);
    return c.json(profileOf(row));
  });

  app.patch('/api/me', async (c) => {
    const parsed = profileSchema.safeParse(await c.req.json().catch(() => null));
    if (!parsed.success) return c.json({ error: 'Invalid profile' }, 400);
    const [row] = await db.query<TeacherRow>('SELECT * FROM teachers WHERE id = $1', [c.get('teacherId')]);
    const current = profileOf(row);
    const { name, ...rest } = parsed.data;
    const profile = { school: current.school, district: current.district, activeClassId: current.activeClassId, onboarded: current.onboarded, ...rest };
    await db.query('UPDATE teachers SET name = $1, profile = $2 WHERE id = $3', [name ?? row.name, JSON.stringify(profile), row.id]);
    return c.json({ ...profile, id: row.id, email: row.email, name: name ?? row.name } satisfies TeacherProfile);
  });

  app.get('/api/bootstrap', async (c) => {
    const teacherId = c.get('teacherId');
    const [row] = await db.query<TeacherRow>('SELECT * FROM teachers WHERE id = $1', [teacherId]);
    const rows = await db.query<{ collection: Collection; data: unknown }>('SELECT collection, data FROM records WHERE teacher_id = $1 AND deleted = FALSE', [teacherId]);
    const records = Object.fromEntries(COLLECTIONS.map((k) => [k, [] as unknown[]])) as Record<Collection, unknown[]>;
    for (const r of rows) records[r.collection]?.push(typeof r.data === 'string' ? JSON.parse(r.data) : r.data);
    return c.json({ teacher: profileOf(row), records, serverTime: Date.now() } as unknown as Bootstrap);
  });

  /** Apply queued changes from a device, in order. Last write (by updatedAt) wins. */
  app.post('/api/sync', async (c) => {
    const teacherId = c.get('teacherId');
    const parsed = syncSchema.safeParse(await c.req.json().catch(() => null));
    if (!parsed.success) return c.json({ error: 'Invalid sync payload' }, 400);
    const results: SyncResult[] = [];
    for (const op of parsed.data.ops as SyncOp[]) {
      results.push(await applyOp(db, teacherId, op));
    }
    return c.json({ results, serverTime: Date.now() });
  });

  app.all('/api/*', (c) => c.json({ error: 'Not found' }, 404));

  app.onError((err, c) => {
    console.error('[api]', err);
    return c.json({ error: 'Something went wrong on the server.' }, 500);
  });

  return app;
}

async function applyOp(db: Db, teacherId: string, op: SyncOp): Promise<SyncResult> {
  const base = { id: op.id, collection: op.collection };
  const [existing] = await db.query<{ teacher_id: string; updated_at: string | number }>('SELECT teacher_id, updated_at FROM records WHERE collection = $1 AND id = $2', [
    op.collection,
    op.id,
  ]);
  if (existing && existing.teacher_id !== teacherId) return { ...base, ok: false, error: 'forbidden' };

  if (op.op === 'delete') {
    if (existing && Number(existing.updated_at) > op.updatedAt) return { ...base, ok: true };
    await db.query('UPDATE records SET deleted = TRUE, updated_at = $3 WHERE collection = $1 AND id = $2', [op.collection, op.id, op.updatedAt]);
    return { ...base, ok: true };
  }

  const parsed = SCHEMAS[op.collection].safeParse(op.data);
  if (!parsed.success) return { ...base, ok: false, error: `invalid: ${parsed.error.issues[0]?.path.join('.')} ${parsed.error.issues[0]?.message}` };
  const data = parsed.data as { id: string; updatedAt: number } & Record<string, unknown>;
  if (data.id !== op.id) return { ...base, ok: false, error: 'id mismatch' };

  for (const ref of REFERENCES[op.collection] ?? []) {
    const refId = data[ref.field];
    if (typeof refId !== 'string') continue;
    const [owner] = await db.query<{ teacher_id: string }>('SELECT teacher_id FROM records WHERE collection = $1 AND id = $2', [ref.collection, refId]);
    if (!owner || owner.teacher_id !== teacherId) return { ...base, ok: false, error: `unknown ${ref.field}` };
  }

  if (existing && Number(existing.updated_at) > data.updatedAt) return { ...base, ok: true }; // newer copy already stored
  await db.query(
    `INSERT INTO records (collection, id, teacher_id, data, updated_at, deleted) VALUES ($1,$2,$3,$4,$5,FALSE)
     ON CONFLICT (collection, id) DO UPDATE SET data = EXCLUDED.data, updated_at = EXCLUDED.updated_at, deleted = FALSE`,
    [op.collection, op.id, teacherId, JSON.stringify(data), data.updatedAt],
  );
  return { ...base, ok: true };
}
