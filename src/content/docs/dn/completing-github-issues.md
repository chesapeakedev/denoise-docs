---
title: Completing GitHub Issues
description: Choose a dn workflow that turns a GitHub issue into a reviewed pull request.
---

`dn` can take a GitHub issue from planning through implementation and pull
request publication. Choose a path based on where you want to review the work:
after the pull request opens, before anything is published, or before
implementation begins.

## Choose a path to a pull request

| Use this path                                             | Workflow                                                  | When it is useful                                                              |
| --------------------------------------------------------- | --------------------------------------------------------- | ------------------------------------------------------------------------------ |
| Publish a pull request end to end                         | `dn kickstart --publish pr <issue>`                       | The issue is ready for implementation and the pull request is the review point |
| Complete and verify the implementation locally            | `dn kickstart <issue>` → `dn until` → `dn land` → open PR | You want the merge gate to pass before commits leave the workspace             |
| Review the plan and implementation separately             | `dn meld` → `dn loop` → `dn until` → `dn land` → open PR  | The work is ambiguous, high-risk, or needs agreement on the approach           |
| Run remotely or in CI                                     | Remote `dn kickstart --publish pr <issue>`                | The workspace is temporary or no developer is supervising the run              |
| Work through a milestone queue one pull request at a time | `dn init stack` → published milestone run                 | A prioritized set of issues is ready for unattended or scheduled execution     |

The first path is the shortest. The local paths create review boundaries by
leaving artifacts in the workspace. They require you to push the resulting
feature branch or bookmark and open the pull request yourself.

Before starting, authenticate to GitHub as described in
[Installation — GitHub authentication](/dn/installation/#github-authentication).
Use a feature branch or bookmark for a local workflow that will become a pull
request.

## Prepare the issue

An implementation-ready issue states the outcome, observable acceptance
criteria, relevant code, and explicit non-goals. Keep one issue to one
deliverable when possible. `kickstart` and `meld` preserve this context in the
plan checklist, which later runs use to measure progress.

```markdown
- [ ] Unauthenticated requests to `/api/profile` return 401
- [ ] Authenticated requests return the user's profile JSON
- [ ] Existing session tests still pass
```

Issue arguments can be a full URL or a number in the current repository:

```bash
dn kickstart https://github.com/owner/repo/issues/123
dn kickstart 123
```

Cross-repository issues require `--allow-cross-repo` and must stay local with
`--publish none`. A local Markdown file can replace the issue as source context,
but it does not provide the GitHub issue linkage described on this page.

## Publish a pull request end to end

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
6. Runs project checks.
7. Commits, pushes, and opens a pull request.

This path has the fewest manual steps. It is useful for well-scoped issues when
the branch and pull request provide enough isolation for review.

## Complete and verify work locally

Run `kickstart` without a publish mode to keep the plan and changes in the
current workspace:

```bash
dn kickstart 123
dn until validate .github/dn/gambit.json
dn until run .github/dn/gambit.json
dn land --issue-testplan
```

Configure the gambit so its generator resolves problems in the current issue
implementation and its script verifier runs the repository's full merge gate.
For example:

```json
{
  "gambits": [
    {
      "name": "issue-ready",
      "metadata": { "issue": "123" },
      "generator": {
        "prompt": "Finish the local implementation for issue {{issue}}. Resolve failures reported by the verifier without expanding the issue scope."
      },
      "verifier": { "script": "make precommit" }
    }
  ],
  "iterations": 5,
  "timeout_ms": 3600000
}
```

Replace `make precommit` with the repository's merge gate. `until` repeats the
generator and verifier within the configured budget, leaving all work local.
Review the resulting diff before running `land`.

`land` validates the completed plan, groups the workspace changes into local
commits, and removes the plan. `--issue-testplan` also upserts a concise
`## Test Plan` checklist on the linked issue. It does not push or open a pull
request.

Push the resulting feature branch or bookmark with your usual VCS workflow, then
open the pull request:

```bash
gh pr create
```

Use this path when you want automated retries against an objective local gate,
followed by local code and commit review before publication. See the
[`dn until`](/dn/workflows/#dn-until) and
[`dn land`](/dn/workflows/#dn-land) command reference sections for gambit
options, dry runs, and recovery behavior.

## Review the plan before implementation

Use the explicit `meld → loop → land` lifecycle when the implementation approach
needs its own review boundary.

### Plan with `meld`

`dn meld` accepts one issue, several issues, local Markdown, or a mixture:

```bash
dn meld 123 --plan-name issue-123
dn meld 123 127 architecture.md --output plans/merged-context.md
dn meld --list planning-sources.txt
dn meld --update-issue 123
```

The planner writes a durable `plans/*.plan.md` file containing source context,
implementation steps, and checklist acceptance criteria. Review and edit that
file before implementation. Because the contract is a file, the work can move
between OpenCode, Claude Code, Cursor, and Codex or resume in a later session.
When you provide `--output`, `meld` also preserves the normalized merged source
context.

### Implement with `loop`

```bash
dn loop plans/issue-123.plan.md
dn loop 123
PLAN=plans/issue-123.plan.md dn loop
```

`loop` implements one existing plan. It does not create a plan, commit, push, or
open a pull request. If work remains, it updates the checklist and writes a
`*.continuation.plan.md` file. Review the current state and rerun the same plan;
the checked items are the restart point.

### Land and open the pull request

After the checklist and implementation are complete, run the repository gambit
to resolve remaining merge-gate failures, then land the plan:

```bash
dn until run .github/dn/gambit.json
dn land --issue-testplan plans/issue-123.plan.md
gh pr create
```

`land` creates local commits. Push the feature branch or bookmark with your
usual VCS workflow before `gh pr create` if it does not already have an
upstream.

This path is useful when an issue combines several concerns, implementation risk
is high, or another person needs to approve the plan before code changes begin.

## Publish modes

`kickstart` controls where an end-to-end run stops:

| Mode         | Flag                       | Result                                 |
| ------------ | -------------------------- | -------------------------------------- |
| Local        | `--publish none` (default) | Changes and plan stay in the workspace |
| Pull request | `--publish pr` or `--awp`  | Branch/bookmark, commit, push, and PR  |
| Direct       | `--publish direct`         | Commit and push to the default branch  |

CI must use `pr` or `direct` because a local-only workspace disappears with the
runner. Use `direct` only when you intentionally want to bypass pull-request
review. `dn sync` also publishes trunk state; it is not part of an
issue-to-pull-request workflow.

## Run remotely or in CI

The same end-to-end pull-request path works in a persistent remote runner or
ephemeral CI job:

```bash
dn kickstart --publish pr 123
```

For Cursor Cloud, add its remote execution options:

```bash
export CURSOR_API_KEY='...'
dn kickstart --cursor-cloud --publish pr --ref main 123
```

Cursor Cloud uses a remote clone on a Cursor-managed VM and does not modify the
local workspace. Without progress configuration, the run is durable
fire-and-forget. With `DN_DISPATCH_ID` and `DN_PROGRESS` set, `dn` waits,
reports progress, and returns the pull request URL or terminal failure. See
[Headless Use](/dn/headless-use/) for CI dispatch and
[Sandbox execution](/dn/sandbox/) for Docker and exe.dev.

## Milestone queues

Use a milestone queue when several implementation-ready issues should each
become independent work:

```bash
dn init stack 42
dn kickstart --publish pr --milestone 42 --once
dn kickstart --publish pr --milestone 42 --complete
```

`dn init stack` scores and orders the open issues. `--once` processes the next
unchecked item and is suitable for CI. `--complete` processes every remaining
item. Use `--publish pr` in an ephemeral runner so each completed issue produces
a durable pull request.

To clarify the milestone outcome before creating its execution queue, run:

```bash
dn meld --milestone 42
dn meld --milestone "Q3 reliability"
```

This writes a user-value-focused milestone description. It does not replace the
prioritized stack created by `dn init stack`.

## Continue after the pull request opens

When review feedback arrives, apply it in the pull request workspace:

```bash
dn fixup https://github.com/owner/repo/pull/123
```

`fixup` fetches the pull request description and review comments, then plans and
implements the requested changes locally.

For interrupted work before publication:

- If no matching plan exists, run `dn meld <issue>`.
- If a plan has unchecked criteria, rerun `dn loop` on that plan.
- If pull request publication fails after the branch was pushed, inspect the
  remote branch and retry after resolving any conflicting update.
