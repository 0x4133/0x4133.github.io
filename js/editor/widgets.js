// Form widgets for the content editor: markdown editor, tag input, image field.
import { html, raw, $, $$, slugify, safeImg, toast } from '../lib/dom.js';
import { renderMarkdown, enhanceMarkdown } from '../lib/markdown.js';
import { icon } from '../ui/components.js';
import { uploadImage } from './save.js';

// ---------------------------------------------------------------------------
// Markdown editor
// ---------------------------------------------------------------------------
const MD = [
  ['H', 'Heading', (s) => ['\n## ', s || 'Heading', '']],
  ['B', 'Bold', (s) => ['**', s || 'bold', '**']],
  ['I', 'Italic', (s) => ['_', s || 'italic', '_']],
  ['sep'],
  ['`', 'Inline code', (s) => ['`', s || 'code', '`']],
  ['{ }', 'Code block', (s) => ['\n```text\n', s || 'code', '\n```\n']],
  ['❝', 'Quote', (s) => ['\n> ', s || 'quote', '']],
  ['sep'],
  ['•', 'List', (s) => ['\n- ', s || 'item', '']],
  ['▦', 'Table', () => ['\n| Column | Value |\n|---|---|\n| ', 'cell', ' | cell |\n']],
  ['↗', 'Link', (s) => ['[', s || 'text', '](https://)']],
  ['▣', 'Image URL', (s) => ['![', s || 'alt', '](https://)']],
];

export function markdownEditor(name, value = '', { rows = 7 } = {}) {
  return html`<div class="mde" data-mde>
  <div class="mde-bar" role="toolbar" aria-label="Formatting">
    ${MD.map((a, i) => (a[0] === 'sep' ? html`<span class="sep"></span>` : html`<button type="button" data-md="${i}" title="${a[1]}" aria-label="${a[1]}">${a[0]}</button>`))}
    <button type="button" data-md-up title="Upload image">${icon('upload')}</button>
    <input type="file" accept="image/*" hidden data-md-file>
    <span class="tabs"><button type="button" data-tab="write" aria-pressed="true">Write</button><button type="button" data-tab="preview" aria-pressed="false">Preview</button></span>
  </div>
  <textarea name="${name}" rows="${rows}" spellcheck="true">${value || ''}</textarea>
  <div class="mde-preview prose" hidden></div>
</div>`;
}

function insert(ta, [before, sel, after]) {
  const { selectionStart: a, selectionEnd: b, value } = ta;
  const mid = value.slice(a, b) || sel;
  ta.value = value.slice(0, a) + before + mid + after + value.slice(b);
  ta.focus();
  ta.setSelectionRange(a + before.length, a + before.length + mid.length);
}

function mountEditors(root) {
  $$('[data-mde]', root).forEach((ed) => {
    if (ed.dataset.ready) return;
    ed.dataset.ready = '1';
    const ta = $('textarea', ed);
    const pv = $('.mde-preview', ed);
    const file = $('[data-md-file]', ed);
    ed.addEventListener('click', (e) => {
      const b = e.target.closest('button');
      if (!b) return;
      if (b.dataset.md !== undefined) insert(ta, MD[+b.dataset.md][2](ta.value.slice(ta.selectionStart, ta.selectionEnd)));
      else if (b.dataset.mdUp !== undefined) file.click();
      else if (b.dataset.tab) {
        const prev = b.dataset.tab === 'preview';
        $$('[data-tab]', ed).forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
        ta.hidden = prev;
        pv.hidden = !prev;
        if (prev) { pv.innerHTML = renderMarkdown(ta.value) || '<p class="muted">Nothing to preview.</p>'; enhanceMarkdown(pv); }
      }
    });
    file.addEventListener('change', async () => {
      const f = file.files[0];
      if (!f) return;
      try { const { url } = await uploadImage(f); insert(ta, ['![', f.name.replace(/\.[^.]+$/, ''), `](${url})`]); toast('Image inserted', 'ok'); }
      catch (err) { toast(err.message, 'error'); }
      file.value = '';
    });
    ta.addEventListener('keydown', (e) => { if (e.key === 'Tab' && !e.shiftKey) { e.preventDefault(); insert(ta, ['  ', '', '']); } });
  });
}

// ---------------------------------------------------------------------------
// Tag input (hidden input holds a JSON array of slugs)
// ---------------------------------------------------------------------------
export function tagInput(name, values = [], suggestions = [], label = name) {
  const id = `dl-${name}-${Math.random().toString(36).slice(2, 7)}`;
  return html`<div class="tag-input" data-tags>
  <input type="hidden" name="${name}" value="${JSON.stringify(values || [])}">
  ${(values || []).map((v) => html`<span class="chip" data-v="${v}">${v}<button type="button" aria-label="Remove ${v}">×</button></span>`)}
  <input type="text" list="${id}" placeholder="Add ${label}… (Enter)" aria-label="Add ${label}">
  <datalist id="${id}">${suggestions.map((s) => html`<option value="${s}"></option>`)}</datalist>
</div>`;
}

function mountTags(root) {
  $$('[data-tags]', root).forEach((box) => {
    if (box.dataset.ready) return;
    box.dataset.ready = '1';
    const hidden = $('input[type="hidden"]', box);
    const input = $('input[type="text"]', box);
    const read = () => JSON.parse(hidden.value || '[]');
    const write = (a) => (hidden.value = JSON.stringify(a));
    const add = (rawv) => {
      const v = slugify(rawv);
      if (!v || read().includes(v)) return;
      write([...read(), v]);
      input.insertAdjacentHTML('beforebegin', String(html`<span class="chip" data-v="${v}">${v}<button type="button" aria-label="Remove ${v}">×</button></span>`));
    };
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); add(input.value); input.value = ''; }
      else if (e.key === 'Backspace' && !input.value) { const a = read(); const last = a.pop(); write(a); box.querySelector(`.chip[data-v="${CSS.escape(last || '')}"]`)?.remove(); }
    });
    input.addEventListener('blur', () => { if (input.value) { add(input.value); input.value = ''; } });
    box.addEventListener('click', (e) => {
      const b = e.target.closest('.chip button');
      if (!b) { if (e.target === box) input.focus(); return; }
      write(read().filter((x) => x !== b.parentElement.dataset.v));
      b.parentElement.remove();
    });
  });
}

// ---------------------------------------------------------------------------
// Image field (path/URL + upload + preview)
// ---------------------------------------------------------------------------
export function imageField(name, value = '') {
  const src = safeImg(value);
  return html`<div class="image-field" data-image>
  <div class="preview">${src ? html`<img src="${src}" alt="">` : 'NO IMAGE'}</div>
  <div class="stack">
    <input type="text" name="${name}" value="${value || ''}" placeholder="assets/your-image.jpg or https://…" class="mono">
    <label class="drop">${icon('upload')} Drop an image or click to upload<input type="file" accept="image/*" hidden></label>
    <button type="button" class="btn btn-sm btn-ghost" data-clear-img>Remove image</button>
  </div>
</div>`;
}

function mountImages(root) {
  $$('[data-image]', root).forEach((box) => {
    if (box.dataset.ready) return;
    box.dataset.ready = '1';
    const url = $('input[type="text"]', box);
    const preview = $('.preview', box);
    const file = $('input[type="file"]', box);
    const drop = $('.drop', box);
    const set = (v) => { url.value = v; const s = safeImg(v); preview.innerHTML = s ? String(html`<img src="${s}" alt="">`) : 'NO IMAGE'; };
    const up = async (f) => {
      if (!f || !f.type.startsWith('image/')) return toast('Choose an image file', 'error');
      try { drop.textContent = 'Uploading…'; const r = await uploadImage(f); set(r.url); toast('Image uploaded to ' + r.url, 'ok'); }
      catch (err) { toast(err.message, 'error'); }
      drop.innerHTML = String(html`${icon('upload')} Drop an image or click to upload`);
      drop.appendChild(file);
    };
    url.addEventListener('change', () => set(url.value.trim()));
    file.addEventListener('change', () => up(file.files[0]));
    drop.addEventListener('dragover', (e) => { e.preventDefault(); drop.classList.add('over'); });
    drop.addEventListener('dragleave', () => drop.classList.remove('over'));
    drop.addEventListener('drop', (e) => { e.preventDefault(); drop.classList.remove('over'); up(e.dataTransfer.files[0]); });
    box.addEventListener('click', (e) => { if (e.target.closest('[data-clear-img]')) set(''); });
  });
}

export function mountWidgets(root) {
  mountEditors(root);
  mountTags(root);
  mountImages(root);
}
