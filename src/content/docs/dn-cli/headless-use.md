---
title: Headless Use
description: Configure dn for GitHub Actions and other unattended environments — workflows, publish modes, validation, and CI output.
---

Headless use means running `dn` without an interactive terminal: GitHub Actions,
scripts, cron jobs, and other automation. In these environments `dn`:

- Enables **unattended mode** automatically when `CI`, `GITHUB_ACTIONS`, or
  similar variables are set, or when stdout is not a TTY
- Sets `NO_COLOR=1` in CI when it is not already set
- Requires explicit **publish modes** for kickstart and init stack so changes
  are not discarded when the runner exits
- Reads the configured agent from `.github/dn/config.json` in canonical
  workflows — you do not pass `--agent` on each dispatch

Authenticate on your machine before running setup commands — see
[Installation — GitHub authentication](/dn-cli/installation/#github-authentication).

## Configure a repository

Work through these steps once per repository.

### 1. Install workflow templates and agent config

Pick one agent for the whole repository:

```bash
dn init workflows --agent opencode
```

This writes:

| Path                                       | Purpose                                                                                    |
| ------------------------------------------ | ------------------------------------------------------------------------------------------ |
| `.github/dn/config.json`                   | Repo-wide agent (`opencode`, `cursor`, `claude`, or `codex`)                               |
| `.github/workflows/dn-init-stack.yml`      | Milestone stack generation                                                                 |
| `.github/workflows/dn-prep-issue-plan.yml` | Plan-only phase for an issue                                                               |
| `.github/workflows/dn-kickstart-issue.yml` | Full kickstart (plan + implement)                                                          |
| `.github/workflows/dn-daily-kickstart.yml` | Scheduled milestone queue runner — see [Scheduled Workflows](/dn-cli/scheduled-workflows/) |

Set the agent once in `.github/dn/config.json`:

```json
{
  "schema_version": "1.0",
  "agent": "opencode"
}
```

Re-run `dn init workflows --agent <name>` or edit this file to change agents
later.

### 2. Set repository secrets

Each installed workflow passes `GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}`
automatically. You do **not** create a `GITHUB_TOKEN` repository secret.

Set the API key for your configured agent:

| Agent      | Install flag                  | Repository secret   |
| ---------- | ----------------------------- | ------------------- |
| `opencode` | `dn init workflows` (default) | `OPENAI_API_KEY`    |
| `claude`   | `--agent claude`              | `ANTHROPIC_API_KEY` |
| `cursor`   | `--agent cursor`              | `CURSOR_API_KEY`    |
| `codex`    | `--agent codex`               | `OPENAI_API_KEY`    |

```bash
gh secret set OPENAI_API_KEY
```

Workflows pass all agent API key secrets; unset secrets are ignored.

Agent-specific setup lives under Agent Configuration:
[OpenCode](/dn-cli/opencode/), [Claude](/dn-cli/claude/),
[Codex](/dn-cli/codex/), or [Cursor](/dn-cli/cursor-github-actions/).

### 3. Validate locally

```bash
dn workflows validate --json
```

Resolve every warning before committing. The command checks
`.github/dn/config.json`, installed workflow files, permissions, template
versions, and whether the matching agent secret is present.

### 4. Commit and push

```bash
git add .github/dn/config.json .github/workflows/dn-*.yml
git commit -m "Add dn workflow templates"
git push
```

For OpenCode kickstart, also commit `opencode.plan.json` and
`opencode.implement.json` when they exist.

### 5. Validate inside GitHub Actions

Dispatch a validation-only event — no agent install, no kickstart run:

```bash
echo '{"schema_version":"1.0","dispatch_id":"verify-'"$(uuidgen)"'","issue_number":1,"validate_only":true}' \
  | dn workflows dispatch dn.kickstart_issue --repo owner/repo --json --wait
```

Open the resulting Actions run. Its summary should report `validated` with
passed checks for the environment, workflow, event file, agent config, payload,
and credential.

### 6. Run an end-to-end workflow

Remove `validate_only` and dispatch with a real issue:

```bash
echo '{"schema_version":"1.0","dispatch_id":"'"$(uuidgen)"'","issue_number":42}' \
  | dn workflows dispatch dn.kickstart_issue --repo owner/repo --json --wait
```

The run summary should report `passed`, the selected agent, and the `dn` command
that ran. Failed runs include a stable error code and suggested next step.

## How canonical workflows run

Each installed workflow uses one
[`chesapeakedev/dn-action@v1`](https://github.com/chesapeakedev/dn-action) step.
The action:

1. Checks out the repository
2. Reads `.github/dn/config.json`
3. Validates the dispatch event (or `workflow_dispatch` input)
4. Installs `dn` and the configured agent harness
5. Runs the mapped `dn` command with `--agent <configured>`
6. Writes a workflow summary and optional `GITHUB_OUTPUT` fields (`commit_sha`,
   `branch_name`, `pr_url`, `publish_mode`)

Dispatch payloads do **not** include `agent`. Pin the action when you need
reproducibility:

```yaml
- uses: chesapeakedev/dn-action@v1
  with:
    version: "1.2.3"
```

## Publish modes in CI

Kickstart and init stack must persist changes in CI. With `--publish none`,
workspace changes are discarded when the runner exits.

| Mode           | Kickstart behavior                       | Typical CI use                             |
| -------------- | ---------------------------------------- | ------------------------------------------ |
| `pr` (default) | Branch, commit, push, open PR            | `dn.kickstart_issue`, `dn.daily_kickstart` |
| `direct`       | Commit and push to default branch, no PR | `dn.init_stack` (always uses `direct`)     |
| `none`         | Local changes only                       | Not valid in CI — fails fast               |

Legacy dispatch field `awp: true|false` maps to `publish: pr|none`.

In dispatch payloads, set `publish` explicitly when you need `direct` kickstart:

```bash
echo '{"schema_version":"1.0","dispatch_id":"'"$(uuidgen)"'","issue_number":42,"publish":"pr"}' \
  | dn workflows dispatch dn.kickstart_issue --repo owner/repo --json
```

For local publish-mode details, see
[Kickstart & Looping — Publish modes](/dn-cli/overview/#publish-modes).

## Workflow templates

| Template ID          | Installed file           | Trigger                                      | Primary `dn` command                               |
| -------------------- | ------------------------ | -------------------------------------------- | -------------------------------------------------- |
| `dn.init_stack`      | `dn-init-stack.yml`      | `repository_dispatch` → `dn.init_stack`      | `dn init stack`                                    |
| `dn.prep_issue_plan` | `dn-prep-issue-plan.yml` | `repository_dispatch` → `dn.prep_issue_plan` | `dn prep`                                          |
| `dn.kickstart_issue` | `dn-kickstart-issue.yml` | `repository_dispatch` → `dn.kickstart_issue` | `dn kickstart`                                     |
| `dn.daily_kickstart` | `dn-daily-kickstart.yml` | `schedule`, `workflow_dispatch`              | `dn kickstart --publish pr --milestone <n> --once` |

See [Scheduled Workflows](/dn-cli/scheduled-workflows/) for setup, the
`DN_DAILY_KICKSTART_MILESTONE` variable, and manual runs.

Machine-readable contract: `templates/workflows/manifest.json` in the
[`dn`](https://github.com/chesapeakedev/dn) repository.

## Dispatch payloads

All canonical `repository_dispatch` events use `schema_version: "1.0"` and
require a caller-generated `dispatch_id` for correlation.

### `dn.init_stack`

Required: `schema_version`, `dispatch_id`, `milestone`.

Optional: `refresh` (defaults to `true`), `stack_mode` (`create`, `refresh`, or
`overwrite`), `publish` (`direct` or `none`; defaults to `direct` in CI),
`validate_only`.

`refresh=true` maps to `stack_mode: refresh`, which preserves completed
checklist items. `refresh=false` maps to `create`.

```bash
echo '{"schema_version":"1.0","dispatch_id":"'"$(uuidgen)"'","milestone":"42"}' \
  | dn workflows dispatch dn.init_stack --repo owner/repo --json
```

Writes `plans/{owner}_{repo}_{milestone}.stack.md` and `.stack.json`.

### `dn.prep_issue_plan`

Required: `schema_version`, `dispatch_id`, and **exactly one of** `issue_url` or
`issue_number`.

Optional: `plan_name`, `validate_only`.

```bash
echo '{"schema_version":"1.0","dispatch_id":"'"$(uuidgen)"'","issue_number":42}' \
  | dn workflows dispatch dn.prep_issue_plan --repo owner/repo --json
```

### `dn.kickstart_issue`

Required: `schema_version`, `dispatch_id`, and **exactly one of** `issue_url` or
`issue_number`.

Optional: `publish` (`none`, `pr`, or `direct`; defaults to `pr`), `awp` (legacy
alias for `publish`), `validate_only`.

```bash
echo '{"schema_version":"1.0","dispatch_id":"'"$(uuidgen)"'","issue_url":"https://github.com/owner/repo/issues/42"}' \
  | dn workflows dispatch dn.kickstart_issue --repo owner/repo --json --wait
```

`repository_dispatch` returns HTTP **204** with no run id. Poll with
`gh run list --repo owner/repo --event repository_dispatch` or use
`dn workflows dispatch --wait`.

## Dispatch and manage workflows from the CLI

```bash
dn workflows list
dn workflows install
dn workflows update
dn workflows validate --json

dn workflows dispatch release.yml
dn workflows dispatch triage.yml -f name=scully -f greeting=hello
echo '{"name":"scully"}' | dn workflows dispatch triage.yml --json
```

Common `dispatch` options:

- `--repo`, `-R` — Target `owner/repo`
- `--ref`, `-r` — Branch or tag containing the workflow file
- `--wait` — Poll until a `repository_dispatch` run appears
- `-f`, `--raw-field` — String workflow input
- `-F`, `--field` — String input; `@path` reads file contents
- `--json` — JSON object from stdin

`dn workflows exec <template-id>` is the runner-side command used by
`chesapeakedev/dn-action`. Users normally do not call `exec` directly.

`install` writes missing workflow files. `update` refreshes missing or outdated
templates. Passing `--agent` to `install` or `update` creates or updates
`.github/dn/config.json`.

```bash
dn init workflows --agent opencode --dry-run
dn workflows install --agent cursor
```

## Permissions

| Workflow             | `permissions`                                              |
| -------------------- | ---------------------------------------------------------- |
| `dn.init_stack`      | `contents: write`, `issues: write`                         |
| `dn.prep_issue_plan` | `contents: write`, `issues: write`                         |
| `dn.kickstart_issue` | `contents: write`, `pull-requests: write`, `issues: write` |
| `dn.daily_kickstart` | `contents: write`, `pull-requests: write`, `issues: write` |

For kickstart with `publish: pr`, also enable **Allow GitHub Actions to create
and approve pull requests** under **Settings → Actions → General → Workflow
permissions**.

## Denoise and other integrators

Denoise dispatches the same payload shapes through its backend GitHub App. The
milestone dashboard can trigger `dn.init_stack`, `dn.prep_issue_plan`, and
`dn.kickstart_issue` on linked repositories that have installed templates.

Compatibility paths (still supported, separate from dispatch):

- Issue labels: `denoise-build`, `cursor awp`, `opencode awp`
- Comment trigger: `/dn kickstart`

Dispatch events are the canonical integration path. See
[denoise GitHub integration](/denoise/github-integration/) and
[Milestone details](/denoise/milestone-details/).

## Unattended output

In unattended mode `dn`:

- Uses one-line progress instead of spinners
- Prints ASCII-friendly markers (`[OK]`, `[WARN]`, `[ERROR]`) instead of emoji
- Never blocks on interactive prompts
- Prefixes its own lines with `[dn]` so mixed agent logs stay readable

Force unattended behavior in a local terminal with `--unattended` or `--ci`:

```bash
dn kickstart --unattended 123
```

| Flag                     | Effect                                 |
| ------------------------ | -------------------------------------- |
| `--unattended` or `--ci` | Force unattended mode                  |
| `--no-color`             | Disable ANSI colors                    |
| `--color`                | Enable colors when stdout is not a TTY |

| Variable      | Effect                                  |
| ------------- | --------------------------------------- |
| `NO_COLOR`    | Disable color (set automatically in CI) |
| `FORCE_COLOR` | Enable color when not a TTY             |
| `TERM=dumb`   | Treat output as no color                |

Agent-backed workflows in CI also use harness-specific variables such as
`ANTHROPIC_API_KEY`, `CLAUDE_CODE_BARE=1` (set by workflows for Claude), and
`CODEX_TIMEOUT_MS`. Agent selection in workflows comes from
`.github/dn/config.json`; see
[Installation — Choose an agent](/dn-cli/installation/#choose-an-agent).

## Exit codes

| Code | Meaning                                                               |
| ---- | --------------------------------------------------------------------- |
| `0`  | Success                                                               |
| `1`  | Failure (bad input, auth error, agent error, or unexpected exception) |

## Troubleshooting

| Symptom                                        | Check                                                                               |
| ---------------------------------------------- | ----------------------------------------------------------------------------------- |
| `Missing .github/dn/config.json`               | Run `dn init workflows --agent <agent>` and commit                                  |
| Agent secret missing                           | `dn workflows validate --json`; set the secret for your configured agent            |
| `CI environment requires --publish pr\|direct` | Dispatch or workflow must use a publish mode, not `none`                            |
| OpenCode auth errors in CI                     | Provider `apiKey` must reference an env var the workflow sets                       |
| No PR created                                  | Workflow permissions, `pull-requests: write`, and `publish: pr`                     |
| Dispatch accepted but no run                   | Poll `repository_dispatch` runs; confirm workflow files exist on the default branch |
| Changes not persisted after init stack         | Confirm `publish` is `direct` (default in CI for `dn.init_stack`)                   |

See also
[Kickstart & Looping — Troubleshooting](/dn-cli/overview/#troubleshooting) and
[Self-hosted runners](/operations/self-hosted-runners/).

## Legacy label workflows

Some repositories still ship standalone workflows that trigger on issue labels
(for example `kickstart-opencode.yml` / `kickstart-cursor.yml`):

| Label          | Workflow           |
| -------------- | ------------------ |
| `opencode awp` | OpenCode kickstart |
| `cursor awp`   | Cursor kickstart   |

Prefer canonical templates from `dn init workflows`. Custom label workflows can
use `chesapeakedev/dn-action` without the `workflow` input to install `dn`, but
must validate their own event, install their agent harness, and invoke the
desired `dn` command.

After execution, integrations typically post a comment on the issue with status,
PR link, and error details. Branch names use the `kickstart/` prefix, for
example `kickstart/issue_123_add-new-feature`.
