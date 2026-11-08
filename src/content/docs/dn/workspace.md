---
title: Workspace CRUD
description: Use dn task and dn milestone against your local todo.md queue, GitHub issues, or Denoise cloud milestones and tasks.
---

`dn task` and `dn milestone` share one command surface with three **backends**.
Use them as the CLI for Denoise Personal, GitHub, and Denoise Pro—instead of
ad-hoc API calls or UI-only flows.

| Backend   | Flag                | What it controls                                      |
| --------- | ------------------- | ----------------------------------------------------- |
| `todo`    | `--todo` (default)  | Local kickstart queue at `~/.dn/todo.md` (Void/Personal) |
| `github`  | `--github` / `--gh` | GitHub issues (same behavior as `dn issue`)           |
| `denoise` | `--denoise`         | Denoise Pro milestones and native tasks on the server |

`dn issue` remains a stable alias for GitHub issue CRUD.

## Default backend

Set `workspace.default_backend` in `dn.json` or `~/.dn/config.json`:

```json
{
  "workspace": {
    "default_backend": "denoise",
    "api_url": "https://denoise.cloud"
  }
}
```

Explicit flags win over config. Issue URLs infer GitHub; `denoise.cloud/task/…`
infers Denoise; otherwise the default is `todo`.

## Denoise cloud (`--denoise`)

Requires GitHub token auth and a one-time Denoise sign-in with that GitHub
account in the browser.

```bash
dn milestone create --denoise --title "Sprint A"
dn task create --denoise --milestone <uuid> --title "Implement API" --body-file spec.md
dn task show --denoise https://denoise.cloud/task/<uuid>
dn kickstart https://denoise.cloud/task/<uuid>
```

`create` prints a kickstart-ready URL. Denoise tasks do not support `comment` in
v1—append description text with `dn task edit --denoise --body-file`.

## Local queue (`--todo`)

Unchanged Personal/Void behavior:

```bash
dn task list
dn task done 42
dn task sync status
```

When `default_backend` is `denoise`, pass `--todo` for local queue operations.

## GitHub (`--github`)

```bash
dn task --github create --title "Bug" --body-file report.md
dn task --github show 123
```

See [GitHub context](/dn/github-context/#issues-and-relationships).

## REST API

The Denoise server exposes the same operations over HTTPS with GitHub bearer
auth. Prefer `dn task` / `dn milestone` unless you need raw HTTP. See
[Task links and workspace API](/denoise/task-links-and-api/).
