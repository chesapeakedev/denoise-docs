---
title: Installation
description: Install dn, authenticate with GitHub, run your first commands, and find the right reference for each command family.
---

This page explains how to install the CLI, authenticate with GitHub, and get
started running `dn` commands.

# Install dn

Install using the installation script:

```bash
curl -fsSL https://raw.githubusercontent.com/chesapeakedev/dn/main/scripts/install.sh | sh
```

To customize the install directory or pin a version:

```bash
curl -fsSL \
  https://raw.githubusercontent.com/chesapeakedev/dn/main/scripts/install.sh \
  | sh -s -- --install-dir /usr/local/bin --version v0.0.52
```

Or install with Homebrew:

```bash
brew install chesapeakedev/dn/dn
```

## Download a pre-built binary

If you prefer to avoid installation scripts, pre-built binaries are on the
[latest `dn` release](https://github.com/chesapeakedev/dn/releases/latest).
Download the binary for your platform and place it in your `PATH`:

Example for macOS (Apple Silicon):

```bash
curl -L -o dn https://github.com/chesapeakedev/dn/releases/latest/download/dn-macos-arm64
chmod +x dn
sudo mv dn /usr/local/bin/dn
```

On macOS, release binaries are signed and notarized. If Gatekeeper still flags a
binary, right-click it in Finder and choose **Open**, use **System Settings →
Privacy & Security → Open Anyway**, or run
`xattr -d com.apple.quarantine $(which dn)`. Binaries built from source with
`make install` are not blocked.

Confirm the installed version and command list:

```bash
dn --version
dn
```

# GitHub authentication

`dn` needs a GitHub token for commands that access the GitHub API (`kickstart`,
`meld`, `glance`, `peek`, `fixup`, `read`, `workflows`, `milestone`, `runner`,
and `issue` with issue URLs).

## Token resolution order

`dn` checks for a token in this order and uses the first one found:

1. **`GITHUB_TOKEN` environment variable** (or legacy `DANGEROUS_GITHUB_TOKEN`)
2. **GitHub CLI** — if `gh` is installed and authenticated, `dn` shells out to
   `gh auth token`

For interactive use casese, install the [GitHub CLI](https://cli.github.com/)
and authenticate:

```bash
gh auth login
```

No environment variable or configuration needed. `dn` detects `gh`
automatically.

For CI, scripts, and automation, set `GITHUB_TOKEN`:

```bash
export GITHUB_TOKEN=ghp_...
```

A fine-grained Personal Access Token (PAT) is recommended. Grant only the scopes
your workflows require:

| Scope                                     | Needed for                                           |
| ----------------------------------------- | ---------------------------------------------------- |
| `repo` (or fine-grained `contents: read`) | Reading issues and repo metadata                     |
| `issues: write`                           | `dn issue create/edit/close/reopen/comment`          |
| `pull_requests: write`                    | `--publish pr` kickstart (creating branches and PRs) |

For step-by-step PAT creation, see
[GitHub Token Setup](/runners/github-token-setup/).

### GitHub Actions

In GitHub Actions, `secrets.GITHUB_TOKEN` is automatically available. Pass it as
an environment variable:

```yaml
env:
  GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

Set `permissions` on each workflow job to match what that template does. Installed
canonical files from `dn init workflows` already include the right block — you
only need to edit it when you fork a workflow or tighten org defaults.

| Installed workflow | Typical `permissions` |
| ------------------ | --------------------- |
| `dn-kickstart-issue.yml`, `dn-init-stack.yml`, `dn-daily-kickstart.yml` | `contents: write`, `pull-requests: write`, `issues: write` (`dn-kickstart-issue.yml` also sets `id-token: write` for the action) |
| `dn-prep-issue-plan.yml` (`dn.meld_issue_plan`) | `contents: read`, `issues: write` only — meld plans from issues and does not open PRs in this job |

Kickstart-style jobs need all three write scopes because they read issues, push
branches (`contents`), and open or update pull requests. Plan-only meld does not
need `pull-requests: write` or `contents: write`.

Example for kickstart-style automation:

```yaml
permissions:
  contents: write
  pull-requests: write
  issues: write
```

The PAT table above applies to **scripts and local CI** where you supply your
own token: grant only what those commands use. In **GitHub Actions**, the job
uses `GITHUB_TOKEN` scoped by each workflow's `permissions` block, not your PAT
scopes.

Pick a harness and repository default in
[Command reference — Choose an agent](/dn/command-reference/#choose-an-agent).

### Install dn as an agent skill

After you pick an agent harness, install the `dn` skill so your agent can
discover and run `dn` workflows without you pasting instructions into every
prompt:

```bash
dn init agents --skill --agent codex
dn init agents --skill --agent claude
dn init agents --skill --agent cursor
dn init agents --skill --agent opencode
```

Pass `--scope user` to install under your home directory instead of the current
repository. Use `--force` to overwrite managed files `dn` already installed.

Repo-scope installs write:

- `codex`, `opencode`: `.agents/skills/dn/SKILL.md` and
  `.agents/skills/dn/agents/openai.yaml`
- `claude`: `.claude/skills/dn/SKILL.md`
- `cursor`: `.cursor/skills/dn/SKILL.md`

User-scope installs write the same content under `~/.agents/` or `~/.claude/`.
For per-repo `AGENTS.md` updates without the skill files, run `dn init agents`
without `--skill` — see [Filesystem Context](/dn/filesystem-context/#agentsmd).
