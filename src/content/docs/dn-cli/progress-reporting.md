---
title: Progress reporting
description: Correlate workflow dispatches and consume versioned dn progress events safely.
---

`dn` can report structured kickstart progress to an orchestrator. Callers must
generate a unique dispatch ID before dispatch so events and the resulting GitHub
Actions run can be correlated exactly.

## Configure reporting

| Variable                | Purpose                                 |
| ----------------------- | --------------------------------------- |
| `DN_DISPATCH_ID`        | Invocation correlation ID               |
| `DN_PROGRESS=ndjson`    | Write one JSON event per line to stderr |
| `DN_PROGRESS=http`      | POST events to the configured URL       |
| `DN_PROGRESS_URL`       | HTTP ingest endpoint                    |
| `DN_PROGRESS_TOKEN`     | Bearer token for HTTP delivery          |
| `DN_PROGRESS_VERBOSE=1` | Include redacted `agent.line` events    |

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

Render queued and running events as active states, `invocation.failed` as a
failure with its safe message, and `invocation.succeeded` as complete. Prefer
`publish.completed.data.pr_url` for the PR action. A successful run without that
field may have used local or direct publication; do not invent a PR link.

If events are missing, confirm both `DN_DISPATCH_ID` and a reporting mode are
set. For HTTP, check the URL and token without logging the token. Reject or
deduplicate repeated dispatch IDs, order by `seq`, and isolate overlapping runs
by `invocation_id`.

Cursor Cloud normally dispatches and exits. When both correlation and progress
reporting are configured, `dn` waits for completion, reports the PR URL when
available, and emits failure or timeout as terminal events.
