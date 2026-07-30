---
title: Scheduled Workflows
description: Run dn kickstart daily against a milestone queue, and schedule or dispatch the todo loop.
---

`dn init workflows` installs the canonical workflow files, including
**`dn-daily-kickstart.yml`** and **`dn-todo-loop.yml`**. Daily kickstart runs
against a committed milestone stack — one unchecked queue item per run, opening
a PR for each. The todo loop can run on a schedule or via `repository_dispatch`
from denoise.

Use daily kickstart when you want steady, automated progress through a
prioritized backlog without dispatching `dn.kickstart_issue` by hand every day.

Complete
[Headless Use — Configure a repository](/dn/headless-use/#configure-a-repository)
first. Scheduled workflows reuse the same `.github/dn/config.json`, agent
secret, and OpenCode config as the other canonical workflows.

## What each daily kickstart run does

On schedule (or manual trigger), `chesapeakedev/dn-action` runs:

```bash
dn --agent <configured> kickstart --publish pr --milestone <milestone> --once
```

- **`--milestone`** — Reads `plans/{owner}_{repo}_{milestone}.stack.md` and
  picks the first unchecked item
- **`--once`** — Processes exactly one queue item, then stops (no prompts
  between tasks)
- **`--publish pr`** — Creates a branch, commits, pushes, and opens a pull
  request for that issue

After a successful run, `dn` marks the stack item done and commits the updated
stack file to the default branch so the next scheduled run advances the queue.

## Prerequisites

1. **Canonical workflows installed** — including `dn-daily-kickstart.yml` from
   `dn init workflows`
2. **Milestone stack committed** — generate and commit the queue before enabling
   the schedule:

```bash
dn init stack 42
git add plans/owner_repo_42.stack.md plans/owner_repo_42.stack.json
git commit -m "Add milestone 42 stack"
git push
```

You can also refresh the stack from CI with
[`dn.init_stack`](/dn/headless-use/#dninit_stack) dispatch events. The daily
workflow expects the stack file to exist on the default branch.

3. **Repository variable** — scheduled runs read the milestone from
   `DN_DAILY_KICKSTART_MILESTONE`:

```bash
gh variable set DN_DAILY_KICKSTART_MILESTONE --body 42
```

Set this in **Settings → Secrets and variables → Actions → Variables**, or with
`gh variable set`. Use a milestone number or full GitHub milestone URL.

4. **Workflow permissions** — `contents: write`, `pull-requests: write`, and
   `issues: write`, plus **Allow GitHub Actions to create and approve pull
   requests** under **Settings → Actions → General**.

## Schedule and triggers

The installed daily kickstart template defines:

| Trigger             | Behavior                                |
| ------------------- | --------------------------------------- |
| `schedule`          | Runs daily at `17 13 * * *` (13:17 UTC) |
| `workflow_dispatch` | Manual run from the Actions tab         |

Adjust the cron expression in `.github/workflows/dn-daily-kickstart.yml` if you
want a different time. GitHub schedules use UTC.

### Manual runs

From the GitHub Actions UI, run **dn daily kickstart** and optionally set:

| Input           | Purpose                                                |
| --------------- | ------------------------------------------------------ |
| `milestone`     | Override `DN_DAILY_KICKSTART_MILESTONE` for this run   |
| `validate_only` | Check config and credentials without running kickstart |

From the CLI:

```bash
gh workflow run dn-daily-kickstart.yml --repo owner/repo
gh workflow run dn-daily-kickstart.yml --repo owner/repo -f milestone=42
gh workflow run dn-daily-kickstart.yml --repo owner/repo -f validate_only=true
```

## Setup checklist

```bash
# 1. Install canonical workflows (if not already done)
dn init workflows --agent opencode
gh secret set OPENAI_API_KEY

# 2. Create and commit the milestone queue
dn init stack 42
git add .github/dn/config.json .github/workflows/dn-*.yml plans/*_42.stack.*
git commit -m "Add dn workflows and milestone 42 stack"
git push

# 3. Point scheduled runs at the milestone
gh variable set DN_DAILY_KICKSTART_MILESTONE --body 42

# 4. Validate
dn workflows validate --json
```

Trigger a validation-only manual run before waiting for the cron:

```bash
gh workflow run dn-daily-kickstart.yml --repo owner/repo -f validate_only=true
```

Then run once for real (optionally overriding the milestone):

```bash
gh workflow run dn-daily-kickstart.yml --repo owner/repo
```

## How it differs from `dn.kickstart_issue`

|                     | `dn.daily_kickstart`                   | `dn.kickstart_issue`                     |
| ------------------- | -------------------------------------- | ---------------------------------------- |
| Trigger             | `schedule`, `workflow_dispatch`        | `repository_dispatch`                    |
| Issue source        | Next unchecked item in milestone stack | Explicit `issue_url` or `issue_number`   |
| Runs per invocation | One (`--once`)                         | One issue per dispatch                   |
| Typical use         | Daily backlog drain                    | On-demand or integrator-driven kickstart |

denoise and other tools dispatch `dn.kickstart_issue` for per-task automation.
Scheduled kickstart is for repositories that maintain a committed milestone
queue and want one PR per day without external dispatch.

## Todo loop (`dn.todo_loop`)

`dn-todo-loop.yml` supports `schedule`, `workflow_dispatch`, and
`repository_dispatch` (`dn.todo_loop`). Denoise can start a todo loop from the
web using the same event shape as other tracked dispatches, including optional
nested `progress` for live phase/step reporting when the progress base URL is
configured.

See [Headless Use — `dn.todo_loop`](/dn/headless-use/#dntodo_loop) and
[Progress reporting](/dn/progress-reporting/).

## Troubleshooting

| Symptom                             | Check                                                                                                                    |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| Workflow skips or fails immediately | `DN_DAILY_KICKSTART_MILESTONE` is set; stack file exists on default branch                                               |
| No unchecked items left             | Queue is complete — refresh with `dn init stack 42 --refresh` or dispatch `dn.init_stack`                                |
| No PR created                       | Workflow permissions and `pull-requests: write`; see [Headless Use — Troubleshooting](/dn/headless-use/#troubleshooting) |
| Wrong milestone                     | Update the repository variable or pass `milestone` on `workflow_dispatch`                                                |
| Schedule never runs                 | Default branch must contain the workflow file; GitHub disables schedules on inactive repos                               |

For milestone stack format and local `dn kickstart --milestone` usage, see
[Completing GitHub Issues — Milestone queues](/dn/completing-github-issues/#milestone-queues)
and
[Filesystem Context — Milestone stack files](/dn/filesystem-context/#milestone-stack-files).
