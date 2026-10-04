// History-API router that respects <base href>, so the site works at the
// domain root or under a GitHub Pages project path (/repo-name/).
const routes = [];

export function route(pattern, load) {
  const keys = [];
  const src = pattern.replace(/\/:(\w+)/g, (_, k) => {
    keys.push(k);
    return '/([^/]+)';
  });
  routes.push({ re: new RegExp(`^${src}/?$`), keys, load });
}

export const basePath = () => new URL(document.baseURI).pathname;

export function currentPath() {
  const base = basePath();
  let p = location.pathname;
  if (p.startsWith(base)) p = '/' + p.slice(base.length);
  else if (p + '/' === base) p = '/';
  p = p.replace(/\/index\.html$/, '/');
  return p.length > 1 ? p.replace(/\/$/, '') : '/';
}

export function match(path) {
  for (const r of routes) {
    const m = r.re.exec(path);
    if (m) {
      const params = {};
      r.keys.forEach((k, i) => (params[k] = decodeURIComponent(m[i + 1])));
      return { load: r.load, params };
    }
  }
  return null;
}

let onChange = () => {};
export function onRoute(fn) { onChange = fn; }

export function navigate(to, { replace = false, keepScroll = false } = {}) {
  const url = new URL(to, document.baseURI);
  if (url.href === location.href && !replace) return;
  history[replace ? 'replaceState' : 'pushState']({}, '', url);
  onChange({ keepScroll });
}

// Update the query string without re-rendering the view.
export function setQuery(params) {
  const url = new URL(location.href);
  for (const [k, v] of Object.entries(params)) {
    if (v == null || v === '' || (Array.isArray(v) && !v.length)) url.searchParams.delete(k);
    else url.searchParams.set(k, Array.isArray(v) ? v.join(',') : v);
  }
  history.replaceState({}, '', url);
}

export function startRouter() {
  window.addEventListener('popstate', () => onChange({ keepScroll: true }));
  document.addEventListener('click', (e) => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const a = e.target.closest('a[href]');
    if (!a || a.target === '_blank' || a.hasAttribute('download') || a.dataset.native !== undefined) return;
    const url = new URL(a.href, document.baseURI);
    if (url.origin !== location.origin || !url.pathname.startsWith(basePath().replace(/\/$/, ''))) return;
    if (/\.(svg|png|jpe?g|webp|gif|pdf|zip|json|xml|txt)$/i.test(url.pathname)) return;
    if (url.pathname === location.pathname && url.search === location.search && url.hash) return; // in-page anchor
    e.preventDefault();
    navigate(url.href);
  });
}
