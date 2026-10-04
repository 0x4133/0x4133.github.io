# Hexworks LLC — Applied Cyber R&D

**Research. Build. Break. Improve.**

The project showcase website for Hexworks LLC, an independent applied cybersecurity R&D lab. It publishes projects, products, ideas, research notes and lab-notebook updates.

- **Plain HTML + JavaScript.** No framework, no build tooling and no backend. ES modules are served as-is.
- **Hosted on GitHub Pages**, deployed by the included GitHub Actions workflow.
- **All content lives in one file:** `js/data/content.js`. Edit it, push, and the site updates.

---

## Local development

You need Node.js 18 or newer, used only for the tiny dev server and the build script. Nothing is installed with npm.

```bash
node scripts/dev-server.mjs          # http://localhost:8080
```

The dev server serves `index.html` for unknown paths, so deep links like `/technology/esp32` work, just as they do on GitHub Pages.

To preview a production build:

```bash
node scripts/build.mjs && node scripts/dev-server.mjs _site 4000
```

## Adding content

Open `js/data/content.js` and add an object to the right list. Long text fields are **Markdown**. Use backtick strings for multi-line text; inside them, escape literal backticks (for code blocks) as `` \` ``.

Images and files go in `assets/` (for example `assets/projects/my-sensor.jpg`) and are referenced by that relative path. Full `https://` URLs also work.

### Project

```js
{
  slug: 'my-new-sensor',            // URL: /project/my-new-sensor (lowercase, dashes)
  title: 'My New Sensor',
  code: 'ESP-002',                  // optional — auto-assigned from the category prefix if omitted
  status: 'PROTOTYPE',              // IDEA RESEARCH EXPERIMENT BUILDING PROTOTYPE TESTING ACTIVE RELEASED ARCHIVED
  category: 'esp32',                // a slug from `categories`
  lab: 'embedded-rf',               // cyber-systems | embedded-rf | adversarial-research | ai-security
  published_at: '2026-10-04',
  featured: true,                   // show on the home page
  on_bench: true,                   // show in "Currently on the Bench" and on /lab
  summary: 'One or two sentences for cards and link previews.',
  technologies: ['esp32-c6', 'ble', 'mqtt'],
  tags: ['sensor', 'telemetry'],
  hero_image: 'assets/projects/my-sensor.jpg',   // optional — a technical illustration is generated otherwise
  github_repo: 'https://github.com/you/repo',
  latest_release: 'v0.1.0',
  docs_url: 'https://…',
  // Markdown sections — include any, skip the rest:
  problem: '…', idea: '…', why: '…', architecture: '…', how_it_works: '…',
  hardware: '…', software: '…', research_notes: '…', limitations: '…',
  security_considerations: '…', future_plans: '…',
  media: [
    { kind: 'photo', url: 'assets/projects/board.jpg', caption: 'Rev 1 board' },   // photo | screenshot | diagram
    { kind: 'video', url: 'https://www.youtube.com/watch?v=…', caption: 'Demo' }, // YouTube, Vimeo or .mp4
    { kind: 'file', url: 'assets/files/schematic.pdf', caption: 'Schematic (PDF)' },
  ],
  links: [
    { kind: 'docs', label: 'Datasheet', url: 'https://…' },  // github docs release download video paper website other
  ],
  updates: [   // development log, in any order — the newest is shown first
    { date: '2026-10-04', title: 'Initial proof of concept completed', body: 'Optional Markdown.' },
  ],
}
```

### Product

The fields are `slug`, `name`, `kind` (`hardware`, `software`, `open-source`, `appliance`, `training` or `research-kit`), `status`, `version` and `published_at`. Optional: `summary`, `description` (Markdown), `problem_solved`, `features: [...]`, `specs: [{ label, value }]`, `changelog` (Markdown), `docs_url`, `source_url`, `download_url`, `purchase_url`, `cta_label`, `hero_image`, `technologies`, `tags`, `media`, `links`, and `related_project` (a project slug). Without a `purchase_url`, the main button goes to the contact page.

### Idea

The fields are `slug`, `title`, `concept` (one sentence), `description` (Markdown), `category`, `tags`, `technologies`, `idea_date`, `status` and `related_projects: ['project-slug']`.

### Research note

The fields are `slug`, `title`, `summary`, `body` (Markdown), `published_at`, `technologies`, `tags`, `hero_image` and `project` (a project slug).

### Categories and technologies

- **Categories** drive the topic filters and the project-ID prefixes (`ESP`, `RF`, `SOC`, …).
- **Technologies** map slugs to display names. Any slug used on content works even if it isn't listed; it just shows the raw slug.
- `/technology/<slug>` lists everything that uses a technology, category or tag. Family matches count too: `esp32` also matches `esp32-c6`.

> Everything in `content.js` is public: it ships to every visitor's browser. Don't put private or draft material in it.

## Configuration

`js/config.js` holds the company name, tagline, description, contact email and GitHub URL. The Contact and Submit-a-Problem forms don't send anything themselves. They open the visitor's email client with a pre-filled message addressed to `contactEmail`, so **set that to a real address before going live**.

## Deployment (GitHub Pages)

1. Push the repository to GitHub (default branch `main`).
2. In *Settings → Pages*, set **Source** to **GitHub Actions**.
3. *(Recommended)* In *Settings → Secrets and variables → Actions → Variables*, add `SITE_URL`, for example `https://hexworks.example` or `https://<user>.github.io/<repo>`. It's used for absolute link-preview URLs and the sitemap.
4. Push. The **Deploy to GitHub Pages** workflow builds and publishes the site.

`scripts/build.mjs` produces `_site/`. It:

- sets `<base href>` for your base path. It detects this automatically: `/` for a custom domain (`CNAME` file) or a `<user>.github.io` repo, otherwise `/<repo>/`. Override it with a `BASE_PATH` variable.
- makes `404.html` a copy of `index.html`, so deep links load directly.
- writes a static page with its own `<title>`, description and OpenGraph tags for every project, product and research note, so shared links show a proper preview card.
- generates `sitemap.xml` and `robots.txt`.

**Custom domain:** add a `CNAME` file at the repository root.

**Without Actions:** you can also serve the repository root with *Deploy from a branch*. Set `<base href>` in `index.html` and `404.html` to `/<repo>/` if needed. Deep links still work through the redirect in `404.html`, but you lose the per-project preview pages.

## Project structure

```
index.html                 app shell (CSP, fonts, CDN libraries pinned with SRI)
404.html                   deep-link fallback for GitHub Pages
css/main.css               design system (dark default, light theme)
js/
  app.js                   boot, routes, header/footer, page metadata
  router.js                History-API router aware of <base href>
  config.js                company + site settings
  data/content.js          ← all site content
  data/api.js              normalises content for the views
  lib/                     templating, Markdown rendering, generated cover art
  ui/components.js         cards, status badges, icons, lab definitions
  views/                   one module per page
assets/                    favicon, link-preview image, diagrams, your images
scripts/build.mjs          GitHub Pages build
scripts/dev-server.mjs     local static server
.github/workflows/deploy.yml
```

## Security notes

- All dynamic text is HTML-escaped. Markdown is sanitised with DOMPurify, and links are limited to `http`, `https` and `mailto`.
- A Content-Security-Policy in `index.html` lets scripts load only from this site and two CDNs, and the CDN scripts are pinned with Subresource Integrity hashes.
- There is no backend, login or form endpoint to attack. The site is entirely static.

---

All research shown here is performed on owned systems, in laboratory environments, or with explicit authorisation. See `/responsible-research`.
