import { api } from '../data/api.js';
import { html, fmtDate, relTime } from '../lib/dom.js';
import {
  STATUSES, LIVE_STATUSES, link, itemPath, projectCard, statusBadge, pageHead, techName, empty,
} from '../ui/components.js';

export async function labView() {
  const [all, updates] = await Promise.all([api.all(), api.recentUpdates(10)]);
  const projects = all.project;
  const byId = new Map(projects.map((p) => [p.id, p]));
  const count = (s) => projects.filter((p) => p.status === s).length;
  const active = projects.filter((p) => LIVE_STATUSES.includes(p.status));
  const bench = projects.filter((p) => p.on_bench);
  const released = [...projects.filter((p) => p.status === 'RELEASED'), ...all.product.filter((p) => p.status === 'RELEASED')]
    .sort((a, b) => String(b.published_at).localeCompare(String(a.published_at))).slice(0, 5);

  // technology usage across in-progress work
  const usage = new Map();
  for (const p of active) for (const t of p.technologies || []) usage.set(t, (usage.get(t) || 0) + 1);
  for (const n of all.note.slice(0, 10)) for (const t of n.technologies || []) usage.set(t, (usage.get(t) || 0) + 0.5);
  const techs = [...usage.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10);
  const maxUse = techs[0]?.[1] || 1;

  const stat = (label, value, delta, cls = '') => html`<div class="stat ${cls}"><div class="label">${label}</div><div class="value">${String(value).padStart(2, '0')}</div>${delta ? html`<div class="delta">${delta}</div>` : ''}</div>`;
  const statusCounts = STATUSES.map((s) => [s, count(s)]).filter(([, n]) => n);

  return {
    title: 'Lab status',
    description: 'Live status of the lab: active projects, running experiments, recent updates and what is on the bench.',
    html: html`${pageHead({
      eyebrow: '/lab · live',
      title: 'Lab status',
      lede: 'A live readout of what the lab is working on, generated from the same data as the rest of the site.',
      crumbs: [{ label: 'lab' }],
    })}
<section class="section-tight"><div class="wrap">
  <div class="stats">
    ${stat('Active projects', active.length, `${projects.length} total`)}
    ${stat('Experiments running', count('EXPERIMENT'), null, 'amber')}
    ${stat('Prototypes', count('PROTOTYPE'), null, 'amber')}
    ${stat('In testing', count('TESTING'), null, 'cyan')}
    ${stat('Research notes', all.note.length, all.note[0] ? `latest ${relTime(all.note[0].published_at)}` : '', 'cyan')}
    ${stat('Released', count('RELEASED') + all.product.filter((p) => p.status === 'RELEASED').length, 'projects + products')}
  </div>

  <div class="panel" style="margin-top:20px">
    <h3><span>Pipeline</span><span>${projects.length} projects</span></h3>
    <div class="status-dist" role="img" aria-label="Projects by status">${statusCounts.map(([s, n]) => html`<span class="st-${s}" style="flex:${n}" title="${s}: ${n}"></span>`)}</div>
    <div class="legend">${statusCounts.map(([s, n]) => html`<span class="st-${s}"><i></i>${s} ${n}</span>`)}</div>
  </div>
</div></section>

<section class="section-tight"><div class="wrap">
  <div class="section-head"><div><div class="eyebrow">On the Bench</div><h2>Hardware and experiments in progress</h2></div></div>
  ${bench.length ? html`<div class="grid grid-3">${bench.map(projectCard)}</div>` : empty('The bench is clear.')}
</div></section>

<section class="section-tight"><div class="wrap two-col">
  <div class="panel"><h3><span>Recent updates</span><a href="projects" class="link-arrow">all →</a></h3>
    ${updates.length ? html`<ul class="feed">${updates.map((u) => {
      const p = byId.get(u.project_id);
      return html`<li><time datetime="${u.entry_date}">${fmtDate(u.entry_date, { month: 'short', day: 'numeric' })}</time><div>${p ? html`<a href="${itemPath('project', p)}#log">${u.title}</a><span class="sub">${p.code} · ${p.title}</span>` : u.title}</div></li>`;
    })}</ul>` : html`<p class="muted small">No updates yet.</p>`}
  </div>
  <div style="display:grid;gap:20px;align-content:start">
    <div class="panel"><h3><span>Technologies in use</span><a href="technology" class="link-arrow">index →</a></h3>
      <div class="bars">${techs.map(([t, n]) => html`<div class="bar-row"><a href="${link(`/technology/${t}`)}">${techName(t)}</a><div class="bar-track"><div class="bar-fill" style="width:${Math.round((n / maxUse) * 100)}%"></div></div><span class="n">${Math.ceil(n)}</span></div>`)}</div>
    </div>
    <div class="panel"><h3><span>Recently released</span></h3>
      ${released.length ? html`<ul class="feed">${released.map((r) => html`<li><time>${fmtDate(r.published_at, { month: 'short', year: 'numeric' })}</time><div><a href="${itemPath(r.code !== undefined ? 'project' : 'product', r)}">${r.title || r.name}</a><span class="sub">${r.version ? `v${r.version}` : r.code}</span></div></li>`)}</ul>` : html`<p class="muted small">Nothing released yet.</p>`}
    </div>
    <div class="panel"><h3><span>Research notes</span><a href="research" class="link-arrow">all →</a></h3>
      <ul class="feed">${all.note.slice(0, 4).map((n) => html`<li><time>${fmtDate(n.published_at, { month: 'short', day: 'numeric' })}</time><div><a href="${itemPath('note', n)}">${n.title}</a></div></li>`)}</ul>
    </div>
  </div>
</div></section>
<section class="section-tight"><div class="wrap"><p class="mono xs muted">Snapshot generated ${new Date().toISOString().replace('T', ' ').slice(0, 19)} UTC · ${statusBadge('ACTIVE')}</p></div></section>`,
  };
}
