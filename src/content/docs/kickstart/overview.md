---
title: Kickstart Usage
description: How dn kickstart plans and implements GitHub issues or local markdown specs.
---

Kickstart is one `dn` workflow for turning a GitHub issue, issue number,
milestone queue item, or local markdown spec into a plan and implementation. For
the broader command map, start with [Command overview](/dn-cli/subcommands/) or
[Workflows](/dn-cli/workflows/).

## CLI usage

```bash
# Full workflow
dn kickstart https://github.com/owner/repo/issues/123
dn kickstart 123

# Local markdown context, with no GitHub fetch and no AWP mode
dn kickstart docs/spec.md

# Plan phase only
dn prep 123

# Loop phase only; auto-discovers the latest plan if omitted
dn loop --plan-file plans/<name>.plan.md

# Select an agent harness
dn --agent codex kickstart 123
dn --agent claude prep 123
```

Issue arguments can be full GitHub issue URLs, issue numbers for the current
repository, or local markdown files. Cross-repository issue URLs require
`--allow-cross-repo`; AWP mode remains same-repository because branch, commit,
and PR operations need the current workspace repository.

## Two modes

- **Default mode** - Applies changes locally. You handle commits and PRs
  manually. It uses `plans/.last.plan.md` unless a specific plan is selected
  with `--saved-plan <name>` or a plan name is requested during continuation.
- **AWP mode** - Creates a branch/bookmark, commits changes, pushes, and opens a
  PR. It uses named plan files in `plans/[name].plan.md` and requires Git or
  Sapling.

## How it works

1. Resolve issue context from GitHub or load a local markdown file.
2. Select the plan path and run the plan phase.
3. Validate the plan file.
4. Run the implement phase.
5. Check acceptance-criteria completion.
6. Generate continuation prompts if work remains.
7. Run linting and generate agent artifacts where applicable.
8. In AWP mode, commit, push, and create a PR.

Kickstart can also work from milestone stack files created by `dn init stack`:

```bash
dn init stack 42
dn kickstart --milestone 42
dn kickstart --milestone 42 --complete
```

`--complete` runs remaining unchecked stack tasks without prompting between
queue items. Plan naming and agent prompts can still occur unless separately
configured.

## Dependencies

- [Deno](https://deno.com/) and an agent harness in `PATH`
- GitHub authentication through `gh`, `dn auth`, or `GITHUB_TOKEN`
- Git or Sapling for AWP mode

See [Workflows](/dn-cli/workflows/) for the command-family reference.
