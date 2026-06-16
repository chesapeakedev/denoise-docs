---
title: Subcommands
description: A map of dn commands and where to find detailed usage.
---

`dn` now covers more than kickstart. Use this page as a command map, then jump
to the focused reference page for the workflow you need.

## Command families

| Need                       | Commands                                                | Reference                                             |
| -------------------------- | ------------------------------------------------------- | ----------------------------------------------------- |
| Orchestrate Agents         | `kickstart`, `prep`, `loop`, `meld`, `fixup`, `archive` | [Orchestrate Agents](/dn-cli/workflows/)              |
| Working with Github        | `init agents`, `init stack`, `issue`, `glance`          | [Working with Github](/dn-cli/github-commands/)       |
| GitHub Actions Integration | `init workflows`, `workflows`                           | [GitHub Actions Integration](/dn-cli/github-actions/) |
| Experimental               | `context`, `peek`, `todo`, `tidy`, `sync`               | [Experimental](/dn-cli/task-list-and-sync/)           |

## Global flags

You can pass global output flags after any subcommand:

- `--unattended` or `--ci` - Force non-interactive, CI-friendly output.
- `--no-color` - Disable ANSI colors.
- `--color` - Enable colors even when stdout is not a TTY.

In CI, `dn` automatically enables unattended mode and sets `NO_COLOR` when it is
not already set. See [Non-interactive Use](/dn-cli/output-and-environment/) for
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
