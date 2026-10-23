---
title: Completing GitHub Issues
description: Understand the different flows to complete work in GitHub with dn
---

For an overview of kickstart in the `dn` CLI and denoise, start with
[Kickstart](/kickstart/). This page covers CLI variants for GitHub issues —
pull-request kickstart, meld, fixup, and until.

The `dn` CLI gives you a non-conversational assistant interface to the harnesses
you already use. Use the CLI to orient your workflow around durable plans,
lining up targets for `dn kickstart`. Use `dn meld` and manual review to create
GitHub issues and markdown plan files that lean towards specification. Treat
these as a contract between the team and your agents.

## Choose the right handoff

`dn` is useful at multiple parts of the GitHub issue lifecycle. If you focus on
refining issues into well scoped & sized chunks of work, you can line up issues
and land them through your team's CI/CD process very quickly. Alternatively, you
can use the CLI to refine plans locally in git (from the repo top level `plans/`
directory) or refine GitHub issues directly. Your team still owns the planning
process, but agents can save quite a bit of time reducing ambiguity in issues &
double checking requests against the current codebase.

| Use this path                                 | Workflow                                    | When it is useful                                                                                         |
| --------------------------------------------- | ------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| One-shot complete a GitHub Issue end to end   | `dn kickstart --publish pr <issue>`         | Create & refine the issue in Github, implement with `dn` locally or headlessly on a server                |
| Review the plan and implementation separately | `dn meld` → `dn loop` → `dn land` → open PR | The work is ambiguous, high-risk, or needs consensus on approach; use agents to help plan collaboratively |
| Respond to team & agent feedback              | `dn fixup`                                  | Work in GitHub pull request comments to build consensus on reviewed code; use agents to update the pr     |
| Work towards a goal                           | `dn until`, `dn loop`                       | Created bounded loops locally or create a daily cadence with your agent in GitHub                         |

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
but it does not provide the GitHub issue linkage described on this page. Extra
guidance for the planning agent goes in `--steer`, and extra files in repeatable
`--context-file` flags:

```bash
dn kickstart 123 --steer "Prefer small modules; do not rename public exports"
dn kickstart 123 --context-file notes.md --context-file src/parser.ts
```

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
6. Runs `dn ensure lint` so a fixer agent can clear fmt/lint.
7. Commits, pushes, and opens a pull request. Host CI is the quality gate.

This path has the fewest manual steps. It is useful for well-scoped issues when
the branch and pull request provide enough isolation for review.

After the pull request is open, see
[Continue after the pull request opens](/dn/command-reference/#continue-after-the-pull-request-opens).

## Review the plan before implementation

Use the explicit `meld → loop → land` lifecycle when the implementation approach
needs its own review boundary.

Plan with [`dn meld`](/dn/command-reference/#plan-with-meld), then implement
with [`dn loop`](/dn/command-reference/#implement-with-loop).

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
review. `dn sync` publishes trunk after Land on the leave-local path; it is not
part of the pull-request path. See [Kickstart](/kickstart/).

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
item and **requires** `--publish pr` or `--publish direct` so each stack item is
published before the next. Use `--publish pr` in an ephemeral runner so each
completed issue produces a durable pull request. On `--once` / `--complete`
success, the stack item is marked done and the GitHub issue is closed.

To clarify the milestone outcome before creating its execution queue, run:

```bash
dn meld --milestone 42
dn meld --milestone "Q3 reliability"
```

This writes a user-value-focused milestone description. It does not replace the
prioritized stack created by `dn init stack`.
