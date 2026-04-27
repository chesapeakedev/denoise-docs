---
title: Overview
description: How kickstart works — plan and implement phases, default vs AWP mode.
---

Kickstart is a Deno application that completes GitHub issues using opencode
directly on the host machine, without Docker or containerization. opencode and
Deno provide sandboxing for both the agent and the orchestrator: you point an
agent at a GitHub issue and have it implement the work on your machine with
reasonable sandboxing.

## CLI usage

Kickstart is available as part of the `dn` CLI:

```bash
# Full workflow
dn kickstart <issue_url_or_number>

# Plan phase only
dn prep <issue_url_or_number>

# Loop phase only (requires plan file from prep)
dn loop --plan-file plans/<name>.plan.md
```

You can pass a full GitHub issue URL or an issue number for the current
repository (e.g. `123` or `#123`). If the issue URL points to a different
repository than the current workspace, kickstart and prep exit with an error.
See [dn CLI Subcommands](/dn-cli/subcommands/) for full CLI documentation.

## Two modes

- **Default mode** — Applies changes locally to your workspace. You handle
  branches, commits, and PRs manually. Uses `plans/.last.plan.md` for iterative
  development unless you use `--save-plan` or `--saved-plan`.
- **AWP mode** — Full guided workflow: creates branches, commits changes, and
  opens a PR automatically. Always uses named plan files
  (`plans/[name].plan.md`).

## How it works

Kickstart orchestrates a **two-phase workflow** (Plan → Implement) with:

- **Completion detection** — Automatically checks acceptance criteria checklists
  after implementation
- **Continuation prompts** — Generates prompts for incomplete work (e.g.
  `plans/[name].continuation.plan.md`)
- **Plan merging** — For named plans, combines plan and continuation files into
  one
- **Artifact generation** — Updates AGENTS.md and can create Cursor rules (see
  [Artifacts & Cursor](/kickstart/artifacts-cursor/))

Plan files live in the workspace `plans/` directory and can be continued across
multiple runs.

### Default mode flow (summary)

1. Resolve issue context (fetch from GitHub or load file)
2. Ensure `plans/` exists; resolve plan path (`plans/.last.plan.md` or named)
3. If a plan file exists, prompt: continue existing plan?
4. **Plan phase** — Read-only analysis; creates/updates `plans/[name].plan.md`
5. Validate plan file
6. **Implement phase** — Apply code changes; update acceptance criteria
7. Check completion (parse acceptance criteria)
8. If incomplete: prompt to name plan (for continuation) and generate
   continuation prompt; optionally merge plan + continuation
9. Run linting (non-blocking)
10. Generate artifacts (AGENTS.md, Cursor rules if `--cursor`)
11. Validate changes — user handles Git/PR manually

### AWP mode flow (summary)

1. Resolve issue context
2. Detect VCS (Git or Sapling); prompt: use current branch or create new?
3. If new: prompt for branch name (suggested: `kickstart/issue_N_slug`); create
   branch/bookmark
4. Ensure `plans/`; prompt for plan name (suggest branch name)
5. **Plan phase** — Creates `plans/[name].plan.md`
6. Validate → **Implement phase** → Check completion
7. If incomplete: generate continuation; optionally merge
8. Lint → Artifacts → Validate changes
9. **Commit and push** (message: `#N Title`)
10. **Create PR** (title: `#N Title`, body: `Closes #N`)

## Key differences

**Default mode:** Uses `plans/.last.plan.md` unless you pass `--save-plan` or
`--saved-plan`. Prompts to continue an existing plan if found. No VCS required.
You handle git/PR manually.

**AWP mode:** Always prompts for plan name (suggests branch name). Creates named
plans; plan files are included in commits and PRs. Requires Git or Sapling.
Automatically creates branch, commit, and PR.

## Dependencies

- [Deno](https://deno.com/) and [opencode](https://opencode.dev/) in PATH
- GitHub authentication: [GitHub CLI](https://cli.github.com/)
  (`gh auth login`), or `dn auth`, or `GITHUB_TOKEN` (see
  [Authentication](/dn-cli/authentication/))
- Git or [Sapling](https://sapling-scm.com/) (for AWP mode)
