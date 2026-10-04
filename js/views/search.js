import { api, TYPES } from '../data/api.js';
import { html, raw, esc, $, debounce } from '../lib/dom.js';
import { mdToText } from '../lib/markdown.js';
import { setQuery } from '../router.js';
import {
  icon, link, itemPath, projectCard, productCard, noteCard, ideaCard, statusBadge, pageHead, empty, techName, catName, tagName,
} from '../ui/components.js';
import { matchesTopic } from './projects.js';

const TYPE_LABEL = { project: 'Project', product: 'Product', note: 'Research note', idea: 'Idea', tech: 'Technology' };

function buildIndex(all, tax) {
  const docs = [];
  for (const type of Object.keys(TYPES)) {
    for (const it of all[type]) {
      const title = it.title || it.name;
      const body = [it.summary, it.concept, it.description, it.problem, it.idea, it.body, it.how_it_works, it.problem_solved].filter(Boolean).map((t) => mdToText(t, 600)).join(' ');
      const terms = [it.code, catName(it.category), ...(it.technologies || []).map(techName), ...(it.technologies || []), ...(it.tags || []).map(tagName)].filter(Boolean).join(' ');
      docs.push({ type, item: it, title, summary: it.summary || it.concept || '', title_l: title.toLowerCase(), terms_l: terms.toLowerCase(), body_l: body.toLowerCase() });
    }
  }
  for (const t of tax.technologies) {
    docs.push({ type: 'tech', item: t, title: t.name, summary: `Everything in the lab involving ${t.name}.`, title_l: t.name.toLowerCase() + ' ' + t.slug, terms_l: t.slug, body_l: '' });
  }
  return docs;
}

function search(index, q) {
  const words = q.toLowerCase().split(/\s+/).filter(Boolean);
  if (!words.length) return [];
  const hits = [];
  for (const d of index) {
    let score = 0;
    let ok = true;
    for (const w of words) {
      const s = (d.title_l.includes(w) ? 10 : 0) + (d.terms_l.includes(w) ? 5 : 0) + (d.body_l.includes(w) ? 1 : 0);
      if (!s) { ok = false; break; }
      score += s;
    }
    if (ok) hits.push({ ...d, score: score + (d.type === 'tech' ? 3 : 0) });
  }
  return hits.sort((a, b) => b.score - a.score).slice(0, 60);
}

function highlight(text, q) {
  const words = q.split(/\s+/).filter(Boolean).map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  const safe = esc(text);
  if (!words.length) return raw(safe);
  return raw(safe.replace(new RegExp(`(${words.join('|')})`, 'gi'), '<mark>$1</mark>'));
}

function hitView(h, q) {
  const href = h.type === 'tech' ? link(`/technology/${h.item.slug}`) : itemPath(h.type, h.item);
  return html`<a class="search-hit" href="${href}">
    <div><div class="type">${TYPE_LABEL[h.type]}</div>${h.item.status ? statusBadge(h.item.status) : ''}</div>
    <div><h3>${highlight(h.title, q)}${h.item.code ? html` <span class="code-id">${h.item.code}</span>` : ''}</h3><p>${highlight(h.summary, q)}</p></div>
  </a>`;
}

export async function searchView({ query }) {
  const [all, tax] = await Promise.all([api.all(), api.taxonomy()]);
  const index = buildIndex(all, tax);
  let q = query.q || '';
  const results = () => {
    if (!q.trim()) {
      return html`<p class="muted small">Try: ${['esp32', 'ble', 'splunk', 'sdr', 'triage', 'pcb'].map((t) => html`<a class="chip" style="margin:0 4px" href="${link(`/search?q=${t}`)}">${t}</a>`)}</p>`;
    }
    const hits = search(index, q.trim());
    return html`<p class="result-count" style="margin-bottom:14px">${hits.length} result${hits.length === 1 ? '' : 's'} for “${q}”</p>
      ${hits.length ? html`<div class="search-results">${hits.map((h) => hitView(h, q.trim()))}</div>` : empty('Nothing found.', 'Search covers projects, products, research notes, ideas, technologies and tags.')}`;
  };
  return {
    title: q ? `Search: ${q}` : 'Search',
    noindex: true,
    html: html`${pageHead({ eyebrow: 'Site search', title: 'Search the lab', crumbs: [{ label: 'search' }] })}
<section class="section-tight"><div class="wrap" style="max-width:900px">
  <div class="toolbar"><label class="search-box">${icon('search')}<span class="sr-only">Search</span><input type="search" id="sq" placeholder="Projects, products, notes, technologies, tags…" value="${q}"></label></div>
  <div id="sres">${results()}</div>
</div></section>`,
    mount(root) {
      const input = $('#sq', root);
      input.focus();
      input.setSelectionRange(q.length, q.length);
      input.addEventListener('input', debounce(() => {
        q = input.value;
        $('#sres', root).innerHTML = String(results());
        setQuery({ q: q.trim() });
      }, 120));
    },
  };
}

export async function technologyIndexView() {
  const [all, tax] = await Promise.all([api.all(), api.taxonomy()]);
  const items = [...all.project, ...all.product, ...all.note, ...all.idea];
  const count = (slug) => items.filter((i) => (i.technologies || []).includes(slug)).length;
  const techs = tax.technologies.map((t) => ({ ...t, n: count(t.slug) })).filter((t) => t.n > 0).sort((a, b) => b.n - a.n || a.name.localeCompare(b.name));
  return {
    title: 'Technologies',
    description: 'Every technology used across the lab’s projects, products and research.',
    html: html`${pageHead({ eyebrow: 'Index', title: 'Technologies', lede: 'Pick a technology to see every project, product, experiment and note that uses it.', crumbs: [{ label: 'technology' }] })}
<section class="section-tight"><div class="wrap"><div class="tech-index">${techs.map((t) => html`<a href="${link(`/technology/${t.slug}`)}">${t.name}<span class="n">${t.n}</span></a>`)}</div></div></section>`,
  };
}

export async function technologyView({ params }) {
  const slug = params.slug.toLowerCase();
  const [all, tax] = await Promise.all([api.all(), api.taxonomy()]);
  const tech = tax.technologies.find((t) => t.slug === slug);
  const cat = tax.categories.find((c) => c.slug === slug);
  const tag = tax.tags.find((t) => t.slug === slug);
  const name = tech?.name || cat?.name || tag?.name || slug;
  const projects = all.project.filter((p) => matchesTopic(p, slug));
  const products = all.product.filter((p) => matchesTopic(p, slug));
  const notes = all.note.filter((n) => matchesTopic(n, slug));
  const ideas = all.idea.filter((i) => matchesTopic(i, slug));
  const total = projects.length + products.length + notes.length + ideas.length;
  if (!total && !tech && !cat && !tag) return null;
  const byId = new Map(all.project.map((p) => [p.id, p]));
  const block = (title, list, card) => (list.length ? html`<section class="section-tight"><div class="wrap">
    <div class="section-head"><div><div class="eyebrow">${title}</div></div><span class="result-count">${list.length}</span></div>
    <div class="grid grid-3">${list.map(card)}</div></div></section>` : '');
  return {
    title: `${name} — technology`,
    description: `Projects, products, experiments and research notes involving ${name}.`,
    html: html`${pageHead({
      eyebrow: 'Technology',
      title: name,
      lede: tech?.description || cat?.description || `Everything in the lab involving ${name}: ${total} item${total === 1 ? '' : 's'}.`,
      crumbs: [{ label: 'technology', href: 'technology' }, { label: slug }],
    })}
${total ? '' : html`<section class="section-tight"><div class="wrap">${empty(`Nothing published uses ${name} yet.`)}</div></section>`}
${block('Projects & experiments', projects, projectCard)}
${block('Products', products, productCard)}
${block('Research notes', notes, (n) => noteCard(n, byId.get(n.project_id)))}
${block('Ideas', ideas, ideaCard)}`,
  };
}
