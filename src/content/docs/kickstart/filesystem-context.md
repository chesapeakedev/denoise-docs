---
title: Filesystem Context
description: Repo files dn creates or maintains for planning, implementation, and agent handoff — plans/, AGENTS.md, skills, and milestone stacks.
---

`dn` writes durable files in your repository so agents and humans can plan,
implement, and resume work without starting from scratch each run. Most of this
context lives at the workspace root or in standard agent config paths.

| Path                                                               | Typical source                         | Role                                        |
| ------------------------------------------------------------------ | -------------------------------------- | ------------------------------------------- |
| `plans/*.plan.md`                                                  | `kickstart`, `prep`, `loop`, `meld`    | Issue context, plan, acceptance criteria    |
| `plans/*.continuation.plan.md`                                     | `kickstart`, `loop`                    | Remaining work after a partial run          |
| `plans/*.stack.md`, `plans/*.stack.json`                           | `dn init stack`                        | Prioritized milestone task queue            |
| `AGENTS.md`                                                        | `dn init agents`; kickstart may update | Project conventions and commands for agents |
| `.agents/skills/dn/`, `.claude/skills/dn/`, `.cursor/rules/dn.mdc` | `dn init agents --skill`               | Agent-native dn workflow instructions       |

For command-level detail on `init agents` and `init stack`, see
[Working with Github](/dn-cli/github-commands/).

## The plans/ directory

Kickstart, prep, and loop manage plan files in a `plans/` directory at the
workspace root. The directory is created automatically. Plan files track
implementation progress and give later `dn loop` runs or human reviewers a
durable handoff.

### Plan file locations

- **Default mode** — Uses `plans/.last.plan.md` unless you provide
  `--saved-plan <name>` or name an incomplete plan during continuation.
- **AWP mode** — Uses a named `plans/[name].plan.md`, usually matching the
  branch/bookmark name.
- **Milestone mode** — Reads queue state from
  `plans/{owner}_{repo}_{milestone}.stack.md`; each task still produces a normal
  plan file.

### Plan file structure

Plan files contain the issue or markdown context, implementation plan, code
pointers, notes, and checklist-style acceptance criteria. The acceptance
criteria are the durable progress signal: completed items are marked with `[x]`,
remaining items stay `[ ]`.

### Plan continuation

If the selected plan file already exists, kickstart can continue from it. The
planning phase reads the existing content so the agent can update, correct, or
extend the plan while preserving progress.

After implementation, kickstart or loop parses acceptance criteria. If work
remains, they generate `plans/[name].continuation.plan.md` with the plan path,
progress summary, remaining items, and continuation instructions.

### Plan naming

Default mode can start with `.last.plan.md` for local iteration. If incomplete
work needs to continue later, kickstart prompts for a durable plan name and
writes `plans/[name].plan.md` plus the continuation prompt. Use
`--saved-plan <name>` when the plan name must be non-interactive.

AWP mode and milestone-driven runs use named plans because the plan files are
part of the branch/PR workflow.

### Plan merging

For named plans, a later run can merge a continuation file back into the main
plan and remove the continuation file after a successful merge. This keeps one
plan file with the full history and remaining work.

Plan files are never auto-deleted. Keep them when they are useful for review or
archive them after the work lands with `dn archive`.

## AGENTS.md

`dn init agents` adds or updates `AGENTS.md` at the repository root with dn
workflow instructions — how to run prep, loop, kickstart, and related commands
in this repo.

```bash
dn init agents
```

After a successful kickstart run, dn may also refresh `AGENTS.md` with detected
project type, build commands, and lint/test commands while preserving custom
sections you added manually. See
[Artifacts & Cursor](/kickstart/artifacts-cursor/) for what kickstart writes at
the end of a run.

Use `dn meld` to merge notes or issue context into `AGENTS.md`:

```bash
dn meld research.md ops-notes.md --target AGENTS.md
```

Use `dn context` to inspect which `AGENTS.md` (or `AGENTS.override.md`) files
apply to a path — see [Experimental](/dn-cli/task-list-and-sync/).

## Agent skills and rules

Pass `--skill` to `dn init agents` to install native skill or rule files for a
selected agent harness:

```bash
dn init agents --skill --agent codex
dn init agents --skill --agent claude
dn init agents --skill --agent cursor
```

Repo-scope installs write:

- `codex`, `opencode`: `.agents/skills/dn/SKILL.md` and
  `.agents/skills/dn/agents/openai.yaml`
- `claude`: `.claude/skills/dn/SKILL.md`
- `cursor`: `.cursor/rules/dn.mdc`

User-scope installs write the same content under your home directory
(`~/.agents/`, `~/.claude/`). Managed files are idempotent; existing unmanaged
files are left untouched unless you pass `--force`.

These files teach the agent how to invoke `dn` without copying instructions into
every prompt.

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
[Kickstart & Looping](/kickstart/overview/#milestone-queues).
