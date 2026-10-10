---
title: Runner logs
description: Find serve and kickstart logs for a paired device, an exe.dev VM, and denoise.cloud.
---

Use this page when a Kickstart job stays queued, never shows phases, or you need
the runner’s stdout rather than the task progress panel. Device runners and
exe.dev runners share the same job queue: Denoise stores the job;
`dn runner
serve` heartbeats, claims, clones (exe.dev) or uses a registered
checkout (device), then posts NDJSON progress.

The Kickstart panel is phases from that progress ingest. It is not a full agent
dump.

User-facing enroll and recovery: [Enroll runners](/runners/device-runners/). Runtime
picker behavior: [Kickstart runtimes](/runners/kickstart-runtimes/).

## Identify the hop

Split **invocation** (`kickstart_invocations.status`), **job**
(`device_runner_jobs.state`), and **runner** (`last_seen_at`, VM name). Claims
are per `runner_id`. Host `POST /api/runners/jobs/claim` traffic from a laptop
is not the exe.dev pet.

| Symptom                              | First log                                                         |
| ------------------------------------ | ----------------------------------------------------------------- |
| Device **Offline**                   | Laptop `runner.log` / `journalctl`, then `dn runner doctor`       |
| exe.dev **Offline**, VM still listed | `make exe_dev_status VM=<vm>` then `make exe_dev_journal VM=<vm>` |
| exe.dev **Needs setup**, no VM name  | Pet gone from `ls`; Create VM in **Runners**                      |
| Queued, no phases, fresh heartbeat   | Serve is up but not claiming this `runner_id`                     |
| Running, no phases                   | `github-token`, clone, or progress POST                           |

Queued jobs expire after 24 hours. Offline is 90 seconds without a heartbeat.

## Paired device (laptop)

The user service is launchd on macOS or systemd on Linux. Do not run
`dn runner serve` while that service is already running.

```bash
dn runner doctor
dn runner status

# Tail the service log (macOS log file, Linux user journal)
dn runner logs
dn runner logs --follow
```

`dn runner logs` is the fastest path to serve stdout. When you need the raw
files instead:

```bash
# macOS (launchd)
tail -f ~/.dn/runner/runner.log
tail -f ~/.dn/runner/runner.error.log

# Linux (systemd user unit)
journalctl --user -u denoise-runner.service -f

# Foreground diagnostic loop
dn runner stop
dn runner serve
```

State lives under `~/.dn/runner/` (`credential.json`, `config.json`, logs).
Return to the background loop with `dn runner start`. After upgrading `dn`, run
`dn runner install` so the unit file uses the current binary.

Hung macOS processes (kickstart or Deno not exiting):
[Hung process triage](/operations/hung-process-triage/).

## exe.dev VM

The Denoise-stored `EXE_TOKEN` can run `new`, `ls`, and `rm` only. It cannot
SSH. Use an exe.dev account that owns the pet.

New images boot systemd as PID 1. Serve is the linger user unit
`denoise-runner.service`, same as a Linux laptop. Prefer systemd over `ps`. From
the denoise repo:

```bash
make exe_dev_ls
make exe_dev_status VM=<vmName>
make exe_dev_journal VM=<vmName>
JOURNAL_FOLLOW=1 make exe_dev_journal VM=<vmName>
make exe_dev_failed VM=<vmName>
make exe_dev_doctor VM=<vmName>
make exe_dev_serve VM=<vmName>
```

Those targets set `XDG_RUNTIME_DIR` so non-login SSH can reach the user bus.
Without it, `systemctl --user` fails with “Failed to connect to bus”.

Raw one-shot SSH (do not use `ssh exe.dev ssh VM -- cmd`; `--` is passed to
bash):

```bash
ssh exe.dev ls
ssh <vmName>.exe.xyz 'systemctl is-system-running'
ssh <vmName>.exe.xyz 'cat /proc/1/cmdline' | tr '\0' ' '; echo
ssh <vmName>.exe.xyz 'systemctl --failed --no-pager'
ssh <vmName>.exe.xyz 'export XDG_RUNTIME_DIR=/run/user/$(id -u); export DBUS_SESSION_BUS_ADDRESS=unix:path=$XDG_RUNTIME_DIR/bus; systemctl --user status denoise-runner.service --no-pager -l'
ssh <vmName>.exe.xyz 'export XDG_RUNTIME_DIR=/run/user/$(id -u); export DBUS_SESSION_BUS_ADDRESS=unix:path=$XDG_RUNTIME_DIR/bus; journalctl --user -u denoise-runner.service -n 80 --no-pager'
ssh <vmName>.exe.xyz 'export XDG_RUNTIME_DIR=/run/user/$(id -u); export DBUS_SESSION_BUS_ADDRESS=unix:path=$XDG_RUNTIME_DIR/bus; dn runner doctor'
```

Login user is `dn`. PID 1 `exe-init` is the old image: Create VM after the
systemd image is published. `/tmp/dn-runner.log` exists only on the nohup
fallback. `~/.dn/runner/runner.log` is the laptop LaunchAgent path. If
`last_seen_at` is stale and `ls` still lists the pet, serve is not looping.

## denoise.cloud (contributors)

Production storage is PlanetScale via the denoise container `DATABASE_URL`. Do
not query baltimore’s empty compose Postgres. Do not dump `secretsCipher`,
`EXE_TOKEN`, GitHub tokens, or harness keys.

```bash
PROD_LOGS_TAIL=8000 make prod_logs | grep -E '<dispatch_id>|github.dispatch POST|github-token|/lease|/progress'
```

UI polling `GET /api/github/dispatch/<dispatch_id>` every few seconds with no
`github-token`, `lease`, or `progress` means the job is still queued or stuck
before kickstart spawn.

For a stuck exe.dev job, copy a read-only query script onto the denoise
container and run it with that container’s `DATABASE_URL`. The
`.cursor/skills/exe-dev-kickstart/` skill in the denoise repo has the hop map
and query shape.

Do not add `CHECK=` runbook targets unless you intend to keep them.

## Related

- [Runners overview](/runners/overview/)
- [Enroll runners](/runners/device-runners/)
- [Kickstart runtimes](/runners/kickstart-runtimes/)
- [Self-hosted GitHub Actions runners](/runners/self-hosted-runners/)
- [Hung process triage](/operations/hung-process-triage/)
