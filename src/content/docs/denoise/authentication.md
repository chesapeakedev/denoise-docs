---
title: Authentication
description: GitHub sign-in, the subscription gate, repository access, and the sync badge.
---

Unauthenticated visitors to denoise.cloud are redirected to the **subscription
page** (`/` and `/subscribe`). Users with Denoise Pro (or an org seat) go
straight into the app. For the Free vs Pro product choice and first-task
walkthrough, see [Getting started](/denoise/getting-started/).

All denoise subscriptions are tied to a GitHub account. Creating an account,
starting a trial, or opening a Team organization requires GitHub authentication.

## Options on the subscription page

From the subscription page you can:

- **Sign in** at the top of the page to open an existing Pro account.
- Start a free Pro trial (the recommended option on the page).
- Create a **Team** account — that creates an organization you can add users to
  (includes 6 seats). See [Subscription & Pro](/denoise/subscription-and-pro/)
  for plan details and live pricing.
- **Continue in The Void** for free solo use without a denoise subscription.

Sign-in starts GitHub-only OAuth (`flow=oauth_only`, with an account picker when
you need to switch accounts). After GitHub finishes, you return to the app with
a session cookie validated by the server. A trial counts as Pro for workbench
access.

Auth cookies are shared across denoise.cloud and void.denoise.cloud, so the same
session works on both hosts.

The only free product surface without a subscription is
[The Void](/denoise/void/) — a solo task list with local `~/.dn/tasks/` sync,
not the denoise workspace, milestones, or team collaboration. Open it from
**Continue in The Void**, or go directly to
[void.denoise.cloud](https://void.denoise.cloud).

## GitHub App and repository access

GitHub sign-in is required for
[GitHub integration](/denoise/github-integration/) — linking milestones, syncing
issues, converting tasks to issues, and dn workflow dispatch.

Sign-in uses a **GitHub App** (user-to-server). On first sign-in you may see
GitHub’s app installation or authorization screen, depending on how denoise is
deployed. You choose which repositories and organizations denoise can access.

After sign-in, manage access from **Profile** (click the avatar in the header):

| Action                  | When to use                                                                                                  |
| ----------------------- | ------------------------------------------------------------------------------------------------------------ |
| **Switch Accounts**     | Use a different GitHub account.                                                                              |
| **Update repos & orgs** | Open GitHub to choose which repos and orgs denoise can access for milestones, issues, and workflow dispatch. |

![GitHub account access and repo setup checklist in Profile](../../../assets/screenshots/account-github-settings.png)

When GitHub is connected, the same card includes a **Repo setup checklist for dn
actions**: pair a runner or install workflows from a linked milestone, add the
Actions secret for that agent when you use GitHub Actions, then kickstart once a
runner shows Ready.

You can also review installations at
[github.com/settings/installations](https://github.com/settings/installations).

Repository access must include any repo you link to a milestone. If linking or
sync fails with a permissions error, use **Update repos & orgs** and confirm the
target repository is granted access.

## Sync badge

The header shows a sync badge (**Offline**, **Online**, or **Syncing…**). It is
view-only and reports whether the app is connected to the server — it does not
turn sync on or off.

| State        | Meaning                      |
| ------------ | ---------------------------- |
| **Offline**  | Not connected to the server. |
| **Syncing…** | Connecting to the server.    |
| **Online**   | Connected to the server.     |

![Header while signed in with Online sync badge](../../../assets/screenshots/header-signed-in.png)

When you are signed in with Pro (or an org seat) and the badge shows **Online**:

- **Milestone sync** — Milestones (create, update, delete, share) sync to the
  server and are available on other devices and to collaborators.
- **Todo sync** — Todos for the current milestone sync in real time. Data is
  stored in the cloud (Deno KV) and keyed by your user id or milestone id.

When the badge shows **Offline**, that browser session has no server connection.
Collaboration, GitHub-backed automation, and cross-device sync need **Online**;
the status will only be offline if you have lost internet connection or the
denoise servers are down.

## Summary

| Access                        | What you get                                                    |
| ----------------------------- | --------------------------------------------------------------- |
| Not signed in / no Pro        | Subscription page; **Continue in The Void** for free solo tasks |
| Signed in + Pro + **Online**  | Full sync: milestones and todos, multi-device and collaboration |
| Signed in + Pro + **Offline** | Local only; no server                                           |

## Related

- [Getting started](/denoise/getting-started/) — product choice and first task
- [Subscription & Pro](/denoise/subscription-and-pro/) — Free vs Pro vs Team
- [The Void](/denoise/void/) — free solo tasks without a denoise subscription
- [GitHub integration](/denoise/github-integration/) — milestones, issues, and
  workflow dispatch
