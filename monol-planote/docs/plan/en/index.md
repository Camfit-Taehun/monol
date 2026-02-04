# Planote — Planning Index (EN)

## Reading order (recommended)
1) overview.md
2) requirements.md
3) architecture.md
4) data-model.md
5) cli-spec.md
6) api-spec.md
7) ui-spec.md
8) bundles-and-agent.md
9) testing.md
10) implementation-plan.md
11) implementation-blueprints-full.md
12) implementation-blueprints.md
13) scenarios.md
14) policies.md

## Quick start
- `planote init`
- `planote serve`
- Create annotations → Create review cycle → Generate bundle → Run AI agent → Detect revision → Verify & resolve

## Docs in this folder
- overview.md: product definition, scope, terms, principles
- requirements.md: functional/non-functional requirements + acceptance criteria
- architecture.md: technical architecture + modules + build/run
- data-model.md: storage layout + schemas + IDs + migrations
- cli-spec.md: CLI commands, flags, output, exit codes
- api-spec.md: server REST/WS API contracts
- ui-spec.md: screen-by-screen UX, keyboard, accessibility
- bundles-and-agent.md: bundle formats + templates + agent instructions
- testing.md: test strategy + test cases + manual QA
- implementation-plan.md: Work Packages + tasks + DoD + risk plan
- implementation-blueprints-full.md: **FULL file-by-file templates** (paired with `scaffold/wp0..wp7`)
- implementation-blueprints.md: concise code-level blueprint (legacy/summary)
- scenarios.md: main/edge/exception flows to validate
- policies.md: security/privacy/data-integrity policies

## QA log
- `_qa_log.md` is where each WP manual QA results must be recorded.