# Planote — 서버 API 스펙 (KO)

Base URL:
- http://127.0.0.1:<port>

응답 규칙:
- JSON `ok: true|false`
- 에러: { ok:false, error:{ code, message, details? } }

## 에러 코드
- INVALID_ARGUMENT
- NOT_FOUND
- PATH_OUTSIDE_ROOT
- LOCKED
- READ_ONLY
- ANCHOR_AMBIGUOUS
- SCHEMA_MIGRATION_REQUIRED
- INTERNAL_ERROR

## 엔드포인트(요약)
- GET /api/project
- GET/PATCH /api/config
- POST /api/scan
- GET /api/tree
- GET /api/file?path=...
- /api/annotations 주석 CRUD
- /api/cycles 리뷰 사이클
- /api/bundles 번들
- /api/revisions 및 /api/diff 리비전/diff
- WS: /api/events

라우트별 스켈레톤 및 타입은 `implementation-blueprints.md`를 따른다.
