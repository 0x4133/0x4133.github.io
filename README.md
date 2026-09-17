# Ops Timeline

A single-page shift log / operations timeline. Plain HTML, CSS and JavaScript, no build step, no backend. Everything is stored in the browser's `localStorage`, so it works as a static GitHub Pages site.

## Usage

- Type a note and press **Add entry** (or Ctrl+Enter). It is stamped with the current time.
- Start a note with a time (`14:32 ...` or `1432 ...`) to backdate it to that time today. If that time is still ahead of now it is treated as yesterday. The line under the box shows exactly when the entry will be logged.
- Use the date/time field to set any timestamp explicitly.
- Tags: Note, Alert, Incident, Change, Action, Escalation, Handoff.
- Filter by search text, tag, or a single day. Toggle **UTC** to display and group by UTC instead of local time.
- **Copy day** puts that day's log on the clipboard as Markdown, ready for a handoff.
- **Export .md** downloads the entries currently shown as Markdown. **Backup .json** downloads everything; **Import** merges a backup back in (entries are matched by id).

Data never leaves the browser. Take a JSON backup before clearing site data or switching machines.

## Hosting on GitHub Pages

```sh
git init
git add .
git commit -m "Ops timeline"
git branch -M main
git remote add origin git@github.com:<user>/<repo>.git
git push -u origin main
```

Then in the repository settings choose **Pages → Deploy from a branch → main / (root)**. The site will be at `https://<user>.github.io/<repo>/`.
