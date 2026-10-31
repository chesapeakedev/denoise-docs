---
title: Completing GitHub Issues
description: Understand the different flows to complete work in GitHub with dn
---

For kickstart commands, publish modes, and the choice between one-shot kickstart
and `meld` → `loop` → `land`, start with
[Kickstart](/kickstart/).

This page covers GitHub-specific preparation, milestone queues, and CLI paths that
sit beside kickstart — pull-request feedback with `fixup` and bounded work with
`until`.

The `dn` CLI gives you a non-conversational assistant interface to the harnesses
you already use. Use durable plans and well-scoped issues so kickstart and meld
runs share a clear contract between the team and your agents.

## Choose the right handoff

| Use this path                    | Workflow              | When it is useful                                                                                |
| -------------------------------- | --------------------- | ------------------------------------------------------------------------------------------------ |
| Respond to team & agent feedback | `dn fixup`            | Work in GitHub pull request comments; use agents to update the PR                               |
| Work towards a goal              | `dn until`, `dn loop` | Bounded loops locally or a daily cadence with your agent in GitHub                               |
| Kickstart or split plan/implement | See [Kickstart — What kickstart does](/kickstart/#what-kickstart-does) | End-to-end issue work or review plan and implementation separately |

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

After the pull request is open, see [`dn fixup`](/dn/github-context/#pull-requests-and-review).

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
