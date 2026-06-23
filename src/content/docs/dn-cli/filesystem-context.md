---
title: Filesystem Context
description: Repo files dn creates or maintains for planning, implementation, and agent handoff — plans/, AGENTS.md, and milestone stacks.
---

`dn` writes durable files in your repository so agents and humans can plan,
implement, and resume work. Most of this context lives at the workspace root or
in standard agent config paths.

| Path                                                               | Typical source                         | Role                                                                                                                                          |
| ------------------------------------------------------------------ | -------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| `plans/*.plan.md`                                                  | `kickstart`, `prep`, `loop`, `meld`    | Issue context, plan, acceptance criteria                                                                                                      |
| `plans/*.continuation.plan.md`                                     | `kickstart`, `loop`                    | Remaining work after a partial run                                                                                                            |
| `plans/*.stack.md`, `plans/*.stack.json`                           | `dn init stack`                        | Prioritized milestone task queue                                                                                                              |
| `AGENTS.md`                                                        | `dn init agents`; kickstart may update | Project conventions and commands for agents                                                                                                   |
| `.agents/skills/dn/`, `.claude/skills/dn/`, `.cursor/rules/dn.mdc` | `dn init agents --skill`               | Agent-native dn workflow instructions — see [Installation — Install dn as an agent skill](/dn-cli/installation/#install-dn-as-an-agent-skill) |

For `dn init stack` command detail, see
[Working with Github](/dn-cli/github-commands/). For `dn init agents` and agent
skill setup, see
[Installation — Install dn as an agent skill](/dn-cli/installation/#install-dn-as-an-agent-skill).

# The plans/ directory

Kickstart, prep, and loop manage plan files in a `plans/` directory at the
workspace root. The directory is created automatically. Plan files track
implementation progress and give later `dn loop` runs or human reviewers a
durable handoff.

### Plan file locations

All kickstart and prep runs write named `plans/[name].plan.md` files:

- **Kickstart and prep** — `dn` prompts for a plan name before the plan phase.
  In `--publish pr` or `--publish direct` mode, it suggests the branch or
  bookmark name. Pass `--saved-plan <name>` on kickstart or `--plan-name <name>`
  on prep to skip the prompt.
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
- `dn prep --plan-name <name>` — non-interactive prep
- `dn loop` — uses `--plan-file`, `PLAN`, or the newest `*.plan.md` in `plans/`

In publish modes, the suggested name usually matches the generated branch or
bookmark name.

### Plan merging

For named plans, a later run can merge a continuation file back into the main
plan and remove the continuation file after a successful merge. This keeps one
plan file with the full history and remaining work.

Plan files are kept after local (`--publish none`) runs for review and handoff.
In `--publish pr` or `--publish direct` mode, `dn` deletes the plan file when
all acceptance criteria are complete. Archive landed work with `dn archive` when
you no longer need the plan in the tree.

## AGENTS.md

`dn init agents` adds or updates `AGENTS.md` at the repository root with dn
workflow instructions — how to run prep, loop, kickstart, and related commands
in this repo.

```bash
dn init agents
```

After a successful kickstart run, dn may also refresh `AGENTS.md` with detected
project type, build commands, and lint/test commands while preserving custom
sections you added manually. See [Artifacts & Cursor](/dn-cli/artifacts-cursor/)
for what kickstart writes at the end of a run.

Use `dn meld` to merge notes or issue context into `AGENTS.md`:

```bash
dn meld research.md ops-notes.md --target AGENTS.md
```

Use `dn context` to inspect which `AGENTS.md` (or `AGENTS.override.md`) files
apply to a path — see [Experimental](/dn-cli/task-list-and-sync/). To install
native skill or rule files for your agent harness, see
[Installation — Install dn as an agent skill](/dn-cli/installation/#install-dn-as-an-agent-skill).

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
`dn kickstart --milestone 42` to work through unchecked items; use `--complete`
to drain the queue without prompts between tasks. See
[Kickstart & Looping](/dn-cli/overview/#milestone-queues).
