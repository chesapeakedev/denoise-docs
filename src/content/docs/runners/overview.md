---
title: Overview
description: Use dn and denoise with enrolled device, GitHub Actions, or exe.dev compute for kickstart, land, and sync.
---

A runner is compute you enroll so `dn` and your agent harness can work against
a GitHub repository. Denoise does not run kickstart on the application host.
You enroll a runner once, then pick it from **Kickstart** and the milestone
**Runners** dialog.

Use the provider table and Where to go next links to choose device, GitHub
Actions, or exe.dev. Pairing, progress in the task panel, and workflow setup are
on those pages. For device and exe.dev operation, see
[Enroll runners](/runners/device-runners/) and
[Kickstart runtimes](/runners/kickstart-runtimes/).

## Providers at a glance

| Provider       | Where it runs                         | Typical use                                      |
| -------------- | ------------------------------------- | ------------------------------------------------ |
| Device         | Paired macOS or Linux machine         | Leave-local kickstart, land, sync, Void task-sync |
| GitHub Actions | Planning repository workflows       | PR publish without keeping a laptop online       |
| exe.dev        | Persistent VM from dn-images          | Hosted kickstart with `--publish pr`             |

Denoise never silently moves a job to another runner. Unavailable runners stay
visible with a reason. Docker (`dn kickstart --sandbox docker`) is isolation on
a machine you already have — not an enrolled runner. See
[Sandbox execution](/dn/sandbox/).

Pairing a device binds it to your signed-in account, not to one milestone.
GitHub Actions is scoped to the planning repository. exe.dev is account-scoped
like a device and counts toward the same runner limit — see
[Subscription & Pro](/denoise/subscription-and-pro/). GitHub Actions does not
consume that slot.

Requires dn 0.0.52 or newer on paired devices. Release history:
[dn 0.0.37 and developer device runners](/whats-new/dn-0-0-37/).

## What runners do

Device runners accept kickstart jobs, land jobs on the registered checkout,
sync jobs (trunk quality gate on that checkout), denoise-task jobs, and
task-sync (Void ↔ `~/.dn/tasks/` relay). They do not run arbitrary shell
commands or unrelated GitHub Actions workflows.

Kickstart → Land → Sync → Done matches the close-out flow in denoise and the
CLI. See [Kickstart, land, sync, and done](/close-out/). Void task-sync is
unrelated to trunk Sync.

When you click **Kickstart**, denoise asks which enrolled runner should
execute. Preflight availability, progress fidelity, and exe.dev pooling are on
[Kickstart runtimes](/runners/kickstart-runtimes/).

## Where to go next

| Goal | Page |
| ---- | ---- |
| Pair a laptop, connect exe.dev, install Actions workflows | [Enroll runners](/runners/device-runners/) |
| Choose a runner, progress fidelity, and the task panel | [Kickstart runtimes](/runners/kickstart-runtimes/) |
| Install `dn` workflows and repository dispatch | [Headless setup](/runners/headless-use/) |
| `GITHUB_TOKEN` and API access for Actions | [GitHub token setup](/runners/github-token-setup/) |
| Daily kickstart and todo loop on a schedule | [Scheduled workflows](/runners/scheduled-workflows/) |
| Serve stdout when jobs queue or stall | [Runner logs](/runners/runner-logs/) |
| Run `dn` workflows on your own GitHub Actions hardware | [Self-hosted runners](/runners/self-hosted-runners/) |
| Low-power always-on device | [Raspberry Pi runner](/runners/raspberry-pi-runner/) |

Related: [The Void](/denoise/void/) (local task-sync), [Milestone details](/denoise/milestone-details/),
[GitHub integration](/denoise/github-integration/), [Subscription & Pro](/denoise/subscription-and-pro/)
(runner limits).
