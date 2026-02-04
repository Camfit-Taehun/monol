# Planote — 정책 (KO)

## 보안
- 기본 127.0.0.1 바인딩
- 인증 없음 전제(로컬 전용)
- 경로 샌드박스: `planRoot`와 `.planote`만 허용
- 마크다운 sanitize, raw HTML 기본 비활성
- javascript: URL, 외부 이미지 기본 차단

## 프라이버시
- 텔레메트리 없음
- 외부 네트워크 콜 없음

## 데이터 무결성
- `.planote` JSON 원자적 저장
- 소프트 삭제(trash)
- 동시 writer 방지 락
- stale lock takeover는 경고와 함께만 허용

## 마이그레이션
- schemaVersion 필수
- 스키마 변경 시 마이그레이션 코드 필수

## AI 안전장치
- 번들에 allowed/forbidden roots 명시
- 에이전트가 `.planote`를 수정하면 UI에서 강한 경고
