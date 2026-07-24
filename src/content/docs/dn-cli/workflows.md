---
title: Command reference
description: Look up dn commands for planning, implementation, verification, close-out, and publication.
---

Use this reference when you know which stage of the work you need to run. For an
issue-to-pull-request walkthrough, start with
[Completing GitHub Issues](/dn-cli/completing-github-issues/).

| Command        | Purpose                                                |
| -------------- | ------------------------------------------------------ |
| `dn kickstart` | Plan and implement an issue or local specification     |
| `dn meld`      | Create a durable plan from one or more sources         |
| `dn loop`      | Implement an existing plan                             |
| `dn land`      | Validate completed work and create local commits       |
| `dn fixup`     | Apply pull-request review feedback                     |
| `dn until`     | Repeat agent work until an independent verifier passes |
| `dn sync`      | Rebase and publish intentional trunk changes           |

## `dn kickstart`

```bash
dn kickstart 123
dn kickstart docs/spec.md
dn kickstart --publish pr 123
dn --agent codex kickstart 123
dn kickstart --sandbox docker 123
```

`kickstart` plans and implements a GitHub issue or local Markdown specification.
Its publish mode controls where the workflow stops:

| Mode         | Flag                       | Result                                 |
| ------------ | -------------------------- | -------------------------------------- |
| Local        | `--publish none` (default) | Changes and plan stay in the workspace |
| Pull request | `--publish pr` or `--awp`  | Branch/bookmark, commit, push, and PR  |
| Direct       | `--publish direct`         | Commit and push to the default branch  |

Use a feature branch or bookmark for local work that will become a pull request.
See [Completing GitHub Issues](/dn-cli/completing-github-issues/) for review
boundaries, milestone queues, and publication details.

## `dn meld`

```bash
dn meld 123 --plan-name issue-123
dn meld product.md architecture.md --output plans/merged-context.md
dn meld 123 127 architecture.md --output plans/merged-context.md
dn meld --list planning-sources.txt
dn meld --update-issue 123
```

`meld` combines GitHub issues, local Markdown, or both into a durable
`plans/*.plan.md` file. The plan contains source context, implementation steps,
and checklist acceptance criteria. Review or edit it before passing it to
`dn loop`.

`--output` also preserves normalized merged source context. `--update-issue`
publishes the resulting plan to the selected GitHub issue.

## `dn loop`

```bash
dn loop plans/issue-123.plan.md
dn loop 123
PLAN=plans/issue-123.plan.md dn loop
```

`loop` performs one implementation run against an existing plan. It does not
create a plan, commit, push, or open a pull request.

If work remains, `loop` updates the checklist and writes a
`*.continuation.plan.md` file. Review the current state and rerun the same plan;
checked items form the restart point.

## `dn land`

`land` closes completed plan-backed work into durable local VCS state. It does
not publish trunk or open a pull request.

### Inputs and behavior

```bash
dn land
dn land plans/issue-123.plan.md
dn land --single plans/issue-123.plan.md
dn land plans/issue-123.plan.md --dry-run
```

`land` discovers or accepts a `plans/*.plan.md` file, verifies its checklist,
reviews current workspace changes, and uses the selected agent to group them
into logical conventional commits. On success, it removes the plan file.

`--single` creates one deterministic commit without an agent. `--dry-run`
previews the operation without committing, deleting a plan, or changing GitHub.

### Publish an issue test plan

```bash
dn land --issue-testplan plans/issue-123.plan.md
dn land --issue-testplan --dry-run
```

`--issue-testplan` generates a concise `## Test Plan` checklist and upserts it
on the linked GitHub issue before committing. Issue discovery checks a full URL
in the plan, an `issue-123.plan.md` filename, or a `#123` reference. A local
`--test-plan <path>` provides extra commit context but does not update GitHub.

If the issue body is absent or returned as null, `land` treats it as empty and
creates the section. Authentication, permission, or issue-resolution failures
stop the update instead of modifying an uncertain issue.

### Outputs and recovery

Local outputs are commits or bookmarks and plan-file removal. The only GitHub
change is the optional issue test-plan upsert. Push the resulting feature branch
or bookmark and create a pull request with your usual VCS workflow. Use
`dn sync` only for intentional trunk publication.

If commit creation fails after removing a plan, `land` attempts to restore it.
Inspect VCS state, restore or complete any partial commit, and rerun `land` with
the same plan. Use `--dry-run` first when plan discovery or issue linkage is
uncertain.

## `dn fixup`

```bash
dn fixup https://github.com/owner/repo/pull/123
dn --agent cursor fixup https://github.com/owner/repo/pull/123
```

`fixup` fetches the pull-request description and review comments, plans the
requested changes, and implements them in the current workspace.

## `dn until`

`until` runs a bounded generator/verifier loop from a JSON config called a
gambit. Use it when a goal has an independent done check, such as the
repository's merge gate. For issue-shaped work, first use `kickstart` or `meld`
and `loop`, then use `until` to resolve remaining verification failures.

Use a script verifier whenever a command can decide whether the goal is done
with exit code 0. Reserve prompt verifiers for rubric-style goals without a
shell check.

### Run and validate a gambit

```bash
dn until validate .github/dn/gambit.json
dn until run .github/dn/gambit.json
dn until run .github/dn/gambit.json --once
dn until run .github/dn/gambit.json --strict-verdict
dn --agent claude until run .github/dn/gambit.json --sandbox docker
```

`validate` parses the config and prints the gambit count. `run` executes gambits
in order under one sandbox lifecycle. `--once` forces one generator → verifier
tick, equivalent to `one_shot: true` on a gambit.

The config has a shared top-level `iterations` bound, which defaults to `10`,
and an optional `timeout_ms`. Gambit zero is the primary and runs every
iteration. Later gambits can be interval reviews or one-shot tails. Each action
has exactly one of `prompt` or `script`. `secrets` lists environment variable
names, never secret values.

`metadata` values are substituted into prompts as `{{key}}` and prepended as a
context block.

### Make the merge gate pass

Use the project's full merge gate so the loop stops when the change is landable:

```json
{
  "gambits": [
    {
      "name": "precommit-green",
      "metadata": {
        "goal": "Complete issue 123 and keep the repository gate green"
      },
      "generator": {
        "prompt": "Implement {{goal}}. Prefer small, reviewable edits. Resolve failures reported by the verifier."
      },
      "verifier": { "script": "make precommit" }
    }
  ],
  "iterations": 5,
  "timeout_ms": 3600000
}
```

```bash
dn until run .github/dn/gambit.json
```

Replace `make precommit` with the repository's merge gate, such as
`deno task check` or `npm test && npm run lint`.

### Add a one-shot final review

Chain gambits when a focused feature gate should pass first and a broader
cleanup should run once:

```json
{
  "gambits": [
    {
      "name": "feature",
      "metadata": {
        "goal": "Implement the verifier verdict-file path in cli/until.ts"
      },
      "generator": {
        "prompt": "Implement {{goal}}. Keep changes in cli/ and matching tests."
      },
      "verifier": {
        "script": "deno test cli/test_until.ts --allow-all"
      }
    },
    {
      "name": "ci-tail",
      "one_shot": true,
      "metadata": {
        "goal": "Resolve type, lint, or format issues left by the feature gambit"
      },
      "generator": {
        "prompt": "{{goal}}. Do not expand scope beyond making the merge gate pass."
      },
      "verifier": { "script": "make precommit" }
    }
  ],
  "iterations": 8
}
```

### Schedule interval reviews

One `dn loop` run is one implementation pass against a plan. `dn until` repeats
a primary generator/verifier pass within an iteration budget and can schedule
satellite reviews:

```json
{
  "iterations": 8,
  "timeout_ms": 3600000,
  "gambits": [
    {
      "name": "raise-coverage",
      "metadata": { "threshold": "80" },
      "generator": {
        "prompt": "Add focused tests that raise line coverage toward {{threshold}}%. Do not weaken assertions or exclude code."
      },
      "verifier": {
        "script": "npm test -- --coverage && ./scripts/check-coverage 80"
      }
    },
    {
      "name": "review-tests",
      "interval": 0.25,
      "align": "spread",
      "phase": "after",
      "generator": {
        "prompt": "Review the new tests for gaps, flakiness, duplication, and weak assertions. Fix clear problems."
      },
      "verifier": { "script": "npm test" }
    },
    {
      "name": "final-review",
      "one_shot": true,
      "generator": {
        "prompt": "Review the completed coverage change and fix remaining integration problems."
      },
      "verifier": { "script": "make precommit" }
    }
  ]
}
```

An interval fires `floor(iterations * interval)` times, capped at the iteration
count. `align` places those runs at the `start`, `end`, or across the full run.
Use explicit 1-based `at` indices when exact iterations matter. `phase` chooses
whether a satellite runs before or after the primary pass.

Interval verifier failures are soft: they are recorded while the primary loop
continues. Primary and one-shot tail failures are hard gates.

### Use a prompt verifier

When no script can decide whether the goal is done, use a prompt verifier.
`until` checks for completion in this order:

1. A verdict file, defaulting to `.dn/until-verdict.json` or set with
   `verifier.verdict_path`, containing `{"done": true}`.
2. Extractable JSON in standard output containing `"done": true`.
3. Optional `verifier.done_when.stdout_contains`, as a weaker fallback.

`until` injects verdict-file instructions into the verifier prompt. Missing or
unparseable verdicts continue the loop unless you pass `--strict-verdict`.

```json
{
  "generator": { "prompt": "Improve the docs tone for {{audience}}" },
  "verifier": {
    "prompt": "Judge whether the docs meet the rubric for {{audience}}.",
    "verdict_path": ".dn/until-verdict.json"
  },
  "metadata": { "audience": "dn CLI users" },
  "max_iterations": 3
}
```

Avoid generator actions that only format code, prompt verifiers that rely on
stdout containing only JSON, unbounded long-running loops, and secret values in
the gambit file.

## Milestone commands

```bash
dn meld --milestone 42
dn init stack 42
dn kickstart --milestone 42 --once
dn kickstart --milestone 42 --complete
```

`dn meld --milestone` writes a user-value-focused milestone description.
`dn init stack` creates a prioritized execution queue. `--once` processes one
unchecked item; `--complete` processes all remaining items.

## `dn sync`

```bash
dn sync
dn sync --workspace-root /path/to/checkout
dn sync --skip-lint
```

`sync` rebases the checkout onto remote `main` and publishes local commits that
remain afterward. It is an explicit trunk-publication command, not the final
step of an issue-to-pull-request workflow. See
[Experimental — `dn sync`](/dn-cli/task-list-and-sync/#dn-sync) for VCS
detection, prerequisites, and the exact Git and Sapling operations.
