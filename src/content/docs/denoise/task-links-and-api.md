---
title: Task links and workspace API
description: Shareable Denoise task URLs, kickstart from the CLI, and workspace REST access with GitHub bearer auth.
---

## Shareable task URLs

| URL pattern | Role |
| ----------- | ---- |
| `/t/{shortCode}` | Preferred short link |
| `/task/{taskId}` | Stable task UUID |

## Kickstart and CRUD from the CLI

```bash
dn kickstart https://denoise.cloud/task/<uuid>
dn task create --denoise --milestone <uuid> --title "…"
```

Auth matches GitHub bearer → Denoise OAuth mapping (sign in once in the browser).
Full backend details: [Workspace CRUD](/dn/workspace/).

## Workspace REST API

Mutating routes (`POST /api/milestones`, `POST /api/milestones/{id}/tasks`,
task close/reopen, etc.) use the same authentication as task ref GET. Agents may
call the API directly or use `dn task --denoise`.
