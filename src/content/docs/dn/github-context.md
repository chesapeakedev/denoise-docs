---
title: GitHub context
description: Understand the GitHub objects dn reads and updates, then find the commands and flags for each workflow.
---

`dn` uses GitHub issues as work requests, milestones as grouped queues, and pull
requests as review boundaries. For the same issue operations from `dn task`, use
`dn task --github …` or keep using `dn issue …`. Denoise Pro cloud milestones
and tasks use `dn task --denoise` and `dn milestone --denoise` instead—see
[Workspace CRUD](/dn/workspace/). Local implementation and VCS publishing still
happen in the current checkout.

## Authentication and repository selection

Authenticate with `gh auth login`, `dn auth`, or set `GITHUB_TOKEN`. See
[GitHub authentication](/dn/installation/#github-authentication). Numeric issue
and milestone references resolve against the current repository unless you pass
`--repo owner/repo`; full GitHub URLs identify their repository directly. Read
[Filesystem context](/dn/filesystem-context/) for workspace roots, inherited
`AGENTS.md`, and agent context files.

## Issues and relationships

Issues can be listed, created, edited, closed, reopened, and commented on. The
relationship commands manage blockers, sub-issues, and duplicates.

```bash
dn issue list --repo owner/repo --state open --label bug
dn issue show 123 --no-comments
dn issue create --title "Bug" --body-file report.md --milestone 42
dn issue edit 123 --add-label bug
dn issue close 123 --reason not_planned
dn issue relationship add blocked-by 123 456
```

Use `--repo` to select a repository, `--body-file` or `--body-stdin` for issue
text, and `--json` for machine-readable output. Every subcommand supports
`--help`. See [`dn issue` options](#dn-issue).

## Milestones and queues

GitHub milestones group issues. `dn init stack` creates a ranked local queue
from a milestone, and `dn kickstart --milestone` consumes its unchecked items.
`dn milestone` creates milestones and publishes issue plans from JSON. `dn meld
--milestone` drafts a milestone description from its issues.

```bash
dn milestone create --title "Q1 work" --description-file milestone.md
dn milestone list --repo owner/repo --json
dn init stack 42 --refresh
dn kickstart --milestone 42 --once
```

Use `--refresh` to update an existing stack. Kickstart's `--once` runs one item;
`--complete` processes all remaining items and requires a publish mode. See
[`dn milestone`](#dn-milestone),
[`dn init stack`](#dn-init-stack), and
[`dn kickstart`](/dn/command-reference/#dn-kickstart).

## Pull requests and review

`dn read` fetches a review brief without changing files. `dn fixup` plans and
implements responses to review feedback in the current checkout. Kickstart can
open a pull request with `--publish pr` or its `--awp` alias.

```bash
dn read 123 --json
dn fixup https://github.com/owner/repo/pull/123
dn kickstart --publish pr 123
```

See [`dn read`](#dn-read),
[`dn fixup`](#dn-fixup), and the
[Kickstart guide](/kickstart/).

## Releases, activity, and Actions

`dn release` manages GitHub releases. `dn glance` summarizes issue and commit
activity, while `dn peek` ranks open issues using a fixed heuristic. `dn
workflows` installs, validates, dispatches, or executes the canonical GitHub
Actions workflows.

```bash
dn release list --repo owner/repo
dn glance --days 14
dn peek --limit 5 --verbose
dn workflows dispatch dn.kickstart_issue --repo owner/repo --json
```

For dispatch payloads and automation setup, see [Headless use](/runners/headless-use/).
Command options: [`dn release`](#dn-release),
[`dn glance`](#dn-glance),
[`dn peek`](#dn-peek), and
[`dn workflows`](#dn-workflows).

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

Use [`dn peek`](#dn-peek) to rank what to work on next;
use `glance` for a recent activity snapshot.

## `dn peek`

Suggests next open issues with a fixed heuristic scoring model. In conversation,
this gives an agent a concrete way to propose what it should work on next:

```bash
dn peek
dn peek --limit 5
dn peek --fetch 200
dn peek --verbose --no-urls
```

`peek` uses GitHub GraphQL issue paging only. It does not invoke the LLM-based
kickstart readiness scorer.

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
