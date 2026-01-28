#!/bin/bash
# scheduled-scan.sh
# 예약된 스캔 작업 트리거

set -e

# 설정
LEARN_DIR=".monol/learn"
SCHEDULE_FILE="$LEARN_DIR/schedule.yaml"
LAST_SCAN_FILE="$LEARN_DIR/.last-scan"

# 현재 시간
CURRENT_HOUR=$(date +%H)
CURRENT_DAY=$(date +%u)  # 1=Monday, 7=Sunday

# 마지막 스캔 시간 확인
if [ -f "$LAST_SCAN_FILE" ]; then
  LAST_SCAN=$(cat "$LAST_SCAN_FILE")
  LAST_SCAN_DATE=$(echo "$LAST_SCAN" | cut -d'T' -f1)
  TODAY=$(date +%Y-%m-%d)

  if [ "$LAST_SCAN_DATE" = "$TODAY" ]; then
    echo "Daily scan already completed today"
    exit 0
  fi
fi

# Daily scan (3 AM)
if [ "$CURRENT_HOUR" = "03" ]; then
  echo "Running daily scan..."

  # 실제 구현에서는 monol-learn CLI 호출
  # monol-learn daily-scan

  echo "$(date -u +%Y-%m-%dT%H:%M:%SZ)" > "$LAST_SCAN_FILE"
  echo "Daily scan completed"
fi

# Weekly review (Sunday 4 AM)
if [ "$CURRENT_DAY" = "7" ] && [ "$CURRENT_HOUR" = "04" ]; then
  LAST_REVIEW_FILE="$LEARN_DIR/.last-review"

  if [ -f "$LAST_REVIEW_FILE" ]; then
    LAST_REVIEW_WEEK=$(cat "$LAST_REVIEW_FILE")
    CURRENT_WEEK=$(date +%Y-W%V)

    if [ "$LAST_REVIEW_WEEK" = "$CURRENT_WEEK" ]; then
      echo "Weekly review already completed this week"
      exit 0
    fi
  fi

  echo "Running weekly review..."

  # 실제 구현에서는 monol-learn CLI 호출
  # monol-learn weekly-review

  echo "$(date +%Y-W%V)" > "$LAST_REVIEW_FILE"
  echo "Weekly review completed"
fi
