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
| exe.dev | `EXE_TOKEN` — see [Set up exe.dev](#set-up-exedev) below |

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

[exe.dev](https://exe.dev/) provides ephemeral Linux VMs over SSH. `dn` uses the
[HTTPS API](https://exe.dev/docs/https-api) to provision a VM, run agent phases
via SSH exec, sync your repo with git, and destroy the VM when the workflow
finishes (including on failure).

Use exe.dev when you want isolation without running Docker locally, or when you
want VM integrations (GitHub clone/push without tokens on the VM, optional
[LLM gateway](https://exe.dev/docs/integrations-llm)) instead of forwarding
API keys from your laptop.

### Set up exe.dev

Work through these steps once per machine (or once per CI environment). The
[exe.dev CLI reference](https://exe.dev/docs/all) lists every command mentioned
here.

#### 1. Connect over SSH

`dn` talks to exe.dev the same way you would from a terminal: SSH for account
setup, then HTTPS `POST https://exe.dev/exec` for automation.

Verify SSH access:

```bash
ssh exe.dev whoami
```

If this is your first time, follow exe.dev’s SSH onboarding when prompted. Add a
dedicated key if you prefer not to use your default `~/.ssh/id_ed25519` — see
[ssh-key](https://exe.dev/docs/cli-ssh-key):

```bash
ssh-keygen -t ed25519 -C "dn-sandbox" -f ~/.ssh/id_exe
cat ~/.ssh/id_exe.pub | ssh exe.dev ssh-key add
```

#### 2. Link GitHub (required for private repos)

exe.dev workspace sync clones and pushes through git. The VM needs permission to
read and write your repository on `origin`.

For private repositories, connect GitHub to exe.dev and attach a repo
integration to kickstart VMs:

1. Link your GitHub account from the exe.dev Integrations page — see
   [GitHub integration](https://exe.dev/docs/integrations-github).
2. Create a per-repo integration (replace names with yours):

   ```bash
   ssh exe.dev integrations setup github --verify
   ssh exe.dev integrations add github \
     --name myrepo \
     --repository owner/repo \
     --attach auto:all
   ```

   See [integrations CLI](https://exe.dev/docs/cli-integrations) and
   [What are Integrations?](https://exe.dev/docs/integrations) for attachment
   options (`vm:`, `tag:`, `auto:all`).

3. In `.github/dn/config.json`, list integration names under
   `sandbox.exe_dev.integrations` (for example `["github"]` when you rely on a
   GitHub integration named `github`, or `["myrepo"]` for the name above). `dn`
   passes these to the [`new`](https://exe.dev/docs/cli-new) command when
   provisioning the VM.

Public repos may work without a GitHub integration if the VM can reach a public
`origin` URL, but private repos and reliable `git push` from the VM require the
integration.

#### 3. Create `EXE_TOKEN` for `dn`

`dn` authenticates to the exe.dev control plane with a bearer token in the
`EXE_TOKEN` environment variable (never commit this token).

Generate one with exe.dev (recommended):

```bash
ssh exe.dev ssh-key generate-api-key --label=dn-sandbox --exp=90d
export EXE_TOKEN='exe1....'   # paste the token from the command output
```

Details, permissions, and local signing alternatives:
[HTTPS API](https://exe.dev/docs/https-api),
[ssh-key generate-api-key](https://exe.dev/docs/cli-ssh-key#ssh-key-generate-api-key).

For GitHub Actions, store the token as a repository secret:

```bash
gh secret set EXE_TOKEN
```

#### 4. Configure `dn` for exe.dev

Set `sandbox.provider` to `exe.dev` and `sandbox.sync.mode` to `git_clone` (exe.dev
does not bind-mount the host filesystem). Example:

```json
{
  "schema_version": "1.1",
  "agent": "opencode",
  "sandbox": {
    "provider": "exe.dev",
    "workspace": "/home/exedev/workspace",
    "sync": {
      "mode": "git_clone",
      "exclude": [".git", "node_modules", ".sl"]
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

| `exe_dev` field | Meaning |
| --------------- | ------- |
| `image` | VM image passed to [`new --image`](https://exe.dev/docs/cli-new) (`exeuntu` is the default exe.dev dev image) |
| `vm_name_prefix` | Prefix for auto-generated VM names (`dn-kickstart-<suffix>`) |
| `ttl` | VM lifetime safety net (exe.dev duration string, e.g. `4h`) |
| `integrations` | Integration names to attach at provision time |

On the **host**, your checkout must have a configured `origin` remote and you
must be able to push a temporary branch — `dn` uses host credentials for the
initial push, then the VM clones that branch.

Validate before running:

```bash
dn workflows validate
```

Warns when `sandbox.provider` is `exe.dev` but `EXE_TOKEN` is unset.

#### 5. Run kickstart or loop inside the VM

```bash
dn kickstart --sandbox exe.dev https://github.com/owner/repo/issues/42
dn loop --sandbox exe.dev plans/my-feature.plan.md
```

Or set `"provider": "exe.dev"` in config and use `--sandbox` with no value.

### What happens during a run

1. **Provision** — `dn` calls `POST https://exe.dev/exec` with
   `Authorization: Bearer $EXE_TOKEN` and a [`new`](https://exe.dev/docs/cli-new)
   command (image, TTL, integrations).
2. **Sync in** — On the host, `dn` commits/stages the workspace (respecting
   `sandbox.sync.exclude`), pushes a temporary branch to `origin`, and has the VM
   `git clone` that branch into `sandbox.workspace`.
3. **Agent phases** — Plan, implement, and merge run **inside** the VM via SSH
   exec. Inner runs set `DN_IN_SANDBOX=1` so sandbox provisioning does not
   recurse.
4. **Sync out** — The VM commits and pushes to the same temporary branch; the
   host fetches, merges, and deletes the branch.
5. **Teardown** — `dn` destroys the VM even when a phase fails.
6. **Publish on host** — Branch creation, commits, and PR opening still run on
   the host after sync-out (your local git credentials).

The HTTPS API has a **30 second timeout** for control-plane calls; long agent
runs use SSH exec through the API body, not a single long POST.

### Optional: LLM access inside the VM

New exe.dev accounts include a default [`llm`](https://exe.dev/docs/integrations-llm)
integration attached to all VMs (`auto:all`), exposing provider models without
storing API keys on the VM. Agent harnesses can target
`https://llm.int.exe.xyz/v1` (or the metadata gateway at
`http://169.254.169.254/gateway/`).

Configure provider sources in the exe.dev Integrations UI or via
[`integrations add llm`](https://exe.dev/docs/integrations-llm#configure-over-ssh).

### exe.dev troubleshooting

| Symptom | Likely cause |
| ------- | ------------ |
| `EXE_TOKEN is required` | Export `EXE_TOKEN` or set the GitHub Actions secret |
| `git push` / clone fails on VM | GitHub integration missing or not attached — see [GitHub integration](https://exe.dev/docs/integrations-github) |
| Host sync fails | No `origin` remote, or host cannot push to GitHub |
| Control-plane timeout | Rare for normal kickstart; see [HTTPS API](https://exe.dev/docs/https-api) |

Use `DN_SANDBOX_DRY_RUN=1` to log planned `new` / `destroy` / sync commands
without creating infrastructure.

## CI behavior

In GitHub Actions, sandbox defaults to `none` — runners are already ephemeral
VMs. You can opt into `sandbox.provider: docker` when a Docker socket is
available (advanced). exe.dev from GHA requires the `EXE_TOKEN` repository
secret.

See [Headless Use](/dn-cli/headless-use/) for workflow installation and publish
modes; sandbox config lives in the same `.github/dn/config.json` file as the
agent setting.
