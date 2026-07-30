---
title: Self-hosted runners
description: Run installed dn GitHub Actions workflows on your own Linux runner when hosted runners are too slow or too constrained.
---

Self-hosted runners run GitHub Actions jobs on hardware you control. Use them
when `dn` kickstart workflows need more CPU, memory, disk, or wall-clock time
than GitHub-hosted runners provide, or when jobs must reach private network
resources.

Complete
[Headless Use — Configure a repository](/dn/headless-use/#configure-a-repository)
first. This page covers the runner host only — workflow templates, secrets, and
harness setup stay the same as on GitHub-hosted runners.

## When a self-hosted runner helps

- Long kickstart runs that time out on `ubuntu-latest`
- Larger repositories or agent contexts that need more RAM or disk
- Access to private package registries, GPUs, or internal services
- Predictable cost for frequent scheduled or milestone-queue jobs

Canonical `dn` workflows use
[`chesapeakedev/dn-action`](https://github.com/chesapeakedev/dn-action). The
action installs `dn` and the agent from `.github/dn/config.json` on each run.
You do not pre-install Deno, OpenCode, Cursor, Claude Code, or Codex on the host
unless you run `dn` outside Actions.

## Host requirements

Use a **supported Linux LTS** release. GitHub removed the hosted `ubuntu-20.04`
image in April 2025; do not build new runner hosts on Ubuntu 20.04.

| Requirement | Recommendation                                                                                                                                                                                                                                                              |
| ----------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| OS          | **Ubuntu 22.04 LTS** or **Ubuntu 24.04 LTS** (other current Linux distros work if they meet GitHub's [runner requirements](https://docs.github.com/en/actions/hosting-your-own-runners/managing-self-hosted-runners/about-self-hosted-runners#supported-operating-systems)) |
| CPU / RAM   | 2+ vCPU, **8 GB RAM** minimum for agent-backed kickstart; more for large repos                                                                                                                                                                                              |
| Disk        | 20+ GB free for workspaces, agent caches, and runner updates                                                                                                                                                                                                                |
| Network     | Outbound HTTPS to `github.com`, `api.github.com`, and your agent provider endpoints                                                                                                                                                                                         |
| Access      | `sudo` for service install; dedicated unprivileged user for the runner process                                                                                                                                                                                              |

Install base packages before registering the runner:

```bash
sudo apt-get update
sudo apt-get install -y curl git jq tar
```

Add other build tools (`make`, language runtimes) only if your repository's
kickstart jobs need them and `dn-action` does not install them.

## Install the runner

Follow GitHub's current instructions for your repository or organization:
**Settings → Actions → Runners → New self-hosted runner**. GitHub shows the
download URL and registration token for your platform.

### 1. Create a dedicated user (recommended)

```bash
sudo useradd -m -s /bin/bash github-runner
sudo su - github-runner
```

### 2. Download and extract the runner

Use the **latest** `actions-runner` release for `linux-x64` from
[actions/runner releases](https://github.com/actions/runner/releases).
Substitute the version in the URL GitHub prints in the UI — do not rely on a
pinned version in this doc.

```bash
mkdir -p ~/actions-runner && cd ~/actions-runner
# Example — replace VERSION with the release GitHub shows for your registration
curl -o actions-runner.tar.gz -L https://github.com/actions/runner/releases/download/vVERSION/actions-runner-linux-x64-VERSION.tar.gz
tar xzf ./actions-runner.tar.gz
```

### 3. Configure and register

```bash
# Repository-level
./config.sh --url https://github.com/OWNER/REPO --token RUNNER_TOKEN

# Organization-level
./config.sh --url https://github.com/ORG --token RUNNER_TOKEN
```

Use labels that match your workflows, for example:

```bash
./config.sh --url https://github.com/OWNER/REPO --token RUNNER_TOKEN \
  --labels self-hosted,linux,x64,dn
```

### 4. Install as a service

```bash
sudo ./svc.sh install github-runner
sudo ./svc.sh start
sudo ./svc.sh status
```

The service user must own `~/actions-runner` and be able to write job workspaces
under `~/actions-runner/_work`.

## Point workflows at the runner

Installed `dn` workflow files default to `runs-on: ubuntu-latest`. On a
self-hosted machine, override `runs-on` to your runner labels.

Example for `dn-kickstart-issue.yml`:

```yaml
jobs:
  kickstart:
    runs-on: [self-hosted, linux, dn]
    permissions:
      contents: write
      pull-requests: write
      issues: write
```

Use the same label set on `dn-prep-issue-plan.yml`, `dn-init-stack.yml`, and
`dn-daily-kickstart.yml` when those jobs should use this host.

Repository secrets (`GITHUB_TOKEN` injection, agent API keys) and dispatch
payloads are unchanged. See [Headless Use](/dn/headless-use/) for setup and
validation.

## Environment and PATH

Canonical workflows pass secrets through the job environment. You normally do
**not** set `GITHUB_TOKEN` in the runner user's shell profile.

If a job needs extra tools on `PATH`, extend the systemd unit for the runner
service (path varies by registration name):

```ini
# /etc/systemd/system/actions.runner.OWNER-REPO.HOSTNAME.service.d/override.conf
[Service]
Environment="PATH=/usr/local/bin:/usr/bin:/bin"
```

Then reload and restart:

```bash
sudo systemctl daemon-reload
sudo systemctl restart 'actions.runner.*'
```

## Security

- Run the listener as a dedicated user with minimal `sudo` rights.
- Restrict outbound network access to what GitHub and your agent provider need.
- Rotate registration tokens; remove unused runners from **Settings → Actions →
  Runners**.
- Keep the runner package updated (auto-update is on by default).
- Treat `_work` directories as untrusted — jobs execute arbitrary code from PRs
  when workflows run on `pull_request` events.

## Maintenance

**Runner updates:** The listener auto-updates by default. For manual updates,
stop the service, download the latest release, extract over the install
directory, and start again.

**Logs:**

```bash
sudo journalctl -u 'actions.runner.*' -f
ls ~/actions-runner/_diag/Runner_*.log
```

**Workspace cleanup** (example weekly cron as `github-runner`):

```bash
0 2 * * 0 find ~/actions-runner/_work -mindepth 1 -maxdepth 1 -type d -mtime +7 -exec rm -rf {} +
```

## Troubleshooting

| Symptom                      | Check                                                                                  |
| ---------------------------- | -------------------------------------------------------------------------------------- |
| Runner offline in GitHub     | `sudo ./svc.sh status`; outbound HTTPS to `github.com`; registration token not expired |
| Job queued but never starts  | Workflow `runs-on` labels match runner labels; runner not busy on another job          |
| `dn` or agent missing in job | Workflow uses `chesapeakedev/dn-action`; see job logs for install phase failures       |
| Out of disk                  | Clean `_work`; increase volume size; shorten workspace retention                       |
| Slow or timed-out kickstart  | More RAM/CPU; compare with the timeout variable in the selected harness cookbook       |

For workflow configuration errors, start with `dn workflows validate --json` on
your workstation and
[Headless Use — Troubleshooting](/dn/headless-use/#troubleshooting).

## References

- [GitHub Actions: About self-hosted runners](https://docs.github.com/en/actions/hosting-your-own-runners/about-self-hosted-runners)
- [GitHub Actions: Adding self-hosted runners](https://docs.github.com/en/actions/hosting-your-own-runners/managing-self-hosted-runners/adding-self-hosted-runners)
- [Headless Use](/dn/headless-use/) — `dn` workflow installation and dispatch
- [Scheduled Workflows](/dn/scheduled-workflows/) — daily milestone kickstart
