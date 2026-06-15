---
title: Plan files & continuation
description: Plan file locations, structure, completion detection, and continuation prompts.
---

Kickstart manages plan files in a `plans/` directory in the workspace root. The
directory is created automatically. Plan files track implementation progress and
give later `dn loop` runs or human reviewers a durable handoff.

## Plan file locations

- **Default mode** - Uses `plans/.last.plan.md` unless you provide
  `--saved-plan <name>` or name an incomplete plan during continuation.
- **AWP mode** - Uses a named `plans/[name].plan.md`, usually matching the
  branch/bookmark name.
- **Milestone mode** - Reads queue state from
  `plans/{owner}_{repo}_{milestone}.stack.md`; each task still produces a normal
  plan file.

## Plan file structure

Plan files contain the issue or markdown context, implementation plan, code
pointers, notes, and checklist-style acceptance criteria. The acceptance
criteria are the durable progress signal: completed items are marked with `[x]`,
remaining items stay `[ ]`.

## Plan continuation

If the selected plan file already exists, kickstart can continue from it. The
planning phase reads the existing content so the agent can update, correct, or
extend the plan while preserving progress.

After implementation, kickstart parses acceptance criteria. If work remains, it
generates `plans/[name].continuation.plan.md` with the plan path, progress
summary, remaining items, and continuation instructions.

## Plan naming

Default mode can start with `.last.plan.md` for local iteration. If incomplete
work needs to continue later, kickstart prompts for a durable plan name and
writes `plans/[name].plan.md` plus the continuation prompt. Use
`--saved-plan <name>` when the plan name must be non-interactive.

AWP mode and milestone-driven runs use named plans because the plan files are
part of the branch/PR workflow.

## Plan merging

For named plans, a later run can merge a continuation file back into the main
plan and remove the continuation file after a successful merge. This keeps one
plan file with the full history and remaining work.

Plan files are never auto-deleted. Keep them when they are useful for review or
archive them after the work lands.
