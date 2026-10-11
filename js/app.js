// Application entry: shell, routing, metadata.
import { config } from './config.js';
import { api } from './data/api.js';
import { html, $, $$, toast } from './lib/dom.js';
import { enhanceMarkdown } from './lib/markdown.js';
import { route, match, currentPath, navigate, onRoute, startRouter } from './router.js';
import { brandMark, icon, link, setTaxonomy, loading } from './ui/components.js';

import { homeView } from './views/home.js';
import { projectsView, projectView } from './views/projects.js';
import { productsView, productView } from './views/products.js';
import { ideasView, ideaView } from './views/ideas.js';
import { researchView, noteView } from './views/research.js';
import { searchView, technologyView, technologyIndexView } from './views/search.js';
import { labView } from './views/lab.js';
import { submitView, contactView } from './views/forms.js';
import { aboutView, responsibleView, notFoundView } from './views/pages.js';

// ---------------------------------------------------------------------------
// routes
// ---------------------------------------------------------------------------
route('/', homeView);
route('/projects', projectsView);
route('/project/:slug', projectView);
route('/products', productsView);
route('/product/:slug', productView);
route('/ideas', ideasView);
route('/idea/:slug', ideaView);
route('/research', researchView);
route('/research/:slug', noteView);
route('/technology', technologyIndexView);
route('/technology/:slug', technologyView);
route('/search', searchView);
route('/lab', labView);
route('/submit', submitView);
route('/contact', contactView);
route('/about', aboutView);
route('/responsible-research', responsibleView);

const NAV = [
  ['/projects', 'Projects'],
  ['/products', 'Products'],
  ['/research', 'Research'],
  ['/ideas', 'Idea Vault'],
  ['/lab', 'Lab'],
  ['/about', 'About'],
  ['/contact', 'Contact'],
];

// ---------------------------------------------------------------------------
// theme
// ---------------------------------------------------------------------------
function getTheme() {
  try { return localStorage.getItem('hexworks.theme') || 'dark'; } catch { return 'dark'; }
}
function setTheme(t) {
  document.documentElement.dataset.theme = t;
  try { localStorage.setItem('hexworks.theme', t); } catch { /* ignore */ }
  const b = $('#theme-btn');
  if (b) b.innerHTML = String(icon(t === 'dark' ? 'sun' : 'moon'));
}

// ---------------------------------------------------------------------------
// shell
// ---------------------------------------------------------------------------
function header() {
  return html`<a class="skip-link" href="#app">Skip to content</a>
<header class="site-header"><div class="wrap">
  <a class="brand" href="./" aria-label="${config.siteName} home">${brandMark()}<span><span class="brand-name">${config.siteName.toUpperCase()}</span><span class="brand-sub">${config.siteTitle}</span></span></a>
  <nav class="nav" aria-label="Primary">${NAV.map(([p, l]) => html`<a href="${link(p)}" data-nav="${p}">${l}</a>`)}</nav>
  <div class="header-actions">
    <a class="icon-btn" href="search" aria-label="Search">${icon('search')}</a>
    <button class="icon-btn" id="theme-btn" type="button" aria-label="Toggle color theme">${icon(getTheme() === 'dark' ? 'sun' : 'moon')}</button>
    <a class="btn btn-sm btn-primary btn-cta" href="submit">Submit a Problem</a>
    <button class="icon-btn menu-btn" id="menu-btn" type="button" aria-label="Open menu" aria-expanded="false" aria-controls="mobile-nav">${icon('menu')}</button>
  </div>
</div></header>
<nav class="mobile-nav" id="mobile-nav" aria-label="Mobile">
  ${NAV.map(([p, l], i) => html`<a href="${link(p)}">${l}<span class="mono">0${i + 1}</span></a>`)}
  <a href="search">Search<span class="mono">/</span></a>
  <a href="submit">Submit a Problem<span class="mono">→</span></a>
</nav>
<div class="ticker" aria-label="Lab status"><div class="wrap" id="ticker">
  <span><span style="color:var(--ok)">●</span> <b>LAB ONLINE</b></span>
</div></div>`;
}

function footer() {
  const col = (title, items) => html`<div><h4>${title}</h4><ul>${items.map(([h, l, ext]) => html`<li><a href="${h}" ${ext ? 'target="_blank" rel="noopener noreferrer"' : ''}>${l}</a></li>`)}</ul></div>`;
  return html`<footer class="site-footer"><div class="wrap">
  <div class="footer-grid">
    <div>
      <a class="brand" href="./">${brandMark()}<span><span class="brand-name">${config.siteName.toUpperCase()}</span><span class="brand-sub">${config.siteTitle}</span></span></a>
      <p class="muted small" style="margin-top:16px;max-width:38ch">A laboratory where cybersecurity ideas become real systems.</p>
      <p class="mono xs" style="color:var(--accent)">${config.tagline}</p>
    </div>
    ${col('Work', [['projects', 'Projects'], ['products', 'Products'], ['research', 'Research'], ['ideas', 'Idea Vault'], ['technology', 'Technologies']])}
    ${col('Lab', [['lab', 'Lab status'], ['about', 'About'], ['responsible-research', 'Responsible Research'], ['submit', 'Submit a Problem']])}
    ${col('Connect', [['contact', 'Contact'], [config.githubUrl, 'GitHub', true], [`mailto:${config.contactEmail}`, config.contactEmail]])}
  </div>
  <div class="fine"><span>© ${new Date().getFullYear()} ${config.companyName} · ${config.siteTitle}</span><span>Research is performed on owned or authorised systems only.</span></div>
</div></footer>`;
}

function renderShell() {
  document.getElementById('shell-top').innerHTML = String(header());
  document.getElementById('shell-bottom').innerHTML = String(footer());
  $('#theme-btn').addEventListener('click', () => setTheme(getTheme() === 'dark' ? 'light' : 'dark'));
  const menuBtn = $('#menu-btn');
  const mnav = $('#mobile-nav');
  menuBtn.addEventListener('click', () => {
    const open = !mnav.classList.contains('open');
    mnav.classList.toggle('open', open);
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.innerHTML = String(icon(open ? 'close' : 'menu'));
  });
  mnav.addEventListener('click', (e) => {
    if (e.target.closest('a')) {
      mnav.classList.remove('open');
      menuBtn.setAttribute('aria-expanded', 'false');
      menuBtn.innerHTML = String(icon('menu'));
    }
  });
  fillTicker();
}

async function fillTicker() {
  try {
    const all = await api.all();
    const live = all.project.filter((p) => ['EXPERIMENT', 'BUILDING', 'PROTOTYPE', 'TESTING', 'ACTIVE'].includes(p.status)).length;
    const bench = all.project.filter((p) => p.on_bench).length;
    const latest = [...all.project.map((p) => p.published_at), ...all.note.map((n) => n.published_at)].sort().pop();
    const el = $('#ticker');
    if (!el) return;
    el.insertAdjacentHTML('beforeend', String(html`
      <span class="sep">/</span><span><b>${bench}</b> on the bench</span>
      <span class="sep opt">/</span><span class="opt"><b>${live}</b> active builds</span>
      <span class="sep opt">/</span><span class="opt"><b>${all.note.length}</b> research notes</span>
      ${latest ? html`<span class="sep opt">/</span><span class="opt">last publish <b>${latest}</b></span>` : ''}`));
  } catch { /* ticker is decorative */ }
}

// ---------------------------------------------------------------------------
// metadata
// ---------------------------------------------------------------------------
function setMeta(name, content, attr = 'name') {
  let el = document.head.querySelector(`meta[${attr}="${name}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, name);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function applyMeta(view) {
  const title = view.title ? `${view.title} — ${config.siteName}` : `${config.companyName} — ${config.siteTitle}`;
  const desc = view.description || config.description;
  const abs = (u) => (u ? new URL(u, document.baseURI).href : '');
  const img = view.image && !String(view.image).startsWith('data:') ? abs(view.image) : abs('assets/og-default.png');
  document.title = title;
  setMeta('description', desc);
  setMeta('og:title', view.title || config.siteName, 'property');
  setMeta('og:description', desc, 'property');
  setMeta('og:type', view.ogType || 'website', 'property');
  setMeta('og:url', location.href, 'property');
  setMeta('og:image', img, 'property');
  setMeta('twitter:card', 'summary_large_image');
  setMeta('robots', view.noindex ? 'noindex, nofollow' : 'index, follow');
  let canon = document.head.querySelector('link[rel="canonical"]');
  if (!canon) {
    canon = document.createElement('link');
    canon.rel = 'canonical';
    document.head.appendChild(canon);
  }
  canon.href = location.origin + location.pathname;
}

// ---------------------------------------------------------------------------
// render loop
// ---------------------------------------------------------------------------
let renderSeq = 0;
let cleanup = null;

async function render({ keepScroll = false } = {}) {
  const seq = ++renderSeq;
  const main = document.getElementById('app');
  const path = currentPath();
  const query = Object.fromEntries(new URLSearchParams(location.search));
  const m = match(path);

  $$('[data-nav]').forEach((a) => {
    const p = a.dataset.nav;
    if (path === p || path.startsWith(p + '/') || (p === '/projects' && path.startsWith('/project/')) || (p === '/products' && path.startsWith('/product/')) || (p === '/ideas' && path.startsWith('/idea/'))) a.setAttribute('aria-current', 'page');
    else a.removeAttribute('aria-current');
  });

  const slow = setTimeout(() => { if (seq === renderSeq) main.innerHTML = String(loading()); }, 120);
  let view;
  try {
    view = m ? await m.load({ params: m.params, query, path }) : null;
    if (!view) view = notFoundView();
  } catch (err) {
    console.error(err);
    view = notFoundView({ code: 'ERR', title: 'Something went wrong', text: err.message });
  }
  clearTimeout(slow);
  if (seq !== renderSeq) return;
  if (view.redirect) return navigate(view.redirect, { replace: true });

  cleanup?.();
  cleanup = null;
  // Fresh container per view so listeners attached by a view die with it.
  const root = document.createElement('div');
  root.className = 'view';
  root.innerHTML = String(view.html);
  main.replaceChildren(root);
  applyMeta(view);
  root.querySelectorAll('.prose').forEach(enhanceMarkdown);
  try {
    cleanup = (await view.mount?.(root)) || null;
  } catch (err) {
    console.error(err);
    toast(err.message, 'error');
  }
  if (!keepScroll) {
    if (location.hash) document.getElementById(location.hash.slice(1))?.scrollIntoView();
    else window.scrollTo(0, 0);
  }
  reveal(root);
  main.focus({ preventScroll: true });
}

function reveal(root) {
  const els = root.querySelectorAll('.reveal');
  if (!('IntersectionObserver' in window)) return els.forEach((e) => e.classList.add('in'));
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (e.isIntersecting) {
        e.target.classList.add('in');
        io.unobserve(e.target);
      }
    }
  }, { rootMargin: '0px 0px -40px 0px' });
  els.forEach((e) => io.observe(e));
}

// ---------------------------------------------------------------------------
// boot
// ---------------------------------------------------------------------------
async function boot() {
  setTheme(getTheme());

  // 404.html redirect fallback: /?p=/project/foo
  const sp = new URLSearchParams(location.search);
  if (sp.has('p')) {
    const target = sp.get('p').replace(/^\/+/, '');
    history.replaceState({}, '', new URL(target + location.hash, document.baseURI));
  }

  try {
    setTaxonomy(await api.taxonomy());
  } catch (err) {
    console.error(err);
    setTaxonomy({ categories: [], technologies: [], tags: [] });
  }
  renderShell();
  onRoute(render);
  startRouter();
  await render();
}

boot().catch((err) => {
  console.error(err);
  document.getElementById('app').innerHTML = `<div class="wrap not-found"><div class="code">ERR</div><p>Failed to start: ${String(err.message).replace(/[<>&]/g, '')}</p></div>`;
});
