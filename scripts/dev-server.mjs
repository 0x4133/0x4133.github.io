#!/usr/bin/env node
// Tiny zero-dependency static server with single-page-app fallback.
//
//   node scripts/dev-server.mjs            # serves the repo on :8080
//   node scripts/dev-server.mjs _site 4000 # serves a build
//
// When serving the repo root it also exposes a few localhost-only endpoints
// used by editor.html to write content back to disk:
//   GET  /__editor/ping            -> { ok: true }
//   POST /__editor/save            -> writes js/data/content.js (+ .bak)
//   POST /__editor/upload?name=…   -> saves an image into assets/uploads/
// These never run for a remote client and only touch those two locations.
import { createServer } from 'node:http';
import { readFile, writeFile, mkdir, stat, copyFile } from 'node:fs/promises';
import { extname, join, normalize, resolve, basename } from 'node:path';

const dir = resolve(process.argv[2] || '.');
const port = Number(process.argv[3] || process.env.PORT || 8080);
const CONTENT = join(dir, 'js', 'data', 'content.js');
const UPLOAD_DIR = join(dir, 'assets', 'uploads');
const MAX_BODY = 12 * 1024 * 1024;

const TYPES = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
  '.webp': 'image/webp', '.gif': 'image/gif', '.ico': 'image/x-icon', '.json': 'application/json', '.xml': 'application/xml', '.txt': 'text/plain',
};
const IMG_EXT = { 'image/png': '.png', 'image/jpeg': '.jpg', 'image/webp': '.webp', 'image/gif': '.gif', 'image/svg+xml': '.svg' };

const isLocal = (req) => {
  const a = req.socket.remoteAddress || '';
  return a === '127.0.0.1' || a === '::1' || a === '::ffff:127.0.0.1';
};

async function file(p) {
  try {
    const s = await stat(p);
    if (s.isDirectory()) return file(join(p, 'index.html'));
    return { body: await readFile(p), type: TYPES[extname(p)] || 'application/octet-stream' };
  } catch {
    return null;
  }
}

function readBody(req) {
  return new Promise((res, rej) => {
    const chunks = [];
    let size = 0;
    req.on('data', (c) => { size += c.length; if (size > MAX_BODY) { rej(new Error('body too large')); req.destroy(); } else chunks.push(c); });
    req.on('end', () => res(Buffer.concat(chunks)));
    req.on('error', rej);
  });
}
const json = (res, code, obj) => { res.writeHead(code, { 'Content-Type': 'application/json' }); res.end(JSON.stringify(obj)); };

async function handleEditor(req, res, url) {
  if (!isLocal(req)) { res.writeHead(403).end('editor endpoints are localhost-only'); return; }

  if (url.pathname === '/__editor/ping') { json(res, 200, { ok: true }); return; }

  if (url.pathname === '/__editor/save' && req.method === 'POST') {
    const text = (await readBody(req)).toString('utf8');
    if (!text.includes('export const projects')) { res.writeHead(400).end('does not look like content.js'); return; }
    try {
      // keep a single rolling backup before overwriting
      if (await stat(CONTENT).catch(() => null)) await copyFile(CONTENT, CONTENT + '.bak');
      await writeFile(CONTENT, text, 'utf8');
      json(res, 200, { ok: true, path: 'js/data/content.js', backup: 'js/data/content.js.bak' });
      console.log(`[editor] wrote ${CONTENT} (${text.length} bytes)`);
    } catch (e) {
      res.writeHead(500).end(String(e.message));
    }
    return;
  }

  if (url.pathname === '/__editor/upload' && req.method === 'POST') {
    const type = req.headers['content-type'] || '';
    const ext = IMG_EXT[type.split(';')[0].trim()];
    if (!ext) { res.writeHead(400).end('unsupported image type'); return; }
    const body = await readBody(req);
    const raw = basename(url.searchParams.get('name') || 'image').replace(/\.[^.]+$/, '');
    const slug = raw.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40) || 'image';
    const name = `${Date.now().toString(36)}-${slug}${ext}`;
    try {
      await mkdir(UPLOAD_DIR, { recursive: true });
      await writeFile(join(UPLOAD_DIR, name), body);
      json(res, 200, { url: `assets/uploads/${name}` });
      console.log(`[editor] saved asset assets/uploads/${name} (${body.length} bytes)`);
    } catch (e) {
      res.writeHead(500).end(String(e.message));
    }
    return;
  }

  res.writeHead(404).end('unknown editor endpoint');
}

createServer(async (req, res) => {
  const url = new URL(req.url, 'http://x');
  if (url.pathname.startsWith('/__editor/')) return handleEditor(req, res, url);

  const path = decodeURIComponent(url.pathname);
  const target = normalize(join(dir, path));
  if (!target.startsWith(dir)) { res.writeHead(403).end(); return; }
  // Exact file, then directory index, then SPA fallback for extension-less paths.
  let f = await file(target);
  let status = 200;
  if (!f && !extname(path)) f = await file(join(dir, 'index.html'));
  if (!f) { status = 404; f = { body: 'Not found', type: 'text/plain' }; }
  res.writeHead(status, { 'Content-Type': f.type, 'Cache-Control': 'no-store' });
  res.end(f.body);
}).listen(port, () => {
  console.log(`Serving ${dir} at http://localhost:${port}`);
  console.log(`Content editor: http://localhost:${port}/editor.html`);
});
