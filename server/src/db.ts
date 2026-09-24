/**
 * Database access. Uses Postgres when DATABASE_URL is set (production on
 * Railway). Without it, falls back to PGlite — embedded Postgres — stored in
 * PGLITE_DIR (or memory), so the app runs locally with zero setup.
 */
export interface Db {
  query<T = Record<string, unknown>>(sql: string, params?: unknown[]): Promise<T[]>;
  close(): Promise<void>;
  kind: 'postgres' | 'pglite';
}

const SCHEMA = `
CREATE TABLE IF NOT EXISTS teachers (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  profile JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at BIGINT NOT NULL
);

-- One table for every synced collection. Each row is a JSON document owned by a teacher.
CREATE TABLE IF NOT EXISTS records (
  collection TEXT NOT NULL,
  id TEXT NOT NULL,
  teacher_id TEXT NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
  data JSONB NOT NULL,
  updated_at BIGINT NOT NULL,
  deleted BOOLEAN NOT NULL DEFAULT FALSE,
  PRIMARY KEY (collection, id)
);
CREATE INDEX IF NOT EXISTS records_teacher_idx ON records (teacher_id, collection);
`;

export async function openDb(): Promise<Db> {
  const url = process.env.DATABASE_URL;
  let db: Db;
  if (url) {
    const pg = await import('pg');
    const Pool = pg.default?.Pool ?? pg.Pool;
    const pool = new Pool({
      connectionString: url,
      max: 10,
      ssl: /sslmode=require|\.railway\.app|proxy\.rlwy\.net/.test(url) && !/railway\.internal/.test(url) ? { rejectUnauthorized: false } : undefined,
    });
    db = {
      kind: 'postgres',
      async query(sql, params) {
        const r = await pool.query(sql, params as unknown[]);
        return r.rows;
      },
      close: () => pool.end(),
    };
  } else {
    const { PGlite } = await import('@electric-sql/pglite');
    const pg = new PGlite(process.env.PGLITE_DIR || undefined);
    await pg.waitReady;
    db = {
      kind: 'pglite',
      async query(sql, params) {
        const r = await pg.query(sql, params as unknown[]);
        return r.rows as never[];
      },
      close: () => pg.close(),
    };
  }
  for (const stmt of SCHEMA.split(';').map((s) => s.trim()).filter(Boolean)) {
    await db.query(stmt);
  }
  return db;
}
