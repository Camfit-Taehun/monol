---
description: "두 스킬 간 A/B 비교 시험"
argument-hint: "<baseline> <challenger>"
allowed-tools: [Read, Write, Bash, Glob, Grep]
---

# /compare - A/B 비교 시험

기존 스킬(baseline)과 새 스킬(challenger) 간의 A/B 시험을 시작합니다.

## 사용법

```
/compare <baseline-name> <challenger-name>    # 시험 시작
/compare --status <trial-id>                  # 시험 상태 확인
/compare --list                               # 진행 중인 시험 목록
```

## 비교 프로세스

1. **시험 생성**: baseline과 challenger 식별
2. **병행 실행**: 동일 컨텍스트에서 두 스킬 실행
3. **점수 수집**: 품질, 속도, 만족도 측정
4. **결과 분석**: 통계적 유의성 평가
5. **권고 생성**: 승격/강등/유지 권고

## 실행 절차

### 1. 시험 설정

```yaml
# 시험 파라미터
trial:
  baseline: <baseline-name>
  challenger: <challenger-name>
  minTrials: 10
  confidenceThreshold: 0.7
```

### 2. 시험 실행

각 시험 라운드에서:
1. 동일한 작업/컨텍스트 선택
2. Baseline 스킬로 실행
3. Challenger 스킬로 실행
4. 양쪽 결과 비교 및 점수화

### 3. 점수 기준

**품질 (50%)**
- 정확성: 결과가 요구사항 충족
- 완전성: 누락 없는 결과
- 일관성: 반복 실행 시 동일 결과

**속도 (30%)**
- 응답 시간
- 리소스 효율성

**만족도 (20%)**
- 명시적 피드백 (👍/👎)
- 암묵적 신호 (수정 필요 여부)

### 4. 결과 판정

- **승격 (promote)**: Challenger가 60% 이상 승률
- **유지 (continue)**: 결과 불충분, 시험 계속
- **강등 (demote)**: Challenger가 30% 미만 승률
- **보관 (archive)**: Challenger 성능 현저히 낮음

## 시험 상태 확인

```
/compare --status trial_xxxxx
```

출력:
```
📊 Trial Status: trial_xxxxx

Baseline: error-handler-v1
Challenger: advanced-error-handler

Progress: 7/10 trials (70%)

Current Scores:
  Baseline wins: 2
  Challenger wins: 4
  Ties: 1

Interim Recommendation: PROMOTE (confidence: 65%)

Quality Delta: +8.5
Speed Delta: +3.2
Satisfaction Delta: +12.1

Next: 3 more trials needed for decision
```

## 시험 결과 기록

각 라운드 완료 후:

```bash
# 결과 기록 (수동)
monol-learn record-trial <trial-id> \
  --baseline-quality 75 \
  --baseline-speed 80 \
  --challenger-quality 82 \
  --challenger-speed 78 \
  --context "error handling in async function"
```

## 예시 워크플로우

```
1. 새 스킬 발견
   /discover plugins
   → advanced-error-handler 발견됨

2. 기존 스킬과 비교 시작
   /compare error-handler advanced-error-handler
   → Trial trial_abc123 시작됨

3. 실제 작업에서 시험
   [에러 처리 작업 수행 - 양쪽 방식으로]

4. 결과 확인
   /compare --status trial_abc123
   → 10회 완료, "promote" 권고

5. 승격 실행
   → advanced-error-handler가 active 상태로 승격
   → error-handler-v1은 archive 또는 유지
```

## 옵션

- `--min-trials <n>`: 최소 시험 횟수 (기본: 10)
- `--force`: 이미 진행 중인 시험이 있어도 새로 시작
- `--cancel <trial-id>`: 시험 취소
