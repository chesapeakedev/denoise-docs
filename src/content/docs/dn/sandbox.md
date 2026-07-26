---
title: Sandbox execution
description: Choose host, Docker, exe.dev, Cursor Cloud, or GitHub Actions execution and configure dn sandbox schema 1.1.
---

Sandbox providers control where local agent phases execute. Host execution is
the default; Docker provides a reproducible local container and exe.dev provides
a remote VM. Cursor Cloud and GitHub Actions are separate execution runtimes,
not `dn` sandbox providers.

On **hosted denoise**, kickstart runtimes are GitHub Actions, Cursor Cloud,
exe.dev, and paired device runners — not Docker and not the denoise application
host. See [Kickstart runtimes](/denoise/kickstart-runtimes/).

## Choose a runtime

| Runtime        | Best for                                          | Workspace behavior                   |
| -------------- | ------------------------------------------------- | ------------------------------------ |
| Host           | Trusted work with local tools and credentials     | Changes the current checkout         |
| Docker         | Reproducible local tools and reduced blast radius | Bind-mounts the checkout             |
| exe.dev        | Stronger remote isolation                         | Syncs through a temporary Git branch |
| Cursor Cloud   | Durable Cursor-managed execution                  | Works in a remote clone              |
| GitHub Actions | Repository automation and scheduled work          | Uses an ephemeral Actions checkout   |

## Configure schema 1.1

Add `sandbox` to `.github/dn/config.json`:

```json
{
  "schema_version": "1.1",
  "agent": "opencode",
  "sandbox": {
    "provider": "docker",
    "workspace": "/workspace",
    "sync": {
      "mode": "bind",
      "exclude": [".git", ".sl", "node_modules"]
    },
    "docker": {
      "image": "ghcr.io/chesapeakedev/dn:sha-abc123def456",
      "dockerfile": "Dockerfile.dn",
      "network": "bridge",
      "read_only_root": true,
      "mounts": [{ "source": ".", "target": "/workspace" }],
      "env_pass_through": ["OPENAI_API_KEY"]
    }
  }
}
```

`sandbox.docker.dockerfile` records the repo-relative source used to build the
configured image. It is declarative: `dn` does not build the image while
provisioning.

## Select and validate a provider

```bash
dn kickstart --sandbox docker 123
dn loop --sandbox docker plans/issue-123.plan.md
dn --sandbox exe.dev kickstart 123
DN_SANDBOX_PROVIDER=docker dn meld 123
DN_SANDBOX_DRY_RUN=1 dn kickstart --sandbox docker 123
dn workflows validate
```

`--sandbox none` forces host execution. `--sandbox` without a value reads the
configured provider. The environment override applies only when the CLI flag is
absent.

## Lifecycle and boundary

For each command, the host process provisions the runtime, syncs the workspace
in, runs agent and lint commands, syncs changes out, and tears the runtime down.
Combined prompts live under `.dn/tmp/` in the workspace. The inner process gets
`DN_IN_SANDBOX=1` and cannot recursively provision another sandbox.

Docker bind mounts expose the configured workspace and explicit mounts. Only
names listed in `env_pass_through` cross as environment variables. Never put
secret values in `config.json` or an image layer.

### Docker

Docker requires the CLI and a running daemon. The default network is `none`;
choose `bridge` only when the harness needs outbound agent or GitHub APIs.
Prefer a read-only root with a writable workspace, avoid mounting the Docker
socket or all of `~/.ssh`, and pin images by source tag or digest. See
[Filesystem context — Project base images](/dn/filesystem-context/#project-base-images)
for the image contract.

### exe.dev

Set an `EXE_TOKEN` with `new`, `ssh`, and `rm` command scopes. The VM also needs
GitHub SSH access through the `github` integration. Host Git credentials push
the current work to a temporary remote branch; the VM clones it and pushes
changes back. Configure sync exclusions for generated or sensitive paths.

```bash
ssh exe.dev ssh-key generate-api-key \
  --label=dn-kickstart \
  --cmds=new,ssh,rm \
  --exp=90d
export EXE_TOKEN='exe1....'
```

Set a bounded TTL. If provisioning or sync fails, inspect the remote and token
scopes, remove any abandoned VM, confirm the temporary branch is reachable, and
retry after the workspace is clean.
