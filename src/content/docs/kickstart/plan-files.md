---
title: Plan files & continuation
description: Plan file locations, structure, completion detection, and continuation prompts.
---

Kickstart manages plan files in a `plans/` directory in the workspace root. The
directory is created automatically. Plan files track implementation progress and
work with Cursor IDE.

## Plan file locations

- **Default mode** — Uses `plans/.last.plan.md` for iterative development (or
  `plans/[name].plan.md` with `--save-plan` / `--saved-plan <name>`).
- **AWP mode** — Always uses `plans/[name].plan.md` (prompts for name, suggests
  branch name).

## Plan file structure

Plan files contain:

- **Title** — Issue title (H1)
- **Overview** — Brief description of the implementation goal
- **Issue Context** — Issue number, description, labels
- **Implementation Plan** — Detailed breakdown of changes
- **Acceptance Criteria** — Checklist format (`- [ ]` / `- [x]`) for progress
- **Code Pointers** — Files and locations to modify
- **Notes** — Assumptions, questions, or considerations

## Plan continuation (default mode)

If `plans/.last.plan.md` exists, kickstart prompts: **Continue existing plan?**
(y/n, default: n). If you continue, existing plan content is read and the
planning agent can update, correct, or extend it; previous acceptance criteria
are preserved.

## Completion detection

After the implement phase, kickstart:

1. Parses the **Acceptance Criteria** section
2. Counts how many items are `[x]` vs `[ ]`
3. If incomplete, generates a **continuation prompt** file

Example output:

```
Completion Status: 3/5 acceptance criteria completed
Plan is incomplete. 2 item(s) remaining.
```

## Continuation prompt files

For incomplete plans, kickstart creates `plans/[name].continuation.plan.md`
with:

- Issue context (number, title, URL)
- Plan file path
- Progress summary (completed/total)
- List of remaining items
- Instructions for continuing

These can be used with Cursor (if `--cursor`), other AI agents, or manual
continuation.

## Plan naming for incomplete work

**Default mode:** If work is incomplete and you're using `.last.plan.md`,
kickstart asks: **Would you like to name this plan?** (y/n, default: y). If yes,
it prompts for a name, saves `plans/[name].plan.md`, and generates
`plans/[name].continuation.plan.md`.

**AWP mode:** Plans are always named; continuation prompts are generated
automatically for incomplete work.

## Plan merging

For **named** plans (not `.last.plan.md`), if both a plan file and a
continuation file exist on a later run:

1. Kickstart detects both files
2. Merges them into a single plan file
3. Deletes the continuation file after a successful merge

This keeps one plan file with full context for future continuation.

## Cursor IDE

Plan files work with Cursor: checklist tracking, context for agents, progress
visible in the plan file, and plan files can be committed for history. Plan
files are never auto-deleted.
