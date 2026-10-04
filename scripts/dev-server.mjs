#!/usr/bin/env node
// Tiny zero-dependency static server with single-page-app fallback.
//
//   node scripts/dev-server.mjs            # serves the repo on :8080
//   node scripts/dev-server.mjs _site 4000 # serves a build
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize, resolve } from 'node:path';

const dir = resolve(process.argv[2] || '.');
const port = Number(process.argv[3] || process.env.PORT || 8080);
const TYPES = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
  '.webp': 'image/webp', '.gif': 'image/gif', '.ico': 'image/x-icon', '.json': 'application/json', '.xml': 'application/xml', '.txt': 'text/plain',
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

createServer(async (req, res) => {
  const path = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  const target = normalize(join(dir, path));
  if (!target.startsWith(dir)) { res.writeHead(403).end(); return; }
  // Exact file, then directory index, then SPA fallback for extension-less paths.
  let f = await file(target);
  let status = 200;
  if (!f && !extname(path)) f = await file(join(dir, 'index.html'));
  if (!f) { status = 404; f = { body: 'Not found', type: 'text/plain' }; }
  res.writeHead(status, { 'Content-Type': f.type, 'Cache-Control': 'no-store' });
  res.end(f.body);
}).listen(port, () => console.log(`Serving ${dir} at http://localhost:${port}`));
