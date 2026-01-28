---
description: "외부 지식 즉시 내재화"
argument-hint: "<url-or-content>"
allowed-tools: [Read, Write, Bash, WebFetch, WebSearch, Glob, Grep]
---

# /absorb - 지식 즉시 내재화

외부 URL이나 컨텐츠에서 지식을 추출하여 즉시 내재화합니다.

## 사용법

```
/absorb <url>                    # URL에서 지식 추출
/absorb --file <path>            # 로컬 파일에서 추출
/absorb --text "content"         # 직접 입력 내용 처리
```

## 내재화 대상

- **Rules**: 코딩 규칙으로 변환 → monol-rulebook
- **Skills**: Claude Code 스킬로 변환 → .claude/skills/
- **Lessons**: 학습 포인트로 저장 → monol-x/lessons/

## 처리 과정

### 1. 컨텐츠 수집

```
URL 입력 → 페이지 fetch → 마크다운 변환
파일 입력 → 파일 읽기 → 포맷 감지
텍스트 입력 → 직접 처리
```

### 2. 지식 추출

컨텐츠에서 추출 가능한 항목:
- **패턴**: 반복되는 코드 패턴
- **기법**: 문제 해결 접근법
- **규칙**: 권장/금지 사항
- **예시**: Good/Bad 코드 예시

### 3. 변환 및 저장

```yaml
추출된 패턴 → rules/learned/<pattern-name>.yaml
추출된 기법 → skills/learned/<technique-name>.md
추출된 교훈 → lessons/<lesson-name>.md
```

### 4. 검증

- 기존 규칙과 충돌 확인
- 중복 스킬 확인
- 유효성 검증

## 실행 예시

```
/absorb https://engineering.blog/error-handling-patterns
```

출력:
```
📥 Absorbing: https://engineering.blog/error-handling-patterns

🔍 분석 중...
- 페이지 크기: 15KB
- 코드 블록: 8개
- 주요 섹션: 5개

📦 추출 결과:
  Patterns: 3개
  - async-error-wrapper
  - retry-with-backoff
  - graceful-degradation

  Rules: 2개
  - always-catch-async-errors (severity: error)
  - use-typed-errors (severity: warning)

  Lessons: 1개
  - "에러 처리는 방어적으로"

💾 저장 위치:
  rules/learned/async-error-wrapper.yaml
  rules/learned/retry-with-backoff.yaml
  skills/learned/graceful-degradation.md
  lessons/error-handling-defensive.md

✅ 내재화 완료

⚠️ 주의: 새 규칙은 trial 상태입니다.
   실제 사용 후 /compare로 기존 방식과 비교하세요.
```

## 출력 형식

### Rule 파일 예시

```yaml
# rules/learned/async-error-wrapper.yaml
id: learned-async-error-wrapper
name: Async Error Wrapper Pattern
category: code/error-handling
severity: warning
description: |
  비동기 함수에서 에러를 일관되게 처리하는 래퍼 패턴

tags:
  - learned
  - async
  - error-handling

examples:
  good:
    - |
      const result = await safeAsync(riskyOperation);
      if (result.error) { /* handle */ }
  bad:
    - |
      try { await riskyOperation(); }
      catch (e) { console.log(e); }

source:
  type: absorbed
  url: https://engineering.blog/error-handling-patterns
  absorbedAt: 2026-01-24T10:30:00Z
```

### Skill 파일 예시

```markdown
---
description: "Graceful degradation pattern for unreliable services"
trigger: glob
pattern: "**/services/**/*.ts"
allowed-tools: [Read, Edit]
---

# Graceful Degradation

서비스 호출 실패 시 우아하게 대체 동작으로 전환하는 패턴

## Instructions

1. 서비스 호출 시 항상 타임아웃 설정
2. 실패 시 캐시된 데이터 또는 기본값 반환
3. 실패 로그 기록 (에러 노출 X)
...
```

## 옵션

- `--dry-run`: 실제 저장 없이 추출 결과만 확인
- `--force`: 중복 확인 없이 강제 저장
- `--category <cat>`: 저장 카테고리 지정
- `--severity <level>`: 규칙 심각도 지정 (error/warning/info)

## 연동 모듈

- **monol-rulebook**: 규칙 저장 및 동기화
- **monol-x**: 레슨 포인트 저장
- **monol-datastore**: 메타데이터 저장
