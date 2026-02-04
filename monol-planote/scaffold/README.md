# Scaffold repos (WP0–WP7)

These folders are **complete, runnable templates** for each Work Package (WP).

- `scaffold/wp0` = baseline repo (server + UI + tests)
- `scaffold/wp1` = WP0 + indexing + watch + WS events
- ...
- `scaffold/wp7` = full feature set (nodes, search, rollups, work links)

## How to use
### Option A) Start fresh from a WP
1. Copy the entire contents of `scaffold/wpX/` into your repo root.
2. Run:
   - `npm install`
   - `npm run dev`
3. Follow the WP checklists in `plan/en/implementation-blueprints-full.md`.

### Option B) Incrementally merge into an existing repo
- Use a diff/merge tool.
- Copy files listed in each WP section.

## Notes
- These scaffolds assume Node 20+.
- English docs are canonical.
