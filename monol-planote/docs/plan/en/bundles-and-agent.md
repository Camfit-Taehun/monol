# Planote — Bundles & Agent Instructions (EN)

## Bundle formats
- Prompt Markdown (`prompt_md`): human + AI friendly
- Structured JSON (`structured_json`): tooling friendly

## Deterministic ordering
Sort annotations by:
1) filePath asc
2) section position (lineStart asc; fallback sectionId asc)
3) priority: P0 > P1 > P2 > P3
4) createdAt asc

## Canonical prompt template
(Use the template defined in earlier draft; keep constraints and allowed roots explicit.)

## Operator protocol (checklist)
1) Create cycle (captures snapshot)
2) Generate bundle (md+json)
3) Run agent
4) Detect revision, review diff
5) Resolve/re-anchor
6) Close cycle

See `implementation-blueprints.md` for exact file outputs and UI actions per WP.
