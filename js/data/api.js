// Read-only data layer over js/data/content.js.
//
// Content is written by hand with slug references (e.g. a note's `project`),
// and normalised here into the shape the views use (ids, *_id fields,
// sorted dates, auto-assigned project codes).
import * as content from './content.js';

export const TYPES = {
  project: { date: 'published_at', label: 'Project', plural: 'Projects' },
  product: { date: 'published_at', label: 'Product', plural: 'Products' },
  idea: { date: 'idea_date', label: 'Idea', plural: 'Ideas' },
  note: { date: 'published_at', label: 'Research note', plural: 'Research notes' },
};

const byDateDesc = (field) => (a, b) => String(b[field] || '').localeCompare(String(a[field] || ''));
const arr = (v) => (Array.isArray(v) ? v : []);

function assignCodes(projects) {
  const prefixOf = (cat) => content.categories.find((c) => c.slug === cat)?.code_prefix || 'LAB';
  const next = {};
  for (const p of projects) {
    const m = /^([A-Z]+)-(\d+)$/.exec(p.code || '');
    if (m) next[m[1]] = Math.max(next[m[1]] || 0, Number(m[2]));
  }
  for (const p of projects) {
    if (p.code) continue;
    const pre = prefixOf(p.category);
    next[pre] = (next[pre] || 0) + 1;
    p.code = `${pre}-${String(next[pre]).padStart(3, '0')}`;
  }
}

const db = (() => {
  const projects = content.projects.map((p) => ({
    ...p,
    id: p.slug,
    technologies: arr(p.technologies),
    tags: arr(p.tags),
    media: arr(p.media),
    links: arr(p.links),
    updates: arr(p.updates).map((u) => ({ ...u, entry_date: u.date, project_id: p.slug })).sort(byDateDesc('entry_date')),
  }));
  // Codes are assigned oldest-first so numbering stays stable as projects are added.
  assignCodes([...projects].sort((a, b) => String(a.published_at).localeCompare(String(b.published_at))));
  const products = content.products.map((p) => ({
    ...p, id: p.slug, related_project_id: p.related_project || null,
    technologies: arr(p.technologies), tags: arr(p.tags), features: arr(p.features), specs: arr(p.specs), media: arr(p.media), links: arr(p.links),
  }));
  const ideas = content.ideas.map((i) => ({ ...i, id: i.slug, related_project_ids: arr(i.related_projects), tags: arr(i.tags), technologies: arr(i.technologies) }));
  const notes = content.notes.map((n) => ({ ...n, id: n.slug, project_id: n.project || null, technologies: arr(n.technologies), tags: arr(n.tags) }));
  const data = { project: projects, product: products, idea: ideas, note: notes };
  for (const t of Object.keys(data)) data[t].sort(byDateDesc(TYPES[t].date));

  // Technology / tag registry: explicit names plus any slug used on content.
  const used = (field) => new Set(Object.values(data).flat().flatMap((i) => i[field] || []));
  const technologies = [...new Set([...Object.keys(content.technologies), ...used('technologies')])]
    .map((slug) => ({ slug, name: content.technologies[slug] || slug }))
    .sort((a, b) => a.name.localeCompare(b.name));
  const tags = [...used('tags')].map((slug) => ({ slug, name: slug.replace(/-/g, ' ') })).sort((a, b) => a.name.localeCompare(b.name));
  return { data, taxonomy: { categories: content.categories, technologies, tags } };
})();

// Async signatures keep the views independent of where content comes from.
export const api = {
  async list(type) { return db.data[type]; },
  async get(type, slug) { return db.data[type].find((i) => i.slug === slug) || null; },
  async all() { return db.data; },
  async taxonomy() { return db.taxonomy; },
  async recentUpdates(limit = 12) {
    return db.data.project.flatMap((p) => p.updates).sort(byDateDesc('entry_date')).slice(0, limit);
  },
};
