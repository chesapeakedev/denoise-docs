---
title: Kickstart runtimes
description: Kickstart picks a runner — GitHub Actions, a paired device, or exe.dev — not a parallel runtime type.
---

When you click **Kickstart** on a task, denoise asks **which runner** should
execute. Every choice is an enrolled runner with a provider. Denoise does
**not** run kickstart on the denoise application host.

Enroll runners in the milestone **Runners** dialog. See
[Enroll runners](/runners/device-runners/) for pairing a device, installing GitHub
Actions workflows, and connecting exe.dev.

## Supported runners

| Provider       | Where it runs                                           | Progress                          | Prerequisites                                                                       |
| -------------- | ------------------------------------------------------- | --------------------------------- | ----------------------------------------------------------------------------------- |
| GitHub Actions | Planning repo workflows                                 | HTTP if base URL set; else coarse | Installed `dn` workflows; agent repository secrets                                  |
| Device         | Paired macOS or Linux checkout                          | NDJSON via the device job API     | Paired device; registered execution checkout                                        |
| exe.dev        | Persistent VM from `ghcr.io/chesapeakedev/dn:<harness>` | NDJSON via the same job API       | Connected `EXE_TOKEN` (`new`, `ls`, `rm`); harness key; reachable progress base URL |

Preflight availability is listed at `GET /api/kickstart/runtimes?owner=&repo=`
and shown in the confirm dialog. Unavailable options stay visible with a short
reason. Kickstart chooses an affinity. exe.dev VMs are a pool: a queued
Kickstart can be claimed by any of your exe.dev VMs (same account, same personal
or org scope). Paired devices are not a pool — hardware and checkouts differ, so
those jobs stay on the device you picked. Land and sync always stay on the
runner they were queued for.

Device and exe.dev cards use the same badges: **Ready**, **Busy**, **Offline**,
**Needs setup**. A runner is **Offline** when Denoise has not heard a heartbeat
for 90 seconds. Kickstart still queues for up to 24 hours. A deleted exe.dev pet
is **Needs setup**, not Offline — Create VM so serve can pick up a queued
Kickstart. Do not Kickstart again.

CLI Docker (`dn kickstart --sandbox docker`) is local isolation on a machine you
already have. It is not a denoise runner. Cursor Cloud is not in the public
chooser; it remains a CLI-only path (`dn kickstart --cursor-cloud`).

## What you see during kickstart

The Kickstart area on a task is a **phase timeline**, not a full agent log. Serve
stdout and harness output stay on the runner — see [Runner logs](/runners/runner-logs/).

When detailed progress is enabled, the panel updates as the run moves through
kickstart phases. Leave-local kickstart on a device uses **Resolve → Plan →
Implement → Lint** (`dn ensure lint`). Publish is not part of that job; Land
then Sync own commit and trunk. See [Kickstart, land, sync, and done](/close-out/).

When only coarse progress is available (typical for GitHub Actions without a
public progress base URL), you see queued, running, and finished states — not
step-by-step phases. Land and Sync on a device runner stay coarse even when
kickstart was detailed.

If a run succeeds but no pull request link appears on the task, the job may have
published without opening a PR. Check the planning repository or ask whoever
manages runners before assuming a link is missing.

Near the end of a long plan or implement phase, the panel may show a timeout
warning before the phase is stopped.

## Configure progress for runners

`dn` reports kickstart progress to denoise when a run is correlated and a
delivery mode is set. Denoise issues a **per-invocation** bearer token for HTTP
delivery. Do not add a standing `DN_PROGRESS_TOKEN` repository secret for every
target repo — tokens are short-lived and scoped to one invocation.

### HTTP (GitHub Actions and managed web runners)

When denoise has `KICKSTART_PROGRESS_BASE_URL` configured, kickstart workflows
receive:

| Field / env             | Meaning                                              |
| ----------------------- | ---------------------------------------------------- |
| `DN_DISPATCH_ID`        | Invocation correlation ID                            |
| `DN_PROGRESS=http`      | POST events to the ingest URL                        |
| `DN_PROGRESS_URL`       | Denoise `/api/kickstart/invocations/<id>/events` URL |
| `DN_PROGRESS_TOKEN`     | Bearer token for that invocation only                |
| `DN_PROGRESS_VERBOSE=1` | Optional redacted agent line events                  |

GitHub Actions receive the same values under `client_payload.progress` (`mode`,
`url`, `token`). `dn workflows exec` exports them into the job environment so
kickstart can report phases without a repo-wide progress secret.

Without `KICKSTART_PROGRESS_BASE_URL`, GitHub Actions kickstart still runs but
the denoise panel stays **coarse**. exe.dev and Cursor Cloud managed launches
need the public base URL for detailed progress; exe.dev stays unavailable in the
picker until it is set.

Cursor Cloud normally dispatches and exits. When correlation and HTTP progress
are both configured, `dn` waits for completion and surfaces failure, timeout, or
a PR link when the run provides one.

### NDJSON (device and exe.dev job API)

Paired devices and exe.dev VMs post progress on the device job route using
`DN_PROGRESS=ndjson` (one JSON event per line on stderr). HTTP delivery is
best-effort and does not fail the workflow. Event shapes and versioning live in
the open-source `dn` repositories if you need to parse logs.

## Phase timeouts

Kickstart plan and implement phases each have a wall-clock limit: 10 minutes for
plan (`PLAN_TIMEOUT_MS`, default `600000`) and 20 minutes for implement
(`IMPLEMENT_TIMEOUT_MS`, default `1200000`). Per-harness overrides
(`OPENCODE_TIMEOUT_MS`, `CODEX_TIMEOUT_MS`, `CURSOR_TIMEOUT_MS`,
`CLAUDE_TIMEOUT_MS`, `COPILOT_TIMEOUT_MS`) apply when set.

Denoise kickstart dispatches may set `client_payload.plan_timeout_ms` and
`client_payload.implement_timeout_ms`; device runners and GitHub Actions export
those as `PLAN_TIMEOUT_MS` / `IMPLEMENT_TIMEOUT_MS` before `dn kickstart` runs. A
timeout ends the run with a structured failure.

## Match GitHub Actions runs to a dispatch

Headless dispatches should send `schema_version: "1.0"` and a caller-generated
`dispatch_id`:

```bash
echo '{"schema_version":"1.0","dispatch_id":"'"$(uuidgen)"'","issue_number":123}' \
  | dn workflows dispatch dn.kickstart_issue --repo owner/repo --json --wait
```

GitHub's dispatch API does not return a workflow run ID. Installed templates put
the dispatch ID in the run name so you can match progress and logs to the right
job. Overlapping runs make time-based matching unsafe.

## When progress stays empty

On the task, confirm the run reached **running** and the runner badge is not
**Offline**. For device and exe.dev jobs, use [Runner logs](/runners/runner-logs/)
for serve output.

For HTTP progress from Actions, confirm the job received `DN_DISPATCH_ID`,
`DN_PROGRESS=http`, `DN_PROGRESS_URL`, and `DN_PROGRESS_TOKEN`. Verify the URL
and token in the workflow environment without logging the token value. See
[Headless setup](/runners/headless-use/) for workflow installation and dispatch.

## Notes

- **GitHub Actions** always publishes a pull request on the planning repository.
- A **device** runner can execute in a different registered checkout. After
  leave-local kickstart, Land and Sync run on that checkout.
- **exe.dev** reuses one [dn-images](https://github.com/chesapeakedev/dn-images)
  VM. The VM clones the execution repo at claim time and runs kickstart inside
  the image with `--publish pr`. Denoise does not keep a launcher checkout and
  does not call host `dn --sandbox exe.dev`. Disconnect destroys the VM.
- Historical runs may still show a legacy `local` or `cloud_vm` source label in
  progress history; new dispatches reject `local`.

## Related

- [Runners overview](/runners/overview/)
- [Enroll runners](/runners/device-runners/)
- [Runner logs](/runners/runner-logs/)
- [Milestone details — Kickstart a task](/denoise/milestone-details/#kickstart-a-task)
- [Kickstart, land, sync, and done](/close-out/)
- [Sandbox execution](/dn/sandbox/)
- [Headless setup](/runners/headless-use/)
