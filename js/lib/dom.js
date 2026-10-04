// Minimal, escape-by-default templating.
//
//   html`<p>${userText}</p>`      -> userText is HTML-escaped
//   html`<div>${raw(trusted)}</div>` -> trusted string inserted as-is
//   arrays are flattened, null/false/undefined render nothing.

class Raw {
  constructor(v) { this.v = v; }
  toString() { return this.v; }
}

export const raw = (v) => new Raw(String(v ?? ''));

const ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
export const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ESC[c]);

function fmt(v) {
  if (v == null || v === false || v === true) return '';
  if (v instanceof Raw) return v.v;
  if (Array.isArray(v)) return v.map(fmt).join('');
  return esc(v);
}

export function html(strings, ...vals) {
  let out = '';
  strings.forEach((s, i) => {
    out += s;
    if (i < vals.length) out += fmt(vals[i]);
  });
  return new Raw(out);
}

// Only allow http(s)/mailto (and relative) URLs in links.
export function safeUrl(u) {
  if (!u) return '#';
  const s = String(u).trim();
  if (/^(https?:|mailto:)/i.test(s)) return s;
  if (/^[a-z][a-z0-9+.-]*:/i.test(s)) return '#';
  return s;
}

// Images may additionally be data:image/* or blob:.
export function safeImg(u) {
  if (!u) return '';
  const s = String(u).trim();
  if (/^data:image\/(png|jpe?g|gif|webp|avif);base64,/i.test(s)) return s;
  if (/^(https?:|blob:)/i.test(s)) return s;
  if (/^[a-z][a-z0-9+.-]*:/i.test(s)) return '';
  return s;
}

export const $ = (sel, root = document) => root.querySelector(sel);
export const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

export function slugify(s) {
  return String(s ?? '')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

export function fmtDate(d, opts = { year: 'numeric', month: 'short', day: 'numeric' }) {
  if (!d) return '';
  const date = typeof d === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(d) ? new Date(d + 'T12:00:00') : new Date(d);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('en-US', opts);
}

export function relTime(d) {
  if (!d) return '';
  const date = typeof d === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(d) ? new Date(d + 'T12:00:00') : new Date(d);
  const days = Math.round((Date.now() - date.getTime()) / 86400000);
  if (days <= 0) return 'today';
  if (days === 1) return 'yesterday';
  if (days < 30) return `${days}d ago`;
  if (days < 365) return `${Math.round(days / 30)}mo ago`;
  return `${Math.round(days / 365)}y ago`;
}

export const today = () => new Date().toISOString().slice(0, 10);

export function toast(msg, kind = 'info') {
  let host = document.getElementById('toasts');
  if (!host) {
    host = document.createElement('div');
    host.id = 'toasts';
    host.setAttribute('role', 'status');
    host.setAttribute('aria-live', 'polite');
    document.body.appendChild(host);
  }
  const el = document.createElement('div');
  el.className = `toast toast-${kind}`;
  el.textContent = msg;
  host.appendChild(el);
  setTimeout(() => el.classList.add('out'), 3800);
  setTimeout(() => el.remove(), 4300);
}

export function debounce(fn, ms = 180) {
  let t;
  return (...a) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...a), ms);
  };
}
