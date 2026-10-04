// Helpers shared by detail pages (projects, products, ideas, notes).
import { html, raw, safeUrl, safeImg } from '../lib/dom.js';
import { renderMarkdown, mdToText } from '../lib/markdown.js';
import { icon, extLink } from '../ui/components.js';

export const md = (text) => raw(renderMarkdown(text));

export function docSection(id, title, text, ix) {
  if (!text || !String(text).trim()) return '';
  return html`<section class="doc-section" id="${id}"><h2>${ix ? html`<span class="ix">${ix}</span>` : ''}${title}</h2><div class="prose">${md(text)}</div></section>`;
}

export function gallerySection(id, title, items, ix) {
  if (!items.length) return '';
  return html`<section class="doc-section" id="${id}"><h2>${ix ? html`<span class="ix">${ix}</span>` : ''}${title}</h2>
  <div class="gallery">${items.map((m) => html`<figure>
    <button type="button" data-lightbox="${safeImg(m.url)}" data-caption="${m.caption || ''}" aria-label="Enlarge ${m.caption || m.kind}"><img src="${safeImg(m.url)}" alt="${m.caption || ''}" loading="lazy"></button>
    <figcaption><span class="mono">${m.kind}</span>${m.caption || ''}</figcaption></figure>`)}</div></section>`;
}

function embedUrl(u) {
  try {
    const url = new URL(u);
    if (/(^|\.)youtube\.com$/.test(url.hostname) && url.searchParams.get('v')) return `https://www.youtube-nocookie.com/embed/${encodeURIComponent(url.searchParams.get('v'))}`;
    if (url.hostname === 'youtu.be') return `https://www.youtube-nocookie.com/embed/${encodeURIComponent(url.pathname.slice(1))}`;
    if (/(^|\.)vimeo\.com$/.test(url.hostname) && /^\/\d+/.test(url.pathname)) return `https://player.vimeo.com/video${url.pathname.match(/^\/\d+/)[0]}`;
  } catch { /* not a URL */ }
  return null;
}

export function videoSection(id, items, ix) {
  if (!items.length) return '';
  return html`<section class="doc-section" id="${id}"><h2>${ix ? html`<span class="ix">${ix}</span>` : ''}Videos</h2><div class="grid grid-2">${items.map((v) => {
    const e = embedUrl(v.url);
    return html`<figure style="margin:0"><div class="video-frame">${e
      ? html`<iframe src="${e}" title="${v.caption || 'Video'}" loading="lazy" allow="accelerometer; encrypted-media; picture-in-picture" allowfullscreen referrerpolicy="strict-origin-when-cross-origin"></iframe>`
      : html`<video src="${safeUrl(v.url)}" controls preload="metadata"></video>`}</div>${v.caption ? html`<figcaption class="muted small" style="margin-top:8px">${v.caption}</figcaption>` : ''}</figure>`;
  })}</div></section>`;
}

export function linksCard(title, links) {
  const list = links.filter((l) => l && l.url);
  if (!list.length) return '';
  return html`<div class="aside-card"><h4>${title}</h4><ul class="link-list">${list.map((l) => extLink(l.url, l.label, l.kind))}</ul></div>`;
}

export function githubLabel(url) {
  try {
    const u = new URL(url);
    if (u.hostname === 'github.com') return u.pathname.replace(/^\/|\/$/g, '');
  } catch { /* ignore */ }
  return url;
}

export function toc(entries) {
  const list = entries.filter((e) => e.show);
  if (list.length < 3) return '';
  return html`<div class="aside-card"><h4>Contents</h4><ul class="toc">${list.map((e) => html`<li><a href="#${e.id}" data-native>${e.title}</a></li>`)}</ul></div>`;
}

export function mountLightbox(root) {
  const onClick = (e) => {
    const b = e.target.closest('[data-lightbox]');
    if (!b) return;
    const box = document.createElement('div');
    box.className = 'lightbox';
    box.setAttribute('role', 'dialog');
    box.setAttribute('aria-modal', 'true');
    box.innerHTML = String(html`<figure style="margin:0"><img src="${b.dataset.lightbox}" alt="${b.dataset.caption}">${b.dataset.caption ? html`<p>${b.dataset.caption}</p>` : ''}</figure>`);
    const close = () => { box.remove(); document.removeEventListener('keydown', onKey); b.focus(); };
    const onKey = (ev) => ev.key === 'Escape' && close();
    box.addEventListener('click', close);
    document.addEventListener('keydown', onKey);
    document.body.appendChild(box);
    box.tabIndex = -1;
    box.focus();
  };
  root.addEventListener('click', onClick);
  return () => root.removeEventListener('click', onClick);
}

export const describe = (item, fallback) => mdToText(item.summary || item.concept || item.description || fallback, 200);
