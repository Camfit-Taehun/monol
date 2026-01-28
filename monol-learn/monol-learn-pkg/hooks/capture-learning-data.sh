#!/bin/bash
# capture-learning-data.sh
# 세션 종료 시 학습 데이터 수집

set -e

# 설정
LEARN_DIR=".monol/learn"
SESSION_LOGS_DIR="$LEARN_DIR/session-logs"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
SESSION_ID="${CLAUDE_SESSION_ID:-session_$TIMESTAMP}"

# 디렉토리 확인
mkdir -p "$SESSION_LOGS_DIR"

# 세션 로그 파일
LOG_FILE="$SESSION_LOGS_DIR/${SESSION_ID}.yaml"

# 세션 메타데이터 수집
cat > "$LOG_FILE" << EOF
session:
  id: "$SESSION_ID"
  ended_at: "$(date -u +%Y-%m-%dT%H:%M:%SZ)"

metrics:
  # 실제 구현에서는 환경 변수 또는 파일에서 수집
  total_actions: ${CLAUDE_TOTAL_ACTIONS:-0}
  successful_actions: ${CLAUDE_SUCCESSFUL_ACTIONS:-0}
  error_count: ${CLAUDE_ERROR_COUNT:-0}

skills_used: []
  # 실제 구현에서는 스킬 사용 로그에서 수집

observations: []
  # 세션 중 관찰된 학습 포인트

status: captured
EOF

echo "Learning data captured: $LOG_FILE"

# 대기 중인 레슨 처리
if [ -d "$LEARN_DIR/pending-lessons" ]; then
  PENDING_COUNT=$(find "$LEARN_DIR/pending-lessons" -name "*.yaml" 2>/dev/null | wc -l | tr -d ' ')
  if [ "$PENDING_COUNT" -gt "0" ]; then
    echo "Pending lessons to review: $PENDING_COUNT"
  fi
fi
