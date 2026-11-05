---
title: Denoise Personal
description: Free solo task list that syncs to your paired laptop via dn. No cloud todo store and no milestones.
---

**Denoise Personal** is the free solo product at
[personal.denoise.cloud](https://personal.denoise.cloud) (also served at
`/personal` on the denoise host; `/void` redirects during cutover). It is a fast
task list for personal work that stays on your paired laptop. Denoise does not
keep a long-term cloud todo store for free tasks, and Denoise Personal has no
milestones or shared workspace.

Use Denoise Personal when you want local tasks and optional `dn` kickstart on
your own machine. Use the [denoise team app](/denoise/getting-started/) (Denoise
Pro) when you need milestones, GitHub-backed planning, and shared workspace
features.

## What Denoise Personal includes

- **Local tasks** — Create and edit tasks in the browser; with a paired device
  runner they persist in `~/.dn/todo.md` on that laptop (native task blocks;
  kickstart queue lines stay device-local).
- **Device pairing** — Pair one free-plan runner (Pro allows more) so tasks
  relay through denoise as short-lived envelopes, then land on disk via
  task-sync.
- **Ticketless kickstart** — Run kickstart from a local task document with
  `dn kickstart --denoise-task` and `publish: "none"` (no GitHub issue required
  for free Denoise Personal work), or dispatch it from the browser Runners panel
  to a paired runner with publish `none`, `pr`, or `direct`.
- **Sign-in** — GitHub or Google auth is shared with denoise on
  `.denoise.cloud`. Denoise Personal itself has no subscribe funnel.

Pro-gated in Denoise Personal:

- Importing or closing GitHub issues from Denoise Personal requires Denoise Pro.

## Free vs Pro vs team

| Product                     | Who it is for                    | What you get                                                                   |
| --------------------------- | -------------------------------- | ------------------------------------------------------------------------------ |
| **Denoise Personal** (Free) | Solo local tasks                 | Personal SPA, `~/.dn/todo.md` task-sync, 1 device runner, ticketless kickstart |
| **denoise** (Denoise Pro)   | Team planning and GitHub handoff | Workspace, milestones, cloud sync, kickstart from the app, up to 10 runners    |
| **Denoise Team**            | Teams with shared billing        | Same denoise app; Pro access via org seat; orgs & shared billing               |

Signing in at denoise.cloud without Pro lands on `/subscribe`. The gate offers
**Continue in Denoise Personal** for solo use. See
[Subscription & Pro](/denoise/subscription-and-pro/).

## Pair a device for local sync

1. Open Denoise Personal and use **Devices**, or open denoise **Profile** →
   **Runners** and select a GitHub-linked milestone, to create a pairing code.
   Pairing binds the device to your account, not to a repository.
2. On the laptop, run:

   ```bash
   dn runner connect <code> --install --name "Alex's MacBook Pro"
   ```

3. Approve the pairing in the browser.
4. Confirm sync status in Denoise Personal — when a runner is online, native
   tasks persist in `~/.dn/todo.md` on that device. Choose a registered checkout
   in the runner panel before you queue kickstart work.

Inspect local tasks without the network:

```bash
dn task list
dn task show <id> --json
```

This file holds both Denoise Personal native tasks and the kickstart queue.
Task-sync to the browser includes **native tasks only**; queue lines are not
uploaded to Denoise Personal. See [Runners](/runners/device-runners/).

## Adding and managing tasks

1. Type a title in the task input (or paste a GitHub issue URL if you have Pro).
2. Add the task.
3. Complete, edit, or delete from the list. GitHub-linked tasks may offer Done
   vs Delete when Pro import is available.

Without a paired runner, tasks still work in the browser session; pair a device
to persist native tasks in `~/.dn/todo.md` and to run local kickstart.

## Kickstart from a local task

With a paired runner and a task document on disk:

```bash
dn kickstart --denoise-task <task-id> --publish none
```

Free Denoise Personal kickstart uses `publish: "none"` because there is no
GitHub issue to open a PR against. For Pro kickstart from GitHub-linked
milestones in the team app, see
[Milestone details](/denoise/milestone-details/).

## Related pages

- [Getting started](/denoise/getting-started/) — denoise team app layout and
  first milestone
- [Subscription & Pro](/denoise/subscription-and-pro/) — Free Denoise Personal
  vs Pro vs Team
- [Runners](/runners/device-runners/) — pairing, task-sync, and runner limits
- [Features](/denoise/features/) — Workspace, milestones, and Pro automation in
  denoise
