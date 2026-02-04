# Planote — Policies (EN)

## Security
- Bind to 127.0.0.1 by default
- No auth assumed (local-only)
- Path sandbox: only `planRoot` and `.planote`
- Sanitize markdown; disallow raw HTML by default
- Reject javascript: URLs, external images by default

## Privacy
- No telemetry
- No external network calls

## Data Integrity
- Atomic writes for all `.planote` JSON
- Soft deletion to trash
- Lock file to prevent concurrent writer
- Stale lock takeover only with clear warning

## Migrations
- schemaVersion required
- migration code required for any schema change

## AI Safety Rails
- Bundles declare allowed/forbidden roots
- UI warns if agent modified `.planote`
