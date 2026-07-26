---
title: Working with GitHub
description: Manage GitHub issues, milestones, and project activity from the dn CLI.
---

These commands use the GitHub API from your local machine. Authenticate with
`gh auth login`, `dn auth`, or `GITHUB_TOKEN` before running them — see
[Installation — GitHub authentication](/dn/installation/#github-authentication)
and [GitHub Token Setup](/dn/github-token-setup/) when you need token
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
[Headless Use — Dispatch payloads](/dn/headless-use/#dispatch-payloads).

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
dn issue edit 123 --title "New title"
dn issue edit 123 --add-label bug
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
without an issue ref, such as `list` and `create`.

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
[Experimental — `dn peek`](/dn/task-list-and-sync/#dn-peek).
