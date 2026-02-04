# Planote — 데이터 모델 & 저장 구조 (KO)

## 0) 저장 철학
- 기본은 `.planote/` 아래 sidecar 저장.
- 엔티티 1개 = 파일 1개(특히 주석 충돌 감소).
- 원자적 저장: temp 작성 후 rename(또는 write-file-atomic 사용).
- 사람이 읽을 수 있는 JSON(안정적 필드 순서).

## 1) 폴더 레이아웃
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
    <revisionId>.patch
  trash/
    annotations/
      <annotationId>.json

## 2) ID 규칙
- annotationId/cycleId/bundleId/revisionId: UUIDv7 권장
- fileId: repo-relative path 기반 sha256 해시
- sectionId:
  1) 헤딩에 `{#my-id}`가 있으면 그것
  2) 없으면 자동 생성: `h:<slug(title)>:<shortHash(lineStart+path)>`
  - 헤딩 변경 시를 대비해 alias를 저장한다.

## 3) 설정 스키마(`.planote/config.json`)
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

## 4) 인덱스 매니페스트(`.planote/index/manifest.json`)
목적: 증분 스캔.
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

## 5) 파일 캐시(`.planote/index/files/<fileId>.json`)
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

## 6) 주석 스키마(`.planote/annotations/<annotationId>.json`)
(이 문서의 JSON 형태를 정본으로 하며, 코드에서는 zod로 검증한다.)

핵심 룰:
- `deleted.isDeleted=true`면 소프트 삭제(trash 이동).
- `anchor.matchState`: ok | ambiguous | not_found | needs_attention

## 7) 리뷰 사이클 스키마
- title/status
- 포함된 annotationIds
- baseSnapshot(git + 파일 해시)
- bundle/revision 참조

## 8) 번들 메타 스키마
- bundleId/cycleId
- 생성된 파일 경로(prompt/json)
- 결정적 정렬 메타데이터
- 체크섬

## 9) 리비전 스키마
- cycleId, base/head
- patch 경로
- 자동 링크 추천

## 10) 마이그레이션
- 모든 스키마는 `schemaVersion` 필수.
- 스키마 변경 시 마이그레이션 코드 필수.
- 알 수 없는 필드를 조용히 버리지 않는다.

## 11) 머지 충돌 전략
- 주석 1개=파일 1개로 충돌 최소화.
- JSON 안정적 stringify 필요.
- 읽기만 했는데 timestamp churn 발생 금지.
