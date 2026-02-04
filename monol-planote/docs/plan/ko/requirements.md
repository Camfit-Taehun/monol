# Planote — 요구사항 (KO)

## 0) 요구사항 레벨
- MUST: MVP/WP 완료에 필수
- SHOULD: v1 완성에 필요
- COULD: 로드맵

## 1) 기능 요구사항(FR)
### FR-001 Plan Root 탐색
- MUST: Project Root와 Plan Root를 결정한다.
- 기본값: `plan/`이 있으면 Plan Root = `plan/`, 없으면 `planote init` 실행을 안내한다.
- 수용 기준:
  - `plan/`이 있는 프로젝트에서 `planote serve` 실행 시 트리가 로드된다.
  - plan root가 없으면 “해결 방법이 포함된” 에러를 보여준다(`planote init`).

### FR-002 하이어라키 뷰(폴더/파일/헤딩)
- MUST: 트리 뷰에 폴더, 마크다운 파일, 파일 내부 헤딩이 모두 표시된다.
- MUST: 헤딩은 레벨(H1..H6) 기반으로 중첩이 표현된다.
- MUST: 노드 클릭 시 프리뷰가 열리고 해당 섹션으로 스크롤된다.
- 수용 기준:
  - 파일 추가/삭제/수정 시 트리가 업데이트된다(워치 모드).
  - 대용량 파일은 파싱 진행 표시가 있다.

### FR-003 마크다운 프리뷰 렌더링
- MUST: 마크다운을 안전하게 렌더(sanitize)한다.
- MUST: 링크/이미지(로컬 상대 경로)를 안전하게 처리한다.
- 수용 기준:
  - 마크다운 내 XSS 시도가 실행되지 않는다.
  - 상대 링크는 plan root 내부면 Planote 내부 이동, 외부면 경고 표시.

### FR-004 주석 CRUD
- MUST: 주석은 다음 대상에 달 수 있다:
  - 파일(문서 단위),
  - 섹션(헤딩 노드),
  - 선택 영역(프리뷰에서 드래그한 텍스트).
- MUST: 필드: title(옵션), body, type, status, priority, tags
- MUST: 목록/필터/수정/해결/재열기/삭제(기본 소프트 삭제)
- 수용 기준:
  - 리로드/재시작 후에도 주석이 유지된다.
  - 삭제는 복구 없이 영구 삭제되지 않는다(trash).

### FR-005 구조화된 수정 요청
- MUST: 주석에 구조화 편집 액션을 포함할 수 있다:
  - replace, insert_before, insert_after, delete, rewrite_section
- MUST: 각 액션은 포함해야 한다:
  - target(섹션 또는 선택)
  - instruction
  - acceptance(짧은 완료 기준)
- 수용 기준:
  - 번들 생성기가 이를 “결정적”으로 출력한다.

### FR-006 앵커 내구성(재매칭)
- MUST: 선택 주석은 quote+context를 저장하고 편집 후 재매칭을 시도한다.
- MUST: 재매칭이 모호/실패하면:
  - "needs attention" 상태 표시
  - UI에서 수동 재앵커(새 대상 선택)
- 수용 기준:
  - 선택 앞의 작은 편집 정도는 대부분 하이라이트 유지.

### FR-007 리뷰 사이클
- MUST: 주석을 선택해 리뷰 사이클을 만든다(기본: open 전체).
- MUST: 사이클은 베이스 스냅샷(파일 해시 + git 상태 옵션)을 저장한다.
- MUST: 사이클에서 번들을 생성할 수 있다.
- 수용 기준:
  - 사이클은 닫기 전까지 재열람 가능.
  - 베이스 스냅샷은 사이클 내에서 불변.

### FR-008 번들 생성
- MUST: 번들 포맷:
  - 프롬프트 Markdown(사람+AI용)
  - 구조화 JSON(툴링용)
- MUST: 파일 → 섹션 순으로 그룹핑한다.
- MUST: 전체 문서가 아닌 최소 컨텍스트 스니펫만 포함한다.
- 수용 기준:
  - 동일 주석 입력이면 번들 출력 순서가 동일하다.

### FR-009 리비전 감지 + diff 뷰
- SHOULD: 변경 감지:
  - git repo이면 git diff
  - 아니면 스냅샷 해시 비교
- SHOULD: diff 표시:
  - 파일 리스트 + unified 기본
  - side-by-side 옵션
- MUST: 변경된 파일/섹션을 관련 주석과 연결(자동 추천)
- 수용 기준:
  - 주석을 “이 리비전으로 해결됨” 처리 가능.

### FR-010 업무 링크
- MUST: Plan Node 또는 Annotation에 외부 링크(URL+옵션 title/status) 연결
- SHOULD: 트리에서 롤업 상태 표시
- 수용 기준:
  - 링크는 영속적이며 편집 가능.

### FR-011 검색/내비게이션
- MUST: 검색 범위:
  - 파일명, 헤딩, 주석 본문/태그
- MUST: 트리/주석에 키보드 내비게이션 제공
- 수용 기준:
  - 일반 규모에서 500ms 이내 결과 표시.

### FR-012 Import/Export
- SHOULD: 사이클/번들을 `.planote/bundles/`로 내보내기
- SHOULD: 주석 JSON 내보내기(백업)
- COULD: 다른 구조에서 import

## 2) 비기능 요구사항(NFR)
### NFR-001 보안
- MUST: 기본 바인딩은 `127.0.0.1`
- MUST: 마크다운 렌더 sanitize
- MUST: path traversal 방지
- MUST: 텔레메트리 없음

### NFR-002 신뢰성/무결성
- MUST: `.planote/` JSON 원자적 저장
- MUST: 크래시 후 JSON 손상 없음
- SHOULD: 동시 실행 방지 락

### NFR-003 성능
- MUST: 1,000개 md 또는 50MB까지 10초 이내 인덱싱(일반 PC)
- SHOULD: 변경 파일만 재파싱(증분)
- MUST: 스캔 중에도 UI 반응성 유지

### NFR-004 호환성
- MUST: macOS/Windows/Linux
- MUST: Node >= 20
- MUST: git/non-git 모두 지원

### NFR-005 접근성
- SHOULD: 핵심 플로우 키보드 가능
- SHOULD: 대비/하이라이트 접근성
- SHOULD: 스크린리더 친화적

## 3) 릴리즈 게이트
- MUST 항목은 자동 테스트 또는 문서화된 수동 QA로 통과
- 데이터 유실 버그 없음
- 보안 MUST는 테스트+수동 체크로 검증
