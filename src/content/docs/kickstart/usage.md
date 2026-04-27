---
title: Usage
description: Default vs AWP mode, CLI flags, and environment variables.
---

## Default mode (local changes only)

Apply changes to your workspace without creating branches or PRs:

```bash
dn kickstart https://github.com/owner/repo/issues/123

# Issue number shorthand (infers URL from current repo remote)
dn kickstart 123

# With Cursor IDE integration
dn kickstart --cursor https://github.com/owner/repo/issues/123
```

## AWP mode (full workflow)

Complete end-to-end workflow with branch creation, commit, and PR:

```bash
dn kickstart --awp https://github.com/owner/repo/issues/123
```

## Running from another directory

```bash
WORKSPACE_ROOT=/path/to/workspace dn kickstart <issue_url_or_number>
```

## CLI flags

- **`--awp`** — Enable AWP mode (branches, commits, PR creation). Without it,
  kickstart runs in default mode (local changes only).
- **`--cursor`** / **`-c`** — Enable Cursor IDE integration (creates
  `.cursor/rules/kickstart.mdc`). Can also set `CURSOR_ENABLED=1`.
- **`--save-plan`** — Force saving a named plan (prompts for name). Creates
  `plans/[name].plan.md`.
- **`--saved-plan <name>`** — Use a specific plan name (no prompt).
  Creates/updates `plans/<name>.plan.md`. Useful for CI.

## Positional argument

- **`<issue_url_or_number>`** — Full GitHub issue URL (e.g.
  `https://github.com/owner/repo/issues/123`) or an issue number for the current
  repository (e.g. `123` or `#123`). Kickstart infers the URL from the workspace
  remote when you pass a number. If the URL points to a different repository
  than the current workspace, kickstart exits with an error. Optional if `ISSUE`
  env var is set.

## Environment variables

| Variable              | Description                                                                                                                                               |
| --------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `GITHUB_TOKEN`        | GitHub PAT for API auth (CI/scripts). Prefer `gh auth login` or `dn auth` for normal use. See [Authentication](/dn-cli/authentication/).                  |
| `WORKSPACE_ROOT`      | Workspace root (where config files live). Default: current working directory.                                                                             |
| `ISSUE`               | GitHub issue URL or issue number (alternative to positional argument).                                                                                    |
| `SAVE_CTX`            | Set to `"1"` to keep debug files in the temp directory on success. Default: cleaned on success, kept on failure. Debug files: `/tmp/geo-opencode-{pid}/`. |
| `CURSOR_ENABLED`      | Set to `"1"` to enable Cursor integration (same as `--cursor`).                                                                                           |
| `OPENCODE_TIMEOUT_MS` | Timeout for opencode in ms. Default: 600000 (10 min). Example: `3600000` for 1 hour.                                                                      |

## AWP mode prompts

When running in AWP mode you will be prompted:

1. **Use current branch/bookmark or create new?** — `u` / `use` / `y` / `yes` to
   use current; `n` or Enter to create new (default).
2. **Branch/bookmark name** (if creating new) — Suggested:
   `kickstart/issue_{number}_{slugified-title}`. The `kickstart/` prefix
   identifies auto-generated branches. Enter to accept or type a custom name.
3. **Plan name** — Suggested to match branch name. Plan file:
   `plans/[name].plan.md`.
