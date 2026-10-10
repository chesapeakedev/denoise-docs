---
title: Sandbox execution
description: Isolate local CLI agent phases with Docker or host execution. Denoise Kickstart picks a runner, not a sandbox provider.
---

Sandbox settings control how a **local** `dn` process isolates agent phases on
the machine where you already have a checkout. Host execution is the default.
Docker bind-mounts that checkout into a container from
[dn-images](https://github.com/chesapeakedev/dn-images).

This is **not** how denoise chooses where Kickstart runs. Denoise assigns jobs
to a [runner](/runners/overview/) (device, GitHub Actions, or exe.dev).
See [Kickstart runtimes](/runners/kickstart-runtimes/).

CLI `dn --sandbox exe.dev` still git-syncs from a laptop checkout into an
exe.dev VM. Denoise exe.dev jobs do **not** use that path: they boot a dn-images
VM, clone inside it, and run `dn kickstart` there.

## Choose local isolation

| Mode          | Best for                                          | Workspace behavior                   |
| ------------- | ------------------------------------------------- | ------------------------------------ |
| Host (`none`) | Trusted work with local tools and credentials     | Changes the current checkout         |
| Docker        | Reproducible local tools and reduced blast radius | Bind-mounts the checkout             |
| exe.dev (CLI) | Stronger remote isolation from a local checkout   | Syncs through a temporary Git branch |

## Configure schema 1.1 and `dn.json` 2.0

Prefer a root `dn.json` with `schema_version: "2.0"` for team sandbox policy.
Legacy `.github/dn/config.json` (schema `1.1`) remains supported when `dn.json`
is absent, and the local CLI also merges personal defaults from
`~/.dn/config.json` (GitHub Actions never does).

Add `sandbox` to `dn.json` (or to `.github/dn/config.json` on schema `1.1`):

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
dn until run --sandbox docker .github/dn/gambit.json
dn ensure lint --sandbox docker
dn --sandbox exe.dev kickstart 123
DN_SANDBOX_PROVIDER=docker dn meld 123
DN_SANDBOX_DRY_RUN=1 dn kickstart --sandbox docker 123
dn workflows validate
```

`--sandbox none` forces host execution. `--sandbox` without a value reads the
configured provider. The environment override applies only when the CLI flag is
absent. Sandbox execution covers agent workflows: `kickstart`, `loop`, `meld`,
`until`, and `ensure`.

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
