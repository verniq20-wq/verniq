// Production web server for Verniq (used on Railway and any Node host).
// Serves the built app from dist/ with single-page-app fallback and cache
// headers that keep the installable app's updates working. No dependencies.
import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import { createServer } from 'node:http';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createGzip } from 'node:zlib';

const ROOT = fileURLToPath(new URL('./dist/', import.meta.url));
const PORT = Number(process.env.PORT) || 3000;

const TYPES = {
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

function cacheControl(path) {
  // Hashed build assets never change
  if (path.startsWith('/assets/')) return 'public, max-age=31536000, immutable';
  // The page, service worker and manifest must always be re-checked so updates arrive
  if (path === '/' || path.endsWith('.html') || path === '/sw.js' || path.startsWith('/workbox-') || path.endsWith('.webmanifest'))
    return 'no-cache';
  return 'public, max-age=86400';
}

async function resolve(urlPath) {
  const safe = normalize(decodeURIComponent(urlPath)).replace(/^(\.\.[/\\])+/, '');
  const file = join(ROOT, safe);
  if (!file.startsWith(ROOT)) return null;
  try {
    const s = await stat(file);
    if (s.isFile()) return { file, path: safe };
    if (s.isDirectory()) {
      const index = join(file, 'index.html');
      if ((await stat(index)).isFile()) return { file: index, path: join(safe, 'index.html') };
    }
  } catch {
    /* not found */
  }
  return null;
}

const server = createServer(async (req, res) => {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.writeHead(405, { Allow: 'GET, HEAD' }).end();
    return;
  }
  const url = new URL(req.url ?? '/', 'http://localhost');
  if (url.pathname === '/healthz') {
    res.writeHead(200, { 'Content-Type': 'text/plain' }).end('ok');
    return;
  }

  let hit = await resolve(url.pathname);
  // Unknown paths without a file extension are app routes → serve the app
  if (!hit && !extname(url.pathname)) hit = { file: join(ROOT, 'index.html'), path: '/index.html' };
  if (!hit) {
    res.writeHead(404, { 'Content-Type': 'text/plain' }).end('Not found');
    return;
  }

  const ext = extname(hit.file);
  const headers = {
    'Content-Type': TYPES[ext] ?? 'application/octet-stream',
    'Cache-Control': cacheControl(url.pathname === '/' ? '/' : hit.path.replaceAll('\\', '/')),
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'microphone=(self)',
  };
  if (url.pathname === '/sw.js') headers['Service-Worker-Allowed'] = '/';

  const gzip = COMPRESSIBLE.has(ext) && /\bgzip\b/.test(req.headers['accept-encoding'] ?? '');
  if (gzip) {
    headers['Content-Encoding'] = 'gzip';
    headers['Vary'] = 'Accept-Encoding';
  }
  res.writeHead(200, headers);
  if (req.method === 'HEAD') {
    res.end();
    return;
  }
  const stream = createReadStream(hit.file);
  (gzip ? stream.pipe(createGzip()) : stream).pipe(res);
});

server.listen(PORT, '0.0.0.0', () => console.log(`Verniq is running on port ${PORT}`));
