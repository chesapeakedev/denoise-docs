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

# a denoise cloud task (native milestone task)
dn kickstart https://denoise.cloud/task/<uuid>

# a local plan file
dn kickstart docs/spec.md
```

Create cloud tasks from the terminal with `dn task create --denoise` (see
[Workspace CRUD](/dn/workspace/)).

In denoise, choose Kickstart on a task or issue in a milestone. The task needs
an available runner. See [Kickstart runtimes](/runners/kickstart-runtimes/) for
runner choices and prerequisites.

## What kickstart does

Kickstart resolves the request, plans the work, runs the implementation agent,
and optionally publishes the result. Under the hood it chains the same steps you
can run yourself with [`dn meld`](/dn/command-reference/#dn-meld),
[`dn loop`](/dn/command-reference/#dn-loop), and
[`dn land`](/dn/command-reference/#dn-land). Use **kickstart** when you want that
pipeline in one command. Use the individual commands when you need a stop between
phases.

**Prefer kickstart** when the issue or spec is already scoped, you are comfortable
reviewing the outcome in a pull request (or in the workspace with
`--publish none`), and you do not need a separate plan review before code changes.
On a runner or in CI, `dn kickstart --publish pr <issue>` is usually the shortest
path from issue to open PR.

**Split the phases** when planning deserves its own gate: ambiguous requirements,
high implementation risk, or a teammate who must sign off on `plans/*.plan.md`
before `loop` touches the tree. Typical sequence: `dn meld` to write or refresh the
plan, edit the checklist if needed, `dn loop` on that plan (repeat while acceptance
items stay open), then `dn land` when the checklist is complete and you want local
commits before you push or open a PR. **`loop` alone** fits when a plan file already
exists; **`land` alone** fits when implementation is done and you only need commits
from the finished plan.

For pull-request feedback after publication, use [`dn fixup`](/dn/github-context/#pull-requests-and-review).
For bounded retries against a verifier, see [`dn until`](/dn/command-reference/#dn-until)
and [Completing GitHub Issues](/dn/completing-github-issues/).

Kickstart may run configured lint and formatting checks so the agent can fix
issues before handing work back. It does not run tests as its final publish
gate. For a pull request, the repository's CI checks the PR. For local work,
review the changes, then use the repository's land and sync workflow as needed.

### End-to-end pull request

When the issue is specific enough to review in a PR:

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

After the pull request is open, see [`dn fixup`](/dn/github-context/#pull-requests-and-review).

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

## Continue after kickstart

Review the plan and implementation before treating the work as complete.
Kickstart from denoise can fail or produce work that still needs an engineer —
see [When kickstart needs an engineer](/denoise/kickstart-handoff/). For
GitHub-specific issue prep, milestones, and fixup on open PRs, see
[Completing GitHub Issues](/dn/completing-github-issues/). For flags and nested
commands, run `dn kickstart --help`.
