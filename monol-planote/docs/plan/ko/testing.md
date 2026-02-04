# Planote — 테스트 전략 & 케이스 (KO)

## 레이어
- Unit(vitest): 파싱/앵커/스토어/번들 정렬
- Integration(vitest): 서버 라우트 + 임시 fs
- E2E(playwright): UI 플로우

## 필수 스위트
- UT-INDEX-*, UT-ANCHOR-*, UT-STORE-*, UT-BUNDLE-*, UT-GIT-*
- IT-API-*, IT-SEC-*
- E2E-CORE-*

WP별 수동 QA는 implementation-plan.md에 있으며 `_qa_log.md`에 기록한다.

테스트 파일명/픽스처/명령 등 구현 디테일은 `implementation-blueprints.md`에 정의한다.
