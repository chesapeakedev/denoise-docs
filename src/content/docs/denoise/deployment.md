---
title: Deployment
description: Deploy denoise locally with Docker or to a remote device.
---

The app can be deployed to a remote device (e.g., Raspberry Pi) using Docker.

## Local deployment

To build and run locally:

```bash
make docker_run
```

To rebuild and restart:

```bash
make docker_restart
```

## Remote deployment

The deployment system supports multiple developers deploying to the same
Tailscale device. The SSH host is auto-detected from your local username (e.g.
`mooch` → `mooch@baltimore`).

**Basic usage:**

```bash
# First-time setup: Generate SSH key and add to agent
make setup_ssh_agent
# (Add the displayed public key to your GitHub account)

# Deploy using auto-detected SSH host
make deploy
```

**Manual override:**

```bash
# Override SSH host
DEPLOY_HOST=user@hostname make deploy

# Override both host and path
DEPLOY_HOST=user@hostname DEPLOY_PATH=~/custom/path make deploy

# Or using the script directly
./scripts/deploy.sh user@hostname ~/p/cts/apps/todo
```

The deployment script will:

1. Auto-detect your username and map to the appropriate SSH host
2. SSH into the remote device with agent forwarding enabled (`ssh -A`)
3. Pull the latest changes from git (using your forwarded SSH key)
4. Stop any existing container
5. Build and start a new Docker container

**Note:** Deployment uses SSH agent forwarding with a project-local SSH key
(e.g. `.ssh/deploy_key`). Run `make setup_ssh_agent` on first use to generate
the key and add it to your SSH agent.
