---
title: Command reference
description: Complete dn subcommand inventory aligned with dn --help, plus workflow-focused usage detail.
---

Use this page to look up any `dn` subcommand. The inventory below mirrors
top-level `dn --help` so you can see which commands have narrative docs on this
site and which still rely on `dn <subcommand> --help` alone — useful when
auditing half-finished CLI ideas.

For an issue-to-pull-request walkthrough, start with
[Completing GitHub Issues](/dn/completing-github-issues/). Run
`dn <subcommand> --help` for flags and nested commands not repeated here.

## Global options

These apply before any subcommand:

| Option | Purpose |
| ------ | ------- |
| `--agent <harness[:model]>` | Harness (`opencode`, `cursor`, `claude`, `codex`, `copilot`) and optional model or thinking level |
| `--sandbox <none\|docker\|exe.dev>` | Sandbox provider; omit the value to read `dn.json` |
| `--context-file <path>` | Include a file in agent prompt context (repeatable) |
| `--unattended` | Disable interactive output affordances |
| `--trace` / `--no-trace` | Stream or suppress live agent stdout/stderr (CI defaults to trace) |
| `--no-color` / `--color` | Control ANSI color |
| `--version`, `-V` | Print version and exit |

## Choose an agent

Agent-backed commands (`kickstart`, `meld`, `loop`, `land`, and others in the
[command inventory](#command-inventory)) run through an agent harness. OpenCode is
the default when nothing else is configured.

**Repository default.** `dn init workflows --agent <name>` writes
`.github/dn/config.json` with the preferred agent for the repository:

```json
{
  "schema_version": "1.0",
  "agent": "opencode"
}
```

Supported values are `opencode`, `cursor`, `claude`, `codex`, and `copilot`.
GitHub Actions workflows and denoise integrators read this file so automated runs
use the same agent without passing `--agent` on every dispatch. Re-run
`dn init workflows --agent <name>` or edit the file directly to change the
default. For team-wide agent and sandbox policy, prefer a root `dn.json` with
`schema_version: "2.0"` — see [Sandbox execution](/runners/sandbox/). See
[Headless setup](/runners/headless-use/) for the matching repository secrets.

**Single-run override.** Pass the global `--agent` flag when you want a
different harness for one local command:

```bash
dn --agent codex meld 123
dn --agent claude kickstart --awp 123
```

Run `dn <command> --help` for command-specific options.

## Command inventory

Each row matches a top-level subcommand from `dn --help`. **Doc depth** is a
rough guide for audits: **full** sections on this page or a linked guide;
**summary** only a short section or sibling page; **help** means rely on CLI
help for now.

### Planning, implementation, and close-out

| Subcommand | Purpose | Doc depth | Where |
| ---------- | ------- | --------- | ----- |
| `kickstart` | Plan and implement an issue or local spec | full | [§ `dn kickstart`](#dn-kickstart) |
| `meld` | Plan from one or more sources | full | [§ `dn meld`](#dn-meld) |
| `loop` | Implement an existing plan | full | [§ `dn loop`](#dn-loop) |
| `land` | Close out work into VCS commits | full | [§ `dn land`](#dn-land) |
| `fixup` | Address PR feedback locally | full | [§ `dn fixup`](#dn-fixup) |
| `until` | Bounded loops | full | [§ `dn until`](#dn-until) |
| `ensure` | Run a named `dn.json` recipe | full | [§ `dn ensure`](#dn-ensure) |
| `read` | Read-only PR review brief | full | [§ `dn read`](#dn-read) |
| `sync` | Rebase onto trunk and publish | full | [§ `dn sync`](#dn-sync); detail in [Landing](/dn/task-list-and-sync/#dn-sync) |

### GitHub and activity

| Subcommand | Purpose | Doc depth | Where |
| ---------- | ------- | --------- | ----- |
| `issue` | Manage issues and relationships | full | [§ `dn issue`](#dn-issue) |
| `milestone` | Create, list, publish milestones | full | [§ `dn milestone`](#dn-milestone) |
| `glance` | Project velocity overview | full | [§ `dn glance`](#dn-glance) |
| `release` | Create, list, view, edit, delete releases | summary | [§ `dn release`](#dn-release) |

### Setup, context, and automation

| Subcommand | Purpose | Doc depth | Where |
| ---------- | ------- | --------- | ----- |
| `init` | Stack, workflows, agents, wizard | summary | [§ `dn init`](#dn-init) |
| `workflows` | Install, validate, dispatch GitHub Actions | summary | [§ `dn workflows`](#dn-workflows); [Headless use](/runners/headless-use/) |
| `context` | Inspect inherited `AGENTS.md` chain | full | [Filesystem Context — `dn context`](/dn/filesystem-context/#dn-context) |
| `auth` | Complementary GitHub sign-in | summary | [§ `dn auth`](#dn-auth); [Installation — GitHub authentication](/dn/installation/#github-authentication) |
| `completion` | Bash or zsh tab completion | summary | [§ `dn completion`](#dn-completion) |

### Triage, queues, and local tasks

| Subcommand | Purpose | Doc depth | Where |
| ---------- | ------- | --------- | ----- |
| `peek` | Heuristic next-issue ranking (no LLM) | full | [Landing — `dn peek`](/dn/task-list-and-sync/#dn-peek) |
| `todo` | Prioritized list at `~/.dn/todo.md` | full | [Landing — `dn todo`](/dn/task-list-and-sync/#dn-todo) |
| `tidy` | Refresh todo list; groom config and harness files | full | [Landing — `dn tidy`](/dn/task-list-and-sync/#dn-tidy); [§ `dn tidy` extras](#dn-tidy-extras) |
| `task` | Local Denoise task JSON (`~/.dn/tasks/`) | summary | [§ `dn task`](#dn-task) |

### Infrastructure and design docs

| Subcommand | Purpose | Doc depth | Where |
| ---------- | ------- | --------- | ----- |
| `runner` | Pair this machine as Denoise infrastructure | summary | [§ `dn runner`](#dn-runner); [Runners overview](/runners/overview/) |
| `rfc` | Request-for-comments documents in the repo | summary | [§ `dn rfc`](#dn-rfc) |

### Core workflow (quick map)

| Command | Stage |
| ------- | ----- |
| `dn kickstart` / `dn meld` + `dn loop` | Plan and implement |
| `dn land` | Local commits from a completed plan |
| `dn fixup` | PR review follow-up |
| `dn until` | Repeat until a verifier passes |
| `dn ensure` | Named quality recipe from `dn.json` |
| `dn sync` | Intentional trunk publish (not the PR path) |

## `dn kickstart`

```bash
dn kickstart 123
dn kickstart docs/spec.md
dn kickstart --publish pr 123
dn --agent codex kickstart 123
dn kickstart --sandbox docker 123
```

`kickstart` plans and implements a GitHub issue or local Markdown specification.
Its publish mode controls where the workflow stops:

| Mode         | Flag                       | Result                                 |
| ------------ | -------------------------- | -------------------------------------- |
| Local        | `--publish none` (default) | Changes and plan stay in the workspace |
| Pull request | `--publish pr` or `--awp`  | Branch/bookmark, commit, push, and PR  |
| Direct       | `--publish direct`         | Commit and push to the default branch  |

Use a feature branch or bookmark for local work that will become a pull request.
See [Completing GitHub Issues](/dn/completing-github-issues/) for review
boundaries, milestone queues, and publication details.

## `dn meld`

### Plan with `meld`

`dn meld` accepts one issue, several issues, local Markdown, or a mixture:

```bash
dn meld 123 --plan-name issue-123
dn meld 123 127 architecture.md --output plans/merged-context.md
dn meld --list planning-sources.txt
dn meld --update-issue 123
```

The planner writes a durable `plans/*.plan.md` file containing source context,
implementation steps, and checklist acceptance criteria. Review and edit that
file before implementation. Because the contract is a file, the work can move
between OpenCode, Claude Code, Cursor, and Codex or resume in a later session.
When you provide `--output`, `meld` also preserves the normalized merged source
context. `--update-issue` publishes the resulting plan to the selected GitHub
issue.

## `dn loop`

### Implement with `loop`

```bash
dn loop plans/issue-123.plan.md
dn loop 123
PLAN=plans/issue-123.plan.md dn loop
```

`loop` implements one existing plan. It does not create a plan, commit, push, or
open a pull request. If work remains, it updates the checklist and writes a
`*.continuation.plan.md` file. Review the current state and rerun the same plan;
the checked items are the restart point.

## `dn land`

`land` closes completed plan-backed work into durable local VCS state. It does
not publish trunk or open a pull request.

### Inputs and behavior

```bash
dn land
dn land plans/issue-123.plan.md
dn land --single plans/issue-123.plan.md
dn land plans/issue-123.plan.md --dry-run
```

`land` discovers or accepts a `plans/*.plan.md` file, verifies its checklist,
reviews current workspace changes, and uses the selected agent to group them
into logical conventional commits. On success, it removes the plan file. Land
targets one plan at a time; for per-issue publish without stacking local
kickstarts, use `dn kickstart --publish pr|direct` instead. These verbs match
the denoise task dialog; quality lives on sync. See
[Kickstart](/kickstart/).

`--single` creates one deterministic commit without an agent. `--dry-run`
previews the operation without committing, deleting a plan, or changing GitHub.

### Publish an issue test plan

```bash
dn land --issue-testplan plans/issue-123.plan.md
dn land --issue-testplan --dry-run
```

`--issue-testplan` generates a concise `## Test Plan` checklist and upserts it
on the linked GitHub issue before committing. Issue discovery checks a full URL
in the plan, an `issue-123.plan.md` filename, or a `#123` reference. A local
`--test-plan <path>` provides extra commit context but does not update GitHub.

If the issue body is absent or returned as null, `land` treats it as empty and
creates the section. Authentication, permission, or issue-resolution failures
stop the update instead of modifying an uncertain issue.

### Outputs and recovery

Local outputs are commits or bookmarks and plan-file removal. The only GitHub
change is the optional issue test-plan upsert. Push the resulting feature branch
or bookmark and create a pull request with your usual VCS workflow. Use
`dn sync` only for intentional trunk publication. Quality checks live on sync
(`sync.preflight`). See [`dn sync`](/dn/command-reference/#dn-sync) for the preflight
and publication behavior.

If commit creation fails after removing a plan, `land` attempts to restore it.
Inspect VCS state, restore or complete any partial commit, and rerun `land` with
the same plan. Use `--dry-run` first when plan discovery or issue linkage is
uncertain.

## `dn fixup`

```bash
dn fixup https://github.com/owner/repo/pull/123
dn --agent cursor fixup https://github.com/owner/repo/pull/123
```

`fixup` fetches the pull-request description and review comments, plans the
requested changes, and implements them in the current workspace.

## Continue after the pull request opens

When review feedback arrives, apply it in the pull request workspace:

```bash
dn fixup https://github.com/owner/repo/pull/123
```

`fixup` fetches the pull request description and review comments, then plans and
implements the requested changes locally.

For interrupted work before publication:

- If no matching plan exists, run `dn meld <issue>`.
- If a plan has unchecked criteria, rerun `dn loop` on that plan — see
  [Implement with `loop`](#implement-with-loop).
- If pull request publication fails after the branch was pushed, inspect the
  remote branch and retry after resolving any conflicting update.

## `dn until`

`until` runs a bounded generator/verifier loop from a JSON config called a
gambit. Use it when a goal has an independent done check, such as the
repository's merge gate. For issue-shaped work, first use `kickstart` or `meld`
and `loop`, then use `until` to resolve remaining verification failures.

Use a script verifier whenever a command can decide whether the goal is done
with exit code 0. Reserve prompt verifiers for rubric-style goals without a
shell check.

### Run and validate a gambit

```bash
dn until validate .github/dn/gambit.json
dn until run .github/dn/gambit.json
dn until run .github/dn/gambit.json --once
dn until run .github/dn/gambit.json --strict-verdict
dn --agent claude until run .github/dn/gambit.json --sandbox docker
```

`validate` parses the config and prints the gambit count. `run` executes gambits
in order under one sandbox lifecycle. `--once` forces one generator → verifier
tick, equivalent to `one_shot: true` on a gambit.

The config has a shared top-level `iterations` bound, which defaults to `10`,
and an optional `timeout_ms`. Gambit zero is the primary and runs every
iteration. Later gambits can be interval reviews or one-shot tails. Each action
uses exactly one of `url`, `content` (JSON `prompt` is an alias for `content`),
or `script`: `url` fetches a goal document, `content` is an inline goal, and
`script` runs a command. A Markdown gambit file uses its body as the generator.
`secrets` lists environment variable
names, never secret values.

`metadata` values are substituted into prompts as `{{key}}` and prepended as a
context block.

### Make the merge gate pass

Use the project's full merge gate so the loop stops when the change is landable:

```json
{
  "gambits": [
    {
      "name": "precommit-green",
      "metadata": {
        "goal": "Complete issue 123 and keep the repository gate green"
      },
      "generator": {
        "prompt": "Implement {{goal}}. Prefer small, reviewable edits. Resolve failures reported by the verifier."
      },
      "verifier": { "script": "make precommit" }
    }
  ],
  "iterations": 5,
  "timeout_ms": 3600000
}
```

```bash
dn until run .github/dn/gambit.json
```

Replace `make precommit` with the repository's merge gate, such as
`deno task check` or `npm test && npm run lint`.

### Add a one-shot final review

Chain gambits when a focused feature gate should pass first and a broader
cleanup should run once:

```json
{
  "gambits": [
    {
      "name": "feature",
      "metadata": {
        "goal": "Implement the verifier verdict-file path in cli/until.ts"
      },
      "generator": {
        "prompt": "Implement {{goal}}. Keep changes in cli/ and matching tests."
      },
      "verifier": {
        "script": "deno test cli/test_until.ts --allow-all"
      }
    },
    {
      "name": "ci-tail",
      "one_shot": true,
      "metadata": {
        "goal": "Resolve type, lint, or format issues left by the feature gambit"
      },
      "generator": {
        "prompt": "{{goal}}. Do not expand scope beyond making the merge gate pass."
      },
      "verifier": { "script": "make precommit" }
    }
  ],
  "iterations": 8
}
```

### Schedule interval reviews

One `dn loop` run is one implementation pass against a plan. `dn until` repeats
a primary generator/verifier pass within an iteration budget and can schedule
satellite reviews:

```json
{
  "iterations": 8,
  "timeout_ms": 3600000,
  "gambits": [
    {
      "name": "raise-coverage",
      "metadata": { "threshold": "80" },
      "generator": {
        "prompt": "Add focused tests that raise line coverage toward {{threshold}}%. Do not weaken assertions or exclude code."
      },
      "verifier": {
        "script": "npm test -- --coverage && ./scripts/check-coverage 80"
      }
    },
    {
      "name": "review-tests",
      "interval": 0.25,
      "align": "spread",
      "phase": "after",
      "generator": {
        "prompt": "Review the new tests for gaps, flakiness, duplication, and weak assertions. Fix clear problems."
      },
      "verifier": { "script": "npm test" }
    },
    {
      "name": "final-review",
      "one_shot": true,
      "generator": {
        "prompt": "Review the completed coverage change and fix remaining integration problems."
      },
      "verifier": { "script": "make precommit" }
    }
  ]
}
```

An interval fires `floor(iterations * interval)` times, capped at the iteration
count. `align` places those runs at the `start`, `end`, or across the full run.
Use explicit 1-based `at` indices when exact iterations matter. `phase` chooses
whether a satellite runs before or after the primary pass.

Interval verifier failures are soft: they are recorded while the primary loop
continues. Primary and one-shot tail failures are hard gates.

### Use a prompt verifier

When no script can decide whether the goal is done, use a prompt verifier.
`until` checks for completion in this order:

1. A verdict file, defaulting to `.dn/until-verdict.json` or set with
   `verifier.verdict_path`, containing `{"done": true}`.
2. Extractable JSON in standard output containing `"done": true`.
3. Optional `verifier.done_when.stdout_contains`, as a weaker fallback.

`until` injects verdict-file instructions into the verifier prompt. Missing or
unparseable verdicts continue the loop unless you pass `--strict-verdict`.

```json
{
  "generator": { "prompt": "Improve the docs tone for {{audience}}" },
  "verifier": {
    "prompt": "Judge whether the docs meet the rubric for {{audience}}.",
    "verdict_path": ".dn/until-verdict.json"
  },
  "metadata": { "audience": "dn CLI users" },
  "iterations": 3
}
```

Avoid generator actions that only format code, prompt verifiers that rely on
stdout containing only JSON, unbounded long-running loops, and secret values in
the gambit file.

### Import a goal from a GitHub issue

```bash
dn until import https://github.com/owner/repo/issues/123
dn until import 123 --split
```

`dn until import` fetches an issue and writes a local goal file next to the
current directory. The default is one Markdown file; `--split` writes a TOML
config plus a neighboring Markdown body. Import is convert-only: it does not
close the GitHub issue or start `dn until run`. Review an imported goal before
running it.

## `dn ensure`

```bash
dn ensure
dn ensure lint
dn ensure tests --no-fix
```

`dn ensure` runs a named recipe from `dn.json` (`ensure.<name>.argv`) and, on
failure, launches a fixer agent before retrying. Kickstart and loop already run
`dn ensure lint` after implementation, so use this command to re-run a recipe on
its own or to list available recipes. `--no-fix` fails fast without the fixer
agent. See [Kickstart](/kickstart/) for the kickstart overview.

## `dn read`

```bash
dn read https://github.com/owner/repo/pull/123
dn read 123 --json
```

`dn read` prints a read-only review brief for a pull request: changed files,
review comments, and check status. It never writes to the workspace or GitHub,
so agents can use it to plan a `dn fixup` without side effects.

The following commands use the GitHub API from your local machine. Authenticate
with `gh auth login`, `dn auth`, or `GITHUB_TOKEN` before running them — see
[Installation — GitHub authentication](/dn/installation/#github-authentication)
and [GitHub Token Setup](/runners/github-token-setup/) when you need token
details.

## `dn init stack`

Creates a prioritized task list from a GitHub milestone:

1. Fetches the milestone and its open issues from GitHub.
2. Scores each issue for kickstart readiness.
3. Writes `plans/{owner}_{repo}_{milestone-number}.stack.md` and `.stack.json`.
4. Prints instructions for committing the generated files.

```bash
dn init stack 42
dn init stack https://github.com/owner/repo/milestone/3
dn init stack 42 --refresh
```

The generated stack file includes prioritized tasks, disqualified issues, and
instructions for agents. `dn kickstart --milestone 42` uses the first unchecked
task as the next work item.

To run stack generation in CI, see
[Headless Use — Dispatch payloads](/runners/headless-use/#dispatch-payloads).

## `dn issue`

Provides CRUD operations for GitHub issues from the terminal:

```bash
dn issue list
dn issue list --repo owner/repo
dn issue list --state closed --limit 10
dn issue list --label bug
dn issue show 123
dn issue show 123 --repo owner/repo
dn issue show 123 --no-comments
dn issue create --title "Bug" --body-file report.md
dn issue create --repo owner/repo --title "Bug" --body-file report.md
dn issue create --title "Bug" --milestone 42
dn issue edit 123 --title "New title"
dn issue edit 123 --add-label bug
dn issue edit 123 --milestone https://github.com/owner/repo/milestone/42
dn issue edit 123 --clear-milestone
dn issue close 123
dn issue close 123 --reason not_planned
dn issue close 123 --comment "Fixed in #456"
dn issue reopen 123
dn issue comment 123 --body-file update.md
dn issue comment 123 --body-stdin
dn issue relationship list 123
dn issue relationship add blocked-by 123 456
dn issue relationship add sub-issue 123 789
dn issue relationship reprioritize sub-issue 123 789 --after 456
dn issue relationship mark-duplicate 123 456
```

Issue references accept a number (`123`), `#123`, or a full URL.
`--repo owner/repo` sets the repository used for numeric refs and commands
without an issue ref, such as `list` and `create`. `dn issue show` includes
relationship metadata (parent issue, sub-issues, blockers, duplicate-of) when
GitHub exposes it. Those reads follow GitHub's GraphQL paging: at most ten
related-issue references appear per edge unless the totals summary shows a
larger count ("more not shown").

## `dn milestone`

Create, list, and publish GitHub milestones from a JSON plan:

```bash
dn milestone create --title "Q1 work"
dn milestone create --title "Q1 work" --description-file milestone.md --due-on 2026-03-31
dn milestone list --repo owner/repo --json
dn milestone publish plans/auth-refactor.json --dry-run --json
dn milestone publish plans/auth-refactor.json --repo owner/repo
```

`dn milestone publish` reads a version `1.0` JSON plan with `milestone` and
`issues` fields, creates the milestone and its issues, then applies each
issue's `blocked_by` relationship after all issues exist. Use `--dry-run` to
validate the plan without making mutations.

## `dn glance`

Prints a velocity report for the **current GitHub repository** — issues opened,
issues closed, and commits on the default branch — over a rolling time window.

`dn glance` does **not** read your local git history. It resolves `owner/repo`
from the checkout's `origin` remote (Git or Sapling) or from `GITHUB_REPOSITORY`
in CI, then fetches all metrics through the **GitHub API**. You need GitHub
authentication (`gh auth login`, `dn auth`, or `GITHUB_TOKEN`) with permission
to read the repository. See
[Installation — GitHub authentication](/dn/installation/#github-authentication).

Run it from a repository checkout whose default remote points at
`github.com/owner/repo`. A bare clone with no remote, or a non-GitHub host, will
not work.

```bash
dn glance
dn glance --days 14
dn glance --compact --no-urls
```

For each run, `dn` compares the last **N** days (default 7) against the **prior
N** days of equal length and prints:

- **Summary** — open, close, and commit counts with per-day rates, trend
  direction vs the prior window, and net issue flow (backlog grew or burned
  down)
- **Issues opened** — grouped by primary label; recent items are highlighted
- **Issues closed** — same grouping
- **Commits** — up to ten recent commits with SHA, subject, and link
- **Activity by user** — share of opens, closes, and commits in the window

| Flag             | Effect                                            |
| ---------------- | ------------------------------------------------- |
| `-d`, `--days N` | Window length in days (default `7`)               |
| `--compact`      | Fewer blank lines between sections                |
| `--no-urls`      | Omit issue and commit URLs (titles and SHAs only) |

Use `dn peek` when you want ranked suggestions for what to work on next; use
`dn glance` when you want a trend snapshot of recent project activity. See
[Landing — `dn peek`](/dn/task-list-and-sync/#dn-peek).

## Milestone workflow

Milestone-shaped work spans several commands:

```bash
dn meld --milestone 42
dn init stack 42
dn kickstart --milestone 42 --once
dn kickstart --publish pr --milestone 42 --complete
```

`dn meld --milestone` writes a user-value-focused milestone description.
`dn init stack` creates a prioritized execution queue — see
[§ `dn init stack`](#dn-init-stack). `dn milestone create`, `list`, and
`publish` manage milestones and bulk issue plans — see
[§ `dn milestone`](#dn-milestone).
`--once` processes one unchecked stack item; `--complete` processes all
remaining items and requires `--publish pr` or `--publish direct`.

## `dn sync`

```bash
dn sync
dn sync --workspace-root /path/to/checkout
dn sync --skip-preflight
```

`sync` rebases the checkout onto remote `main` and publishes local commits that
remain afterward. It is an explicit trunk-publication command, not the final
step of an issue-to-pull-request workflow. Preflight is fail-fast lint + tests
from `dn.json` `sync.preflight`; `--skip-preflight` is a CLI escape hatch.
Denoise never sends it. These verbs match the denoise task dialog; quality lives
on sync. See [`dn sync`](/dn/command-reference/#dn-sync). See
[Landing — `dn sync`](/dn/task-list-and-sync/#dn-sync) for VCS detection,
prerequisites, and the exact Git and Sapling operations.

## `dn auth`

Complementary GitHub sign-in when you do not use GitHub CLI:

```bash
dn auth
dn auth status
dn auth logout
```

`dn` reads `gh auth token` automatically when `gh` is installed. Prefer
`gh auth login`. Use `dn auth` for the device flow, or set `GITHUB_TOKEN` in
CI. See [Installation — GitHub authentication](/dn/installation/#github-authentication).

## `dn init`

```bash
dn init stack 42
dn init build
dn init workflows
dn init agents
dn init wizard
```

| Subcommand | Role |
| ---------- | ---- |
| `stack` | Milestone → `plans/*.stack.md` queue — [§ `dn init stack`](#dn-init-stack) |
| `build` | Install `.github/dn/config.json` and canonical workflow YAML files |
| `workflows` | Same template install path as `init build` (agent via `--agent`) |
| `agents` | Create or refresh root `AGENTS.md` — [Filesystem Context](/dn/filesystem-context/#agentsmd) |
| `wizard` | Guided first-run project or user config (`--project`, `--yes`) |

Use `dn workflows list`, `validate`, and `update` after install — see
[§ `dn workflows`](#dn-workflows).

## `dn workflows`

Manage and run dn GitHub Actions workflows (distinct from this documentation
page slug):

```bash
dn workflows list
dn workflows install
dn workflows update
dn workflows validate --json
dn workflows dispatch dn.kickstart_issue --repo owner/repo --json
dn workflows exec dn.init_stack
```

`install` and `update` sync canonical templates; `dispatch` and `exec` run
them in GitHub Actions. See [Headless use](/runners/headless-use/) for
dispatch payloads, `--wait`, and runner-side `exec`.

## `dn release`

```bash
dn release list
dn release view v1.2.3
dn release create v1.2.3 --title "Release" --notes-file notes.md
dn release edit v1.2.3 --draft
dn release delete v1.2.3
```

GitHub release CRUD from the terminal. Use `dn release <subcommand> --help` for
flags such as `--repo` / `-R` overrides.

## `dn rfc`

Manage design RFCs in the repository:

```bash
dn rfc init
dn rfc create "Session persistence"
dn rfc list --status review
dn rfc show rfcs/012-session-persistence.md
dn rfc status rfcs/012-session-persistence.md accepted
dn rfc complete rfcs/012-session-persistence.md
```

`dn land` can close out RFC paths as well as plan files — see
[§ `dn land`](#dn-land). `dn glance --json` includes RFC fields when present.

## `dn task`

Local Denoise task documents (Void sync), not the GitHub queue in
`~/.dn/todo.md`:

```bash
dn task list
dn task show <id>
dn task upsert --file task.json
dn task delete <id>
```

Pair with `dn kickstart --denoise-task` — see [The Void](/denoise/void/).

## `dn tidy` extras

[Landing](/dn/task-list-and-sync/#dn-tidy) documents issue refresh for
`~/.dn/todo.md`. Additional `tidy` modes groom configuration and harness files:

```bash
dn tidy agent --check
dn tidy agent --fix
dn tidy config --json
dn tidy workflows --json
dn tidy context --json
dn tidy runner --json
dn tidy --all --with-backlog --json
```

`dn tidy agent` currently targets OpenCode phase config files.

## `dn runner`

Operate this machine as Denoise runner infrastructure:

```bash
dn runner connect <code>
dn runner register
dn runner doctor
dn runner status
dn runner jobs
dn runner serve
```

Device jobs use the registered checkout and local agent credentials. See
[Runners overview](/runners/overview/) and
[Device runners](/runners/device-runners/).

## `dn completion`

```bash
eval "$(dn completion bash)"   # ~/.bashrc
eval "$(dn completion zsh)"    # ~/.zshrc after compinit
```

Prints a completion script for subcommands, nested commands, and known flags.
