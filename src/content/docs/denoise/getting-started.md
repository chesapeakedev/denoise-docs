---
title: Getting started
description: Choose The Void for free solo tasks, or sign in to denoise for team planning.
---

Use this page to choose the right product surface, sign in, and create a first
task. Start here when you are using the app UI rather than the `dn` CLI.

## Choose Free or Pro

| Product | URL | When to use it |
| ------- | --- | -------------- |
| **The Void** (Free) | [void.denoise.cloud](https://void.denoise.cloud) | Solo local tasks that sync to a paired laptop via `dn`. No milestones. |
| **denoise** (Pro) | [denoise.cloud](https://denoise.cloud) | Roadmap, milestones, GitHub sync, shared workspace, and kickstart from the app. |

Signing in at denoise.cloud without Pro lands on `/subscribe`. Choose
**Continue free in The Void** for solo use, or subscribe for the team app. See
[The Void](/denoise/void/) and
[Subscription & Pro](/denoise/subscription-and-pro/).

## App layout (denoise team app)

When you have Denoise Pro (or an org seat), denoise opens to the **Roadmap** —
a project-level view of your milestones. Open a milestone from the roadmap to
manage its tasks on the **milestone view**.

| View               | Route            | When                                    |
| ------------------ | ---------------- | --------------------------------------- |
| **Roadmap**        | `/`              | Default home for Pro / team use         |
| **Milestone view** | `/milestone/:id` | Open a milestone from the roadmap       |
| **Profile**        | `/profile`       | Sign-in, GitHub access, plan, display settings |

![Roadmap view with milestone summary cards, workspace selector, and status filters](../../../assets/screenshots/roadmap.png)

_Roadmap — track milestones and project progress from the app home._

The primary Pro workflow is **New milestone** on the Roadmap → open the
milestone card → **Add task** on the milestone view.

The header shows a sync badge (**Offline**, **Online**, or **Syncing…**). Click
it to enable cloud sync when you are ready. Open **Profile** from the avatar
menu for sign-in and account settings.

## Authentication

The app supports GitHub and Google sign-in:

1. Click **Sign In** in the header.
2. Choose GitHub or Google.
3. Complete the OAuth flow.
4. Return to the app after authentication completes.

![Sign In button in the header](../../../assets/screenshots/sign-in-button.png)

![Header while signed out, showing offline sync badge](../../../assets/screenshots/header-signed-out.png)

After sign-in, the header shows your avatar and an **Online** sync badge when
cloud sync is enabled.

![Header while signed in with Online sync badge](../../../assets/screenshots/header-signed-in.png)

Auth cookies are shared across denoise.cloud and void.denoise.cloud. GitHub
authentication is required for GitHub milestone and issue integration. For
sign-in behavior, repository access, and how the sync badge interacts with
authentication, see [Authentication](/denoise/authentication/).

## Creating your first task

### Free — The Void

1. Open [void.denoise.cloud](https://void.denoise.cloud).
2. Optionally sign in and pair a device runner so tasks land under
   `~/.dn/tasks/` on your laptop.
3. Type a task title and add it.

See [The Void](/denoise/void/) for local sync and ticketless kickstart.

### Pro — denoise Roadmap

On the Roadmap:

1. Click **New milestone**.
2. Enter a name and optional description, then click **Create**.

![Create Milestone dialog](../../../assets/screenshots/create-milestone.png)

3. Open the milestone from the roadmap list.
4. Click **Add task** in the milestone header.

![Milestone header with Add task button](../../../assets/screenshots/milestone-view-first-btn-row.png)

5. Enter a title, optional tags and description, then click **Save**.

![Add task dialog with title, tags, and description](../../../assets/screenshots/milestone-create-task.png)

6. Confirm the task appears in the milestone task list.

Use **Take a tour** on the Roadmap or the header **Help** button to open a
guided tour for your current screen.

![Guided tour highlighting roadmap filters](../../../assets/screenshots/denoise-tour.png)

## Next steps

- Use [The Void](/denoise/void/) for free solo tasks and local `dn` sync.
- Use [Features](/denoise/features/) to learn milestones, collaboration, and
  GitHub sync in the team app.
- Use [GitHub integration](/denoise/github-integration/) when you want to link
  milestones to GitHub issues and dn workflows.
- Use [Milestone details](/denoise/milestone-details/) for DN setup, init_stack,
  and per-task kickstart on GitHub-linked milestones.
- Use [Subscription & Pro](/denoise/subscription-and-pro/) for Free vs Pro vs
  Enterprise.
- Use [Developer device runners](/denoise/device-runners/) when you want Void
  task-sync or Pro kickstart on a trusted local checkout.
