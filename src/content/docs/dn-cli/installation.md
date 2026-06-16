---
title: Installation
description: Install dn, authenticate with GitHub, and run your first commands.
---

`dn` is the CLI technology behind denoise automation. Use it directly when
setting up a repository, running kickstart locally, dispatching GitHub Actions
workflows, or managing issues from the terminal.

## Install dn

Install using the installation script:

```bash
curl -fsSL https://raw.githubusercontent.com/chesapeakedev/dn/main/scripts/install.sh | sh
```

To customize the install directory or pin a version:

```bash
curl -fsSL https://raw.githubusercontent.com/chesapeakedev/dn/main/scripts/install.sh | sh -s -- --install-dir /usr/local/bin --version v0.1.0
```

See `scripts/install.sh --help` for all options.

### Download a pre-built binary

Pre-built binaries are on the
[latest `dn` release](https://github.com/chesapeakedev/dn/releases/latest).
Download the binary for your platform and place it in your `PATH`:

| Platform              | Binary               |
| --------------------- | -------------------- |
| macOS (Apple Silicon) | `dn-macos-arm64`     |
| macOS (Intel)         | `dn-macos-x64`       |
| Linux (x86_64)        | `dn-linux-x64`       |
| Linux (ARM64)         | `dn-linux-arm64`     |
| Windows (x64)         | `dn-windows-x64.exe` |

Example for macOS (Apple Silicon):

```bash
curl -L -o dn https://github.com/chesapeakedev/dn/releases/latest/download/dn-macos-arm64
chmod +x dn
sudo mv dn /usr/local/bin/dn
```

Replace `dn-macos-arm64` with the binary name for your platform.

On macOS, you may need to bypass Gatekeeper for unsigned release binaries —
right-click the binary in Finder and choose **Open**, use **System Settings →
Privacy & Security → Open Anyway**, or run
`xattr -d com.apple.quarantine $(which dn)`. Binaries built from source with
`make install` are not blocked.

Run `dn` with no arguments to see the current command list.

## Build from source

### Prerequisites

Building from a repository clone requires:

- [Deno](https://deno.com/) (>= 2.6.3) installed and available in `PATH`
- `make`

Clone, build, and install:

```bash
git clone https://github.com/chesapeakedev/dn.git
cd dn
make install
```

You can also run the CLI directly from the repository while developing:

```bash
deno run --allow-all cli/main.ts <subcommand> [options]
```

## GitHub authentication

`dn` needs a GitHub token for subcommands that access the GitHub API
(`kickstart`, `prep`, `glance`, `peek`, `fixup`, `issue`, `meld` with issue
URLs).

### Token resolution order

`dn` checks for a token in this order and uses the first one found:

1. **`GITHUB_TOKEN` environment variable** (or legacy `DANGEROUS_GITHUB_TOKEN`)
2. **GitHub CLI** — if `gh` is installed and authenticated, `dn` shells out to
   `gh auth token`
3. **Cached device-flow token** from `dn auth` (stored in `~/.config/dn/` on
   Unix-like systems or `%APPDATA%\dn` on Windows)

### Interactive: GitHub CLI (recommended)

Install the [GitHub CLI](https://cli.github.com/) and authenticate:

```bash
gh auth login
```

No environment variable or configuration needed — `dn` detects `gh`
automatically.

### Interactive: Browser device flow

Run `dn auth` to sign in via the browser:

```bash
dn auth
```

The token is cached locally so subsequent commands work without re-prompting.

**Prerequisite**: `DN_GITHUB_DEVICE_CLIENT_ID` (or `GITHUB_DEVICE_CLIENT_ID`)
must be set to your GitHub OAuth App's client ID. Create an OAuth App at
<https://github.com/settings/developers> and enable the Device flow.

### Non-interactive: environment variable

For CI, scripts, and automation, set `GITHUB_TOKEN`:

```bash
export GITHUB_TOKEN=ghp_...
```

A fine-grained Personal Access Token (PAT) is recommended. Grant only the scopes
your workflows require:

| Scope                                     | Needed for                                  |
| ----------------------------------------- | ------------------------------------------- |
| `repo` (or fine-grained `contents: read`) | Reading issues and repo metadata            |
| `issues: write`                           | `dn issue create/edit/close/reopen/comment` |
| `pull_requests: write`                    | AWP mode (creating branches and PRs)        |

For step-by-step PAT creation, see
[GitHub Token Setup](/dn-cli/github-token-setup/).

### GitHub Actions

In GitHub Actions, `secrets.GITHUB_TOKEN` is automatically available. Pass it as
an environment variable:

```yaml
env:
  GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

Ensure the workflow has the permissions it needs:

```yaml
permissions:
  contents: write
  pull-requests: write
  issues: write
```

`dn auth` is not suitable for CI — always use environment variables or injected
secrets.

### Troubleshooting

**"No GitHub token found"** — Run `gh auth login`, `dn auth`, or set
`GITHUB_TOKEN`.

**"Bad credentials" / 401** — The token may be expired or revoked. Re-run
`gh auth login` or generate a new PAT.

**"Resource not accessible by integration"** — The token lacks the required
scope. Check the scope table above and update your PAT or workflow permissions.

## Before your first command

Most workflows also need:

- Git or [Sapling](https://sapling-scm.com/) for commands that create branches,
  commits, or PRs
- An agent harness for agent-backed workflows: [opencode](https://opencode.dev/)
  by default, or Cursor, Claude Code, or Codex CLI

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

For detailed command behavior, see [Command Overview](/dn-cli/subcommands/),
[Basic Usage](/dn-cli/workflows/), and
[Output & Environment](/dn-cli/output-and-environment/).
