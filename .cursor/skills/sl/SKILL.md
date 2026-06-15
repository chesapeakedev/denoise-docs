---
name: sl
description: >-
  Use Sapling SCM commands for this repository instead of Git. Use when checking
  repository status, inspecting diffs, adding/removing files, creating commits,
  viewing history, or preparing stacked changes in denoise-docs.
---

# Sapling usage for this repo

This repository uses **Sapling SCM**. Use `sl` commands instead of `git` for
normal version-control work.

## Safe default workflow

Use these commands for routine commit work:

```bash
sl status
sl diff
sl addremove
sl commit -m "Add brand voice skill"
sl log -r . -T "{node|short} {desc|firstline}\n"
```

For focused commits, pass explicit file or directory paths:

```bash
sl addremove .cursor/skills/brand-voice
sl commit -m "Add brand voice skill" .cursor/skills/brand-voice
```

```bash
sl addremove scripts/quick_validate.ts .cursor/skills/sl
sl commit -m "Add quality check targets" Makefile scripts/quick_validate.ts .cursor/skills/sl
```

Use `sl status` after each commit to confirm what remains.

## Command mapping

Prefer these Sapling commands:

- `sl status` instead of `git status`
- `sl diff` instead of `git diff`
- `sl addremove` to add new files and record deletes
- `sl commit -m "Message" [paths...]` to create a non-interactive commit
- `sl log -r .` to inspect the current commit
- `sl show` to inspect commit contents when available

## Avoid interactive history commands

Avoid commands that commonly open interactive editors or rewrite history unless
the user explicitly asks for them and the exact non-interactive form is known:

- `sl split`
- `sl histedit`
- `sl rebase --interactive`
- `sl fold`
- `sl absorb`
- `sl amend`

If a change needs to be split, prefer committing explicit paths with
`sl commit -m "Message" path/to/file` instead of using interactive split tools.
