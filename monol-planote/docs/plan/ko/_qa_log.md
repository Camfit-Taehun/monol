# Planote — 수동 QA 로그

> Claude Code must append an entry at the end of each WP.

## 템플릿
### YYYY-MM-DD WPx
- Commands run:
  -
- Expected:
  -
- Actual:
  -
- Bugs found & fixed:
  -
- Remaining known issues:
  -
- Notes:
  -

---

## 2026-02-03 History 기능 (버전 관리 시스템)

### 환경
- OS: macOS Darwin 25.2.0
- Node: v20.x
- 서버: http://127.0.0.1:8787

### 실행 명령어
```bash
npm run dev
curl http://127.0.0.1:8787/api/history/files
curl http://127.0.0.1:8787/api/snapshots
curl -X POST http://127.0.0.1:8787/api/history/file/plan%2FREADME.md/version
curl http://127.0.0.1:8787/api/history/file/plan%2FREADME.md/diff?from=...&to=...
curl -X POST http://127.0.0.1:8787/api/snapshots -d '{"name": "...", "description": "..."}'
curl -X POST http://127.0.0.1:8787/api/history/file/.../restore?versionId=...
curl http://127.0.0.1:8787/api/snapshots/:id/diff
```

### 테스트 결과

| # | 테스트 항목 | 예상 | 실제 | 결과 |
|:-:|------------|------|------|:----:|
| 1 | 수동 버전 생성 | 버전 생성됨 | `createdBy: "manual"` 버전 생성 | ✅ |
| 2 | 자동 버전 생성 | 파일 수정 5초 후 버전 생성 | `createdBy: "auto"` 버전 생성 | ✅ |
| 3 | 파일 목록 API | 버전 있는 파일 목록 | `versionCount` 포함 목록 반환 | ✅ |
| 4 | 버전 이력 API | 파일별 버전 목록 | 최신순 정렬된 버전 목록 | ✅ |
| 5 | Diff API | 두 버전 간 diff | unified diff 정상 생성 | ✅ |
| 6 | 버전 복원 (추출) | 새 파일로 추출 | 지정 경로에 파일 생성 | ✅ |
| 7 | 스냅샷 생성 | plan/ 전체 스냅샷 | fileManifest + git 정보 포함 | ✅ |
| 8 | 스냅샷 목록 | 스냅샷 목록 | id, name, createdAt, fileCount 반환 | ✅ |
| 9 | 스냅샷 Diff | 현재 상태와 비교 | unchanged/modified/added/deleted 상태 | ✅ |
| 10 | 저장소 구조 | CAS 구조 | `.planote/history/content/{hash[0:2]}/` 정상 | ✅ |

### 저장소 구조 확인
```
.planote/
├── history/
│   ├── index.json              ✅
│   ├── versions/
│   │   └── {pathHash}/         ✅
│   │       └── {versionId}.json
│   └── content/                ✅ (CAS)
│       └── {hash[0:2]}/
│           └── {hash}.txt
└── snapshots/
    ├── manifest.json           ✅
    └── {snapshotId}.json       ✅
```

### 발견된 버그
- 없음

### 남은 이슈
- UI 통합 테스트 필요 (History 패널)
- ESLint 설정 파일 누락 (`eslint.config.js`)
- 유닛 테스트 추가 필요

### 참고
- 빌드: `npm run build` ✅ 성공
- 테스트: `npm test` ✅ 4개 통과
