import { api } from '../data/api.js';
import { html, $, $$, fmtDate, debounce } from '../lib/dom.js';
import { STATUSES, icon, link, ideaCard, projectCard, statusBadge, techChips, pageHead, empty, catName, tagName } from '../ui/components.js';
import { md, describe } from './shared.js';
import { textMatch } from './projects.js';

export async function ideasView({ query }) {
  const ideas = await api.list('idea');
  const state = { q: query.q || '', status: query.status || '' };
  const statuses = STATUSES.filter((s) => ideas.some((i) => i.status === s));
  const grid = () => {
    const r = ideas.filter((i) => textMatch(i, state.q) && (!state.status || i.status === state.status));
    return r.length ? html`<div class="grid grid-3">${r.map(ideaCard)}</div>` : empty('No ideas match.');
  };
  return {
    title: 'Idea Vault',
    description: 'Early concepts from the lab, before they become projects.',
    html: html`${pageHead({
      eyebrow: 'Idea Vault',
      title: 'Ideas before they are projects',
      lede: 'Half-formed concepts, odd questions and things worth trying. Some become projects; most teach us something on the way to being discarded.',
      crumbs: [{ label: 'ideas' }],
    })}
<section class="section-tight"><div class="wrap">
  <div class="toolbar">
    <label class="search-box">${icon('search')}<span class="sr-only">Search ideas</span><input type="search" id="iq" placeholder="Search ideas…" value="${state.q}"></label>
    <div class="filter-row"><span class="label">Status</span>
      <button type="button" class="fchip" data-st="" aria-pressed="${String(!state.status)}">All</button>
      ${statuses.map((s) => html`<button type="button" class="fchip status-chip st-${s}" data-st="${s}" aria-pressed="${String(state.status === s)}">${s}</button>`)}
    </div>
  </div>
  <div id="igrid">${grid()}</div>
</div></section>`,
    mount(root) {
      const out = $('#igrid', root);
      $('#iq', root).addEventListener('input', debounce((e) => { state.q = e.target.value.trim(); out.innerHTML = String(grid()); }));
      root.addEventListener('click', (e) => {
        const b = e.target.closest('[data-st]');
        if (!b) return;
        state.status = b.dataset.st;
        $$('[data-st]', root).forEach((x) => x.setAttribute('aria-pressed', String(x.dataset.st === state.status)));
        out.innerHTML = String(grid());
      });
    },
  };
}

export async function ideaView({ params }) {
  const i = await api.get('idea', params.slug);
  if (!i) return null;
  const projects = await api.list('project');
  const related = projects.filter((p) => (i.related_project_ids || []).includes(p.id));
  return {
    title: i.title,
    description: describe(i),
    html: html`
<article>
<header class="detail-hero"><div class="wrap">
  <nav class="crumbs" aria-label="Breadcrumb"><a href="./">~</a><span>/</span><a href="ideas">ideas</a><span>/</span><span>${i.slug}</span></nav>
  <div class="meta-row">${statusBadge(i.status, { lg: true })}<span class="chip chip-cat">${catName(i.category)}</span><span class="code-id">${fmtDate(i.idea_date)}</span></div>
  <h1>${i.title}</h1>
  <p class="lede">${i.concept}</p>
</div></header>
<div class="wrap detail-layout">
  <div>${i.description ? html`<div class="prose">${md(i.description)}</div>` : html`<p class="muted">No further notes yet.</p>`}</div>
  <aside class="detail-aside">
    ${i.tags?.length ? html`<div class="aside-card"><h4>Tags</h4><div class="chips">${i.tags.map((t) => html`<span class="chip">${tagName(t)}</span>`)}</div></div>` : ''}
    ${i.technologies?.length ? html`<div class="aside-card"><h4>Technologies</h4>${techChips(i.technologies)}</div>` : ''}
    <div class="aside-card"><h4>Have a take?</h4><p class="small muted" style="margin:0 0 12px">Ideas improve with outside input.</p><a class="btn btn-sm" href="${link(`/contact?topic=research-collaboration&ref=${encodeURIComponent(i.title)}`)}">Discuss this idea</a></div>
  </aside>
</div>
${related.length ? html`<section class="section-tight" style="border-top:1px solid var(--line);background:var(--bg-2)"><div class="wrap">
  <div class="eyebrow">Related projects</div><div class="grid grid-3">${related.map(projectCard)}</div></div></section>` : ''}
</article>`,
  };
}
