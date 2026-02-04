# Planote — CLI Spec (EN)

> Implementation details (files/scripts) are in `implementation-blueprints.md`.

Global options:
- `--project <path>`: set project root (default cwd)
- `--plan <path>`: override plan root (default from config or `plan/`)
- `--json`: machine-readable output
- `--verbose`: debug logs

Exit codes:
- 0 success
- 1 generic error
- 2 invalid arguments
- 3 project/plan not found
- 4 locked (another server running)
- 5 migration required / failed

## Commands
1) `planote init`
2) `planote serve`
3) `planote scan`
4) `planote cycle ...`
5) `planote bundle ...`
6) `planote revision ...`
7) `planote doctor`

See the full command behavior and options in the earlier draft; keep it consistent with API and storage schemas.
