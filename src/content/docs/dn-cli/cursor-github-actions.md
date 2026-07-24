---
title: Cursor
description: Configure Cursor CLI for dn locally and in GitHub Actions — API key, headless mode, and workspace trust.
---

Use the [Cursor CLI](https://cursor.com/docs/cli/installation) headless `agent`
command as the agent harness in **installed dn GitHub Actions workflows**.
Authenticate with a **Cursor API key** stored in the `CURSOR_API_KEY` repository
secret. Unlike OpenCode, Cursor does not require provider or model JSON config
in the repository — dn installs the CLI and passes the secret through the job
environment.

General workflow installation and dispatch reference:
[Headless Use](/dn-cli/headless-use/).

## Overview

```text
repository_dispatch / denoise UI
        │
        ▼
dn-kickstart-issue.yml (or meld / init-stack)
        │
        ├── chesapeakedev/dn-action  →  dn CLI + Cursor CLI
        └── CURSOR_API_KEY secret    →  Cursor API authentication
                │
                ▼
        dn --agent cursor kickstart / meld / init stack
                │
                ▼
        Cursor agent CLI (headless)
```

Canonical dn workflows already export `CURSOR_API_KEY` to the job environment.
Store your **Cursor API key** in the `CURSOR_API_KEY` repository secret so you
do not need to fork workflow YAML.

## Prerequisites

1. **Cursor account and API key**
   - Personal key: generate from the
     [Cursor dashboard](https://cursor.com/dashboard) (see
     [Cursor CLI GitHub Actions — Authentication](https://cursor.com/docs/cli/github-actions)).
   - Enterprise service account: create in **Dashboard → Settings → Service
     accounts** and copy the key immediately — it is shown only once. Service
     accounts require a team-level GitHub app connection for cloud agent runs.
     See
     [Service accounts](https://cursor.com/docs/account/enterprise/service-accounts).

2. **Installed dn workflows** with `cursor` as the agent:

   ```bash
   dn init workflows --agent cursor
   gh secret set CURSOR_API_KEY   # paste your Cursor API key when prompted
   ```

   Commit `.github/dn/config.json` and the generated workflow files. Confirm
   with `dn workflows validate --json`.

3. **Repository permissions** for kickstart with AWP — same as the general
   GitHub Actions guide: `contents: write`, `pull-requests: write`,
   `issues: write`, and **Allow GitHub Actions to create and approve pull
   requests** under **Settings → Actions → General**.

## Step 1 — Install workflows for Cursor

Set the agent in `.github/dn/config.json`:

```json
{
  "schema_version": "1.0",
  "agent": "cursor"
}
```

Install or update canonical templates:

```bash
dn init workflows --agent cursor
dn workflows validate --json
```

Commit `.github/dn/config.json` and `.github/workflows/dn-*.yml`.

### Why `CURSOR_API_KEY`?

Installed dn workflows pass `CURSOR_API_KEY: ${{ secrets.CURSOR_API_KEY }}` to
every agent step. The Cursor CLI reads that environment variable automatically —
no workflow edits required.

You can also pass the key with `--api-key` on the CLI, but the canonical secret
name is the supported path for dn workflows.

## Step 2 — Generate your API key

### Personal API key

1. Open the [Cursor dashboard](https://cursor.com/dashboard).
2. Generate an API key for CLI and automation use.
3. Copy the key — treat it like a password.

### Enterprise service account

For team CI pipelines where a personal developer account is not appropriate:

1. In **Dashboard → Settings → Service accounts**, create a service account.
2. Copy the API key when it is displayed — it cannot be retrieved later.
3. If workflows need cloud agent access to private repositories, connect the
   Cursor GitHub app at the **team** level under **Dashboard → Settings →
   Integrations**.

Service accounts authenticate the same way: set `CURSOR_API_KEY` in the job
environment.

## Step 3 — Store the Cursor API key

```bash
gh secret set CURSOR_API_KEY --repo owner/repo
# Paste your Cursor API key when prompted
```

For organization-wide access:

```bash
gh secret set CURSOR_API_KEY --org ORG --visibility all
```

Verify:

```bash
dn workflows validate --json
```

Secret validation is best-effort; confirm the secret exists in **Settings →
Secrets and variables → Actions**.

## Step 4 — Verify locally (recommended)

Before relying on CI, confirm the Cursor CLI authenticates from your machine:

```bash
export CURSOR_API_KEY="your-cursor-api-key"
agent status
```

Or run a headless smoke test:

```bash
export CURSOR_API_KEY="your-cursor-api-key"
agent -p --trust --force "Reply with exactly: ok"
```

Run the plan phase through `dn`:

```bash
export CURSOR_API_KEY="your-cursor-api-key"
export GITHUB_TOKEN="$(gh auth token)"
dn --agent cursor meld https://github.com/owner/repo/issues/42
```

Fix auth errors locally before dispatching workflows.

## Step 5 — Run in GitHub Actions

### Dispatch from the CLI

```bash
echo '{"schema_version":"1.0","dispatch_id":"'"$(uuidgen)"'","issue_url":"https://github.com/owner/repo/issues/42","awp":true}' \
  | dn workflows dispatch dn.kickstart_issue --repo owner/repo --json --wait
```

### Dispatch from denoise

Link the repository milestone in denoise and trigger kickstart from the UI. The
backend sends the same `dn.kickstart_issue` payload shape.

### What the workflow does

1. Checks out the repository.
2. Uses `chesapeakedev/dn-action` to install `dn`, validate the event, and
   install the Cursor CLI.
3. Runs `dn --agent cursor kickstart --awp <issue>` with `CURSOR_API_KEY` set.
4. The Cursor agent CLI executes plan and implement phases headlessly.

Monitor the run:

```bash
gh run list --repo owner/repo --event repository_dispatch
gh run view <run-id> --log
```

## Optional repository context

Cursor auth does not depend on repo-local config files. For better local and
agent context, you can add dn workflow instructions:

```bash
dn init agents --skill --agent cursor
```

This writes `.cursor/rules/dn.mdc`. See
[Filesystem Context](/dn-cli/filesystem-context/) for details. It is optional
for CI — kickstart works once `CURSOR_API_KEY` is set.

## Authentication reference

| Item               | Value                                                                                                                |
| ------------------ | -------------------------------------------------------------------------------------------------------------------- |
| Environment var    | `CURSOR_API_KEY`                                                                                                     |
| CLI flag           | `--api-key <key>` (alternative to env var)                                                                           |
| Headless mode      | `-p` / `--print` — required for non-interactive runs                                                                 |
| Workspace trust    | `--trust` — skip trust prompts in headless mode                                                                      |
| File modifications | `--force` / `--yolo` — allow edits and shell commands without confirmation                                           |
| Status check       | `agent status` or `agent about`                                                                                      |
| Official docs      | [Headless CLI](https://cursor.com/docs/cli/headless), [Parameters](https://cursor.com/docs/cli/reference/parameters) |

dn invokes the Cursor CLI in headless mode during kickstart. You do not need to
wrap dn commands with extra flags when `CURSOR_API_KEY` is set.

## Troubleshooting

| Symptom                                       | Likely cause                              | Fix                                                                                            |
| --------------------------------------------- | ----------------------------------------- | ---------------------------------------------------------------------------------------------- |
| `401` / invalid API key                       | Missing, expired, or wrong key            | Re-set `CURSOR_API_KEY` from the dashboard or service account                                  |
| "Invalid API key" on network error            | DNS or firewall blocking Cursor endpoints | Check connectivity to `*.cursor.sh` and `*.cursorapi.com` before assuming the key is wrong     |
| Works locally, fails in CI                    | Secret not scoped to the job or repo      | Confirm secret name is `CURSOR_API_KEY` and exists for the target repository                   |
| Agent secret missing in validate              | Secret not created yet                    | `gh secret set CURSOR_API_KEY`; re-run `dn workflows validate --json`                          |
| Cloud agent cannot access repo (service acct) | Team GitHub app not connected             | Connect Cursor GitHub app at team level in dashboard Integrations                              |
| No PR created                                 | Workflow permissions                      | Enable `pull-requests: write` and **Allow GitHub Actions to create and approve pull requests** |
| Timeouts on long issues                       | Large context / slow inference            | Check run logs; consider [self-hosted runners](/operations/self-hosted-runners/)               |

For interactive local development, run `agent login` instead of setting
`CURSOR_API_KEY`. For unattended CI, the environment variable is the supported
approach.

## Related

- [Headless Use](/dn-cli/headless-use/) — templates, dispatch payloads,
  permissions
- [OpenCode](/dn-cli/opencode/) — alternative agent harness
- [Claude](/dn-cli/claude/) — alternative agent harness
- [Codex](/dn-cli/codex/) — alternative agent harness
- [Kickstart and looping](/dn-cli/overview/) — local and Cursor Cloud execution
- [Self-hosted runners](/operations/self-hosted-runners/) — longer-running
  kickstart jobs
- [Cursor CLI installation](https://cursor.com/docs/cli/installation)
