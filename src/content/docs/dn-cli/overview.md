---
title: Kickstart and looping
description: Run dn end to end with kickstart or implement a reviewed durable plan with loop.
---

`dn kickstart` plans and implements work in one command. `dn loop` implements an
existing plan. Use [`dn meld`](/dn-cli/plan-lifecycle/#plan-with-meld) when you
want a review boundary before implementation.

## Write useful source context

Issues and local specs should state the outcome, observable acceptance criteria,
relevant code, and explicit non-goals. Keep one issue to one deliverable when
possible. `kickstart` and `meld` preserve this context in the plan checklist,
which later runs use as their progress signal.

```markdown
- [ ] Unauthenticated requests to `/api/profile` return 401
- [ ] Authenticated requests return the user's profile JSON
- [ ] Existing session tests still pass
```

## Run kickstart

```bash
dn kickstart https://github.com/owner/repo/issues/123
dn kickstart 123
dn kickstart docs/spec.md
dn kickstart --publish pr 123
dn kickstart --publish direct 123
dn --agent codex kickstart 123
```

Issue arguments can be a full URL or a number in the current repository. A
Markdown path supplies local context without fetching GitHub. Cross-repository
issues require `--allow-cross-repo` and `--publish none`.

### Publish modes

| Mode         | Flag                       | Result                                 |
| ------------ | -------------------------- | -------------------------------------- |
| Local        | `--publish none` (default) | Changes and plan stay in the workspace |
| Pull request | `--publish pr` or `--awp`  | Branch/bookmark, commit, push, and PR  |
| Direct       | `--publish direct`         | Commit and push to the default branch  |

CI must use `pr` or `direct`; a local-only workspace disappears with the runner.

### What kickstart does

1. Resolves issue or Markdown context.
2. Prepares VCS state when publishing.
3. Writes and validates a named plan.
4. Runs the implementation agent.
5. Updates acceptance criteria and writes continuation context if needed.
6. Runs project checks.
7. Commits, pushes, and optionally opens a PR in publish modes.

`kickstart` is the shortest path. Use `kickstart → land` when you want the plan
and implementation in one run but a separate local commit boundary.

## Implement an existing plan

```bash
dn loop plans/my-feature.plan.md
dn loop 123
PLAN=plans/my-feature.plan.md dn loop
dn --agent claude loop plans/my-feature.plan.md
```

With an issue reference, `loop` finds its matching plan. With no target, it uses
`PLAN` or the newest plan. It never creates a new plan and does not commit,
push, or open a PR.

If checklist items remain, `loop` writes a `plans/[name].continuation.plan.md`.
Review the current plan and rerun it; the checked state is the restart point.
For a goal without a plan file, use [`dn until`](/dn-cli/until/).

## Milestone queues

```bash
dn init stack 42
dn kickstart --milestone 42
dn kickstart --publish pr --milestone 42 --once
dn kickstart --milestone 42 --complete
```

`dn init stack` creates the prioritized queue. `--once` is suitable for CI;
`--complete` processes all unchecked items.

## Cursor Cloud

```bash
export CURSOR_API_KEY='...'
dn kickstart --cursor-cloud --publish pr --ref main 123
dn loop --cursor-cloud plans/my-feature.plan.md
```

Cursor Cloud uses a remote clone on a Cursor-managed VM and never modifies the
local workspace. Without progress configuration the run is durable
fire-and-forget. With `DN_DISPATCH_ID` and `DN_PROGRESS` set, `dn` waits,
reports progress, and returns the PR URL or terminal failure. Cursor Cloud is
not a `dn` sandbox; see [Sandbox execution](/dn-cli/sandbox/) for Docker and
exe.dev.

## Common recovery

- If no matching plan exists, run `dn meld <issue>`.
- If the issue remote differs from the workspace, use the correct checkout or
  local-only `--allow-cross-repo`.
- If a partial run leaves unchecked criteria, rerun `dn loop` on that plan.
- If PR publication fails after a branch was pushed, inspect the remote branch
  and retry after resolving any conflicting update.
