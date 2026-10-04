// Secure Markdown rendering: marked (GFM) -> DOMPurify -> highlight.js.
// Libraries are loaded as classic scripts from cdnjs in index.html.
import { esc } from './dom.js';

const PURIFY = {
  USE_PROFILE: { html: true },
  FORBID_TAGS: ['style', 'iframe', 'form', 'input', 'button', 'object', 'embed', 'script'],
  FORBID_ATTR: ['style'],
};

let hooked = false;
function hookPurify() {
  if (hooked || !window.DOMPurify) return;
  hooked = true;
  window.DOMPurify.addHook('afterSanitizeAttributes', (node) => {
    if (node.tagName === 'A' && /^https?:/i.test(node.getAttribute('href') || '')) {
      node.setAttribute('target', '_blank');
      node.setAttribute('rel', 'noopener noreferrer');
    }
    if (node.tagName === 'IMG') {
      node.setAttribute('loading', 'lazy');
      node.setAttribute('decoding', 'async');
    }
  });
}

export function renderMarkdown(md) {
  if (!md) return '';
  if (!window.marked || !window.DOMPurify) {
    // Libraries unavailable (offline / blocked CDN): render as escaped text.
    return `<pre class="md-fallback">${esc(md)}</pre>`;
  }
  hookPurify();
  const dirty = window.marked.parse(String(md), { gfm: true, breaks: false });
  return window.DOMPurify.sanitize(dirty, PURIFY);
}

// Call after inserting rendered markdown into the DOM.
export function enhanceMarkdown(root) {
  if (!root) return;
  root.querySelectorAll('pre code').forEach((el) => {
    if (window.hljs && !el.dataset.hl) {
      try { window.hljs.highlightElement(el); } catch { /* unknown language */ }
      el.dataset.hl = '1';
    }
    const pre = el.parentElement;
    if (pre && !pre.querySelector('.copy-btn')) {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'copy-btn';
      b.textContent = 'copy';
      b.addEventListener('click', () => {
        navigator.clipboard?.writeText(el.textContent).then(() => {
          b.textContent = 'copied';
          setTimeout(() => (b.textContent = 'copy'), 1200);
        });
      });
      pre.appendChild(b);
    }
  });
  root.querySelectorAll('table').forEach((t) => {
    if (!t.parentElement.classList.contains('table-wrap')) {
      const w = document.createElement('div');
      w.className = 'table-wrap';
      t.replaceWith(w);
      w.appendChild(t);
    }
  });
}

// Plain-text excerpt for search indexes and meta descriptions.
export function mdToText(md, max = 400) {
  return String(md ?? '')
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`([^`]*)`/g, '$1')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/[#>*_|~-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, max);
}
