// Submit-a-Problem and Contact forms.
// There is no backend: submitting opens the visitor's email client with a
// pre-filled message addressed to config.contactEmail.
import { config } from '../config.js';
import { html, $ } from '../lib/dom.js';
import { icon, pageHead } from '../ui/components.js';

const BUDGETS = ['Not sure yet', '< $5k', '$5k – $15k', '$15k – $50k', '$50k+', 'Research collaboration (unfunded)'];
const TIMELINES = ['Exploratory / no deadline', '1–3 months', '3–6 months', '6+ months', 'Urgent (< 1 month)'];
const TOPICS = [
  ['prototype-development', 'Prototype development'],
  ['research-collaboration', 'Research collaboration'],
  ['security-engineering', 'Security engineering'],
  ['product-development', 'Product development'],
  ['cybersecurity-tooling', 'Cybersecurity tooling'],
  ['embedded-wireless', 'Embedded / wireless projects'],
];

const noSecrets = html`<div class="callout danger">${icon('alert')}<div><strong>Do not include secrets.</strong> Never send passwords, API keys, tokens, private keys, VPN configs or other credentials. We will never ask for them. Describe systems in general terms; details can be exchanged securely later if work proceeds.</div></div>`;

const sentPanel = (title) => html`<div class="form-card center" style="padding:48px 24px">
  <div class="eyebrow" style="justify-content:center">Almost there</div>
  <h2>${title}</h2>
  <p class="muted" style="max-width:54ch;margin:0 auto 20px">Your email app should have opened with the message ready — just press send. If nothing opened, email <a href="mailto:${config.contactEmail}" style="color:var(--signal)">${config.contactEmail}</a> directly.</p>
  <a class="btn" href="./">Back to the lab</a></div>`;

function wireMailForm(root, { subject, body, done }) {
  const form = $('form', root);
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!form.reportValidity()) return;
    const fd = new FormData(form);
    const get = (k) => String(fd.get(k) || '').trim();
    const url = `mailto:${config.contactEmail}?subject=${encodeURIComponent(subject(get))}&body=${encodeURIComponent(body(get))}`;
    window.location.href = url;
    $('#form-host', root).innerHTML = String(done);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

export function submitView() {
  return {
    title: 'Submit a Problem',
    description: 'Send Hexworks an unusual cybersecurity or engineering problem. We build prototypes, not slide decks.',
    html: html`${pageHead({
      eyebrow: 'Open intake',
      title: 'Submit a Problem',
      lede: 'Businesses, researchers and individuals: tell us about an unusual cybersecurity or engineering problem. The more specific and strange, the better.',
      crumbs: [{ label: 'submit' }],
    })}
<section class="section-tight"><div class="wrap" style="max-width:880px" id="form-host">
  <div class="stack" style="margin-bottom:24px">
    ${noSecrets}
    <div class="callout signal">${icon('shield')}<div>We only take on work involving systems you own or are authorised to have tested. See <a href="responsible-research" style="color:var(--signal);text-decoration:underline">Responsible Research</a>.</div></div>
  </div>
  <form class="form-card form">
    <div class="form-grid">
      <div class="field"><label for="f-name">Name *</label><input id="f-name" name="name" type="text" required maxlength="200" autocomplete="name"></div>
      <div class="field"><label for="f-org">Organization</label><input id="f-org" name="organization" type="text" maxlength="200" autocomplete="organization"></div>
      <div class="field full"><label for="f-desc">Problem description *</label><textarea id="f-desc" name="description" required minlength="10" rows="6" placeholder="What is happening, where, and why existing tools do not solve it."></textarea></div>
      <div class="field full"><label for="f-tried">What you have already tried</label><textarea id="f-tried" name="tried" rows="4"></textarea></div>
      <div class="field full"><label for="f-out">Desired outcome</label><textarea id="f-out" name="outcome" rows="3" placeholder="A working prototype? A measurement study? A tool your team can run?"></textarea></div>
      <div class="field"><label for="f-budget">Budget range</label><select id="f-budget" name="budget">${BUDGETS.map((b) => html`<option>${b}</option>`)}</select></div>
      <div class="field"><label for="f-time">Timeline</label><select id="f-time" name="timeline">${TIMELINES.map((t) => html`<option>${t}</option>`)}</select></div>
      <div class="field full"><label class="check"><input type="checkbox" name="authorized" required> <span>I am authorized to request work involving the systems described. *</span></label></div>
    </div>
    <div class="row-between"><span class="muted small">Opens your email app · * required</span><button class="btn btn-primary btn-lg" type="submit">Compose email ${icon('arrow')}</button></div>
  </form>
</div></section>`,
    mount(root) {
      wireMailForm(root, {
        subject: (g) => `Problem submission — ${g('organization') || g('name')}`,
        body: (g) => [
          `Name: ${g('name')}`,
          `Organization: ${g('organization') || '—'}`,
          `Budget: ${g('budget')}`,
          `Timeline: ${g('timeline')}`,
          'Authorized to request work on the systems described: yes',
          '', 'PROBLEM', g('description'),
          '', 'ALREADY TRIED', g('tried') || '—',
          '', 'DESIRED OUTCOME', g('outcome') || '—',
        ].join('\n'),
        done: sentPanel('Your email is ready to send'),
      });
    },
  };
}

export function contactView({ query }) {
  const pre = TOPICS.some(([k]) => k === query.topic) ? query.topic : TOPICS[0][0];
  const ref = query.ref ? `Regarding: ${query.ref}\n\n` : '';
  return {
    title: 'Contact',
    description: 'Contact Hexworks LLC about prototype development, research collaboration, security engineering, tooling and embedded / wireless work.',
    html: html`${pageHead({
      eyebrow: 'Contact',
      title: 'Talk to the lab',
      lede: 'Prototype development, research collaboration, security engineering, product development, tooling, and embedded or wireless projects.',
      crumbs: [{ label: 'contact' }],
    })}
<section class="section-tight"><div class="wrap" style="max-width:880px" id="form-host">
  <form class="form-card form">
    <fieldset style="border:0;padding:0;margin:0" class="field full">
      <legend class="label" style="margin-bottom:10px">What is this about?</legend>
      <div class="option-grid">${TOPICS.map(([k, l]) => html`<label><input type="radio" name="topic" value="${l}" ${k === pre ? 'checked' : ''}>${l}</label>`)}</div>
    </fieldset>
    <div class="form-grid">
      <div class="field"><label for="c-name">Name *</label><input id="c-name" name="name" type="text" required maxlength="200" autocomplete="name"></div>
      <div class="field"><label for="c-org">Organization</label><input id="c-org" name="organization" type="text" maxlength="200"></div>
      <div class="field full"><label for="c-msg">Message *</label><textarea id="c-msg" name="message" required minlength="10" rows="7">${ref}</textarea></div>
    </div>
    ${noSecrets}
    <div class="row-between"><a class="muted small" href="mailto:${config.contactEmail}">${config.contactEmail}</a><button class="btn btn-primary btn-lg" type="submit">Compose email ${icon('arrow')}</button></div>
  </form>
</div></section>`,
    mount(root) {
      wireMailForm(root, {
        subject: (g) => `${g('topic')} — ${g('organization') || g('name')}`,
        body: (g) => `${g('message')}\n\n— ${g('name')}${g('organization') ? `, ${g('organization')}` : ''}`,
        done: sentPanel('Your email is ready to send'),
      });
    },
  };
}
