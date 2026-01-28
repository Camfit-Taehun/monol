# ASSUMPTIONS (UC01/UC02 마이크로 태스크 기준)

## 통합 패키지 루트
- 기본: `monol/monol-suite/`
- 대체: `monol/` (당신이 통합 패키지를 새 폴더로 만들었다면)

## 기술 선택(권장)
- Node 기반(현재 monol-suite/node 생태계에 맞춤)
- shell hook는 얇게 유지하고, 실제 로직은 node script로 위임

## 공통 산출물 위치
- 리포트: `.monol/reports/`
- 런 로그: `.monol/logs/` (선택)
- 설정: `.monol/config.json` (또는 `monol.config.json`)

## 보안/민감정보
- events payload에 토큰/키/PII를 넣지 않기
- 로그 출력은 truncation(길이 제한) 적용
