---
title: Plan lifecycle
description: Choose a dn workflow, review work at the right boundaries, and resume safely from durable plans.
---

Denoise helps people choose and shape work. `dn` turns that intent into a
durable plan, implementation, and close-out workflow. The explicit lifecycle is
`meld → loop → land`; `kickstart` is the shorter end-to-end path when you do not
need a separate planning boundary.

## Choose a review boundary

| You want                                               | Workflow                          | Review boundary                                    |
| ------------------------------------------------------ | --------------------------------- | -------------------------------------------------- |
| One end-to-end run                                     | `dn kickstart`                    | Review the local changes or published pull request |
| Plan and implementation together, then local close-out | `dn kickstart` → `dn land`        | Review before commits are generated                |
| Separate planning, implementation, and close-out       | `dn meld` → `dn loop` → `dn land` | Review the plan and the implementation             |
| Publish a completed branch to trunk                    | Add `dn sync`                     | Explicit trunk publication                         |

`fixup` is the pull-request feedback path. `sync` and `land --issue-testplan`
are optional; not every workflow needs them.

## Plan with `meld`

`dn meld` is the only plan-phase command. It accepts one issue, several issues,
local Markdown, or a mixture:

```bash
dn meld 123
dn meld docs/spec.md --plan-name account-settings
dn meld 123 127 architecture.md --output plans/merged-context.md
dn meld --list planning-sources.txt
dn meld --update-issue 123
```

`--output` preserves normalized merged context. The planner writes a durable
`plans/*.plan.md` file containing source context, implementation steps, and
checklist acceptance criteria. Because the contract is a file, work can move
between OpenCode, Claude Code, Cursor, and Codex or resume in a later session.

### Plan a milestone

```bash
dn meld --milestone 42
dn meld --milestone "Q3 reliability"
dn meld --milestone https://github.com/owner/repo/milestone/3
```

This writes `plans/{owner}_{repo}_{milestone}.description.md`: a
user-value-focused synthesis of the milestone's open issues. It is not the
prioritized execution queue from `dn init stack`.

A typical milestone flow is:

1. Run `dn meld --milestone` to clarify the milestone outcome.
2. Run `dn init stack <milestone>` to score and order executable issues.
3. Use `dn kickstart --milestone <milestone>` to consume that queue, or run
   `dn meld <issue>` for an individually reviewed plan.

## Implement with `loop`

```bash
dn loop plans/account-settings.plan.md
dn loop 123
PLAN=plans/account-settings.plan.md dn loop
```

`loop` implements one plan, updates its checklist, and writes a
`*.continuation.plan.md` file when work remains. Re-run the same plan after an
interruption; do not re-plan completed work unless the intent changed.

## Close out with `land`

```bash
dn land plans/account-settings.plan.md
dn land --issue-testplan plans/account-settings.plan.md
```

`land` validates the plan and checklist, groups workspace changes into commits,
and removes the completed plan. `--issue-testplan` also upserts a concise
`## Test Plan` checklist on the linked GitHub issue. See
[Land completed work](/dn-cli/land/) for publish modes and recovery behavior.

After a pull request receives feedback, run:

```bash
dn fixup https://github.com/owner/repo/pull/123
```

Use `dn sync` only when you intend to publish the current trunk state. It is not
an automatic lifecycle stage.

## Batch and agent-driven planning

Process a prioritized list one issue at a time so every item has an independent
restart point:

```bash
for issue in 123 127 131; do
  dn meld "$issue" --plan-name "issue-$issue"
  dn loop "plans/issue-$issue.plan.md"
  dn land "plans/issue-$issue.plan.md"
done
```

After installing the `dn` skill, an existing agent harness can invoke the same
commands. For example: “Use the dn skill to meld issues 123 and 127 into one
plan, stop for review, then implement the approved plan.”

## Artifacts and safe restart points

| After               | Durable state                                    | Safe restart                        |
| ------------------- | ------------------------------------------------ | ----------------------------------- |
| Source merge        | Optional merged Markdown                         | Re-run `meld` from the saved source |
| `meld`              | `plans/*.plan.md`                                | Review or run `loop`                |
| `loop`              | Updated checklist and optional continuation plan | Re-run `loop`                       |
| `land`              | Commits/bookmarks; optional issue test plan      | Review, publish a PR, or `sync`     |
| Published kickstart | Branch and pull request                          | Use `fixup` for review feedback     |

## Migrate older commands

| Before v0.0.34      | Current command              |
| ------------------- | ---------------------------- |
| `dn prep <source>`  | `dn meld <source>`           |
| `dn archive <plan>` | `dn land <plan>`             |
| `dn hc ...`         | `dn until run <gambit.json>` |
| `dn testplan ...`   | `dn land --issue-testplan`   |

The installed Actions filename `dn-prep-issue-plan.yml` remains temporarily for
compatibility. New integrations dispatch `dn.meld_issue_plan`; the workflow also
accepts the legacy `dn.prep_issue_plan` event.
