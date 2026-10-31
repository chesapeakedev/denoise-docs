---
title: Command reference
description: Complete dn command inventory
---

This page mirrors `dn --help` with short usage notes per subcommand. Global
flags and environment variables are in
[Global options and environment](#global-options-and-environment). Agent defaults
are in [Choose an agent](/dn/filesystem-context/#choose-an-agent).

Commands that call GitHub need a token from `gh auth login`, `dn auth`, or
`GITHUB_TOKEN`. See
[GitHub authentication](/dn/installation/#github-authentication).

### Core commands

Plan, implement, land, and retry until verifiers pass.

| Subcommand  | Purpose                                   | Doc depth | Where                                                                         |
| ----------- | ----------------------------------------- | --------- | ----------------------------------------------------------------------------- |
| `kickstart` | Plan and implement an issue or local spec | full      | [Kickstart](/kickstart/)                                                      |
| `meld`      | Plan from one or more sources             | full      | [`dn meld`](#dn-meld)                                                       |
| `loop`      | Implement an existing plan                | full      | [`dn loop`](#dn-loop)                                                       |
| `land`      | Close out work into VCS commits           | full      | [`dn land`](#dn-land)                                                       |
| `until`     | Bounded loops                             | full      | [`dn until`](#dn-until)                                                     |
| `sync`      | Rebase onto trunk and publish             | full      | [`dn sync`](#dn-sync), [`dn sync`](/dn/task-list-and-sync/#dn-sync) |

### GitHub

Issues, pull requests, milestones, releases, GitHub Actions, and activity on GitHub.

| Subcommand  | Purpose                                   | Doc depth | Where                             |
| ----------- | ----------------------------------------- | --------- | --------------------------------- |
| `issue`     | Manage issues and relationships           | full      | [`dn issue`](#dn-issue)         |
| `read`      | Read-only PR review brief                 | full      | [`dn read`](#dn-read)             |
| `fixup`     | Address PR feedback locally               | full      | [`dn fixup`](#dn-fixup)           |
| `milestone` | Create, list, publish milestones          | full      | [`dn milestone`](#dn-milestone) |
| `glance`    | Project velocity overview                 | full      | [`dn glance`](#dn-glance)       |
| `release`   | Create, list, view, edit, delete releases | summary   | [`dn release`](#dn-release)     |
| `workflows` | Install, validate, dispatch GitHub Actions | summary   | [`dn workflows`](#dn-workflows), [Headless use](/runners/headless-use/) |

### Setup, context, and automation

Repository bootstrap, `dn.json` recipes, and agent context files.

| Subcommand   | Purpose                                    | Doc depth | Where                                                                                                    |
| ------------ | ------------------------------------------ | --------- | -------------------------------------------------------------------------------------------------------- |
| `init`       | Stack, workflows, agents, wizard           | summary   | [`dn init`](#dn-init)                                                                                  |
| `ensure`     | Run a named `dn.json` recipe               | full      | [`dn ensure`](#dn-ensure)                                                                                |
| `context`    | Inspect inherited `AGENTS.md` chain        | full      | [`dn context`](/dn/filesystem-context/#dn-context)                                  |
| `auth`       | Complementary GitHub sign-in               | summary   | [`dn auth`](#dn-auth), [GitHub authentication](/dn/installation/#github-authentication) |
| `completion` | Bash or zsh tab completion                 | summary   | [`dn completion`](#dn-completion)                                                                      |

### Triage, queues, and local tasks

Choose and groom local work queues without starting an agent run.

| Subcommand | Purpose | Doc depth | Where |
| ---------- | ------- | --------- | ----- |
| `peek` | Heuristic next-issue ranking (no LLM) | full | [`dn peek`](/dn/task-list-and-sync/#dn-peek) |
| `task` | Unified list at `~/.dn/todo.md` (Void native + kickstart queue) | full | [`dn task`](/dn/task-list-and-sync/#dn-task) |
| `tidy` | Refresh task list; groom config and harness files | full | [`dn tidy`](/dn/task-list-and-sync/#dn-tidy), [`dn tidy` extras](#dn-tidy-extras) |

### Infrastructure and design docs

Device runners and design RFCs tracked in the repository.

| Subcommand | Purpose                                     | Doc depth | Where                                                               |
| ---------- | ------------------------------------------- | --------- | ------------------------------------------------------------------- |
| `runner`   | Pair this machine as Denoise infrastructure | summary   | [`dn runner`](#dn-runner), [Runners overview](/runners/overview/) |
| `rfc`      | Request-for-comments documents in the repo  | summary   | [`dn rfc`](#dn-rfc)                                               |

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
kickstart before implement, or a file under `plans/`. Each run is one agent pass;
it does not merge sources or write a new plan.

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
update the default branch in the same run when you do not want a separate
`land` step. Use `--steer` to append operator guidance to the implement prompt.
Use `--allow-cross-repo` when the issue URL targets another repository.

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

`--dry-run` previews commits and plan removal without writing. `--issue-testplan`
upserts a `## Test Plan` checklist on the GitHub issue linked from the plan
(URL, `issue-123.plan.md` filename, or `#123` in the body) before committing;
`--test-plan <path>` adds local context for that step only. Trunk publish and
repo preflight belong on [`dn sync`](#dn-sync), after you push a branch or
bookmark the usual way.

If commit creation fails after the plan was removed, `land` tries to restore the
plan; inspect VCS state and rerun, or `--dry-run` first when plan or issue
resolution is unclear.

## `dn until`

`until` repeats an implement step and re-runs your verifier until the primary
check passes or `iterations` is exhausted. Define the work in a gambit file
(JSON, TOML, or Markdown). Prefer a script verifier (`make precommit`,
`deno task check`, a focused test command) whenever exit code 0 means done. Use
a prompt verifier only when no command captures the rubric.

Plan and implement GitHub issues with `meld`, `loop`, or kickstart first. Use
`until` when the tree is close but the merge gate or a test script still fails.

```bash
dn until validate .github/dn/gambit.json
dn until run .github/dn/gambit.json
dn until run .github/dn/gambit.json --once
dn until run .github/dn/gambit.json --strict-verdict
dn until import 123
dn until import https://github.com/owner/repo/issues/123 --split
```

`validate` parses the file and prints how many gambits loaded. `run` repeats
the primary gambit (index 0) until its verifier reports done, up to top-level
`iterations` (default `10`) and optional `timeout_ms`. `--once` caps the run at
one primary iteration. That is not the same as `one_shot: true` on a later
gambit, which runs a tail pass after the primary verifier already succeeded.
`--strict-verdict` fails the run when a prompt verifier skips or corrupts the
verdict file instead of retrying. `import` writes a local goal from an issue;
edit it before `run`. With `--split`, import emits TOML plus a separate Markdown
body.

The first gambit is always primary; it cannot set `one_shot`. Additional gambits
use `interval` (with `align`, `at`, or `phase`) for satellite passes, or
`one_shot: true` for a single tail after primary success. Each generator or
verifier action uses exactly one of `url`, `content` (JSON `prompt` is an alias),
or `script`. A `.md` gambit file uses the file body as the generator goal.
List secret names in `secrets`; never store values in the file. `metadata` replaces
`{{key}}` in prompts.

Interval verifier failures are logged and the primary loop continues. Primary and
one-shot tail verifier failures stop the run.

### Make the merge gate pass

Point the primary verifier at the same commands your team runs before merge:

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

Swap `make precommit` for your gate, for example `deno task check` or
`npm test && npm run lint`.

### One-shot tail after a narrow gate

The first gambit stays primary until its verifier passes. A second gambit with
`one_shot: true` runs once afterward, for example to run the full merge gate
after a narrow test passed:

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

### Interval reviews

Satellite gambits use `interval` as a fraction of top-level `iterations`. Each
interval fires `floor(iterations * interval)` times, capped by `iterations`.
Set `align` to `start`, `end`, or `spread`, or list explicit 1-based `at`
indices. `phase` runs the satellite before or after the primary pass on that
tick.

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

```json
{
  "gambits": [
    {
      "name": "docs-tone",
      "metadata": { "audience": "dn CLI users" },
      "generator": { "prompt": "Improve the docs tone for {{audience}}" },
      "verifier": {
        "prompt": "Judge whether the docs meet the rubric for {{audience}}.",
        "verdict_path": ".dn/until-verdict.json"
      }
    }
  ],
  "iterations": 3
}
```

Do not use generators that only reformat code, prompt verifiers that require
stdout to contain only JSON, or unbounded scripts with no timeout. Keep secrets
out of the gambit file.

### Import a goal from GitHub

`dn until import` fetches an issue and writes a goal beside the current
directory. Default output is one Markdown file. With `--split`, you get TOML
config and a neighboring Markdown body. Import does not close the issue or start
`run`.

```bash
dn until import https://github.com/owner/repo/issues/123
dn until import 123 --split
```

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

## `dn read`

`read` prints a pull request brief (files, review comments, checks) without
writing to the workspace or GitHub. Use it before `fixup` when you want context
for you or an agent. `--json` suits scripts.

```bash
dn read https://github.com/owner/repo/pull/123
dn read 123 --json
```

## `dn init stack`

Build a ranked kickstart queue from a GitHub milestone. Output lands in
`plans/{owner}_{repo}_{milestone}.stack.md` and `.stack.json`. Commit those
files if the team should share the queue.

```bash
dn init stack 42
dn init stack https://github.com/owner/repo/milestone/3
dn init stack 42 --refresh
```

`--refresh` updates an existing stack from GitHub. `dn kickstart --milestone 42`
takes the next unchecked row. For CI dispatch, see
[Headless use — Dispatch payloads](/runners/headless-use/#dispatch-payloads).

## `dn issue`

Script issue CRUD and GitHub's relationship fields from the terminal. Set
`--repo owner/repo` when numeric refs should target another repository than the
checkout. Use `relationship` subcommands for blockers, sub-issues, and
duplicates.

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

Issue references accept `123`, `#123`, or a full URL. `issue show` prints
relationship metadata when GitHub exposes it (parent, sub-issues, blockers,
duplicate-of). GraphQL paging limits related-issue lists to ten references per
edge unless the summary reports more.

## `dn milestone`

Create milestones, list open ones, or publish a bulk issue plan from JSON.
`publish` reads a version `1.0` file with `milestone` and `issues`, creates the
milestone and issues, then applies each `blocked_by` link after every issue
exists. Run `publish` with `--dry-run --json` to validate without writes.

```bash
dn milestone create --title "Q1 work"
dn milestone create --title "Q1 work" --description-file milestone.md --due-on 2026-03-31
dn milestone list --repo owner/repo --json
dn milestone publish plans/auth-refactor.json --dry-run --json
dn milestone publish plans/auth-refactor.json --repo owner/repo
```

dn milestone publish plans/auth-refactor.json --repo owner/repo
```

## `dn glance`

`glance` reports issue and commit velocity for the repository tied to your
checkout's `origin` remote (or `GITHUB_REPOSITORY` in CI). It uses the GitHub
API, not local git history. Run it from a clone whose default remote is
`github.com/owner/repo`.

```bash
dn glance
dn glance --days 14
dn glance --compact --no-urls
```

Each run compares the last **N** days (default 7) to the prior **N** days:
open and close rates, commit count, label groupings, recent items, and per-user
share. `--days` sets the window. `--compact` tightens spacing. `--no-urls`
drops issue and commit links from the report.

Use [`dn peek`](/dn/task-list-and-sync/#dn-peek) to rank what to work on next;
use `glance` for a recent activity snapshot.

## Milestone workflow

Typical milestone sequence:

```bash
dn meld --milestone 42
dn init stack 42
dn kickstart --milestone 42 --once
dn kickstart --publish pr --milestone 42 --complete
```

`meld --milestone` drafts a user-value description. `init stack` builds the
ranked queue ([`dn init stack`](#dn-init-stack)). `milestone create`, `list`, and
`publish` handle bulk plans ([`dn milestone`](#dn-milestone)). On kickstart,
`--once` drains one stack row; `--complete` drains the rest and requires
`--publish pr` or `--publish direct`.

## `dn sync`

`sync` rebases onto remote trunk and pushes when local commits remain. Use it
when you intend to land on trunk, not as the last step of a PR workflow.
Preflight runs `sync.preflight` argv lists from `dn.json` unless you pass
`--skip-preflight`.

```bash
dn sync
dn sync --workspace-root /path/to/checkout
dn sync --skip-preflight
```

Git and Sapling detection, prerequisites, and exact rebase behavior are in
[Landing — `dn sync`](/dn/task-list-and-sync/#dn-sync).

## `dn issue`

Script issue CRUD and GitHub's relationship fields from the terminal. Set
`--repo owner/repo` when numeric refs should target another repository than the
checkout. Use `relationship` subcommands for blockers, sub-issues, and
duplicates.

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

Issue references accept `123`, `#123`, or a full URL. `issue show` prints
relationship metadata when GitHub exposes it (parent, sub-issues, blockers,
duplicate-of). GraphQL paging limits related-issue lists to ten references per
edge unless the summary reports more.

## `dn read`

`read` prints a pull request brief (files, review comments, checks) without
writing to the workspace or GitHub. Use it before `fixup` when you want context
for you or an agent. `--json` suits scripts.

```bash
dn read https://github.com/owner/repo/pull/123
dn read 123 --json
```

## `dn fixup`

Use `fixup` on the PR branch when review comments need code changes. It loads
the PR description and review threads, plans the edits, and implements them in
the current checkout. It does not open or merge the PR; commit and push when you
are satisfied.

```bash
dn fixup https://github.com/owner/repo/pull/123
dn --agent cursor fixup https://github.com/owner/repo/pull/123
```

Pass `--context-file` for extra material in the agent prompt. Set `PR_URL` instead
of a positional URL in scripts.

### Before the pull request exists

If work stopped before publication:

- No plan yet: `dn meld <issue>`.
- Plan with open checklist items: rerun [`dn loop`](#dn-loop) on that plan.
- Branch pushed but PR missing: inspect the remote branch and retry kickstart or
  `loop --publish pr` after fixing conflicts.

## `dn milestone`

Create milestones, list open ones, or publish a bulk issue plan from JSON.
`publish` reads a version `1.0` file with `milestone` and `issues`, creates the
milestone and issues, then applies each `blocked_by` link after every issue
exists. Run `publish` with `--dry-run --json` to validate without writes.

```bash
dn milestone create --title "Q1 work"
dn milestone create --title "Q1 work" --description-file milestone.md --due-on 2026-03-31
dn milestone list --repo owner/repo --json
dn milestone publish plans/auth-refactor.json --dry-run --json
dn milestone publish plans/auth-refactor.json --repo owner/repo
```

dn milestone publish plans/auth-refactor.json --repo owner/repo
```

## `dn glance`

`glance` reports issue and commit velocity for the repository tied to your
checkout's `origin` remote (or `GITHUB_REPOSITORY` in CI). It uses the GitHub
API, not local git history. Run it from a clone whose default remote is
`github.com/owner/repo`.

```bash
dn glance
dn glance --days 14
dn glance --compact --no-urls
```

Each run compares the last **N** days (default 7) to the prior **N** days:
open and close rates, commit count, label groupings, recent items, and per-user
share. `--days` sets the window. `--compact` tightens spacing. `--no-urls`
drops issue and commit links from the report.

Use [`dn peek`](/dn/task-list-and-sync/#dn-peek) to rank what to work on next;
use `glance` for a recent activity snapshot.

## Milestone workflow

Typical milestone sequence:

```bash
dn meld --milestone 42
dn init stack 42
dn kickstart --milestone 42 --once
dn kickstart --publish pr --milestone 42 --complete
```

`meld --milestone` drafts a user-value description. `init stack` builds the
ranked queue ([`dn init stack`](#dn-init-stack)). `milestone create`, `list`, and
`publish` handle bulk plans ([`dn milestone`](#dn-milestone)). On kickstart,
`--once` drains one stack row; `--complete` drains the rest and requires
`--publish pr` or `--publish direct`.

## `dn release`

Tag and release notes on GitHub from the terminal. Pass `--repo` / `-R` when the
checkout is not the target repository.

```bash
dn release list
dn release view v1.2.3
dn release create v1.2.3 --title "Release" --notes-file notes.md
dn release edit v1.2.3 --draft
dn release delete v1.2.3
```

Run `dn release <subcommand> --help` for draft flags and asset options.

## `dn workflows`

Install, validate, dispatch, or run the canonical GitHub Actions workflows (not
this documentation site).

```bash
dn workflows list
dn workflows install
dn workflows update
dn workflows validate --json
dn workflows dispatch dn.kickstart_issue --repo owner/repo --json
dn workflows exec dn.init_stack
```

`install` and `update` sync templates from the `dn` release. `validate --json`
checks secrets and workflow shape. `dispatch` sends `repository_dispatch` events;
`exec` runs a workflow job locally on a runner. Payloads and `--wait` are in
[Headless use](/runners/headless-use/).

## `dn init stack`

Build a ranked kickstart queue from a GitHub milestone. Output lands in
`plans/{owner}_{repo}_{milestone}.stack.md` and `.stack.json`. Commit those
files if the team should share the queue.

```bash
dn init stack 42
dn init stack https://github.com/owner/repo/milestone/3
dn init stack 42 --refresh
```

`--refresh` updates an existing stack from GitHub. `dn kickstart --milestone 42`
takes the next unchecked row. For CI dispatch, see
[Headless use — Dispatch payloads](/runners/headless-use/#dispatch-payloads).

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
| `build`     | Install `.github/dn/config.json` and canonical workflow YAML files                          |
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
sign-in. Token order, `gh` integration, CI variables, and required scopes are
in [GitHub authentication](/dn/installation/#github-authentication).

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

Local Denoise task documents under `~/.dn/tasks/` (JSON), separate from the
kickstart issue queue in `~/.dn/todo.md`. Void task-sync and
`dn kickstart --denoise-task` use these files.

```bash
dn task list
dn task show <id|ref>
dn task upsert --file task.json
dn task delete <id>
dn task done
dn task sync status
```

See [The Void](/denoise/void/) and
[Landing — `dn task`](/dn/task-list-and-sync/#dn-task).

## `dn tidy` extras

[`dn tidy`](/dn/task-list-and-sync/#dn-tidy) refreshes `~/.dn/todo.md` from open
issues. These subcommands groom harness and config files:

```bash
dn tidy agent --check
dn tidy agent --fix
dn tidy config --json
dn tidy workflows --json
dn tidy context --json
dn tidy runner --json
dn tidy --all --with-backlog --json
```

`--check` and `--fix` on `tidy agent` validate OpenCode phase configs.
`--json` on config, workflows, context, and runner aids scripting.

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

File-based defaults: [Filesystem Context — Choose an agent](/dn/filesystem-context/#choose-an-agent).

### Context files (`--context-file`)

Extra prompt context for this run. Repeat for multiple paths. No env equivalent.

- **Flag:** `--context-file <path>` (repeatable)

### Unattended mode (`--unattended`)

Turn off interactive prompts. Also enabled in CI and when stdout is not a TTY.
Subcommands may still require `--yes` or `DN_YES=1`; that is not global.

- **Flag:** `--unattended`

[Headless use — Unattended output](/runners/headless-use/#unattended-output) covers CI color, trace, and publish defaults.

### Agent trace (`--trace`, `--no-trace`, `DN_AGENT_TRACE`)

Live agent harness output. Attended TTY defaults to `--no-trace`; CI defaults to `--trace`.

- **Flags:** `--trace`, `--no-trace`
- **Environment:** `DN_AGENT_TRACE=1` or `0`

### Color (`--color`, `--no-color`)

- **Flags:** `--no-color`, `--color`
- **Environment:** `NO_COLOR`, `FORCE_COLOR`, `TERM=dumb`

### Version

- **Flags:** `--version`, `-V`
