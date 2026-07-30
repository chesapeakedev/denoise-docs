---
title: Progress reporting
description: Shared HTTP progress bootstrap for denoise kickstart runners, plus NDJSON for device runners.
---

`dn` reports structured kickstart progress to denoise (and other orchestrators)
when correlation and a delivery mode are configured. Denoise issues a
**per-invocation** progress token and delivers the same HTTP bootstrap to GitHub
Actions, Cursor Cloud, and exe.dev (`cloud_vm`). Device runners use NDJSON over
the device job API instead.

Do **not** mint a shared `DN_PROGRESS_TOKEN` repository secret for every target
repo. Tokens are short-lived and scoped to one invocation.

## Shared HTTP bootstrap

When denoise has `KICKSTART_PROGRESS_BASE_URL` configured, primary web runners
receive:

| Field / env             | Meaning                                              |
| ----------------------- | ---------------------------------------------------- |
| `DN_DISPATCH_ID`        | Invocation correlation ID                            |
| `DN_PROGRESS=http`      | POST events to the ingest URL                        |
| `DN_PROGRESS_URL`       | Denoise `/api/kickstart/invocations/<id>/events` URL |
| `DN_PROGRESS_TOKEN`     | Bearer token for that invocation only                |
| `DN_PROGRESS_VERBOSE=1` | Include redacted `agent.line` events (optional)      |

**GitHub Actions** receive the same values nested under
`client_payload.progress` (`mode`, `url`, `token`). `dn workflows exec` exports
them into the job environment so kickstart reports phases and steps without a
repo-wide progress secret.

**Cursor Cloud** and **exe.dev** managed runners get the same variables in the
child `dn` environment when denoise starts the managed launch.

Without `KICKSTART_PROGRESS_BASE_URL`, GitHub Actions remains available but the
denoise panel uses **coarse** status (queued / running / terminal) instead of
the phase timeline. Cursor Cloud and exe.dev require the public base URL for
detailed progress and are unavailable in the picker until it is set.

## Delivery modes

| Variable             | Purpose                                                  |
| -------------------- | -------------------------------------------------------- |
| `DN_PROGRESS=http`   | POST events to `DN_PROGRESS_URL` with the bearer token   |
| `DN_PROGRESS=ndjson` | Write one JSON event per line to stderr (device runners) |

Events use schema version `1.0` and include `invocation_id`, increasing `seq`,
ISO-8601 `ts`, `type`, and `message`. Phase events can identify `plan`,
`implement`, `lint`, or `publish`.

```json
{"schema_version":"1.0","invocation_id":"01J...","seq":1,"ts":"2026-07-24T12:00:00Z","type":"invocation.queued","message":"Kickstart queued"}
{"schema_version":"1.0","invocation_id":"01J...","seq":2,"ts":"2026-07-24T12:00:02Z","type":"invocation.running","message":"Kickstart started"}
{"schema_version":"1.0","invocation_id":"01J...","seq":3,"ts":"2026-07-24T12:00:03Z","type":"phase.started","phase":"implement","message":"Implementation started"}
{"schema_version":"1.0","invocation_id":"01J...","seq":4,"ts":"2026-07-24T12:04:00Z","type":"lint.completed","phase":"lint","message":"Lint completed"}
{"schema_version":"1.0","invocation_id":"01J...","seq":5,"ts":"2026-07-24T12:05:00Z","type":"publish.completed","phase":"publish","message":"Pull request created","data":{"branch_name":"kickstart/issue-123","pr_url":"https://github.com/owner/repo/pull/456"}}
{"schema_version":"1.0","invocation_id":"01J...","seq":6,"ts":"2026-07-24T12:05:01Z","type":"invocation.succeeded","message":"Kickstart completed"}
```

Failures end with `invocation.failed`. Step events may appear between phases.
HTTP delivery is best-effort and does not fail the workflow. Recognizable API
keys, bearer tokens, and token/secret assignments are redacted. With sandbox
execution, captured agent-line events may flush after the sandbox command ends.

## Correlate GitHub Actions

Canonical dispatch payloads require `schema_version: "1.0"` and a
caller-generated `dispatch_id`:

```bash
echo '{"schema_version":"1.0","dispatch_id":"'"$(uuidgen)"'","issue_number":123}' \
  | dn workflows dispatch dn.kickstart_issue --repo owner/repo --json --wait
```

GitHub's dispatch API returns no run ID. The templates include the dispatch ID
in the run name, so pollers must match that correlated name rather than a
creation-time window. Overlapping runs make time-based matching unsafe.

## Render progress in denoise

With **detailed** fidelity, render queued and running events as active states,
`invocation.failed` as a failure with its safe message, and
`invocation.succeeded` as complete. Prefer `publish.completed.data.pr_url` for
the PR action. A successful run without that field may have used direct
publication; do not invent a PR link.

With **coarse** fidelity (typically GitHub Actions without a public progress
base URL), show only queued / running / terminal status — not a fake phase
timeline.

If events are missing, confirm both `DN_DISPATCH_ID` and a reporting mode are
set. For HTTP, check the URL and token without logging the token. Reject or
deduplicate repeated dispatch IDs, order by `seq`, and isolate overlapping runs
by `invocation_id`.

Cursor Cloud normally dispatches and exits. When both correlation and progress
reporting are configured, `dn` waits for completion, reports the PR URL when
available, and emits failure or timeout as terminal events.

## Where each runtime reports

See [Kickstart runtimes](/denoise/kickstart-runtimes/) for the supported matrix.
Denoise does **not** run kickstart on the application host.
