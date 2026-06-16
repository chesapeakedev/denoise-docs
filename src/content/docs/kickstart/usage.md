---
title: Kickstart usage
description: Default mode, AWP mode, local markdown input, agent selection, and environment variables.
---

This page covers the `kickstart` workflow in detail. For adjacent commands such
as `prep`, `loop`, `meld`, `fixup`, and `archive`, see
[Workflows](/dn-cli/workflows/).

## Default mode

Apply changes to your workspace without creating branches or PRs:

```bash
dn kickstart https://github.com/owner/repo/issues/123
dn kickstart 123

# Use a local markdown spec as context
dn kickstart docs/spec.md

# Pick an agent harness
dn --agent cursor kickstart 123
dn --agent claude kickstart 123
dn --agent codex kickstart 123
```

## AWP mode

Create the branch/bookmark, commit, push, and PR automatically:

```bash
dn kickstart --awp https://github.com/owner/repo/issues/123
dn --agent opencode kickstart --awp 123
```

AWP mode is same-repository only. For issues from another repository, use
default mode with `--allow-cross-repo`:

```bash
dn kickstart --allow-cross-repo https://github.com/private-org/specs/issues/123
```

## Plan and loop separately

```bash
# Plan from an issue or local markdown file
dn prep 123
dn prep docs/spec.md

# Continue implementation from the plan
dn loop --plan-file plans/my-feature.plan.md

# Let loop auto-discover the latest plan
dn loop
```

## Milestone queues

```bash
# Generate a prioritized milestone stack
dn init stack 42

# Run the first unchecked task
dn kickstart --milestone 42

# Run every remaining unchecked stack item
dn kickstart --milestone 42 --complete
```

## Common flags

- `--awp` - Enable branch/bookmark, commit, push, and PR creation.
- `--allow-cross-repo` - Allow planning or implementation from an issue in
  another repo, without AWP mode.
- `--saved-plan <name>` - Use `plans/<name>.plan.md` without prompting for a
  name.
- `--milestone <url-or-number>` - Use
  `plans/{owner}_{repo}_{milestone}.stack.md` as the task queue.
- `--complete` - With `--milestone`, run all unchecked stack tasks without queue
  prompts.
- `--workspace-root <path>` - Run against a specific workspace root.
- `--agent <name>` - Select `opencode`, `cursor`, `claude`, or `codex`. Legacy
  aliases such as `--cursor`, `--claude`, and `--codex` are still supported.

## Environment variables

| Variable                                                       | Description                                                                          |
| -------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| `GITHUB_TOKEN`                                                 | GitHub API token for CI/scripts. Prefer `gh auth login` or `dn auth` for normal use. |
| `WORKSPACE_ROOT`                                               | Workspace root. Defaults to the current working directory.                           |
| `ISSUE`                                                        | Issue URL, issue number, or markdown path when no positional argument is provided.   |
| `PLAN`                                                         | Plan file path for `dn loop`.                                                        |
| `SAVE_CTX`                                                     | Set to `1` to keep debug files on success.                                           |
| `CURSOR_ENABLED`, `CLAUDE_ENABLED`, `CODEX_ENABLED`            | Legacy environment toggles for agent selection.                                      |
| `OPENCODE_TIMEOUT_MS`, `CLAUDE_TIMEOUT_MS`, `CODEX_TIMEOUT_MS` | Agent phase timeouts.                                                                |

See [Non-interactive Use](/dn-cli/output-and-environment/) for unattended mode
mode and color flags.
