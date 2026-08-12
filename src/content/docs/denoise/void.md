---
title: The Void
description: Free solo task list that syncs to your paired laptop via dn. No cloud todo store and no milestones.
---

**The Void** is the free solo product at
[void.denoise.cloud](https://void.denoise.cloud) (also served at `/void` on the
denoise host). It is a fast task list for personal work that stays on your
paired laptop. Denoise does not keep a long-term cloud todo store for free
tasks, and The Void has no milestones or shared roadmap.

Use The Void when you want local tasks and optional `dn` kickstart on your own
machine. Use the [denoise team app](/denoise/getting-started/) (Denoise Pro)
when you need milestones, GitHub-backed planning, and shared workspace features.

## What The Void includes

- **Local tasks** — Create and edit tasks in the browser; with a paired device
  runner they persist under `~/.dn/tasks/` on that laptop.
- **Device pairing** — Pair one free-plan runner (Pro allows more) so tasks
  relay through denoise as short-lived envelopes, then land on disk via
  task-sync.
- **Ticketless kickstart** — Run kickstart from a local task document with
  `dn kickstart --denoise-task` and `publish: "none"` (no GitHub issue required
  for free Void work).
- **Sign-in** — GitHub or Google auth is shared with denoise on
  `.denoise.cloud`. The Void itself has no subscribe funnel.

Pro-gated in The Void:

- Importing or closing GitHub issues from The Void requires Denoise Pro.

## Free vs Pro vs team

| Product                         | Who it is for                         | What you get                                                                 |
| ------------------------------- | ------------------------------------- | ---------------------------------------------------------------------------- |
| **The Void** (Free)             | Solo local tasks                      | Void SPA, local `~/.dn/tasks/` sync, 1 device runner, ticketless kickstart   |
| **denoise** (Denoise Pro)       | Team planning and GitHub handoff      | Roadmap, milestones, cloud sync, kickstart from the app, up to 10 runners    |
| **Enterprise / org seats**      | Teams with shared billing             | Same denoise app; Pro access via org seat; orgs & shared billing             |

Signing in at denoise.cloud without Pro lands on `/subscribe`. The gate offers
**Continue free in The Void** for solo use. See
[Subscription & Pro](/denoise/subscription-and-pro/).

## Pair a device for local sync

1. Open The Void and use the **Devices** flow (or denoise
   **Settings > Runners**) to create a pairing code.
2. On the laptop, run:

   ```bash
   dn runner connect <code> --install --name "Alex's MacBook Pro"
   ```

3. Approve the pairing in the browser.
4. Confirm sync status in The Void — when a runner is online, tasks persist under
   `~/.dn/tasks/` on that device.

Inspect local tasks without the network:

```bash
dn task list
dn task show <id> --json
```

This store is **not** `dn todo` / `~/.dn/todo.md`. Todo remains the GitHub-issue
and plan-path kickstart queue. For pairing, readiness, and security boundaries,
see [Developer device runners](/denoise/device-runners/).

## Adding and managing tasks

1. Type a title in the task input (or paste a GitHub issue URL if you have Pro).
2. Add the task.
3. Complete, edit, or delete from the list. GitHub-linked tasks may offer Done vs
  Delete when Pro import is available.

Without a paired runner, tasks still work in the browser session; pair a device
to persist them under `~/.dn/tasks/` and to run local kickstart.

## Kickstart from a local task

With a paired runner and a task document on disk:

```bash
dn kickstart --denoise-task ~/.dn/tasks/<id>.json --publish none
```

Free Void kickstart uses `publish: "none"` because there is no GitHub issue to
open a PR against. For Pro kickstart from GitHub-linked milestones in the team
app, see [Milestone details](/denoise/milestone-details/).

## Related pages

- [Getting started](/denoise/getting-started/) — denoise team app layout and
  first milestone
- [Subscription & Pro](/denoise/subscription-and-pro/) — Free Void vs Pro vs
  Enterprise
- [Developer device runners](/denoise/device-runners/) — pairing, task-sync, and
  runner limits
- [Features](/denoise/features/) — Roadmap, milestones, and Pro automation in
  denoise
