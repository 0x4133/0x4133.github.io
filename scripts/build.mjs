#!/usr/bin/env node
// Production build for GitHub Pages. Zero dependencies (Node 18+).
//
//   node scripts/build.mjs
//
// Environment (all optional):
//   BASE_PATH          "/" or "/repo-name/"  (default "/")
//   SITE_URL           https://example.com   (absolute URLs for OpenGraph + sitemap)
//
// Output: _site/
//   * site files with <base href> and js/config.js siteUrl filled in
//   * 404.html = copy of index.html (deep links boot the app directly)
//   * a static index.html per PUBLIC project / product / research note with
//     its own <title>, description and OpenGraph tags, so link previews work
//     even though the site is a client-side app
//   * sitemap.xml and robots.txt
import { readFile, writeFile, mkdir, cp, rm } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const out = join(root, '_site');
const BASE = normBase(process.env.BASE_PATH || '/');
const SITE_URL = (process.env.SITE_URL || '').replace(/\/$/, '');

function normBase(b) {
  let s = b.trim();
  if (!s.startsWith('/')) s = '/' + s;
  if (!s.endsWith('/')) s += '/';
  return s;
}
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const strip = (md, n = 200) => String(md ?? '').replace(/```[\s\S]*?```/g, ' ').replace(/[#>*_`|[\]()!-]+/g, ' ').replace(/\s+/g, ' ').trim().slice(0, n);
const abs = (p) => (SITE_URL ? `${SITE_URL}${BASE}${p.replace(/^\//, '')}` : `${BASE}${p.replace(/^\//, '')}`);

async function content() {
  const { api } = await import(pathToFileURL(join(root, 'js/data/api.js')).href);
  const all = await api.all();
  return { projects: all.project, products: all.product, notes: all.note };
}

function withMeta(indexHtml, { title, description, image, path, type = 'article' }) {
  const fullTitle = `${title} — Hexworks`;
  const img = image && /^https?:\/\//.test(image) ? image : abs(image && !image.startsWith('data:') ? image : 'assets/og-default.png');
  const url = abs(path);
  let h = indexHtml
    .replace(/<title>[\s\S]*?<\/title>/, `<title>${esc(fullTitle)}</title>`)
    .replace(/<meta name="description"[^>]*>/, `<meta name="description" content="${esc(description)}">`)
    .replace(/<meta property="og:type"[^>]*>/, `<meta property="og:type" content="${type}">`)
    .replace(/<meta property="og:title"[^>]*>/, `<meta property="og:title" content="${esc(title)}">`)
    .replace(/<meta property="og:description"[^>]*>/, `<meta property="og:description" content="${esc(description)}">`)
    .replace(/<meta property="og:image"[^>]*>/, `<meta property="og:image" content="${esc(img)}">`);
  h = h.replace('</head>', `  <meta property="og:url" content="${esc(url)}">\n  <link rel="canonical" href="${esc(url)}">\n  <meta name="twitter:title" content="${esc(title)}">\n  <meta name="twitter:description" content="${esc(description)}">\n  <meta name="twitter:image" content="${esc(img)}">\n</head>`);
  return h;
}

async function main() {
  await rm(out, { recursive: true, force: true });
  await mkdir(out, { recursive: true });
  for (const item of ['index.html', 'css', 'js', 'assets']) await cp(join(root, item), join(out, item), { recursive: true });
  await writeFile(join(out, '.nojekyll'), '');
  try { await cp(join(root, 'CNAME'), join(out, 'CNAME')); } catch { /* optional */ }

  // config.js
  const cfgPath = join(out, 'js/config.js');
  let cfg = await readFile(cfgPath, 'utf8');
  const setCfg = (key, val) => { if (val) cfg = cfg.replace(new RegExp(`(${key}:\\s*)'[^']*'`), `$1${JSON.stringify(val).replace(/^"|"$/g, "'")}`); };
  setCfg('siteUrl', SITE_URL);
  await writeFile(cfgPath, cfg);

  // base href + absolute default og:image
  let index = await readFile(join(out, 'index.html'), 'utf8');
  index = index.replace(/<base href="[^"]*">/, `<base href="${BASE}">`);
  index = index.replace(/<meta property="og:image" content="[^"]*">/, `<meta property="og:image" content="${esc(abs('assets/og-default.png'))}">`);
  await writeFile(join(out, 'index.html'), index);
  await writeFile(join(out, '404.html'), index.replace('<head>', '<head>\n  <meta name="robots" content="noindex">'));

  const { projects, products, notes } = await content();
  const pages = [
    ...projects.map((p) => ({ path: `project/${p.slug}/`, title: p.code ? `${p.title} (${p.code})` : p.title, description: strip(p.summary), image: p.hero_image, lastmod: p.updated_at || p.published_at })),
    ...products.map((p) => ({ path: `product/${p.slug}/`, title: p.name, description: strip(p.summary), image: p.hero_image, type: 'product', lastmod: p.updated_at || p.published_at })),
    ...notes.map((n) => ({ path: `research/${n.slug}/`, title: n.title, description: strip(n.summary), image: n.hero_image, lastmod: n.updated_at || n.published_at })),
  ];
  const statics = [
    ['projects/', 'Projects', 'Searchable library of applied cybersecurity research projects, experiments and prototypes.'],
    ['products/', 'Products', 'Hardware, software, open-source tools, training systems and research kits.'],
    ['research/', 'Research notes', 'Short research notes from the lab bench.'],
    ['ideas/', 'Idea Vault', 'Early concepts from the lab, before they become projects.'],
    ['lab/', 'Lab status', 'Live status of the lab: active projects, experiments and what is on the bench.'],
    ['about/', 'About', 'An independent applied cyber R&D lab focused on building practical prototypes.'],
    ['contact/', 'Contact', 'Prototype development, research collaboration, security engineering and embedded / wireless projects.'],
    ['submit/', 'Submit a Problem', 'Send the lab an unusual cybersecurity or engineering problem.'],
    ['responsible-research/', 'Responsible Research', 'Research is performed on owned systems, lab environments or with authorisation.'],
    ['technology/', 'Technologies', 'Every technology used across the lab.'],
  ].map(([path, title, description]) => ({ path, title, description, type: 'website' }));

  for (const pg of [...statics, ...pages]) {
    const dir = join(out, pg.path);
    await mkdir(dir, { recursive: true });
    await writeFile(join(dir, 'index.html'), withMeta(index, pg));
  }

  if (SITE_URL) {
    const urls = [{ path: '' }, ...statics, ...pages];
    const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls
      .map((u) => `  <url><loc>${esc(abs(u.path))}</loc>${u.lastmod ? `<lastmod>${String(u.lastmod).slice(0, 10)}</lastmod>` : ''}</url>`)
      .join('\n')}\n</urlset>\n`;
    await writeFile(join(out, 'sitemap.xml'), xml);
  }
  await writeFile(join(out, 'robots.txt'), `User-agent: *\nAllow: /\n${SITE_URL ? `Sitemap: ${abs('sitemap.xml')}\n` : ''}`);

  console.log(`✓ built _site/ (base ${BASE}, ${pages.length} content pages, ${statics.length} section pages)`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
