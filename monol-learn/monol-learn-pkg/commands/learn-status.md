---
description: "학습 시스템 현황 대시보드"
allowed-tools: [Read, Glob, Grep]
---

# /learn-status - 학습 현황 대시보드

자가 학습 시스템의 전체 현황을 보여줍니다.

## 사용법

```
/learn-status                    # 전체 현황
/learn-status --skills           # 스킬 현황만
/learn-status --trials           # 시험 현황만
/learn-status --schedule         # 스케줄 현황만
```

## 대시보드 구성

### 1. 스킬 현황

```
📊 Skills Overview
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Total: 45 skills

By Status:
  🟢 Active:    12 (27%)
  🔵 Trial:      8 (18%)
  ⚪ Candidate: 15 (33%)
  ⬛ Archived:  10 (22%)

By Type:
  📐 Pattern:   18
  🔧 Technique: 15
  🛠️ Tool:       7
  📏 Rule:       5

Top Performers (Active):
  1. advanced-error-handler   92.5 pts
  2. test-pattern-matcher     88.3 pts
  3. async-retry-pattern      85.1 pts
```

### 2. 시험 현황

```
🧪 Evolution Trials
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Active Trials: 3

1. trial_abc123 (7/10)
   error-handler vs advanced-error-handler
   Current: Challenger leading 4-2

2. trial_def456 (3/10)
   test-runner vs parallel-test-runner
   Current: Tie 1-1

3. trial_ghi789 (9/10)
   logger-basic vs structured-logger
   Current: Challenger leading 6-2

Pending Promotions: 2
  - advanced-error-handler (waiting approval)
  - structured-logger (auto-promote ready)

Recent Completions:
  - trial_xyz (completed 2d ago): cache-pattern promoted
```

### 3. 스케줄 현황

```
📅 Scheduler Status
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Daily Scan:
  Last run: 2026-01-24 03:00
  Next run: 2026-01-25 03:00
  Results: 5 candidates, 1 promotion

Weekly Review:
  Last run: 2026-01-19 04:00
  Next run: 2026-01-26 04:00
  Results: 2 archived, 3 cleanup

Last 7 Days:
  - Scans: 7
  - Candidates found: 23
  - Promotions: 3
  - Archives: 2
```

### 4. 내재화 현황

```
📚 Internalization
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Rules Created: 15
  - code/patterns: 8
  - workflow: 5
  - style: 2

Skills Generated: 12
  Location: .claude/skills/learned/

Lessons Created: 28
  Most effective: "Always validate inputs" (95% effectiveness)

Recent:
  - async-error-wrapper (2h ago)
  - retry-with-backoff (1d ago)
```

## 상세 보기

### 특정 스킬 상세

```
/learn-status --skill <skill-name>
```

```
📋 Skill Detail: advanced-error-handler
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Status: Active (promoted 3d ago)
Type: technique
Source: plugin-marketplace

Scores:
  Composite: 92.5
  Quality:   94.0
  Speed:     89.5
  Satisfaction: 93.2

Confidence: 0.95 (high)
Trials: 15 (13 success, 2 failure)

Performance Trend: 📈 Improving

Related:
  - Replaced: error-handler-v1 (archived)
  - Similar: graceful-error-handler (trial)
```

### 시험 상세

```
/learn-status --trial <trial-id>
```

## 권장 액션

대시보드는 다음 권장 액션을 제시합니다:

```
💡 Recommended Actions
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. [High Priority] 2 pending promotions need review
   → /compare --approve advanced-error-handler

2. [Medium] 5 candidates waiting for trials
   → /compare to start A/B testing

3. [Low] 3 skills below performance threshold
   → Consider archiving or improvement
```

## 출력 형식 옵션

- `--json`: JSON 형식 출력
- `--markdown`: 마크다운 형식 출력
- `--brief`: 간략한 요약만
- `--verbose`: 모든 상세 정보
