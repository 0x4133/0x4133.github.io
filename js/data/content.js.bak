// ============================================================================
// Hexworks LLC — site content
//
// This file IS the content. To publish something, edit it and push:
//   * add an object to `projects`, `products`, `ideas` or `notes`
//   * long text fields are Markdown (use backtick strings for multi-line text)
//   * put images in assets/ and reference them as 'assets/your-image.jpg'
//   * new technologies / tags just work; add a display name below if wanted
//
// Everything here is public — it is shipped to every visitor's browser.
// See README.md → "Adding content" for every available field.
// ============================================================================

const GH = 'https://github.com/0x4133';

export const categories = [
  { slug: 'embedded', name: 'Embedded', code_prefix: 'EMB', description: 'Microcontrollers, firmware and board-level engineering.' },
  { slug: 'esp32', name: 'ESP32', code_prefix: 'ESP', description: 'Espressif ESP32-family devices and firmware.' },
  { slug: 'wifi', name: 'Wi-Fi', code_prefix: 'WFI', description: '802.11 scanning, telemetry and monitoring.' },
  { slug: 'ble', name: 'BLE', code_prefix: 'BLE', description: 'Bluetooth Low Energy observation.' },
  { slug: 'rf', name: 'RF', code_prefix: 'RF', description: 'Radio-frequency capture, decode and measurement.' },
  { slug: 'sdr', name: 'SDR', code_prefix: 'SDR', description: 'Software-defined radio tooling.' },
  { slug: 'soc', name: 'SOC', code_prefix: 'SOC', description: 'Security operations tooling and pipelines.' },
  { slug: 'detection-engineering', name: 'Detection Engineering', code_prefix: 'DET', description: 'Building, testing and tuning detections.' },
  { slug: 'automation', name: 'Automation', code_prefix: 'AUT', description: 'Security automation and orchestration.' },
  { slug: 'ai', name: 'AI', code_prefix: 'AI', description: 'AI-assisted security tooling.' },
  { slug: 'network-security', name: 'Network Security', code_prefix: 'NET', description: 'Network visibility, capture and monitoring.' },
  { slug: 'hardware-security', name: 'Hardware Security', code_prefix: 'HW', description: 'Device-level and board-level security.' },
  { slug: 'research', name: 'Research', code_prefix: 'RES', description: 'Measurement studies and open questions.' },
];

// Display names for technology slugs. Unlisted slugs are shown as-is.
export const technologies = {
  'esp32': 'ESP32', 'esp32-s3': 'ESP32-S3', 'esp32-c3': 'ESP32-C3', 'esp-now': 'ESP-NOW',
  'arduino': 'Arduino', 'cpp': 'C++', 'c': 'C', 'python': 'Python', 'rust': 'Rust',
  'w5500': 'W5500', 'ethernet': 'Ethernet', 'wifi': 'Wi-Fi', 'ble': 'BLE', 'gps': 'GPS',
  'web-serial': 'Web Serial', 'pcap': 'PCAP', 'kicad': 'KiCad', 'neopixel': 'NeoPixel',
  'sdr': 'SDR', 'hackrf': 'HackRF', 'bladerf': 'bladeRF', 'rtl-sdr': 'RTL-SDR', 'rtl-433': 'rtl_433',
  'sub-ghz': 'Sub-GHz', 'splunk': 'Splunk', 'otel': 'OpenTelemetry', 'syslog': 'syslog',
  'zeek': 'Zeek', 'suricata': 'Suricata', 'syslog-ng': 'syslog-ng', 'docker': 'Docker', 'podman': 'Podman',
  'nmap': 'Nmap', 'wigle': 'WiGLE', 'mcp': 'MCP', 'flask': 'Flask', 'sqlite': 'SQLite',
  'wids': 'WIDS', 'ids': 'IDS',
};

export const projects = [
  {
    slug: 'eth0',
    title: 'eth0 — Network Security Sensor',
    code: 'NET-001',
    status: 'TESTING',
    category: 'network-security',
    lab: 'cyber-systems',
    published_at: '2026-09-10',
    featured: true,
    on_bench: true,
    summary: 'An ESP32-S3 + W5500 Ethernet sensor for packet capture, network visibility and IDS/WIDS alerting, driven from a browser over Web Serial. Captures to SD as standard PCAP.',
    technologies: ['esp32-s3', 'w5500', 'ethernet', 'cpp', 'arduino', 'pcap', 'web-serial', 'wids', 'ids', 'wifi', 'ble'],
    tags: ['sensor', 'packet-capture', 'ids', 'blue-team', 'network-visibility'],
    github_repo: `${GH}/eth0`,
    problem: 'Small networks and lab benches rarely have a cheap, self-contained device that can sit on a wire, capture traffic, and raise IDS-style alerts without a full server or a tap and laptop.',
    idea: 'Put a capable packet-capture and monitoring stack on a single ESP32-S3 board with wired Ethernet (W5500) and an SD card, and drive the whole thing from a browser over the Web Serial API — no app to install.',
    why: 'An inexpensive wired sensor makes network visibility, PCAP collection and IDS/WIDS experimentation practical on a home lab or a single segment, and doubles as a teaching platform for how capture and detection actually work.',
    architecture: `The firmware is split into focused modules rather than one sketch:

| Module | Responsibility |
|---|---|
| \`net_core\` | W5500 MACRAW capture, Ethernet init, DHCP/static fallback |
| \`security\` | IDS rule engine, alert ring, blocking/blacklist state, WIDS |
| \`protocols\` | ARP/STP/LLDP/CDP/mDNS/NBNS parsing, host and neighbor tables |
| \`wireless\` | Wi-Fi and BLE scanning, WIDS baseline learning |
| \`cli\` | Human serial menu + machine-readable Web Serial JSON bridge |

Ethernet and the SD card sit on separate SPI buses to avoid contention; the W5500 runs socket 0 in MACRAW mode for raw capture.`,
    how_it_works: `1. Boot brings up the status LED, both SPI buses, the SD card and Ethernet (DHCP first, static fallback).
2. Socket 0 is reopened as MACRAW and the MAC filter is disabled for promiscuous capture.
3. Frames are written to a PCAP file on SD and fed into stats, the IDS, and a recent-packet ring for the browser UI.
4. A single-file browser console talks to the device over Web Serial (JSON), showing alerts, a network map, a rules editor, a file browser and packet views.`,
    hardware: `- Board: Waveshare ESP32-S3-ETH
- Ethernet: W5500 over SPI2 (MISO 12, MOSI 11, SCK 13, CS 14, RST 9, INT 10)
- SD card: separate SPI3 bus (MISO 5, MOSI 6, SCK 7, CS 4)
- Onboard NeoPixel for status / alert indication
- Serial link at 460800 baud`,
    software: `- Arduino / C++ firmware, modularised across six translation units
- Single-file browser UI over the Web Serial API (no backend)
- PCAP capture to SD; SD-backed persistence for alerts, rules, the WIDS baseline and an audit trail`,
    limitations: `- Capture throughput is bounded by the W5500 and SPI, not line rate.
- The browser UI currently exposes more than purely defensive workflows; capability-gating risky controls is planned.
- The main firmware began as a monolith and is being broken into documented modules incrementally.`,
    security_considerations: `- Intended for networks you own or are explicitly authorised to monitor, and for lab use.
- The canonical runtime/UI name is \`eth0\`; the repository folder is \`eth1\`.
- Future work prioritises lab-safe, defensive and observability improvements, including a safe-mode that gates higher-risk controls.`,
    future_plans: `- Treat the serial JSON interface as a documented, versioned protocol
- Keep a UI-to-firmware command matrix so drift stays visible
- Add safe-mode / capability gating for higher-risk controls
- A host-side replay harness so the browser UI can be tested without hardware`,
    links: [
      { kind: 'docs', label: 'Serial JSON protocol', url: `${GH}/eth0/blob/master/docs/serial-json-protocol.md` },
      { kind: 'docs', label: 'UI ↔ command matrix', url: `${GH}/eth0/blob/master/docs/ui-command-matrix.md` },
    ],
    updates: [
      { date: '2026-09-10', title: 'Modular firmware + Web Serial console', body: 'Firmware split into `net_core`, `security`, `protocols`, `wireless` and `cli`; browser UI drives capture, alerts, the network map and the rules editor over Web Serial.' },
      { date: '2026-04-13', title: 'Safe-backlog documented', body: 'Wrote a defensive-first engineering backlog: document the serial protocol, add a command matrix, and gate higher-risk controls behind a safe mode.' },
    ],
  },
  {
    slug: 'wardriver',
    title: 'Wardriver — 12-Channel ESP32 Rig',
    code: 'WFI-001',
    status: 'BUILDING',
    category: 'wifi',
    lab: 'embedded-rf',
    published_at: '2026-09-22',
    featured: true,
    on_bench: true,
    summary: 'A 12-channel wardriving rig: twelve XIAO ESP32-C3 scanners, one per Wi-Fi channel, reporting over ESP-NOW to a CYD hub with GPS and microSD that writes WiGLE-1.4 CSV.',
    technologies: ['esp32-c3', 'esp-now', 'wifi', 'gps', 'kicad', 'cpp', 'wigle'],
    tags: ['sensor', 'wireless', 'pcb', 'wardriving', 'gps'],
    github_repo: `${GH}/Wardriver`,
    problem: 'A single radio hopping across channels misses networks that are only briefly on air. Covering every 2.4 GHz channel at once needs more radios than one board has.',
    idea: 'Dedicate one XIAO ESP32-C3 to each Wi-Fi channel, have them all report hits over ESP-NOW to a 3.5" CYD primary, and let the primary tag each hit with GPS and log WiGLE-compatible CSV straight to microSD.',
    why: 'Parallel per-channel scanning gives far denser coverage on a drive, and WiGLE-1.4 output means captures upload without any post-processing.',
    architecture: 'Twelve `scanner_c3` nodes (flashed with `-DCHANNEL=N`) → ESP-NOW → `primary_cyd` hub (GPS + SD + per-channel hit display). A shared IE parser, dedup table and CSV formatter are covered by host-side C++17 unit tests.',
    hardware: `- 12 × Seeed XIAO ESP32-C3 scanners, one per channel
- ESP32-3248S035 (CYD) 3.5" primary with GPS and microSD
- Custom KiCad motherboard + daughtercard (XIAO symbol/footprint library, USB hub tree, per-slot LiPo)
- Through-hole power-supply board revision`,
    software: '- Per-channel scanner firmware and a GPS + SD logging hub\n- Shared IE parser, dedup table and WiGLE CSV formatter with `make`-based unit tests',
    limitations: 'Firmware builds and logs WiGLE-compatible CSV today; the motherboard schematic is complete and PCB routing is in progress.',
    security_considerations: 'Passive scanning only — the rig observes beacons and management frames for mapping and research. Intended for lawful wardriving and WiGLE contribution.',
    future_plans: 'Finish PCB routing, fabricate the motherboard and daughtercards, and publish full design and fab outputs.',
    updates: [
      { date: '2026-09-22', title: 'Firmware logging WiGLE CSV; PCB routing underway', body: 'All twelve scanners report over ESP-NOW and the CYD hub writes WiGLE-1.4 CSV with GPS. Motherboard schematic complete; routing in progress.' },
    ],
  },
  {
    slug: 'situational-awareness-sensor',
    title: 'Wireless Situational-Awareness Sensor',
    code: 'ESP-001',
    status: 'PROTOTYPE',
    category: 'esp32',
    lab: 'embedded-rf',
    published_at: '2026-09-22',
    featured: true,
    on_bench: true,
    summary: 'An ESP32-WROOM sensor plus a Python baseline/drift engine that turns raw Wi-Fi and BLE scans into alerts: new APs, evil-twin, auth downgrade and new probing clients.',
    technologies: ['esp32', 'esp32-s3', 'wifi', 'ble', 'arduino', 'python', 'flask', 'kicad'],
    tags: ['sensor', 'detection', 'wireless', 'evil-twin', 'blue-team'],
    github_repo: `${GH}/newBoard`,
    problem: 'Raw Wi-Fi and BLE scans are noisy. What a defender wants is "what changed?" — a new access point, a known SSID from an unexpected BSSID, a weaker security mode than usual.',
    idea: 'Have the ESP32 emit structured scan events, and let a host-side engine learn a baseline of known APs, BLE devices and probing clients, then raise drift alerts against it.',
    why: 'A learned baseline turns a firehose of scan data into a short, meaningful alert stream a person can actually watch.',
    architecture: 'Firmware emits `#J`-prefixed JSON-lines events (`ap`, `ble`, `probe`, `hp`). `parse_serial.py` learns the baseline and raises `new_ap`, `evil_twin`, `auth_downgrade` and new-client alerts. A single-file Flask dashboard streams events over SSE with append-only `events.jsonl` / `alerts.jsonl` logs.',
    hardware: '- ESP32-WROOM-32U scanning node\n- KiCad carrier PCB linking an ESP32-S3-ETH and a DevKitC-32U over UART, with a logic-analyzer header and an STL enclosure',
    software: '- Arduino sketch: channel-hopping Wi-Fi AP scan, BLE scan and 802.11 probe-request sniffing\n- Python baseline/drift engine\n- Flask SSE dashboard with editable config',
    limitations: 'Working prototype; full source and hardware files are being cleaned up for publication.',
    security_considerations: 'Passive observation of the local radio environment, intended for spaces you own or are authorised to monitor.',
    future_plans: 'Tighten the evil-twin and auth-downgrade heuristics and fold the sensor into the eth0 platform as a wireless front end.',
    updates: [
      { date: '2026-09-22', title: 'Baseline + drift alerts working', body: 'Firmware emits JSON-lines scan events; the Python engine learns a baseline and raises new-AP, evil-twin and auth-downgrade alerts into a live Flask dashboard.' },
    ],
  },
  {
    slug: 'waveviewer',
    title: 'WaveViewer — SDR Chop & Decode',
    code: 'SDR-001',
    status: 'ACTIVE',
    category: 'sdr',
    lab: 'embedded-rf',
    published_at: '2026-09-22',
    featured: true,
    on_bench: false,
    summary: 'A node-based SDR workbench for HackRF and RTL-SDR: watch a live waterfall, drag to chop out a signal, then wire up drag-and-drop decode nodes — or drop a preset.',
    technologies: ['sdr', 'hackrf', 'rtl-sdr', 'rtl-433', 'python', 'sub-ghz'],
    tags: ['sdr', 'decode', 'waterfall', 'research'],
    github_repo: `${GH}/waveViewer`,
    problem: 'Going from "there is a signal here" to "here are its bits" usually means stitching together several command-line tools and remembering the right flags each time.',
    idea: 'Make it visual: a live waterfall you can drag across to chop out a burst, then a node graph — freq translate, OOK envelope, slicer, bit view — you wire up or seed from a preset for a known demod.',
    why: 'A node graph makes the decode pipeline legible and reusable, and keeps capture, decode and replay in one place.',
    how_it_works: 'Live capture feeds a waterfall; a drag selects a signal in time/frequency; nodes (freq translate → OOK envelope → slicer → bit view, or a handoff to `rtl_433`) decode it. Bursts can be replayed or crafted back out the HackRF.',
    limitations: 'Transmit/replay is for your own devices and authorised research only.',
    security_considerations: 'Replay and TX paths are meant for lab and authorised use; keep within local RF regulations.',
    future_plans: 'More built-in demod presets and a cleaner preset-sharing format.',
    updates: [
      { date: '2026-09-22', title: 'Node graph + presets', body: 'Live waterfall, drag-to-chop selection, drag-and-drop decode nodes and per-demod presets, with HackRF replay.' },
    ],
  },
  {
    slug: 'rfremote',
    title: 'rfremote — Guided Sub-GHz Workflow',
    code: 'RF-001',
    status: 'ACTIVE',
    category: 'rf',
    lab: 'embedded-rf',
    published_at: '2026-09-22',
    featured: false,
    on_bench: false,
    summary: 'A guided capture → decode → replay → craft console for the Nuand bladeRF, with a live signal-level meter so you can confirm a device is transmitting before you commit.',
    technologies: ['bladerf', 'sdr', 'sub-ghz', 'python', 'rtl-433'],
    tags: ['sdr', 'sub-ghz', 'research', 'decode'],
    github_repo: `${GH}/rfremote`,
    problem: 'Sub-GHz capture on an SDR is fiddly: the DC spike sits on your signal, and you often cannot tell whether the remote is even transmitting before you have already recorded nothing.',
    idea: 'A hand-holding console that picks a band, offset-tunes so the DC spike never lands on the signal, shows a live level meter to confirm transmission, then walks capture → decode → replay → craft.',
    why: 'Confirming real signal energy before recording saves a lot of blind captures, and the guided flow makes the whole process repeatable.',
    how_it_works: 'Pick a band (315 / 303.8 / 433.92 / 868 / 915 MHz or custom); the tool offset-tunes and opens a live VU meter with peak / noise-floor / SNR and a BURST flag, records on keypress, then helps decode and replay.',
    limitations: 'Authorised and defensive use only — your own devices, CTF, or research with permission.',
    security_considerations: 'Explicitly scoped to owned devices and authorised testing. Respect local RF regulations.',
    future_plans: 'Broaden the built-in decoders and tighten the craft/forge step.',
    updates: [
      { date: '2026-09-22', title: 'Guided flow with live level meter', body: 'Band picker with DC-spike offset tuning, a terminal VU meter (peak / noise floor / SNR / BURST), and the full capture → decode → replay → craft path.' },
    ],
  },
  {
    slug: 'sdr-mcp',
    title: 'sdr-mcp — SDRs as AI Tools',
    code: 'AI-001',
    status: 'ACTIVE',
    category: 'ai',
    lab: 'ai-security',
    published_at: '2026-09-22',
    featured: false,
    on_bench: false,
    summary: 'An MCP server that exposes HackRF and bladeRF to an AI agent as tools: enumerate devices, capture IQ, sweep the spectrum, analyze a capture, and (opt-in) transmit.',
    technologies: ['mcp', 'sdr', 'hackrf', 'bladerf', 'python'],
    tags: ['sdr', 'ai', 'automation', 'tooling'],
    github_repo: `${GH}/sdr-mcp`,
    problem: 'Letting an AI agent help with RF work means giving it safe, well-scoped access to the radios — not a shell.',
    idea: 'Wrap the vendor CLIs (`hackrf*`, `bladeRF-cli`) as discrete Model Context Protocol tools, so an agent can enumerate, capture, sweep and analyze, with transmit disabled by default.',
    why: 'Wrapping the CLIs rather than linking a native library means no build step and graceful degradation when a tool or device is missing.',
    how_it_works: `Tools include \`list_devices\`, \`device_info\`, \`capture_iq\`, \`analyze_capture\` (mean/peak dBFS, DC offset, clipping), \`list_captures\`, \`sweep\` and \`transmit_iq\`.

\`transmit_iq\` is **disabled by default** and must be explicitly enabled.`,
    software: '- Python ≥ 3.10 MCP server\n- Requires the vendor tools on `PATH` (HackRF tools, `bladeRF-cli`)',
    limitations: 'Transmit is opt-in and off by default; receive-first by design.',
    security_considerations: 'The TX tool stays disabled unless deliberately enabled; intended for authorised and lab use.',
    future_plans: 'More analysis tools and tighter capture metadata so an agent can reason about what was recorded.',
    updates: [
      { date: '2026-09-22', title: 'HackRF + bladeRF tool surface', body: 'Device enumeration, IQ capture, spectrum sweep and capture analysis exposed over MCP, with transmit opt-in.' },
    ],
  },
  {
    slug: 'splunk-router-logs',
    title: 'Router Syslog → Splunk SIEM Pipeline',
    code: 'SOC-001',
    status: 'ACTIVE',
    category: 'soc',
    lab: 'cyber-systems',
    published_at: '2026-09-22',
    featured: true,
    on_bench: false,
    summary: 'A home-lab SIEM pipeline that onboards ASUS router syslog into Splunk and extracts wireless client events (auth, assoc, roam, deauth) for detection.',
    technologies: ['splunk', 'otel', 'syslog', 'podman', 'docker'],
    tags: ['soc', 'detection', 'telemetry', 'blue-team'],
    github_repo: `${GH}/splunk-router-logs`,
    problem: 'Consumer router syslog is noisy and unstructured, so the wireless events worth alerting on (deauths, roams, band-steering) are hard to search or trend.',
    idea: 'Pipe router syslog through an OpenTelemetry collector into Splunk HEC, then add field extractions that turn raw lines into searchable wireless client events.',
    why: 'Structured, `tstats`-able fields make it possible to alert on wireless behaviour and answer "when did this start?" across a home network.',
    architecture: `\`\`\`
router --syslog/UDP 514--> firewalld redirect --> OpenTelemetry collector (RFC3164)
       --> Splunk HEC :8088 --> index=router_logs, sourcetype=router:syslog
\`\`\`

The collector runs as a rootless Podman container, so the host redirects 514/udp to an unprivileged listener port.`,
    how_it_works: '- **Indexed fields:** `process` (wlceventd, roamast, bsd, kernel…), `mac` (multivalue), `wl_event` (Auth / Assoc / ReAssoc / Disassoc / Deauth_ind).\n- **Search-time:** per-client `interface`, `client_mac`, `status`, `reason`, `rssi`; roam candidates and RSSI (roamast); band-steering targets (bsd).',
    software: '- OpenTelemetry collector (syslog receiver) in a rootless Podman container\n- Splunk HEC input, props/transforms for the field extractions',
    limitations: 'Tuned for ASUS/Merlin-style router syslog formats; other vendors need their own extractions.',
    security_considerations: 'Home-lab telemetry on networks you own. Logs can contain client MACs — handle and retain accordingly.',
    future_plans: 'Package the detections as saved searches and share the dashboards.',
    updates: [
      { date: '2026-09-22', title: 'Wireless event extractions live', body: 'Router syslog flows through OTel into Splunk with indexed `process`/`mac`/`wl_event` fields and search-time client, roam and band-steering fields.' },
    ],
  },
  {
    slug: 'apicaller',
    title: 'apicaller — Visual Flow Builder',
    code: 'AUT-001',
    status: 'ACTIVE',
    category: 'automation',
    lab: 'cyber-systems',
    published_at: '2026-09-22',
    featured: true,
    on_bench: true,
    summary: 'A visual flow builder that chains HTTP calls and shell commands on a node canvas where the wires are the real data dependencies — with AI-authored pipelines you review before running.',
    technologies: ['rust', 'automation', 'ai'],
    tags: ['automation', 'soc', 'orchestration', 'tooling'],
    github_repo: `${GH}/apicaller`,
    problem: 'A lot of security and ops work is gluing HTTP calls and shell commands together, reshaping each output and feeding it into the next step — and that glue usually ends up as throwaway scripts.',
    idea: 'Make the glue a graph: each step is a node, outputs are picked and reshaped with a field picker, and `{{node.field}}` references are drawn as wires you can drag to arrange.',
    why: 'Seeing the data dependencies as wires makes a pipeline understandable and editable, and lets an AI author a whole flow you can review before it runs.',
    how_it_works: '- **Node canvas:** steps are nodes; wires show `{{ref}}` data flow.\n- **Auto-link:** drag a node\'s output chip onto another node to wire it in.\n- **AI pattern making:** describe a flow in a sentence and have the pipeline authored onto the canvas, then review and run.',
    software: '- Rust application with a draggable node canvas\n- Drives the security and SOC automation flows used across the lab',
    limitations: 'A broad platform under active development; individual blocks and flows mature at different rates.',
    security_considerations: 'Flows can run shell commands and reach external services — run only pipelines you have reviewed, with credentials you control.',
    future_plans: 'Keep expanding the block library and the reviewed-before-run AI authoring.',
    updates: [
      { date: '2026-09-22', title: 'Node canvas with AI authoring', body: 'HTTP/shell nodes, field-picker reshaping, `{{ref}}` wiring and auto-link, plus describe-a-flow AI pipeline authoring.' },
    ],
  },
  {
    slug: 'nmapmap',
    title: 'nmapMap — Interactive Scan Map',
    code: 'NET-002',
    status: 'ACTIVE',
    category: 'network-security',
    lab: 'cyber-systems',
    published_at: '2026-08-02',
    featured: false,
    on_bench: false,
    summary: 'Turns nmap XML reports into a force-directed host graph where hosts that share services, product versions or OS family are auto-connected — rare shared attributes bind tighter.',
    technologies: ['nmap', 'python', 'network-security'],
    tags: ['network-security', 'visualization', 'recon'],
    github_repo: `${GH}/nmapMap`,
    problem: 'An nmap scan of a sizable network is a wall of text; the relationships between hosts — shared services, versions, OS families — are invisible.',
    idea: 'Import the XML and build a force-directed graph where shared attributes become weak edges, weighted so that rare shared things pull hosts together more than ubiquitous ones.',
    why: 'The layout surfaces clusters and outliers at a glance, and clicking a host drills into its ports, scripts, traceroute and scan history.',
    software: '- Python server (`start.sh` builds a venv on first run), served locally\n- Import of nmap XML with per-host drill-down',
    limitations: 'Local, single-user tool; reads nmap XML output.',
    security_considerations: 'Only scan and map networks you are authorised to assess.',
    future_plans: 'Richer diffing between scans over time.',
    updates: [
      { date: '2026-08-02', title: 'Force-directed host graph', body: 'Imports nmap XML into a weighted host graph with per-host drill-down into ports, scripts, traceroute and scan history.' },
    ],
  },
  {
    slug: 'geo-dedupe',
    title: 'geo_dedupe — WiGLE Dedup Map',
    code: 'RES-001',
    status: 'RELEASED',
    category: 'research',
    lab: 'embedded-rf',
    published_at: '2026-07-18',
    featured: false,
    on_bench: false,
    summary: 'An interactive deduplication tool for WiGLE-format wardrive CSVs: preview on a live map what a filter keeps (green) versus removes (red), then commit to a filtered CSV.',
    technologies: ['rust', 'wigle', 'wifi'],
    tags: ['wardriving', 'research', 'tooling'],
    github_repo: `${GH}/geo_dedupe`,
    problem: 'Repeated wardrives produce huge WiGLE CSVs full of duplicate observations, and it is hard to see what a dedup filter will actually throw away before you run it.',
    idea: 'Show the filter on a live map — green for kept, red for removed — across one file or a whole directory of `WD_*.csv`, then commit to a clean CSV.',
    why: 'Seeing the keep/remove split geographically makes it safe to dedupe aggressively without silently losing coverage.',
    software: '- Rust tool serving a local map UI\n- Works on a single capture or merges and dedupes across a whole directory',
    limitations: 'Expects WiGLE-format input.',
    security_considerations: 'Operates on your own wardrive data.',
    future_plans: 'More filter types beyond geographic/temporal dedup.',
    updates: [
      { date: '2026-07-18', title: 'Live keep/remove preview', body: 'Preview a dedup filter on a map (green kept / red removed) across a file or directory, then commit to a filtered CSV.' },
    ],
  },
  {
    slug: 'hackrf-helper',
    title: 'hackrf_helper — Receive-Only HackRF CLI',
    code: 'SDR-002',
    status: 'ACTIVE',
    category: 'sdr',
    lab: 'embedded-rf',
    published_at: '2026-04-10',
    featured: false,
    on_bench: false,
    summary: 'A receive-only HackRF helper CLI: sweep, capture IQ, decode FM broadcast to WAV, and save metadata so an AI can inspect what was captured later. Does not transmit.',
    technologies: ['hackrf', 'sdr', 'python'],
    tags: ['sdr', 'tooling', 'research'],
    problem: 'Getting basic things out of a HackRF — a sweep, an IQ capture, some FM audio — means remembering several tools and flags each session.',
    idea: 'A small CLI with a safe, receive-only scope (`info`, `sweep`, `capture`, `inspect`) that also writes metadata so later analysis (including by an AI) knows what each file is.',
    why: 'A receive-only helper lowers the friction of routine RX work and keeps a clean record of captures.',
    software: '- Python CLI wrapping the HackRF tools\n- Sweep + IQ capture, FM-to-WAV decode, metadata sidecars',
    limitations: 'Receive only — there is no transmit path.',
    security_considerations: 'Explicitly does not transmit; safe-by-scope for RX work.',
    future_plans: 'Feed its metadata into the sdr-mcp analysis tools.',
    updates: [
      { date: '2026-04-10', title: 'Receive-only helper', body: 'Sweep, IQ capture, FM broadcast decode to WAV, and capture metadata — no TX.' },
    ],
  },
  {
    slug: 'nsm-stack',
    title: 'Zeek + Suricata + syslog-ng Stack',
    code: 'NET-003',
    status: 'ACTIVE',
    category: 'network-security',
    lab: 'cyber-systems',
    published_at: '2026-06-01',
    featured: false,
    on_bench: false,
    summary: 'A containerised network-security-monitoring stack: Zeek and Suricata for analysis and alerting, with syslog-ng collecting and routing the logs — brought up with one compose file.',
    technologies: ['zeek', 'suricata', 'syslog-ng', 'docker', 'network-security'],
    tags: ['network-security', 'detection', 'blue-team', 'nsm'],
    github_repo: `${GH}/zeek_suricata_syslog-ng_docker`,
    problem: 'Standing up a network-monitoring stack usually means hand-installing Zeek, Suricata and a log shipper and wiring them together by hand.',
    idea: 'Ship Zeek, Suricata and syslog-ng as a single Docker Compose stack so a lab sensor comes up with one command.',
    why: 'A reproducible NSM stack makes it easy to spin up visibility on a span port or lab segment and tear it down cleanly.',
    software: '- `docker-compose.yml` bringing up Zeek, Suricata and syslog-ng\n- syslog-ng config routing the generated logs',
    limitations: 'A starting point to tune to your own interfaces and rule sets.',
    security_considerations: 'Monitor only traffic you are authorised to see.',
    future_plans: 'Ship example detections and a log-forwarding path into the Splunk pipeline.',
    updates: [
      { date: '2026-06-01', title: 'One-command NSM stack', body: 'Zeek + Suricata + syslog-ng in a single compose file for lab network monitoring.' },
    ],
  },
];

export const products = [
  {
    slug: 'eth0-build',
    name: 'eth0 Network Security Sensor (build)',
    kind: 'hardware',
    summary: 'A built-and-flashed eth0 sensor: ESP32-S3 + W5500 Ethernet with an SD card, running the eth0 packet-capture, IDS and WIDS firmware, driven from your browser over Web Serial.',
    description: 'This is the one piece of hardware the lab currently offers as a build. Each unit is an assembled Waveshare ESP32-S3-ETH board flashed with the latest `eth0` firmware and verified against the capture and alerting self-checks. The browser console needs no install — it talks to the device over the Web Serial API.',
    problem_solved: 'Gives a home lab or a single network segment a cheap, self-contained wired packet-capture and IDS/WIDS sensor without a server, a tap, or a laptop running Wireshark.',
    features: [
      'W5500 wired Ethernet capture to SD as standard PCAP',
      'IDS rule engine with an alert ring and custom rules',
      'Wi-Fi / BLE WIDS with baseline learning',
      'Browser console over Web Serial — nothing to install',
      'SD-backed persistence for alerts, rules, the WIDS baseline and an audit trail',
      'NeoPixel status / alert indicator',
    ],
    specs: [
      { label: 'Board', value: 'Waveshare ESP32-S3-ETH' },
      { label: 'Ethernet', value: 'W5500 over SPI, MACRAW capture' },
      { label: 'Storage', value: 'microSD (PCAP + state)' },
      { label: 'Interface', value: 'Web Serial (USB), 460800 baud' },
      { label: 'Firmware', value: 'Open source — modular Arduino/C++' },
    ],
    status: 'TESTING',
    version: '0.9',
    changelog: '### 0.9 — 2026-09-10\n- Modular firmware (net_core / security / protocols / wireless / cli)\n- Web Serial console with network map and rules editor\n\n### earlier\n- PCAP capture, IDS alert ring, WIDS baseline, SD persistence',
    source_url: `${GH}/eth0`,
    docs_url: `${GH}/eth0/blob/master/docs/serial-json-protocol.md`,
    cta_label: 'Request an eth0 build',
    technologies: ['esp32-s3', 'w5500', 'ethernet', 'pcap', 'web-serial', 'ids', 'wids'],
    tags: ['sensor', 'hardware', 'packet-capture', 'blue-team'],
    related_project: 'eth0',
  },
];

export const ideas = [
  { slug: 'eth0-safe-mode', title: 'eth0 safe-mode capability gating', concept: 'A first-class safe mode on eth0 that hides or locks higher-risk controls by default.', description: 'The eth0 UI currently exposes more than purely defensive workflows. A safe mode that gates risky controls behind an explicit opt-in would make the sensor safe to hand to someone learning on it.', category: 'network-security', tags: ['blue-team', 'safety'], technologies: ['esp32-s3', 'web-serial'], idea_date: '2026-09-11', status: 'IDEA', related_projects: ['eth0'] },
  { slug: 'eth0-replay-harness', title: 'Host-side replay harness for eth0', concept: 'Replay recorded PCAP/serial sessions so the browser UI can be tested without hardware.', description: 'A harness that feeds captured frames and serial JSON into the browser console would let the UI and detections be developed and regression-tested without a physical board on the bench.', category: 'network-security', tags: ['testing', 'tooling'], technologies: ['pcap', 'web-serial'], idea_date: '2026-09-11', status: 'IDEA', related_projects: ['eth0'] },
  { slug: 'wardriver-to-splunk', title: 'Wardriver hits into the Splunk pipeline', concept: 'Forward live Wardriver observations into the Splunk SIEM for correlation with router events.', description: 'The Wardriver already logs WiGLE CSV; streaming those hits into the router-syslog Splunk pipeline would let wireless sightings be correlated with on-network wireless events.', category: 'soc', tags: ['telemetry', 'detection'], technologies: ['splunk', 'esp-now', 'wifi'], idea_date: '2026-09-22', status: 'IDEA', related_projects: ['wardriver', 'splunk-router-logs'] },
  { slug: 'sdr-mcp-waveviewer', title: 'Drive WaveViewer presets from sdr-mcp', concept: 'Let an AI agent pick a WaveViewer decode preset from a capture’s characteristics.', description: 'sdr-mcp can already analyze a capture; having it suggest or apply a WaveViewer decode graph would close the loop from "something is transmitting" to "here are the bits" with an agent in the middle.', category: 'ai', tags: ['sdr', 'automation'], technologies: ['mcp', 'sdr'], idea_date: '2026-09-22', status: 'IDEA', related_projects: ['sdr-mcp', 'waveviewer'] },
];

export const notes = [
  {
    slug: 'router-syslog-field-extractions', title: 'Field extractions for ASUS router syslog', project: 'splunk-router-logs', published_at: '2026-09-22',
    summary: 'Which wireless events ASUS router syslog actually carries, and the indexed versus search-time fields worth pulling for detection.',
    technologies: ['splunk', 'syslog'], tags: ['soc', 'detection'],
    body: `Consumer router syslog is chatty, but the wireless client lifecycle is all in there if you extract it.

## Indexed (so \`tstats\` works)

- \`process\` — \`wlceventd\`, \`roamast\`, \`bsd\`, \`kernel\`, …
- \`mac\` — multivalue, every MAC in the event
- \`wl_event\` — Auth / Assoc / ReAssoc / Disassoc / Deauth_ind

## Search-time

- From \`wlceventd\`: per-client \`interface\`, \`client_mac\`, \`status\`, \`reason\`, \`rssi\`
- From \`roamast\`: roam candidates and RSSI values
- From \`bsd\`: band-steering \`target_interface\` / \`target_bssid\`

Deauth_ind counts over time make a good first wireless detection.`,
  },
  {
    slug: 'eth0-wpa-crack-throughput', title: 'On-device WPA throughput on the ESP32-S3', project: 'eth0', published_at: '2026-09-10',
    summary: 'Rough numbers for hardware-accelerated PBKDF2-HMAC-SHA1 on the ESP32-S3, and why off-device cracking is the right call for real work.',
    technologies: ['esp32-s3'], tags: ['research', 'measurement'],
    body: `The ESP32-S3 SHA peripheral makes on-device PBKDF2-HMAC-SHA1 possible, but it is modest.

| | Rate |
|---|---|
| On-device PBKDF2-HMAC-SHA1 | ~50–200 candidates/sec per core |

That is practical for small, targeted dictionaries (top-10k, curated wordlists) and useless for general brute force. For anything serious, export to a standard \`-m 22000\` hash file and run hashcat on a GPU. The takeaway: the device is for capture and lab verification, not for cracking at scale.

> Everything here is for networks you own or are authorised to test.`,
  },
  {
    slug: 'two-spi-buses-esp32s3', title: 'Why eth0 splits Ethernet and SD onto separate SPI buses', project: 'eth0', published_at: '2026-09-10',
    summary: 'A small board-level decision that removed a class of intermittent capture and SD errors.',
    technologies: ['esp32-s3', 'w5500'], tags: ['pcb', 'measurement'],
    body: `Running the W5500 and the SD card on one SPI bus causes contention: capture stalls and SD writes miss.

eth0 puts Ethernet on SPI2/FSPI and the SD card on SPI3/HSPI. Two extra wrinkles mattered:

- GPIO-matrix-routed SPI has no hardware pull-ups, so a floating SD MISO makes init intermittently miss responses — an internal pull-up fixes it.
- SD cards need 74+ clock cycles with CS high before the first command; sending dummy bytes before init (and before each retry) makes cold-boot init reliable.

SD init is retried up to five times at decreasing clock speeds, which closes out the last of the flaky cold starts.`,
  },
  {
    slug: 'twelve-radios-one-per-channel', title: 'Twelve radios, one per Wi-Fi channel', project: 'wardriver', published_at: '2026-09-22',
    summary: 'Why the Wardriver dedicates a XIAO ESP32-C3 to each channel instead of hopping one radio.',
    technologies: ['esp32-c3', 'esp-now', 'wifi'], tags: ['wireless', 'research'],
    body: `A single hopping radio only listens to one channel at a time, so briefly-visible networks on other channels are missed between hops.

The Wardriver gives each 2.4 GHz channel its own XIAO ESP32-C3 scanner and aggregates hits over ESP-NOW to the CYD primary. The primary tags each hit with GPS and writes WiGLE-1.4 CSV straight to SD.

Dedup happens on the shared IE parser + dedup table (covered by host-side unit tests) so the CSV is upload-ready without post-processing.`,
  },
];
