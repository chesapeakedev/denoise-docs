---
title: Working Above Syntax
description: Kickstart at four altitudes — you run it, one agent runs it, you bring the harness that fits (including background agents and device runners), and denoise makes the factory multiplayer.
---

Agents still edit files. The expensive work is starting and steering that work —
in time, and in model and runtime spend. `dn kickstart` is the unit of progress:
an issue or a local spec in, a plan plus an implementation out. Maturity is who
can share that command — you, one harness, then the harness and runtime that
fit the job, then the rest of the team in denoise.

`dn loop` and `dn until` appear when kickstart is not the whole story: resume a
plan another caller already started, or chase a goal with a generator and a
verifier instead of one ticket.

This page is an operator map, not a command reference. Setup and flags live on
[Completing GitHub Issues](/dn/completing-github-issues/), the
[cookbooks](/cookbooks/overview/), and
[Scheduled Workflows](/dn/scheduled-workflows/).

## You use the CLI

You type `dn kickstart`. The coding agent still writes the patch; you are the
dispatcher.

```bash
dn kickstart 123
dn kickstart --awp https://github.com/owner/repo/issues/123
dn kickstart docs/spec.md
```

Kickstart against a GitHub issue, pass `--awp` when the run should open a pull
request, or point it at a local markdown spec. If the first pass is incomplete,
`dn loop` continues the plan kickstart wrote instead of re-explaining the task.

**Off your plate:** restating “plan then implement this issue” in chat;
rebuilding context for the same ticket; driving the editor through an
undocumented sequence.

**Time back on:** one command instead of a long prompt; a durable plan under
`plans/` you can `loop`.

You still start every run.

## Your agent uses the CLI

Same command. The harness is the dispatcher. There is no `dn skill` subcommand —
install the skill into the tool you already use:

```bash
dn init agents --skill --agent <codex|claude|opencode|cursor>
```

That writes a skill or rule the harness can load (for example
`.agents/skills/dn/SKILL.md`, `.claude/skills/dn/SKILL.md`, or
`.cursor/rules/dn.mdc`). You stay in the conversation and name the issue. The
skill runs `kickstart`, or `loop` when the plan already exists. Per-harness
setup is in the [cookbooks](/cookbooks/overview/).

**Off your plate:** leaving the editor to type kickstart; teaching the harness
the workflow each session.

**Time back on:** stay in Cursor, Claude Code, or Codex; review the result
instead of driving argv.

One human, one session, one harness still starts the work. You are still paying
interactive-session time on whichever model that harness uses.

## Bring your own harness

Level 2 still ties kickstart to one interactive harness. Level 3 is when you
bring the harness that fits the task and let work run in the background. The
CLI plus `plans/` is what makes that switch possible; the point is not the
files, it is the spend.

**Right model for the task.** Install the skill (or pass `--agent`) in more than
one tool. Use a stronger, usually costlier, harness for a hard `kickstart`.
`loop` the same plan in a lighter harness. Use `until` when the job is a goal
gate, not a ticket — a bounded generator/verifier, not “one issue, one
kickstart.” You stop paying frontier-interactive rates for work that does not
need them.

**Background agents.** You are not in the chat. `dn init workflows` installs the
canonical GitHub Actions templates. Scheduled
[`dn.daily_kickstart`](/dn/scheduled-workflows/) runs
`kickstart --publish pr --milestone … --once` against a committed queue.
[`dn.todo_loop`](/dn/scheduled-workflows/#todo-loop-dntodo_loop) runs `loop` on
a standing plan. `dn until` ticks a goal without a human between generator and
gate. `dn.kickstart_issue` is the on-demand dispatch of the same kickstart.

**Device runners save money.** Pair a Mac or Linux machine you already have.
Kickstart uses [local compute](/denoise/device-runners/) and the harness login
already on that device. Hosted kickstart runtimes — GitHub Actions minutes,
Cursor Cloud, exe.dev — bill a VM per job. A
[device runner](/denoise/kickstart-runtimes/) keeps that spend on the laptop and
subscription you already run. Denoise does not invent a price for either path;
it lets you choose.

**Off your plate:** sitting in one vendor session for every ticket; using the
same expensive model for kickstart and for a routine `loop`; watching a goal
loop; paying hosted runtime rates when a paired device can run kickstart;
draining a milestone queue only from your afternoon.

**Time and money back on:** match harness to difficulty; background
kickstart / loop / until while you do something else; runner jobs on local
compute instead of cloud VMs.

## denoise makes the factory multiplayer

After you can pick harnesses and runners, the bottleneck is who is allowed to
sit above syntax. A CLI, a skill, and a pairing flow still assume someone who
lives in those tools.

denoise puts **Kickstart!** on a shared Roadmap: milestones, GitHub-linked
tasks, collaborators, and a runtime picker — including device runners — for the
callers that actually run `dn kickstart`. See
[Getting started](/denoise/getting-started/),
[Features](/denoise/features/), and
[Milestone details](/denoise/milestone-details/).

**Off your plate:** translating CLI state for people who do not live in a
harness; only engineers can fire kickstart; work that never becomes visible to
the rest of the team.

**Time back on:** product, design, and other collaborators share the milestone
and start kickstart without cloning the workflow into chat. Background agents
and runners keep running; denoise is how the team operates them together.

### Compute and AI sovereignty

Stanford HAI’s
[AI Sovereignty’s Definitional Dilemma](https://hai.stanford.edu/news/ai-sovereigntys-definitional-dilemma)
describes why this shows up in strategy at all: the stack concentrates in a
handful of model and cloud providers, so organizations want agency over where
inference runs. That piece treats **compute sovereignty** as control over
compute, not a slogan, and sovereignty itself as the capacity to choose and
reconfigure — not a requirement to own every layer.

denoise matches that shape. It does not run kickstart on the application host
([Kickstart runtimes](/denoise/kickstart-runtimes/)). On a
[device runner](/denoise/device-runners/), source, credentials, and compute stay
on the machine you already trust; denoise keeps repository slugs and readiness,
not checkout paths. The high-sovereignty direction is denoise as a coordination
server for a fleet of compute the team owns, using harnesses and models they
already run. Hosted runtimes remain available. You keep the option to
reconfigure.

| Caller | How kickstart shows up | What leaves your plate |
| ------ | ---------------------- | ---------------------- |
| You | `dn kickstart` in a terminal; `loop` if the plan is incomplete | Restating plan-then-implement in chat |
| One harness | Skill runs `kickstart` / `loop` from the conversation | Typing argv; re-teaching the workflow |
| The harness that fits | `--agent`, scheduled `kickstart` / `loop` / `until`, device runners | One interactive model for every job; watching the run; hosted VMs when a laptop can do it |
| The team in denoise | **Kickstart!** on a shared milestone | Only engineers can start work; CLI state as the team’s source of truth |
