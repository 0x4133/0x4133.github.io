/* Ops Timeline — plain JS, no dependencies. All data lives in this browser's localStorage. */
(() => {
  'use strict';

  const STORAGE_KEY = 'opsTimeline.entries.v1';
  const PREFS_KEY = 'opsTimeline.prefs.v1';
  const TAGS = ['Note', 'Alert', 'Incident', 'Change', 'Action', 'Escalation', 'Handoff'];
  const DOW = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const UNDO_MS = 8000;
  // "14:32 text", "1432 text", "14:32 - text"
  const TIME_PREFIX = /^(?:(\d{1,2}):(\d{2})|(\d{2})(\d{2}))(?:\s*[-–—:]\s*|\s+)/;

  const $ = (sel) => document.querySelector(sel);
  const pad = (n) => String(n).padStart(2, '0');

  let entries = loadEntries();
  const prefs = Object.assign({ utc: false, newestFirst: true }, loadJSON(PREFS_KEY, {}));
  const filters = { q: '', tag: '', day: '' };
  let editingId = null;
  let undo = null;

  /* ---------- storage ---------- */
  function loadJSON(key, fallback) {
    try {
      const v = JSON.parse(localStorage.getItem(key));
      return v == null ? fallback : v;
    } catch {
      return fallback;
    }
  }
  function loadEntries() {
    const v = loadJSON(STORAGE_KEY, []);
    return Array.isArray(v) ? v.filter(isEntry) : [];
  }
  function saveEntries() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
    } catch (err) {
      toast('Save failed: ' + err.message);
    }
  }
  function savePrefs() {
    try { localStorage.setItem(PREFS_KEY, JSON.stringify(prefs)); } catch { /* ignore */ }
  }
  function isEntry(e) {
    return !!e && typeof e === 'object'
      && typeof e.id === 'string' && typeof e.ts === 'string' && typeof e.text === 'string'
      && !Number.isNaN(Date.parse(e.ts));
  }
  function uid() {
    return (typeof crypto !== 'undefined' && crypto.randomUUID)
      ? crypto.randomUUID()
      : Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 10);
  }

  /* ---------- time helpers ---------- */
  function parts(d) {
    const u = prefs.utc;
    return {
      y: u ? d.getUTCFullYear() : d.getFullYear(),
      m: (u ? d.getUTCMonth() : d.getMonth()) + 1,
      d: u ? d.getUTCDate() : d.getDate(),
      hh: u ? d.getUTCHours() : d.getHours(),
      mm: u ? d.getUTCMinutes() : d.getMinutes(),
    };
  }
  function dayKey(d) { const p = parts(d); return `${p.y}-${pad(p.m)}-${pad(p.d)}`; }
  function timeStr(d) { const p = parts(d); return `${pad(p.hh)}:${pad(p.mm)}`; }
  function dayLabel(key) {
    const [y, m, d] = key.split('-').map(Number);
    return `${DOW[new Date(Date.UTC(y, m - 1, d)).getUTCDay()]} ${key}`;
  }
  function tzLabel() { return prefs.utc ? 'UTC' : 'local'; }
  // datetime-local inputs always speak local time
  function toInputValue(d) {
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }

  // If the note starts with a time, use it (today in the display timezone; yesterday if that would be in the future).
  function extractTime(text, now) {
    const m = TIME_PREFIX.exec(text);
    if (!m) return null;
    const hh = Number(m[1] ?? m[3]);
    const mm = Number(m[2] ?? m[4]);
    if (hh > 23 || mm > 59) return null;
    const d = new Date(now);
    if (prefs.utc) d.setUTCHours(hh, mm, 0, 0); else d.setHours(hh, mm, 0, 0);
    if (d.getTime() - now.getTime() > 5 * 60 * 1000) {
      if (prefs.utc) d.setUTCDate(d.getUTCDate() - 1); else d.setDate(d.getDate() - 1);
    }
    return { ts: d, text: text.slice(m[0].length) };
  }

  function composeTimestamp(text, manual) {
    const now = new Date();
    if (manual) {
      const d = new Date(manual);
      if (!Number.isNaN(d.getTime())) return { ts: d, text, source: 'time field' };
    }
    const p = extractTime(text, now);
    if (p) return { ts: p.ts, text: p.text, source: 'note prefix' };
    return { ts: now, text, source: 'now' };
  }

  /* ---------- DOM helpers ---------- */
  function el(tag, attrs = {}, ...children) {
    const node = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs)) {
      if (v == null || v === false) continue;
      if (k === 'class') node.className = v;
      else if (k.startsWith('data-')) node.dataset[k.slice(5)] = v;
      else node.setAttribute(k, v === true ? '' : v);
    }
    node.append(...children.filter((c) => c != null));
    return node;
  }
  function tagSelect(selected) {
    const s = el('select', { title: 'Category' });
    for (const t of TAGS) s.append(el('option', { value: t, selected: t === selected }, t));
    return s;
  }
  function slug(tag) { return String(tag || 'note').toLowerCase().replace(/[^a-z0-9]+/g, '-'); }

  let toastTimer = null;
  function toast(msg, action) {
    const t = $('#toast');
    t.replaceChildren(msg);
    if (action) {
      const b = el('button', { type: 'button' }, action.label);
      b.addEventListener('click', () => { action.onClick(); hideToast(); });
      t.append(b);
    }
    t.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(hideToast, action ? UNDO_MS : 2500);
  }
  function hideToast() { $('#toast').classList.remove('show'); }

  /* ---------- querying ---------- */
  function visibleEntries() {
    const q = filters.q.trim().toLowerCase();
    return entries.filter((e) =>
      (!filters.tag || e.tag === filters.tag)
      && (!filters.day || dayKey(new Date(e.ts)) === filters.day)
      && (!q || e.text.toLowerCase().includes(q) || String(e.tag || '').toLowerCase().includes(q)));
  }
  function groupByDay(list, newestFirst) {
    const sorted = list.slice().sort((a, b) => Date.parse(a.ts) - Date.parse(b.ts));
    if (newestFirst) sorted.reverse();
    const groups = new Map();
    for (const e of sorted) {
      const k = dayKey(new Date(e.ts));
      if (!groups.has(k)) groups.set(k, []);
      groups.get(k).push(e);
    }
    return groups; // insertion order already follows sort order
  }

  /* ---------- rendering ---------- */
  function render() {
    const list = visibleEntries();
    const root = $('#timeline');
    root.replaceChildren();

    $('#count').textContent = list.length === entries.length
      ? `${entries.length} entr${entries.length === 1 ? 'y' : 'ies'}`
      : `${list.length} of ${entries.length} shown`;

    if (!entries.length) {
      root.append(el('p', { class: 'empty' }, 'No entries yet. Add the first one above.'));
      return;
    }
    if (!list.length) {
      root.append(el('p', { class: 'empty' }, 'Nothing matches the current filters.'));
      return;
    }

    for (const [key, items] of groupByDay(list, prefs.newestFirst)) {
      const ol = el('ol', { class: 'entries' });
      for (const e of items) ol.append(entryEl(e));
      root.append(el('article', { class: 'day' },
        el('header', { class: 'day-header' },
          el('h2', {}, dayLabel(key)),
          el('span', { class: 'muted' }, `${items.length} entr${items.length === 1 ? 'y' : 'ies'}`),
          el('span', { class: 'spacer' }),
          el('button', { type: 'button', 'data-day': key, title: 'Copy this day as Markdown' }, 'Copy day')),
        ol));
    }
  }

  function entryEl(e) {
    const d = new Date(e.ts);
    const li = el('li', { class: 'entry tag-' + slug(e.tag), 'data-id': e.id });
    if (editingId === e.id) {
      li.append(editForm(e));
      return li;
    }
    const meta = [`Occurred ${d.toString()}`];
    if (e.logged) meta.push(`Logged ${new Date(e.logged).toLocaleString()}`);
    if (e.edited) meta.push(`Edited ${new Date(e.edited).toLocaleString()}`);
    li.append(
      el('time', { datetime: e.ts, title: meta.join('\n') }, timeStr(d)),
      el('span', { class: 'badge' }, e.tag || 'Note'),
      el('div', { class: 'text' }, e.text),
      el('div', { class: 'actions' },
        el('button', { type: 'button', 'data-act': 'edit' }, 'Edit'),
        el('button', { type: 'button', 'data-act': 'del', class: 'danger' }, 'Delete')));
    return li;
  }

  function editForm(e) {
    const form = el('form', { class: 'edit' });
    const text = el('textarea', { rows: 3 });
    text.value = e.text;
    const time = el('input', { type: 'datetime-local', value: toInputValue(new Date(e.ts)), title: 'Timestamp (local time)' });
    const tag = tagSelect(e.tag || 'Note');
    form.append(text, el('div', { class: 'row' },
      tag, time,
      el('span', { class: 'spacer' }),
      el('button', { type: 'button', 'data-act': 'cancel' }, 'Cancel'),
      el('button', { type: 'submit', class: 'primary' }, 'Save')));
    form.addEventListener('submit', (ev) => {
      ev.preventDefault();
      const t = text.value.trim();
      if (!t) return;
      const d = new Date(time.value);
      if (Number.isNaN(d.getTime())) { toast('Invalid timestamp'); return; }
      Object.assign(e, { text: t, tag: tag.value, ts: d.toISOString(), edited: new Date().toISOString() });
      editingId = null;
      saveEntries();
      render();
      toast('Entry updated');
    });
    text.addEventListener('keydown', (ev) => {
      if (ev.key === 'Enter' && (ev.ctrlKey || ev.metaKey)) { ev.preventDefault(); form.requestSubmit(); }
      if (ev.key === 'Escape') { editingId = null; render(); }
    });
    queueMicrotask(() => text.focus());
    return form;
  }

  function removeEntry(e) {
    const idx = entries.indexOf(e);
    if (idx < 0) return;
    entries.splice(idx, 1);
    saveEntries();
    render();
    undo = { entry: e, idx };
    toast('Entry deleted', {
      label: 'Undo',
      onClick: () => {
        if (!undo) return;
        entries.splice(Math.min(undo.idx, entries.length), 0, undo.entry);
        undo = null;
        saveEntries();
        render();
      },
    });
  }

  /* ---------- export / import ---------- */
  function toMarkdown(list, title) {
    const now = new Date();
    const lines = [`# ${title}`, `_Times in ${tzLabel()} · exported ${dayKey(now)} ${timeStr(now)}_`, ''];
    for (const [key, items] of groupByDay(list, false)) {
      lines.push(`## ${dayLabel(key)}`, '');
      for (const e of items) {
        const [first, ...rest] = e.text.split('\n');
        lines.push(`- **${timeStr(new Date(e.ts))}** [${e.tag || 'Note'}] ${first}`);
        for (const r of rest) lines.push(`  ${r}`);
      }
      lines.push('');
    }
    return lines.join('\n');
  }

  function download(name, content, type) {
    const url = URL.createObjectURL(new Blob([content], { type }));
    const a = el('a', { href: url, download: name });
    document.body.append(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  async function copyText(text) {
    try {
      await navigator.clipboard.writeText(text);
      toast('Copied to clipboard');
    } catch {
      const ta = el('textarea', { style: 'position:fixed;opacity:0' });
      ta.value = text;
      document.body.append(ta);
      ta.select();
      const ok = document.execCommand('copy');
      ta.remove();
      toast(ok ? 'Copied to clipboard' : 'Copy failed');
    }
  }

  function importEntries(data) {
    const list = Array.isArray(data) ? data : (data && Array.isArray(data.entries) ? data.entries : null);
    if (!list) throw new Error('no entries array found');
    const byId = new Map(entries.map((e) => [e.id, e]));
    let added = 0;
    let updated = 0;
    for (const e of list) {
      if (!isEntry(e)) continue;
      if (byId.has(e.id)) { Object.assign(byId.get(e.id), e); updated++; }
      else { entries.push(e); byId.set(e.id, e); added++; }
    }
    return { added, updated };
  }

  /* ---------- composer ---------- */
  function updatePreview() {
    const { ts, source } = composeTimestamp($('#noteText').value, $('#noteTime').value);
    $('#tsPreview').textContent = `Will log at ${dayLabel(dayKey(ts))} ${timeStr(ts)} ${tzLabel()} (${source})`;
  }

  function addEntry() {
    const raw = $('#noteText').value;
    if (!raw.trim()) return;
    const { ts, text } = composeTimestamp(raw, $('#noteTime').value);
    const body = text.trim();
    if (!body) { toast('Entry needs some text after the time'); return; }
    entries.push({ id: uid(), ts: ts.toISOString(), tag: $('#noteTag').value, text: body, logged: new Date().toISOString() });
    saveEntries();
    $('#noteText').value = '';
    $('#noteTime').value = '';
    render();
    updatePreview();
    $('#noteText').focus();
    toast('Entry added');
  }

  /* ---------- wiring ---------- */
  function init() {
    for (const t of TAGS) {
      $('#noteTag').append(el('option', { value: t }, t));
      $('#filterTag').append(el('option', { value: t }, t));
    }

    $('#utcToggle').checked = prefs.utc;
    $('#newestFirst').checked = prefs.newestFirst;
    $('#utcToggle').addEventListener('change', (ev) => { prefs.utc = ev.target.checked; savePrefs(); render(); updatePreview(); });
    $('#newestFirst').addEventListener('change', (ev) => { prefs.newestFirst = ev.target.checked; savePrefs(); render(); });

    $('#noteForm').addEventListener('submit', (ev) => { ev.preventDefault(); addEntry(); });
    $('#noteText').addEventListener('keydown', (ev) => {
      if (ev.key === 'Enter' && (ev.ctrlKey || ev.metaKey)) { ev.preventDefault(); addEntry(); }
    });
    $('#noteText').addEventListener('input', updatePreview);
    $('#noteTime').addEventListener('input', updatePreview);
    setInterval(updatePreview, 15000);

    $('#search').addEventListener('input', (ev) => { filters.q = ev.target.value; render(); });
    $('#filterTag').addEventListener('change', (ev) => { filters.tag = ev.target.value; render(); });
    $('#filterDay').addEventListener('change', (ev) => { filters.day = ev.target.value; render(); });
    $('#clearFilters').addEventListener('click', () => {
      filters.q = filters.tag = filters.day = '';
      $('#search').value = $('#filterTag').value = $('#filterDay').value = '';
      render();
    });

    $('#timeline').addEventListener('click', (ev) => {
      const btn = ev.target.closest('button');
      if (!btn) return;
      if (btn.dataset.day) {
        const day = btn.dataset.day;
        copyText(toMarkdown(entries.filter((e) => dayKey(new Date(e.ts)) === day), `Ops Timeline — ${dayLabel(day)}`));
        return;
      }
      const li = btn.closest('li[data-id]');
      const e = li && entries.find((x) => x.id === li.dataset.id);
      if (!e) return;
      if (btn.dataset.act === 'edit') { editingId = e.id; render(); }
      else if (btn.dataset.act === 'cancel') { editingId = null; render(); }
      else if (btn.dataset.act === 'del') removeEntry(e);
    });

    $('#exportMd').addEventListener('click', () => {
      const list = visibleEntries();
      if (!list.length) { toast('Nothing to export'); return; }
      download(`ops-timeline-${dayKey(new Date())}.md`, toMarkdown(list, 'Ops Timeline'), 'text/markdown');
    });
    $('#exportJson').addEventListener('click', () => {
      download(`ops-timeline-backup-${dayKey(new Date())}.json`,
        JSON.stringify({ version: 1, exported: new Date().toISOString(), entries }, null, 2),
        'application/json');
    });
    $('#importBtn').addEventListener('click', () => $('#importFile').click());
    $('#importFile').addEventListener('change', async (ev) => {
      const file = ev.target.files[0];
      if (!file) return;
      try {
        const { added, updated } = importEntries(JSON.parse(await file.text()));
        saveEntries();
        render();
        toast(`Imported: ${added} added, ${updated} updated`);
      } catch (err) {
        toast('Import failed: ' + err.message);
      }
      ev.target.value = '';
    });
    $('#clearAll').addEventListener('click', () => {
      if (!entries.length) return;
      if (!confirm(`Delete all ${entries.length} entries? Take a JSON backup first if you need them.`)) return;
      entries = [];
      editingId = null;
      saveEntries();
      render();
      toast('Timeline cleared');
    });

    // keep multiple tabs in sync
    window.addEventListener('storage', (ev) => {
      if (ev.key === STORAGE_KEY) { entries = loadEntries(); render(); }
    });

    render();
    updatePreview();
  }

  init();
})();
