---
title: Kickstart runtimes
description: Kickstart picks a runner — GitHub Actions, a paired device, or exe.dev — not a parallel runtime type.
---

When you click **Kickstart** on a task, denoise asks **which runner** should
execute. Every choice is an enrolled runner with a provider. Denoise does
**not** run kickstart on the denoise application host.

Enroll runners in the milestone **Runners** dialog. See
[Runners](/denoise/device-runners/) for pairing a device, installing GitHub
Actions workflows, and connecting exe.dev.

## Supported runners

| Provider       | Where it runs                                           | Progress                          | Prerequisites                                                                       |
| -------------- | ------------------------------------------------------- | --------------------------------- | ----------------------------------------------------------------------------------- |
| GitHub Actions | Planning repo workflows                                 | HTTP if base URL set; else coarse | Installed `dn` workflows; agent repository secrets                                  |
| Device         | Paired macOS or Linux checkout                          | NDJSON via the device job API     | Paired device; registered execution checkout                                        |
| exe.dev        | Persistent VM from `ghcr.io/chesapeakedev/dn:<harness>` | NDJSON via the same job API       | Connected `EXE_TOKEN` (`new`, `ls`, `rm`); harness key; reachable progress base URL |

Preflight availability is listed at `GET /api/kickstart/runtimes?owner=&repo=`
and shown in the confirm dialog. Unavailable options stay visible with a short
reason. Kickstart chooses an affinity. exe.dev VMs are a pool: a queued
Kickstart can be claimed by any of your exe.dev VMs (same account, same personal
or org scope). Paired devices are not a pool — hardware and checkouts differ, so
those jobs stay on the device you picked. Land and sync always stay on the
runner they were queued for.

Device and exe.dev cards use the same badges: **Ready**, **Busy**, **Offline**,
**Needs setup**. A runner is **Offline** when Denoise has not heard a heartbeat
for 90 seconds. Kickstart still queues for up to 24 hours. A deleted exe.dev pet
is **Needs setup**, not Offline — Create VM so serve can pick up a queued
Kickstart. Do not Kickstart again.

CLI Docker (`dn kickstart --sandbox docker`) is local isolation on a machine you
already have. It is not a denoise runner. Cursor Cloud is not in the public
chooser; it remains a CLI-only path (`dn kickstart --cursor-cloud`).

## Progress fidelity

- **Detailed** — Phase and step events stream into the task progress panel.
  Leave-local kickstart uses **Resolve → Plan → Implement → Lint**
  (`dn ensure
  lint`). Publish is not part of that job; Land then Sync own
  commit and trunk. See [Kickstart, land, sync, and done](/close-out/).
- **Coarse** — Queued / running / succeeded / failed only. Common for GitHub
  Actions when the denoise deploy has no public `KICKSTART_PROGRESS_BASE_URL`.
  Land and Sync on a device runner are coarse.

Device and exe.dev kickstart both post NDJSON on the job progress route. Shared
HTTP bootstrap (GitHub Actions) details:
[Progress reporting](/dn/progress-reporting/).

The Kickstart panel is phases, not a full agent dump. Serve stdout lives on the
runner. See [Runner logs](/operations/runner-logs/).

## Notes

- **GitHub Actions** always publishes a pull request on the planning repository.
- A **device** runner can execute in a different registered checkout. After
  leave-local kickstart, Land and Sync run on that checkout.
- **exe.dev** reuses one [dn-images](https://github.com/chesapeakedev/dn-images)
  VM. The VM clones the execution repo at claim time and runs kickstart inside
  the image with `--publish pr`. Denoise does not keep a launcher checkout and
  does not call host `dn --sandbox exe.dev`. Disconnect destroys the VM.
- Historical runs may still show a legacy `local` or `cloud_vm` source label in
  progress history; new dispatches reject `local`.

## Related

- [Runners](/denoise/device-runners/)
- [Runner logs](/operations/runner-logs/)
- [Milestone details — Kickstart a task](/denoise/milestone-details/#kickstart-a-task)
- [Kickstart, land, sync, and done](/close-out/)
- [Sandbox execution](/dn/sandbox/)
- [Headless Use](/dn/headless-use/)
