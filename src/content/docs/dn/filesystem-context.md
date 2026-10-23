---
title: Filesystem Context
description: Repository files, dn.json policy, and base images that give dn durable context for planning, implementation, and agent handoff.
---

`dn` uses repository files and project base images to give agents durable,
reproducible context. Most teams meet **`plans/`** first — kickstart and meld
create plan files you can read and edit. **`dn.json`** comes next when you want
the same lint, test, sync, and sandbox rules for every agent run in the repo.

| Path                                                               | Typical source                         | Role                                                                                                                                      |
| ------------------------------------------------------------------ | -------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `plans/*.plan.md`                                                  | `kickstart`, `meld`, `loop`            | Issue context, plan, acceptance criteria                                                                                                  |
| `plans/*.continuation.plan.md`                                     | `kickstart`, `loop`                    | Remaining work after a partial run                                                                                                        |
| `plans/*.description.md`                                           | `dn meld --milestone`                  | User-value synthesis of a milestone                                                                                                       |
| `plans/*.stack.md`, `plans/*.stack.json`                           | `dn init stack`                        | Prioritized milestone task queue                                                                                                          |
| `dn.json`                                                          | You or `dn init wizard`                | Repo-wide agent, quality recipes, sync preflight, sandbox policy                                                                          |
| `AGENTS.md`                                                        | `dn init agents`; kickstart may update | Project conventions and commands for agents                                                                                               |
| `.agents/skills/dn/`, `.claude/skills/dn/`, `.cursor/skills/dn/`   | `dn init agents --skill`               | Agent-native dn workflow instructions — see [Installation — Install dn as an agent skill](/dn/installation/#install-dn-as-an-agent-skill) |

For `dn init stack` command detail, see
[Command reference — `dn init stack`](/dn/command-reference/#dn-init-stack). For `dn init agents` and agent
skill setup, see
[Installation — Install dn as an agent skill](/dn/installation/#install-dn-as-an-agent-skill).

# The plans/ directory

kickstart, meld, and loop manage plan files in a `plans/` directory at the
workspace root. The directory is created automatically. Plan files track
implementation progress and give later `dn loop` runs or human reviewers a
durable handoff.

### Plan file locations

All kickstart and meld runs write named `plans/[name].plan.md` files:

- **kickstart and meld** — `dn` prompts for a plan name before the plan phase.
  In `--publish pr` or `--publish direct` mode, it suggests the branch or
  bookmark name. Pass `--saved-plan <name>` on kickstart or `--plan-name <name>`
  on meld to skip the prompt.
- **Loop** — Implements an existing plan. Pass `--plan-file` or `PLAN`, or let
  `dn loop` pick the most recently modified `*.plan.md` in `plans/`.
- **Milestone mode** — Reads queue state from
  `plans/{owner}_{repo}_{milestone}.stack.md`; each task still produces a normal
  plan file.

### Plan file structure

Plan files contain the issue or markdown context, implementation plan, code
pointers, notes, and checklist-style acceptance criteria. The acceptance
criteria are the durable progress signal: completed items are marked with `[x]`,
remaining items stay `[ ]`.

### Plan continuation

If the selected plan file already exists, kickstart can continue from it when
`--publish none` (the default). The planning phase reads the existing content so
the agent can update, correct, or extend the plan while preserving progress.
Publish modes (`--publish pr` or `--publish direct`) always start from a fresh
named plan tied to the branch workflow.

After implementation, kickstart or loop parses acceptance criteria. If work
remains, they generate `plans/[name].continuation.plan.md` with the plan path,
progress summary, remaining items, and continuation instructions.

### Plan naming

Every plan file is `plans/[name].plan.md`. There is no default `.last.plan.md`
path — `dn` always resolves a name through a prompt or an explicit flag:

- `dn kickstart --saved-plan <name>` — non-interactive kickstart
- `dn meld --plan-name <name>` — non-interactive planning
- `dn loop` — uses `--plan-file`, `PLAN`, or the newest `*.plan.md` in `plans/`

In publish modes, the suggested name usually matches the generated branch or
bookmark name.

### Plan merging

For named plans, a later run can merge a continuation file back into the main
plan and remove the continuation file after a successful merge. This keeps one
plan file with the full history and remaining work.

Plan files are kept after local (`--publish none`) runs for review and handoff.
In `--publish pr` or `--publish direct` mode, `dn` deletes the plan file when
all acceptance criteria are complete. Close local work into commits with
`dn land`; it removes the completed plan on success.

## `dn.json`

`dn.json` at the repository root is the **team contract** for how `dn` runs in
that checkout. It does not replace plan files — plans hold *what* to build;
`dn.json` holds *how* to verify and publish work consistently.

`dn` walks upward from the workspace root to find `dn.json`. Commit it so
kickstart, loop, land, sync, and ensure behave the same for every contributor
and runner. Personal overrides can live in `~/.dn/config.json`; GitHub Actions
workflows use `.github/dn/config.json` when no root `dn.json` exists. Prefer
`schema_version: "2.0"` on `dn.json` for agent and sandbox policy — see
[Command reference — Choose an agent](/dn/command-reference/#choose-an-agent)
and [Sandbox execution](/dn/sandbox/#configure-schema-11-and-dnjson-20).

### What to put in `dn.json` first

| Block | Used by | Purpose |
| ----- | ------- | ------- |
| `ensure.<name>` | `dn ensure`, kickstart, loop (after implement) | Named quality recipes — frozen `argv` arrays, no shell |
| `sync.preflight` | `dn sync` | Commands that must pass before rebase and trunk publish |
| `sandbox` | `kickstart`, `loop`, `meld`, `until`, `ensure` with `--sandbox` | Docker or host isolation policy |
| `agent` (schema `2.0`) | Default harness when `--agent` is omitted | Same idea as `.github/dn/config.json` for local runs |

Start with **`ensure`** once you know which commands gate your repo (often lint
and tests). Add **`sync.preflight`** when engineers use `dn sync` to land on
trunk. Add **`sandbox`** when you need reproducible toolchains in Docker — see
[Project base images](#project-base-images) and [Sandbox execution](/dn/sandbox/).

Example minimal file:

```json
{
  "schema_version": "2.0",
  "agent": "opencode",
  "ensure": {
    "lint": {
      "argv": ["make", "lint"],
      "intent": "Format and lint the repository"
    },
    "tests": {
      "argv": ["make", "tests"],
      "intent": "Run unit tests"
    }
  },
  "sync": {
    "preflight": [["make", "lint"], ["make", "tests"]]
  }
}
```

Run `dn ensure` with no arguments to list recipe names defined in the file. See
[`dn ensure`](/dn/command-reference/#dn-ensure) and
[`dn sync`](/dn/command-reference/#dn-sync) (and
[Landing — `dn sync`](/dn/task-list-and-sync/#dn-sync) for Git/Sapling behavior).

Kickstart and loop invoke `dn ensure lint` after implementation when that recipe
exists. They do not replace your CI merge gate — they give agents a shared local
bar before handoff.

Use `dn init wizard --project` for a guided first `dn.json`, or copy patterns
from a repo that already ships one.

## AGENTS.md

`dn init agents` adds or updates `AGENTS.md` at the repository root with dn
workflow instructions — how to run meld, loop, kickstart, and related commands
in this repo.

```bash
dn init agents
```

After a successful kickstart run, dn may also refresh `AGENTS.md` with detected
project type, build commands, and lint/test commands while preserving custom
sections you added manually. See [Artifacts & Cursor](/dn/artifacts-cursor/) for
what kickstart writes at the end of a run.

Use `dn meld` to merge notes or issue context into `AGENTS.md`:

```bash
dn meld research.md ops-notes.md --target AGENTS.md
```

`--target` also accepts other Markdown paths (`README.md`, `CONTRIBUTING.md`,
`plans/*.plan.md`) and GitHub specifiers such as `github:comment:120` for the
checked-out repo.

### `dn context`

Inspects the inherited `AGENTS.md` chain for a file or directory:

```bash
dn context check cli/main.ts
dn context check cli/main.ts --max-bytes 65536
dn context check cli/main.ts --json
dn context check cli/main.ts --claude-tokens
```

The command walks from global Codex context through the repository path,
preferring `AGENTS.override.md` over `AGENTS.md` in each directory, then reports
the full byte size and the subset that fits inside the configured byte budget.

`--claude-tokens` requires `ANTHROPIC_API_KEY` and estimates token usage for the
included context.

To install native skill or rule files for your agent harness, see
[Installation — Install dn as an agent skill](/dn/installation/#install-dn-as-an-agent-skill).

## Milestone stack files

`dn init stack` fetches a GitHub milestone, scores its issues for kickstart
readiness, and writes a prioritized queue to `plans/`:

```bash
dn init stack 42
```

This produces:

- `plans/{owner}_{repo}_{milestone}.stack.md` — human-readable task list with
  checkboxes and agent instructions
- `plans/{owner}_{repo}_{milestone}.stack.json` — machine-readable queue state

Commit both files when you want the queue tracked in version control. Run
`dn kickstart --milestone 42` to work through unchecked items; use
`--publish pr --complete` to drain the queue without prompts between tasks (each
item is published before the next). See
[Completing GitHub Issues](/dn/completing-github-issues/#milestone-queues).

## Project base images

A project base image is a reproducible environment for `dn` Docker sandbox runs.
Use a golden image when agents need a stable language toolchain or
version-control setup beyond the canonical images.

### Install the base-image skill

```bash
dn init agents --skill base-image --agent opencode
```

Replace `opencode` with the repository's harness. The installed skill guides an
agent through image customization and safe pinning.

### Image contract

The image must include Deno 2.6.3 or newer, `dn`, Git, Bash, and exactly one
supported harness: OpenCode, Cursor, Claude Code, Codex, or Copilot.

```dockerfile
FROM denoland/deno:debian-2.6.3

USER root
RUN apt-get update \
  && apt-get install -y --no-install-recommends bash git ca-certificates \
  && rm -rf /var/lib/apt/lists/*

# Install a pinned dn release and one pinned agent harness here.
WORKDIR /workspace
ENTRYPOINT ["sleep", "infinity"]
```

Build and publish the image before using it. `dn` pulls `sandbox.docker.image`;
it never builds `sandbox.docker.dockerfile` during provisioning.

```json
{
  "schema_version": "1.1",
  "agent": "opencode",
  "sandbox": {
    "provider": "docker",
    "docker": {
      "image": "ghcr.io/owner/project@sha256:...",
      "dockerfile": "Dockerfile.dn",
      "network": "none",
      "read_only_root": true,
      "env_pass_through": ["OPENAI_API_KEY"]
    }
  }
}
```

### Operate the image

- Pin the base image by digest and pin Deno, `dn`, harness, and project
  toolchain versions.
- Publish a new immutable tag or digest for every golden-image update, validate
  it, then update repository config.
- Pass short-lived credentials at runtime by environment name. Never use `ARG`,
  `ENV`, copied credential files, or image layers for secrets.
- Keep networking disabled unless the harness needs outbound APIs.
- Prefer `read_only_root: true` with a writable workspace mount.
- Use a non-root final user when the repository mount remains writable.
- Do not mount the host Docker socket or an entire SSH directory.

Canonical images and their release workflow live in
[`chesapeakedev/dn-images`](https://github.com/chesapeakedev/dn-images) and are
published as `ghcr.io/chesapeakedev/dn:<harness>`. Production consumers should
pin a `:sha-*` tag or digest, not a moving harness tag.
