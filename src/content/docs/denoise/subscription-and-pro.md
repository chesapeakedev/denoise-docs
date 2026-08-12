---
title: Subscription & Pro
description: Free Void vs Denoise Pro vs Enterprise — what each plan unlocks.
---

**The Void** is free for solo local tasks. **Denoise Pro** unlocks the denoise
team app — milestones, roadmap, GitHub sync, and agent-backed automation from
the UI. Enterprise adds org seats and shared billing.

## Free vs Pro vs Enterprise

| Capability | Free (The Void) | Denoise Pro | Enterprise |
| ---------- | --------------- | ----------- | ---------- |
| Access to The Void | Yes | Yes | Yes |
| Local tasks via paired runner (`~/.dn/tasks/`) | Yes (1 runner) | Yes (up to 10 runners) | Yes (up to 10 runners) |
| Plan in web & handoff to agents | No | Yes | Yes |
| Shared agent & human workspace | No | Yes | Yes |
| Orgs & shared billing | No | No | Yes |

Signing in at denoise.cloud without Pro lands on `/subscribe`. The gate shows
the plan table and **Continue free in The Void** for solo use. The Void host has
no subscribe funnel.

Denoise Pro is about **$6/month** with a trial when Checkout is configured. See
in-app Plan & billing for the live price.

## What Pro includes

Pro turns denoise into a command center for shipping work:

- **Roadmap and milestones** — Collaborative planning with cloud sync (not
  available on Free Void alone).
- **Task kickstart** — Dispatch `dn.kickstart_issue` from a task with
  **Kickstart!** in the task detail dialog; follow progress and pull requests
  from the milestone view. Depending on setup, execution can use GitHub Actions,
  Cursor Cloud, a managed VM, managed local execution, or a paired developer
  device.
- **Richer collaboration** — Shared context around milestones and tasks so
  everyone sees the same picture.
- **Automation and integrations** — DN setup actions on the milestone view and
  per-task kickstart dispatch as features ship.
- **Void GitHub import** — Import or close GitHub issues from The Void (Pro
  required).
- **Priority consideration** — Feedback and early access to new productivity
  features.

Pro is required for GitHub-backed automation from the denoise app: installing
workflow templates, running `dn.init_stack`, kickstart ordering, and
**Kickstart!** on tasks. See [Milestone details](/denoise/milestone-details/)
for setup steps.

## Manage your plan

1. Sign in with GitHub or Google at denoise.cloud.
2. Open **Profile** from the avatar menu (or complete Checkout from
   `/subscribe`).
3. Under **Plan & billing**, view your current plan or upgrade.

![Profile page with Display Settings; Plan & billing appears above this section](../../../assets/screenshots/account-display-settings.png)

After Stripe Checkout, the app polls until billing status updates (webhooks can
lag briefly). A success toast confirms when Pro is active.

## Organization and Enterprise

If your account belongs to an organization with managed seats, Pro access may
come from an assigned seat rather than a personal subscription (`effectivePro`
even when personal status is free). Organization admins see an **Organization**
section in Profile to manage members and seat assignments.

![Organization member and seat management in Profile](../../../assets/screenshots/account-org-management.png)

For repository automation prerequisites (workflows, secrets, milestone linking),
see [GitHub integration](/denoise/github-integration/) and
[Authentication](/denoise/authentication/).

## Related pages

- [The Void](/denoise/void/) — Free solo product and local task sync
- [Features](/denoise/features/) — Tasks, milestones, collaboration
- [Milestone details](/denoise/milestone-details/) — DN setup, init_stack,
  kickstart order, and per-task kickstart
- [GitHub integration](/denoise/github-integration/) — Link milestones and sync
  issues
- [Tips & troubleshooting](/denoise/tips-troubleshooting/) — When Pro-gated
  actions are disabled
