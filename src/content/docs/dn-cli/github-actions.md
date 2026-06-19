---
title: GitHub Actions Integration
description: Install dn workflow templates in a GitHub repository and run kickstart in GitHub Actions.
---

`dn` can run in GitHub Actions to prepare plans, generate milestone stacks, or
implement issues and open pull requests. Installed workflow templates ship from
the [`dn`](https://github.com/chesapeakedev/dn) repository; Denoise and other
tools dispatch them through stable `repository_dispatch` contracts.

Authenticate before running setup commands from your machine — see
[Installation — GitHub authentication](/dn-cli/installation/#github-authentication)
and [GitHub Token Setup](/dn-cli/github-token-setup/).

## First-time repository setup

To wire a repository for CI-driven `dn` workflows:

1. Install canonical workflow files and agent configuration:
   `dn init workflows --agent opencode`
2. Set the secret for your configured agent, for example
   `gh secret set OPENAI_API_KEY`
3. Validate the repository: `dn workflows validate --json`
4. Commit `.github/workflows/dn-*.yml` and `.github/dn/config.json`.

Prefer canonical workflows installed by `dn init workflows`; use legacy label
workflows only for older repositories.

## `dn init workflows`

Installs canonical GitHub Actions workflows plus repository agent configuration:

| Path                                       | Purpose                                                                 |
| ------------------------------------------ | ----------------------------------------------------------------------- |
| `.github/dn/config.json`                   | Repo-wide agent preference (`opencode`, `cursor`, `claude`, or `codex`) |
| `.github/workflows/dn-init-stack.yml`      | Milestone stack generation                                              |
| `.github/workflows/dn-prep-issue-plan.yml` | Plan-only phase for an issue                                            |
| `.github/workflows/dn-kickstart-issue.yml` | Full kickstart (plan + implement, optional AWP)                         |

```bash
dn init workflows --agent opencode
gh secret set OPENAI_API_KEY
dn workflows validate --json
```

Supported agents are `opencode` (default), `cursor`, `claude`, and `codex`.

Set the agent once in `.github/dn/config.json`:

```json
{
  "schema_version": "1.0",
  "agent": "opencode"
}
```

| Agent      | Install flag                  | Repository secret   | Notes                                                                                                                             |
| ---------- | ----------------------------- | ------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| `opencode` | `dn init workflows` (default) | `OPENAI_API_KEY`    | OpenCode install script; key may point at OpenAI, DeepInfra, or another OpenAI-compatible API when configured in `opencode*.json` |
| `claude`   | `--agent claude`              | `ANTHROPIC_API_KEY` | Workflow sets `CLAUDE_CODE_BARE=1`                                                                                                |
| `cursor`   | `--agent cursor`              | `CURSOR_API_KEY`    | Cursor CLI install script                                                                                                         |
| `codex`    | `--agent codex`               | `OPENAI_API_KEY`    | Official Codex CLI install script                                                                                                 |

Workflows pass `GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}` automatically. You do
**not** create a `GITHUB_TOKEN` repository secret — GitHub Actions injects it.
Scope it with the workflow `permissions` block. Workflows also pass all agent
API key secrets; unset secrets are ignored.

```bash
dn init workflows --agent opencode --dry-run
dn init workflows --json
dn workflows install --agent cursor
dn workflows update
dn workflows validate --json
```

`install` writes missing workflow files. `update` refreshes missing or outdated
templates. Passing `--agent` creates or updates `.github/dn/config.json`.

## `dn workflows`

Dispatches `workflow_dispatch` and `repository_dispatch` events, executes
canonical workflows inside Actions, and manages installed templates.

```bash
dn workflows dispatch release.yml
dn workflows dispatch triage.yml --ref my-branch
dn workflows dispatch triage.yml -f name=scully -f greeting=hello
echo '{"name":"scully"}' | dn workflows dispatch triage.yml --json
dn workflows dispatch smoke.yml --repo owner/repo

# repository_dispatch for canonical dn templates
echo '{"schema_version":"1.0","dispatch_id":"'"$(uuidgen)"'","milestone":"1"}' \
  | dn workflows dispatch dn.init_stack --repo owner/repo --json
```

Common `dispatch` options:

- `--repo`, `-R` — Target `owner/repo`.
- `--ref`, `-r` — Branch or tag containing the workflow file.
- `--dispatch` — Force `repository` or `workflow` when both triggers exist.
- `--wait` — Poll until a `repository_dispatch` run appears.
- `-f`, `--raw-field` — String workflow input.
- `-F`, `--field` — String input; `@path` reads file contents.
- `--json` — JSON object from stdin.

Manage installed templates:

```bash
dn workflows list
dn workflows install
dn workflows update
dn workflows validate
dn workflows validate --json
```

All template-management subcommands support `--json`; `install` and `update`
also support `--dry-run`.

`dn workflows exec <template-id>` is the runner-side command used by
`chesapeakedev/dn-action`. It validates the event and repository configuration,
installs the configured agent, and runs the mapped dn command. Users normally do
not call `exec` directly.

### Trigger kickstart from the CLI

After [first-time repository setup](#first-time-repository-setup), dispatch an
installed workflow:

```bash
echo '{"schema_version":"1.0","dispatch_id":"'"$(uuidgen)"'","issue_number":42}' \
  | dn workflows dispatch dn.kickstart_issue --repo owner/repo --json --wait
```

Each installed workflow uses one `chesapeakedev/dn-action` step. The action
reads `.github/dn/config.json`, validates the event, installs only the
configured agent harness, runs `dn --agent <configured>`, and writes a workflow
summary. Dispatch payloads do **not** include `agent`. For OpenCode with
[DeepInfra Kimi K2.7 Code](/dn-cli/opencode-deepinfra-kimi-k2-7-code/), see that
guide after workflows validate.

## Workflow templates

| Template ID          | Installed file           | `repository_dispatch` type | Primary `dn` command |
| -------------------- | ------------------------ | -------------------------- | -------------------- |
| `dn.init_stack`      | `dn-init-stack.yml`      | `dn.init_stack`            | `dn init stack`      |
| `dn.prep_issue_plan` | `dn-prep-issue-plan.yml` | `dn.prep_issue_plan`       | `dn prep`            |
| `dn.kickstart_issue` | `dn-kickstart-issue.yml` | `dn.kickstart_issue`       | `dn kickstart`       |

Each job delegates checkout, validation, dn installation, agent installation,
and command execution to
[`chesapeakedev/dn-action@v1`](https://github.com/chesapeakedev/dn-action). The
workflow file still owns its trigger, permissions, runner, and secrets.

Machine-readable contract: `templates/workflows/manifest.json` in the `dn`
repository.

## Dispatch payloads

All canonical events use `schema_version: "1.0"` and require a caller-generated
`dispatch_id` for correlation.

### `dn.init_stack`

Required: `schema_version`, `dispatch_id`, `milestone`.

Optional: `refresh` (defaults to `true`).

```bash
echo '{"schema_version":"1.0","dispatch_id":"'"$(uuidgen)"'","milestone":"1"}' \
  | dn workflows dispatch dn.init_stack --repo owner/repo --json
```

Writes `plans/{owner}_{repo}_{milestone}.stack.md` and `.stack.json`.

### `dn.prep_issue_plan`

Required: `schema_version`, `dispatch_id`, and **exactly one of** `issue_url` or
`issue_number`.

Optional: `plan_name`.

```bash
echo '{"schema_version":"1.0","dispatch_id":"'"$(uuidgen)"'","issue_number":42}' \
  | dn workflows dispatch dn.prep_issue_plan --repo owner/repo --json
```

### `dn.kickstart_issue`

Required: `schema_version`, `dispatch_id`, and **exactly one of** `issue_url` or
`issue_number`.

Optional: `awp` (defaults to `true`).

```bash
echo '{"schema_version":"1.0","dispatch_id":"'"$(uuidgen)"'","issue_url":"https://github.com/owner/repo/issues/42","awp":true}' \
  | dn workflows dispatch dn.kickstart_issue --repo owner/repo --json --wait
```

`repository_dispatch` returns HTTP **204** with no run id. Poll for runs:

```bash
gh run list --repo owner/repo --event repository_dispatch
```

Use `dn workflows dispatch --wait` to block until a new run appears and print
its URL.

## Verify the installation

Verify the repository in three stages so configuration errors are separated from
agent or command failures.

### 1. Check installed files

From the repository root, run:

```bash
dn workflows validate --json
```

The command exits successfully when `.github/dn/config.json` is valid, the
canonical workflow files are installed, their permissions are present, and the
templates match the current dn release. Resolve every reported warning before
testing a run.

### 2. Validate inside GitHub Actions

Dispatch a validation-only event with otherwise valid workflow inputs:

```bash
echo '{"schema_version":"1.0","dispatch_id":"verify-'"$(uuidgen)"'","issue_number":1,"validate_only":true}' \
  | dn workflows dispatch dn.kickstart_issue --repo owner/repo --json --wait
```

The validation-only path checks the issue number's shape but does not fetch the
issue. It checks the event, agent configuration, and required credential without
installing the agent or running kickstart. Open the resulting Actions run and
confirm its summary reports `validated` with passed checks for the environment,
workflow, event file, agent config, payload, and credential.

### 3. Run an end-to-end workflow

Remove `validate_only` and dispatch the workflow with a real issue or milestone.
The run summary should report `passed`, identify the selected agent, and show
the dn command that ran. A failed summary includes the failing phase, a stable
error code, and the next corrective action. The action still exits nonzero, so
failed validation or execution remains visible in branch protection and CI
status.

## Permissions

| Workflow             | `permissions`                                              |
| -------------------- | ---------------------------------------------------------- |
| `dn.init_stack`      | `contents: write`, `issues: write`                         |
| `dn.prep_issue_plan` | `contents: write`, `issues: write`                         |
| `dn.kickstart_issue` | `contents: write`, `pull-requests: write`, `issues: write` |

For AWP kickstart, also enable **Allow GitHub Actions to create and approve pull
requests** under **Settings → Actions → General → Workflow permissions**.

## OpenCode configuration in CI

Kickstart reads OpenCode config from the **workspace root** (see
[OpenCode configuration](/dn-cli/configuration/)):

- `opencode.plan.json` — plan phase (read-only edits)
- `opencode.implement.json` — implement phase (full edits)
- `opencode.json` — optional; used for local runs

When `agent` is `opencode`, model and provider settings must be present in the
phase configs because `dn` temporarily copies the active phase file to
`opencode.json` during execution. Commit provider blocks in both plan and
implement files.

## Denoise and other integrators

Denoise dispatches the same payload shapes through its backend GitHub App. The
denoise UI milestone dashboard can trigger `dn.init_stack`,
`dn.prep_issue_plan`, and `dn.kickstart_issue` on linked repositories that have
installed templates.

Compatibility paths (still supported, separate from dispatch):

- Issue labels: `denoise-build`, `cursor awp`, `opencode awp`
- Comment triggers documented in the `dn` manifest

Dispatch events are the canonical integration path for automation. See also
[denoise GitHub integration](/denoise/github-integration/).

## Troubleshooting

| Symptom                          | Check                                                                                    |
| -------------------------------- | ---------------------------------------------------------------------------------------- |
| `Missing .github/dn/config.json` | Run `dn init workflows --agent <agent>` and commit                                       |
| Agent secret missing             | `dn workflows validate --json`; set the secret for your configured agent                 |
| OpenCode auth errors in CI       | Provider `apiKey` must reference an env var the workflow sets (usually `OPENAI_API_KEY`) |
| No PR created                    | Workflow permissions and `pull-requests: write`; kickstart logs in the Actions run       |
| Dispatch accepted but no run     | Poll `repository_dispatch` runs; confirm workflow files exist on the default branch      |

See also
[Kickstart & Looping — Troubleshooting](/dn-cli/overview/#troubleshooting) and
[Self-hosted runners](/operations/self-hosted-runners/).

## Legacy label workflows

Some repositories still ship standalone workflows (for example
`kickstart-opencode.yml` / `kickstart-cursor.yml`) that trigger on issue labels:

| Label          | Workflow           |
| -------------- | ------------------ |
| `opencode awp` | OpenCode kickstart |
| `cursor awp`   | Cursor kickstart   |

These workflows typically support:

- **`workflow_dispatch`** — manual run with an `issue_url` input
- **`issues.labeled`** — runs when the matching label is applied

Required setup:

1. **Dependencies** — Deno, OpenCode and/or Cursor CLI (or use
   `chesapeakedev/dn-action@v1` for `dn` only)
2. **Secrets** — `GITHUB_TOKEN` (automatic), plus `OPENAI_API_KEY`,
   `CURSOR_API_KEY`, or `ANTHROPIC_API_KEY` depending on agent
3. **Permissions** — `contents: write`, `pull-requests: write`, `issues: write`
4. **PR creation** — Enable **Allow GitHub Actions to create and approve pull
   requests** under **Settings → Actions → General**

Prefer canonical templates when possible. The action's `workflow` input expects
the canonical event declared for that workflow. Custom label workflows can use
the action without `workflow` to install dn, but must validate their own event,
install their agent harness, and invoke the desired dn command.

Pin the action version when you need reproducibility:

```yaml
- uses: chesapeakedev/dn-action@v1
  with:
    version: "1.2.3"
```

## Workflow output

After execution, integrations typically post a comment on the issue with status,
PR link, and error details. Branch names use the `kickstart/` prefix, for
example `kickstart/issue_123_add-new-feature`.

For running kickstart on your own hardware, see
[Self-hosted runners](/operations/self-hosted-runners/).
