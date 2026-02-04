# Planote — Testing Strategy & Test Cases (EN)

## Layers
- Unit (vitest): parsing, anchors, store, bundle ordering
- Integration (vitest): server routes with temp fs
- E2E (playwright): UI flows

## Required suites
- UT-INDEX-*, UT-ANCHOR-*, UT-STORE-*, UT-BUNDLE-*, UT-GIT-*
- IT-API-*, IT-SEC-*
- E2E-CORE-*

Manual QA checklists are defined per WP in implementation-plan.md and logged in `_qa_log.md`.

Implementation detail (exact test file names and fixtures) is specified in `implementation-blueprints.md`.
