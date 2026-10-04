// Deterministic, procedural technical illustrations used as cover art
// whenever a project, product or note has no uploaded photo.
// Every drawing is seeded by the item slug so it is stable across visits.
// Colors come from CSS classes (.art-*) so they follow the active theme.

function rng(seed) {
  let h = 1779033703 ^ seed.length;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(h ^ seed.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  let a = h >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const W = 640;
const H = 360;
const r1 = (n) => Math.round(n * 10) / 10;
const xmlEsc = (s) => String(s).replace(/[<>&"]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;' }[c]));

// Map categories / technologies to an illustration style.
export function artKindFor(item = {}) {
  const hay = [item.category, item.lab, item.kind, ...(item.technologies || []), ...(item.tags || [])]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
  if (/\b(ai|llm|ml|machine-learning|ai-security)\b/.test(hay)) return 'ai';
  if (/\b(sdr|rf|hackrf|rtl-sdr|spectrum|433mhz|lora|sub-ghz)\b/.test(hay)) return 'rf';
  if (/\b(esp32|embedded|hardware|pcb|iot|firmware|esp32-c6|esp32-s3|appliance|research-kit)\b/.test(hay)) return 'pcb';
  if (/\b(wifi|wi-fi|ble|bluetooth|zigbee|thread|wireless)\b/.test(hay)) return 'rf';
  if (/\b(research|measurement|oscilloscope|power)\b/.test(hay)) return 'scope';
  if (/\b(soc|splunk|detection|siem|soar|automation|network|training|cyber-range)\b/.test(hay)) return 'net';
  return 'term';
}

function frame(inner, label, code) {
  return `<svg class="art" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
<rect class="art-bg" width="${W}" height="${H}"/>
<g class="art-grid">${gridLines(32)}</g>
${inner}
<g class="art-label"><text x="20" y="${H - 18}">${xmlEsc(code ? code + '  ·  ' : '')}${xmlEsc(label || '')}</text></g>
<g class="art-corners"><path d="M12 28V12h16M${W - 28} 12h16v16M12 ${H - 28}v16h16M${W - 28} ${H - 12}h16v-16"/></g>
</svg>`;
}

function gridLines(step) {
  let d = '';
  for (let x = step; x < W; x += step) d += `M${x} 0V${H}`;
  for (let y = step; y < H; y += step) d += `M0 ${y}H${W}`;
  return `<path d="${d}"/>`;
}

// ---- PCB ------------------------------------------------------------
function pcb(r) {
  const cx = 220 + r() * 200;
  const cy = 130 + r() * 70;
  const cw = 110 + r() * 40;
  const ch = 90 + r() * 30;
  let traces = '';
  let vias = '';
  let pads = '';
  const pins = 7;
  const sides = ['top', 'bottom', 'left', 'right'];
  for (const side of sides) {
    for (let i = 0; i < pins; i++) {
      if (r() < 0.35) continue;
      const t = (i + 1) / (pins + 1);
      let x0, y0, x1, y1, x2, y2;
      const len = 30 + r() * 120;
      const bend = (r() - 0.5) * 140;
      if (side === 'top' || side === 'bottom') {
        x0 = cx - cw / 2 + cw * t;
        y0 = side === 'top' ? cy - ch / 2 : cy + ch / 2;
        const dir = side === 'top' ? -1 : 1;
        x1 = x0;
        y1 = y0 + dir * len * 0.5;
        x2 = x1 + bend;
        y2 = y1 + dir * Math.abs(bend);
      } else {
        y0 = cy - ch / 2 + ch * t;
        x0 = side === 'left' ? cx - cw / 2 : cx + cw / 2;
        const dir = side === 'left' ? -1 : 1;
        y1 = y0;
        x1 = x0 + dir * len * 0.5;
        y2 = y1 + bend;
        x2 = x1 + dir * Math.abs(bend);
      }
      const x3 = side === 'left' || side === 'right' ? x2 + (x2 > x1 ? 1 : -1) * (20 + r() * 80) : x2;
      const y3 = side === 'top' || side === 'bottom' ? y2 + (y2 > y1 ? 1 : -1) * (20 + r() * 60) : y2;
      const hot = r() < 0.18;
      traces += `<path class="${hot ? 'art-hot' : 'art-trace'}" d="M${r1(x0)} ${r1(y0)}L${r1(x1)} ${r1(y1)}L${r1(x2)} ${r1(y2)}L${r1(x3)} ${r1(y3)}"/>`;
      vias += `<circle class="art-via" cx="${r1(x3)}" cy="${r1(y3)}" r="${hot ? 5 : 4}"/>`;
      pads += `<rect class="art-pad" x="${r1(x0 - 3)}" y="${r1(y0 - 3)}" width="6" height="6"/>`;
    }
  }
  let parts = '';
  for (let i = 0; i < 9; i++) {
    const x = 40 + r() * (W - 80);
    const y = 40 + r() * (H - 100);
    if (Math.abs(x - cx) < cw && Math.abs(y - cy) < ch) continue;
    const w = 14 + r() * 26;
    const h = 8 + r() * 10;
    parts += `<rect class="art-part" x="${r1(x)}" y="${r1(y)}" width="${r1(w)}" height="${r1(h)}" rx="1.5"/>`;
  }
  // antenna meander
  const ax = 40 + r() * 60;
  let ant = `M${ax} 40`;
  for (let i = 0; i < 6; i++) ant += `h${i % 2 ? -22 : 22}v10`;
  return `${traces}${vias}${parts}
<path class="art-trace" d="${ant}"/>
<rect class="art-chip" x="${r1(cx - cw / 2)}" y="${r1(cy - ch / 2)}" width="${r1(cw)}" height="${r1(ch)}" rx="4"/>
<circle class="art-pin1" cx="${r1(cx - cw / 2 + 12)}" cy="${r1(cy - ch / 2 + 12)}" r="3"/>
${pads}
<text class="art-chiptext" x="${r1(cx)}" y="${r1(cy + 4)}" text-anchor="middle">${['MCU', 'SoC', 'RF', 'U1'][Math.floor(r() * 4)]}</text>`;
}

// ---- RF / spectrum + waterfall ----------------------------------------
function rf(r) {
  const peaks = Array.from({ length: 2 + Math.floor(r() * 3) }, () => ({
    x: 60 + r() * (W - 120),
    h: 50 + r() * 90,
    w: 6 + r() * 26,
  }));
  const top = 30;
  const base = 190;
  let d = `M0 ${base}`;
  for (let x = 0; x <= W; x += 4) {
    let y = base - r() * 14;
    for (const p of peaks) y -= p.h * Math.exp(-((x - p.x) ** 2) / (2 * p.w * p.w));
    d += `L${x} ${r1(Math.max(top, y))}`;
  }
  const fill = `${d}L${W} ${base + 4}L0 ${base + 4}Z`;
  let wf = '';
  const rows = 14;
  for (let row = 0; row < rows; row++) {
    for (let x = 0; x < W; x += 16) {
      let v = r() * 0.15;
      for (const p of peaks) {
        const drift = Math.sin((row + p.x) * 0.6) * 6;
        v += Math.exp(-((x + 8 - p.x - drift) ** 2) / (2 * p.w * p.w)) * (0.6 + r() * 0.4);
      }
      if (v < 0.12) continue;
      wf += `<rect class="art-wf" x="${x}" y="${206 + row * 8}" width="15" height="7" opacity="${r1(Math.min(1, v))}"/>`;
    }
  }
  const marker = peaks[0];
  return `<path class="art-fill" d="${fill}"/><path class="art-hot" d="${d}"/>
<line class="art-cursor" x1="${r1(marker.x)}" y1="20" x2="${r1(marker.x)}" y2="${H - 40}"/>
<text class="art-small" x="${r1(marker.x + 8)}" y="34">Δ ${(-40 - r() * 30).toFixed(1)} dBm</text>
${wf}`;
}

// ---- Network graph ---------------------------------------------------
function net(r) {
  const cols = 5;
  const nodes = [];
  for (let c = 0; c < cols; c++) {
    const n = 2 + Math.floor(r() * 3);
    for (let i = 0; i < n; i++) {
      nodes.push({ c, x: 70 + c * ((W - 140) / (cols - 1)) + (r() - 0.5) * 30, y: 50 + (i + 0.5) * ((H - 110) / n) + (r() - 0.5) * 20 });
    }
  }
  let edges = '';
  let hot = '';
  for (const a of nodes) {
    for (const b of nodes) {
      if (b.c !== a.c + 1 || r() > 0.55) continue;
      const mx = (a.x + b.x) / 2;
      const path = `M${r1(a.x)} ${r1(a.y)}C${r1(mx)} ${r1(a.y)} ${r1(mx)} ${r1(b.y)} ${r1(b.x)} ${r1(b.y)}`;
      if (r() < 0.2) hot += `<path class="art-hot art-flow" d="${path}"/>`;
      else edges += `<path class="art-trace" d="${path}"/>`;
    }
  }
  const dots = nodes
    .map((n) => {
      const alert = r() < 0.12;
      return `<g transform="translate(${r1(n.x)} ${r1(n.y)})"><rect class="${alert ? 'art-node-alert' : 'art-node'}" x="-9" y="-9" width="18" height="18" rx="4"/>${alert ? '<circle class="art-ring" r="16"/>' : ''}</g>`;
    })
    .join('');
  return `${edges}${hot}${dots}`;
}

// ---- Neural / AI ------------------------------------------------------
function ai(r) {
  const layers = [4, 6, 6, 3];
  const pos = layers.map((n, li) =>
    Array.from({ length: n }, (_, i) => ({ x: 110 + li * 140, y: 40 + (i + 0.5) * ((H - 100) / n) }))
  );
  let e = '';
  let hot = '';
  for (let l = 0; l < pos.length - 1; l++) {
    for (const a of pos[l]) {
      for (const b of pos[l + 1]) {
        const w = r();
        if (w > 0.9) hot += `<line class="art-hot" x1="${a.x}" y1="${r1(a.y)}" x2="${b.x}" y2="${r1(b.y)}"/>`;
        else e += `<line class="art-trace" x1="${a.x}" y1="${r1(a.y)}" x2="${b.x}" y2="${r1(b.y)}" opacity="${r1(0.25 + w * 0.6)}"/>`;
      }
    }
  }
  const nodes = pos.flat().map((p) => `<circle class="${r() < 0.2 ? 'art-node-alert' : 'art-node'}" cx="${p.x}" cy="${r1(p.y)}" r="8"/>`).join('');
  let bars = '';
  for (let i = 0; i < 3; i++) {
    const v = r();
    bars += `<rect class="art-part" x="560" y="${110 + i * 40}" width="60" height="10" rx="2"/><rect class="art-barfill" x="560" y="${110 + i * 40}" width="${r1(60 * v)}" height="10" rx="2"/><text class="art-small" x="560" y="${104 + i * 40}">${(v).toFixed(2)}</text>`;
  }
  return `${e}${hot}${nodes}${bars}`;
}

// ---- Oscilloscope -----------------------------------------------------
function scope(r) {
  const mid = (H - 40) / 2;
  const f = 2 + r() * 5;
  const amp = 50 + r() * 50;
  const square = r() < 0.4;
  let d = '';
  for (let x = 0; x <= W; x += 3) {
    const ph = (x / W) * Math.PI * 2 * f;
    let y = square ? Math.sign(Math.sin(ph)) * amp * 0.8 : Math.sin(ph) * amp + Math.sin(ph * 3.1) * amp * 0.15;
    y += (r() - 0.5) * 6;
    d += `${x ? 'L' : 'M'}${x} ${r1(mid - y)}`;
  }
  let d2 = '';
  for (let x = 0; x <= W; x += 6) {
    const y = (x % 160 < 20 ? 30 : 0) + (r() - 0.5) * 4;
    d2 += `${x ? 'L' : 'M'}${x} ${r1(H - 70 - y)}`;
  }
  const cx = 120 + r() * 380;
  return `<line class="art-axis" x1="0" y1="${mid}" x2="${W}" y2="${mid}"/><line class="art-axis" x1="${W / 2}" y1="0" x2="${W / 2}" y2="${H}"/>
<path class="art-hot art-glow" d="${d}"/><path class="art-trace2" d="${d2}"/>
<line class="art-cursor" x1="${r1(cx)}" y1="0" x2="${r1(cx)}" y2="${H}"/>
<text class="art-small" x="${W - 150}" y="30">CH1 ${(amp / 50).toFixed(2)}V/div</text>
<text class="art-small" x="${W - 150}" y="48">${(f * 1.7).toFixed(1)} kHz</text>`;
}

// ---- Terminal -----------------------------------------------------------
const TERM = [
  '$ ./lab run --profile bench',
  '[ok] sensor link established',
  '[..] collecting telemetry  rssi=-61dBm',
  '[ok] rule pack loaded: 42 detections',
  '[!!] anomaly score 0.91 > threshold',
  '[ok] evidence bundle written',
  '$ make flash PORT=/dev/ttyACM0',
  '[ok] wrote 1.2 MB in 6.1s',
  '[..] mqtt publish lab/telemetry/node-07',
  '[ok] 1,204 events normalized',
  '$ pytest -q tests/',
  '38 passed in 2.4s',
];
function term(r) {
  const lines = [];
  for (let i = 0; i < 9; i++) lines.push(TERM[Math.floor(r() * TERM.length)]);
  const body = lines
    .map((l, i) => {
      const cls = l.startsWith('[!!]') ? 'art-term-warn' : l.startsWith('$') ? 'art-term-cmd' : 'art-term';
      return `<text class="${cls}" x="60" y="${92 + i * 24}">${xmlEsc(l)}</text>`;
    })
    .join('');
  return `<rect class="art-chip" x="40" y="40" width="${W - 80}" height="${H - 90}" rx="8"/>
<circle class="art-dot-r" cx="62" cy="58" r="5"/><circle class="art-dot-y" cx="80" cy="58" r="5"/><circle class="art-dot-g" cx="98" cy="58" r="5"/>
${body}<rect class="art-caret" x="60" y="${92 + 9 * 24 - 14}" width="9" height="16"/>`;
}

const KINDS = { pcb, rf, net, ai, scope, term };

export function coverArt(item = {}, { kind } = {}) {
  const k = kind || artKindFor(item);
  const seed = String(item.slug || item.title || item.name || 'hexworks');
  const r = rng(seed + k);
  const label = String(item.title || item.name || '').toUpperCase();
  return frame((KINDS[k] || term)(r), label, item.code);
}
