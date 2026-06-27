---
title: Orchestrate Agents
description: Plan, implement, archive plans, and address PR feedback with dn
---

Workflow commands turn issues, pull requests, or local markdown into durable
plans and code changes.

# Work above syntax

The commands on this page are for **orchestration** — working one level above
syntax. Instead of building with the agent one prompt at a time, source context
(issues, specs, PR feedback), choose how far automation should run, and hand off
durable artifacts — plans, branches, commits — at each boundary.

This creates a **shared workflow** between you, your agent, your team, and their
agents. Each step in the flow — plan, implement, review, fix up, archive — can
be picked up by contributor or agent. Run `prep` to flesh out a plan and let
another contributor `loop`, review, and land the implementation. Kick off
`kickstart` and step in when the plan has unfinished work that needs a human
judgment call.

Create a nightly job tasking an agent to find and complete work in the
repository, creating plans, commits, pull requests, and comments. These commands
form the primitives for building an autonomous software development lifecycle.

## `dn kickstart`

Runs the full plan-and-implement workflow:

```bash
# Apply changes locally
dn kickstart https://github.com/owner/repo/issues/123
dn kickstart 123

# Use a local markdown spec as context
dn kickstart docs/spec.md

# Create a branch/bookmark, commit, push, and open a PR (--awp is an alias)
dn kickstart --publish pr 123
dn kickstart --awp 123

# Implement an issue from another repo in the current workspace
dn kickstart --allow-cross-repo https://github.com/private-org/specs/issues/123

# Select an agent harness
dn --agent codex kickstart 123
dn --agent claude kickstart --awp 123
```

With `--publish none` (the default), kickstart applies changes locally and
leaves commits and PRs to you. With `--publish pr` (or `--awp`), it handles
branch/bookmark creation, commits, push, and PR creation, and therefore requires
the issue to belong to the current workspace repository. See
[Kickstart & Looping — Publish modes](/dn-cli/overview/#publish-modes).

Run agent phases inside Docker or exe.dev with `--sandbox`; see
[Sandbox providers](/dn-cli/sandbox/) for config, sync behavior, and CI notes.

## `dn prep`

Runs only the planning phase:

```bash
dn prep https://github.com/owner/repo/issues/123
dn prep 123
dn prep docs/spec.md
dn prep --plan-name my-feature 123
dn prep --allow-cross-repo https://github.com/private-org/specs/issues/123
```

The command prints the plan file path for review or later implementation.

## `dn loop`

Runs only the implementation phase from an existing plan:

```bash
dn loop --plan-file plans/my-feature.plan.md

# Or let dn use PLAN
PLAN=plans/my-feature.plan.md dn loop

# Or auto-discover the latest plan
dn loop
```

`dn loop` validates the plan, runs the selected agent, checks acceptance
criteria, and writes continuation prompts when work remains. Use
`--sandbox docker` or `--sandbox exe.dev` to run the implement phase inside an
isolated environment; see [Sandbox providers](/dn-cli/sandbox/).

For a goal-shaped loop with an independent script or prompt gate (no plan
file), see [`dn until`](/dn-cli/until/).

## `dn until`

Runs bounded generator/verifier gambits until an independent gate says done:

```bash
dn until validate .github/dn/gambit.json
dn until run .github/dn/gambit.json
dn until run .github/dn/gambit.json --once
```

Prefer a script verifier (exit code 0) when a merge bar or test command can
decide done. See [Until (generator / verifier)](/dn-cli/until/) for recipes,
prompt verdict files, and gambit chains.

## `dn meld`

Merges local markdown files and/or GitHub issue URLs into a single planning
source, then runs the shared planner:

```bash
dn meld plan.md
dn meld https://github.com/owner/repo/issues/123
dn meld a.md b.md
dn meld -l sources.txt
dn meld a.md b.md -o plans/merged.md --plan-name merged
dn meld research.md ops-notes.md --target AGENTS.md
dn meld handoff.md --target github:comment:123 --dry-run
```

Use `meld` when useful context is spread across more than one source. Use `prep`
when a single issue or file is already the right planning input.

## `dn fixup`

Fetches a pull request's description and review comments, creates a plan, and
implements the requested fixes in your local workspace:

```bash
dn fixup https://github.com/owner/repo/pull/123
dn --agent cursor fixup https://github.com/owner/repo/pull/123
dn --agent claude fixup https://github.com/owner/repo/pull/123
dn --agent codex fixup https://github.com/owner/repo/pull/123
```

The PR URL can also be provided with `PR_URL`. If you are already on the right
branch, no VCS checkout command is run.

## `dn archive`

Derives a commit message from a plan file:

```bash
dn archive plans/issue-123.plan.md

# Commit staged files with the derived message, then delete the plan file
dn archive plans/issue-123.plan.md --yolo
```

## Milestone queues

Milestone queues are generated by `dn init stack` and consumed by `kickstart`:

```bash
dn init stack 42
dn kickstart --milestone 42
dn kickstart --milestone 42 --complete
```

`--complete` runs remaining unchecked stack tasks without prompting between
queue items. Plan naming and agent prompts can still occur unless separately
configured.

See [Filesystem Context](/dn-cli/filesystem-context/) for plan file behavior,
completion detection, and continuation prompts.
