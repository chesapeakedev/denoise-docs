---
title: Command overview
description: Choose the dn command that matches your planning, implementation, verification, or close-out boundary.
---

`dn` turns GitHub issues and local specifications into durable plans, code
changes, commits, and pull requests. Start with the
[Completing GitHub Issues](/dn-cli/completing-github-issues/) when choosing a
workflow.

## Workflow commands

| Command        | Use it when                                            | Result                               |
| -------------- | ------------------------------------------------------ | ------------------------------------ |
| `dn kickstart` | Planning and implementation can run end to end         | Local changes or a published PR      |
| `dn meld`      | You want a plan review or need to combine sources      | `plans/*.plan.md`                    |
| `dn loop`      | A reviewed plan is ready to implement                  | Updated checklist and code           |
| `dn land`      | Completed local work needs commits                     | Commits and optional issue test plan |
| `dn fixup`     | A pull request has review feedback                     | Local fixes                          |
| `dn until`     | A goal needs repeated attempts and an independent gate | Bounded generator/verifier run       |
| `dn sync`      | Current trunk state should be published                | Explicit trunk publication           |

## Kickstart

```bash
dn kickstart 123
dn kickstart docs/spec.md
dn kickstart --publish pr 123
dn --agent codex kickstart 123
dn kickstart --sandbox docker 123
```

`--publish none` leaves changes in the current workspace. `--publish pr` creates
a branch or bookmark, commits, pushes, and opens a PR. `--publish direct`
commits and pushes the default branch. See
[Completing GitHub Issues](/dn-cli/completing-github-issues/) for review
boundaries, milestone queues, and publication details.

## Meld, loop, and land

```bash
dn meld 123 --plan-name issue-123
dn meld product.md architecture.md --output plans/merged-context.md
dn loop plans/issue-123.plan.md
dn land --issue-testplan plans/issue-123.plan.md
```

`meld` is the plan phase. `loop` implements a durable plan. `land` validates
completion and generates local commits. These boundaries let a person or another
agent inspect each artifact before continuing.

## Fix pull-request feedback

```bash
dn fixup https://github.com/owner/repo/pull/123
dn --agent cursor fixup https://github.com/owner/repo/pull/123
```

`fixup` fetches the PR description and review comments, plans the requested
changes, and implements them in the current workspace.

## Run a bounded goal loop

```bash
dn until validate .github/dn/gambit.json
dn until run .github/dn/gambit.json
```

Use `until` for iteration-bounded work with a script or prompt verifier, not for
issue-shaped work that needs a plan. See
[Until (generator / verifier)](/dn-cli/until/).

## Plan and consume milestone work

```bash
dn meld --milestone 42
dn init stack 42
dn kickstart --milestone 42 --once
dn kickstart --milestone 42 --complete
```

The milestone description explains user value. The stack is the prioritized
execution queue. `--once` processes one item; `--complete` drains remaining
items.
