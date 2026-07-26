---
title: Developer device runners
description: Pair a trusted macOS or Linux checkout with denoise and run typed kickstart jobs on local compute.
---

A device runner lets denoise send a kickstart job to an existing macOS or Linux
checkout. Source, checkout paths, GitHub credentials, agent credentials, and
compute stay on that device.

## Pair and prepare a device

The device needs `dn`, outbound HTTPS, a GitHub checkout, and a supported agent
harness. Run the service as your normal login user.

1. Open **Settings > Runners** and create a pairing code.
2. Run:

   ```bash
   dn runner connect <code> --install --name "Alex's MacBook Pro"
   ```

3. Approve the pairing in the browser.
4. From every trusted checkout, register its remote:

   ```bash
   cd ~/src/project
   dn runner register
   ```

   Registration asks you to confirm trust. Use `--yes` only after inspecting the
   checkout.

5. Check readiness:

   ```bash
   dn runner doctor
   dn runner status
   ```

The UI distinguishes paired, online, and repository-ready devices. `--install`
creates `~/Library/LaunchAgents/cloud.denoise.runner.plist` on macOS or
`~/.config/systemd/user/denoise-runner.service` on Linux.

## Run kickstart

Select the named device in the kickstart runtime picker. A busy device claims
one job at a time. An offline device can retain a queued job for up to 24 hours
and claim it after reconnecting. Denoise never silently moves a device job to
hosted compute.

Device runners report progress with **NDJSON** over the device job API (not the
shared HTTP bootstrap used by GitHub Actions, Cursor Cloud, and exe.dev). See
[Kickstart runtimes](/denoise/kickstart-runtimes/) and
[Progress reporting](/dn/progress-reporting/).

From the device, scripts can also queue work:

```bash
dn runner kickstart 213
dn runner kickstart 213 --publish pr --wait
dn runner kickstart 213 --publish pr --json
```

The issue must belong to an explicitly registered repository.

## Operate and automate

```bash
dn runner status --json
dn runner jobs --json
dn runner doctor --json
dn runner pause --json
dn runner resume --json
dn runner rotate --json
dn runner unregister owner/repo --json
dn runner disconnect --json
```

The JSON forms have stable object output for agents. `pause` stops new claims;
`resume` enables them. `rotate` replaces the device credential. `unregister`
removes checkout trust. `disconnect` revokes the credential, stops the service,
and removes the local credential file.

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
    "docker": true
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

These examples omit timestamps and other additive metadata. Branch on named
fields, not object key order or human messages.

State lives under `~/.dn/runner/`: `credential.json`, `config.json`, and on
macOS `runner.log` and `runner.error.log`. The directory is mode `0700`;
credential and config files are `0600`.

## Security boundary

- The service makes outbound authenticated HTTPS requests and opens no inbound
  port.
- Pairing needs signed-in browser approval; only the runner owner can dispatch.
- A job is a typed kickstart request, not arbitrary argv, shell, environment, or
  an Actions workflow.
- Every repository must be allowlisted, and its remote must match the issue.
- GitHub and agent authentication come from the local device.
- Progress is redacted and capped before leaving `dn`.
- Cancellation terminates the local child process.
- Lease interruption stops the run and requires an explicit retry; it never
  repeats work that may already have created a branch or PR.

A completion receipt can show device, agent, duration, PR link, local compute
minutes, and one hosted run avoided. It does not estimate dollar savings.

## Troubleshoot

Run `dn runner doctor`; it checks credential expiry, protocol support, installed
harnesses, and repository remotes. Reconnect after an expired credential.
Upgrade `dn` when the server reports an unsupported protocol version. Register
the correct checkout when the remote does not match.

```bash
# Foreground diagnostics
dn runner serve

# macOS service errors
tail -f ~/.dn/runner/runner.error.log

# Linux service logs
journalctl --user -u denoise-runner.service -f
```

For arbitrary Actions workflows and GitHub-native runner controls, use the
advanced
[self-hosted GitHub Actions runner guide](/operations/self-hosted-runners/).
