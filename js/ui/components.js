// Shared UI building blocks. Every function returns an html`` fragment.
import { html, raw, safeUrl, safeImg, fmtDate } from '../lib/dom.js';
import { coverArt } from '../lib/art.js';

export const STATUSES = ['IDEA', 'RESEARCH', 'EXPERIMENT', 'BUILDING', 'PROTOTYPE', 'TESTING', 'ACTIVE', 'RELEASED', 'ARCHIVED'];
export const LIVE_STATUSES = ['EXPERIMENT', 'BUILDING', 'PROTOTYPE', 'TESTING', 'ACTIVE'];
export const VISIBILITIES = ['public', 'unlisted', 'private'];
export const PRODUCT_KINDS = {
  hardware: 'Hardware', software: 'Software', 'open-source': 'Open-source tool',
  appliance: 'Security appliance', training: 'Training system', 'research-kit': 'Research kit',
};

export const LABS = [
  { slug: 'cyber-systems', name: 'Cyber Systems Lab', icon: 'network', text: 'SOC tooling, detection engineering, security automation and telemetry pipelines that analysts actually use.' },
  { slug: 'embedded-rf', name: 'Embedded & RF Lab', icon: 'radio', text: 'ESP32 firmware, custom PCBs, Wi-Fi, BLE and SDR — sensors that make the radio environment observable.' },
  { slug: 'adversarial-research', name: 'Adversarial Research Lab', icon: 'flask', text: 'Cyber-range targets, fingerprinting studies and attack simulation on systems the lab owns.' },
  { slug: 'ai-security', name: 'AI Security Lab', icon: 'brain', text: 'AI-assisted triage with verifiable output, and the security of AI systems themselves.' },
];

// ---------------------------------------------------------------------------
// taxonomy lookups (populated at boot)
// ---------------------------------------------------------------------------
const tax = { tech: new Map(), cat: new Map(), tag: new Map() };
export function setTaxonomy(t) {
  tax.tech = new Map(t.technologies.map((x) => [x.slug, x]));
  tax.cat = new Map(t.categories.map((x) => [x.slug, x]));
  tax.tag = new Map(t.tags.map((x) => [x.slug, x]));
}
export const techName = (s) => tax.tech.get(s)?.name || s;
export const catName = (s) => tax.cat.get(s)?.name || s;
export const tagName = (s) => tax.tag.get(s)?.name || s;
export const labName = (s) => LABS.find((l) => l.slug === s)?.name || s;

// base-relative href: link('/projects') -> 'projects', link('/') -> './'
export const link = (p) => (p === '/' || !p ? './' : String(p).replace(/^\//, ''));
export const itemPath = (type, item) => link(`/${{ project: 'project', product: 'product', idea: 'idea', note: 'research' }[type]}/${item.slug}`);

// ---------------------------------------------------------------------------
// icons (24px stroke icons)
// ---------------------------------------------------------------------------
const P = {
  search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
  github: '<path d="M9 19c-4.3 1.4-4.3-2.5-6-3m12 5v-3.5c0-1 .1-1.4-.5-2 2.8-.3 5.5-1.4 5.5-6a4.6 4.6 0 0 0-1.3-3.2 4.2 4.2 0 0 0-.1-3.2s-1.1-.3-3.5 1.3a12.3 12.3 0 0 0-6.2 0C6.5 2.8 5.4 3.1 5.4 3.1a4.2 4.2 0 0 0-.1 3.2A4.6 4.6 0 0 0 4 9.5c0 4.6 2.7 5.7 5.5 6-.6.6-.6 1.2-.5 2V21"/>',
  docs: '<path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><path d="M14 3v6h6M8 13h8M8 17h5"/>',
  download: '<path d="M12 3v12m0 0-4-4m4 4 4-4M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2"/>',
  link: '<path d="M10 14a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1"/><path d="M14 10a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1"/>',
  external: '<path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/>',
  menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
  close: '<path d="M6 6l12 12M18 6 6 18"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M2 12h2m16 0h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
  moon: '<path d="M20 14.5A8 8 0 0 1 9.5 4 8 8 0 1 0 20 14.5z"/>',
  arrow: '<path d="M5 12h14m-6-6 6 6-6 6"/>',
  upload: '<path d="M12 16V4m0 0-4 4m4-4 4 4M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2"/>',
  video: '<rect x="3" y="6" width="13" height="12" rx="2"/><path d="m16 10 5-3v10l-5-3"/>',
  paper: '<path d="M6 3h9l4 4v14H6z"/><path d="M9 12h7M9 16h7M9 8h3"/>',
  alert: '<path d="M12 3 2 20h20z"/><path d="M12 10v4m0 3v.01"/>',
  shield: '<path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6z"/><path d="m9 12 2 2 4-4"/>',
  lock: '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
  radio: '<path d="M4.9 19.1a10 10 0 0 1 0-14.2M19.1 4.9a10 10 0 0 1 0 14.2M7.8 16.2a6 6 0 0 1 0-8.4M16.2 7.8a6 6 0 0 1 0 8.4"/><circle cx="12" cy="12" r="2"/>',
  network: '<rect x="9" y="2" width="6" height="6" rx="1"/><rect x="2" y="16" width="6" height="6" rx="1"/><rect x="16" y="16" width="6" height="6" rx="1"/><path d="M12 8v4M5 16v-4h14v4"/>',
  flask: '<path d="M9 3h6M10 3v6L4 19a1.5 1.5 0 0 0 1.3 2h13.4a1.5 1.5 0 0 0 1.3-2L14 9V3"/><path d="M7 15h10"/>',
  brain: '<path d="M9 4a3 3 0 0 0-3 3v.5A3 3 0 0 0 4 10.5 3 3 0 0 0 5 15a3 3 0 0 0 3 4 2 2 0 0 0 4-1V5a2 2 0 0 0-3-1zM15 4a3 3 0 0 1 3 3v.5a3 3 0 0 1 2 3 3 3 0 0 1-1 4.5 3 3 0 0 1-3 4 2 2 0 0 1-4-1"/>',
  chip: '<rect x="6" y="6" width="12" height="12" rx="1.5"/><path d="M9 2v4m6-4v4M9 18v4m6-4v4M2 9h4m-4 6h4m12-6h4m-4 6h4"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  edit: '<path d="M4 20h4L19 9l-4-4L4 16z"/><path d="m13 7 4 4"/>',
  trash: '<path d="M4 7h16M10 11v6m4-6v6M6 7l1 13h10l1-13M9 7V4h6v3"/>',
  eye: '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
  box: '<path d="m12 3 9 5v8l-9 5-9-5V8z"/><path d="m3 8 9 5 9-5M12 13v8"/>',
  bulb: '<path d="M9 18h6m-5 3h4M12 3a6 6 0 0 0-4 10.5c.8.8 1 1.5 1 2.5h6c0-1 .2-1.7 1-2.5A6 6 0 0 0 12 3z"/>',
  logout: '<path d="M15 4h4v16h-4M10 8l-4 4 4 4M6 12h11"/>',
};
export const icon = (name, cls = '') =>
  raw(`<svg class="${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${P[name] || ''}</svg>`);

export const brandMark = () =>
  raw(`<svg class="brand-mark" viewBox="0 0 32 32" fill="none" aria-hidden="true">
<path d="M16 2.5 27.7 9.25v13.5L16 29.5 4.3 22.75V9.25z" stroke="currentColor" stroke-width="1.6"/>
<path d="M16 9.5 21.6 12.75v6.5L16 22.5l-5.6-3.25v-6.5z" fill="currentColor" opacity=".18" stroke="currentColor" stroke-width="1.2"/>
<circle cx="16" cy="16" r="2.2" fill="currentColor"/>
<path d="M16 2.5v7M27.7 22.75l-6.1-3.5M4.3 22.75l6.1-3.5" stroke="currentColor" stroke-width="1.2" opacity=".6"/></svg>`);

// ---------------------------------------------------------------------------
// badges
// ---------------------------------------------------------------------------
export const statusBadge = (s, { lg = false } = {}) => {
  const st = STATUSES.includes(s) ? s : 'IDEA';
  const live = LIVE_STATUSES.includes(st);
  return html`<span class="status st-${st}${live ? ' live' : ''}${lg ? ' status-lg' : ''}" title="Status: ${st}"><span class="led"></span>${st}</span>`;
};

export const techChips = (list = [], { max = 99, linked = true } = {}) => {
  const shown = list.slice(0, max);
  const more = list.length - shown.length;
  return html`<div class="chips">${shown.map((t) =>
    linked ? html`<a class="chip" href="${link(`/technology/${t}`)}">${techName(t)}</a>` : html`<span class="chip">${techName(t)}</span>`
  )}${more > 0 ? html`<span class="chip">+${more}</span>` : ''}</div>`;
};

// ---------------------------------------------------------------------------
// media
// ---------------------------------------------------------------------------
export function cover(item, opts = {}) {
  const src = safeImg(item.hero_image);
  if (src) return html`<img src="${src}" alt="" loading="lazy" decoding="async">`;
  return raw(coverArt(item, opts));
}

// ---------------------------------------------------------------------------
// cards
// ---------------------------------------------------------------------------
export function projectCard(p) {
  return html`<a class="card" href="${itemPath('project', p)}">
  <div class="card-media">${cover(p)}${statusBadge(p.status)}${p.code ? html`<span class="code-id">${p.code}</span>` : ''}</div>
  <div class="card-body">
    <div class="row-between"><span class="chip chip-cat">${catName(p.category)}</span></div>
    <h3 class="card-title">${p.title}</h3>
    <p class="card-text">${p.summary}</p>
    ${techChips(p.technologies, { max: 4, linked: false })}
    <div class="card-meta"><span>${fmtDate(p.published_at)}</span><span>${labName(p.lab) || ''}</span></div>
  </div>
</a>`;
}

export function productCard(p) {
  return html`<a class="card" href="${itemPath('product', p)}">
  <div class="card-media">${cover(p)}${statusBadge(p.status)}${p.version ? html`<span class="code-id">v${p.version}</span>` : ''}</div>
  <div class="card-body">
    <div class="row-between"><span class="kind-tag">${PRODUCT_KINDS[p.kind] || p.kind}</span></div>
    <h3 class="card-title">${p.name}</h3>
    <p class="card-text">${p.summary}</p>
    ${techChips(p.technologies, { max: 4, linked: false })}
  </div>
</a>`;
}

export function noteCard(n, project) {
  return html`<a class="card note-card" href="${itemPath('note', n)}">
  <div class="row-between"><span class="code-id">NOTE · ${fmtDate(n.published_at)}</span></div>
  <h3 class="card-title">${n.title}</h3>
  <p class="card-text">${n.summary}</p>
  ${techChips(n.technologies, { max: 4, linked: false })}
  ${project ? html`<div class="card-meta"><span>${project.code || ''} ${project.title}</span></div>` : ''}
</a>`;
}

export function ideaCard(i) {
  return html`<a class="card idea-card" href="${itemPath('idea', i)}">
  <div class="row-between">${statusBadge(i.status)}</div>
  <h3 class="card-title">${i.title}</h3>
  <p class="concept">${i.concept}</p>
  <div class="card-meta"><span>${catName(i.category)}</span><span>${fmtDate(i.idea_date)}</span></div>
</a>`;
}

export function benchItem(p) {
  const last = p._lastUpdate;
  return html`<a class="bench-item" href="${itemPath('project', p)}">
  <div class="thumb">${cover(p)}</div>
  <div><span class="code-id">${p.code}</span><h3>${p.title}</h3><p>${last ? `Last log: ${last.title}` : p.summary}</p></div>
  <div class="right">${statusBadge(p.status)}<span class="readout">${last ? html`<b>${fmtDate(last.entry_date, { month: 'short', day: 'numeric' })}</b>` : ''}</span></div>
</a>`;
}

// ---------------------------------------------------------------------------
// layout helpers
// ---------------------------------------------------------------------------
export const sectionHead = (eyebrow, title, text, more) => html`<div class="section-head">
  <div><div class="eyebrow">${eyebrow}</div><h2>${title}</h2>${text ? html`<p>${text}</p>` : ''}</div>
  ${more ? html`<a class="link-arrow" href="${more.href}">${more.label} ${icon('arrow', 'xs')}</a>` : ''}
</div>`;

export const pageHead = ({ eyebrow, title, lede, crumbs = [], extra = '' }) => html`<header class="page-head"><div class="wrap">
  ${crumbs.length ? html`<nav class="crumbs" aria-label="Breadcrumb"><a href="./">~</a>${crumbs.map((c) => html`<span>/</span>${c.href ? html`<a href="${c.href}">${c.label}</a>` : html`<span>${c.label}</span>`}`)}</nav>` : ''}
  ${eyebrow ? html`<div class="eyebrow">${eyebrow}</div>` : ''}
  <h1>${title}</h1>
  ${lede ? html`<p class="lede">${lede}</p>` : ''}
  ${extra}
</div></header>`;

export const empty = (msg, sub = '') => html`<div class="empty"><span class="mono">// no results</span>${msg}${sub ? html`<div class="small" style="margin-top:6px">${sub}</div>` : ''}</div>`;

export const loading = () => html`<div class="loading"><div class="scan"></div>LOADING</div>`;

export function linkIcon(kind) {
  return { github: 'github', docs: 'docs', release: 'box', download: 'download', video: 'video', paper: 'paper', website: 'external' }[kind] || 'link';
}

export const extLink = (url, label, kind = 'other') =>
  html`<li><a href="${safeUrl(url)}" target="_blank" rel="noopener noreferrer">${icon(linkIcon(kind))}<span>${label}</span></a></li>`;
