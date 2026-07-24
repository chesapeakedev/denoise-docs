---
title: Land completed work
description: Validate a completed plan, generate commits, and optionally publish an issue test plan.
---

`dn land` closes completed plan-backed work into durable local VCS state. It is
not trunk publication and does not open a pull request by itself.

## Inputs and behavior

`land` discovers or accepts a `plans/*.plan.md` file, verifies its checklist,
reviews current workspace changes, and uses the selected agent to group them
into logical conventional commits. On success it removes the plan file.

```bash
dn land
dn land plans/issue-123.plan.md
dn land --single plans/issue-123.plan.md
dn land plans/issue-123.plan.md --dry-run
```

`--single` creates one deterministic commit without an agent. `--dry-run`
previews without committing, deleting a plan, or changing GitHub.

## Publish an issue test plan

```bash
dn land --issue-testplan plans/issue-123.plan.md
dn land --issue-testplan --dry-run
```

The option generates a concise `## Test Plan` checklist and upserts it on the
linked GitHub issue before committing. Issue discovery checks a full URL in the
plan, an `issue-123.plan.md` filename, or a `#123` reference. A local
`--test-plan <path>` is only extra commit context and does not update GitHub.

If the issue body is absent or returned as null, `land` treats it as empty and
creates the section. Authentication, permission, or issue-resolution failures
stop the update instead of modifying an uncertain issue.

## Outputs and recovery

Local outputs are commits or bookmarks and plan-file removal. The only GitHub
change is the optional issue test-plan upsert. To publish a pull request, push
the resulting branch and create the PR; use `dn sync` only for intentional trunk
publication.

If commit creation fails after removing a plan, `land` attempts to restore it.
Inspect VCS state, restore or complete any partial commit, and rerun `land` with
the same plan. Use `--dry-run` first when plan discovery or issue linkage is
uncertain.
