import { api } from '../data/api.js';
import { html, $, $$, fmtDate, safeUrl } from '../lib/dom.js';
import {
  PRODUCT_KINDS, icon, link, productCard, projectCard, statusBadge, techChips, cover, pageHead, empty,
} from '../ui/components.js';
import { md, docSection, gallerySection, videoSection, linksCard, mountLightbox, describe } from './shared.js';

export async function productsView({ query }) {
  const products = await api.list('product');
  let kind = query.kind || '';
  const kinds = Object.keys(PRODUCT_KINDS);
  const grid = () => {
    const r = products.filter((p) => !kind || p.kind === kind);
    return r.length ? html`<div class="grid grid-3">${r.map(productCard)}</div>` : empty('No products of this type yet.');
  };
  return {
    title: 'Products',
    description: 'Hardware, software, open-source tools, security appliances, training systems and research kits from the lab.',
    html: html`${pageHead({
      eyebrow: 'Product gallery',
      title: 'Products',
      lede: 'Prototypes that survived testing and became things other people can use: hardware, open-source tools, appliances, training systems and research kits.',
      crumbs: [{ label: 'products' }],
    })}
<section class="section-tight"><div class="wrap">
  <div class="filter-row" style="margin-bottom:24px"><span class="label">Type</span>
    <button type="button" class="fchip" data-kind="" aria-pressed="${String(!kind)}">All</button>
    ${kinds.map((k) => html`<button type="button" class="fchip" data-kind="${k}" aria-pressed="${String(kind === k)}">${PRODUCT_KINDS[k]}</button>`)}
  </div>
  <div id="pgrid">${grid()}</div>
</div></section>`,
    mount(root) {
      root.addEventListener('click', (e) => {
        const b = e.target.closest('[data-kind]');
        if (!b) return;
        kind = b.dataset.kind;
        $$('[data-kind]', root).forEach((x) => x.setAttribute('aria-pressed', String(x.dataset.kind === kind)));
        $('#pgrid', root).innerHTML = String(grid());
      });
    },
  };
}

export async function productView({ params }) {
  const p = await api.get('product', params.slug);
  if (!p) return null;
  const projects = await api.list('project');
  const related = projects.find((x) => x.id === p.related_project_id);
  const media = p.media || [];
  const photos = media.filter((m) => ['photo', 'screenshot', 'diagram'].includes(m.kind));
  const videos = media.filter((m) => m.kind === 'video');
  const files = media.filter((m) => m.kind === 'file');
  const links = p.links || [];
  const specs = Array.isArray(p.specs) ? p.specs : [];

  const resources = [
    p.docs_url && { url: p.docs_url, label: 'Documentation', kind: 'docs' },
    p.source_url && { url: p.source_url, label: 'Source code', kind: 'github' },
    p.download_url && { url: p.download_url, label: 'Download', kind: 'download' },
    ...files.map((f) => ({ url: f.url, label: f.caption || 'Download file', kind: 'download' })),
    ...links,
  ].filter(Boolean);

  const ctaHref = p.purchase_url ? safeUrl(p.purchase_url) : link(`/contact?topic=product-development&ref=${encodeURIComponent(p.name)}`);

  return {
    title: p.name,
    description: describe(p),
    image: p.hero_image,
    ogType: 'product',
    html: html`
<article>
<header class="detail-hero"><div class="wrap">
  <nav class="crumbs" aria-label="Breadcrumb"><a href="./">~</a><span>/</span><a href="products">products</a><span>/</span><span>${p.slug}</span></nav>
  <div class="meta-row">${statusBadge(p.status, { lg: true })}<span class="kind-tag">${PRODUCT_KINDS[p.kind] || p.kind}</span>${p.version ? html`<span class="version-tag">v${p.version}</span>` : ''}</div>
  <h1>${p.name}</h1>
  <p class="lede">${p.summary}</p>
  <div class="row" style="margin-top:22px">
    <a class="btn btn-primary" href="${ctaHref}" ${p.purchase_url ? 'target="_blank" rel="noopener noreferrer"' : ''}>${p.cta_label || (p.purchase_url ? 'Purchase' : 'Contact us')} ${icon('arrow')}</a>
    ${p.source_url ? html`<a class="btn" href="${safeUrl(p.source_url)}" target="_blank" rel="noopener noreferrer">${icon('github')}Source</a>` : ''}
    ${p.download_url ? html`<a class="btn" href="${safeUrl(p.download_url)}" target="_blank" rel="noopener noreferrer">${icon('download')}Download</a>` : ''}
    ${p.docs_url ? html`<a class="btn btn-ghost" href="${safeUrl(p.docs_url)}" target="_blank" rel="noopener noreferrer">${icon('docs')}Docs</a>` : ''}
  </div>
  <div class="hero-media">${cover(p)}</div>
</div></header>

<div class="wrap detail-layout">
  <div>
    ${docSection('description', 'Description', p.description, '01')}
    ${docSection('problem', 'Problem solved', p.problem_solved, '02')}
    ${p.features?.length ? html`<section class="doc-section" id="features"><h2><span class="ix">03</span>Features</h2><ul class="feature-list">${p.features.map((f) => html`<li>${f}</li>`)}</ul></section>` : ''}
    ${specs.length ? html`<section class="doc-section" id="specs"><h2><span class="ix">04</span>Technical specifications</h2><table class="spec-table"><tbody>${specs.map((s) => html`<tr><th scope="row">${s.label}</th><td>${s.value}</td></tr>`)}</tbody></table></section>` : ''}
    ${gallerySection('photos', 'Photos', photos, '05')}
    ${videoSection('videos', videos, '06')}
    ${p.changelog ? html`<section class="doc-section" id="changelog"><h2><span class="ix">07</span>Changelog</h2><div class="prose">${md(p.changelog)}</div></section>` : ''}
  </div>
  <aside class="detail-aside"><div class="sticky">
    <div class="aside-card"><h4>Product</h4><dl class="kv">
      <dt>Type</dt><dd>${PRODUCT_KINDS[p.kind] || p.kind}</dd>
      <dt>Status</dt><dd>${statusBadge(p.status)}</dd>
      ${p.version ? html`<dt>Version</dt><dd class="mono">${p.version}</dd>` : ''}
      <dt>Updated</dt><dd>${fmtDate(p.published_at)}</dd>
    </dl></div>
    ${p.technologies?.length ? html`<div class="aside-card"><h4>Technologies</h4>${techChips(p.technologies)}</div>` : ''}
    ${linksCard('Resources', resources)}
  </div></aside>
</div>
${related ? html`<section class="section-tight" style="border-top:1px solid var(--line);background:var(--bg-2)"><div class="wrap">
  <div class="eyebrow">Origin project</div><div class="grid grid-3">${projectCard(related)}</div></div></section>` : ''}
</article>`,
    mount: (root) => mountLightbox(root),
  };
}
