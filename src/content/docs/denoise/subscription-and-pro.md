---
title: Subscription & Pro
description: Denoise Pro features, billing, and organization seats.
---

Denoise is free for core planning: offline-first tasks, milestones, focus timer,
and basic cloud sync. **Denoise Pro** unlocks agent-backed automation from the
app UI — task build mode, repository initialization, and dn workflow dispatch on
GitHub-linked milestones.

## What Pro includes

Pro turns denoise into a command center for shipping work:

- **Task build mode** — Plan implementation in one place, align with your team,
  and kick off builds without leaving the task.
- **Richer collaboration** — Shared context around milestones and tasks so
  everyone sees the same picture.
- **Automation and integrations** — Included in your subscription as new
  productivity features ship (for example milestone Initialize panel actions and
  per-task kickstart dispatch).
- **Priority consideration** — Feedback and early access to new productivity
  features.

Pro is required for GitHub-backed automation from the app: installing workflow
templates, running `dn.init_stack`, and starting build mode on tasks. See
[GitHub integration](/denoise/github-integration/) for setup steps.

## Manage your plan

1. Sign in with GitHub or Google.
2. Open **Settings** (profile menu).
3. Under **Plan & billing**, view your current plan or upgrade.

After Stripe Checkout, the app polls until billing status updates (webhooks can
lag briefly). A success toast confirms when Pro is active.

## Organization and Enterprise

If your account belongs to an organization with managed seats, Pro access may
come from an assigned seat rather than a personal subscription. Organization
admins see an **Organization** section in Settings to manage members and seat
assignments.

For repository automation prerequisites (workflows, secrets, milestone linking),
see [GitHub integration](/denoise/github-integration/) and
[Authentication](/denoise/authentication/).

## Related pages

- [Features](/denoise/features/) — Tasks, milestones, collaboration
- [GitHub integration](/denoise/github-integration/) — Link milestones,
  Initialize panel, build mode
- [Tips & troubleshooting](/denoise/tips-troubleshooting/) — When Pro-gated
  actions are disabled
