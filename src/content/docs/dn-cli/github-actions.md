---
title: Repository setup
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
4. Commit `.github/workflows/dn-*.yml`, `.github/dn/config.json`, and
   `.github/dn/install-agent.sh`

Prefer canonical workflows installed by `dn init workflows`; use legacy label
workflows only for older repositories.

## `dn init workflows`

Installs canonical GitHub Actions workflows plus repository agent configuration:

| Path                                       | Purpose                                                                 |
| ------------------------------------------ | ----------------------------------------------------------------------- |
| `.github/dn/config.json`                   | Repo-wide agent preference (`opencode`, `cursor`, `claude`, or `codex`) |
| `.github/dn/install-agent.sh`              | Installs only the configured agent harness on the runner                |
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
| `codex`    | `--agent codex`               | `OPENAI_API_KEY`    | Requires Node.js 22 on the runner                                                                                                 |

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
templates and the install script. Passing `--agent` creates or updates
`.github/dn/config.json`.

## `dn workflows`

Runs `workflow_dispatch` and `repository_dispatch` workflows and manages
canonical dn workflow templates.

```bash
dn workflows run release.yml
dn workflows run triage.yml --ref my-branch
dn workflows run triage.yml -f name=scully -f greeting=hello
echo '{"name":"scully"}' | dn workflows run triage.yml --json
dn workflows run smoke.yml --repo owner/repo

# repository_dispatch for canonical dn templates
echo '{"schema_version":"1.0","dispatch_id":"'"$(uuidgen)"'","milestone":"1"}' \
  | dn workflows run dn.init_stack --repo owner/repo --json
```

Common `run` options:

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

### Trigger kickstart from the CLI

After [first-time repository setup](#first-time-repository-setup), dispatch an
installed workflow:

```bash
echo '{"schema_version":"1.0","dispatch_id":"'"$(uuidgen)"'","issue_number":42}' \
  | dn workflows run dn.kickstart_issue --repo owner/repo --json --wait
```

Each installed workflow reads `.github/dn/config.json`, installs only the
configured agent harness, and runs `dn --agent <configured>`. Dispatch payloads
do **not** include `agent`. For OpenCode with
[DeepInfra Kimi K2.6](/kickstart/opencode-deepinfra-kimi-k2-6/), see that guide
after workflows validate.

## Workflow templates

| Template ID          | Installed file           | `repository_dispatch` type | Primary `dn` command |
| -------------------- | ------------------------ | -------------------------- | -------------------- |
| `dn.init_stack`      | `dn-init-stack.yml`      | `dn.init_stack`            | `dn init stack`      |
| `dn.prep_issue_plan` | `dn-prep-issue-plan.yml` | `dn.prep_issue_plan`       | `dn prep`            |
| `dn.kickstart_issue` | `dn-kickstart-issue.yml` | `dn.kickstart_issue`       | `dn kickstart`       |

Each job:

1. Validates the dispatch payload (`schema_version`, `dispatch_id`, and
   workflow-specific fields).
2. Reads `.github/dn/config.json` for the agent — **dispatch payloads do not
   carry `agent`**.
3. Installs `dn` via
   [`chesapeakedev/dn-action@v1`](https://github.com/chesapeakedev/dn-action).
4. Runs `.github/dn/install-agent.sh` for the configured harness.
5. Invokes `dn --agent <configured> …` with CI-friendly env vars (`NO_COLOR`,
   `IS_OPEN_SOURCE`, etc.).

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
  | dn workflows run dn.init_stack --repo owner/repo --json
```

Writes `plans/{owner}_{repo}_{milestone}.stack.md` and `.stack.json`.

### `dn.prep_issue_plan`

Required: `schema_version`, `dispatch_id`, and **exactly one of** `issue_url` or
`issue_number`.

Optional: `plan_name`.

```bash
echo '{"schema_version":"1.0","dispatch_id":"'"$(uuidgen)"'","issue_number":42}' \
  | dn workflows run dn.prep_issue_plan --repo owner/repo --json
```

### `dn.kickstart_issue`

Required: `schema_version`, `dispatch_id`, and **exactly one of** `issue_url` or
`issue_number`.

Optional: `awp` (defaults to `true`).

```bash
echo '{"schema_version":"1.0","dispatch_id":"'"$(uuidgen)"'","issue_url":"https://github.com/owner/repo/issues/42","awp":true}' \
  | dn workflows run dn.kickstart_issue --repo owner/repo --json --wait
```

`repository_dispatch` returns HTTP **204** with no run id. Poll for runs:

```bash
gh run list --repo owner/repo --event repository_dispatch
```

Use `dn workflows run --wait` to block until a new run appears and print its
URL.

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
[OpenCode configuration](/kickstart/configuration/)):

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
[Kickstart usage — Troubleshooting](/kickstart/overview/#troubleshooting) and
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

Prefer canonical templates when possible. If you write a workflow from scratch:

```yaml
name: Kickstart with dn

on:
  issues:
    types: [labeled]

permissions:
  contents: write
  pull-requests: write
  issues: write

jobs:
  kickstart:
    if: github.event.label.name == 'opencode awp'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Install dn
        uses: chesapeakedev/dn-action@v1

      - name: Install OpenCode
        run: bash .github/dn/install-agent.sh

      - name: Run dn kickstart
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
          IS_OPEN_SOURCE: "true"
          NO_COLOR: "1"
        run: |
          dn --agent opencode kickstart --awp "${{ github.event.issue.html_url }}"
```

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
