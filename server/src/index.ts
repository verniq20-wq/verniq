/**
 * Verniq server: the JSON API under /api and the web app from dist/.
 */
import { getRequestListener } from '@hono/node-server';
import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';
import { extname, join, normalize, resolve } from 'node:path';
import { createGzip } from 'node:zlib';
import { createApp } from './app';
import { openDb } from './db';

const ROOT = resolve(process.env.STATIC_DIR ?? join(process.cwd(), 'dist'));
const PORT = Number(process.env.PORT) || 3000;

const TYPES: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.txt': 'text/plain; charset=utf-8',
};
const COMPRESSIBLE = new Set(['.html', '.js', '.mjs', '.css', '.json', '.webmanifest', '.svg', '.txt']);

function cacheControl(path: string) {
  if (path.startsWith('/assets/')) return 'public, max-age=31536000, immutable';
  if (path === '/' || path.endsWith('.html') || path === '/sw.js' || path.startsWith('/workbox-') || path.endsWith('.webmanifest')) return 'no-cache';
  return 'public, max-age=86400';
}

async function resolveFile(urlPath: string): Promise<{ file: string; path: string } | null> {
  let safe: string;
  try {
    safe = normalize(decodeURIComponent(urlPath)).replace(/^(\.\.[/\\])+/, '');
  } catch {
    return null;
  }
  const file = join(ROOT, safe);
  if (!file.startsWith(ROOT)) return null;
  try {
    const s = await stat(file);
    if (s.isFile()) return { file, path: safe };
    if (s.isDirectory()) {
      const index = join(file, 'index.html');
      if ((await stat(index)).isFile()) return { file: index, path: '/index.html' };
    }
  } catch {
    /* not found */
  }
  return null;
}

async function serveStatic(req: IncomingMessage, res: ServerResponse) {
  const url = new URL(req.url ?? '/', 'http://localhost');
  let hit = await resolveFile(url.pathname);
  if (!hit && !extname(url.pathname)) hit = { file: join(ROOT, 'index.html'), path: '/index.html' };
  if (!hit) {
    res.writeHead(404, { 'Content-Type': 'text/plain' }).end('Not found');
    return;
  }
  const ext = extname(hit.file);
  const headers: Record<string, string> = {
    'Content-Type': TYPES[ext] ?? 'application/octet-stream',
    'Cache-Control': cacheControl(url.pathname === '/' ? '/' : hit.path.replaceAll('\\', '/')),
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'microphone=(self)',
  };
  const gzip = COMPRESSIBLE.has(ext) && /\bgzip\b/.test(String(req.headers['accept-encoding'] ?? ''));
  if (gzip) {
    headers['Content-Encoding'] = 'gzip';
    headers['Vary'] = 'Accept-Encoding';
  }
  res.writeHead(200, headers);
  if (req.method === 'HEAD') return void res.end();
  const stream = createReadStream(hit.file);
  (gzip ? stream.pipe(createGzip()) : stream).pipe(res);
}

async function start() {
  const db = await openDb();
  const api = createApp(db);
  const apiListener = getRequestListener(api.fetch);
  const server = createServer((req, res) => {
    const path = (req.url ?? '/').split('?')[0];
    if (path === '/healthz') return void res.writeHead(200, { 'Content-Type': 'text/plain' }).end('ok');
    if (path.startsWith('/api/')) return void apiListener(req, res);
    if (req.method !== 'GET' && req.method !== 'HEAD') return void res.writeHead(405).end();
    void serveStatic(req, res);
  });
  server.listen(PORT, '0.0.0.0', () => console.log(`Verniq is running on port ${PORT} (database: ${db.kind})`));
  const shutdown = () => server.close(() => void db.close().finally(() => process.exit(0)));
  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}

void start();
