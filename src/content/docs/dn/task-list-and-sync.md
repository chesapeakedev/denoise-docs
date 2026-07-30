---
title: Experimental
description: Try early dn commands that streamline triage, agent context, task queues, and repo sync across the SDLC.
---

`dn` targets the parts of the software development lifecycle that still slow
teams down after you adopt agents: choosing the next issue, loading the right
context, keeping GitHub and a local queue aligned, and landing work without
extra ceremony. The commands here are **experiments** toward that goal — smaller
workflows you can use today alongside [kickstart](/dn/completing-github-issues/)
and [Command reference](/dn/workflows/).

| Focus            | Commands               | What it changes                                                              |
| ---------------- | ---------------------- | ---------------------------------------------------------------------------- |
| **Triage**       | `peek`, `tidy`, `todo` | Surfaces ranked next work and keeps a personal task list in sync with GitHub |
| **Context**      | `context`              | Shows which `AGENTS.md` files apply before an agent edits a path             |
| **Agent intake** | no-ticket `kickstart`  | Lets an agent pick from your queue when you run `dn kickstart` with no issue |
| **Repo hygiene** | `sync`                 | Rebases onto remote `main` and publishes local commits — Git or Sapling      |

Together they explore how agents can own more of the loop between "what should
we work on?" and "the change is on the branch" — without replacing the durable
plans, PRs, and handoffs documented elsewhere.

These commands are experimental. Behavior and flags may change or be removed in
future `dn` releases. Try them on real work and share what sticks; that feedback
decides what graduates into stable `dn` commands.

## `dn context`

Inspects the inherited `AGENTS.md` chain for a file or directory:

```bash
dn context check cli/main.ts
dn context check cli/main.ts --max-bytes 65536
dn context check cli/main.ts --json
dn context check cli/main.ts --claude-tokens
```

The command walks from global Codex context through the repository path,
preferring `AGENTS.override.md` over `AGENTS.md` in each directory, then reports
the full byte size and the subset that fits inside the configured byte budget.

`--claude-tokens` requires `ANTHROPIC_API_KEY` and estimates token usage for the
included context.

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

## `dn todo`

Manages the user-level task list at `~/.dn/todo.md`:

```bash
# Mark the first unchecked item done
dn todo done

# Mark a specific ref done
dn todo done 42
dn todo done https://github.com/owner/repo/issues/42
dn todo done plans/auth.plan.md
```

When the ref is a GitHub issue, `dn` closes the issue with a comment. Use this
after `dn land` (or after `--publish direct` when you want the issue closed) to
keep the list and GitHub in sync. Attended `dn kickstart` does not mark todo
items done on exit.

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

## No-ticket kickstart

If you run `dn kickstart` without an issue URL, issue number, or `ISSUE`, `dn`
reads the task list first. If unchecked items exist, it prompts once before
running the top item. If the list is empty, it can search the current repository
for open issues and plan files, score them, write the list, and suggest the
first item.

Attended kickstart exits after a successful run. It does not mark the queue item
done or ask to continue. Review the changes, run `dn land` when you are ready to
commit, then `dn todo done` to check the item off and close the GitHub issue if
applicable. For per-issue publish without a separate land step, use
`--publish pr` or `--publish direct`.

## `dn sync`

Rebases your checkout onto remote `main` and publishes local commits when you
are ahead. `dn` auto-detects **Sapling** or **Git** from the workspace:

- **Sapling** — when the repo root contains `.sl` metadata (plain Git checkouts
  with `sl` installed are not treated as Sapling)
- **Git** — otherwise, when `git rev-parse --show-toplevel` succeeds

Sapling takes precedence in dual-compatible repositories.

### What each run does

1. **`make lint`** at the repository root (skip with `--skip-lint`)
2. **Rebase onto remote `main`**
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
  `--skip-lint`)
- **Git** and/or **Sapling** on `PATH`, depending on the checkout type
- A configured remote that can fetch and push `main` (Git uses the tracked
  remote or `origin`; Sapling uses your existing `sl` remote config)

`dn auth` configures GitHub API access for other commands. **VCS push and fetch
use the credentials configured for your Git or Sapling remotes** — HTTPS
credential helper, `gh auth` HTTPS, or SSH.

```bash
dn sync
dn sync --workspace-root /path/to/checkout
dn sync --skip-lint   # skip make lint (used by make sync)
```
