---
title: dn GitHub Actions integration
description: Install canonical dn workflows, configure agents, dispatch events, and validate repository readiness.
---

This page is the developer reference for **installed dn GitHub Actions workflows** — the
templates shipped in the [`dn`](https://github.com/chesapeakedev/dn) repository and
installed into consumer repos under `.github/workflows/`. Denoise and other tools
dispatch these workflows through stable `repository_dispatch` contracts.

For a quick label-based kickstart setup, see [GitHub Actions](/kickstart/github-actions/).
For OpenCode with [DeepInfra Kimi K2.6](/kickstart/opencode-deepinfra-kimi-k2-6/), see
that guide after installing workflows here.

## Install canonical workflows

From a checkout of the target repository:

```bash
dn init workflows --agent opencode
gh secret set OPENAI_API_KEY   # or the secret for your chosen agent (see below)
```

Commit the generated support files and workflow YAML:

| Path | Purpose |
| ---- | ------- |
| `.github/dn/config.json` | Repo-wide agent preference (`opencode`, `cursor`, `claude`, or `codex`) |
| `.github/dn/install-agent.sh` | Installs only the configured agent harness on the runner |
| `.github/workflows/dn-init-stack.yml` | Milestone stack generation |
| `.github/workflows/dn-prep-issue-plan.yml` | Plan-only phase for an issue |
| `.github/workflows/dn-kickstart-issue.yml` | Full kickstart (plan + implement, optional AWP) |

Validate the installation:

```bash
dn workflows list --json
dn workflows validate --json
```

Update installed files when `dn` ships new template versions:

```bash
dn workflows update --json
```

## Workflow templates

| Template ID | Installed file | `repository_dispatch` type | Primary `dn` command |
| ----------- | -------------- | ---------------------------- | -------------------- |
| `dn.init_stack` | `dn-init-stack.yml` | `dn.init_stack` | `dn init stack` |
| `dn.prep_issue_plan` | `dn-prep-issue-plan.yml` | `dn.prep_issue_plan` | `dn prep` |
| `dn.kickstart_issue` | `dn-kickstart-issue.yml` | `dn.kickstart_issue` | `dn kickstart` |

Each job:

1. Validates the dispatch payload (`schema_version`, `dispatch_id`, and workflow-specific fields).
2. Reads `.github/dn/config.json` for the agent — **dispatch payloads do not carry `agent`**.
3. Installs `dn` via [`chesapeakedev/dn-action@v1`](https://github.com/chesapeakedev/dn-action).
4. Runs `.github/dn/install-agent.sh` for the configured harness.
5. Invokes `dn --agent <configured> …` with CI-friendly env vars (`NO_COLOR`, `IS_OPEN_SOURCE`, etc.).

Machine-readable contract: `templates/workflows/manifest.json` in the `dn` repository.

## Agent configuration and secrets

Set the agent once in `.github/dn/config.json`:

```json
{
  "schema_version": "1.0",
  "agent": "opencode"
}
```

| Agent | Install flag | Repository secret | Notes |
| ----- | ------------ | ------------------- | ----- |
| `opencode` | `dn init workflows` (default) | `OPENAI_API_KEY` | OpenCode install script; key may point at OpenAI, DeepInfra, or another OpenAI-compatible API when configured in `opencode*.json` |
| `claude` | `--agent claude` | `ANTHROPIC_API_KEY` | Workflow sets `CLAUDE_CODE_BARE=1` |
| `cursor` | `--agent cursor` | `CURSOR_API_KEY` | Cursor CLI install script |
| `codex` | `--agent codex` | `OPENAI_API_KEY` | Requires Node.js 22 on the runner |

Workflows pass `GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}` automatically. You do
**not** create a `GITHUB_TOKEN` repository secret — GitHub Actions injects it.
Scope it with the workflow `permissions` block.

Workflows also pass all agent API key secrets; unset secrets are ignored.

## Dispatch payloads

All canonical events use `schema_version: "1.0"` and require a caller-generated
`dispatch_id` for correlation.

### `dn.init_stack`

Required: `schema_version`, `dispatch_id`, `milestone`.

Optional: `refresh` (defaults to `true`).

```bash
echo '{"schema_version":"1.0","dispatch_id":"'"$(uuidgen)"'","milestone":"1"}' \
  | dn workflow run dn.init_stack --repo owner/repo --json
```

Writes `plans/{owner}_{repo}_{milestone}.stack.md` and `.stack.json`.

### `dn.prep_issue_plan`

Required: `schema_version`, `dispatch_id`, and **exactly one of** `issue_url` or
`issue_number`.

Optional: `plan_name`.

```bash
echo '{"schema_version":"1.0","dispatch_id":"'"$(uuidgen)"'","issue_number":42}' \
  | dn workflow run dn.prep_issue_plan --repo owner/repo --json
```

### `dn.kickstart_issue`

Required: `schema_version`, `dispatch_id`, and **exactly one of** `issue_url` or
`issue_number`.

Optional: `awp` (defaults to `true`).

```bash
echo '{"schema_version":"1.0","dispatch_id":"'"$(uuidgen)"'","issue_url":"https://github.com/owner/repo/issues/42","awp":true}' \
  | dn workflow run dn.kickstart_issue --repo owner/repo --json --wait
```

`repository_dispatch` returns HTTP **204** with no run id. Poll for runs:

```bash
gh run list --repo owner/repo --event repository_dispatch
```

Use `dn workflow run --wait` to block until a new run appears and print its URL.

## Permissions

| Workflow | `permissions` |
| -------- | ------------- |
| `dn.init_stack` | `contents: write`, `issues: write` |
| `dn.prep_issue_plan` | `contents: write`, `issues: write` |
| `dn.kickstart_issue` | `contents: write`, `pull-requests: write`, `issues: write` |

For AWP kickstart, also enable **Allow GitHub Actions to create and approve pull
requests** under **Settings → Actions → General → Workflow permissions**.

## OpenCode configuration in the repo

Kickstart reads OpenCode config from the **workspace root** (see
[Configuration](/kickstart/configuration/)):

- `opencode.plan.json` — plan phase (read-only edits)
- `opencode.implement.json` — implement phase (full edits)
- `opencode.json` — optional; used for local runs

When `agent` is `opencode`, model and provider settings must be present in the
phase configs because `dn` temporarily copies the active phase file to
`opencode.json` during execution. Commit provider blocks in both plan and
implement files.

## Denoise and other integrators

Denoise dispatches the same payload shapes through its backend GitHub App. The
Denoise UI milestone dashboard can trigger `dn.init_stack`, `dn.prep_issue_plan`,
and `dn.kickstart_issue` on linked repositories that have installed templates.

Compatibility paths (still supported, separate from dispatch):

- Issue labels: `denoise-build`, `cursor awp`, `opencode awp`
- Comment triggers documented in the `dn` manifest

Dispatch events are the canonical integration path for automation.

## Troubleshooting

| Symptom | Check |
| ------- | ----- |
| `Missing .github/dn/config.json` | Run `dn init workflows --agent <agent>` and commit |
| Agent secret missing | `dn workflows validate --json`; set the secret for your configured agent |
| OpenCode auth errors in CI | Provider `apiKey` must reference an env var the workflow sets (usually `OPENAI_API_KEY`) |
| No PR created | Workflow permissions and `pull-requests: write`; kickstart logs in the Actions run |
| Dispatch accepted but no run | Poll `repository_dispatch` runs; confirm workflow files exist on the default branch |

See also [Troubleshooting](/kickstart/troubleshooting/) and
[Self-hosted runners](/operations/self-hosted-runners/).
