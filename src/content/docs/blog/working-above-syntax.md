---
title: Working Above Syntax
description: Kickstart at four altitudes — you run it, one agent runs it, you bring the harness that fits (including background agents and device runners), and denoise makes the factory multiplayer.
---

# Working Above Syntax

To deliver on the value proposition of denoise, it has to be concrete how we're
saving you time or money. Depending on who you ask, AI is a nice convenience or
a substantial force multiplayer. We look at a user's ability to be productive
with the `dn` CLI as three levels of maturity. `dn kickstart` creates the
smallest unit of progress when attempting to measure productivity. Another great
lens for understanding productivity with `dn` is "Who is using it?" You, your
harness, your team? We want to create a toolkit that gives each of those answers
the easiest path to create multiplicative force.

## You use the CLI

You type `dn kickstart`. The coding agent still writes the patch; you are the
dispatcher.

```bash
dn kickstart https://github.com/owner/repo/issues/123
```

You are encouraged to plan upfront exhaustively and then "land the plane" with
kickstart. Using the CLI, you can steer the prompt & add additional filesystem
context, but `dn` mostly knows what to do with a github issue to create an
auditable plan and see it through, whether that's making changes against the
local workspace, or creating a pull request on your behalf.

It's useful to look at `dn kickstart` as a dice roll you do your best to cheat.
The more you orient your git repo to include filesystem context useful to the
agent, and the more you write direct, detailed plans in github issues, the more
you are short circuiting the work you would traditionally spend most of your
time on as a software develper.

`dn` enables this workflow to be harnesss & model agnostic, giving software
developers a tool they can adopt and see immediate productivity benefits with.
If you use github at your job, you will burn your assigned backlog down faster,
or else you've already created a system for yourself that `dn` puts in the
background for you.

## Your agent uses the CLI

Same command. The harness is the dispatcher. There is no `dn skill` subcommand —
install the skill into the tool you already use:

```bash
dn init agents --skill --agent <codex|claude|opencode|cursor>
```

That writes a skill the harness can load (for example
`.agents/skills/dn/SKILL.md`, `.claude/skills/dn/SKILL.md`, or
`.cursor/skills/dn/SKILL.md`). You stay in the conversation and name the issue. The
skill runs `kickstart`, or `loop` when the plan already exists. Per-harness
setup is in the [cookbooks](/cookbooks/overview/).

**Off your plate:** leaving the editor to type kickstart; teaching the harness
the workflow each session.

**Time back on:** stay in Cursor, Claude Code, or Codex; review the result
instead of driving argv.

One human, one session, one harness still starts the work. You are still paying
interactive-session time on whichever model that harness uses.

## Your harness uses the CLI

If you use a non-editor harness such as Cursor Agent Mode, Codex desktop, or
many others at this point, using `dn` as an agent tool will feel very natural.

Level 2 still ties kickstart to one interactive harness. Level 3 is when you
bring the harness that fits the task and let work run in the background. The CLI
plus `plans/` is what makes that switch possible; the point is not the files, it
is the spend.

**Right model for the task.** Install the skill (or pass `--agent`) in more than
one tool. Use a stronger, usually costlier, harness for a hard `kickstart`.
`loop` the same plan in a lighter harness. Use `until` when the job is a goal
gate, not a ticket — a bounded generator/verifier, not “one issue, one
kickstart.” You stop paying frontier-interactive rates for work that does not
need them.

## Your team of agents uses the CLI

**Background agents.** You are not in the chat. `dn init workflows` installs the
canonical GitHub Actions templates. Scheduled
[`dn.daily_kickstart`](/dn/scheduled-workflows/) runs
`kickstart --publish pr --milestone … --once` against a committed queue.
[`dn.todo_loop`](/dn/scheduled-workflows/#todo-loop-dntodo_loop) runs `loop` on
a standing plan. `dn until` ticks a goal without a human between generator and
gate. `dn.kickstart_issue` is the on-demand dispatch of the same kickstart.

**Device runners save money.** Pair a Mac or Linux machine you already have.
Kickstart uses [local compute](/denoise/device-runners/) and the harness login
already on that device. Hosted runners — GitHub Actions minutes or an
[exe.dev runner you connected](/denoise/kickstart-runtimes/) — bill a VM per
job. A device runner keeps that spend on the laptop and subscription you already
run. Denoise does not invent a price for either path; it lets you choose.

**Off your plate:** sitting in one vendor session for every ticket; using the
same expensive model for kickstart and for a routine `loop`; watching a goal
loop; paying hosted runtime rates when a paired device can run kickstart;
draining a milestone queue only from your afternoon.

**Time and money back on:** match harness to difficulty; background kickstart /
loop / until while you do something else; runner jobs on local compute instead
of cloud VMs.

## The multiplayer software factory

After you can pick harnesses and runners, the bottleneck is who is allowed to
sit above syntax. A CLI, a skill, and a pairing flow still assume someone who
lives in those tools.

denoise puts **Kickstart!** on a shared Roadmap: milestones, GitHub-linked
tasks, collaborators, and a runtime picker — including device runners — for the
callers that actually run `dn kickstart`. See
[Getting started](/denoise/getting-started/), [Features](/denoise/features/),
and [Milestone details](/denoise/milestone-details/).

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
