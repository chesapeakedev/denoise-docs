---
title: Task List & Sync
description: Maintain dn's local task queue and keep Sapling work synchronized.
---

These commands help decide what to work on next and keep local work aligned with
the repository trunk.

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
after work lands to keep the list and GitHub in sync.

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

After a successful run, `dn` can mark the item done and continue to the next
one.

## `dn sync`

Runs the Sapling-aligned sync-with-trunk flow from the repository workflow
notes:

1. Runs `make lint` at the Sapling repo root.
2. Runs `sl pull --rebase -d main`.
3. Runs `sl restack` when stranded draft descendants exist.
4. Runs `sl push --to main` when drafts exist on the main-line stack.

Prerequisites are Sapling (`sl`), `make`, and Deno.

```bash
dn sync
dn sync --workspace-root /path/to/checkout
```

`dn auth` configures GitHub API access, but Sapling push still uses the
repository remote credentials: HTTPS credential helper, `gh auth` HTTPS, or SSH.
