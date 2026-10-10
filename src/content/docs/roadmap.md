---
title: Roadmap
description: Public denoise and dn themes — shipped, in progress, and planned — without unverified dates.
---

This page groups public product themes for denoise and **dn**. Status labels
describe direction, not a calendar. For a specific shipped release, start with
[What's new](/whats-new/dn-0-0-37/).

## Shipped

- **dn CLI and SDK** — Issue planning and implementation (`meld` / `loop` /
  `land`), GitHub workflows, and headless dispatch. See
  [Completing GitHub Issues](/dn/completing-github-issues/) and
  [Headless Use](/dn/headless-use/).
- **denoise Pro** — Collaborative Roadmap, milestones, GitHub sync, and
  kickstart from the app. See [Getting started](/denoise/getting-started/) and
  [Subscription & Pro](/denoise/subscription-and-pro/).
- **The Void** — Free solo task list with local `~/.dn/tasks/` sync. See
  [The Void](/denoise/void/).
- **Developer device runners** — Pair a trusted checkout for Void task-sync and
  typed kickstart on local compute. See [Runners](/denoise/device-runners/).
- **Hosted kickstart runtimes** — GitHub Actions (default) and exe.dev when
  configured, plus paired devices. Cursor Cloud remains a CLI-only path
  (`dn kickstart --cursor-cloud`). See
  [Kickstart runtimes](/denoise/kickstart-runtimes/).
- **Published dn container images** — Harness-tagged images for automation
  environments (dn-images `v0.0.2`; CLI recommended at `0.0.52`). See
  [dn 0.0.37 and developer device runners](/whats-new/dn-0-0-37/).

## In progress

- **Device-runner production hardening** — Broader enablement, operator polish,
  and continued smoke coverage beyond the default GitHub Actions path.
- **Kickstart runtime clarity** — Clearer preflight reasons and progress
  fidelity across hosted and device paths.

## Planned

### On-premises and regulated environments

We are building a deployment system for running the full denoise ecosystem
**on-premises** and in **regulated environments** — organizations that cannot
rely on SaaS defaults for data residency, network boundaries, or compliance
controls.

The goal is a cohesive install path for teams that need denoise and **dn**
running inside their own perimeter:

- **On-prem hosting** — Run denoise, agent orchestration, and supporting
  services on infrastructure you control rather than shared cloud tenants.
- **Regulated workflows** — Patterns for auditability, access control, and
  keeping issue context, plans, and agent artifacts within approved boundaries.
- **Integrated stack** — Align self-hosted runners, GitHub (or GitHub
  Enterprise), authentication, and repository agent context into one documented
  topology.
- **Unified LLM interface** — A single integration surface for agent harnesses
  to reach approved models on-prem or through your gateway, without locking
  workflows to one vendor or API shape.

Pieces of this story already exist — for example
[Self-hosted runners](/operations/self-hosted-runners/) for GitHub Actions and
local **dn** usage against your repositories. The coming system ties those
pieces into a single on-prem and compliance-oriented deployment guide.

If you are evaluating denoise for a regulated or air-gapped environment, reach
out through your denoise contact channel with your constraints — that feedback
shapes what ships first.

## Related

- [What's new — dn 0.0.37](/whats-new/dn-0-0-37/)
- [Introduction](/introduction/)
