---
title: Command reference
description: Complete dn command inventory
---

This page mirrors `dn --help` with short usage notes per subcommand. Global
flags and environment variables are in
[Global options and environment](#global-options-and-environment). Agent
defaults are in [Choose an agent](/dn/filesystem-context/#choose-an-agent).

Commands that call GitHub need a token from `gh auth login`, `dn auth`, or
`GITHUB_TOKEN`. See
[GitHub authentication](/dn/installation/#github-authentication).

### Core commands

Plan, implement, land, and retry until verifiers pass.

| Subcommand  | Purpose                                   | Doc depth | Where                                              |
| ----------- | ----------------------------------------- | --------- | -------------------------------------------------- |
| `kickstart` | Plan and implement an issue or local spec | full      | [Kickstart](/kickstart/), [options](#dn-kickstart) |
| `meld`      | Plan from one or more sources             | full      | [`dn meld`](#dn-meld)                              |
| `loop`      | Implement an existing plan                | full      | [`dn loop`](#dn-loop)                              |
| `land`      | Close out work into VCS commits           | full      | [`dn land`](#dn-land)                              |
| `until`     | Bounded loops                             | full      | [`dn until`](#dn-until)                            |
| `sync`      | Rebase onto trunk and publish             | full      | [`dn sync`](#dn-sync)                              |

### GitHub

Issues, pull requests, milestones, releases, GitHub Actions, and activity on
GitHub.

| Subcommand  | Purpose                                    | Doc depth | Where                                                                                                       |
| ----------- | ------------------------------------------ | --------- | ----------------------------------------------------------------------------------------------------------- |
| `issue`     | Manage issues and relationships            | full      | [GitHub context](/dn/github-context/#issues-and-relationships)                                              |
| `read`      | Read-only PR review brief                  | full      | [GitHub context](/dn/github-context/#pull-requests-and-review)                                              |
| `fixup`     | Address PR feedback locally                | full      | [GitHub context](/dn/github-context/#pull-requests-and-review)                                              |
| `milestone` | Create, list, publish milestones           | full      | [GitHub context](/dn/github-context/#milestones-and-queues)                                                 |
| `glance`    | Project velocity overview                  | full      | [GitHub context](/dn/github-context/#releases-activity-and-actions)                                         |
| `release`   | Create, list, view, edit, delete releases  | summary   | [GitHub context](/dn/github-context/#releases-activity-and-actions)                                         |
| `workflows` | Install, validate, dispatch GitHub Actions | summary   | [GitHub context](/dn/github-context/#releases-activity-and-actions), [Headless use](/runners/headless-use/) |

### Setup, context, and automation

Repository bootstrap, `dn.json` recipes, and agent context files.

| Subcommand   | Purpose                             | Doc depth | Where                                                                                   |
| ------------ | ----------------------------------- | --------- | --------------------------------------------------------------------------------------- |
| `init`       | Stack, workflows, agents, wizard    | summary   | [`dn init`](#dn-init)                                                                   |
| `ensure`     | Run a named `dn.json` recipe        | full      | [`dn ensure`](#dn-ensure)                                                               |
| `context`    | Inspect inherited `AGENTS.md` chain | full      | [`dn context`](/dn/filesystem-context/#dn-context)                                      |
| `auth`       | Complementary GitHub sign-in        | summary   | [`dn auth`](#dn-auth), [GitHub authentication](/dn/installation/#github-authentication) |
| `completion` | Bash or zsh tab completion          | summary   | [`dn completion`](#dn-completion)                                                       |

### Triage, queues, and local tasks

Choose and groom local work queues without starting an agent run.

| Subcommand | Purpose                                                             | Doc depth | Where                                                      |
| ---------- | ------------------------------------------------------------------- | --------- | ---------------------------------------------------------- |
| `peek`     | Heuristic next-issue ranking (no LLM)                               | full      | [`dn peek`](#dn-peek)                                      |
| `task`     | Unified list at `~/.dn/todo.md` (Personal native + kickstart queue) | full      | [`dn task`](#dn-task)                                      |
| `tidy`     | Refresh task list; groom config and harness files                   | full      | [`dn tidy`](#dn-tidy), [`dn tidy` extras](#dn-tidy-extras) |

`peek`, `task`, `tidy`, and `sync` in this group are **experimental**. Behavior
and flags may change in future `dn` releases. They complement
[kickstart](/kickstart/) and the core plan → implement → land flow above.

### Infrastructure and design docs

Device runners and design RFCs tracked in the repository.

| Subcommand | Purpose                                     | Doc depth | Where                                                             |
| ---------- | ------------------------------------------- | --------- | ----------------------------------------------------------------- |
| `runner`   | Pair this machine as Denoise infrastructure | summary   | [`dn runner`](#dn-runner), [Runners overview](/runners/overview/) |
| `rfc`      | Request-for-comments documents in the repo  | summary   | [`dn rfc`](#dn-rfc)                                               |

## `dn kickstart`

`kickstart` accepts a GitHub issue, local Markdown spec, denoise task, or a
queued item. The workflow and publish modes are covered in the
[Kickstart guide](/kickstart/); this section lists the CLI flags that shape the
run.

| Flag                                | Effect                                                                                                        |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| `<issue\|path>`                     | Optional issue number/URL or local Markdown path. Omit to select from a queue.                                |
| `--awp`                             | Alias for `--publish pr`.                                                                                     |
| `--publish <none\|pr\|direct>`      | Keep changes local (default), open a pull request, or commit and push to the default branch.                  |
| `--allow-cross-repo`, `-A`          | Allow an issue from another repository; unavailable with AWP publishing.                                      |
| `--steer <prompt>`                  | Add operator guidance to plan and implementation prompts.                                                     |
| `--verbosity <low\|medium\|high>`   | Set plan prompt detail; defaults to `medium`.                                                                 |
| `--skip-plan`                       | Skip plan generation and implement the target directly.                                                       |
| `--plan-only`                       | Generate the plan and stop before implementation.                                                             |
| `--skip-review`                     | Skip the configured second review pass.                                                                       |
| `--milestone <number\|URL>`         | Select the milestone stack queue.                                                                             |
| `--saved-plan <name>`               | Use the named saved plan artifact.                                                                            |
| `--workspace-root <path>`           | Set the workspace root used by the workflow.                                                                  |
| `--once`                            | Run and complete one unchecked milestone stack item, then exit. Requires `--milestone`.                       |
| `--complete`                        | Process all remaining milestone stack items. Requires `--milestone` and `--publish pr` or `--publish direct`. |
| `--denoise-task <file>`             | Use a task JSON file as ticketless input.                                                                     |
| `--cursor-cloud`                    | Run with Cursor Cloud Agent.                                                                                  |
| `--ref <git-ref>`                   | Select the remote ref for Cursor Cloud Agent.                                                                 |
| `--sandbox <none\|docker\|exe.dev>` | Select the agent workflow sandbox.                                                                            |
| `--agent <name>`                    | Select the agent harness; see [Choose an agent](/dn/filesystem-context/#choose-an-agent).                     |
| `--context-file <path>`             | Add a file to agent context.                                                                                  |

`--once` and `--complete` are mutually exclusive. Queue handling, plan review,
and publish behavior are described in the [Kickstart guide](/kickstart/).

## `dn meld`

`meld` builds a plan before anyone implements. Combine issue text, specs, and
notes into `plans/*.plan.md`, edit the file, then run `dn loop` or kickstart on
it.

```bash
dn meld 123 --plan-name issue-123
dn meld 123 127 architecture.md --output plans/merged-context.md
dn meld --list planning-sources.txt --plan-name merged-queue
dn meld --update-issue 123
dn meld research.md --target AGENTS.md
dn meld --milestone 42
```

`--plan-name` names the plan file in scripts. `--list` reads many sources from a
file (one issue number, URL, or `.md` path per line). `--output` saves merged
input markdown before the planner runs. `--update-issue` fills empty issue
template sections on GitHub. `--target` sends planner output to a markdown path
or GitHub comment instead of the default plan file. `--milestone` writes a
milestone description from open issues.

```text title="planning-sources.txt"
123
127
docs/architecture.md
research/field-notes.md
https://github.com/owner/repo/issues/456
```

## `dn loop`

`loop` is the implement step after planning. You need a plan from `meld`, from
kickstart before implement, or a file under `plans/`. Each run is one agent
pass; it does not merge sources or write a new plan.

```bash
dn loop plans/issue-123.plan.md
dn loop 123
dn loop --publish pr plans/issue-123.plan.md
dn loop --steer "Focus on tests and error paths" plans/issue-123.plan.md
PLAN=plans/issue-123.plan.md dn loop
```

Pass a plan path, an issue number, or set `PLAN`. With no argument, `dn` uses
the newest `*.plan.md` in `plans/`. For an issue, `dn` prefers a matching plan
in `plans/` and otherwise implements from the issue body.

When the run finishes, `dn` reads the acceptance checklist. If every item is
checked, implement is finished. With `--publish none` (the default), review the
workspace and run `dn land` to commit. If items stay open, `loop` updates the
plan, may add a `*.continuation.plan.md`, and exits. Run `loop` again on the
same plan; checked items mark progress.

Use `--publish pr` or `--publish direct` to commit, push, and open a PR or
update the default branch in the same run when you do not want a separate `land`
step. Use `--steer` to append operator guidance to the implement prompt. Use
`--allow-cross-repo` when the issue URL targets another repository.

## `dn land`

Run `land` after `loop` or local kickstart when the plan checklist is complete
and you want local commits. Pass a `plans/*.plan.md` path, an RFC path (see
`dn land --help`), or omit the path and let `dn` discover a plan.

```bash
dn land
dn land plans/issue-123.plan.md
dn land --issue-testplan plans/issue-123.plan.md
dn land --single plans/issue-123.plan.md
dn land plans/issue-123.plan.md --dry-run
```

`land` checks the plan's acceptance criteria, then either an agent groups your
workspace diff into conventional commits or `--single` writes one deterministic
commit from the plan title and overview. A successful run removes the plan file.
For commit, push, and pull request in one step on an issue, use
`dn kickstart --publish pr` or `dn loop --publish pr` instead of land-first
local work. See [Kickstart](/kickstart/) for publish modes.

`--dry-run` previews commits and plan removal without writing.
`--issue-testplan` upserts a `## Test Plan` checklist on the GitHub issue linked
from the plan (URL, `issue-123.plan.md` filename, or `#123` in the body) before
committing; `--test-plan <path>` adds local context for that step only. Trunk
publish and repo preflight belong on [`dn sync`](#dn-sync), after you push a
branch or bookmark the usual way.

If commit creation fails after the plan was removed, `land` tries to restore the
plan; inspect VCS state and rerun, or `--dry-run` first when plan or issue
resolution is unclear.

## `dn until`

`until` repeats an implement step and re-runs your verifier until the primary
check passes or `iterations` is exhausted. Define the work in a **TOML** file, a
**Markdown** file with `+++` TOML frontmatter, or legacy JSON. Prefer a script
verifier (`make precommit`, `deno task check`, a focused test command) whenever
exit code 0 means done. Use a prompt verifier only when no command captures the
rubric.

Plan and implement GitHub issues with `meld`, `loop`, or kickstart first. Use
`until` when the tree is close but the merge gate or a test script still fails.

```bash
dn until validate ./goal.md
dn until run ./goal.md
dn until run ./goal.toml --once
dn until run ./goal.md --strict-verdict
dn until import 123
dn until import https://github.com/owner/repo/issues/123 --split
```

`validate` parses the file and prints how many gambits loaded. `run` repeats the
primary gambit (index 0) until its verifier reports done, up to top-level
`iterations` (default `10`) and optional `timeout_ms`. `--once` caps the run at
one primary iteration. That is not the same as `one_shot = true` on a later
gambit, which runs a tail pass after the primary verifier already succeeded.
`--strict-verdict` fails the run when a prompt verifier skips or corrupts the
verdict file instead of retrying. `import` writes a local goal from an issue;
edit it before `run`. With `--split`, import emits TOML plus a separate Markdown
body.

The first gambit is always primary; it cannot set `one_shot`. Additional gambits
use `interval` (with `align`, `at`, or `phase`) for satellite passes, or
`one_shot = true` for a single tail after primary success. Each generator or
verifier action uses exactly one of `url`, `content` (JSON `prompt` is an
alias), or `script`. In a one-file `.md` goal, omit `generator.url` and
`generator.content` so the Markdown body becomes the primary generator. Put long
goal prose in a file and reference it with `url`, not a huge TOML string. List
secret names in `secrets`; never store values in the config. `metadata` replaces
`{{key}}` in prompts.

Interval verifier failures are logged and the primary loop continues. Primary
and one-shot tail verifier failures stop the run.

### Make the merge gate pass

Point the primary verifier at the same commands your team runs before merge. A
one-file Markdown goal keeps the write-up in the body and the gate in
frontmatter:

```markdown
+++
iterations = 5
timeout_ms = 3_600_000

[metadata]
goal = "Complete issue 123 and keep the repository gate green"

[verifier]
script = "make precommit"
+++

Implement {{goal}}. Prefer small, reviewable edits. Resolve failures reported by
the verifier.
```

```bash
dn until run ./goal.md
```

For a short goal, use standalone TOML and point at a Markdown file:

```toml
iterations = 5
timeout_ms = 3_600_000

[metadata]
goal = "Complete issue 123 and keep the repository gate green"

[generator]
url = "./goal-body.md"

[verifier]
script = "make precommit"
```

Swap `make precommit` for your gate, for example `deno task check` or
`npm test && npm run lint`.

### One-shot tail after a narrow gate

The first gambit stays primary until its verifier passes. A second gambit with
`one_shot = true` runs once afterward, for example to run the full merge gate
after a narrow test passed:

```toml
iterations = 8

[[gambits]]
name = "feature"

[gambits.metadata]
goal = "Implement the verifier verdict-file path in cli/until.ts"

[gambits.generator]
content = "Implement {{goal}}. Keep changes in cli/ and matching tests."

[gambits.verifier]
script = "deno test cli/test_until.ts --allow-all"

[[gambits]]
name = "ci-tail"
one_shot = true

[gambits.metadata]
goal = "Resolve type, lint, or format issues left by the feature gambit"

[gambits.generator]
content = "{{goal}}. Do not expand scope beyond making the merge gate pass."

[gambits.verifier]
script = "make precommit"
```

### Interval reviews

Satellite gambits use `interval` as a fraction of top-level `iterations`. Each
interval fires `floor(iterations * interval)` times, capped by `iterations`. Set
`align` to `start`, `end`, or `spread`, or list explicit 1-based `at` indices.
`phase` runs the satellite before or after the primary pass on that tick.

```toml
iterations = 8
timeout_ms = 3_600_000

[[gambits]]
name = "raise-coverage"

[gambits.metadata]
threshold = "80"

[gambits.generator]
content = "Add focused tests that raise line coverage toward {{threshold}}%. Do not weaken assertions or exclude code."

[gambits.verifier]
script = "npm test -- --coverage && ./scripts/check-coverage 80"

[[gambits]]
name = "review-tests"
interval = 0.25
align = "spread"
phase = "after"

[gambits.generator]
content = "Review the new tests for gaps, flakiness, duplication, and weak assertions. Fix clear problems."

[gambits.verifier]
script = "npm test"

[[gambits]]
name = "final-review"
one_shot = true

[gambits.generator]
content = "Review the completed coverage change and fix remaining integration problems."

[gambits.verifier]
script = "make precommit"
```

### Prompt verifier

When no script captures done, the verifier prompt must record a verdict. `until`
checks, in order:

1. A verdict file (default `.dn/until-verdict.json`, or `verifier.verdict_path`)
   containing `{"done": true}`.
2. JSON in stdout with `"done": true`.
3. Optional `verifier.done_when.stdout_contains` as a weaker fallback.

`until` adds verdict-file instructions to the verifier prompt. Without
`--strict-verdict`, a missing or unparseable verdict triggers another primary
iteration.

```toml
iterations = 3

[[gambits]]
name = "docs-tone"

[gambits.metadata]
audience = "dn CLI users"

[gambits.generator]
content = "Improve the docs tone for {{audience}}"

[gambits.verifier]
content = "Judge whether the docs meet the rubric for {{audience}}."
verdict_path = ".dn/until-verdict.json"
```

Install the authoring skill with
`dn init agents --skill dn-until --agent opencode` (or your harness). JSON
gambit files remain valid for older configs.

Do not use generators that only reformat code, prompt verifiers that require
stdout to contain only JSON, or unbounded scripts with no timeout. Keep secrets
out of the goal file.

### Import a goal from GitHub

`dn until import` fetches an issue and writes a goal beside the current
directory. Default output is one Markdown file. With `--split`, you get TOML
config and a neighboring Markdown body. Import does not close the issue or start
`run`.

```bash
dn until import https://github.com/owner/repo/issues/123
dn until import 123 --split
```

## `dn sync`

`sync` rebases onto remote trunk and pushes when local commits remain. Use it
when you intend to land on trunk, not as the last step of a PR workflow.
Preflight runs `sync.preflight` argv lists from `dn.json` unless you pass
`--skip-preflight`.

`dn` auto-detects **Sapling** or **Git** from the workspace:

- **Sapling** — when the repo root contains `.sl` metadata (plain Git checkouts
  with `sl` installed are not treated as Sapling)
- **Git** — otherwise, when `git rev-parse --show-toplevel` succeeds

Sapling takes precedence in dual-compatible repositories.

### What each run does

1. Optional **`sync.preflight`** from `dn.json` (this repo: `make lint` then
   `make tests`; skip with `--skip-preflight`)
2. **Rebase onto remote trunk**
3. **Publish** only when local commits remain after the rebase

**Sapling** (`sl`):

1. `sl pull --rebase -d main`
2. `sl restack` when obsolete children need restacking
3. `sl push --to main` when draft commits exist on the main-line stack

**Git** (`git`):

1. Resolve the remote from `branch.main.remote`, or `origin` when that is not
   set
2. `git fetch <remote> main`
3. `git rebase FETCH_HEAD`
4. `git push <remote> HEAD:main` when `HEAD` is ahead of the fetched `main`

When there is nothing to push, `dn sync` skips the push step and prints why.

### Prerequisites

- **`make`** and a `lint` target in the repository `Makefile` (unless you pass
  `--skip-preflight`)
- **Git** and/or **Sapling** on `PATH`, depending on the checkout type
- A configured remote that can fetch and push `main` (Git uses the tracked
  remote or `origin`; Sapling uses your existing `sl` remote config)

`dn auth` configures GitHub API access for other commands. **VCS push and fetch
use the credentials configured for your Git or Sapling remotes** — HTTPS
credential helper, `gh auth` HTTPS, or SSH.

```bash
dn sync
dn sync --workspace-root /path/to/checkout
dn sync --skip-preflight
```

## `dn init`

First-run repository setup: milestone stack files, workflow templates, root
`AGENTS.md`, or guided config.

```bash
dn init stack 42
dn init build
dn init workflows --agent opencode
dn init agents
dn init wizard --project
```

| Subcommand  | Role                                                                                        |
| ----------- | ------------------------------------------------------------------------------------------- |
| `stack`     | Milestone queue in `plans/*.stack.md` ([`dn init stack`](#dn-init-stack))                   |
| `build`     | Install root `dn.json` (when missing) and canonical workflow YAML files                     |
| `workflows` | Same as `build`; pass `--agent` for harness in config                                       |
| `agents`    | Create or refresh root `AGENTS.md` ([Filesystem Context](/dn/filesystem-context/#agentsmd)) |
| `wizard`    | Guided project or user config (`--project`, `--yes`)                                        |

After install, run [`dn workflows`](#dn-workflows) `list`, `validate`, and
`update`.

## `dn ensure`

Recipes in root `dn.json` under `ensure.<name>` run frozen `argv` lists (no
shell). Kickstart and loop already call `dn ensure lint` after implement when
that recipe exists. Use `dn ensure` with no name to list recipes, or pass a name
to rerun one gate. On failure, `dn` runs a fixer agent unless you pass
`--no-fix`.

```bash
dn ensure
dn ensure lint
dn ensure tests --no-fix
```

## `dn auth`

Complementary `login`, `status`, and `logout` when you need `dn`-managed GitHub
sign-in. Token order, `gh` integration, CI variables, and required scopes are in
[GitHub authentication](/dn/installation/#github-authentication).

```bash
dn auth
dn auth status
dn auth logout
```

Example `status` when `gh` supplies the token:

```text
$ dn auth status
Logged in to github.com as your-user
Token source: GitHub CLI (gh auth token)
Scopes: gist, read:org, repo, workflow
```

## `dn completion`

Install shell completion for subcommands and flags:

```bash
eval "$(dn completion bash)"
eval "$(dn completion zsh)"
```

Add the line to `~/.bashrc` or your zsh config after `compinit`.

## `dn task`

Manages the unified kickstart queue at `~/.dn/todo.md` (native Denoise Personal
tasks with embedded JSON plus GitHub issues and plan paths) and separate Denoise
task documents under `~/.dn/tasks/` (JSON). Personal task-sync and
`dn kickstart --denoise-task` use the `tasks/` files.

```bash
dn task list
dn task show <id|ref>
dn task upsert --file task.json
dn task delete <id>

# Mark queue items done (closes GitHub issue when applicable)
dn task done
dn task done 42
dn task done https://github.com/owner/repo/issues/42
dn task done plans/auth.plan.md

# Inspect runner pairing / file lock (Personal sync)
dn task sync status
```

When the ref is a GitHub issue, `dn` closes the issue with a comment. Use this
after `dn land` (or after `--publish direct` when you want the issue closed) to
keep the list and GitHub in sync. Attended `dn kickstart` does not mark queue
items done on exit.

Personal task-sync relays **native tasks only** to the browser; kickstart queue
lines stay on your laptop. See [Denoise Personal](/denoise/personal/) and
[device runners](/runners/device-runners/#local-task-sync-denoise-personal).

## No-ticket kickstart

If you run `dn kickstart` without an issue URL, issue number, or `ISSUE`, `dn`
reads the task list first. If unchecked items exist, it prompts once before
running the top item. If the list is empty, it can search the current repository
for open issues and plan files, score them, write the list, and suggest the
first item.

Attended kickstart exits after a successful run. It does not mark the queue item
done or ask to continue. Review the changes, run `dn land` when you are ready to
commit, then `dn task done` to check the item off and close the GitHub issue if
applicable. For per-issue publish without a separate land step, use
`--publish pr` or `--publish direct`.

## `dn tidy`

Refreshes and re-scores the task list:

```bash
dn tidy
dn tidy --limit 10
```

From a repository with a GitHub remote, `tidy` fetches recent open issues and
optional `plans/*.plan.md`, scores them for readiness, and updates
`~/.dn/todo.md`. If the scorer suggests merging issues, `dn` prompts before any
GitHub writes. When `EDITOR` is set, it opens the refreshed list.

## `dn tidy` extras

[`dn tidy`](#dn-tidy) refreshes `~/.dn/todo.md` from open issues. These
subcommands groom harness and config files:

```bash
dn tidy agent --check
dn tidy agent --fix
dn tidy config --json
dn tidy workflows --json
dn tidy context --json
dn tidy runner --json
dn tidy --all --with-backlog --json
```

`--check` and `--fix` on `tidy agent` validate OpenCode phase configs. `--json`
on config, workflows, context, and runner aids scripting.

## `dn runner`

Register this machine as a Denoise device runner: pair with a code, serve jobs,
inspect health.

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

## `dn rfc`

Track design RFCs as markdown in the repo: create, review, accept, complete.
[`dn land`](#dn-land) can commit finished RFC work like plan files.

```bash
dn rfc init
dn rfc create "Session persistence"
dn rfc list --status review
dn rfc show rfcs/012-session-persistence.md
dn rfc status rfcs/012-session-persistence.md accepted
dn rfc complete rfcs/012-session-persistence.md
```

`glance --json` includes RFC fields when the repo defines them.

## Global options and environment

Place global options before the subcommand: `dn [global options] <subcommand>`.
A flag overrides the matching environment variable.

### Agent (`--agent`, `DN_AGENT`)

Harness for agent-backed commands on this invocation (`opencode`, `claude`,
`codex:gpt-5.4`, same forms as `dn --help`).

- **Flag:** `--agent <harness[:model]>`
- **Environment:** `DN_AGENT`

File-based defaults:
[Filesystem Context — Choose an agent](/dn/filesystem-context/#choose-an-agent).

### Context files (`--context-file`)

Extra prompt context for this run. Repeat for multiple paths. No env equivalent.

- **Flag:** `--context-file <path>` (repeatable)

### Unattended mode (`--unattended`)

Turn off interactive prompts. Also enabled in CI and when stdout is not a TTY.
Subcommands may still require `--yes` or `DN_YES=1`; that is not global.

- **Flag:** `--unattended`

[Headless use — Unattended output](/runners/headless-use/#unattended-output)
covers CI color, trace, and publish defaults.

### Agent trace (`--trace`, `--no-trace`, `DN_AGENT_TRACE`)

Live agent harness output. Attended TTY defaults to `--no-trace`; CI defaults to
`--trace`.

- **Flags:** `--trace`, `--no-trace`
- **Environment:** `DN_AGENT_TRACE=1` or `0`

### Color (`--color`, `--no-color`)

- **Flags:** `--no-color`, `--color`
- **Environment:** `NO_COLOR`, `FORCE_COLOR`, `TERM=dumb`

### Version

- **Flags:** `--version`, `-V`
