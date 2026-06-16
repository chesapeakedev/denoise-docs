---
title: Experimental
description: Experimental dn commands for context inspection, issue suggestions, task queues, and Sapling sync.
---

These commands are experimental. They may change or be removed in future `dn`
releases.

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

Prerequisites are Sapling (`sl`), `make`, and Deno. We are working on reducing
these dependencies and adding Git support.

```bash
dn sync
dn sync --workspace-root /path/to/checkout
```

`dn auth` configures GitHub API access, but Sapling push still uses the
repository remote credentials: HTTPS credential helper, `gh auth` HTTPS, or SSH.
