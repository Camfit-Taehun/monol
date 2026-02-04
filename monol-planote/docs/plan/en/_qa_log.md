# Planote — Manual QA Log

> Claude Code must append an entry at the end of each WP.

## Template
### YYYY-MM-DD WPx
- Commands run:
  -
- Expected:
  -
- Actual:
  -
- Bugs found & fixed:
  -
- Remaining known issues:
  -
- Notes:
  -

---

## 2026-02-03 History Feature (Version Management System)

### Environment
- OS: macOS Darwin 25.2.0
- Node: v20.x
- Server: http://127.0.0.1:8787

### Commands Run
```bash
npm run dev
curl http://127.0.0.1:8787/api/history/files
curl http://127.0.0.1:8787/api/snapshots
curl -X POST http://127.0.0.1:8787/api/history/file/plan%2FREADME.md/version
curl http://127.0.0.1:8787/api/history/file/plan%2FREADME.md/diff?from=...&to=...
curl -X POST http://127.0.0.1:8787/api/snapshots -d '{"name": "...", "description": "..."}'
curl -X POST http://127.0.0.1:8787/api/history/file/.../restore?versionId=...
curl http://127.0.0.1:8787/api/snapshots/:id/diff
```

### Test Results

| # | Test Item | Expected | Actual | Result |
|:-:|-----------|----------|--------|:------:|
| 1 | Manual version creation | Version created | `createdBy: "manual"` version created | PASS |
| 2 | Auto version creation | Version created 5s after file edit | `createdBy: "auto"` version created | PASS |
| 3 | File list API | List of files with versions | Returns list with `versionCount` | PASS |
| 4 | Version history API | Version list per file | Returns versions sorted by newest | PASS |
| 5 | Diff API | Diff between two versions | Unified diff generated correctly | PASS |
| 6 | Version restore (extract) | Extract to new file | File created at specified path | PASS |
| 7 | Snapshot creation | Full plan/ snapshot | Includes fileManifest + git info | PASS |
| 8 | Snapshot list | List of snapshots | Returns id, name, createdAt, fileCount | PASS |
| 9 | Snapshot diff | Compare with current state | Returns unchanged/modified/added/deleted | PASS |
| 10 | Storage structure | CAS structure | `.planote/history/content/{hash[0:2]}/` correct | PASS |

### Storage Structure Verified
```
.planote/
├── history/
│   ├── index.json              PASS
│   ├── versions/
│   │   └── {pathHash}/         PASS
│   │       └── {versionId}.json
│   └── content/                PASS (CAS)
│       └── {hash[0:2]}/
│           └── {hash}.txt
└── snapshots/
    ├── manifest.json           PASS
    └── {snapshotId}.json       PASS
```

### Bugs Found & Fixed
- None

### Remaining Known Issues
- UI integration test needed (History panel)
- ESLint config file missing (`eslint.config.js`)
- Unit tests needed for version management

### Notes
- Build: `npm run build` PASS
- Tests: `npm test` 4 tests passed
