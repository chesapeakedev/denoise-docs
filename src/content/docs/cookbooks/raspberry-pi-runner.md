---
title: Run denoise jobs on a Raspberry Pi
description: Prepare a 64-bit Raspberry Pi, pair it as a denoise device runner, and execute kickstart jobs in trusted local checkouts.
---

A Raspberry Pi can stay online as a low-power denoise device runner. Denoise
sends typed kickstart jobs to the Pi, while source code, repository paths,
GitHub credentials, agent credentials, and compute remain on the device.

This is a denoise device runner, not a GitHub Actions self-hosted runner. It
opens no inbound service port and accepts only denoise runner operations for
repositories you explicitly register.

## 1. Prepare the Pi

Use a Raspberry Pi 4 or newer with:

- 64-bit Raspberry Pi OS or another current 64-bit Debian-based Linux
- 8 GB RAM recommended for agent-backed work
- Reliable storage with enough space for the repository, builds, and agent
  caches; prefer an SSD for write-heavy projects
- Ethernet or stable Wi-Fi with outbound HTTPS access
- SSH access for administration

Confirm that the OS is 64-bit ARM:

```bash
uname -m
getconf LONG_BIT
```

Continue when the output is `aarch64` and `64`. If it reports `armv7l` or `32`,
install a 64-bit OS before installing `dn`.

Update the host and install the base tools:

```bash
sudo apt-get update
sudo apt-get full-upgrade -y
sudo apt-get install -y ca-certificates curl git make
sudo reboot
```

## 2. Create an unprivileged runner user

Keep agent and repository credentials separate from the administrator account:

```bash
sudo adduser denoise-runner
sudo loginctl enable-linger denoise-runner
ssh denoise-runner@pi-host
```

User lingering allows the systemd user service installed by `dn` to run after
the SSH session ends. Open the final command from your workstation, using the
Pi's hostname or IP address. Do not grant this account passwordless `sudo`. Run
host updates from a separate administrator account.

All remaining setup commands in this guide run as `denoise-runner`.

## 3. Install dn and an agent harness

Install the Linux ARM64 `dn` release:

```bash
curl -fsSL https://raw.githubusercontent.com/chesapeakedev/dn/main/scripts/install.sh | sh
dn --version
```

Install one supported harness and authenticate it under the same user that runs
the service. OpenCode is the default:

```bash
curl -fsSL https://opencode.ai/install | bash
opencode
```

Run `/connect` inside OpenCode and complete the provider setup. To use Claude
Code, Codex, Cursor, or GitHub Copilot instead, follow its
[harness cookbook](/cookbooks/overview/) and confirm that its CLI has a Linux
ARM64 build.

The runner uses this user's existing harness login. Do not place API keys
directly in the systemd unit.

## 4. Authenticate GitHub and clone the repository

`dn` needs GitHub access, and the checkout needs fetch and push credentials. Run
the device flow:

```bash
dn auth
```

Then clone the repository with the SSH or HTTPS credential you intend the runner
to use:

```bash
mkdir -p ~/src
cd ~/src
git clone git@github.com:OWNER/REPOSITORY.git
cd REPOSITORY
git remote -v
```

Run the repository's normal setup and verification commands now. Install any
language runtime, package manager, system library, or build tool those commands
need. A runner can only execute tools available to the `denoise-runner` user.

## 5. Pair the Pi with denoise

1. In denoise, open **Settings > Runners** and create a pairing code.
2. On the Pi, run:

   ```bash
   dn runner connect <code> --install --name "Raspberry Pi"
   ```

3. Approve the pairing in the browser.
4. Confirm that the user service is enabled and running:

   ```bash
   systemctl --user status denoise-runner.service
   ```

`--install` writes `~/.config/systemd/user/denoise-runner.service`. The service
makes outbound authenticated HTTPS requests; do not add a router port forward or
public listener.

## 6. Register trusted checkouts

Register each repository from its checkout:

```bash
cd ~/src/REPOSITORY
dn runner register
```

Read the remote and trust prompt before confirming. Registration allowlists the
repository and binds the denoise repository identity to this local checkout.
Repeat the command from each additional checkout the Pi may use.

Check the complete installation:

```bash
dn runner doctor
dn runner status
```

Resolve every failed doctor check before sending work. It checks the pairing
credential, protocol version, registered repository remotes, and installed agent
harnesses.

## 7. Run a job

In denoise, open an issue or milestone kickstart action and select **Raspberry
Pi** in the runtime picker. Choose the configured agent and publish mode, then
start the run.

The device claims one job at a time. If it is offline, a queued job can wait for
up to 24 hours; denoise does not silently move the job to hosted compute.

Inspect activity on the Pi:

```bash
dn runner jobs
dn runner status
journalctl --user -u denoise-runner.service -f
```

Scripts on the Pi can also queue an issue from a registered repository:

```bash
dn runner kickstart 123 --publish pr --wait
```

## 8. Operate the runner

Pause claims before host maintenance:

```bash
dn runner pause
```

From the administrator account, update Raspberry Pi OS. Then return to the
runner user, refresh `dn` and the harness, and verify readiness:

```bash
curl -fsSL https://raw.githubusercontent.com/chesapeakedev/dn/main/scripts/install.sh | sh
dn runner doctor
dn runner resume
```

Use the remaining lifecycle commands as needed:

```bash
dn runner rotate
dn runner unregister OWNER/REPOSITORY
dn runner disconnect
```

`rotate` replaces the device credential. `unregister` removes checkout trust.
`disconnect` revokes the credential, stops the service, and removes the local
runner credential.

## Harden the device

- Keep SSH key authentication enabled and restrict which users can log in.
- Apply OS and harness updates regularly.
- Restrict outbound network access to GitHub, denoise, package registries, and
  the selected agent provider where practical.
- Keep the runner user out of privileged groups and run untrusted build steps
  without `sudo`.
- Do not register forks or checkouts you have not inspected.
- Treat the Pi and its storage as credential-bearing hardware. Revoke the
  runner, GitHub, and agent credentials if it is lost.
- Use a UPS or reliable power supply for long jobs, and monitor free disk space
  and thermal throttling.

For runner protocol details, JSON output, state paths, and troubleshooting, see
[Developer device runners](/denoise/device-runners/). If you need arbitrary
GitHub Actions workflows rather than typed denoise jobs, use
[Self-hosted runners](/operations/self-hosted-runners/).
