# Planote — Server API Spec (EN)

Base URL:
- http://127.0.0.1:<port>

All responses:
- JSON with `ok: true|false`
- Errors: { ok:false, error:{ code, message, details? } }

## Error Codes
- INVALID_ARGUMENT
- NOT_FOUND
- PATH_OUTSIDE_ROOT
- LOCKED
- READ_ONLY
- ANCHOR_AMBIGUOUS
- SCHEMA_MIGRATION_REQUIRED
- INTERNAL_ERROR

## Endpoints (summary)
- GET /api/project
- GET/PATCH /api/config
- POST /api/scan
- GET /api/tree
- GET /api/file?path=...
- CRUD annotations under /api/annotations
- cycles under /api/cycles
- bundles under /api/bundles
- revisions/diff under /api/revisions and /api/diff
- WS: /api/events

See `implementation-blueprints.md` for route-by-route skeletons and typed request/response shapes.
