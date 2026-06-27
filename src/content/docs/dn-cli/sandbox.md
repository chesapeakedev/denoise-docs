---
title: Sandbox providers
description: Run dn kickstart and loop agent phases inside Docker or exe.dev while the host coordinates sync, lint, and VCS publish.
---

Sandbox providers control **where agent harness phases run** — plan, implement,
and merge — while `dn` on the host still orchestrates the workflow, syncs the
workspace, runs optional lint, and publishes branches or pull requests.

By default, agent phases run on the host (`sandbox.provider: none`). With
Docker or exe.dev, the harness executes inside an isolated environment; changes
flow back to your local checkout before VCS steps run on the host.

For command syntax, see [Orchestrate Agents](/dn-cli/workflows/). For CI and
headless defaults, see [Headless Use](/dn-cli/headless-use/).

## When to use a sandbox

Use a sandbox when you want agent execution separated from your host machine:

- **Docker** — bind-mount the repo into a container with a fixed tool chain
  (Deno, `dn`, opencode, git).
- **exe.dev** — provision an ephemeral VM with GitHub integration; workspace
  sync uses git push/pull through a temporary branch.

Host execution remains the default for local development and for GitHub Actions
(unless you explicitly configure otherwise).

## Configure `.github/dn/config.json`

Bump to `schema_version: "1.1"` and add a `sandbox` block. Configs without
`sandbox` behave as today — all phases run on the host.

```json
{
  "schema_version": "1.1",
  "agent": "opencode",
  "sandbox": {
    "provider": "docker",
    "workspace": "/workspace",
    "sync": {
      "mode": "bind",
      "exclude": [".git", "node_modules", ".sl"]
    },
    "docker": {
      "image": "ghcr.io/chesapeakedev/dn-kickstart:latest",
      "network": "none",
      "read_only_root": true,
      "mounts": [{ "source": ".", "target": "/workspace" }],
      "env_pass_through": ["OPENAI_API_KEY", "ANTHROPIC_API_KEY"]
    },
    "exe_dev": {
      "image": "exeuntu",
      "vm_name_prefix": "dn-kickstart",
      "ttl": "4h",
      "integrations": ["github"]
    }
  }
}
```

| Field | Purpose |
| ----- | ------- |
| `sandbox.provider` | `none` (default) \| `docker` \| `exe.dev` |
| `sandbox.workspace` | Path inside the sandbox where the repo is mounted |
| `sandbox.sync.mode` | `bind` for Docker; `git_clone` for exe.dev |
| `sandbox.sync.exclude` | Pathspec excludes during exe.dev git sync |
| `sandbox.docker.*` | Image, mounts, network, env pass-through |
| `sandbox.exe_dev.*` | VM image, name prefix, TTL, integrations |

Never put secrets in `config.json`. Provider credentials are environment
variables:

| Provider | Credential |
| -------- | ---------- |
| Docker | Local Docker socket (no token) |
| exe.dev | `EXE_TOKEN` from `ssh exe.dev ssh-key generate-api-key` |

## CLI overrides

```bash
dn kickstart --sandbox docker https://github.com/owner/repo/issues/1
dn loop --sandbox docker plans/foo.plan.md
dn --sandbox exe.dev kickstart 42
```

- `--sandbox` with no value reads `sandbox.provider` from config (errors if
  missing).
- `--sandbox none` forces host execution even when config says `docker`.
- `DN_SANDBOX_PROVIDER=docker` overrides config when `--sandbox` is absent.
- `DN_SANDBOX_DRY_RUN=1` logs planned `docker run` / exe.dev API calls without
  mutating infrastructure.

## How execution is split

The host `dn` process:

1. Reads sandbox config from `.github/dn/config.json` (and CLI/env overrides).
2. Provisions infrastructure (Docker container or exe.dev VM).
3. Syncs the workspace in (`syncIn` — no-op for Docker bind mounts; git temp
   branch for exe.dev).
4. Runs agent harness phases **inside** the sandbox via `SandboxRunner.exec`.
5. Syncs changes out (`syncOut`).
6. Tears down the container or VM (always, including on failure).
7. Runs VCS publish / PR creation on the **host** (sandbox may not have your
   git credentials).

Inner agent runs receive `DN_SANDBOX_PROVIDER=none` and `DN_IN_SANDBOX=1` so
sandbox provisioning does not recurse.

Combined prompts and run temp files live under `.dn/tmp/` inside the workspace
when a sandbox is active, so bind mounts and git clone both see them. Host paths
are translated to sandbox workspace paths before agent and lint commands run
inside the container or VM.

## Supported subcommands

| Subcommand | Sandbox support |
| ---------- | --------------- |
| `kickstart` | Full plan + implement inside sandbox |
| `loop` | Implement phase inside sandbox |
| `meld` | Plan phase inside sandbox |
| `prep` | Host only in v1 |

Lint runs inside the sandbox when possible (`deno task check`); failures are
non-blocking, same as host runs. `--publish pr` still opens a PR from the host
after sync-out.

## Docker

Default image: `ghcr.io/chesapeakedev/dn-kickstart:latest`. Build from the
[dn](https://github.com/chesapeakedev/dn) repository:

```bash
docker build -t ghcr.io/chesapeakedev/dn-kickstart:latest -f docker/Dockerfile .
```

The image should include Deno, `dn`, your agent harness (opencode by default),
and git.

Default `sandbox.docker.network` is `none`. Set `bridge` when the agent needs
outbound API access from the container. Pass API keys through
`sandbox.docker.env_pass_through` so they are forwarded into the container
environment.

Docker bind-mounts the repo at provision time — no explicit copy step. Edits
inside the container appear in your host checkout immediately.

Validate prerequisites:

```bash
dn workflows validate
```

Warns when `sandbox.provider` is `docker` but Docker is missing or the daemon
is not running.

## exe.dev

- Control plane: `POST https://exe.dev/exec` with `Authorization: Bearer $EXE_TOKEN`.
- HTTPS API timeout is 30s; long-running commands use SSH exec via the API.
- Workspace sync: the host pushes the current branch to a temporary branch on
  `origin`, the VM clones that branch, and after agent phases the VM pushes back.
  Requires a configured `origin` remote and the `github` integration on the VM.
- `sandbox.sync.exclude` applies git pathspec excludes during sync.
- Optional LLM gateway inside VMs: `http://169.254.169.254/gateway/`.

Teardown runs in a `finally` block so VMs are destroyed even when a phase fails.

## CI behavior

In GitHub Actions, sandbox defaults to `none` — runners are already ephemeral
VMs. You can opt into `sandbox.provider: docker` when a Docker socket is
available (advanced). exe.dev from GHA requires the `EXE_TOKEN` repository
secret.

See [Headless Use](/dn-cli/headless-use/) for workflow installation and publish
modes; sandbox config lives in the same `.github/dn/config.json` file as the
agent setting.
