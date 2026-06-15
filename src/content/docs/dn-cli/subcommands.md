---
title: Command overview
description: A map of dn commands and where to find detailed usage.
---

`dn` now covers more than kickstart. Use this page as a command map, then jump
to the focused reference page for the workflow you need.

## Command families

| Need                               | Commands                                                 | Reference                                         |
| ---------------------------------- | -------------------------------------------------------- | ------------------------------------------------- |
| Plan or implement work             | `kickstart`, `prep`, `loop`, `meld`, `fixup`, `archive`  | [Workflows](/dn-cli/workflows/)                   |
| Prepare a repository               | `init workflows`, `init agents`, `init stack`, `context` | [Repository setup](/dn-cli/repository-setup/)     |
| Run GitHub automation              | `workflows`, `issue`, `glance`, `peek`                   | [GitHub automation](/dn-cli/github-automation/)   |
| Maintain local queues and branches | `todo`, `tidy`, `sync`                                   | [Task list and sync](/dn-cli/task-list-and-sync/) |
| Sign in                            | `auth`                                                   | [Authentication](/dn-cli/authentication/)         |

## Global flags

You can pass global output flags after any subcommand:

- `--unattended` or `--ci` - Force non-interactive, CI-friendly output.
- `--no-color` - Disable ANSI colors.
- `--color` - Enable colors even when stdout is not a TTY.

In CI, `dn` automatically enables unattended mode and sets `NO_COLOR` when it is
not already set. See [Output and environment](/dn-cli/output-and-environment/)
for the full behavior.

## Common argument formats

Several workflow commands accept flexible issue or source arguments:

- Full GitHub issue URL: `https://github.com/owner/repo/issues/123`
- Issue number in the current repository: `123`
- Local markdown file path: `docs/spec.md` or `plans/feature.md`

When a markdown path is given, `dn` uses the file as local context and does not
fetch an issue from GitHub.

## First commands

```bash
# Authenticate GitHub-backed commands
gh auth login

# Plan and implement an issue locally
dn kickstart 123

# Split planning and implementation
dn prep 123
dn loop --plan-file plans/my-feature.plan.md

# Install canonical GitHub Actions workflows
dn init workflows --agent opencode
dn workflows validate --json

# Refresh the local prioritized task list
dn tidy
```

Run `dn <command> --help` for command-specific options.
