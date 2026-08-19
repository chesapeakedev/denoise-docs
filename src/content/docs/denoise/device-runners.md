---
title: Runners
description: Enroll a place that can run harness plus dn against a GitHub repository — a paired device, GitHub Actions, or exe.dev.
---

A **runner** is a place that can run an agent harness and `dn` against a GitHub
repository. Denoise does not run kickstart on the application host. You enroll a
runner once, then pick it from **Kickstart!** and the milestone **Runners**
dialog.

Pairing a laptop binds the device to **your signed-in account**, not to a
milestone. GitHub Actions is scoped to the planning repository. An exe.dev
runner is account-scoped like a device and counts toward the same runner limit
(1 on Free, 10 on Denoise Pro).

Requires **dn 0.0.37** or newer on paired devices. See
[dn 0.0.37 and developer device runners](/whats-new/dn-0-0-37/) for current CLI
guidance.

## Providers

| Provider | Where it runs | Enroll | Operations | Credentials |
| --- | --- | --- | --- | --- |
| Device | Paired macOS or Linux machine | Pairing code + `dn runner connect` | Kickstart, land, sync, denoise-task, task-sync | Stay on the device |
| GitHub Actions | Planning repository workflows | Install/update `dn` workflows | Kickstart with `--publish pr` | Repository secrets |
| exe.dev | Ephemeral VM from [dn-images](https://github.com/chesapeakedev/dn-images) | Connect `EXE_TOKEN` in **Runners** | Kickstart with `--publish pr` | Your exe.dev token plus harness keys you connect |

Denoise never silently moves a job from one runner to another. Unavailable
runners stay visible with a reason. Self-hosted GitHub Actions hardware is a
separate advanced path:
[Self-hosted runners](/operations/self-hosted-runners/).

Docker is isolation **on a device or local CLI**, not a runner you enroll. See
[Sandbox execution](/dn/sandbox/).

The rest of this page is the **device** provider: pairing, checkout
registration, land/sync, and the local security boundary. GitHub Actions setup
lives in the **Runners** dialog and
[GitHub integration](/denoise/github-integration/). exe.dev enroll is Connect
token in the same dialog. Kickstart! picks among enrolled runners — see
[Kickstart runtimes](/denoise/kickstart-runtimes/).

Device runners accept kickstart jobs, **land** jobs (`dn land` on the paired
checkout), **sync** jobs (`dn sync` on the paired checkout; trunk quality
gate), denoise-task jobs, and **task-sync** (Void ↔ `~/.dn/tasks/` relay). They
do not run arbitrary commands or GitHub Actions workflows.

The close-out verbs match the CLI: Kickstart → Land → Sync → Done. See
[Kickstart, land, sync, and done](/close-out/). Void **task-sync** is unrelated
to trunk Sync.

## Local task sync (The Void)

Denoise does not store free-plan task bodies long-term. When
[The Void](/denoise/void/) creates or edits a ticketless task, denoise relays a
short-lived envelope to the paired runner. `dn runner serve` writes task
documents under `~/.dn/tasks/<id>.json` on the laptop.

This is **not** `dn todo` / `~/.dn/todo.md`. Todo remains the GitHub-issue and
plan-path kickstart queue. Local tasks are portable documents for ticketless
Void work and `denoise-task` kickstart.

```bash
dn task list
dn task show <id> --json
dn kickstart --denoise-task ~/.dn/tasks/<id>.json --publish none
```

Runner limits: **1** active device-or-exe.dev runner on Free, **10** on Denoise
Pro (including org-seat Pro). GitHub Actions does not consume that slot. Pair
from The Void **Devices** flow or from a GitHub-linked milestone in denoise
(**Profile** → **Runners**). Profile settings point you to that milestone dialog;
they do not create pairing codes.

## Pair and prepare a device

The device needs `dn`, outbound HTTPS, at least one GitHub checkout (for
repository kickstart), and a supported agent harness. Run the service as your
normal login user.

1. Open a GitHub-linked milestone and click **Runners**, or open **Devices** in
   The Void. Click **Pair a device**.
2. Run the command denoise shows. Typical form:

   ```bash
   dn runner connect <code> --install --name "Alex's MacBook Pro"
   ```

   Optional `--repo owner/repo` is only a checkout hint. Pairing does not bind
   the device to that repository.

3. Approve the pairing in the browser.
4. From every trusted checkout the device may use, register its remote:

   ```bash
   cd ~/src/project
   dn runner register
   ```

   Registration asks you to confirm trust. Use `--yes` only after inspecting the
   checkout. Paths stay in `~/.dn/runner/config.json` on the device. Denoise
   never receives them.

5. Check readiness:

   ```bash
   dn runner doctor
   dn runner status
   ```

The UI lists **your** devices and distinguishes paired, online, and ready
(device ready and at least one registered checkout). `--install` creates
`~/Library/LaunchAgents/cloud.denoise.runner.plist` on macOS or
`~/.config/systemd/user/denoise-runner.service` on Linux. The service runs
`dn runner serve` with `HOME` and `PATH` set; it does not pin a working
directory. Jobs use the registered `owner/repo` → absolute path map. Denoise
does not clone a missing checkout.

![Runners panel in Profile with a paired device, preferred agent, and recent jobs](../../../assets/screenshots/account-runners-panel.png)

On the same panel, **View runner history** opens recent local and cloud runs,
their outcomes, and recommended next steps.

![Runner history on the Profile Runners panel](../../../assets/screenshots/account-runners-history.png)

Pairing stores a credential. Denoise stays offline until a `dn runner serve`
loop heartbeats over HTTPS. The user service is that same outbound loop.
Denoise does not open an inbound port on the device.

### User service vs foreground serve

Use the launchd or systemd user service after `dn runner connect <code>
--install` or a later `dn runner install`. Check `dn runner doctor` and `dn
runner status`: the device is online when the service check passes.

Run `dn runner serve` in a terminal only for diagnostics, after pairing without
`--install`, or when the user service has stopped. Do not run both. If the
user service is already running, `dn runner serve` refuses to start.

```bash
dn runner stop
dn runner serve
```

Return to the background loop with `dn runner start`. After upgrading `dn`,
run `dn runner install` so the unit file uses the current binary and `PATH`.

## Run kickstart, land, and sync

In the milestone **Runners** dialog or the task **Kickstart!** confirm dialog,
choose the named device and an **Execution checkout**. A busy device claims one
job at a time. An offline device can retain a queued job for up to 24 hours and
claim it after reconnecting.

After a leave-local kickstart, **Land** and **Sync** in the task dialog queue
`dn land` and `dn sync` on that same checkout. Sync always runs `sync.preflight`
(lint and tests when configured). Denoise never passes `--skip-preflight`.

**GitHub Actions** stays on the planning repository (the milestone's linked
repo). Device runners are the path that can execute in a different checkout.

When the issue lives on repository A and the execution checkout is repository B,
the dialog states that the issue stays on A and the work and pull request land
in B. You need GitHub read access to the issue repository and write access to
the execution repository. The execution slug must already be registered and
ready on the device.

Device runners report progress with **NDJSON** over the device job API (not the
shared HTTP bootstrap used by GitHub Actions and exe.dev). See
[Kickstart runtimes](/denoise/kickstart-runtimes/) and
[Progress reporting](/dn/progress-reporting/).

From the device, scripts can also queue work:

```bash
dn runner kickstart 213
dn runner kickstart 213 --publish pr --wait
dn runner kickstart 213 --publish pr --json
```

`kickstart` accepts a full GitHub issue URL or a number resolved from the
current checkout. The execution target is a registered repository; the issue URL
can point at a different repository.

## Agent preference

In **Settings → Runners**, each paired device has a **Preferred agent** control
(OpenCode, Cursor, Claude Code, Codex, or GitHub Copilot when that CLI is
installed on the device). Denoise stamps that preference on queued jobs.

The device still decides which agent actually runs:

1. Local selection wins: `DN_AGENT` / `*_ENABLED`, then `defaults.agent` in
   `~/.dn/config.json` (or a `repos[owner/repo]` override), then project
   `dn.json`
2. Else Denoise's stamped preference (or the first advertised harness)
3. Else OpenCode

If the Runners UI shows that a local config or environment agent will override
your preference, edit or remove that local default so the UI control takes
effect. Example user config:

```json
{
  "schema_version": "2.0",
  "defaults": {
    "agent": "cursor"
  }
}
```

Clearing `defaults.agent` (or deleting `~/.dn/config.json` when you do not need
other defaults) lets the Denoise preference apply. Heartbeats re-probe
readiness, so you do not need to restart the runner after a config change for
the UI message to update—though a running job already claimed keeps its resolved
agent.

Agent credentials stay on the device. Denoise never receives API keys. If the UI
reports a harness is installed but not authenticated, sign in with that CLI,
then wait for the next heartbeat:

| Agent          | Guide                                                                   |
| -------------- | ----------------------------------------------------------------------- |
| Cursor         | [Local authentication](/cookbooks/cursor/#local-authentication)         |
| Claude Code    | [Local authentication](/cookbooks/claude-code/#local-authentication)    |
| Codex          | [Local authentication](/cookbooks/codex/#local-authentication)          |
| OpenCode       | [Local authentication](/cookbooks/opencode/#local-authentication)       |
| GitHub Copilot | [Local authentication](/cookbooks/github-copilot/#local-authentication) |

`dn runner doctor --json` includes the same `agent_readiness` block the UI uses
(config present, local agent source, and per-harness install/auth booleans).

## Operate and automate

```bash
dn runner status --json
dn runner jobs --json
dn runner doctor --json
dn runner install
dn runner start
dn runner stop
dn runner pause --json
dn runner resume --json
dn runner rotate --json
dn runner unregister owner/repo --json
dn runner disconnect --json
```

The JSON forms have stable object output for agents. `install` writes and starts
the user service. `start` loads it; `stop` unloads it and leaves the unit file
in place. `pause` stops new claims; `resume` enables them. `rotate` replaces the
device credential. `unregister` removes checkout trust. `disconnect` revokes the
credential, stops the service, and removes the local credential file.

For example, automation can inspect readiness and recent work without parsing
human status text:

```json
{
  "runner": {
    "id": "runner_01J...",
    "display_name": "Alex's MacBook Pro",
    "state": "ready",
    "protocol_version": "1.0",
    "repositories": ["owner/project"]
  },
  "local": {
    "paused": false,
    "repositories": [{ "repository": "owner/project", "ready": true }],
    "harnesses": ["codex"],
    "docker": true,
    "service": {
      "installed": true,
      "running": true,
      "supervisor": "launchd",
      "path": "/Users/alex/Library/LaunchAgents/cloud.denoise.runner.plist",
      "pid": 4242
    }
  }
}
```

```json
{
  "schema_version": "1.0",
  "jobs": [
    {
      "id": "job_01J...",
      "invocation_id": "dispatch_01J...",
      "repository": "owner/project",
      "state": "succeeded",
      "operation": {
        "type": "kickstart",
        "issue_url": "https://github.com/owner/project/issues/213",
        "publish": "pr",
        "agent": "codex"
      },
      "pr_url": "https://github.com/owner/project/pull/42"
    }
  ]
}
```

`repository` is the execution checkout. `issue_url` can point at a different
GitHub repository. These examples omit timestamps and other additive metadata.
Branch on named fields, not object key order or human messages.

State lives under `~/.dn/runner/`: `credential.json`, `config.json`, and on
macOS `runner.log` and `runner.error.log`. The directory is mode `0700`;
credential and config files are `0600`.

## Security boundary

- The service makes outbound authenticated HTTPS requests and opens no inbound
  port.
- Pairing needs signed-in browser approval. Only the runner owner can see the
  device or dispatch jobs to it.
- A job is a typed kickstart request, not arbitrary argv, shell, environment, or
  an Actions workflow.
- Each execution checkout must be registered on the device. Denoise never sees
  local paths; it only sees GitHub slugs the device reports as ready.
- The issue repository can differ from the execution checkout. Any registered
  slug is a place your agent may run, including from an issue on another repo,
  if you can write the execution repository on GitHub.
- GitHub and agent authentication come from the local device.
- Progress is redacted and capped before leaving `dn`.
- Cancellation terminates the local child process.
- Lease interruption stops the run and requires an explicit retry; it never
  repeats work that may already have created a branch or PR.

A completion receipt can show device, agent, duration, PR link, local compute
minutes, and one hosted run avoided. It does not estimate dollar savings.

## Troubleshoot

Run `dn runner doctor`; it checks credential expiry, protocol support, installed
harnesses, repository remotes, and (in JSON) `agent_readiness` for local agent
overrides and harness authentication. Reconnect after an expired credential.
Upgrade `dn` when the server reports an unsupported protocol version. Register
the execution checkout when the picker has no ready slug — denoise does not
clone it. If a checkout is missing from the picker, confirm GitHub access to
that repository. The doctor output also reports whether a serve loop is running.

```bash
# Stop the user service before a foreground diagnostic loop
dn runner stop
dn runner serve

# macOS service errors
tail -f ~/.dn/runner/runner.error.log

# Linux service logs
journalctl --user -u denoise-runner.service -f
```

For arbitrary Actions workflows and GitHub-native runner controls, use the
advanced
[self-hosted GitHub Actions runner guide](/operations/self-hosted-runners/).
