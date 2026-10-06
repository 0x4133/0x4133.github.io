// Persistence for the editor.
//
// Preferred path: POST the serialized file to the local dev server, which
// writes js/data/content.js in place (and keeps a .bak). This only works when
// the editor is opened through scripts/dev-server.mjs on localhost.
//
// Fallback: download content.js so you can drop it into js/data/ yourself.
import { serializeModule } from './serialize.js';

async function serverAvailable() {
  try {
    const r = await fetch('__editor/ping', { method: 'GET' });
    return r.ok;
  } catch {
    return false;
  }
}

export async function saveContent(data) {
  const text = serializeModule(data);
  if (await serverAvailable()) {
    const r = await fetch('__editor/save', {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: text,
    });
    if (!r.ok) throw new Error(`Server refused the save (HTTP ${r.status}): ${await r.text()}`);
    const info = await r.json().catch(() => ({}));
    return { mode: 'server', path: info.path || 'js/data/content.js', backup: info.backup };
  }
  // download fallback
  const blob = new Blob([text], { type: 'text/javascript' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'content.js';
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  return { mode: 'download' };
}

export async function uploadImage(file) {
  if (!(await serverAvailable())) {
    throw new Error('Image upload needs the local dev server. Run "node scripts/dev-server.mjs" and open editor.html through it, or type an image path instead.');
  }
  if (file.size > 8 * 1024 * 1024) throw new Error('Image is larger than 8 MB.');
  const r = await fetch(`__editor/upload?name=${encodeURIComponent(file.name)}`, {
    method: 'POST',
    headers: { 'Content-Type': file.type || 'application/octet-stream' },
    body: file,
  });
  if (!r.ok) throw new Error(`Upload failed (HTTP ${r.status}): ${await r.text()}`);
  return r.json(); // { url: 'assets/uploads/...' }
}

export { serializeModule };
