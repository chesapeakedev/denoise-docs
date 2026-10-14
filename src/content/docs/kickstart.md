---
title: Kickstart
description: Learn how kickstart turns an issue or local specification into a plan and implementation.
---

Kickstart is the core command across `dn` and denoise for taking a plan and creating an
implementation. From a repository checkout, run `dn kickstart` with an issue
number or a local specification:

```bash
# a github issue
dn kickstart https://github.com/chesapeakedev/dn/issues/8

# a shorter form for a github issue
dn kickstart 123

# a local plan file
dn kickstart docs/spec.md

```

In denoise, choose Kickstart on a task or issue in a milestone. The
task needs an available runner. See [Kickstart runtimes](/runners/kickstart-runtimes/) for
runner choices and prerequisites.

## What kickstart does

Kickstart resolves the request, creates or uses a plan, and implements the
planned work. For local CLI runs, the default publish mode keeps the changes in
the workspace. The workflow can also publish a pull request or commit and push
directly when you choose those modes.

| Publish mode | CLI option                 | Result                                                        |
| ------------ | -------------------------- | ------------------------------------------------------------- |
| Local        | `--publish none` (default) | Changes stay in the workspace for review                      |
| Pull request | `--publish pr` or `--awp`  | Creates a branch or bookmark, commits, pushes, and opens a PR |
| Direct       | `--publish direct`         | Commits and pushes to the default branch                      |

Kickstart may run configured lint and formatting checks so the agent can fix
issues before handing work back. It does not run tests as its final publish
gate. For a pull request, the repository's CI checks the PR. For local work,
review the changes, then use the repository's land and sync workflow as needed.

## Continue after kickstart

Review the plan and implementation before treating the work as complete. For the
GitHub issue workflow, including PR review and publication details, see
[Completing GitHub Issues](/dn/completing-github-issues/). For the command
options, see the [`dn kickstart` reference](/dn/workflows/#dn-kickstart). For
local commits and trunk publication, see [`dn land`](/dn/workflows/#dn-land) and
[`dn sync`](/dn/workflows/#dn-sync).
