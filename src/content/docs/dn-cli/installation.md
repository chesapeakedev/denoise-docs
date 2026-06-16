---
title: Installation
description: Install dn with the installation script or build from source.
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

## Before your first command

Most workflows also need:

- [GitHub CLI (`gh`)](https://cli.github.com/) or another supported auth path —
  see [Authentication](/dn-cli/authentication/)
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
[Authentication](/dn-cli/authentication/), and
[Output & Environment](/dn-cli/output-and-environment/).
