import { api } from '../data/api.js';
import { html, $, $$, fmtDate, debounce } from '../lib/dom.js';
import { setQuery } from '../router.js';
import {
  STATUSES, LABS, icon, link, projectCard, noteCard, ideaCard, productCard, statusBadge, techChips, cover,
  pageHead, empty, catName, techName, tagName, labName,
} from '../ui/components.js';
import {
  md, docSection, gallerySection, videoSection, linksCard, githubLabel, toc, mountLightbox, describe,
} from './shared.js';

// A topic filter matches the category, a technology (or its family, e.g.
// "esp32" matches "esp32-c6"), or a tag.
export function matchesTopic(item, slug) {
  if (item.category === slug) return true;
  if ((item.tags || []).includes(slug)) return true;
  return (item.technologies || []).some((t) => t === slug || t.startsWith(slug + '-'));
}

export function textMatch(item, q) {
  if (!q) return true;
  const hay = [
    item.title, item.name, item.code, item.summary, item.concept, catName(item.category), labName(item.lab),
    ...(item.technologies || []).map(techName), ...(item.tags || []).map(tagName), ...(item.technologies || []), ...(item.tags || []),
  ].filter(Boolean).join(' ').toLowerCase();
  return q.toLowerCase().split(/\s+/).filter(Boolean).every((w) => hay.includes(w));
}

const list = (s) => (s ? s.split(',').filter(Boolean) : []);

export async function projectsView({ query }) {
  const [projects, tax] = await Promise.all([api.list('project'), api.taxonomy()]);
  const state = { q: query.q || '', topics: list(query.topic), statuses: list(query.status), lab: query.lab || '' };
  const usedStatuses = STATUSES;

  const chip = (group, value, label, pressed, extra = '') =>
    html`<button type="button" class="fchip ${extra}" data-group="${group}" data-value="${value}" aria-pressed="${pressed ? 'true' : 'false'}">${label}</button>`;

  const filtered = () => projects.filter((p) =>
    textMatch(p, state.q) &&
    (!state.topics.length || state.topics.some((t) => matchesTopic(p, t))) &&
    (!state.statuses.length || state.statuses.includes(p.status)) &&
    (!state.lab || p.lab === state.lab));

  const results = () => {
    const r = filtered();
    return html`<div class="row-between" style="margin-bottom:16px"><span class="result-count">${r.length} of ${projects.length} projects</span>
      ${state.q || state.topics.length || state.statuses.length || state.lab ? html`<button class="btn btn-sm btn-ghost" type="button" data-clear>Clear filters</button>` : ''}</div>
      ${r.length ? html`<div class="grid grid-3">${r.map(projectCard)}</div>` : empty('No projects match these filters.', 'Try removing a filter or searching for a technology.')}`;
  };

  return {
    title: 'Projects & Ideas',
    description: 'Searchable library of applied cybersecurity research projects, experiments and prototypes.',
    html: html`${pageHead({
      eyebrow: 'Project library',
      title: 'Projects',
      lede: 'Every experiment, prototype and study in the lab — searchable by technology, category and stage of development.',
      crumbs: [{ label: 'projects' }],
    })}
<section class="section-tight"><div class="wrap">
  <div class="toolbar">
    <label class="search-box">${icon('search')}<span class="sr-only">Search projects</span><input type="search" id="pq" placeholder="Search by name, technology, tag or ID (e.g. ESP-001)…" value="${state.q}" autocomplete="off"></label>
    <div class="filter-row"><span class="label">Topic</span>${tax.categories.map((c) => chip('topic', c.slug, c.name, state.topics.includes(c.slug)))}</div>
    <div class="filter-row"><span class="label">Status</span>${usedStatuses.map((s) => chip('status', s, s, state.statuses.includes(s), `status-chip st-${s}`))}</div>
    <div class="filter-row"><span class="label">Lab</span>${LABS.map((l) => chip('lab', l.slug, l.name, state.lab === l.slug))}</div>
  </div>
  <div id="results">${results()}</div>
</div></section>`,
    mount(root) {
      const out = $('#results', root);
      const update = () => {
        out.innerHTML = String(results());
        setQuery({ q: state.q, topic: state.topics, status: state.statuses, lab: state.lab });
      };
      $('#pq', root).addEventListener('input', debounce((e) => { state.q = e.target.value.trim(); update(); }));
      root.addEventListener('click', (e) => {
        if (e.target.closest('[data-clear]')) {
          Object.assign(state, { q: '', topics: [], statuses: [], lab: '' });
          $('#pq', root).value = '';
          $$('.fchip', root).forEach((b) => b.setAttribute('aria-pressed', 'false'));
          return update();
        }
        const b = e.target.closest('.fchip');
        if (!b) return;
        const { group, value } = b.dataset;
        if (group === 'lab') {
          state.lab = state.lab === value ? '' : value;
          $$('.fchip[data-group="lab"]', root).forEach((x) => x.setAttribute('aria-pressed', String(x.dataset.value === state.lab)));
        } else {
          const arr = group === 'topic' ? state.topics : state.statuses;
          const i = arr.indexOf(value);
          if (i >= 0) arr.splice(i, 1); else arr.push(value);
          b.setAttribute('aria-pressed', String(i < 0));
        }
        update();
      });
    },
  };
}

const SECTIONS = [
  ['problem', 'Problem'],
  ['idea', 'Idea'],
  ['why', 'Why it exists'],
  ['architecture', 'Architecture'],
  ['how_it_works', 'How it works'],
  ['hardware', 'Hardware'],
  ['software', 'Software'],
];
const LATE_SECTIONS = [
  ['research_notes', 'Research notes'],
  ['limitations', 'Known limitations'],
  ['security_considerations', 'Security considerations'],
  ['future_plans', 'Future plans'],
];

export async function projectView({ params }) {
  const p = await api.get('project', params.slug);
  if (!p) return null;
  const all = await api.all();
  const notes = all.note.filter((n) => n.project_id === p.id);
  const ideas = all.idea.filter((i) => (i.related_project_ids || []).includes(p.id));
  const products = all.product.filter((x) => x.related_project_id === p.id);

  const media = p.media || [];
  const photos = media.filter((m) => m.kind === 'photo');
  const shots = media.filter((m) => m.kind === 'screenshot');
  const diagrams = media.filter((m) => m.kind === 'diagram');
  const videos = media.filter((m) => m.kind === 'video');
  const files = media.filter((m) => m.kind === 'file');
  const links = p.links || [];
  const updates = p.updates || [];

  let n = 0;
  const ix = () => String(++n).padStart(2, '0');
  const tocEntries = [
    ...SECTIONS.map(([k, t]) => ({ id: k, title: t, show: !!p[k] })),
    { id: 'photos', title: 'Photos', show: photos.length > 0 },
    { id: 'screenshots', title: 'Screenshots', show: shots.length > 0 },
    { id: 'diagrams', title: 'Diagrams', show: diagrams.length > 0 },
    { id: 'videos', title: 'Videos', show: videos.length > 0 },
    ...LATE_SECTIONS.map(([k, t]) => ({ id: k, title: t, show: !!p[k] })),
    { id: 'log', title: 'Development log', show: updates.length > 0 },
  ];

  const repoLinks = [
    p.github_repo && { url: p.github_repo, label: githubLabel(p.github_repo), kind: 'github' },
    p.latest_release && p.github_repo && { url: `${p.github_repo.replace(/\/$/, '')}/releases`, label: `Latest release · ${p.latest_release}`, kind: 'release' },
    p.docs_url && { url: p.docs_url, label: 'Documentation', kind: 'docs' },
  ].filter(Boolean);
  const downloads = [
    ...files.map((f) => ({ url: f.url, label: f.caption || 'Download file', kind: 'download' })),
    ...links.filter((l) => l.kind === 'download'),
  ];
  const otherLinks = links.filter((l) => l.kind !== 'download');

  return {
    title: `${p.title}${p.code ? ` (${p.code})` : ''}`,
    description: describe(p),
    image: p.hero_image,
    ogType: 'article',
    html: html`
<article>
<header class="detail-hero"><div class="wrap">
  <nav class="crumbs" aria-label="Breadcrumb"><a href="./">~</a><span>/</span><a href="projects">projects</a><span>/</span><span>${p.slug}</span></nav>
  <div class="meta-row">${statusBadge(p.status, { lg: true })}${p.code ? html`<span class="code-id">${p.code}</span>` : ''}<a class="chip chip-cat" href="${link(`/projects?topic=${p.category}`)}">${catName(p.category)}</a></div>
  <h1>${p.title}</h1>
  <p class="lede">${p.summary}</p>
  <div class="hero-media">${cover(p)}</div>
</div></header>

<div class="wrap detail-layout">
  <div>
    ${SECTIONS.map(([k, t]) => docSection(k, t, p[k], p[k] ? ix() : null))}
    ${gallerySection('photos', 'Photos', photos, photos.length ? ix() : null)}
    ${gallerySection('screenshots', 'Screenshots', shots, shots.length ? ix() : null)}
    ${gallerySection('diagrams', 'Diagrams', diagrams, diagrams.length ? ix() : null)}
    ${videoSection('videos', videos, videos.length ? ix() : null)}
    ${LATE_SECTIONS.map(([k, t]) => docSection(k, t, p[k], p[k] ? ix() : null))}
    ${updates.length ? html`<section class="doc-section" id="log"><h2><span class="ix">${ix()}</span>Development log</h2>
      <div class="logbook">${updates.map((u) => html`<div class="log-entry">
        <time datetime="${u.entry_date}">${fmtDate(u.entry_date, { year: 'numeric', month: 'long', day: 'numeric' })}</time>
        <h3>${u.title}</h3>${u.body ? html`<div class="prose">${md(u.body)}</div>` : ''}</div>`)}</div></section>` : ''}
  </div>

  <aside class="detail-aside"><div class="sticky">
    <div class="aside-card"><h4>Spec sheet</h4><dl class="kv">
      ${p.code ? html`<dt>ID</dt><dd class="mono">${p.code}</dd>` : ''}
      <dt>Status</dt><dd>${statusBadge(p.status)}</dd>
      ${p.lab ? html`<dt>Lab</dt><dd>${labName(p.lab)}</dd>` : ''}
      <dt>Category</dt><dd>${catName(p.category)}</dd>
      <dt>Published</dt><dd>${fmtDate(p.published_at)}</dd>
      ${updates[0] ? html`<dt>Last log</dt><dd>${fmtDate(updates[0].entry_date)}</dd>` : ''}
    </dl></div>
    ${p.technologies?.length ? html`<div class="aside-card"><h4>Technologies</h4>${techChips(p.technologies)}</div>` : ''}
    ${linksCard('Repository', repoLinks)}
    ${linksCard('Downloads', downloads)}
    ${linksCard('Links', otherLinks)}
    ${toc(tocEntries)}
  </div></aside>
</div>

${notes.length || ideas.length || products.length ? html`<section class="section-tight" style="border-top:1px solid var(--line);background:var(--bg-2)"><div class="wrap">
  <div class="eyebrow">Related</div>
  <div class="grid grid-3">${products.map(productCard)}${notes.map((x) => noteCard(x))}${ideas.map(ideaCard)}</div>
</div></section>` : ''}
</article>`,
    mount: (root) => mountLightbox(root),
  };
}

