---
title: Kickstart runtimes
description: Where denoise runs kickstart — GitHub Actions, Cursor Cloud, exe.dev, device runners, and CLI Docker.
---

When you click **Kickstart!** on a task, denoise asks where the run should
execute. Choose a runtime that matches your isolation and credential needs.
Denoise does **not** run kickstart on the denoise application host.

## Supported matrix

| Runtime          | Where it runs                         | Progress                         | Prerequisites                                      |
| ---------------- | ------------------------------------- | -------------------------------- | -------------------------------------------------- |
| `github_actions` | Target repo GitHub Actions            | HTTP if base URL set; else coarse | Agent secrets; `KICKSTART_PROGRESS_BASE_URL` for detailed |
| `cursor_cloud`   | Cursor-managed VM                     | HTTP                             | `CURSOR_API_KEY` + progress base URL on denoise    |
| `cloud_vm`       | exe.dev sandbox VM                    | HTTP                             | `EXE_TOKEN` + progress base URL (+ managed checkout for launcher) |
| `device_runner`  | Paired developer laptop               | NDJSON via device job API        | Pairing enabled; registered checkout               |
| Docker           | Your machine via CLI only             | N/A on hosted denoise            | `dn kickstart --sandbox docker` locally            |

Preflight availability is listed at `GET /api/kickstart/runtimes?owner=&repo=`
and shown in the confirm dialog. Unavailable options stay visible with a short
reason.

## Progress fidelity

- **Detailed** — Phase and step events stream into the task progress panel
  (Resolve → Implement → Lint → Publish timeline).
- **Coarse** — Queued / running / succeeded / failed only. Common for GitHub
  Actions when the denoise deploy has no public `KICKSTART_PROGRESS_BASE_URL`.

Shared HTTP bootstrap details:
[Progress reporting](/dn/progress-reporting/).

## Notes

- Managed Cursor Cloud and exe.dev launches still use a server-side checkout
  under `KICKSTART_RUNNER_WORKSPACE_ROOT` only to **start** `dn` with
  `--cursor-cloud` or `--sandbox exe.dev`. Agent work runs in the remote
  environment, not as untrusted code on the denoise app process.
- Device jobs never fall back silently to hosted compute. See
  [Developer device runners](/denoise/device-runners/).
- Historical runs may still show a legacy `local` source label in progress
  history; new dispatches reject that source.

## Related

- [Milestone details — Kickstart a task](/denoise/milestone-details/#kickstart-a-task)
- [Sandbox execution](/dn/sandbox/)
- [Headless Use](/dn/headless-use/)
