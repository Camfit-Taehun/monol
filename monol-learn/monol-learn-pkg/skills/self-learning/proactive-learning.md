---
description: "세션 중 학습 기회를 자동으로 감지하고 기록"
trigger: always
allowed-tools: [Read, Write, Glob, Grep]
---

# Proactive Learning Skill

세션 중 학습 기회를 자동으로 감지하고 기록하는 프로액티브 스킬입니다.

## 트리거 조건

다음 상황에서 학습 프로세스 활성화:

1. **새로운 패턴 감지**
   - 반복되는 코드 구조 발견
   - 효과적인 문제 해결 접근법 식별

2. **사용자 피드백**
   - 명시적 칭찬 또는 수정 요청
   - 재시도 패턴 감지

3. **오류에서 배움**
   - 실패한 접근법 기록
   - 성공한 대안 식별

## 학습 프로세스

### 1. 감지 (Detection)

세션 중 다음을 모니터링:
- 반복 패턴 (3회 이상 유사 작업)
- 성공/실패 시퀀스
- 사용자 반응 (수정, 승인)

### 2. 추출 (Extraction)

감지된 항목에서 추출:
- 핵심 패턴/기법
- 적용 컨텍스트
- 성공/실패 요인

### 3. 기록 (Recording)

추출 결과를 기록:
```yaml
learning_point:
  type: pattern|technique|lesson
  content: "..."
  context: "..."
  effectiveness: estimated
  session_id: "..."
```

### 4. 연결 (Association)

기존 지식과 연결:
- 유사 스킬 찾기
- 관련 규칙 확인
- 보완/충돌 판단

## 자동 액션

### 높은 신뢰도 학습 (confidence > 0.8)

자동으로:
1. 레슨포인트 생성
2. 관련 스킬에 메모 추가

### 중간 신뢰도 (0.5 < confidence < 0.8)

사용자에게 확인:
```
💡 학습 기회 감지

[패턴/기법 설명]

이것을 기록할까요?
- 레슨포인트로 저장
- 나중에 검토
- 무시
```

### 낮은 신뢰도 (confidence < 0.5)

조용히 관찰 로그에만 기록

## 세션 종료 시

세션 종료 시 자동 작업:
1. 학습 포인트 요약 생성
2. 스킬 사용 통계 업데이트
3. 다음 세션을 위한 컨텍스트 저장

## 저장 위치

```
.monol/learn/
├── session-logs/
│   └── session_<id>.yaml
├── observations/
│   └── observation_<id>.yaml
└── pending-lessons/
    └── lesson_<id>.yaml
```

## 프라이버시 고려

- 민감한 코드 내용은 해시/요약만 저장
- 사용자 설정에 따라 수집 범위 조절
- 로컬 저장만 (외부 전송 없음)
