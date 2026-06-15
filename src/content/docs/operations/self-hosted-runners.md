---
title: Self-hosted runners
description: Set up a self-hosted GitHub Actions runner on Ubuntu for kickstart workflows.
---

This document describes how to set up a self-hosted GitHub Actions runner on
Ubuntu Linux to run kickstart workflows.

## Overview

Self-hosted runners let you run GitHub Actions on your own infrastructure.
Useful for:

- Workflows that need specific hardware or software
- Reducing cost for compute-heavy workflows
- Controlling the execution environment
- Access to private resources

## Prerequisites

- Ubuntu Linux (20.04 LTS or later recommended)
- Root or sudo access
- Network access to GitHub
- At least 2GB RAM and 10GB disk

## Installation steps

### 1. Create runner user (recommended)

```bash
sudo useradd -m -s /bin/bash github-runner
sudo su - github-runner
```

### 2. Download and configure runner

```bash
mkdir actions-runner && cd actions-runner

# Check https://github.com/actions/runner/releases, then substitute the version below
curl -o actions-runner-linux-x64-2.311.0.tar.gz -L https://github.com/actions/runner/releases/download/v2.311.0/actions-runner-linux-x64-2.311.0.tar.gz

tar xzf ./actions-runner-linux-x64-2.311.0.tar.gz
```

### 3. Configure runner

```bash
# Repository-level
./config.sh --url https://github.com/OWNER/REPO --token RUNNER_TOKEN

# Organization-level
./config.sh --url https://github.com/OWNER --token RUNNER_TOKEN
```

Replace `OWNER`, `REPO`, and `RUNNER_TOKEN` (from GitHub: Settings → Actions →
Runners → New self-hosted runner).

### 4. Install runner service

```bash
sudo ./svc.sh install
sudo ./svc.sh start
sudo ./svc.sh status
```

### 5. Install required dependencies

Kickstart workflows need Deno, opencode (and/or Cursor CLI), and Git:

```bash
# Deno
curl -fsSL https://deno.land/install.sh | sh
echo 'export DENO_INSTALL="$HOME/.deno"' >> ~/.bashrc
echo 'export PATH="$DENO_INSTALL/bin:$PATH"' >> ~/.bashrc
source ~/.bashrc

# opencode (opencode workflow)
curl -fsSL https://opencode.dev/install | bash
echo 'export PATH="$HOME/.opencode/bin:$PATH"' >> ~/.bashrc

# Cursor CLI (Cursor workflow)
curl https://cursor.com/install -fsS | bash
echo 'export PATH="$HOME/.cursor/bin:$PATH"' >> ~/.bashrc

# Git
sudo apt-get update
sudo apt-get install -y git
source ~/.bashrc
```

### 6. Configure environment variables

Add to `~/.bashrc` or a `~/.env` file:

```bash
export GITHUB_TOKEN="your-token-here"  # Or use GitHub Actions secrets
```

For the systemd service, create an override (e.g.
`/etc/systemd/system/actions.runner.*.service.d/override.conf`):

```ini
[Service]
Environment="GITHUB_TOKEN=your-token-here"
Environment="PATH=/home/github-runner/.deno/bin:/home/github-runner/.opencode/bin:/home/github-runner/.cursor/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin"
```

Then:

```bash
sudo systemctl daemon-reload
sudo systemctl restart actions.runner.*.service
```

## Security

- **Network:** Restrict outbound HTTPS to `github.com` and `api.github.com`;
  consider VPN or isolated segment.
- **Access:** Use a dedicated user with minimal privileges; restrict runner
  directories; store tokens securely and rotate.
- **Runner:** Enable auto-updates; monitor logs; clean workspace directories
  regularly.

## Configuration

**Labels:** e.g. `./config.sh ... --labels self-hosted,linux,ubuntu`

**Workflow:** Use `runs-on: self-hosted` (or a specific label) in your job.

## Maintenance

**Update:** Runner can auto-update; or stop, download a new package, extract,
and start again.

**Monitor:** `sudo systemctl status actions.runner.*.service`; logs:
`sudo journalctl -u actions.runner.*.service -f` and
`~/actions-runner/_diag/Runner_*.log`.

**Cleanup:** e.g. cron:
`0 2 * * * find ~/actions-runner/_work -type d -mtime +7 -exec rm -rf {} +`

## Troubleshooting

- **Not connecting:** Check network (`curl https://github.com`), token,
  firewall, runner logs.
- **Dependencies not found:** Verify PATH and env vars; restart service; test
  `deno --version`, `opencode --version`.
- **Permission issues:** Check runner user permissions, ownership of
  `~/actions-runner`, writable workspace.

## References

- [GitHub Actions: About self-hosted runners](https://docs.github.com/en/actions/hosting-your-own-runners/about-self-hosted-runners)
- [GitHub Actions: Adding self-hosted runners](https://docs.github.com/en/actions/hosting-your-own-runners/managing-self-hosted-runners/adding-self-hosted-runners)
- [Deno Installation](https://deno.land/manual/getting_started/installation)
- [opencode Installation](https://opencode.dev/docs/installation)
- [Cursor CLI Installation](https://cursor.com/docs/cli/installation)
