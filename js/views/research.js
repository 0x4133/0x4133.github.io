import { api } from '../data/api.js';
import { html, $, fmtDate, debounce } from '../lib/dom.js';
import { icon, noteCard, projectCard, techChips, pageHead, empty, tagName, cover } from '../ui/components.js';
import { md, describe } from './shared.js';
import { textMatch } from './projects.js';

export async function researchView({ query }) {
  const [notes, projects] = await Promise.all([api.list('note'), api.list('project')]);
  const byId = new Map(projects.map((p) => [p.id, p]));
  let q = query.q || '';
  const grid = () => {
    const r = notes.filter((n) => textMatch(n, q));
    return r.length ? html`<div class="grid grid-3">${r.map((n) => noteCard(n, byId.get(n.project_id)))}</div>` : empty('No research notes match.');
  };
  return {
    title: 'Research notes',
    description: 'Short research notes: measurements, observations and experiments from the lab bench.',
    html: html`${pageHead({
      eyebrow: 'Lab notebook',
      title: 'Research notes',
      lede: 'Short findings published independently of full projects — measurements, observations, negative results and things we did not expect.',
      crumbs: [{ label: 'research' }],
    })}
<section class="section-tight"><div class="wrap">
  <div class="toolbar"><label class="search-box">${icon('search')}<span class="sr-only">Search notes</span><input type="search" id="nq" placeholder="Search notes…" value="${q}"></label></div>
  <div id="ngrid">${grid()}</div>
</div></section>`,
    mount(root) {
      $('#nq', root).addEventListener('input', debounce((e) => { q = e.target.value.trim(); $('#ngrid', root).innerHTML = String(grid()); }));
    },
  };
}

export async function noteView({ params }) {
  const n = await api.get('note', params.slug);
  if (!n) return null;
  const projects = await api.list('project');
  const project = projects.find((p) => p.id === n.project_id);
  return {
    title: n.title,
    description: describe(n),
    image: n.hero_image,
    ogType: 'article',
    html: html`
<article>
<header class="detail-hero"><div class="wrap">
  <nav class="crumbs" aria-label="Breadcrumb"><a href="./">~</a><span>/</span><a href="research">research</a><span>/</span><span>${n.slug}</span></nav>
  <div class="meta-row"><span class="code-id">RESEARCH NOTE · ${fmtDate(n.published_at, { year: 'numeric', month: 'long', day: 'numeric' })}</span></div>
  <h1>${n.title}</h1>
  <p class="lede">${n.summary}</p>
  ${n.hero_image ? html`<div class="hero-media">${cover(n)}</div>` : ''}
</div></header>
<div class="wrap detail-layout">
  <div class="prose">${md(n.body)}</div>
  <aside class="detail-aside"><div class="sticky">
    ${n.technologies?.length ? html`<div class="aside-card"><h4>Technologies</h4>${techChips(n.technologies)}</div>` : ''}
    ${n.tags?.length ? html`<div class="aside-card"><h4>Tags</h4><div class="chips">${n.tags.map((t) => html`<span class="chip">${tagName(t)}</span>`)}</div></div>` : ''}
    ${project ? html`<div class="aside-card"><h4>Part of</h4>${projectCard(project)}</div>` : ''}
  </div></aside>
</div>
</article>`,
  };
}
