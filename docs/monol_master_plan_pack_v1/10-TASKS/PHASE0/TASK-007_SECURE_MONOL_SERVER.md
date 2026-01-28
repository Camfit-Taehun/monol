# TASK-007: monol-server 기본 보안(로컬 바인딩/토큰/CORS)

## 목표
- 외부 노출 시 위험을 줄이기 위해 기본 설정을 “로컬 + 토큰”으로 강화한다.

## 변경 범위
- `monol/monol-server/server.js`
- (신규) `monol/monol-server/.env.example`

## 작업 단계
1) `server.listen(PORT, '127.0.0.1')`
2) 토큰 미들웨어:
   - env: `MONOL_API_TOKEN`
   - header: `Authorization: Bearer <token>`
3) CORS allow-list:
   - env: `MONOL_ALLOWED_ORIGINS` (csv)
4) README에 실행 예시 추가

## 검증
- 토큰 없이 API 호출 → 401
- 토큰 있으면 → 200

## 완료 기준(DoD)
- [ ] 기본값이 안전해짐
