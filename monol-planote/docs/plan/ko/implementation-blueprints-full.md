# 구현 블루프린트 — FULL (WP0–WP7)

이 문서는 Planote를 **빈틈 없이(end-to-end) 구현**하기 위한 **FULL 블루프린트**입니다.  
각 WP는 아래의 **파일 단위 1:1 템플릿(실행 가능한 scaffold)** 와 쌍으로 제공됩니다.

- `scaffold/wp0/` … `scaffold/wp7/`

가장 빠른 방법은 **원하는 WP를 선택**해서 해당 scaffold를 레포 루트로 복사하는 것입니다.  
엄격한 단계별 구현을 원하면 WP0 → WP7 순서대로 진행하세요.

> 기준 규칙: EN과 KO 문서가 충돌하면 **영문(`plan/en`)을 정답(기준)으로** 봅니다.

---

## 목표 레포 구조

```
.
├─ src/
│  ├─ cli/
│  ├─ core/
│  └─ server/
├─ ui/
├─ plan/
└─ .planote/        (런타임 데이터; 자동 생성)
```

### `.planote/` 런타임 데이터
- `.planote/config.json` — 설정(없으면 기본값 사용)
- `.planote/index/**` — 인덱싱 산출물
- `.planote/annotations/**` — 주석(Annotation) 레코드
- `.planote/cycles/**` — 사이클(Cycle) 레코드
- `.planote/bundles/**` — 번들(Bundle) 레코드
- `.planote/revisions/**` — 리비전(Revision) + diff 레코드
- `.planote/nodes/**` — 노드 메타(Work link, lastOpenedAt)

---

## Scaffold 사용법

### 옵션 A — 특정 WP로 “점프”
1) `scaffold/wpX/*` 를 레포 루트로 복사(충돌 시 머지)
2) 실행:
- `npm install`
- `npm run dev`
3) 검증:
- `npm run typecheck`
- `npm test`
- `npm run e2e`

### 옵션 B — 엄격한 단계별(WP0→WP7)
각 WP마다:
1) `git checkout -b wpX`
2) `scaffold/wpX` 를 머지(또는 이전 scaffold와 diff)
3) 체크 실행
4) 커밋/태그

---

# WP0 — 베이스라인: 서버 + UI + 테스트

**템플릿:** `scaffold/wp0/`

## 목표
- Fastify 서버(`/api/project`)
- Vite+React UI에서 `/api/project` 출력
- Vitest 단위 테스트 + Playwright E2E

## 핵심 파일
- `src/server/app.ts`, `src/server/index.ts`
- `src/server/routes/project.ts`
- `ui/src/App.tsx`
- `tests/unit/wp0_sanity.test.ts`
- `tests/e2e/wp0_smoke.spec.ts`

## 엔드포인트
- `GET /api/project`

## 체크리스트
- `npm run dev` → `http://127.0.0.1:5173` 에 UI 표시
- UI가 `/api/project` JSON을 렌더링
- `npm test` 통과
- `npm run e2e` 통과

---

# WP1 — 인덱싱 + watch + WS 이벤트

**템플릿:** `scaffold/wp1/`

## 목표
`plan/` 아래 markdown을 인덱싱하여:
- `GET /api/tree` (폴더/파일/섹션 트리)
- `WS /api/events` 로 `index:updated` 이벤트

## 추가된 주요 파일
- `src/core/indexer/*` (scan, parseHeadings, tree, watch)
- `src/core/store/config.ts`
- `src/core/events/bus.ts`
- `src/server/ws/events.ts`
- `src/server/routes/tree.ts`

## 엔드포인트
- `GET /api/tree`
- `WS /api/events` (`index:updated`, `index:error`)

## 체크리스트
- `npm run dev`
- `GET /api/tree` 가 `plan/README.md` 포함 트리 반환
- markdown 수정 시 WS로 `index:updated` 전송
- `npm test` 통과

---

# WP2 — 트리 UI + 마크다운 프리뷰

**템플릿:** `scaffold/wp2/`

## 목표
UI를 3패널로 확장:
- 좌측: 트리
- 중앙: 마크다운 프리뷰
- 우측: 자리( WP3+ )

## 변경/추가 파일
- 서버: `src/server/routes/file.ts` (`GET /api/file`)
- UI: `ui/src/components/*`
- UI: `ui/src/api/*`

## 엔드포인트
- `GET /api/file?path=plan/...`

## 체크리스트
- 트리에서 `README.md` 클릭 → 프리뷰에 내용 표시
- 섹션 노드 클릭 → 해당 제목으로 스크롤
- `npm run e2e` 통과 (`wp2_tree_preview.spec.ts`)

---

# WP3 — 주석(Annotations): 파일/섹션 단위

**템플릿:** `scaffold/wp3/`

## 목표
JSON 기반 영속 주석 기능:
- 리스트/필터링(filePath/sectionId/status)
- 생성/수정/소프트 삭제
- WS 이벤트 `annotation:changed`

## 핵심 파일
- `src/core/store/annotations.ts`
- `src/server/routes/annotations.ts`
- UI: `ui/src/components/AnnotationPanel.tsx`

## 저장 위치
- `.planote/annotations/*.json`

## 엔드포인트
- `GET /api/annotations`
- `POST /api/annotations`
- `PATCH /api/annotations/:id`
- `DELETE /api/annotations/:id`

## 체크리스트
- 우측 패널에서 주석 추가 → 리스트에 표시
- `npm run e2e` 통과 (`wp3_annotations.spec.ts`)

---

# WP4 — 선택(Selection) 앵커 + 하이라이트

**템플릿:** `scaffold/wp4/`

## 목표
선택 영역 주석(quote anchor):
- 프리뷰에서 텍스트 선택 → selection annotation 생성
- 서버에서 quote anchor를 위치(start/end)로 매칭
- 프리뷰에서 `<mark data-ann=...>` 로 하이라이트 표시

## 핵심 파일
- `src/core/anchors/*`
- `src/server/routes/anchors.ts`
- `GET /api/file` 응답에 `matches` 추가
- UI `MarkdownPreview` 하이라이트 주입

## 엔드포인트
- `POST /api/anchors/reanchor/:id`
- `GET /api/file?path=...` → `{ matches: [{annotationId,start,end}] }`

## 체크리스트
- 텍스트 선택 시 selection 주석 생성
- 프리뷰 재로딩 시 하이라이트 표시
- `npm test` 통과 (`wp4_anchor_match.test.ts`)

---

# WP5 — 사이클(Cycles) + 번들(Bundles)

**템플릿:** `scaffold/wp5/`

## 목표
주석을 사이클로 묶고 번들을 생성:
- Cycle = annotationIds 스냅샷
- Bundle = 사이클 기반 생성 산출물
  - JSON 번들
  - Prompt 번들(LLM 입력용)

## 핵심 파일
- `src/core/store/cycles.ts`
- `src/core/store/bundles.ts`
- `src/core/bundles/*`
- 서버: `src/server/routes/cycles.ts`, `src/server/routes/bundles.ts`
- UI: `CyclePanel`, `BundlePanel`

## 엔드포인트
- `GET/POST/PATCH /api/cycles`
- `GET/POST /api/bundles`
- `GET /api/bundles/:id`

## 체크리스트
- Cycle 생성 → Prompt 번들 생성 → UI에 prompt 표시
- `npm run e2e` 통과 (`wp5_cycles_bundles.spec.ts`)

---

# WP6 — Git 연동 + diff (Revisions)

**템플릿:** `scaffold/wp6/`

## 목표
Git 기반 변경 기록(diff) 캡처:
- `/api/project` 에 git/HEAD 정보 포함
- Cycle 생성 시 baseSnapshot에 git 정보 저장
- Revision 생성 시 `git diff <baseCommit>` 저장
- UI에서 diff 표시

## 핵심 파일
- `src/core/git/detect.ts`, `src/core/git/diff.ts`
- `src/core/store/revisions.ts`
- 서버: `src/server/routes/revisions.ts` (`/api/diff` 포함)
- UI: `DiffPanel`

## 엔드포인트
- `GET /api/revisions?cycleId=...`
- `POST /api/revisions`
- `GET /api/diff?revisionId=...`

## 체크리스트
- Git 레포에서: Cycle 생성 → 파일 수정 → Revision 생성 → diff 표시
- Git이 아닌 환경에서는 Revision 생성이 친절한 에러로 실패
- E2E는 환경에 따라 skip (`wp6_revisions.spec.ts`)

---

# WP7 — 노드 메타 + 검색 + 롤업 + Work links

**템플릿:** `scaffold/wp7/`

## 목표
노드 단위 메타 및 사용성 강화:
- 노드 메타 저장(`/api/nodes/meta`)
- 트리 검색 필터
- 오픈 주석 개수 롤업 배지(노드별)
- Work links 편집:
  - 노드 레벨
  - 주석 레벨(간단 prompt 기반 추가)

## 핵심 파일
- `src/core/store/nodes.ts`
- 서버: `src/server/routes/nodes.ts`
- UI: `TopBar`, `WorkLinksEditor`
- UI: `PlanTree` 배지 표시

## 엔드포인트
- `GET /api/nodes/meta?nodeId=...`
- `PATCH /api/nodes/meta?nodeId=...`

## 체크리스트
- 검색 입력 시 트리 필터링
- 오픈 주석 생성 시 배지 숫자 증가
- 노드 Work link 추가/삭제가 저장되고 재로딩됨

---

## 최종 인수 체크리스트(WP7)
- `npm run dev` 동작
- `npm run typecheck` 통과
- `npm test` 통과
- `npm run e2e` 통과 (Git 없는 환경에서는 일부 테스트 skip 가능)
- 아래를 직접 생성/확인:
  - file annotation
  - section annotation
  - selection annotation(하이라이트)
  - cycle
  - bundle prompt
  - revision diff (git repo)
  - node work link
- 트리 배지가 롤업 규칙대로 계산됨

---

## 다음 확장 포인트
- prompt 대신 정식 링크 편집 UI(모달/폼)
- 앵커 매칭 고도화(prefix/suffix, fuzzy match)
- 스키마 버전업 시 마이그레이션 추가
- 외부 노출 시 인증/권한 추가(기본은 localhost 전용 권장)
