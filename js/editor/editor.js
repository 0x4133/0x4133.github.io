// Hexworks content editor.
//
// Loads the current js/data/content.js, edits projects / ideas / products /
// notes in forms, and writes the file back (via the dev server, or a download).
// Categories and the technology name map are preserved unchanged.
import * as content from '../data/content.js';
import { html, raw, $, $$, slugify, toast, fmtDate, today } from '../lib/dom.js';
import { STATUSES, LABS, PRODUCT_KINDS, icon, statusBadge } from '../ui/components.js';
import { markdownEditor, tagInput, imageField, mountWidgets } from './widgets.js';
import { saveContent } from './save.js';

// ---------------------------------------------------------------------------
// working copy (deep clone so edits are reversible until saved)
// ---------------------------------------------------------------------------
const clone = (o) => JSON.parse(JSON.stringify(o));
const data = {
  categories: clone(content.categories),
  technologies: clone(content.technologies),
  projects: clone(content.projects),
  products: clone(content.products),
  ideas: clone(content.ideas),
  notes: clone(content.notes),
};
let dirty = false;
const markDirty = () => { dirty = true; updateSaveState(); };
window.addEventListener('beforeunload', (e) => { if (dirty) { e.preventDefault(); e.returnValue = ''; } });

const TYPES = {
  project: { list: data.projects, label: 'Project', plural: 'Projects', titleKey: 'title' },
  idea: { list: data.ideas, label: 'Idea', plural: 'Ideas', titleKey: 'title' },
  product: { list: data.products, label: 'Product', plural: 'Products', titleKey: 'name' },
  note: { list: data.notes, label: 'Research note', plural: 'Notes', titleKey: 'title' },
};
const ORDER = ['project', 'idea', 'product', 'note'];
const titleOf = (t, it) => it[TYPES[t].titleKey] || '(untitled)';

const catOptions = [['', '—'], ...data.categories.map((c) => [c.slug, c.name])];
const labOptions = [['', '—'], ...LABS.map((l) => [l.slug, l.name])];
const projectOptions = () => data.projects.map((p) => p.slug);
const techSuggest = () => [...new Set([...Object.keys(data.technologies), ...allSlugs('technologies')])].sort();
const tagSuggest = () => [...allSlugs('tags')].sort();
function allSlugs(field) {
  const s = new Set();
  for (const t of ORDER) for (const it of TYPES[t].list) for (const x of it[field] || []) s.add(x);
  return s;
}

// ---------------------------------------------------------------------------
// schemas
// ---------------------------------------------------------------------------
const mdFields = (pairs) => pairs.map((p) => { const [name, label] = p.split(':'); return { name, label, type: 'markdown', full: true }; });

function schema(type) {
  const tech = { name: 'technologies', label: 'Technologies', type: 'tags', full: true };
  const tags = { name: 'tags', label: 'Tags', type: 'tags', full: true };
  const status = { name: 'status', label: 'Status', type: 'select', options: STATUSES.map((s) => [s, s]) };
  if (type === 'project') return [
    { group: 'Basics', fields: [
      { name: 'title', label: 'Title', type: 'text', required: true, full: true },
      { name: 'slug', label: 'Slug', type: 'slug', required: true, hint: 'URL: /project/<slug>' },
      { name: 'code', label: 'Project ID', type: 'text', hint: 'Blank = auto-assigned from the category prefix.' },
      { name: 'summary', label: 'Short description', type: 'textarea', required: true, full: true, rows: 3 },
      status,
      { name: 'category', label: 'Category', type: 'select', options: catOptions },
      { name: 'lab', label: 'Lab', type: 'select', options: labOptions },
      { name: 'published_at', label: 'Date', type: 'date' },
      { name: 'featured', label: 'Feature on home page', type: 'bool' },
      { name: 'on_bench', label: 'Currently on the bench', type: 'bool' },
    ] },
    { group: 'Image & links', fields: [
      { name: 'hero_image', label: 'Hero image', type: 'image', full: true },
      { name: 'github_repo', label: 'GitHub repository', type: 'text', full: true, placeholder: 'https://github.com/…' },
      { name: 'latest_release', label: 'Latest release', type: 'text' },
      { name: 'docs_url', label: 'Docs URL', type: 'text' },
      tech, tags,
    ] },
    { group: 'Write-up', fields: mdFields(['problem:Problem', 'idea:Idea', 'why:Why it exists', 'architecture:Architecture', 'how_it_works:How it works', 'hardware:Hardware', 'software:Software']) },
    { group: 'Notes & caveats', fields: mdFields(['research_notes:Research notes', 'limitations:Known limitations', 'security_considerations:Security considerations', 'future_plans:Future plans']) },
  ];
  if (type === 'idea') return [
    { group: 'Idea', fields: [
      { name: 'title', label: 'Title', type: 'text', required: true, full: true },
      { name: 'slug', label: 'Slug', type: 'slug', required: true, hint: 'URL: /idea/<slug>' },
      { name: 'concept', label: 'One-sentence concept', type: 'text', required: true, full: true },
      status,
      { name: 'category', label: 'Category', type: 'select', options: catOptions },
      { name: 'idea_date', label: 'Date', type: 'date' },
      { name: 'description', label: 'Description', type: 'markdown', full: true },
      tags, tech,
      { name: 'related_projects', label: 'Related projects', type: 'multi', options: projectOptions(), full: true },
    ] },
  ];
  if (type === 'product') return [
    { group: 'Basics', fields: [
      { name: 'name', label: 'Name', type: 'text', required: true, full: true },
      { name: 'slug', label: 'Slug', type: 'slug', required: true, hint: 'URL: /product/<slug>' },
      { name: 'kind', label: 'Type', type: 'select', options: Object.entries(PRODUCT_KINDS) },
      { name: 'summary', label: 'Short description', type: 'textarea', required: true, full: true, rows: 3 },
      status,
      { name: 'version', label: 'Version', type: 'text' },
      { name: 'related_project', label: 'Origin project', type: 'select', options: [['', '—'], ...projectOptions().map((s) => [s, s])] },
      { name: 'cta_label', label: 'Button label', type: 'text' },
    ] },
    { group: 'Content', fields: [
      { name: 'hero_image', label: 'Hero image', type: 'image', full: true },
      { name: 'description', label: 'Description', type: 'markdown', full: true },
      { name: 'problem_solved', label: 'Problem solved', type: 'markdown', full: true, rows: 4 },
      { name: 'features', label: 'Features (one per line)', type: 'lines', full: true },
      { name: 'specs', label: 'Specs (Label: Value per line)', type: 'specs', full: true },
      { name: 'changelog', label: 'Changelog', type: 'markdown', full: true },
      tech, tags,
    ] },
    { group: 'Links', fields: [
      { name: 'docs_url', label: 'Docs URL', type: 'text' },
      { name: 'source_url', label: 'Source URL', type: 'text' },
      { name: 'download_url', label: 'Download URL', type: 'text' },
      { name: 'purchase_url', label: 'Purchase URL', type: 'text', hint: 'Blank sends buyers to the contact form.' },
    ] },
  ];
  return [
    { group: 'Note', fields: [
      { name: 'title', label: 'Title', type: 'text', required: true, full: true },
      { name: 'slug', label: 'Slug', type: 'slug', required: true, hint: 'URL: /research/<slug>' },
      { name: 'summary', label: 'Summary', type: 'textarea', required: true, full: true, rows: 2 },
      { name: 'published_at', label: 'Date', type: 'date' },
      { name: 'project', label: 'Related project', type: 'select', options: [['', '—'], ...projectOptions().map((s) => [s, s])] },
      { name: 'body', label: 'Body (Markdown)', type: 'markdown', full: true, rows: 16 },
      { name: 'hero_image', label: 'Header image', type: 'image', full: true },
      tech, tags,
    ] },
  ];
}

// ---------------------------------------------------------------------------
// field rendering + collection
// ---------------------------------------------------------------------------
function fieldHtml(f, item) {
  const v = item[f.name] ?? (f.type === 'bool' ? false : f.type === 'date' ? today() : '');
  const id = `f-${f.name}`;
  const wrap = (c) => html`<div class="field ${f.full ? 'full' : ''}">${f.type === 'bool' ? '' : html`<label for="${id}">${f.label}${f.required ? ' *' : ''}</label>`}${c}${f.hint ? html`<span class="hint">${f.hint}</span>` : ''}</div>`;
  switch (f.type) {
    case 'textarea': return wrap(html`<textarea id="${id}" name="${f.name}" rows="${f.rows || 4}" ${f.required ? 'required' : ''}>${v}</textarea>`);
    case 'markdown': return wrap(markdownEditor(f.name, v, { rows: f.rows || 7 }));
    case 'select': return wrap(html`<select id="${id}" name="${f.name}">${f.options.map(([val, lab]) => html`<option value="${val}" ${String(v ?? '') === String(val) ? 'selected' : ''}>${lab}</option>`)}</select>`);
    case 'bool': return wrap(html`<label class="check"><span class="toggle"><input type="checkbox" id="${id}" name="${f.name}" ${v ? 'checked' : ''}><span></span></span>${f.label}</label>`);
    case 'tags': return wrap(tagInput(f.name, v || [], f.name === 'tags' ? tagSuggest() : techSuggest(), f.label.toLowerCase()));
    case 'image': return wrap(imageField(f.name, v));
    case 'lines': return wrap(html`<textarea id="${id}" name="${f.name}" rows="5">${(v || []).join('\n')}</textarea>`);
    case 'specs': return wrap(html`<textarea id="${id}" name="${f.name}" rows="5" class="mono">${(v || []).map((s) => `${s.label}: ${s.value}`).join('\n')}</textarea>`);
    case 'multi': return wrap(f.options.length ? html`<div class="option-grid">${f.options.map((o) => html`<label><input type="checkbox" name="${f.name}" value="${o}" ${(v || []).includes(o) ? 'checked' : ''}>${o}</label>`)}</div>` : html`<span class="muted small">No projects yet.</span>`);
    case 'slug': return wrap(html`<input id="${id}" name="slug" type="text" value="${v}" required pattern="[a-z0-9]+(-[a-z0-9]+)*" class="mono">`);
    default: return wrap(html`<input id="${id}" name="${f.name}" type="text" value="${v}" ${f.required ? 'required' : ''} placeholder="${f.placeholder || ''}">`);
  }
}

function collect(form, groups) {
  const out = {};
  const fd = new FormData(form);
  for (const g of groups) for (const f of g.fields) {
    const sv = typeof fd.get(f.name) === 'string' ? fd.get(f.name).trim() : '';
    switch (f.type) {
      case 'bool': out[f.name] = fd.get(f.name) === 'on'; break;
      case 'tags': out[f.name] = JSON.parse(sv || '[]'); break;
      case 'multi': out[f.name] = fd.getAll(f.name); break;
      case 'lines': out[f.name] = sv.split('\n').map((s) => s.trim()).filter(Boolean); break;
      case 'specs': out[f.name] = sv.split('\n').map((l) => l.trim()).filter(Boolean).map((l) => { const i = l.indexOf(':'); return i > 0 ? { label: l.slice(0, i).trim(), value: l.slice(i + 1).trim() } : { label: l, value: '' }; }); break;
      case 'slug': out.slug = slugify(sv); break;
      default: out[f.name] = sv;
    }
  }
  return out;
}

// Rebuild an item in canonical key order (keeps content.js tidy + preserves
// sub-records that have no form, e.g. media / links / updates).
const KEY_ORDER = {
  project: ['slug', 'title', 'code', 'status', 'category', 'lab', 'published_at', 'featured', 'on_bench', 'summary', 'technologies', 'tags', 'hero_image', 'github_repo', 'latest_release', 'docs_url', 'problem', 'idea', 'why', 'architecture', 'how_it_works', 'hardware', 'software', 'research_notes', 'limitations', 'security_considerations', 'future_plans', 'media', 'links', 'updates'],
  idea: ['slug', 'title', 'concept', 'description', 'category', 'tags', 'technologies', 'idea_date', 'status', 'related_projects'],
  product: ['slug', 'name', 'kind', 'summary', 'description', 'problem_solved', 'features', 'specs', 'status', 'version', 'changelog', 'docs_url', 'source_url', 'download_url', 'purchase_url', 'cta_label', 'hero_image', 'technologies', 'tags', 'related_project', 'media', 'links'],
  note: ['slug', 'title', 'summary', 'body', 'hero_image', 'published_at', 'technologies', 'tags', 'project', 'links'],
};

function orderKeys(type, obj) {
  const out = {};
  for (const k of KEY_ORDER[type]) if (k in obj) out[k] = obj[k];
  for (const k of Object.keys(obj)) if (!(k in out)) out[k] = obj[k];
  return out;
}

// ---------------------------------------------------------------------------
// rendering
// ---------------------------------------------------------------------------
const app = $('#app');
const state = { tab: 'project', editing: null, isNew: false };

function render() {
  app.innerHTML = String(shell());
  $$('[data-tab-btn]').forEach((b) => b.addEventListener('click', () => { if (confirmLeave()) selectTab(b.dataset.tabBtn); }));
  $('#save-btn').addEventListener('click', doSave);
  if (state.editing !== null || state.isNew) mountForm();
  else mountList();
  updateSaveState();
}

function shell() {
  const t = TYPES[state.tab];
  return html`<header class="ed-top"><div class="wrap">
    <div class="brand"><span class="brand-name">HEXWORKS</span><span class="brand-sub">Content editor</span></div>
    <nav class="ed-tabs">${ORDER.map((k) => html`<button type="button" data-tab-btn="${k}" ${state.tab === k ? 'aria-current="page"' : ''}>${TYPES[k].plural}<span class="n">${TYPES[k].list.length}</span></button>`)}</nav>
    <div class="ed-actions">
      <a class="btn btn-sm btn-ghost" href="./" target="_blank" rel="noopener">View site ${icon('external')}</a>
      <button class="btn btn-sm btn-primary" id="save-btn">${icon('download')}<span>Save content.js</span></button>
    </div>
  </div></header>
  <div class="ed-status" id="ed-status"></div>
  <main class="wrap ed-main">${state.editing !== null || state.isNew ? formView() : listView()}</main>`;
}

// ---- list ----
function listView() {
  const t = TYPES[state.tab];
  return html`<div class="row-between" style="margin:8px 0 20px">
    <div><div class="eyebrow">${t.plural}</div><p class="muted small" style="margin:4px 0 0">${t.list.length} ${t.plural.toLowerCase()} · edits are in memory until you save</p></div>
    <button class="btn btn-primary" id="new-btn">${icon('plus')}New ${t.label.toLowerCase()}</button>
  </div>
  ${t.list.length ? html`<div class="data-table-wrap"><table class="data-table"><thead><tr>
    <th>${state.tab === 'project' ? 'ID / ' : ''}Title</th>${state.tab !== 'note' ? html`<th>Status</th>` : ''}${state.tab === 'project' ? html`<th>Featured</th><th>Bench</th>` : ''}<th>Date</th><th></th></tr></thead>
    <tbody>${t.list.map((it, i) => html`<tr>
      <td class="title-cell">${it.code ? html`<span class="code-id">${it.code}</span><br>` : ''}<a href="#" data-edit="${i}">${titleOf(state.tab, it)}</a><br><span class="code-id">${it.slug}</span></td>
      ${state.tab !== 'note' ? html`<td>${it.status ? statusBadge(it.status) : ''}</td>` : ''}
      ${state.tab === 'project' ? html`<td>${it.featured ? '★' : ''}</td><td>${it.on_bench ? '●' : ''}</td>` : ''}
      <td class="mono xs muted">${it.published_at || it.idea_date || ''}</td>
      <td><div class="row" style="gap:4px;flex-wrap:nowrap">
        <button class="btn btn-sm btn-ghost" data-edit="${i}" title="Edit">${icon('edit')}</button>
        <button class="btn btn-sm btn-ghost" data-dup="${i}" title="Duplicate">${icon('plus')}</button>
        <button class="btn btn-sm btn-ghost" data-del="${i}" title="Delete">${icon('trash')}</button>
      </div></td></tr>`)}</tbody></table></div>`
    : html`<div class="empty"><span class="mono">// empty</span>No ${t.plural.toLowerCase()} yet.</div>`}`;
}

function mountList() {
  const t = TYPES[state.tab];
  $('#new-btn')?.addEventListener('click', () => { state.isNew = true; state.editing = null; render(); });
  app.addEventListener('click', (e) => {
    const ed = e.target.closest('[data-edit]');
    const dup = e.target.closest('[data-dup]');
    const del = e.target.closest('[data-del]');
    if (ed) { e.preventDefault(); state.editing = +ed.dataset.edit; state.isNew = false; render(); }
    else if (dup) {
      const copy = clone(t.list[+dup.dataset.dup]);
      copy.slug = (copy.slug || 'copy') + '-copy';
      copy[t.titleKey] = (copy[t.titleKey] || '') + ' (copy)';
      t.list.unshift(copy);
      markDirty();
      state.editing = 0; state.isNew = false; render();
    } else if (del) {
      const it = t.list[+del.dataset.del];
      if (confirm(`Delete "${titleOf(state.tab, it)}"? (You still have to save for it to take effect.)`)) { t.list.splice(+del.dataset.del, 1); markDirty(); render(); }
    }
  }, { once: true });
}

// ---- form ----
function currentItem() {
  const t = TYPES[state.tab];
  return state.isNew ? {} : t.list[state.editing];
}

function formView() {
  const t = TYPES[state.tab];
  const item = currentItem();
  const groups = schema(state.tab);
  return html`<div class="row-between" style="margin:8px 0 18px">
    <div><button class="btn btn-sm btn-ghost" id="back-btn">${icon('arrow', 'flip')} ${t.plural}</button>
      <h1 style="font-size:1.5rem;margin:10px 0 0">${state.isNew ? `New ${t.label.toLowerCase()}` : titleOf(state.tab, item)}</h1></div>
    ${!state.isNew && item.slug ? html`<a class="btn btn-sm btn-ghost" href="${{ project: 'project', idea: 'idea', product: 'product', note: 'research' }[state.tab]}/${item.slug}" target="_blank" rel="noopener">Preview ${icon('external')}</a>` : ''}
  </div>
  <form id="edit-form" novalidate>
    ${groups.map((g) => html`<section class="admin-section"><header><h2>${g.group}</h2></header><div class="body"><div class="form-grid">${g.fields.map((f) => fieldHtml(f, item))}</div></div></section>`)}
    <div class="save-bar">
      <span class="muted small">${state.isNew ? 'Not added yet' : `Editing ${item.slug || ''}`} · changes apply to the in-memory copy</span>
      <div class="row">${!state.isNew ? html`<button type="button" class="btn btn-danger" id="del-btn">${icon('trash')}Delete</button>` : ''}<button type="submit" class="btn btn-primary">${state.isNew ? 'Add' : 'Apply changes'}</button></div>
    </div>
  </form>`;
}

function mountForm() {
  mountWidgets(app);
  const t = TYPES[state.tab];
  const groups = schema(state.tab);
  const form = $('#edit-form');
  const titleInput = form.querySelector('[name="title"], [name="name"]');
  const slugInput = form.querySelector('[name="slug"]');
  let slugTouched = !state.isNew;
  slugInput.addEventListener('input', () => (slugTouched = true));
  titleInput.addEventListener('input', () => { if (!slugTouched) slugInput.value = slugify(titleInput.value); });

  $('#back-btn').addEventListener('click', () => { if (confirmLeave()) { state.editing = null; state.isNew = false; render(); } });
  $('#del-btn')?.addEventListener('click', () => {
    if (confirm(`Delete "${titleOf(state.tab, currentItem())}"?`)) { t.list.splice(state.editing, 1); markDirty(); state.editing = null; state.isNew = false; render(); }
  });
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!form.reportValidity()) return;
    const collected = collect(form, groups);
    // slug collision check within the type
    const dupe = t.list.find((x, i) => x.slug === collected.slug && !(!state.isNew && i === state.editing));
    if (dupe) { toast(`Another ${t.label.toLowerCase()} already uses slug "${collected.slug}".`, 'error'); return; }
    if (state.isNew) {
      t.list.unshift(orderKeys(state.tab, collected));
      state.isNew = false;
      state.editing = 0;
    } else {
      const merged = { ...t.list[state.editing], ...collected };
      t.list[state.editing] = orderKeys(state.tab, merged);
    }
    markDirty();
    toast('Applied — remember to Save content.js', 'ok');
    state.editing = null;
    render();
  });
}

// ---------------------------------------------------------------------------
// shared
// ---------------------------------------------------------------------------
function selectTab(tab) { state.tab = tab; state.editing = null; state.isNew = false; render(); }

function confirmLeave() {
  if (state.editing === null && !state.isNew) return true;
  return confirm('Leave this form? Unapplied field changes will be lost. (Use "Apply changes" first to keep them.)');
}

function updateSaveState() {
  const btn = $('#save-btn');
  if (btn) btn.querySelector('span').textContent = dirty ? 'Save content.js *' : 'Save content.js';
}

async function doSave() {
  const btn = $('#save-btn');
  btn.disabled = true;
  const status = $('#ed-status');
  try {
    const res = await saveContent(data);
    dirty = false;
    updateSaveState();
    if (res.mode === 'server') {
      status.className = 'ed-status ok show';
      status.innerHTML = String(html`${icon('shield')} Saved to <b>${res.path}</b>${res.backup ? html` · backup at <b>${res.backup}</b>` : ''}. Reload the site tab to see it. Commit &amp; push to publish.`);
    } else {
      status.className = 'ed-status ok show';
      status.innerHTML = String(html`${icon('download')} Downloaded <b>content.js</b> — move it into <b>js/data/</b> (the dev server was not reachable to write it for you), then push.`);
    }
    toast('Saved', 'ok');
  } catch (err) {
    status.className = 'ed-status err show';
    status.textContent = err.message;
    toast(err.message, 'error');
  }
  btn.disabled = false;
}

render();
