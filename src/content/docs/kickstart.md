---
title: Kickstart
description: Learn how kickstart turns an issue or local specification into a plan and implementation.
---

Kickstart is the core command across `dn` and denoise for taking a plan and
creating an implementation. From a repository checkout, run `dn kickstart` with
an issue number or a local specification:

```bash
# a github issue
dn kickstart https://github.com/chesapeakedev/dn/issues/8

# a shorter form for a github issue
dn kickstart 123

# a local plan file
dn kickstart docs/spec.md
```

In denoise, choose Kickstart on a task or issue in a milestone. The task needs
an available runner. See [Kickstart runtimes](/runners/kickstart-runtimes/) for
runner choices and prerequisites.

## What kickstart does

Kickstart resolves the request, creates or uses a plan, and implements the
planned work. For local CLI runs, the default publish mode keeps the changes in
the workspace. The workflow can also publish a pull request or commit and push
directly when you choose those modes.

Kickstart may run configured lint and formatting checks so the agent can fix
issues before handing work back. It does not run tests as its final publish
gate. For a pull request, the repository's CI checks the PR. For local work,
review the changes, then use the repository's land and sync workflow as needed.

## Publish modes

| Publish mode | CLI option                 | Result                                                        |
| ------------ | -------------------------- | ------------------------------------------------------------- |
| Local        | `--publish none` (default) | Changes stay in the workspace for review                      |
| Pull request | `--publish pr` or `--awp`  | Creates a branch or bookmark, commits, pushes, and opens a PR |
| Direct       | `--publish direct`         | Commits and pushes to the default branch                      |

CI must use `pr` or `direct` because a local-only workspace disappears with the
runner. Use `direct` only when you intentionally want to bypass pull-request
review. On the local path, `dn land` commits from a finished plan and
[`dn sync`](/dn/command-reference/#dn-sync) publishes trunk; sync is not part of
the pull-request path.

## Choose a workflow

| Goal                                          | Workflow                                    | When it fits                                                                                              |
| --------------------------------------------- | ------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| Complete a GitHub issue end to end            | `dn kickstart --publish pr <issue>`         | The issue is scoped; review the result in a pull request (locally or on a runner)                         |
| Review the plan and implementation separately | `dn meld` → `dn loop` → `dn land` → open PR | The work is ambiguous, high-risk, or needs consensus on approach; use agents to plan before implementing |

For PR review after publication, use [`dn fixup`](/dn/command-reference/#dn-fixup).
For bounded local or scheduled loops, see [`dn until`](/dn/command-reference/#dn-until)
and [Completing GitHub Issues](/dn/completing-github-issues/).

### One-shot pull request

Use `kickstart` when the issue is specific enough that you can review the result
in a pull request:

```bash
dn kickstart --publish pr 123
dn --agent codex kickstart --publish pr 123
```

In pull-request mode, `kickstart`:

1. Resolves the issue context.
2. Prepares a branch or bookmark.
3. Writes and validates a named plan.
4. Runs the implementation agent.
5. Updates the acceptance criteria and writes continuation context if needed.
6. Runs `dn ensure lint` so a fixer agent can clear fmt/lint.
7. Commits, pushes, and opens a pull request. Host CI is the quality gate.

This path has the fewest manual steps. It is useful for well-scoped issues when
the branch and pull request provide enough isolation for review.

After the pull request is open, see [`dn fixup`](/dn/command-reference/#dn-fixup).

### Plan, implement, and land separately

Use the explicit `meld → loop → land` lifecycle when the implementation approach
needs its own review boundary.

Plan with [`dn meld`](/dn/command-reference/#dn-meld), implement with
[`dn loop`](/dn/command-reference/#dn-loop), then commit with
[`dn land`](/dn/command-reference/#dn-land) and open a pull request when you are
ready.

This path is useful when an issue combines several concerns, implementation risk
is high, or another person needs to approve the plan before code changes begin.

## Continue after kickstart

Review the plan and implementation before treating the work as complete.
Kickstart from denoise can fail or produce work that still needs an engineer —
see [When kickstart needs an engineer](/denoise/kickstart-handoff/). For
GitHub-specific issue prep, milestones, and fixup on open PRs, see
[Completing GitHub Issues](/dn/completing-github-issues/). For flags and nested
commands, run `dn kickstart --help`.
