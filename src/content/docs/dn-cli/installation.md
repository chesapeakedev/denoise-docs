---
title: Installation
description: Install dn and prepare Deno, GitHub auth, agents, and VCS support.
---

`dn` is the CLI technology behind denoise automation. Use it directly when
setting up a repository, running kickstart locally, dispatching GitHub Actions
workflows, or managing issues from the terminal.

## Prerequisites

- [Deno](https://deno.com/) installed and available in `PATH`
- An agent harness for agent-backed workflows: [opencode](https://opencode.dev/)
  by default, or Cursor, Claude Code, or Codex CLI
- GitHub authentication through `gh auth login`, `dn auth`, or `GITHUB_TOKEN`
- Git or [Sapling](https://sapling-scm.com/) for workflows that create branches,
  commits, or PRs

## Install dn

From a checkout of the `dn` repository, compile and install the binary:

```bash
make configure
```

You can also run the CLI directly from the repository while developing:

```bash
deno run --allow-all cli/main.ts <subcommand> [options]
```

Run `dn` with no arguments to see the current command list.

## First commands

```bash
# Authenticate for GitHub-backed commands
gh auth login

# Plan and implement an issue locally
dn kickstart https://github.com/owner/repo/issues/123

# Plan first, then implement after review
dn prep 123
dn loop --plan-file plans/my-feature.plan.md

# Install canonical workflows for denoise and other integrators
dn init workflows --agent opencode
dn workflows validate --json
```

Agent-backed commands default to OpenCode. Select another harness with the
global flag:

```bash
dn --agent codex prep 123
dn --agent claude kickstart --awp 123
```

For detailed command behavior, see [Command overview](/dn-cli/subcommands/),
[Authentication](/dn-cli/authentication/), and
[Output and environment](/dn-cli/output-and-environment/).
