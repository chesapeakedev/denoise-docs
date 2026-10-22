---
title: Roadmap
description: Public plan for denoise and dn — what we intend to build next, in order.
---

This page is the public plan for denoise and **dn**, in the order we intend to
build it. That order can change. For what already shipped, see the
[changelog](/changelog/).

## Multiplayer sessions

Timed collaborative work on a shared milestone — a focused session where the
team claims tickets, edits the goal together, and watches runners finish work
before the clock ends.

- **Lobby and shared clock** — Start or join a session on a milestone with a
  visible countdown everyone sees.
- **Presence and ticket claims** — See who is in the session and which issues
  are claimed.
- **Live editing** — Edit the session goal and issue notes together while the
  session runs.
- **Shared runner view** — Follow kickstart and runner progress for the
  session’s work in one place.
- **Session recap** — Review what landed when the session ends.
- **Voice in existing tools** — Keep voice in Slack, Discord, or Buzz rather
  than an in-app call.
- **Strict mode on a milestone** — Plan in the editor first, then land
  successful kickstarts directly so the team can run many small tasks in
  parallel.

## Jira

Treat GitHub as one tracker next to native milestones and Jira Cloud, so teams
that already plan in Jira can import and kickstart without mirroring every issue
into GitHub.

- **Connect Jira on the same account** — Attach Atlassian credentials to the
  denoise user you already use; Jira is not a separate sign-in.
- **Import an epic as a milestone** — Bring epic children in as todos on a
  denoise milestone, with pull sync for updates.
- **Kickstart without a GitHub mirror** — Dispatch Jira-backed and native tasks
  on the existing kickstart runtimes without creating a GitHub issue first.

Jira Server and Data Center are out of scope for this release.

## Execution graphs

Move past a linear milestone queue so several agents can work a larger body of
tasks with dependencies — goals, runs, handoffs, and a clear view of what is
active versus what is blocked.

- **Dependency-aware work** — Schedule and track work as a graph rather than a
  single ordered checklist.
- **Multi-agent runs and handoffs** — Let agents claim work, publish results,
  and hand off to the next run without collapsing everything into one linear
  loop.
- **Graph visibility** — See the active frontier and what blocks the next step,
  with a path into plans, runs, and re-dispatch.
- **Verified agent commits** — Give repositories a trust path for agent-produced
  changes that does not treat every agent patch like a human pull request.

## On-premises

Self-hosted denoise for teams that need the app, runners, and related hosting
inside infrastructure they control.

- **Self-hosted denoise** — Run the collaborative workspace and orchestration on
  your own hosts rather than shared SaaS tenants.
- **Runners in your perimeter** — Pair local and self-hosted runners with that
  install. [Self-hosted runners](/runners/self-hosted-runners/) for GitHub
  Actions already cover part of this path.
- **Git and package hosting** — Keep repositories and packages on infrastructure
  you operate alongside denoise.
- **Access control and auditability** — Patterns for who can act, what is
  recorded, and how larger installs grow from a small-team deploy.

## Related

- [Changelog](/changelog/) — What already shipped for denoise and **dn**
- [Features](/denoise/features/) — Current denoise product surface
