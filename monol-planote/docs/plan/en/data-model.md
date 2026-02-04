# Planote — Data Model & Storage (EN)

## 0) Storage philosophy
- Sidecar storage under `.planote/` by default.
- One entity per file to reduce merge conflicts (esp. annotations).
- Atomic writes: write temp + rename (or use write-file-atomic).
- Human-inspectable JSON (stable ordering).

## 1) Folder Layout
.planote/
  config.json
  lock.json
  index/
    manifest.json
    files/
      <fileId>.json
  annotations/
    <annotationId>.json
  cycles/
    <cycleId>.json
  bundles/
    <bundleId>.md
    <bundleId>.json
    <bundleId>.meta.json
  revisions/
    <revisionId>.json
    <revisionId>.patch (optional cached)
  trash/
    annotations/
      <annotationId>.json

## 2) IDs
- annotationId, cycleId, bundleId, revisionId: UUIDv7 recommended.
- fileId: stable hash from repo-relative path (sha256).
- sectionId:
  1) explicit heading ID `{#my-id}` if present
  2) else auto: `h:<slug(title)>:<shortHash(lineStart+path)>`
  - store aliases to help rematching

## 3) Config Schema (`.planote/config.json`)
```json
{
  "schemaVersion": 1,
  "projectRoot": ".",
  "planRoot": "plan",
  "ignoreGlobs": ["**/.planote/**", "**/node_modules/**"],
  "server": { "host": "127.0.0.1", "port": 0, "openBrowser": true },
  "author": { "name": "", "email": "" },
  "features": { "gitIntegration": true, "sideBySideDiff": true }
}
```

## 4) Index Manifest (`.planote/index/manifest.json`)
Purpose: incremental scanning.
```json
{
  "schemaVersion": 1,
  "generatedAt": "2026-01-31T00:00:00.000Z",
  "planRoot": "plan",
  "files": {
    "plan/requirements.md": {
      "fileId": "file_...",
      "mtimeMs": 0,
      "size": 0,
      "sha256": "..."
    }
  }
}
```

## 5) Indexed File Cache (`.planote/index/files/<fileId>.json`)
```json
{
  "schemaVersion": 1,
  "fileId": "file_...",
  "path": "plan/requirements.md",
  "sha256": "...",
  "headings": [
    {
      "sectionId": "h:fr-001:11aa22",
      "level": 3,
      "title": "FR-001 Plan Root discovery",
      "lineStart": 10,
      "lineEnd": 30,
      "charStart": 120,
      "charEnd": 900
    }
  ]
}
```

## 6) Annotation Schema (`.planote/annotations/<annotationId>.json`)
(See the canonical JSON shape in this file; schema is enforced by zod in code.)

Key rules:
- `deleted.isDeleted=true` means soft-deleted (moved to trash).
- `anchor.matchState` can be: ok | ambiguous | not_found | needs_attention.

## 7) Review Cycle Schema (`.planote/cycles/<cycleId>.json`)
Stores:
- title, status
- included annotations
- baseSnapshot (git info + file hashes)
- refs to bundles and revisions

## 8) Bundle Meta Schema
Stores:
- bundleId, cycleId
- paths to generated prompt/json
- deterministic ordering metadata
- checksums

## 9) Revision Schema
Stores:
- cycleId, base/head (git commits or snapshot)
- patch path
- auto-link suggestions

## 10) Migrations
- All schemas include `schemaVersion`.
- Schema change requires migration code.
- Never drop unknown fields silently.

## 11) Merge-conflict strategy
- One annotation per file reduces conflicts.
- Canonical JSON stringify order required.
- Avoid timestamp churn on read-only operations.
