# Planote — CLI 스펙 (KO)

> 구현(파일/스크립트) 청사진은 `implementation-blueprints.md`에 있다.

전역 옵션:
- `--project <path>`: project root 지정(기본 cwd)
- `--plan <path>`: plan root 오버라이드(기본 config 또는 `plan/`)
- `--json`: 머신 리더블 출력
- `--verbose`: 디버그 로그

종료 코드:
- 0 성공
- 1 일반 오류
- 2 인자 오류
- 3 project/plan 미존재
- 4 락(다른 서버 실행 중)
- 5 마이그레이션 필요/실패

## 명령
1) `planote init`
2) `planote serve`
3) `planote scan`
4) `planote cycle ...`
5) `planote bundle ...`
6) `planote revision ...`
7) `planote doctor`

옵션/행동은 API/저장 스키마와 일관되게 유지한다.
