// ============================================================================
// Hexworks LLC — site content
//
// This file IS the content. To publish something, edit it and push:
//   * add an object to `projects`, `products`, `ideas` or `notes`
//   * long text fields are Markdown (use backtick strings for multi-line text)
//   * put images in assets/ and reference them as 'assets/your-image.jpg'
//   * new technologies / tags just work; add a nice display name below if wanted
//
// Everything here is public — it is shipped to every visitor's browser.
// See README.md → "Adding content" for every available field.
// ============================================================================

export const categories = [
  {
    slug: 'embedded',
    name: 'Embedded',
    code_prefix: 'EMB',
    description: 'Microcontrollers, firmware and board-level engineering.',
  },
  { slug: 'esp32', name: 'ESP32', code_prefix: 'ESP', description: 'Espressif ESP32-family devices: C6, S3, H2 and friends.' },
  { slug: 'wifi', name: 'Wi-Fi', code_prefix: 'WFI', description: '802.11 telemetry, monitoring and security.' },
  { slug: 'ble', name: 'BLE', code_prefix: 'BLE', description: 'Bluetooth Low Energy observation and gateways.' },
  { slug: 'rf', name: 'RF', code_prefix: 'RF', description: 'Radio-frequency measurement and monitoring.' },
  { slug: 'sdr', name: 'SDR', code_prefix: 'SDR', description: 'Software-defined radio experiments.' },
  { slug: 'soc', name: 'SOC', code_prefix: 'SOC', description: 'Security operations tooling and workflows.' },
  {
    slug: 'detection-engineering',
    name: 'Detection Engineering',
    code_prefix: 'DET',
    description: 'Building, testing and tuning detections.',
  },
  { slug: 'automation', name: 'Automation', code_prefix: 'AUT', description: 'Security automation and orchestration.' },
  { slug: 'ai', name: 'AI', code_prefix: 'AI', description: 'AI-assisted security and the security of AI systems.' },
  {
    slug: 'network-security',
    name: 'Network Security',
    code_prefix: 'NET',
    description: 'Network visibility, segmentation and telemetry.',
  },
  {
    slug: 'hardware-security',
    name: 'Hardware Security',
    code_prefix: 'HW',
    description: 'Device hardening, debug interfaces and tamper evidence.',
  },
  { slug: 'iot', name: 'IoT', code_prefix: 'IOT', description: 'Connected-device security and lab targets.' },
  { slug: 'research', name: 'Research', code_prefix: 'RES', description: 'Measurement studies and open questions.' },
];

// Display names for technology slugs. Unlisted slugs are shown as-is.
export const technologies = {
  'esp32': 'ESP32',
  'esp32-c6': 'ESP32-C6',
  'esp32-s3': 'ESP32-S3',
  'esp-idf': 'ESP-IDF',
  'wifi': 'Wi-Fi',
  'wifi-6': 'Wi-Fi 6',
  'ble': 'BLE',
  'zigbee': 'Zigbee',
  'thread': 'Thread',
  'mqtt': 'MQTT',
  'sdr': 'SDR',
  'rtl-sdr': 'RTL-SDR',
  'hackrf': 'HackRF',
  'gnu-radio': 'GNU Radio',
  '433mhz': '433 MHz',
  'lora': 'LoRa',
  'splunk': 'Splunk',
  'soar': 'SOAR',
  'sigma': 'Sigma',
  'python': 'Python',
  'go': 'Go',
  'rust': 'Rust',
  'c': 'C',
  'freertos': 'FreeRTOS',
  'kicad': 'KiCad',
  'docker': 'Docker',
  'llm': 'LLM',
  'grafana': 'Grafana',
  'influxdb': 'InfluxDB',
  'raspberry-pi': 'Raspberry Pi',
  'node-red': 'Node-RED',
  'wireshark': 'Wireshark',
  'suricata': 'Suricata',
};

export const projects = [
  {
    code: 'ESP-001',
    slug: 'esp32-c6-wireless-security-sensor',
    title: 'ESP32-C6 Wireless Security Sensor',
    summary: 'A low-power ESP32-C6 sensor that watches the 2.4 GHz environment around a room and reports Wi-Fi and BLE anomalies to a SOC as structured telemetry.',
    status: 'PROTOTYPE',
    category: 'esp32',
    lab: 'embedded-rf',
    technologies: ['esp32-c6', 'esp-idf', 'wifi-6', 'ble', 'mqtt', 'kicad', 'c'],
    tags: ['sensor', 'telemetry', 'wireless', 'pcb', 'blue-team'],
    featured: true,
    on_bench: true,
    published_at: '2026-09-14',
    github_repo: 'https://github.com/hexworks-lab/c6-sensor',
    latest_release: 'v0.3.0-proto',
    problem: 'Most organisations have excellent visibility into wired networks and almost none into the radio environment of their own buildings. A rogue access point, a cloned BLE badge beacon or a hidden IoT device can sit in a conference room for months without generating a single log line.',
    idea: 'Put a small, cheap, purpose-built sensor in a room. Let it passively observe Wi-Fi management frames and BLE advertisements, build a baseline of what is normal for that space, and emit only *changes* as compact JSON events a SIEM already understands.',
    why: 'Commercial wireless intrusion detection is expensive and tied to specific access-point vendors. The ESP32-C6 has Wi-Fi 6, BLE 5 and 802.15.4 on one chip for a few dollars, which makes a dense, vendor-neutral sensor grid realistic for small teams and labs.',
    architecture: `The sensor is split into three layers:

| Layer | Responsibility |
|---|---|
| Radio capture | Promiscuous Wi-Fi (management frames only) and passive BLE scan windows |
| Baseline engine | Rolling per-room inventory of BSSIDs, SSIDs, channels and BLE address classes |
| Telemetry | MQTT over TLS to a broker, then forwarded to Splunk via HEC |

![Sensor architecture](assets/media/esp32-sensor-architecture.svg)`,
    how_it_works: `1. The radio alternates between a **Wi-Fi channel hop** (1, 6, 11, then the rest) and a **BLE scan window**.
2. Each observation is reduced to a fingerprint: BSSID/OUI, SSID hash, channel, security suite, RSSI bucket.
3. Fingerprints are compared against the room baseline stored in NVS.
4. New, missing or changed fingerprints become events:

\`\`\`json
{"sensor":"c6-lab-02","type":"wifi.new_bssid","ssid_hash":"9f2c…","oui":"Unknown","rssi":-48,"ch":6,"sec":"OPEN"}
\`\`\`

5. Events are batched and published over MQTT; a heartbeat is sent every 60 seconds.`,
    hardware: `- ESP32-C6-WROOM-1 module
- Custom 2-layer PCB (rev 1), USB-C power and programming
- Optional 18650 cell with TP4056 charger for portable surveys
- Tamper switch on the enclosure lid wired to a GPIO`,
    software: `- ESP-IDF 5.3, written in C
- Wi-Fi provisioning over BLE (Espressif unified provisioning)
- MQTT client with mutual-TLS
- Splunk HEC forwarder (small Python service on the broker host)`,
    research_notes: 'Wi-Fi 6 promiscuous capture on the C6 is reliable for management frames but drops a measurable fraction of frames above ~400 frames/s. See the research note *ESP32-C6 Wi-Fi 6 testing* for numbers.',
    limitations: `- Cannot see 5 GHz or 6 GHz networks (2.4 GHz radio only).
- Passive BLE scanning misses devices that advertise rarely.
- Baselines need a quiet learning period; busy shared spaces produce noisy first days.`,
    security_considerations: `- Captures **metadata only**; no payloads are stored or forwarded.
- SSIDs are hashed before leaving the device.
- Firmware is signed and flash encryption is enabled on production builds.
- Intended for spaces you own or are authorised to monitor.`,
    future_plans: `- PCB rev 2 with an external antenna connector
- 802.15.4 (Zigbee/Thread) observation mode
- On-device scoring so only high-confidence events are sent`,
    media: [
      {
        kind: 'diagram',
        url: 'assets/media/esp32-sensor-architecture.svg',
        caption: 'Sensor architecture: radio capture → baseline engine → MQTT telemetry',
      },
      { kind: 'screenshot', url: 'assets/media/telemetry-dashboard.svg', caption: 'Sensor events alongside node telemetry' },
    ],
    links: [
      { kind: 'docs', label: 'ESP32-C6 technical reference', url: 'https://www.espressif.com/en/products/socs/esp32-c6' },
    ],
    updates: [
      {
        date: '2026-10-03',
        title: 'Rev 1 boards arrived — first bring-up',
        body: 'Eight of ten boards flashed first time. Two had a reversed USB-C footprint orientation on the CC resistors; fixed in the rev 2 schematic.',
      },
      {
        date: '2026-09-28',
        title: 'Custom PCB revision 1 ordered',
        body: 'Two-layer board, USB-C, tamper switch header. Ten units ordered for the bench.',
      },
      {
        date: '2026-09-21',
        title: 'Added MQTT telemetry and Wi-Fi provisioning',
        body: 'Events now publish over mutual-TLS MQTT. Provisioning uses BLE so the sensor never needs a hard-coded SSID.',
      },
      {
        date: '2026-09-14',
        title: 'Initial ESP32-C6 proof of concept completed',
        body: 'Promiscuous capture of management frames working on a DevKitC-1. First baseline built for the lab bench: 23 BSSIDs, 41 BLE advertisers.',
      },
    ],
  },
  {
    code: 'WFI-001',
    slug: 'wifi-telemetry-node',
    title: 'Wi-Fi Telemetry Node',
    summary: 'A fixed-install node that turns 802.11 management traffic into time-series telemetry: channel utilisation, deauth bursts, probe storms and roaming behaviour.',
    status: 'TESTING',
    category: 'wifi',
    lab: 'embedded-rf',
    technologies: ['esp32-s3', 'wifi', 'mqtt', 'influxdb', 'grafana', 'c'],
    tags: ['telemetry', 'wireless', 'sensor'],
    featured: true,
    on_bench: true,
    published_at: '2026-08-22',
    github_repo: 'https://github.com/hexworks-lab/wifi-telemetry-node',
    latest_release: 'v0.6.1',
    problem: 'Wi-Fi problems and Wi-Fi attacks look the same from a help-desk ticket: "the network is slow". Without RF-level telemetry there is no way to tell interference from a deauthentication flood.',
    idea: 'Count, do not capture. A node that aggregates management-frame statistics per channel every ten seconds and ships them as metrics gives you trend lines and spikes without the privacy cost of packet capture.',
    why: 'Metrics are cheap to store, easy to alert on, and safe to retain for months. They answer "when did this start?" — the question every wireless investigation begins with.',
    architecture: 'ESP32-S3 node → MQTT → Telegraf → InfluxDB → Grafana dashboards and alert rules. A Splunk output is available for SOC correlation.',
    how_it_works: 'The node hops channels on a fixed schedule, counts frame subtypes (beacon, probe request/response, deauth, disassoc, auth) and reports per-channel counters and an airtime estimate. Alert rules fire on deauth rate > 20/s for more than 5 seconds.',
    hardware: `- ESP32-S3 DevKitC with external 2.4 GHz antenna
- PoE splitter for ceiling installs
- 3D-printed vented enclosure`,
    software: `- ESP-IDF firmware (C)
- Telegraf MQTT consumer
- Grafana dashboard JSON included in the repository`,
    limitations: `- Airtime estimate is approximate (no access to the hardware duty-cycle counters).
- Single radio; channel hopping means short events can be missed on other channels.`,
    security_considerations: 'No frame payloads or client MAC addresses are retained; only per-channel counters. Deploy only on networks and premises you control.',
    future_plans: `- Dual-radio variant to remove the hopping blind spot
- Correlate deauth spikes with wired-side RADIUS failures`,
    media: [
      {
        kind: 'screenshot',
        url: 'assets/media/telemetry-dashboard.svg',
        caption: 'Per-channel telemetry dashboard during the deauth validation test',
      },
    ],
    updates: [
      {
        date: '2026-09-30',
        title: 'Started 30-day soak test',
        body: 'Looking for memory leaks and reconnect behaviour across AP reboots.',
      },
      {
        date: '2026-09-10',
        title: 'Deauth burst alert validated',
        body: 'Triggered a controlled deauthentication test against the lab\'s own isolated AP. Alert fired in 6 seconds.',
      },
      {
        date: '2026-08-22',
        title: 'Firmware v0.6 deployed to three ceiling nodes',
        body: 'Counters stable for 72 hours. Grafana dashboard published in the repo.',
      },
    ],
  },
  {
    code: 'BLE-001',
    slug: 'ble-to-wifi-security-gateway',
    title: 'BLE-to-Wi-Fi Security Gateway',
    summary: 'A gateway that bridges BLE sensors and badges onto an IP network with allow-listing, rate-limiting and per-device audit logs — instead of a flat, trust-everything bridge.',
    status: 'BUILDING',
    category: 'ble',
    lab: 'embedded-rf',
    technologies: ['esp32-s3', 'ble', 'wifi', 'mqtt', 'rust'],
    tags: ['gateway', 'iot', 'wireless'],
    featured: false,
    on_bench: false,
    published_at: '2026-07-30',
    problem: 'Off-the-shelf BLE gateways forward every advertisement they hear to the cloud. Anyone in range can inject data into your telemetry pipeline.',
    idea: 'Treat the gateway as a security boundary: only paired or allow-listed devices are forwarded, every message is tagged with link-layer metadata, and suspicious patterns (address rotation storms, replayed payloads) are reported.',
    why: 'BLE is increasingly used for physical-security devices — door sensors, panic buttons, asset tags. Their gateway deserves the same scrutiny as a firewall.',
    architecture: 'Embassy-based Rust firmware on ESP32-S3: BLE central → policy engine → MQTT publisher. Policy is a signed JSON document pushed from the admin service.',
    how_it_works: 'Each advertisement is matched against the policy (address, address type, manufacturer data prefix). Allowed messages are forwarded with an HMAC; rejected ones are counted and summarised every minute.',
    hardware: `- ESP32-S3-DevKitM-1
- Optional external BLE antenna`,
    software: `- Rust (esp-hal + embassy)
- Policy signing tool (Python)`,
    limitations: 'Resolvable private addresses cannot be matched without the IRK; those devices must be bonded.',
    security_considerations: 'Gateway rejects unknown devices by default. Policy updates require a signature from the admin key.',
    future_plans: `- Replay detection using per-device counters
- Thread border-router mode`,
    updates: [
      {
        date: '2026-09-18',
        title: 'Policy engine compiles on embassy',
        body: 'Allow-list matching works on-device; signing tool next.',
      },
    ],
  },
  {
    code: 'RF-001',
    slug: 'portable-rf-monitoring-prototype',
    title: 'Portable RF Monitoring Prototype',
    summary: 'A handheld, battery-powered spectrum monitor built around an SDR and a Raspberry Pi, designed for quick RF surveys of labs, offices and event spaces.',
    status: 'PROTOTYPE',
    category: 'sdr',
    lab: 'embedded-rf',
    technologies: ['sdr', 'hackrf', 'raspberry-pi', 'python', 'gnu-radio'],
    tags: ['portable', 'measurement', 'wireless'],
    featured: true,
    on_bench: true,
    published_at: '2026-06-18',
    github_repo: 'https://github.com/hexworks-lab/rf-survey',
    latest_release: 'v0.2.0',
    problem: 'Answering "what is transmitting in this room?" usually means hauling a laptop, an SDR and a tangle of cables, then interpreting a waterfall nobody else can read.',
    idea: 'A single handheld unit with a screen, a sweep schedule and a plain-language summary: known bands, unexpected carriers, and how they changed since the last survey.',
    why: 'Repeatable surveys turn RF from folklore into evidence. Comparing two sweeps a month apart is often more useful than one perfect capture.',
    architecture: 'HackRF One → Raspberry Pi 5 running a sweep service (hackrf_sweep) → band classifier → local SQLite + exportable JSON report.',
    how_it_works: 'The unit sweeps 1 MHz–6 GHz in configurable segments, computes per-bin peak and average power, and flags bins that exceed the stored baseline by more than 10 dB.',
    hardware: `- HackRF One
- Raspberry Pi 5 with 5" touch display
- 10,000 mAh USB-C PD battery
- Telescopic and 2.4 GHz panel antennas`,
    software: `- Python sweep service
- GNU Radio flowgraphs for focused captures
- Survey diff report generator`,
    limitations: 'HackRF dynamic range limits weak-signal detection near strong transmitters. Receive-only by design.',
    security_considerations: 'Receive-only. The device has no transmit path enabled in software, and surveys are intended for premises where you are authorised to perform them.',
    future_plans: `- Signal classification model (see research note)
- Directional antenna + bearing estimation`,
    links: [
      { kind: 'docs', label: 'HackRF documentation', url: 'https://hackrf.readthedocs.io/' },
    ],
    updates: [
      {
        date: '2026-09-05',
        title: 'Survey diff report',
        body: 'The unit now compares a sweep to a stored baseline and lists new carriers above +10 dB.',
      },
      {
        date: '2026-06-18',
        title: 'First full 1 MHz–6 GHz sweep on battery',
        body: 'Sweep completes in 14 seconds; battery life ~5.5 hours.',
      },
    ],
  },
  {
    code: 'SOC-001',
    slug: 'soc-investigation-automation-engine',
    title: 'SOC Investigation Automation Engine',
    summary: 'An investigation engine that takes an alert, runs the same first fifteen minutes of enrichment an analyst would, and hands back a structured evidence bundle.',
    status: 'ACTIVE',
    category: 'soc',
    lab: 'cyber-systems',
    technologies: ['splunk', 'soar', 'python', 'docker'],
    tags: ['soc', 'automation', 'triage', 'blue-team'],
    featured: true,
    on_bench: false,
    published_at: '2026-05-02',
    github_repo: 'https://github.com/hexworks-lab/soc-engine',
    latest_release: 'v1.4.0',
    docs_url: 'https://github.com/hexworks-lab/soc-engine/wiki',
    problem: 'Analysts spend most of the first quarter-hour of every alert on mechanical lookups: who is this user, what else did this host do, has this IP been seen before.',
    idea: 'Encode those lookups as small, testable "investigation steps" and run them automatically the moment an alert fires, so the analyst starts from evidence instead of a blank search bar.',
    why: 'Playbooks in SOAR tools grow into unmaintainable graphs. Plain Python steps with unit tests are easier to review, version and trust.',
    architecture: `![Engine pipeline](assets/media/soc-engine-pipeline.svg)

Alert webhook → queue → step runner (parallel, time-boxed) → evidence bundle (JSON + Markdown) → posted back to the case.`,
    how_it_works: `Each step declares its inputs and outputs:

\`\`\`python
@step(needs=["src_ip"], provides=["ip_history"])
def ip_history(ctx):
    return splunk.search(f'index=fw src_ip={ctx.src_ip} earliest=-7d | stats count by dest_port')
\`\`\`

The runner resolves the dependency graph, runs independent steps concurrently, and records timing and errors for every step.`,
    hardware: 'None — runs as a container next to the SIEM.',
    software: `- Python 3.12, asyncio
- Splunk REST API and HEC
- Optional SOAR integration via webhook`,
    limitations: 'Steps are only as good as the data sources behind them; missing logs produce empty sections, not errors.',
    security_considerations: 'Runs with a dedicated read-only Splunk role. No step is allowed to take containment actions; those stay with the analyst.',
    future_plans: `- Step marketplace across teams
- Feeding bundles into the AI triage prototype (AI-001)`,
    media: [
      { kind: 'diagram', url: 'assets/media/soc-engine-pipeline.svg', caption: 'Investigation engine pipeline' },
    ],
    links: [
      {
        kind: 'download',
        label: 'Example evidence bundle (JSON)',
        url: 'https://github.com/hexworks-lab/soc-engine/tree/main/examples',
      },
    ],
    updates: [
      {
        date: '2026-08-14',
        title: 'v1.4 — parallel step runner',
        body: 'Independent steps run concurrently; median bundle time down to 17 seconds.',
      },
      {
        date: '2026-05-02',
        title: 'v1.0 in daily use',
        body: 'Engine now enriches every medium-and-above alert. Median bundle time: 41 seconds.',
      },
    ],
  },
  {
    code: 'IOT-001',
    slug: 'cyber-range-iot-target',
    title: 'Cyber Range IoT Target',
    summary: 'A deliberately vulnerable, resettable IoT device for training ranges — real firmware, real radios, and a one-button factory reset.',
    status: 'RELEASED',
    category: 'iot',
    lab: 'adversarial-research',
    technologies: ['esp32', 'esp-idf', 'wifi', 'mqtt', 'c'],
    tags: ['cyber-range', 'training', 'lab-target', 'iot'],
    featured: false,
    on_bench: false,
    published_at: '2026-03-11',
    github_repo: 'https://github.com/hexworks-lab/range-iot-target',
    latest_release: 'v1.2.0',
    docs_url: 'https://github.com/hexworks-lab/range-iot-target#readme',
    problem: 'Training ranges are full of virtual machines but rarely contain the kind of small, odd embedded devices that defenders actually find on their networks.',
    idea: 'A cheap physical target with a web UI, an MQTT interface and a UART console — each with a selectable set of intentional weaknesses — that resets to a known state in seconds.',
    why: 'Defenders learn detection faster when they have attacked the thing themselves in a safe, isolated range.',
    architecture: 'ESP32 firmware with a "scenario" partition. Holding the reset button for 3 seconds reflashes the scenario image from a read-only partition.',
    how_it_works: 'Scenarios are selected via DIP switches: default credentials, unauthenticated MQTT, verbose UART, outdated TLS. Every scenario ships with matching detection content for the range SIEM.',
    hardware: `- ESP32-WROOM-32E
- DIP switch scenario selector
- Exposed UART header`,
    software: `- ESP-IDF firmware
- Scenario packs + Splunk detection content`,
    limitations: 'Not a replacement for real product testing; vulnerabilities are illustrative.',
    security_considerations: '**Never connect to a production network.** Ships with Wi-Fi disabled until a range SSID is configured, and refuses to join networks without a range prefix.',
    future_plans: `- BLE scenario pack
- Instructor dashboard showing which scenarios were exploited`,
    updates: [
      { date: '2026-03-11', title: 'v1.2 released', body: 'Added the outdated-TLS scenario and matching detections.' },
    ],
  },
  {
    code: 'AI-001',
    slug: 'ai-assisted-security-triage-prototype',
    title: 'AI-Assisted Security Triage Prototype',
    summary: 'An experiment in letting a language model draft triage notes from evidence bundles — with strict guardrails, cited evidence and a human always making the call.',
    status: 'EXPERIMENT',
    category: 'ai',
    lab: 'ai-security',
    technologies: ['llm', 'python', 'splunk'],
    tags: ['soc', 'triage', 'automation'],
    featured: true,
    on_bench: true,
    published_at: '2026-09-02',
    problem: 'Evidence bundles from the investigation engine are complete but long. Analysts still have to read everything to write a two-paragraph summary.',
    idea: 'Ask a model to write the summary, but require every claim to cite a specific line of the evidence bundle. Claims without citations are dropped before the analyst sees them.',
    why: 'Most AI-in-the-SOC demos optimise for impressive output. This experiment optimises for verifiability and for measuring how often the model is wrong.',
    architecture: 'Evidence bundle → prompt builder → model → citation validator → draft note in case management, clearly labelled as machine-generated.',
    how_it_works: 'The validator parses each sentence for `[E12]`-style references and checks that the referenced evidence line exists and contains the entities mentioned. Uncited sentences are removed and counted.',
    hardware: 'None.',
    software: `- Python
- Model-agnostic client (hosted or local models)
- Evaluation harness with 120 hand-labelled historical alerts`,
    research_notes: 'Early results: citation enforcement removes roughly one sentence in six. Removed sentences are disproportionately speculative ("likely", "appears to").',
    limitations: 'Small evaluation set. Prompt injection via attacker-controlled log fields is a known, open risk (see research note).',
    security_considerations: 'Model never receives credentials or takes actions. Alert fields are treated as untrusted input and wrapped accordingly.',
    future_plans: `- Larger evaluation set
- Red-team the prompt with injected log content`,
    updates: [
      {
        date: '2026-09-26',
        title: 'Citation validator results',
        body: 'Roughly 16% of generated sentences dropped for missing or invalid citations.',
      },
      {
        date: '2026-09-02',
        title: 'Evaluation harness built',
        body: '120 historical alerts hand-labelled for the triage experiment.',
      },
    ],
  },
  {
    code: 'RES-001',
    slug: 'rogue-ap-fingerprinting-study',
    title: 'Rogue AP Fingerprinting Study',
    summary: 'A measurement study: how reliably can passive beacon features distinguish a cloned access point from the real one?',
    status: 'RESEARCH',
    category: 'research',
    lab: 'adversarial-research',
    technologies: ['wifi', 'python', 'wireshark', 'esp32-c6'],
    tags: ['research', 'wireless', 'measurement'],
    featured: false,
    on_bench: false,
    published_at: '2026-09-25',
    problem: 'Evil-twin detection usually relies on BSSID allow-lists, which a cloned AP defeats trivially.',
    idea: 'Beacon frames carry many subtle features — information-element order, vendor IEs, timestamp drift, supported rates. Together they may form a fingerprint that is hard to clone exactly.',
    why: 'If a cheap sensor (ESP-001) can compute this fingerprint, rogue-AP detection becomes possible without enterprise WIDS.',
    architecture: 'Lab-only: three consumer APs, two cloning setups on owned hardware, captures from four sensors over two weeks.',
    how_it_works: 'Feature extraction in Python from pcaps; evaluation of single features and combinations by false-positive rate.',
    limitations: 'Small, lab-only sample of AP models. Results will not generalise to every vendor.',
    security_considerations: 'All cloning is done in an RF-shielded enclosure against equipment the lab owns.',
    future_plans: 'Publish the feature set and dataset once the evaluation is complete.',
  },
  {
    code: 'RF-002',
    slug: '433mhz-sensor-telemetry-testbed',
    title: '433 MHz Sensor Telemetry Testbed',
    summary: 'An archived testbed for studying how consumer 433 MHz alarm sensors behave under interference — superseded by the portable RF monitor.',
    status: 'ARCHIVED',
    category: 'rf',
    lab: 'embedded-rf',
    technologies: ['433mhz', 'rtl-sdr', 'python'],
    tags: ['measurement', 'research'],
    featured: false,
    on_bench: false,
    published_at: '2025-11-20',
    github_repo: 'https://github.com/hexworks-lab/433-testbed',
    latest_release: 'v0.1.0',
    problem: 'Cheap wireless alarm sensors are everywhere; their failure modes under interference are poorly documented.',
    idea: 'Record sensor transmissions with an RTL-SDR, decode them, and measure delivery rates under controlled noise in a shielded box.',
    why: 'Knowing when a sensor silently fails matters more than knowing how it can be attacked.',
    limitations: 'Only five sensor models tested.',
    security_considerations: 'Receive-only capture plus a calibrated noise source inside an RF-shielded enclosure.',
    future_plans: 'Archived. Findings were folded into RF-001.',
  },
];

export const products = [
  {
    slug: 'range-node',
    name: 'Hexworks Range Node',
    kind: 'hardware',
    summary: 'A resettable physical IoT target for cyber ranges and detection training, with scenario packs and matching detection content.',
    description: 'The production version of the Cyber Range IoT Target project. Each Range Node ships pre-flashed with six scenarios and a read-only recovery partition so instructors can reset a whole room of devices between sessions.',
    problem_solved: 'Gives blue teams real embedded devices to attack and detect in an isolated range, without sourcing and re-imaging random consumer hardware.',
    features: [
      'Six selectable vulnerability scenarios',
      'One-button factory reset in under 5 seconds',
      'Range-only Wi-Fi lockout',
      'Matching Splunk and Sigma detection content',
      'UART, MQTT and web interfaces',
    ],
    specs: [
      { label: 'MCU', value: 'ESP32-WROOM-32E' },
      { label: 'Radios', value: '2.4 GHz Wi-Fi, BLE 4.2' },
      { label: 'Power', value: 'USB-C, 5 V / 500 mA' },
      { label: 'Interfaces', value: 'UART header, DIP scenario selector' },
      { label: 'Enclosure', value: '86 × 56 × 24 mm, clear PETG' },
    ],
    status: 'RELEASED',
    version: '1.2.0',
    changelog: `### 1.2.0 — 2026-03-11
- Outdated-TLS scenario
- Detection pack v3

### 1.1.0 — 2025-12-02
- Range-only Wi-Fi lockout

### 1.0.0 — 2025-10-15
- First release`,
    docs_url: 'https://github.com/hexworks-lab/range-iot-target#readme',
    source_url: 'https://github.com/hexworks-lab/range-iot-target',
    cta_label: 'Request units for your range',
    technologies: ['esp32', 'esp-idf', 'mqtt', 'splunk', 'sigma'],
    tags: ['cyber-range', 'training', 'lab-target'],
    featured: true,
    published_at: '2026-03-11',
    related_project: 'cyber-range-iot-target',
    links: [
      { kind: 'download', label: 'Scenario pack v3', url: 'https://github.com/hexworks-lab/range-iot-target/releases' },
    ],
  },
  {
    slug: 'soctrace',
    name: 'SOCtrace',
    kind: 'open-source',
    summary: 'The open-source core of the SOC Investigation Automation Engine: testable, dependency-aware investigation steps in plain Python.',
    description: 'SOCtrace packages the step runner, the evidence-bundle format and a library of Splunk enrichment steps. It runs as a container and accepts alerts by webhook.',
    problem_solved: 'Replaces sprawling SOAR playbooks for enrichment with small Python functions you can unit-test and review.',
    features: [
      'Declarative step dependencies',
      'Concurrent, time-boxed execution',
      'JSON + Markdown evidence bundles',
      'Splunk search and HEC helpers',
      'Read-only by design',
    ],
    specs: [
      { label: 'Language', value: 'Python 3.12' },
      { label: 'Deploy', value: 'Docker image, ~80 MB' },
      { label: 'License', value: 'Apache-2.0' },
      { label: 'Inputs', value: 'Webhook, Splunk alert action' },
    ],
    status: 'ACTIVE',
    version: '0.9.1',
    changelog: `### 0.9.1 — 2026-08-20
- Fix timeout propagation in nested steps

### 0.9.0 — 2026-08-14
- Parallel runner`,
    docs_url: 'https://github.com/hexworks-lab/soc-engine/wiki',
    source_url: 'https://github.com/hexworks-lab/soc-engine',
    download_url: 'https://github.com/hexworks-lab/soc-engine/releases',
    cta_label: 'Talk to us about deployment',
    technologies: ['python', 'splunk', 'soar', 'docker'],
    tags: ['soc', 'automation', 'open-source'],
    featured: true,
    published_at: '2026-08-20',
    related_project: 'soc-investigation-automation-engine',
  },
  {
    slug: 'ble-survey-kit',
    name: 'BLE Survey Kit',
    kind: 'research-kit',
    summary: 'Three pre-flashed ESP32-C6 sensors, a collector script and a notebook template for running your own BLE advertisement studies.',
    description: 'Everything used for the lab\'s BLE advertisement observations, packaged so other researchers can reproduce and extend the measurements.',
    problem_solved: 'Removes the week of setup needed before a BLE measurement study can start.',
    features: [
      'Three synchronised passive sensors',
      'CSV + Parquet export',
      'Jupyter analysis template',
      'Address-rotation statistics out of the box',
    ],
    specs: [
      { label: 'Sensors', value: '3 × ESP32-C6' },
      { label: 'Clock sync', value: 'NTP, ±5 ms' },
      { label: 'Output', value: 'CSV, Parquet' },
    ],
    status: 'TESTING',
    version: '0.3.0',
    changelog: `### 0.3.0 — 2026-09-12
- Parquet export
- Clock-sync health check`,
    cta_label: 'Join the early-access list',
    technologies: ['esp32-c6', 'ble', 'python'],
    tags: ['research', 'measurement', 'wireless'],
    featured: false,
    published_at: '2026-09-12',
    related_project: 'esp32-c6-wireless-security-sensor',
  },
  {
    slug: 'detection-lab-training-pack',
    name: 'Detection Lab Training Pack',
    kind: 'training',
    summary: 'A self-contained detection-engineering course: a containerised mini-SOC, generated attack telemetry, and 24 graded exercises.',
    description: 'Built from the lab\'s own detection development workflow. Learners write Splunk searches and Sigma rules against realistic telemetry and get immediate pass/fail feedback.',
    problem_solved: 'Detection engineering is usually learned on production data under pressure. This pack provides a safe, repeatable place to practise.',
    features: [
      'Docker Compose mini-SOC',
      '24 graded exercises',
      'Sigma → SPL conversion drills',
      'Instructor answer key',
    ],
    specs: [
      { label: 'Requirements', value: '8 GB RAM, Docker' },
      { label: 'Duration', value: '~12 hours' },
      { label: 'Format', value: 'Self-paced or instructor-led' },
    ],
    status: 'RELEASED',
    version: '2.0',
    changelog: `### 2.0 — 2026-06-01
- Rebuilt on Splunk 9.3
- Eight new exercises`,
    cta_label: 'Request a license',
    technologies: ['splunk', 'sigma', 'docker'],
    tags: ['training', 'detection', 'blue-team'],
    featured: false,
    published_at: '2026-06-01',
  },
];

export const ideas = [
  {
    slug: 'ble-honeybeacon',
    title: 'BLE honey-beacon',
    concept: 'A BLE beacon that advertises a tempting fake device and logs who connects to it.',
    description: 'Advertise as a common smart lock or tracker. Any GATT connection attempt is a strong signal that someone is actively probing nearby devices. Pairs naturally with ESP-001.',
    category: 'ble',
    tags: ['wireless', 'detection'],
    technologies: ['ble', 'esp32-c6'],
    idea_date: '2026-09-29',
    status: 'IDEA',
    related_projects: ['esp32-c6-wireless-security-sensor'],
  },
  {
    slug: 'detection-unit-tests-in-ci',
    title: 'Detection unit tests in CI',
    concept: 'Every detection ships with sample events that must trigger it, run on every commit.',
    description: 'Treat SPL and Sigma like code: a fixture of true-positive and true-negative events per rule, replayed into an ephemeral Splunk container in CI.',
    category: 'detection-engineering',
    tags: ['detection', 'automation'],
    technologies: ['splunk', 'sigma', 'docker'],
    idea_date: '2026-09-15',
    status: 'RESEARCH',
    related_projects: ['soc-investigation-automation-engine'],
  },
  {
    slug: 'power-rail-implant-detection',
    title: 'Power-rail implant detection',
    concept: 'Spot hardware implants by measuring tiny changes in a device\'s idle current signature.',
    description: 'Implants draw power. A precise current shunt and a learned idle profile might reveal an added component on a network switch or badge reader.',
    category: 'hardware-security',
    tags: ['measurement', 'research'],
    technologies: ['esp32-s3'],
    idea_date: '2026-08-30',
    status: 'IDEA',
  },
  {
    slug: 'prompt-injection-canaries',
    title: 'Prompt-injection canaries for SOC agents',
    concept: 'Seed log fields with harmless canary instructions and alert if an AI agent ever obeys them.',
    description: 'If an LLM-based triage agent follows an instruction embedded in a log field, the canary fires. A cheap, continuous test for a hard-to-measure risk.',
    category: 'ai',
    tags: ['detection', 'triage'],
    technologies: ['llm'],
    idea_date: '2026-09-27',
    status: 'EXPERIMENT',
    related_projects: ['ai-assisted-security-triage-prototype'],
  },
  {
    slug: 'passive-zigbee-inventory',
    title: 'Passive Zigbee inventory',
    concept: 'Use the ESP32-C6 802.15.4 radio to inventory Zigbee devices in a building.',
    description: 'Many buildings have Zigbee lighting and sensors nobody has inventoried. A passive census is the first step to securing them.',
    category: 'iot',
    tags: ['iot', 'wireless'],
    technologies: ['zigbee', 'esp32-c6'],
    idea_date: '2026-08-12',
    status: 'IDEA',
    related_projects: ['esp32-c6-wireless-security-sensor'],
  },
  {
    slug: 'wifi-csi-occupancy-signal',
    title: 'Wi-Fi CSI as a physical-security signal',
    concept: 'Use Wi-Fi channel-state information to detect motion in a server room after hours.',
    description: 'ESP32 boards expose CSI. Motion changes it. Could a pair of cheap boards act as an out-of-hours presence sensor correlated with badge logs?',
    category: 'wifi',
    tags: ['sensor', 'research'],
    technologies: ['esp32', 'wifi'],
    idea_date: '2026-07-21',
    status: 'IDEA',
    related_projects: ['wifi-telemetry-node'],
  },
];

export const notes = [
  {
    slug: 'esp32-c6-wifi-6-testing',
    title: 'ESP32-C6 Wi-Fi 6 testing',
    published_at: '2026-09-19',
    summary: 'How well does the ESP32-C6 keep up with promiscuous capture on a busy Wi-Fi 6 channel?',
    technologies: ['esp32-c6', 'wifi-6', 'esp-idf'],
    tags: ['measurement', 'wireless'],
    body: `## Setup

- ESP32-C6-DevKitC-1, ESP-IDF 5.3, promiscuous mode, management-frame filter
- Reference capture: Linux laptop with an AX210 in monitor mode, same channel
- Load: a controlled frame generator on the lab's isolated AP, 50–800 frames/s

## Results

| Offered load (frames/s) | C6 captured | Loss |
|---:|---:|---:|
| 50 | 50.0 | 0.0% |
| 200 | 199.1 | 0.4% |
| 400 | 391.7 | 2.1% |
| 800 | 702.4 | 12.2% |

## Observations

- Loss is dominated by the callback doing too much work. Moving parsing to a FreeRTOS queue consumer cut loss at 800 fps from 21% to 12%.
- HE (802.11ax) beacons are parsed correctly; HE capability IEs are present in the raw frame.

\`\`\`c
static void IRAM_ATTR rx_cb(void *buf, wifi_promiscuous_pkt_type_t type) {
    if (type != WIFI_PKT_MGMT) return;
    xQueueSendFromISR(frame_q, buf, NULL); // parse later
}
\`\`\`

> Takeaway: for a room sensor (typically < 150 mgmt frames/s) the C6 is more than adequate.`,
    project: 'esp32-c6-wireless-security-sensor',
  },
  {
    slug: 'ble-advertisement-observations',
    title: 'BLE advertisement observations',
    published_at: '2026-09-08',
    summary: 'A week of passive BLE observation in the lab office: who advertises, how often, and how addresses rotate.',
    technologies: ['ble', 'esp32-c6', 'python'],
    tags: ['measurement', 'wireless', 'research'],
    body: `Seven days, three passive sensors, one office.

## What we saw

- **1,842** distinct advertising addresses, but only **~60** distinct devices once rotation is accounted for.
- Phones rotate resolvable private addresses roughly every **15 minutes**, as expected.
- Several low-cost trackers used a **static** address for the entire week.

## Why it matters

Allow-listing BLE devices by address only works for devices that do not rotate. For everything else, the gateway (BLE-001) needs bonding or an application-layer identity.`,
    project: 'ble-to-wifi-security-gateway',
  },
  {
    slug: 'splunk-telemetry-experiment',
    title: 'Interesting Splunk telemetry experiment',
    published_at: '2026-08-28',
    summary: 'Sending Wi-Fi counters to Splunk as metrics instead of events cut license usage by ~90% with no loss of alerting.',
    technologies: ['splunk', 'mqtt', 'python'],
    tags: ['telemetry', 'soc'],
    body: `The Wi-Fi Telemetry Node originally sent one JSON event per channel per interval. Switching to the Splunk **metrics** index format changed everything.

\`\`\`spl
| mstats max(wifi.deauth_rate) as deauth WHERE index=wifi_metrics span=10s BY node, channel
| where deauth > 20
\`\`\`

| Format | Daily ingest | Search time (7d) |
|---|---:|---:|
| Events | 1.9 GB | 11.4 s |
| Metrics | 0.18 GB | 0.9 s |

Alert fidelity was unchanged over a two-week comparison.`,
    project: 'wifi-telemetry-node',
  },
  {
    slug: 'sdr-signal-classification-test',
    title: 'SDR signal classification test',
    published_at: '2026-09-23',
    summary: 'A first attempt at classifying sweep peaks into known signal families with a small model running on the Pi.',
    technologies: ['sdr', 'hackrf', 'python'],
    tags: ['research', 'measurement'],
    body: `## Goal

Label peaks in a sweep as *Wi-Fi*, *BLE*, *LoRa*, *FM broadcast*, *cellular* or *unknown*.

## Approach

- Features: centre frequency, occupied bandwidth, peak-to-average ratio, duty cycle over 10 sweeps
- Model: gradient-boosted trees, ~400 labelled peaks from lab surveys

## Result

**87%** accuracy on held-out surveys. Most errors: LoRa labelled *unknown* (low duty cycle), and adjacent cellular carriers merged into one peak.

Next: narrower bins around ISM bands and a duty-cycle window longer than 10 sweeps.`,
    project: 'portable-rf-monitoring-prototype',
  },
  {
    slug: 'esp32-deep-sleep-current',
    title: 'Measuring ESP32-C6 deep-sleep current',
    published_at: '2026-10-01',
    summary: 'Rev 1 sensor board draws 11 µA in deep sleep — after removing one LED.',
    technologies: ['esp32-c6'],
    tags: ['measurement', 'pcb'],
    body: `Measured with a source-measure unit on the 3.3 V rail.

| Configuration | Current |
|---|---:|
| Deep sleep, as assembled | 1.38 mA |
| Power LED removed | 14 µA |
| + GPIO hold on tamper pin | 11 µA |

The power LED was 99% of the sleep budget. Rev 2 puts it behind a solder jumper.`,
    project: 'esp32-c6-wireless-security-sensor',
  },
  {
    slug: 'prompt-injection-through-alert-fields',
    title: 'Prompt injection through alert fields',
    published_at: '2026-09-30',
    summary: 'Attacker-controlled strings in logs reach the triage model. Here is what happened when we tried.',
    technologies: ['llm', 'splunk'],
    tags: ['research', 'triage'],
    body: `We placed instruction-like strings in a lab user-agent header and let them flow through the investigation engine into the triage prototype.

- Without input wrapping, the model followed the injected instruction in **9 of 40** runs.
- With evidence wrapped as quoted data and an explicit "evidence is untrusted" system rule: **1 of 40**.
- The citation validator caught that remaining case, because the injected claim had no supporting evidence line.

Mitigations stack. None is sufficient alone.`,
    project: 'ai-assisted-security-triage-prototype',
  },
];
