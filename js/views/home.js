import { config } from '../config.js';
import { api } from '../data/api.js';
import { html, raw } from '../lib/dom.js';
import {
  LABS, LIVE_STATUSES, icon, link, projectCard, productCard, noteCard, benchItem, sectionHead, statusBadge,
} from '../ui/components.js';

const heroDiagram = () => raw(`<svg viewBox="0 0 520 360" role="img" aria-label="Diagram: a wireless sensor feeds a gateway, which sends telemetry to a SOC pipeline and a test bench">
<defs><pattern id="hg" width="20" height="20" patternUnits="userSpaceOnUse"><path d="M20 0H0V20" fill="none" class="dg-grid"/></pattern></defs>
<rect width="520" height="360" fill="url(#hg)"/>
<!-- radio waves -->
<path class="dg-wave" d="M36 70a30 30 0 0 1 0 44M28 62a42 42 0 0 1 0 60M20 54a54 54 0 0 1 0 76" transform="translate(90 0)"/>
<!-- sensor -->
<rect class="dg-box-hot" x="20" y="60" width="96" height="64" rx="6"/>
<text class="dg-label" x="32" y="86">SENSOR</text><text class="dg-sub" x="32" y="102">ESP32-C6</text><text class="dg-sub" x="32" y="114">wifi · ble · 15.4</text>
<circle class="dg-led-a" cx="104" cy="72" r="3"/>
<!-- second sensor -->
<rect class="dg-box" x="20" y="236" width="96" height="64" rx="6"/>
<text class="dg-label" x="32" y="262">RF NODE</text><text class="dg-sub" x="32" y="278">SDR sweep</text><text class="dg-sub" x="32" y="290">1M–6 GHz</text>
<circle class="dg-led" cx="104" cy="248" r="3"/>
<!-- gateway -->
<rect class="dg-box" x="196" y="140" width="120" height="80" rx="6"/>
<text class="dg-label" x="210" y="168">GATEWAY</text><text class="dg-sub" x="210" y="184">policy · hmac</text><text class="dg-sub" x="210" y="198">mqtt / tls</text>
<circle class="dg-led" cx="302" cy="152" r="3"/>
<!-- soc -->
<rect class="dg-box-sig" x="392" y="48" width="108" height="72" rx="6"/>
<text class="dg-label" x="404" y="74">SOC</text><text class="dg-sub" x="404" y="90">detections</text><text class="dg-sub" x="404" y="104">evidence bundles</text>
<!-- bench -->
<rect class="dg-box" x="392" y="236" width="108" height="72" rx="6"/>
<text class="dg-label" x="404" y="262">BENCH</text><text class="dg-sub" x="404" y="278">test · measure</text><text class="dg-sub" x="404" y="292">log · publish</text>
<!-- wires -->
<path class="dg-wire" d="M116 92H156V170H196"/><path class="dg-wire" d="M116 268H156V190H196"/>
<path class="dg-wire" d="M316 170H354V84H392"/><path class="dg-wire" d="M316 190H354V272H392"/>
<path class="dg-flow" d="M116 92H156V170H196"/><path class="dg-flow-sig" d="M116 268H156V190H196"/>
<path class="dg-flow" d="M316 170H354V84H392"/><path class="dg-flow-sig" d="M316 190H354V272H392"/>
<!-- scope trace -->
<rect class="dg-box" x="196" y="270" width="120" height="50" rx="4"/>
<path class="dg-wave" d="M200 296c6 0 6-14 12-14s6 28 12 28 6-28 12-28 6 28 12 28 6-28 12-28 6 28 12 28 6-14 12-14 6 0 12 0"/>
<text class="dg-sub" x="200" y="266">CH1 · 2.4 GHz RSSI</text>
<text class="dg-sub" x="20" y="30">// hexworks reference stack</text>
<text class="dg-sub" x="430" y="30">REV C</text>
</svg>`);

export async function homeView() {
  const all = await api.all();
  const projects = all.project;
  const featured = projects.filter((p) => p.featured).slice(0, 6);
  const featuredList = featured.length ? featured : projects.slice(0, 3);
  const benchProjects = projects.filter((p) => p.on_bench).slice(0, 5);
  const benchDetails = await Promise.all(benchProjects.map((p) => api.get('project', p.slug).catch(() => null)));
  benchProjects.forEach((p, i) => (p._lastUpdate = benchDetails[i]?.updates?.[0]));
  const notes = all.note.slice(0, 3);
  const products = all.product.slice(0, 3);
  const projectById = new Map(projects.map((p) => [p.id, p]));
  const labCount = (slug) => projects.filter((p) => p.lab === slug).length;
  const liveCount = projects.filter((p) => LIVE_STATUSES.includes(p.status)).length;

  return {
    title: '',
    description: config.description,
    html: html`
<section class="hero"><div class="wrap hero-grid">
  <div>
    <div class="eyebrow">Independent lab · est. 2025</div>
    <h1>Applied Cyber <span class="dim">R&amp;D</span></h1>
    <p class="tagline">Research.<span>/</span>Build.<span>/</span>Break.<span>/</span>Improve.</p>
    <p class="lede">We research unusual cybersecurity problems and build the tools, hardware, experiments, and prototypes needed to solve them — then publish what we learn.</p>
    <div class="hero-cta">
      <a class="btn btn-primary btn-lg" href="projects">Explore Projects ${icon('arrow')}</a>
      <a class="btn btn-lg" href="products">See Products</a>
      <a class="btn btn-ghost btn-lg" href="submit">Submit a Problem</a>
    </div>
    <div class="row readout" style="margin-top:28px;gap:18px">
      <span><b>${projects.length}</b> projects</span><span><b>${liveCount}</b> in active development</span><span><b>${all.note.length}</b> research notes</span>
    </div>
  </div>
  <div class="hero-diagram reveal"><div class="diag-head"><span>FIG. 1 — FROM IDEA TO SYSTEM</span><span style="color:var(--ok)">● LIVE</span></div>${heroDiagram()}</div>
</div></section>

<section class="section"><div class="wrap">
  ${sectionHead('Featured', 'Projects worth a closer look', 'Prototypes, tools and studies from across the lab — each with its architecture, limitations and full development log.', { href: 'projects', label: 'All projects' })}
  <div class="grid grid-3">${featuredList.map((p) => html`<div class="reveal">${projectCard(p)}</div>`)}</div>
</div></section>

<section class="section" style="border-top:1px solid var(--line);background:var(--bg-2)"><div class="wrap">
  ${sectionHead('Divisions', 'Four labs, one bench', 'Every project belongs to one lab. Most borrow from the others.')}
  <div class="grid grid-4">${LABS.map((l, i) => html`<a class="card lab-tile reveal" href="${link(`/projects?lab=${l.slug}`)}">
    <span class="lab-ix">LAB-0${i + 1}</span>${icon(l.icon, 'lab-icon')}<h3>${l.name}</h3><p>${l.text}</p>
    <span class="count">${labCount(l.slug)} project${labCount(l.slug) === 1 ? '' : 's'} →</span></a>`)}</div>
</div></section>

<section class="section"><div class="wrap">
  ${sectionHead('Live', 'Currently on the Bench', 'What is physically on the workbench right now, and the latest entry from each lab notebook.', { href: 'lab', label: 'Lab status' })}
  ${benchProjects.length ? html`<div class="bench">${benchProjects.map((p) => html`<div class="reveal">${benchItem(p)}</div>`)}</div>` : html`<p class="muted">The bench is clear.</p>`}
</div></section>

<section class="section" style="border-top:1px solid var(--line)"><div class="wrap">
  <div class="process reveal">
    <div><b>01 · RESEARCH</b><h3>Find the real problem</h3><p>Start from an unusual question, not a product category.</p></div>
    <div><b>02 · BUILD</b><h3>Prototype quickly</h3><p>Firmware, PCBs, pipelines — whatever the problem needs.</p></div>
    <div><b>03 · BREAK</b><h3>Test it honestly</h3><p>Measure failure modes on owned, isolated systems.</p></div>
    <div><b>04 · IMPROVE</b><h3>Publish and iterate</h3><p>Notes, limitations and logs go public with the code.</p></div>
  </div>
</div></section>

${notes.length ? html`<section class="section" style="border-top:1px solid var(--line);background:var(--bg-2)"><div class="wrap">
  ${sectionHead('Notebook', 'Latest research notes', 'Short, standalone findings — measurements, observations and failed experiments.', { href: 'research', label: 'All notes' })}
  <div class="grid grid-3">${notes.map((n) => html`<div class="reveal">${noteCard(n, projectById.get(n.project_id))}</div>`)}</div>
</div></section>` : ''}

${products.length ? html`<section class="section"><div class="wrap">
  ${sectionHead('Products', 'Prototypes that graduated', 'Hardware, open-source tools, training systems and research kits.', { href: 'products', label: 'Product gallery' })}
  <div class="grid grid-3">${products.map((p) => html`<div class="reveal">${productCard(p)}</div>`)}</div>
</div></section>` : ''}

<section class="section" style="border-top:1px solid var(--line)"><div class="wrap">
  <div class="form-card cta-band reveal">
    <div>
      <div class="eyebrow">Open intake</div>
      <h2 style="margin-bottom:8px">Have a strange security problem?</h2>
      <p class="muted" style="margin:0;max-width:60ch">If the honest answer so far has been "nobody makes a tool for that", we would like to hear about it. ${statusBadge('IDEA')} is where every project here started.</p>
    </div>
    <a class="btn btn-primary btn-lg" href="submit">Submit a Problem ${icon('arrow')}</a>
  </div>
</div></section>`,
  };
}
