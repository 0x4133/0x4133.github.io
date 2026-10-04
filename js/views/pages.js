import { config } from '../config.js';
import { api } from '../data/api.js';
import { html } from '../lib/dom.js';
import { LABS, icon, pageHead } from '../ui/components.js';

export async function aboutView() {
  const tax = await api.taxonomy();
  return {
    title: 'About',
    description: 'An independent applied cyber R&D lab focused on building practical prototypes instead of writing recommendations.',
    html: html`${pageHead({
      eyebrow: 'About the lab',
      title: 'We build the thing.',
      lede: `${config.companyName} is an independent applied cybersecurity R&D lab. Where a typical engagement ends with a report of recommendations, our work ends with a working prototype, a measured result, or a published negative finding.`,
      crumbs: [{ label: 'about' }],
    })}
<section class="section"><div class="wrap two-col" style="align-items:start;gap:48px">
  <div class="prose">
    <h2>What we do</h2>
    <p>We take unusual security problems — the ones that fall between product categories — and work them through research, prototyping and honest testing. The output is usually one of:</p>
    <ul>
      <li><strong>Prototypes</strong> — hardware, firmware and software built to answer a specific question.</li>
      <li><strong>Tools</strong> — SOC and detection-engineering tooling that analysts can run tomorrow.</li>
      <li><strong>Measurements</strong> — research notes with methods, numbers and limitations.</li>
      <li><strong>Products</strong> — the prototypes that survive long enough to be useful to others.</li>
    </ul>
    <h2>How we work</h2>
    <p>Everything is built and tested on equipment the lab owns, in isolated lab environments, or on systems where written authorisation has been granted. Development logs, limitations and security considerations are published alongside the work, including what did not work.</p>
    <h2>What we do not claim</h2>
    <p>We are a small lab. We do not offer 24/7 incident response, compliance certification or managed services, and many projects here are experiments with known limitations. Each project page says plainly what stage it is at.</p>
  </div>
  <div class="stack">
    ${LABS.map((l, i) => html`<div class="principle"><span class="n">LAB-0${i + 1}</span><h3 class="row" style="gap:10px">${icon(l.icon, 'lab-icon')} ${l.name}</h3><p>${l.text}</p></div>`)}
  </div>
</div></section>
<section class="section-tight" style="border-top:1px solid var(--line);background:var(--bg-2)"><div class="wrap">
  <div class="eyebrow">Areas of work</div>
  <h2 style="margin-bottom:20px">Where the lab spends its time</h2>
  <div class="chips">${['Cybersecurity engineering', 'Detection engineering', 'SOC tooling', 'Security automation', 'Embedded security', 'ESP32', 'Wi-Fi', 'Bluetooth / BLE', 'RF and SDR', 'IoT security', 'Network security', 'Hardware security', 'AI security', 'Cyber ranges', 'Threat research', 'Security telemetry', 'Experimental defensive technology'].map((a) => html`<span class="chip" style="font-size:.85rem;padding:7px 12px">${a}</span>`)}</div>
  <p class="muted small" style="margin-top:20px">Browse by <a href="technology" style="color:var(--signal)">technology</a> — ${tax.technologies.length} tracked.</p>
</div></section>
<section class="section"><div class="wrap center">
  <h2>Have something for the bench?</h2>
  <p class="muted" style="max-width:52ch;margin:0 auto 24px">We are always looking for problems that do not have a good answer yet.</p>
  <div class="row" style="justify-content:center"><a class="btn btn-primary btn-lg" href="submit">Submit a Problem</a><a class="btn btn-lg" href="contact">Contact</a></div>
</div></section>`,
  };
}

export function responsibleView() {
  const P = [
    ['Owned or authorised systems only', 'All research, experimentation and testing is performed on systems the lab owns, in isolated laboratory environments, or on systems where the owner has granted written authorisation.'],
    ['No unauthorised access services', 'We do not provide, sell or assist with access to systems, accounts, networks or devices without the owner’s permission. Requests of that kind are declined.'],
    ['RF and wireless discipline', 'Wireless work is receive-only unless performed inside RF-shielded enclosures or on licensed / lab-controlled channels, and always in line with local regulations.'],
    ['Metadata over content', 'Sensors and tools are designed to collect the minimum needed. Where possible we record metadata and statistics, not payloads or personal data.'],
    ['Coordinated disclosure', 'Vulnerabilities found in third-party products are reported privately to the vendor first, with a reasonable remediation window before publication.'],
    ['Publish limitations', 'Every project documents its known limitations and security considerations so others do not over-trust a prototype.'],
  ];
  return {
    title: 'Responsible Research',
    description: 'How the lab performs cybersecurity research responsibly: owned systems, lab environments and authorised testing only.',
    html: html`${pageHead({
      eyebrow: 'Policy',
      title: 'Responsible Research',
      lede: 'Security research only has value if it is done in a way people can trust. These are the rules every project in this lab follows.',
      crumbs: [{ label: 'responsible-research' }],
    })}
<section class="section"><div class="wrap">
  <div class="principles">${P.map(([t, d], i) => html`<div class="principle"><span class="n">${String(i + 1).padStart(2, '0')}</span><h3>${t}</h3><p>${d}</p></div>`)}</div>
</div></section>
<section class="section-tight" style="border-top:1px solid var(--line)"><div class="wrap prose-page prose">
  <h2>Working with us</h2>
  <p>If you submit a problem or engage the lab, we will ask you to confirm that you are authorised to request work on the systems involved. For anything that touches production systems we require written scope and authorisation before work begins.</p>
  <h2>Reporting a vulnerability in our work</h2>
  <p>Found a problem in one of our tools, firmware images or published code? Please email <a href="mailto:${config.contactEmail}">${config.contactEmail}</a> with details. Do not include credentials or live secrets in the report; we will arrange a secure channel if needed.</p>
  <h2>Never send secrets</h2>
  <p>We will never ask for passwords, API keys, tokens or private keys by email or through this website. If a message to us would contain one, leave it out.</p>
</div></section>`,
  };
}

export function notFoundView({ code = '404', title = 'Nothing on this bench', text = 'The page you asked for does not exist, is not public, or has moved.' } = {}) {
  return {
    title,
    noindex: true,
    html: html`<section class="wrap not-found"><div class="code">${code}</div><h1 style="font-size:1.6rem;margin-top:16px">${title}</h1><p class="muted">${text}</p>
      <div class="row" style="justify-content:center;margin-top:20px"><a class="btn btn-primary" href="projects">Browse projects</a><a class="btn" href="search">Search</a></div></section>`,
  };
}
